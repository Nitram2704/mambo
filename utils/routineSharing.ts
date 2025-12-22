import { supabase } from '@/lib/supabase';
import { SavedRoutine } from '@/store/savedRoutinesStore';

/**
 * Genera un código aleatorio de 6 caracteres
 */
function generateShareCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sin caracteres ambiguos
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

/**
 * Comparte una rutina y genera un código
 */
export async function shareRoutine(
    routineId: string,
    isPublic: boolean = false,
    expiresInDays?: number
): Promise<string> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        // Generar código único
        let shareCode = generateShareCode();
        let attempts = 0;

        // Verificar que el código sea único
        while (attempts < 10) {
            const { data: existing } = await supabase
                .from('shared_routines')
                .select('id')
                .eq('share_code', shareCode)
                .single();

            if (!existing) break;

            shareCode = generateShareCode();
            attempts++;
        }

        if (attempts >= 10) {
            throw new Error('Could not generate unique code');
        }

        // Calcular fecha de expiración
        let expiresAt = null;
        if (expiresInDays) {
            expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + expiresInDays);
        }

        // Crear registro de compartición
        const { error } = await supabase.from('shared_routines').insert({
            routine_id: routineId,
            shared_by: user.id,
            share_code: shareCode,
            is_public: isPublic,
            expires_at: expiresAt?.toISOString(),
        });

        if (error) throw error;

        console.log(`✅ Routine shared with code: ${shareCode}`);
        return shareCode;
    } catch (error) {
        console.error('Error sharing routine:', error);
        throw error;
    }
}

/**
 * Importa una rutina compartida usando el código
 */
export async function importSharedRoutine(shareCode: string): Promise<SavedRoutine> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        // Buscar rutina compartida
        const { data: shared, error: sharedError } = await supabase
            .from('shared_routines')
            .select(`
                *,
                routines (
                    id,
                    name,
                    description,
                    routine_exercises (
                        exercise_id,
                        planned_sets,
                        rest_time,
                        exercises (
                            id,
                            name,
                            muscle_group,
                            equipment
                        )
                    )
                )
            `)
            .eq('share_code', shareCode.toUpperCase())
            .single();

        if (sharedError || !shared) {
            throw new Error('Código inválido o expirado');
        }

        // Verificar expiración
        if (shared.expires_at && new Date(shared.expires_at) < new Date()) {
            throw new Error('Este link ha expirado');
        }

        // Incrementar contador de descargas
        await supabase.rpc('increment_download_count', { p_share_code: shareCode.toUpperCase() });

        // Construir SavedRoutine desde los datos
        const routine: SavedRoutine = {
            id: `imported_${Date.now()}`,
            name: `${shared.routines.name} (Compartida)`,
            description: shared.routines.description,
            exercises: shared.routines.routine_exercises.map((re: any) => ({
                id: re.exercises.id,
                name: re.exercises.name,
                muscleGroup: re.exercises.muscle_group,
                equipment: re.exercises.equipment,
                plannedSets: re.planned_sets,
                restTime: re.rest_time,
            })),
            createdAt: new Date(),
        };

        console.log(`✅ Imported routine: ${routine.name}`);
        return routine;
    } catch (error) {
        console.error('Error importing routine:', error);
        throw error;
    }
}

/**
 * Obtiene rutinas públicas
 */
export async function getBrowsePublicRoutines(): Promise<any[]> {
    try {
        const { data, error } = await supabase
            .from('shared_routines')
            .select(`
                share_code,
                downloads_count,
                created_at,
                routines (
                    name,
                    description,
                    routine_exercises (count)
                )
            `)
            .eq('is_public', true)
            .order('downloads_count', { ascending: false })
            .limit(20);

        if (error) throw error;

        return data || [];
    } catch (error) {
        console.error('Error browsing routines:', error);
        return [];
    }
}

/**
 * Elimina un share (deja de compartir)
 */
export async function unshareRoutine(shareCode: string): Promise<void> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { error } = await supabase
            .from('shared_routines')
            .delete()
            .eq('share_code', shareCode)
            .eq('shared_by', user.id);

        if (error) throw error;

        console.log(`✅ Routine unshared: ${shareCode}`);
    } catch (error) {
        console.error('Error unsharing routine:', error);
        throw error;
    }
}
