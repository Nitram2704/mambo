import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useActiveWorkoutStore } from '@/store/activeWorkoutStore';

export default function RestTimer() {
    const { activeRestTimer, stopRestTimer, startRestTimer } = useActiveWorkoutStore();
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        if (!activeRestTimer.isRunning || !activeRestTimer.startTime) {
            return;
        }

        const interval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - activeRestTimer.startTime!) / 1000);
            const remaining = Math.max(0, activeRestTimer.duration - elapsed);
            setTimeLeft(remaining);

            if (remaining === 0) {
                stopRestTimer();
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [activeRestTimer, stopRestTimer]);

    if (!activeRestTimer.isRunning) return null;

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const addTime = (seconds: number) => {
        startRestTimer(activeRestTimer.duration + seconds);
    };

    const subtractTime = (seconds: number) => {
        startRestTimer(Math.max(0, activeRestTimer.duration - seconds));
    };

    return (
        <View className="absolute bottom-6 left-4 right-4 bg-gray-800 p-4 rounded-2xl border border-gray-700 shadow-lg flex-row items-center justify-between">
            <View>
                <Text className="text-gray-400 text-xs font-bold uppercase">Descanso</Text>
                <Text className="text-white text-3xl font-bold font-mono">
                    {formatTime(timeLeft)}
                </Text>
            </View>

            <View className="flex-row gap-3">
                <TouchableOpacity
                    onPress={() => subtractTime(10)}
                    className="w-10 h-10 bg-gray-700 rounded-full items-center justify-center">
                    <Text className="text-white font-bold">-10</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => addTime(30)}
                    className="w-10 h-10 bg-gray-700 rounded-full items-center justify-center">
                    <Text className="text-white font-bold">+30</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={stopRestTimer}
                    className="w-10 h-10 bg-red-900/50 rounded-full items-center justify-center border border-red-900">
                    <Ionicons name="close" size={20} color="#f87171" />
                </TouchableOpacity>
            </View>
        </View>
    );
}
