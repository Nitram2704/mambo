import React, { useRef, useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useWorkoutHistoryStore } from '@/store/workoutHistoryStore';
import { exportAsImage } from '@/utils/exportUtils';
import { LinearGradient } from 'expo-linear-gradient';
import ConfettiCannon from 'react-native-confetti-cannon';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { AccessibleText } from '@/components/ui/AccessibleText';
import { a11y } from '@/utils/accessibility';
import { Colors } from '@/constants/Colors';
import { useAppTheme } from '@/hooks/use-app-theme';

export default function WorkoutSummaryScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { workoutId } = params;
    const workouts = useWorkoutHistoryStore((state) => state.workouts);
    const viewRef = useRef(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const { theme } = useAppTheme();
    const colors = Colors[theme];

    const workout = workouts.find(w => w.id === workoutId);

    const formatDuration = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${h}h ${m}m`;
        return `${m}m ${s}s`;
    };

    const totalSets = workout?.exercises.reduce((acc, ex) =>
        acc + ex.sets.filter(s => s.completed).length, 0
    ) || 0;

    const prCount = workout?.exercises.reduce((acc, ex) => {
        return acc + (ex.sets.some(s => s.weight > 100) ? 1 : 0);
    }, 0) || 0;

    const getCoachSummary = () => {
        if (!workout) return "";
        const volume = workout.volume;
        if (volume > 10000) return "¡Bestial! Has movido el peso de un camión. El Mambo Coach está sin palabras. 🐘";
        if (volume > 5000) return "Entreno sólido. Estás construyendo una base de acero. 🏗️";
        if (prCount > 0) return `¡Día de récords! ${prCount} nuevas marcas personales. ¡Sigue así! 🏆`;
        return "Buen trabajo hoy. Cada repetición cuenta para tu mejor versión. 💪";
    };

    const handleShare = async () => {
        await exportAsImage(viewRef, `workout-${workoutId}`);
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowConfetti(true);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    if (!workout) {
        return (
            <ScreenWrapper className="items-center justify-center">
                <AccessibleText>Cargando resumen...</AccessibleText>
                <TouchableOpacity
                    onPress={() => router.replace('/(tabs)')}
                    className="mt-4"
                    {...a11y.button('Volver al inicio', 'Vuelve a la pantalla principal')}
                >
                    <AccessibleText className="text-primary">Volver al inicio</AccessibleText>
                </TouchableOpacity>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper
            className="bg-background"
            footer={
                <View className="p-4 flex-row gap-3 bg-background border-t border-border/10">
                    <TouchableOpacity
                        onPress={handleShare}
                        className="flex-1 bg-surface-highlight p-4 rounded-xl border border-border/10 active:bg-surface-highlight/20 flex-row justify-center items-center"
                        {...a11y.button('Compartir', 'Exporta el resumen de tu entrenamiento como imagen')}
                    >
                        <Ionicons name="share-social-outline" size={24} color={colors.text} />
                        <AccessibleText weight="bold" variant="h3" className="text-text ml-2">Compartir</AccessibleText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.replace('/(tabs)')}
                        className="flex-1 bg-primary p-4 rounded-xl active:bg-primary/80"
                        {...a11y.button('Inicio', 'Vuelve a la pantalla principal')}
                    >
                        <AccessibleText weight="bold" variant="h3" className="text-white text-center">Inicio</AccessibleText>
                    </TouchableOpacity>
                </View>
            }
        >
            {showConfetti && (
                <ConfettiCannon
                    count={200}
                    origin={{ x: -10, y: 0 }}
                    fadeOut={true}
                    autoStart={true}
                />
            )}
            <ScrollView className="flex-1 p-4">
                <View ref={viewRef} collapsable={false} className="bg-surface rounded-3xl overflow-hidden border border-border/10">
                    <LinearGradient
                        colors={[colors.surfaceHighlight, colors.background]}
                        className="p-6"
                    >
                        <View className="items-center mb-8 mt-4" {...a11y.header('Resumen de entrenamiento')}>
                            <LinearGradient
                                colors={Colors.gradients.success}
                                className="w-20 h-20 rounded-full items-center justify-center mb-4 shadow-lg shadow-success/20"
                            >
                                <Ionicons name="checkmark-done" size={40} color="white" />
                            </LinearGradient>
                            <AccessibleText variant="h1" weight="bold" className="text-text text-center tracking-tighter uppercase">MAMBO SUMMARY</AccessibleText>
                            <AccessibleText weight="medium" className="text-text-secondary text-lg mt-1">{workout.routineName}</AccessibleText>

                            {/* PR Badge */}
                            {prCount > 0 && (
                                <View
                                    className="mt-4 bg-warning/20 px-4 py-2 rounded-full border border-warning/50 flex-row items-center gap-2"
                                    accessibilityLabel={`${prCount} récords personales conseguidos`}
                                >
                                    <Ionicons name="trophy" size={20} color={colors.warning} />
                                    <AccessibleText weight="bold" className="text-warning text-sm uppercase tracking-widest">
                                        {prCount} {prCount === 1 ? 'Récord Personal' : 'Récords Personales'}
                                    </AccessibleText>
                                    <Ionicons name="trophy" size={20} color={colors.warning} />
                                </View>
                            )}
                        </View>

                        {/* Coach Summary Card */}
                        <View
                            className="bg-secondary/10 p-5 rounded-2xl border border-secondary/20 mb-8"
                            accessibilityLabel={`Mensaje del Coach: ${getCoachSummary()}`}
                        >
                            <View className="flex-row items-center gap-2 mb-2">
                                <Ionicons name="sparkles" size={18} color={colors.secondary} />
                                <AccessibleText variant="caption" weight="bold" className="text-secondary uppercase tracking-widest">Mambo Coach</AccessibleText>
                            </View>
                            <AccessibleText weight="medium" className="text-text italic">
                                &quot;{getCoachSummary()}&quot;
                            </AccessibleText>
                        </View>

                        {/* Stats Grid */}
                        <View className="flex-row flex-wrap gap-3 mb-8">
                            <View className="flex-1 min-w-[45%] bg-surface-highlight/10 p-4 rounded-2xl border border-border/10 items-center" accessibilityLabel={`Duración: ${formatDuration(workout.durationSeconds)}`}>
                                <Ionicons name="time-outline" size={20} color={colors.blue[400]} className="mb-1" />
                                <AccessibleText variant="caption" weight="bold" className="text-text-muted uppercase tracking-widest">Duración</AccessibleText>
                                <AccessibleText variant="h3" weight="bold" className="text-text">{formatDuration(workout.durationSeconds)}</AccessibleText>
                            </View>
                            <View className="flex-1 min-w-[45%] bg-surface-highlight/10 p-4 rounded-2xl border border-border/10 items-center" accessibilityLabel={`Volumen total: ${workout.volume.toLocaleString()} kilogramos`}>
                                <Ionicons name="barbell-outline" size={20} color={colors.pink[500]} className="mb-1" />
                                <AccessibleText variant="caption" weight="bold" className="text-text-muted uppercase tracking-widest">Volumen</AccessibleText>
                                <AccessibleText variant="h3" weight="bold" className="text-text">{workout.volume.toLocaleString()} kg</AccessibleText>
                            </View>
                            <View className="flex-1 min-w-[45%] bg-surface-highlight/10 p-4 rounded-2xl border border-border/10 items-center" accessibilityLabel={`Total de series completadas: ${totalSets}`}>
                                <Ionicons name="layers-outline" size={20} color={colors.secondary} className="mb-1" />
                                <AccessibleText variant="caption" weight="bold" className="text-text-muted uppercase tracking-widest">Series</AccessibleText>
                                <AccessibleText variant="h3" weight="bold" className="text-text">{totalSets}</AccessibleText>
                            </View>
                            <View className="flex-1 min-w-[45%] bg-surface-highlight/10 p-4 rounded-2xl border border-border/10 items-center" accessibilityLabel={`Número de ejercicios realizados: ${workout.exercises.length}`}>
                                <Ionicons name="flame-outline" size={20} color={colors.warning} className="mb-1" />
                                <AccessibleText variant="caption" weight="bold" className="text-text-muted uppercase tracking-widest">Ejercicios</AccessibleText>
                                <AccessibleText variant="h3" weight="bold" className="text-text">{workout.exercises.length}</AccessibleText>
                            </View>
                        </View>

                        {/* Exercises List Summary */}
                        <AccessibleText variant="h2" weight="bold" className="text-text mb-4 ml-1">Desglose</AccessibleText>
                        <View className="gap-2 mb-4">
                            {workout.exercises.map((ex, i) => {
                                const completedSets = ex.sets.filter(s => s.completed);
                                if (completedSets.length === 0) return null;

                                const bestSet = completedSets.reduce((prev, current) =>
                                    (prev.weight * prev.reps > current.weight * current.reps) ? prev : current
                                );

                                return (
                                    <View
                                        key={i}
                                        className="bg-surface-highlight/10 p-4 rounded-2xl border border-border/10 flex-row justify-between items-center"
                                        accessibilityLabel={`${ex.exerciseName}. ${completedSets.length} series. Mejor serie: ${bestSet.weight} kilos por ${bestSet.reps} repeticiones.`}
                                    >
                                        <View>
                                            <AccessibleText weight="bold" className="text-text">{ex.exerciseName}</AccessibleText>
                                            <AccessibleText variant="caption" className="text-text-muted">{completedSets.length} series</AccessibleText>
                                        </View>
                                        <View className="bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20">
                                            <AccessibleText weight="bold" variant="caption" className="text-primary">{bestSet.weight}kg × {bestSet.reps}</AccessibleText>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    </LinearGradient>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}
