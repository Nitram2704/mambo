import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSleepStore, formatSleepDuration } from '@/store/sleepStore';
import { calculateSleepStats } from '@/utils/sleepAnalytics';

export default function SleepReportScreen() {
    const router = useRouter();
    const { getWeekSleep, sleepGoals } = useSleepStore();

    const weekSleep = getWeekSleep();
    const stats = calculateSleepStats(weekSleep, sleepGoals);

    return (
        <View className="flex-1 bg-gray-900">
            <LinearGradient
                colors={['#0f172a', '#1e293b']}
                style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
            />
            <SafeAreaView className="flex-1">
                {/* Header */}
                <View className="flex-row items-center justify-between p-4 border-b border-white/10">
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white text-xl font-bold">Reporte de Sueño</Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
                    {/* Summary Cards */}
                    <View className="flex-row gap-4 mb-6">
                        <LinearGradient
                            colors={['rgba(168, 85, 247, 0.3)', 'rgba(139, 92, 246, 0.2)']}
                            className="flex-1 rounded-2xl p-5 border border-purple-500/30"
                        >
                            <Ionicons name="moon" size={28} color="#c084fc" />
                            <Text className="text-purple-300 text-sm mt-3 font-medium">Promedio</Text>
                            <Text className="text-white text-2xl font-bold mt-1">
                                {formatSleepDuration(stats.avgDuration)}
                            </Text>
                        </LinearGradient>
                        <LinearGradient
                            colors={['rgba(99, 102, 241, 0.3)', 'rgba(79, 70, 229, 0.2)']}
                            className="flex-1 rounded-2xl p-5 border border-indigo-500/30"
                        >
                            <Ionicons name="star" size={28} color="#fbbf24" />
                            <Text className="text-indigo-300 text-sm mt-3 font-medium">Calidad</Text>
                            <Text className="text-white text-2xl font-bold mt-1">{stats.avgQuality.toFixed(1)}/5</Text>
                        </LinearGradient>
                    </View>

                    {/* Stats */}
                    <LinearGradient
                        colors={['rgba(30, 41, 59, 0.7)', 'rgba(15, 23, 42, 0.8)']}
                        className="rounded-2xl p-5 mb-6 border border-white/10"
                    >
                        <Text className="text-white font-bold text-lg mb-4">Estadísticas</Text>

                        <View className="mb-4">
                            <View className="flex-row justify-between mb-2">
                                <Text className="text-gray-400 font-medium">Consistencia</Text>
                                <Text className="text-white font-bold">{stats.consistency}%</Text>
                            </View>
                            <View className="bg-gray-800/50 h-2 rounded-full overflow-hidden">
                                <LinearGradient
                                    colors={['#a855f7', '#9333ea']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={{ width: `${stats.consistency}%`, height: '100%' }}
                                />
                            </View>
                        </View>

                        <View className="flex-row justify-between py-3 border-t border-white/5">
                            <Text className="text-gray-400">Racha</Text>
                            <View className="flex-row items-center">
                                <Ionicons name="flame" size={16} color="#ea580c" />
                                <Text className="text-white font-bold ml-1">{stats.streak} días</Text>
                            </View>
                        </View>

                        <View className="flex-row justify-between py-3 border-t border-white/5">
                            <Text className="text-gray-400">Deuda de Sueño</Text>
                            <Text className={`font-bold ${stats.sleepDebt > 0 ? 'text-red-400' : 'text-green-400'}`}>
                                {stats.sleepDebt > 0 ? '+' : ''}{formatSleepDuration(Math.abs(stats.sleepDebt))}
                            </Text>
                        </View>
                    </LinearGradient>

                    {/* Weekly Breakdown */}
                    <LinearGradient
                        colors={['rgba(30, 41, 59, 0.7)', 'rgba(15, 23, 42, 0.8)']}
                        className="rounded-2xl p-5 mb-6 border border-white/10"
                    >
                        <Text className="text-white font-bold text-lg mb-4">Desglose Semanal</Text>
                        {weekSleep.length > 0 ? (
                            weekSleep.map((sleep) => {
                                const date = new Date(sleep.date);
                                const dayName = date.toLocaleDateString('es-ES', { weekday: 'long' });
                                const dayNum = date.getDate();

                                const targetMinutes = sleepGoals ? sleepGoals.targetHours * 60 : 480;
                                const meetsGoal = sleep.duration >= targetMinutes && sleep.quality >= 3;

                                return (
                                    <View key={sleep.id} className="py-3 border-b border-white/5 last:border-b-0">
                                        <View className="flex-row justify-between items-center mb-2">
                                            <View className="flex-row items-center flex-1">
                                                {meetsGoal && <Ionicons name="checkmark-circle" size={16} color="#22c55e" />}
                                                <Text className="text-white capitalize ml-2 font-medium">{dayName} {dayNum}</Text>
                                            </View>
                                            <Text className="text-white font-bold">{formatSleepDuration(sleep.duration)}</Text>
                                        </View>
                                        <View className="flex-row items-center">
                                            <Text className="text-gray-500 text-sm mr-2">Calidad:</Text>
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Ionicons
                                                    key={star}
                                                    name={sleep.quality >= star ? 'star' : 'star-outline'}
                                                    size={12}
                                                    color={sleep.quality >= star ? '#fbbf24' : '#4b5563'}
                                                />
                                            ))}
                                        </View>
                                        {sleep.tags && sleep.tags.length > 0 && (
                                            <View className="flex-row flex-wrap gap-1 mt-2">
                                                {sleep.tags.map((tag) => (
                                                    <View key={tag} className="bg-purple-500/20 px-2 py-1 rounded-md border border-purple-500/30">
                                                        <Text className="text-purple-300 text-xs">{tag}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        )}
                                    </View>
                                );
                            })
                        ) : (
                            <Text className="text-gray-500 text-center py-4">
                                No hay registros para esta semana
                            </Text>
                        )}
                    </LinearGradient>

                    {/* Recommendations */}
                    {stats.avgDuration < (sleepGoals?.targetHours || 8) * 60 && (
                        <LinearGradient
                            colors={['rgba(234, 179, 8, 0.15)', 'rgba(202, 138, 4, 0.1)']}
                            className="rounded-2xl p-5 border border-yellow-500/30 mb-6"
                        >
                            <View className="flex-row items-center mb-2">
                                <Ionicons name="warning" size={20} color="#fbbf24" />
                                <Text className="text-yellow-300 font-bold ml-2">Recomendación</Text>
                            </View>
                            <Text className="text-yellow-100 text-sm leading-5">
                                Tu promedio de sueño está por debajo de tu meta. Intenta acostarte más temprano para alcanzar tus {sleepGoals?.targetHours || 8} horas objetivo.
                            </Text>
                        </LinearGradient>
                    )}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
