import { supabase } from '@/lib/supabase';

/**
 * Maps an exercise name to database ID using exact matching
 * Since Gemini now uses exact names from DB, this should always succeed
 */
export async function mapExerciseToDatabase(
    exerciseName: string,
): Promise<string | null> {
    try {
        // Clean the name
        const cleanName = exerciseName.trim();

        // Exact match (case-insensitive)
        const { data, error } = await supabase
            .from('exercises')
            .select('id')
            .ilike('name', cleanName)
            .limit(1)
            .single();

        if (error || !data) {
            console.error(`⚠️ Exercise not found: "${exerciseName}"`);
            return null;
        }

        console.log(`✅ Mapped: "${exerciseName}" → ${data.id}`);
        return data.id;
    } catch (error) {
        console.error('Error mapping exercise:', error);
        return null;
    }
}

/**
 * Infers the muscle group from an exercise name using keywords
 * Improved with accent-insensitivity and better priority
 */
function inferMuscleGroup(exerciseName: string): 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core' | 'Cardio' {
    const nameLower = exerciseName.toLowerCase();

    // 1. Legs (High priority for specific keywords)
    if (nameLower.match(/sentadilla|squat|zancada|lunge|prensa|press.*pierna|cu[aá]dricep|quad|femoral|curl.*femoral|gemelo|calf|aductor|abductor|gl[uú]teo|glute|hip|cadera|peso muerto rumano|romanian deadlift|buenos d[ií]as|good morning|pierna|leg/)) {
        return 'Legs';
    }

    // 2. Chest
    if (nameLower.match(/press.*banca|bench.*press|pecho|chest|pec|apertura|fly|flyes|fondo|dip|flexi[oó]n|push.*up/)) {
        return 'Chest';
    }

    // 3. Back
    if (nameLower.match(/dominada|pull.*up|jal[oó]n|pulldown|remo|row|espalda|back|peso muerto(?!.*rumano)|deadlift(?!.*romanian)/)) {
        return 'Back';
    }

    // 4. Shoulders
    if (nameLower.match(/hombro|shoulder|press.*militar|military.*press|elevaci[oó]n.*lateral|lateral.*raise|p[aá]jaro|rear.*delt|face.*pull|arnold|overhead/)) {
        return 'Shoulders';
    }

    // 5. Arms
    if (nameLower.match(/bicep|curl|tricep|brazo|arm|extensi[oó]n|press.*franc[eé]s|skull.*crusher|martillo|hammer/)) {
        return 'Arms';
    }

    // 6. Core
    if (nameLower.match(/abdominal|abs|crunch|core|plancha|plank|russian.*twist|elevaci[oó]n.*pierna|leg.*raise|mountain.*climber|wood.*chop/)) {
        return 'Core';
    }

    // 7. Cardio
    if (nameLower.match(/burpee|sprint|cardio|carrera|run|bicicleta|bike|el[ií]ptica|elliptical|remo.*erg[oó]metro|rower|salto|jump|correr/)) {
        return 'Cardio';
    }

    return 'Core';
}

/**
 * Infers equipment type from exercise name using keywords
 * Improved with accent-insensitivity
 */
function inferEquipment(exerciseName: string): string {
    const nameLower = exerciseName.toLowerCase();

    if (nameLower.match(/barra(?!.*z)|barbell/)) return 'Barbell';
    if (nameLower.match(/mancuerna|dumbbell/)) return 'Dumbbells';
    if (nameLower.match(/polea|cable|cuerda/)) return 'Cable Machine';
    if (nameLower.match(/m[aá]quina|machine|prensa|press.*machine|pec.*deck|smith/)) return 'Machine';
    if (nameLower.match(/barra.*z|ez.*bar/)) return 'EZ-Bar';
    if (nameLower.match(/banda|band/)) return 'Resistance Band';
    if (nameLower.match(/disco|plate/)) return 'Weight Plate';
    if (nameLower.match(/rueda|wheel/)) return 'Ab Wheel';
    if (nameLower.match(/battle.*rope|cuerda.*batalla/)) return 'Battle Rope';
    if (nameLower.match(/trap.*bar|barra.*hexagonal/)) return 'Trap Bar';

    return 'Bodyweight';
}

/**
 * Creates a custom exercise for the user when not found in database
 */
async function createCustomExercise(
    exerciseName: string,
    userId: string
): Promise<{ id: string; name: string; muscle_group: string; equipment: string } | null> {
    try {
        const muscleGroup = inferMuscleGroup(exerciseName);
        const equipment = inferEquipment(exerciseName);

        console.log(`🔨 Creating custom exercise: "${exerciseName}" (${muscleGroup}, ${equipment})`);

        const { data, error } = await supabase
            .from('exercises')
            .insert({
                name: exerciseName.trim(),
                category: 'Strength',
                muscle_group: muscleGroup,
                equipment: equipment,
                user_id: userId,
            })
            .select('id, name, muscle_group, equipment')
            .single();

        if (error) {
            console.error('❌ Error creating custom exercise:', error);
            return null;
        }

        console.log(`✅ Custom exercise created: ${data.id}`);
        return data;
    } catch (error) {
        console.error('❌ Error in createCustomExercise:', error);
        return null;
    }
}

/**
 * OPTIMIZED: Processes workout exercises with BATCH QUERY
 * Maps all exercises in ONE query instead of multiple individual queries
 * NOW WITH AUTO-CREATION: Creates custom exercises when not found in DB
 */
export async function processWorkoutExercises(
    exercises: Array<{
        name: string;
        sets: number;
        reps: string;
        rest: number;
        notes?: string;
    }>,
    userId?: string // Optional: if provided, will create custom exercises for this user
): Promise<Array<{
    id: string;
    name: string;
    muscleGroup: 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core' | 'Cardio';
    equipment: string;
    plannedSets: number;
    restTime: number;
}>> {
    const validMuscleGroups = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio'] as const;

    // Extract all exercise names
    const exerciseNames = exercises.map(ex => ex.name.trim());

    console.log(`🔍 Mapping ${exerciseNames.length} exercises... (BATCH)`);

    // BATCH QUERY: Get all exercises in ONE call
    // Improved: Use .ilike for case-insensitive matching if possible, 
    // but .in() is faster. We'll use .in() and then fallback to a broader search if needed.
    let { data: exercisesData, error } = await supabase
        .from('exercises')
        .select('id, name, muscle_group, equipment')
        .in('name', exerciseNames);

    if (error) {
        console.error('❌ Error fetching exercises:', error);
        return [];
    }

    // FALLBACK: If we didn't find all exercises, fetch ALL exercises to try fuzzy matching
    // This is necessary because .in() only does exact matches
    if (!exercisesData || exercisesData.length < exerciseNames.length) {
        console.log('⚠️ Not all exercises found by exact name. Fetching full list for fuzzy matching...');
        const { data: allExercises, error: allError } = await supabase
            .from('exercises')
            .select('id, name, muscle_group, equipment');

        if (!allError && allExercises) {
            exercisesData = allExercises;
        }
    }

    if (!exercisesData || exercisesData.length === 0) {
        console.error('❌ CRITICAL: No exercises found in database!');
        console.error('📋 Make sure you ran: add_comprehensive_exercises.sql in Supabase');
        return [];
    }

    console.log(`✅ Loaded ${exercisesData.length} exercises from DB for mapping`);

    // Create lookup map for O(1) access
    const exerciseMap = new Map(
        exercisesData.map(ex => [ex.name.toLowerCase(), ex])
    );

    // Map exercises to full objects
    const mappedExercisesPromises = exercises.map(async (ex) => {
        const cleanName = ex.name.trim().toLowerCase();
        let dbExercise = exerciseMap.get(cleanName);

        // FUZZY MATCH FALLBACK: Token-based matching
        if (!dbExercise) {
            console.log(`🔍 No exact match for "${ex.name}", trying token match...`);
            let bestMatch = null;
            let maxScore = 0;

            // Helper to normalize and tokenize
            const tokenize = (text: string) => {
                return text.toLowerCase()
                    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents for matching
                    .replace(/[()]/g, '') // Remove parens
                    .split(/[\s,-]+/) // Split by space, comma, dash
                    .filter(w => w.length > 2 && !['con', 'para', 'los', 'las', 'una', 'con', 'del'].includes(w)); // Remove short/stop words
            };

            const localTokens = tokenize(ex.name);

            for (const [dbName, data] of exerciseMap.entries()) {
                const dbTokens = tokenize(dbName);

                // Count matches
                let matches = 0;
                for (const token of localTokens) {
                    if (dbTokens.some(dbToken => dbToken.includes(token) || token.includes(dbToken))) {
                        matches++;
                    }
                }

                // Score: % of local tokens found in DB name
                const score = matches / localTokens.length;

                if (score > maxScore && score > 0.5) { // Require >50% match
                    maxScore = score;
                    bestMatch = data;
                }
            }

            if (bestMatch) {
                console.log(`✨ Token match found: "${ex.name}" -> "${bestMatch.name}" (score: ${maxScore.toFixed(2)})`);
                dbExercise = bestMatch;
            } else {
                console.warn(`❌ No match found for "${ex.name}"`);

                // 🆕 AUTO-CREATE CUSTOM EXERCISE if userId provided
                if (userId) {
                    console.log(`🔨 Attempting to create custom exercise for user...`);
                    const customExercise = await createCustomExercise(ex.name.trim(), userId);
                    if (customExercise) {
                        dbExercise = customExercise;
                        // Add to map for future lookups in this batch
                        exerciseMap.set(ex.name.trim().toLowerCase(), customExercise);
                    }
                }
            }
        }

        if (!dbExercise) {
            console.warn(`⚠️ Exercise not found and could not create: "${ex.name}"`);
            return null;
        }

        // Normalize muscle_group
        const dbMuscleGroup = dbExercise.muscle_group || 'Chest';
        const muscleGroup = validMuscleGroups.find(mg =>
            dbMuscleGroup.toLowerCase().includes(mg.toLowerCase())
        ) || 'Chest';

        return {
            id: dbExercise.id,
            name: dbExercise.name,
            muscleGroup,
            equipment: dbExercise.equipment || 'Bodyweight',
            plannedSets: ex.sets,
            restTime: ex.rest,
        };
    });

    const mappedExercises = (await Promise.all(mappedExercisesPromises))
        .filter((ex): ex is NonNullable<typeof ex> => ex !== null);

    console.log(`✅ Successfully mapped ${mappedExercises.length}/${exercises.length} exercises`);

    if (mappedExercises.length === 0) {
        console.error('❌ CRITICAL: No exercises were mapped! Run SQL migration!');
    }

    return mappedExercises;
}
