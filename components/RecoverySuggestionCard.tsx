import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWeeklyScheduleStore } from '@/store/weeklyScheduleStore';
import { useWorkoutHistoryStore } from '@/store/workoutHistoryStore';

interface RecoverySuggestion {
    icon: string;
    title: string;
    description: string;
    color: string;
}

/**
 * Smart recovery suggestions based on recent workout history
 * Encourages rest when user has been training consistently
 */
export function RecoverySuggestionCard() {
    const { schedule, getWeeklyProgress } = useWeeklyScheduleStore();
    const { workouts } = useWorkoutHistoryStore();

    // Calculate days since last workout
    const recentWorkouts = workouts
        .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
        .slice(0, 7);

    const weeklyProgress = getWeeklyProgress();

    // Check if today has a scheduled workout
    const today = new Date().toISOString().split('T')[0];
    const todaysWorkouts = schedule.filter(w => w.date === today && !w.completed);

    // If there's a scheduled workout for today, don't show recovery
    if (todaysWorkouts.length > 0) {
        return null;
    }

    // Check consecutive training days
    const getConsecutiveTrainingDays = (): number => {
        let consecutive = 0;
        const checkDate = new Date();
        checkDate.setDate(checkDate.getDate() - 1); // Start from yesterday

        for (let i = 0; i < 7; i++) {
            const dateStr = checkDate.toISOString().split('T')[0];
            const trainedThisDay = recentWorkouts.some(w =>
                new Date(w.startTime).toISOString().split('T')[0] === dateStr
            );

            if (trainedThisDay) {
                consecutive++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }

        return consecutive;
    };

    const consecutiveDays = getConsecutiveTrainingDays();

    // Determine which recovery suggestion to show
    const getSuggestion = (): RecoverySuggestion => {
        if (consecutiveDays >= 4) {
            return {
                icon: 'bed',
                title: 'Día de Descanso Total',
                description: `Entrenaste ${consecutiveDays} días seguidos. Tu cuerpo necesita recuperarse para crecer.`,
                color: '#8b5cf6', // purple
            };
        } else if (consecutiveDays >= 2) {
            return {
                icon: 'walk',
                title: 'Descanso Activo',
                description: 'Una caminata de 20-30 min ayuda a la recuperación sin sobrecargar.',
                color: '#10b981', // green
            };
        } else if (weeklyProgress.completed >= 3) {
            return {
                icon: 'body',
                title: 'Estiramientos',
                description: 'Has entrenado bastante esta semana. Unos estiramientos te vendrán bien.',
                color: '#3b82f6', // blue
            };
        } else {
            // Default: encourage a light activity
            return {
                icon: 'leaf',
                title: 'Movilidad & Stretching',
                description: 'Perfecto para mejorar flexibilidad y prevenir lesiones.',
                color: '#22c55e', // green
            };
        }
    };

    const suggestion = getSuggestion();

    return (
        <View
            className="rounded-2xl p-4 mb-4 border"
            style={{
                backgroundColor: suggestion.color + '15',
                borderColor: suggestion.color + '40'
            }}
        >
            <View className="flex-row items-center mb-2">
                <View
                    className="w-10 h-10 rounded-full items-center justify-center"
                    style={{ backgroundColor: suggestion.color + '30' }}
                >
                    <Ionicons name={suggestion.icon as any} size={22} color={suggestion.color} />
                </View>
                <View className="ml-3 flex-1">
                    <Text className="text-xs text-gray-400 uppercase">SUGERENCIA DE HOY</Text>
                    <Text className="text-white font-bold text-lg">{suggestion.title}</Text>
                </View>
            </View>
            <Text className="text-gray-300 text-sm leading-5 ml-13">
                {suggestion.description}
            </Text>

            {consecutiveDays >= 3 && (
                <View className="flex-row items-center mt-3 bg-white/5 rounded-lg px-3 py-2">
                    <Ionicons name="information-circle" size={16} color="#9ca3af" />
                    <Text className="text-gray-400 text-xs ml-2">
                        El descanso es cuando tu cuerpo se fortalece 💪
                    </Text>
                </View>
            )}
        </View>
    );
}
