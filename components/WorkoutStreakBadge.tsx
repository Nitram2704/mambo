import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWeeklyScheduleStore } from '@/store/weeklyScheduleStore';

/**
 * Badge component that displays the user's workout streak
 * Shows fire emoji and consecutive days/weeks of training
 */
export function WorkoutStreakBadge({ size = 'normal' }: { size?: 'small' | 'normal' | 'large' }) {
    const { getWorkoutStreak } = useWeeklyScheduleStore();
    const streak = getWorkoutStreak();

    if (!streak.isActive || streak.days === 0) {
        return null;
    }

    const sizeClasses = {
        small: { container: 'px-2 py-1', text: 'text-xs', icon: 14 },
        normal: { container: 'px-3 py-1.5', text: 'text-sm', icon: 16 },
        large: { container: 'px-4 py-2', text: 'text-base', icon: 20 },
    };

    const { container, text, icon } = sizeClasses[size];

    const getStreakMessage = () => {
        if (streak.weeks >= 4) return '¡Increíble constancia!';
        if (streak.weeks >= 2) return '¡Vas genial!';
        if (streak.days >= 3) return '¡Sigue así!';
        return '';
    };

    return (
        <View className={`flex-row items-center bg-orange-500/20 rounded-full ${container}`}>
            <Text className="mr-1">🔥</Text>
            <Text className={`text-orange-400 font-bold ${text}`}>
                {streak.days} día{streak.days !== 1 ? 's' : ''}
            </Text>
            {streak.weeks >= 1 && (
                <Text className={`text-orange-300 ml-1 ${text}`}>
                    ({streak.weeks} sem)
                </Text>
            )}
        </View>
    );
}

/**
 * Larger streak card for displaying on home/workout screens
 */
export function WorkoutStreakCard() {
    const { getWorkoutStreak, getWeeklyProgress } = useWeeklyScheduleStore();
    const streak = getWorkoutStreak();
    const progress = getWeeklyProgress();

    return (
        <View className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/30 rounded-2xl p-4">
            <View className="flex-row justify-between items-start">
                <View>
                    <Text className="text-gray-400 text-xs font-bold mb-1">RACHA DE ENTRENO</Text>
                    <View className="flex-row items-center">
                        <Text className="text-3xl mr-2">🔥</Text>
                        <View>
                            <Text className="text-white text-2xl font-bold">
                                {streak.days} día{streak.days !== 1 ? 's' : ''}
                            </Text>
                            {streak.weeks >= 1 && (
                                <Text className="text-orange-400 text-sm">
                                    {streak.weeks} semana{streak.weeks !== 1 ? 's' : ''} seguidas
                                </Text>
                            )}
                        </View>
                    </View>
                </View>

                {/* Weekly mini progress */}
                <View className="items-end">
                    <Text className="text-gray-400 text-xs mb-1">Esta semana</Text>
                    <Text className="text-white font-bold">
                        {progress.completed}/{progress.scheduled}
                    </Text>
                </View>
            </View>

            {streak.days === 0 && (
                <Text className="text-gray-500 text-sm mt-2">
                    ¡Entrena hoy para comenzar tu racha!
                </Text>
            )}
        </View>
    );
}
