import React, { useMemo, useState } from 'react';
import { View, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useWeeklyScheduleStore, ScheduledWorkout } from '@/store/weeklyScheduleStore';
import { useSavedRoutinesStore } from '@/store/savedRoutinesStore';
import { LinearGradient } from 'expo-linear-gradient';
import { DAY_NAMES_FULL } from '@/utils/scheduleUtils';
import { getLocalDateString, formatSpanishDate, parseLocalDate } from '@/utils/dateUtils';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { AccessibleText } from '@/components/ui/AccessibleText';
import { a11y } from '@/utils/accessibility';

export default function WorkoutScheduleScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { theme } = useAppTheme();
    const isDark = theme === 'dark';
    const colors = Colors[theme];
    const { schedule, rescheduleWorkout, removeWorkoutFromSchedule, getWeeklyProgress } = useWeeklyScheduleStore();
    const { routines } = useSavedRoutinesStore();

    const [editingWorkout, setEditingWorkout] = useState<ScheduledWorkout | null>(null);
    const [selectedNewDate, setSelectedNewDate] = useState<string | null>(null);

    const weeklyProgress = getWeeklyProgress();

    // Group workouts by week
    const groupedSchedule = useMemo(() => {
        const sorted = [...schedule].sort((a, b) => a.date.localeCompare(b.date));
        const weeks: { [key: string]: ScheduledWorkout[] } = {};

        sorted.forEach(workout => {
            const date = parseLocalDate(workout.date);
            // Get Monday of that week
            const day = date.getDay();
            const diff = date.getDate() - day + (day === 0 ? -6 : 1);
            const monday = new Date(date.setDate(diff));
            const weekKey = getLocalDateString(monday);

            if (!weeks[weekKey]) weeks[weekKey] = [];
            weeks[weekKey].push(workout);
        });

        return Object.entries(weeks).sort((a, b) => a[0].localeCompare(b[0]));
    }, [schedule]);

    const formatDate = (dateStr: string) => {
        return formatSpanishDate(dateStr);
    };

    // Generate next 14 days for date picker
    const availableDates = useMemo(() => {
        const dates: { date: string; label: string; dayName: string }[] = [];
        const today = new Date();

        for (let i = 0; i < 14; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);

            // Skip Sundays (getDay() === 0)
            if (date.getDay() === 0) continue;

            const dateStr = getLocalDateString(date);
            const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;

            dates.push({
                date: dateStr,
                label: date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }),
                dayName: DAY_NAMES_FULL[dayIndex] || ''
            });
        }

        return dates;
    }, []);

    const handleReschedule = () => {
        if (!editingWorkout || !selectedNewDate) return;

        rescheduleWorkout(editingWorkout.id, selectedNewDate);
        setEditingWorkout(null);
        setSelectedNewDate(null);
    };

    const handleDelete = () => {
        if (!editingWorkout) return;

        const isRecurring = !!editingWorkout.routineId && routines.some(r => r.id === editingWorkout.routineId && r.scheduleType);

        if (isRecurring) {
            Alert.alert(
                t('workout.schedule.deleteRecurringTitle', 'Eliminar Entreno Recurrente'),
                t('workout.schedule.deleteRecurringMessage', 'Este entrenamiento es parte de una rutina programada. ¿Qué deseas eliminar?'),
                [
                    { text: t('common.cancel', 'Cancelar'), style: 'cancel' },
                    {
                        text: t('workout.schedule.onlyThis', 'Solo este'),
                        onPress: () => {
                            removeWorkoutFromSchedule(editingWorkout.id);
                            setEditingWorkout(null);
                        }
                    },
                    {
                        text: t('workout.schedule.allFuture', 'Todos los futuros'),
                        style: 'destructive',
                        onPress: () => {
                            const { removeFutureWorkoutsOfRoutine } = useWeeklyScheduleStore.getState();
                            const { updateRoutine } = useSavedRoutinesStore.getState();

                            // 1. Remove from schedule store
                            removeFutureWorkoutsOfRoutine(editingWorkout.routineId);

                            // 2. Update routine to stop scheduling
                            updateRoutine(editingWorkout.routineId, {
                                scheduleType: null,
                                scheduleDays: [],
                                scheduleInterval: undefined
                            });

                            setEditingWorkout(null);
                            Alert.alert(t('workout.schedule.updated', 'Programación Actualizada'), t('workout.schedule.futureRemoved', 'Se han eliminado los entrenamientos futuros de esta rutina.'));
                        }
                    }
                ]
            );
        } else {
            Alert.alert(
                t('workout.schedule.deleteTitle', 'Eliminar Entreno'),
                t('workout.schedule.deleteMessage', '¿Seguro que quieres quitar este entreno de la agenda?'),
                [
                    { text: t('common.cancel', 'Cancelar'), style: 'cancel' },
                    {
                        text: t('common.delete', 'Eliminar'),
                        style: 'destructive',
                        onPress: () => {
                            removeWorkoutFromSchedule(editingWorkout.id);
                            setEditingWorkout(null);
                        }
                    }
                ]
            );
        }
    };

    return (
        <ScreenWrapper headerTitle={t('workout.schedule.title', 'Mi Agenda')} scrollable={true}>
            <View className="p-4">
                {/* Weekly Progress Mini */}
                {weeklyProgress.scheduled > 0 && (
                    <Card className="mb-6 overflow-hidden border-0">
                        <LinearGradient
                            colors={isDark ? ['#1e293b', '#0f172a'] : ['#f8fafc', '#f1f5f9']}
                            className="p-4"
                        >
                            <View className="flex-row justify-between items-center">
                                <View className="flex-row items-center">
                                    <View className="bg-green-500/10 p-2 rounded-lg mr-3">
                                        <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
                                    </View>
                                    <View>
                                        <AccessibleText variant="caption" weight="medium" className="text-text-secondary">
                                            {t('workout.schedule.weeklyProgress', 'Progreso Semanal')}
                                        </AccessibleText>
                                        <AccessibleText variant="h3" weight="bold" className="text-text">
                                            {weeklyProgress.completed} / {weeklyProgress.scheduled}
                                        </AccessibleText>
                                    </View>
                                </View>
                                <View className="items-end">
                                    <AccessibleText weight="bold" className="text-green-500">
                                        {Math.round((weeklyProgress.completed / (weeklyProgress.scheduled || 1)) * 100)}%
                                    </AccessibleText>
                                </View>
                            </View>
                        </LinearGradient>
                    </Card>
                )}

                {groupedSchedule.length === 0 ? (
                    <EmptyState
                        icon="calendar-outline"
                        title={t('workout.schedule.emptyTitle', 'No tienes entrenamientos agendados.')}
                        description={t('workout.schedule.emptySubtitle', 'Adopta un plan predefinido o genera uno nuevo para ver tu agenda aquí.')}
                        actionLabel={t('workout.schedule.viewPlans', 'Ver Planes')}
                        onAction={() => router.push('/workout/plans')}
                    />
                ) : (
                    groupedSchedule.map(([weekStart, workouts], index) => (
                        <View key={weekStart} className="mb-8">
                            <View className="flex-row items-center mb-4 px-1">
                                <View className="bg-primary w-1.5 h-6 rounded-full mr-3" />
                                <AccessibleText weight="bold" variant="h3" className="text-primary uppercase tracking-widest">
                                    {t('workout.schedule.week', 'Semana')} {index + 1}
                                </AccessibleText>
                                <AccessibleText variant="caption" className="text-text-muted ml-auto">
                                    {t('workout.schedule.starts', 'Inicia')}: {formatSpanishDate(weekStart, { day: 'numeric', month: 'short' })}
                                </AccessibleText>
                            </View>

                            {workouts.map((workout) => {
                                const routine = routines.find(r => r.id === workout.routineId);
                                const isToday = workout.date === getLocalDateString();

                                return (
                                    <Card
                                        key={workout.id}
                                        className={`mb-4 overflow-hidden border-0 ${isToday ? 'ring-2 ring-primary/50' : ''}`}
                                    >
                                        <TouchableOpacity
                                            onPress={() => router.push(`/workout/active?routineId=${workout.routineId}`)}
                                            activeOpacity={0.7}
                                            {...a11y.button(
                                                `${routine?.name || workout.routineName}. ${formatDate(workout.date)}. ${workout.completed ? 'Completado' : 'Pendiente'}.`,
                                                'Toca para comenzar este entrenamiento'
                                            )}
                                        >
                                            <LinearGradient
                                                colors={isToday
                                                    ? (isDark ? ['rgba(59, 130, 246, 0.15)', 'rgba(30, 41, 59, 0.5)'] : ['rgba(59, 130, 246, 0.05)', 'rgba(255, 255, 255, 0.9)'])
                                                    : (isDark ? ['rgba(30, 41, 59, 0.4)', 'rgba(15, 23, 42, 0.5)'] : ['#ffffff', '#f8fafc'])
                                                }
                                                className="p-4"
                                            >
                                                <View className="flex-row justify-between items-center">
                                                    <View className="flex-1">
                                                        <View className="flex-row items-center mb-2">
                                                            <AccessibleText variant="caption" weight="bold" className="text-text-muted uppercase mr-2">
                                                                {formatDate(workout.date)}
                                                            </AccessibleText>
                                                            {isToday && (
                                                                <View className="bg-primary px-2 py-0.5 rounded-full">
                                                                    <AccessibleText weight="bold" className="text-white text-[9px]">{t('common.today', 'HOY')}</AccessibleText>
                                                                </View>
                                                            )}
                                                            {workout.completed && (
                                                                <View className="bg-success/10 px-2 py-0.5 rounded-full ml-2">
                                                                    <AccessibleText weight="bold" className="text-success text-[9px]">{t('common.completed', 'COMPLETADO')}</AccessibleText>
                                                                </View>
                                                            )}
                                                        </View>
                                                        <AccessibleText variant="h3" weight="bold" className="text-text mb-1">
                                                            {routine?.name || workout.routineName}
                                                        </AccessibleText>
                                                        <View className="flex-row items-center">
                                                            <Ionicons name="fitness-outline" size={12} color={colors.textMuted} />
                                                            <AccessibleText variant="caption" className="text-text-secondary ml-1">
                                                                {routine?.exercises.length || 0} {t('workout.exercises', 'ejercicios')} • {routine?.exercises.reduce((acc, ex) => acc + (ex.plannedSets || 3), 0) || 0} {t('workout.sets', 'series')}
                                                            </AccessibleText>
                                                        </View>
                                                    </View>

                                                    <View className="flex-row items-center gap-3">
                                                        <TouchableOpacity
                                                            onPress={(e) => {
                                                                e.stopPropagation();
                                                                setEditingWorkout(workout);
                                                                setSelectedNewDate(workout.date);
                                                            }}
                                                            className="w-10 h-10 rounded-xl items-center justify-center bg-surface-highlight/30"
                                                            {...a11y.button('Reprogramar', 'Cambia la fecha de este entrenamiento')}
                                                        >
                                                            <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
                                                        </TouchableOpacity>

                                                        <TouchableOpacity
                                                            onPress={(e) => {
                                                                e.stopPropagation();
                                                                router.push(`/workout/active?routineId=${workout.routineId}`);
                                                            }}
                                                            className={`w-10 h-10 rounded-xl items-center justify-center ${workout.completed ? 'bg-success/10' : 'bg-primary/10'}`}
                                                            {...a11y.button('Comenzar', 'Inicia este entrenamiento ahora')}
                                                        >
                                                            <Ionicons
                                                                name={workout.completed ? "checkmark-circle" : "play"}
                                                                size={24}
                                                                color={workout.completed ? colors.success : colors.primary}
                                                            />
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    </Card>
                                );
                            })}
                        </View>
                    ))
                )}
                <View className="h-10" />
            </View>

            {/* Reschedule Modal */}
            <Modal
                visible={editingWorkout !== null}
                transparent
                animationType="slide"
                onRequestClose={() => setEditingWorkout(null)}
            >
                <View className="flex-1 justify-end bg-black/60">
                    <View
                        className="rounded-t-3xl p-6 bg-background"
                    >
                        <View className="flex-row justify-between items-center mb-6">
                            <AccessibleText variant="h2" weight="bold" className="text-text">
                                {t('workout.schedule.changeDate', 'Cambiar Fecha')}
                            </AccessibleText>
                            <TouchableOpacity
                                onPress={() => setEditingWorkout(null)}
                                {...a11y.button('Cerrar', 'Cierra el selector de fecha')}
                            >
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        {editingWorkout && (
                            <View
                                className="rounded-xl p-4 mb-6 bg-surface-highlight/30"
                            >
                                <AccessibleText variant="caption" weight="bold" className="text-text-muted uppercase mb-1">
                                    {t('workout.schedule.workout', 'ENTRENAMIENTO')}
                                </AccessibleText>
                                <AccessibleText variant="h3" weight="bold" className="text-text">
                                    {routines.find(r => r.id === editingWorkout.routineId)?.name || editingWorkout.routineName}
                                </AccessibleText>
                            </View>
                        )}

                        <AccessibleText weight="medium" className="text-text-secondary mb-4">
                            {t('workout.schedule.selectNewDate', 'Selecciona nueva fecha:')}
                        </AccessibleText>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8">
                            <View className="flex-row gap-3">
                                {availableDates.map((d) => (
                                    <TouchableOpacity
                                        key={d.date}
                                        onPress={() => setSelectedNewDate(d.date)}
                                        className={`px-5 py-4 rounded-2xl items-center border ${selectedNewDate === d.date
                                            ? 'bg-primary border-primary'
                                            : 'bg-surface-highlight/30 border-white/5'
                                            }`}
                                        style={{ minWidth: 90 }}
                                        {...a11y.button(`Seleccionar ${d.label}`, `Toca para mover el entrenamiento al ${d.label}`)}
                                    >
                                        <AccessibleText variant="caption" weight="bold" className={`uppercase mb-1 ${selectedNewDate === d.date ? 'text-white/80' : 'text-text-muted'}`}>
                                            {d.dayName.substring(0, 3)}
                                        </AccessibleText>
                                        <AccessibleText variant="h3" weight="bold" className={`${selectedNewDate === d.date ? 'text-white' : 'text-text'}`}>
                                            {d.label.split(',')[0]}
                                        </AccessibleText>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>

                        <View className="flex-row gap-4">
                            <TouchableOpacity
                                onPress={handleDelete}
                                className="flex-1 py-4 rounded-2xl items-center border border-error/30 bg-error/10"
                                {...a11y.button('Eliminar', 'Quita este entrenamiento de la agenda')}
                            >
                                <AccessibleText weight="bold" className="text-error">{t('common.delete', 'Eliminar')}</AccessibleText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleReschedule}
                                className="py-4 rounded-2xl items-center bg-primary shadow-lg shadow-primary/30"
                                style={{ flex: 2 }}
                                {...a11y.button('Guardar Cambios', 'Confirma la nueva fecha para el entrenamiento')}
                            >
                                <AccessibleText weight="bold" className="text-white">{t('common.saveChanges', 'Guardar Cambio')}</AccessibleText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScreenWrapper>
    );
}
