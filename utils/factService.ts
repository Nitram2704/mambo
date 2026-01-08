import { supabase } from '@/lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY || '');

export interface UserFact {
    id: string;
    user_id: string;
    fact: string;
    category: string;
    created_at: string;
}

export class FactService {
    /**
     * Extracts facts from a user message using Gemini
     */
    static async extractFactsFromMessage(message: string): Promise<Array<{ fact: string; category: string }>> {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

            const prompt = `
                Analiza el siguiente mensaje de un usuario en una app de fitness y extrae "hechos" importantes sobre el usuario que debamos recordar para el futuro.
                Ejemplos de hechos: lesiones, preferencias de ejercicio, metas a largo plazo, equipamiento disponible, alergias, etc.
                
                Mensaje: "${message}"
                
                Responde ÚNICAMENTE con un array JSON de objetos con las propiedades "fact" (el hecho en español) y "category" (ej: 'lesion', 'preferencia', 'meta', 'equipo', 'general').
                Si no hay hechos relevantes, responde con un array vacío [].
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Clean the response to ensure it's valid JSON
            const jsonMatch = text.match(/\[.*\]/s);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            return [];
        } catch (error) {
            console.error('Error extracting facts:', error);
            return [];
        }
    }

    /**
     * Saves extracted facts to the database
     */
    static async saveFacts(userId: string, facts: Array<{ fact: string; category: string }>) {
        if (facts.length === 0) return;

        try {
            const { error } = await supabase
                .from('user_facts')
                .insert(facts.map(f => ({
                    user_id: userId,
                    fact: f.fact,
                    category: f.category
                })));

            if (error) throw error;
            console.log(`✅ Saved ${facts.length} facts for user ${userId}`);
        } catch (error) {
            console.error('Error saving facts:', error);
        }
    }

    /**
     * Retrieves all facts for a user
     */
    static async getUserFacts(userId: string): Promise<UserFact[]> {
        try {
            const { data, error } = await supabase
                .from('user_facts')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching user facts:', error);
            return [];
        }
    }

    /**
     * Helper to extract and save facts in one go
     */
    static async processMessage(userId: string, message: string) {
        const facts = await this.extractFactsFromMessage(message);
        if (facts.length > 0) {
            await this.saveFacts(userId, facts);
        }
    }
}
