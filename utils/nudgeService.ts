import { useAssistantStore } from '@/store/assistantStore';
import { useWorkoutHistoryStore } from '@/store/workoutHistoryStore';
import { useNutritionStore } from '@/store/nutritionStore';
import { useUserProfileStore } from '@/store/userProfileStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { askAssistant } from './aiService';
import { FactService } from './factService';

export class NudgeService {
    static async checkAndTriggerNudges() {
        const { subscription } = useSubscriptionStore.getState();
        const tier = subscription?.tier_id || 'STARTER';

        // Nudges are for PRO and ELITE only
        if (tier === 'STARTER') return;

        const { messages, addMessage } = useAssistantStore.getState();

        // Don't nudge if we already have a recent conversation (e.g., last 2 hours)
        const lastMessage = messages[messages.length - 1];
        if (lastMessage) {
            const lastTime = new Date(lastMessage.timestamp).getTime();
            const now = new Date().getTime();
            if (now - lastTime < 2 * 60 * 60 * 1000) return;
        }

        const nudges = [];

        // 1. Check for missed workouts
        const { workouts } = useWorkoutHistoryStore.getState();
        const lastWorkout = workouts[0]; // Assuming sorted by date desc
        if (lastWorkout) {
            const lastWorkoutDate = new Date(lastWorkout.endTime);
            const daysSinceLastWorkout = (new Date().getTime() - lastWorkoutDate.getTime()) / (1000 * 60 * 60 * 24);

            if (daysSinceLastWorkout > 3) {
                nudges.push(`Veo que han pasado ${Math.floor(daysSinceLastWorkout)} días desde tu último entreno. ¿Todo bien? ¿Quieres que ajustemos el plan para retomar con calma?`);
            }
        }

        // 2. Check for volume trends
        if (workouts.length >= 5) {
            const recentVolume = workouts.slice(0, 3).reduce((acc, w) => acc + w.volume, 0) / 3;
            const olderVolume = workouts.slice(3, 6).reduce((acc, w) => acc + w.volume, 0) / 3;

            if (recentVolume > olderVolume * 1.1) {
                nudges.push(`¡Brutal! Tu volumen de entrenamiento ha subido un ${Math.round((recentVolume / olderVolume - 1) * 100)}% esta semana. ¡Sigue así! 🚀`);
            }
        }

        // 3. Nutrition consistency
        const { dailyData } = useNutritionStore.getState();
        const today = new Date().toISOString().split('T')[0];
        const logsToday = dailyData[today]?.meals || [];
        if (logsToday.length === 0 && new Date().getHours() > 14) {
            nudges.push(`Ya es tarde y no he visto registros de comida hoy. ¡No te olvides de nutrirte bien para rendir al máximo! 🥗`);
        }

        if (nudges.length > 0) {
            // Pick one random nudge to avoid overwhelming
            const nudgeText = nudges[Math.floor(Math.random() * nudges.length)];

            // We could just add the message, but it's better to let the AI "say" it 
            // so it follows the personality/style.
            const { profile } = useUserProfileStore.getState();
            const context = {
                name: profile?.name || 'Usuario',
                weight: profile?.weight,
                height: profile?.height,
                goal: profile?.objective,
                tier: tier,
                coachStyle: profile?.coachStyle,
                userFacts: tier === 'ELITE' && profile?.id ? (await FactService.getUserFacts(profile.id)).map((f: any) => f.fact) : []
            };

            // We use a special "system" trigger to get an AI response
            const { response: aiResponse } = await askAssistant(`[NUDGE_TRIGGER: ${nudgeText}]`, context, messages);
            addMessage(aiResponse, 'assistant');
        }
    }
}
