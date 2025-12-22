import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';

interface ExerciseCache {
    id: string;
    name: string;
    muscle_group: string;
    category: string;
    equipment: string;
}

interface CacheData {
    exercises: ExerciseCache[];
    timestamp: number;
    ttl: number; // Time to live in milliseconds
}

const CACHE_KEY = '@exercise_cache';
const CACHE_TTL = 60 * 60 * 1000; // 1 hora

// In-memory cache para acceso ultra-rápido
let inMemoryCache: CacheData | null = null;

/**
 * Verifica si el cache está expirado
 */
function isExpired(cache: CacheData): boolean {
    return Date.now() - cache.timestamp > cache.ttl;
}

/**
 * Obtiene ejercicios desde el cache (memoria o AsyncStorage)
 * Si no existe o está expirado, fetch desde Supabase
 */
export async function getCachedExercises(): Promise<ExerciseCache[]> {
    // 1. Check in-memory cache primero (instantáneo)
    if (inMemoryCache && !isExpired(inMemoryCache)) {
        console.log('✅ Exercise cache HIT (memory)');
        return inMemoryCache.exercises;
    }

    // 2. Check AsyncStorage
    try {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
            const parsedCache: CacheData = JSON.parse(cached);
            if (!isExpired(parsedCache)) {
                console.log('✅ Exercise cache HIT (storage)');
                // Actualizar in-memory cache
                inMemoryCache = parsedCache;
                return parsedCache.exercises;
            }
        }
    } catch (error) {
        console.error('Error reading cache:', error);
    }

    // 3. Cache MISS - Fetch desde Supabase
    console.log('⚠️ Exercise cache MISS - fetching from DB');
    return await refreshExerciseCache();
}

/**
 * Refresca el cache desde Supabase
 */
export async function refreshExerciseCache(): Promise<ExerciseCache[]> {
    try {
        const { data, error } = await supabase
            .from('exercises')
            .select('id, name, muscle_group, category, equipment');

        if (error) {
            console.error('Error fetching exercises:', error);
            return [];
        }

        const cacheData: CacheData = {
            exercises: data || [],
            timestamp: Date.now(),
            ttl: CACHE_TTL,
        };

        // Guardar en ambos caches
        inMemoryCache = cacheData;
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));

        console.log(`✅ Exercise cache refreshed: ${data?.length || 0} exercises`);
        return data || [];
    } catch (error) {
        console.error('Error refreshing cache:', error);
        return [];
    }
}

/**
 * Invalida el cache (llamar cuando se crea un nuevo ejercicio)
 */
export async function invalidateExerciseCache() {
    inMemoryCache = null;
    await AsyncStorage.removeItem(CACHE_KEY);
    console.log('🗑️ Exercise cache invalidated');
}

/**
 * Busca un ejercicio en el cache por nombre
 */
export async function findCachedExerciseByName(exerciseName: string): Promise<ExerciseCache | null> {
    const exercises = await getCachedExercises();
    const cleanName = exerciseName.trim().toLowerCase();

    // Buscar match exacto
    const exact = exercises.find(ex => ex.name.toLowerCase() === cleanName);
    if (exact) return exact;

    // Buscar match parcial
    const partial = exercises.filter(ex =>
        ex.name.toLowerCase().includes(cleanName) ||
        cleanName.includes(ex.name.toLowerCase())
    );

    if (partial.length > 0) {
        // Retornar el más corto (más específico)
        return partial.reduce((best, current) =>
            current.name.length < best.name.length ? current : best
        );
    }

    return null;
}

/**
 * Obtiene estadísticas del cache
 */
export async function getCacheStats() {
    const cache = inMemoryCache || await AsyncStorage.getItem(CACHE_KEY).then(c => c ? JSON.parse(c) : null);

    if (!cache) {
        return {
            status: 'empty',
            count: 0,
            age: 0,
            expiresIn: 0,
        };
    }

    const age = Date.now() - cache.timestamp;
    const expiresIn = cache.ttl - age;

    return {
        status: isExpired(cache) ? 'expired' : 'valid',
        count: cache.exercises.length,
        age: Math.floor(age / 1000), // segundos
        expiresIn: Math.floor(expiresIn / 1000), // segundos
    };
}
