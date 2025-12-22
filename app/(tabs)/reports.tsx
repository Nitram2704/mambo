import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Card } from '@/components/ui/Card';
import { MuscleVolumeChart } from '@/components/MuscleVolumeChart';
import { OneRMChart } from '@/components/OneRMChart';
import { useWorkoutHistoryStore } from '@/store/workoutHistoryStore';

export default function ReportsScreen() {
    const router = useRouter();
    const { workouts } = useWorkoutHistoryStore();

    // Calculate stats
    const thisWeekWorkouts = workouts.filter(w => {
        const workoutDate = new Date(w.startTime);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return workoutDate >= weekAgo;
    });

    const weeklyVolume = thisWeekWorkouts.reduce((sum, w) => sum + w.volume, 0);
    const totalWorkouts = thisWeekWorkouts.length;

    return (
        <ScreenWrapper bg="bg-background" safeArea={true}>
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <View className="p-4">
                    {/* Header */}
                    <View className="mb-6 mt-2">
                        <Text className="text-text-secondary text-xs font-black uppercase tracking-widest">
                            ANÁLISIS DE PROGRESO
                        </Text>
                        <Text className="text-text text-4xl font-black mt-1">Reportes</Text>
                    </View>

                    {/* Quick Stats */}
                    <Card variant="glass" className="mb-6 border-white/10">
                        <Text className="text-text font-bold text-lg mb-4">Esta Semana</Text>
                        <View className="flex-row justify-between">
                            <View className="items-center flex-1">
                                <View className="w-12 h-12 rounded-2xl bg-warning/20 items-center justify-center mb-2">
                                    <Ionicons name="flame" size={24} color="#eab308" />
                                </View>
                                <Text className="text-text-secondary text-[10px] font-black uppercase tracking-widest">Volumen</Text>
                                <Text className="text-text font-black text-lg mt-1">
                                    {weeklyVolume > 0 ? `${weeklyVolume.toLocaleString()}kg` : '-'}
                                </Text>
                            </View>
                            <View className="items-center flex-1">
                                <View className="w-12 h-12 rounded-2xl bg-success/20 items-center justify-center mb-2">
                                    <Ionicons name="barbell" size={24} color="#22c55e" />
                                </View>
                                <Text className="text-text-secondary text-[10px] font-black uppercase tracking-widest">Entrenos</Text>
                                <Text className="text-text font-black text-lg mt-1">{totalWorkouts}</Text>
                            </View>
                            <View className="items-center flex-1">
                                <View className="w-12 h-12 rounded-2xl bg-primary/20 items-center justify-center mb-2">
                                    <Ionicons name="trophy" size={24} color="#3b82f6" />
                                </View>
                                <Text className="text-text-secondary text-[10px] font-black uppercase tracking-widest">Racha</Text>
                                <Text className="text-text font-black text-lg mt-1">0</Text>
                            </View>
                        </View>
                    </Card>

                    {/* Weekly Report Card */}
                    <TouchableOpacity
                        onPress={() => router.push('/reports/weekly')}
                        className="mb-4"
                        activeOpacity={0.7}
                    >
                        <Card variant="glass" className="border-warning/30 p-6">
                            <View className="flex-row items-center justify-between mb-3">
                                <View className="bg-warning/20 p-3 rounded-2xl">
                                    <Ionicons name="calendar-outline" size={28} color="#eab308" />
                                </View>
                                <Ionicons name="chevron-forward" size={24} color="#eab308" />
                            </View>
                            <Text className="text-text text-2xl font-black mb-2">Reporte Semanal</Text>
                            <Text className="text-text-secondary text-sm">Revisa tu progreso de los últimos 7 días</Text>
                        </Card>
                    </TouchableOpacity>

                    {/* Monthly Report Card */}
                    <TouchableOpacity
                        onPress={() => router.push('/reports/monthly')}
                        className="mb-4"
                        activeOpacity={0.7}
                    >
                        <Card variant="glass" className="border-primary/30 p-6">
                            <View className="flex-row items-center justify-between mb-3">
                                <View className="bg-primary/20 p-3 rounded-2xl">
                                    <Ionicons name="bar-chart-outline" size={28} color="#3b82f6" />
                                </View>
                                <Ionicons name="chevron-forward" size={24} color="#3b82f6" />
                            </View>
                            <Text className="text-text text-2xl font-black mb-2">Reporte Mensual</Text>
                            <Text className="text-text-secondary text-sm">Análisis completo del mes</Text>
                        </Card>
                    </TouchableOpacity>

                    {/* Advanced Analytics Card */}
                    <TouchableOpacity
                        onPress={() => router.push('/analytics/advanced')}
                        className="mb-4"
                        activeOpacity={0.7}
                    >
                        <Card variant="glass" className="border-success/30 p-6">
                            <View className="flex-row items-center justify-between mb-3">
                                <View className="bg-success/20 p-3 rounded-2xl">
                                    <Ionicons name="sparkles-outline" size={28} color="#22c55e" />
                                </View>
                                <View className="bg-success/20 px-2 py-1 rounded-full">
                                    <Text className="text-success text-[10px] font-black uppercase tracking-widest">NUEVO</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={24} color="#22c55e" />
                            </View>
                            <Text className="text-text text-2xl font-black mb-2">Analytics Avanzados</Text>
                            <Text className="text-text-secondary text-sm">Predicciones con IA y balance muscular</Text>
                        </Card>
                    </TouchableOpacity>

                    {/* Full History Card */}
                    <TouchableOpacity
                        onPress={() => router.push('/history')}
                        className="mb-6"
                        activeOpacity={0.7}
                    >
                        <Card variant="glass" className="border-secondary/30 p-6">
                            <View className="flex-row items-center justify-between mb-3">
                                <View className="bg-secondary/20 p-3 rounded-2xl">
                                    <Ionicons name="time-outline" size={28} color="#8b5cf6" />
                                </View>
                                <Ionicons name="chevron-forward" size={24} color="#8b5cf6" />
                            </View>
                            <Text className="text-text text-2xl font-black mb-2">Historial Completo</Text>
                            <Text className="text-text-secondary text-sm">Consulta todos tus registros pasados</Text>
                        </Card>
                    </TouchableOpacity>

                    {/* Advanced Analytics */}
                    <View className="mb-4">
                        <MuscleVolumeChart />
                    </View>

                    <View className="mb-8">
                        <OneRMChart />
                    </View>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}
