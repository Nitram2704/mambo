import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useWorkoutHistoryStore } from '@/store/workoutHistoryStore';

export const ConsistencyCalendar: React.FC = () => {
    const { workouts } = useWorkoutHistoryStore();

    // Generate last 12 weeks of data
    const weeks = 12;
    const days = 7;
    const today = new Date();

    // Create grid data
    const grid: { date: Date; intensity: number }[][] = [];

    // Helper to check if a date has a workout
    const getWorkoutIntensity = (date: Date) => {
        const dateString = date.toDateString();
        const dayWorkouts = workouts.filter(w => new Date(w.endTime).toDateString() === dateString);

        if (dayWorkouts.length === 0) return 0;

        // Intensity based on total volume
        const totalVolume = dayWorkouts.reduce((sum, w) => sum + w.volume, 0);

        // Scale: 0 = none, 1 = low (0-2000kg), 2 = medium (2001-5000kg), 3 = high (5000kg+)
        if (totalVolume >= 5000) return 3;
        if (totalVolume >= 2000) return 2;
        return 1;
    };

    // Fill grid backwards from today
    // We want the last column to end on today or this week

    // Find the Sunday of the current week to align columns
    // const currentDay = today.getDay(); // 0 is Sunday
    // Adjust so 0 is Monday (optional, but standard GitHub is Sun-Sat)
    // Let's stick to Sun-Sat for simplicity

    const endDate = new Date(today);
    // Align to end of week (Saturday)
    endDate.setDate(today.getDate() + (6 - today.getDay()));

    for (let w = 0; w < weeks; w++) {
        const weekData: { date: Date; intensity: number }[] = [];
        for (let d = 0; d < days; d++) {
            const date = new Date(endDate);
            date.setDate(endDate.getDate() - (w * 7) - (6 - d));

            weekData.push({
                date,
                intensity: getWorkoutIntensity(date)
            });
        }
        grid.unshift(weekData); // Add to beginning to have chronological order left-to-right
    }

    const getCellColor = (intensity: number) => {
        switch (intensity) {
            case 0: return 'bg-gray-800';
            case 1: return 'bg-green-300';
            case 2: return 'bg-green-500';
            case 3: return 'bg-green-700';
            default: return 'bg-gray-800';
        }
    };

    return (
        <View className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <Text className="text-white font-bold mb-3">Consistencia</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-1">
                    {grid.map((week, wIndex) => (
                        <View key={wIndex} className="gap-1">
                            {week.map((day, dIndex) => (
                                <View
                                    key={dIndex}
                                    className={`w-3 h-3 rounded-sm ${getCellColor(day.intensity)}`}
                                    style={{ opacity: day.date > today ? 0.3 : 1 }}
                                />
                            ))}
                        </View>
                    ))}
                </View>
            </ScrollView>
            <View className="flex-row justify-end items-center mt-2 gap-2">
                <Text className="text-gray-500 text-xs">Sin entreno</Text>
                <View className="w-3 h-3 rounded-sm bg-gray-800" />
                <View className="w-3 h-3 rounded-sm bg-green-300" />
                <View className="w-3 h-3 rounded-sm bg-green-500" />
                <View className="w-3 h-3 rounded-sm bg-green-700" />
                <Text className="text-gray-500 text-xs">Alto volumen</Text>
            </View>
        </View>
    );
};
