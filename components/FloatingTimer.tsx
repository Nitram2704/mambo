import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRestTimer } from '@/context/RestTimerContext';

export const FloatingTimer: React.FC = () => {
    const { timeLeft, totalTime, isActive, stopTimer, addTime } = useRestTimer();

    if (!isActive) return null;

    const progress = timeLeft / totalTime;

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <View className="absolute bottom-24 right-4 z-50">
            <View className="bg-gray-900 rounded-2xl border border-gray-700 shadow-lg overflow-hidden w-48">
                {/* Progress Bar Background */}
                <View className="h-1 bg-gray-800 w-full">
                    <View
                        className="h-full bg-orange-500"
                        style={{ width: `${progress * 100}%` }}
                    />
                </View>

                <View className="p-3 flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <Ionicons name="timer-outline" size={20} color="#f97316" />
                        <Text className="text-white font-bold text-xl ml-2 font-mono">
                            {formatTime(timeLeft)}
                        </Text>
                    </View>

                    <View className="flex-row gap-2">
                        <TouchableOpacity
                            onPress={() => addTime(30)}
                            className="bg-gray-800 p-1.5 rounded-full border border-gray-600">
                            <Text className="text-xs text-white font-bold">+30</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={stopTimer}
                            className="bg-red-900/50 p-1.5 rounded-full border border-red-500/50">
                            <Ionicons name="close" size={12} color="#fca5a5" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
};
