import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSleepStore, formatSleepDuration } from '@/store/sleepStore';
import { useWeeklyScheduleStore } from '@/store/weeklyScheduleStore';
import SleepScoreRing from '@/components/SleepScoreRing';
import { getLocalDateString } from '@/utils/dateUtils';

export default function MorningBriefingScreen() {
    const router = useRouter();
    const lastNight = useSleepStore((state) => state.getLastNightSleep());
    const chronotype = useSleepStore((state) => state.chronotype);
    const sleepDebt = useSleepStore((state) => state.sleepDebt);
    const getWorkoutsForDate = useWeeklyScheduleStore((state) => state.getWorkoutsForDate);

    const todayWorkout = useMemo(() => {
        const todayStr = getLocalDateString();
        const workouts = getWorkoutsForDate(todayStr);
        return workouts.length > 0 ? workouts[0] : null;
    }, [getWorkoutsForDate]);

    if (!lastNight) {
        return (
            <View className="flex-1 bg-gray-900 items-center justify-center">
                <Text className="text-white">No hay datos de anoche.</Text>
                <TouchableOpacity onPress={() => router.replace('/(tabs)/sleep')}>
                    <Text className="text-purple-400 mt-4">Volver</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-900">
            <LinearGradient
                colors={['#0f172a', '#1e293b']}
                style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
            />
            <SafeAreaView className="flex-1">
                <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
                    <View className="items-center mb-8">
                        <Text className="text-gray-400 text-sm font-medium uppercase tracking-widest mb-2">Resumen Matutino</Text>
                        <Text className="text-white text-3xl font-bold">¡Buenos días, Mambo!</Text>
                    </View>

                    {/* Sleep Score Section */}
                    <View className="items-center mb-10">
                        <SleepScoreRing score={lastNight.dailyScore || 0} size={200} strokeWidth={15} />
                        <Text className="text-purple-300 text-lg font-medium mt-4">
                            {lastNight.dailyScore && lastNight.dailyScore >= 80 ? '¡Descanso excelente!' : 'Buen descanso'}
                        </Text>
                    </View>

                    {/* Stats Grid */}
                    <View className="flex-row flex-wrap gap-4 mb-10">
                        <View className="bg-white/5 border border-white/10 p-4 rounded-2xl flex-1 min-w-[140px]">
                            <Ionicons name="time-outline" size={20} color="#a855f7" />
                            <Text className="text-gray-400 text-xs mt-2">DURACIÓN</Text>
                            <Text className="text-white text-xl font-bold">{formatSleepDuration(lastNight.duration)}</Text>
                        </View>
                        <View className="bg-white/5 border border-white/10 p-4 rounded-2xl flex-1 min-w-[140px]">
                            <Ionicons name="mic-outline" size={20} color="#ef4444" />
                            <Text className="text-gray-400 text-xs mt-2">RUIDOS</Text>
                            <Text className="text-white text-xl font-bold">{lastNight.noiseEvents || 0}</Text>
                        </View>

                        {/* New Advanced Stats */}
                        <View className="bg-white/5 border border-white/10 p-4 rounded-2xl flex-1 min-w-[140px]">
                            <Ionicons name="flash-outline" size={20} color="#fbbf24" />
                            <Text className="text-gray-400 text-xs mt-2">CRONOTIPO</Text>
                            <Text className="text-white text-xl font-bold">{chronotype}</Text>
                        </View>
                        <View className="bg-white/5 border border-white/10 p-4 rounded-2xl flex-1 min-w-[140px]">
                            <Ionicons name="trending-down-outline" size={20} color="#3b82f6" />
                            <Text className="text-gray-400 text-xs mt-2">DEUDA</Text>
                            <Text className="text-white text-xl font-bold">{formatSleepDuration(sleepDebt)}</Text>
                        </View>
                    </View>

                    {/* Today's Workout */}
                    <View className="bg-purple-600/20 border border-purple-500/30 p-6 rounded-3xl mb-10">
                        <View className="flex-row items-center mb-4">
                            <View className="bg-purple-500 p-2 rounded-xl mr-3">
                                <Ionicons name="fitness" size={24} color="white" />
                            </View>
                            <View>
                                <Text className="text-white font-bold text-lg">Entreno de Hoy</Text>
                                <Text className="text-purple-300 text-xs">Prepárate para la acción</Text>
                            </View>
                        </View>

                        {todayWorkout ? (
                            <View>
                                <Text className="text-white text-2xl font-bold mb-4">{todayWorkout.routineName}</Text>
                                <TouchableOpacity
                                    onPress={() => router.push('/workout/active')}
                                    className="bg-white py-3 rounded-xl items-center"
                                >
                                    <Text className="text-purple-600 font-bold">Empezar ahora</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <Text className="text-gray-400 italic">Hoy es día de descanso. ¡Recupera bien!</Text>
                        )}
                    </View>

                    <TouchableOpacity
                        onPress={() => router.replace('/(tabs)/sleep')}
                        className="bg-white/10 py-4 rounded-2xl items-center mb-10"
                    >
                        <Text className="text-white font-bold">Cerrar Resumen</Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
