import React, { useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useWorkoutHistoryStore } from '@/store/workoutHistoryStore';
import { exportAsImage } from '@/utils/exportUtils';
import { LinearGradient } from 'expo-linear-gradient';

export default function WorkoutSummaryScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { workoutId } = params;
    const workouts = useWorkoutHistoryStore((state) => state.workouts);
    const viewRef = useRef(null);

    const workout = workouts.find(w => w.id === workoutId);

    if (!workout) {
        return (
            <SafeAreaView className="flex-1 bg-gray-900 items-center justify-center">
                <Text className="text-white">Cargando resumen...</Text>
                <TouchableOpacity onPress={() => router.replace('/(tabs)')} className="mt-4">
                    <Text className="text-blue-500">Volver al inicio</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const formatDuration = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${h}h ${m}m`;
        return `${m}m ${s}s`;
    };

    const totalSets = workout.exercises.reduce((acc, ex) =>
        acc + ex.sets.filter(s => s.completed).length, 0
    );

    const prCount = workout.exercises.reduce((acc, ex) => {
        // This is a simplified PR check for the summary
        // In a real app, we'd pass PR info from the active session
        return acc + (ex.sets.some(s => s.weight > 100) ? 1 : 0); // Mock PR detection for summary
    }, 0);

    const getCoachSummary = () => {
        const volume = workout.volume;
        if (volume > 10000) return "¡Bestial! Has movido el peso de un camión. El Mambo Coach está sin palabras. 🐘";
        if (volume > 5000) return "Entreno sólido. Estás construyendo una base de acero. 🏗️";
        if (prCount > 0) return `¡Día de récords! ${prCount} nuevas marcas personales. ¡Sigue así! 🏆`;
        return "Buen trabajo hoy. Cada repetición cuenta para tu mejor versión. 💪";
    };

    const handleShare = async () => {
        await exportAsImage(viewRef, `workout-${workoutId}`);
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-900">
            <ScrollView className="flex-1 p-4">
                <View ref={viewRef} collapsable={false} className="bg-gray-900 rounded-3xl overflow-hidden border border-white/10">
                    <LinearGradient
                        colors={['#1e293b', '#0f172a']}
                        className="p-6"
                    >
                        <View className="items-center mb-8 mt-4">
                            <LinearGradient
                                colors={['#22c55e', '#16a34a']}
                                className="w-20 h-20 rounded-full items-center justify-center mb-4 shadow-lg shadow-green-500/20"
                            >
                                <Ionicons name="checkmark-done" size={40} color="white" />
                            </LinearGradient>
                            <Text className="text-white text-3xl font-black text-center tracking-tighter">MAMBO SUMMARY</Text>
                            <Text className="text-gray-400 text-lg mt-1 font-medium">{workout.routineName}</Text>
                        </View>

                        {/* Coach Summary Card */}
                        <View className="bg-purple-600/20 p-5 rounded-2xl border border-purple-500/30 mb-8">
                            <View className="flex-row items-center gap-2 mb-2">
                                <Ionicons name="sparkles" size={18} color="#a855f7" />
                                <Text className="text-purple-300 font-bold text-xs uppercase tracking-widest">Mambo Coach</Text>
                            </View>
                            <Text className="text-white text-base font-medium italic">
                                &quot;{getCoachSummary()}&quot;
                            </Text>
                        </View>

                        {/* Stats Grid */}
                        <View className="flex-row flex-wrap gap-3 mb-8">
                            <View className="flex-1 min-w-[45%] bg-white/5 p-4 rounded-2xl border border-white/5 items-center">
                                <Ionicons name="time-outline" size={20} color="#60a5fa" className="mb-1" />
                                <Text className="text-gray-500 text-[10px] uppercase font-black tracking-widest">Duración</Text>
                                <Text className="text-white text-lg font-bold">{formatDuration(workout.durationSeconds)}</Text>
                            </View>
                            <View className="flex-1 min-w-[45%] bg-white/5 p-4 rounded-2xl border border-white/5 items-center">
                                <Ionicons name="barbell-outline" size={20} color="#f472b6" className="mb-1" />
                                <Text className="text-gray-500 text-[10px] uppercase font-black tracking-widest">Volumen</Text>
                                <Text className="text-white text-lg font-bold">{workout.volume.toLocaleString()} kg</Text>
                            </View>
                            <View className="flex-1 min-w-[45%] bg-white/5 p-4 rounded-2xl border border-white/5 items-center">
                                <Ionicons name="layers-outline" size={20} color="#a78bfa" className="mb-1" />
                                <Text className="text-gray-500 text-[10px] uppercase font-black tracking-widest">Series</Text>
                                <Text className="text-white text-lg font-bold">{totalSets}</Text>
                            </View>
                            <View className="flex-1 min-w-[45%] bg-white/5 p-4 rounded-2xl border border-white/5 items-center">
                                <Ionicons name="flame-outline" size={20} color="#fbbf24" className="mb-1" />
                                <Text className="text-gray-500 text-[10px] uppercase font-black tracking-widest">Ejercicios</Text>
                                <Text className="text-white text-lg font-bold">{workout.exercises.length}</Text>
                            </View>
                        </View>

                        {/* Exercises List Summary */}
                        <Text className="text-white text-lg font-bold mb-4 ml-1">Desglose</Text>
                        <View className="gap-2 mb-4">
                            {workout.exercises.map((ex, i) => {
                                const completedSets = ex.sets.filter(s => s.completed);
                                if (completedSets.length === 0) return null;

                                const bestSet = completedSets.reduce((prev, current) =>
                                    (prev.weight * prev.reps > current.weight * current.reps) ? prev : current
                                );

                                return (
                                    <View key={i} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex-row justify-between items-center">
                                        <View>
                                            <Text className="text-white font-bold text-base">{ex.exerciseName}</Text>
                                            <Text className="text-gray-500 text-xs">{completedSets.length} series</Text>
                                        </View>
                                        <View className="bg-blue-500/10 px-3 py-1.5 rounded-xl border border-blue-500/20">
                                            <Text className="text-blue-400 font-bold text-xs">{bestSet.weight}kg × {bestSet.reps}</Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    </LinearGradient>
                </View>
            </ScrollView>

            <View className="p-4 border-t border-gray-800 flex-row gap-3">
                <TouchableOpacity
                    onPress={handleShare}
                    className="flex-1 bg-gray-800 p-4 rounded-xl border border-gray-700 active:bg-gray-700 flex-row justify-center items-center">
                    <Ionicons name="share-social-outline" size={24} color="white" />
                    <Text className="text-white font-bold text-lg ml-2">Compartir</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => router.replace('/(tabs)')}
                    className="flex-1 bg-blue-600 p-4 rounded-xl active:bg-blue-700">
                    <Text className="text-white text-center font-bold text-lg">Inicio</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
