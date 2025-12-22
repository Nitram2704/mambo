import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
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

export default function WorkoutScheduleScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { theme } = useAppTheme();
    const isDark = theme === 'dark';
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
        <ScreenWrapper headerTitle={t('workout.schedule.title', 'Mi Agenda')}>
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
                                        <Text className="text-xs font-medium" style={{ color: Colors[theme].textSecondary }}>
                                            {t('workout.schedule.weeklyProgress', 'Progreso Semanal')}
                                        </Text>
                                        <Text className="text-xl font-bold" style={{ color: Colors[theme].text }}>
                                            {weeklyProgress.completed} / {weeklyProgress.scheduled}
                                        </Text>
                                    </View>
                                </View>
                                <View className="items-end">
                                    <Text className="text-sm font-bold text-green-500">
                                        {Math.round((weeklyProgress.completed / (weeklyProgress.scheduled || 1)) * 100)}%
                                    </Text>
                                </View>
                            </View>
                        </LinearGradient>
                    </Card>
                )}

                {groupedSchedule.length === 0 ? (
                    <View className="flex-1 items-center justify-center py-20">
                        <Ionicons name="calendar-outline" size={80} color={isDark ? '#4b5563' : '#cbd5e1'} />
                        <Text className="text-lg mt-4 text-center font-bold" style={{ color: Colors[theme].text }}>
                            {t('workout.schedule.emptyTitle', 'No tienes entrenamientos agendados.')}
                        </Text>
                        <Text className="text-sm mt-2 text-center px-10" style={{ color: Colors[theme].textSecondary }}>
                            {t('workout.schedule.emptySubtitle', 'Adopta un plan predefinido o genera uno nuevo.')}
                        </Text>
                        <TouchableOpacity
                            onPress={() => router.push('/workout/plans')}
                            className="bg-blue-600 px-8 py-4 rounded-2xl mt-8 shadow-lg shadow-blue-500/30"
                        >
                            <Text className="text-white font-bold text-lg">{t('workout.schedule.viewPlans', 'Ver Planes')}</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    groupedSchedule.map(([weekStart, workouts], index) => (
                        <View key={weekStart} className="mb-8">
                            <View className="flex-row items-center mb-4 px-1">
                                <View className="bg-blue-500 w-1.5 h-6 rounded-full mr-3" />
                                <Text className="font-bold text-lg uppercase tracking-widest" style={{ color: Colors[theme].primary }}>
                                    {t('workout.schedule.week', 'Semana')} {index + 1}
                                </Text>
                                <Text className="text-xs ml-auto" style={{ color: Colors[theme].textMuted }}>
                                    {t('workout.schedule.starts', 'Inicia')}: {formatSpanishDate(weekStart, { day: 'numeric', month: 'short' })}
                                </Text>
                            </View>

                            {workouts.map((workout) => {
                                const routine = routines.find(r => r.id === workout.routineId);
                                const isToday = workout.date === getLocalDateString();

                                return (
                                    <Card
                                        key={workout.id}
                                        className={`mb-4 overflow-hidden border-0 ${isToday ? 'ring-2 ring-blue-500/50' : ''}`}
                                    >
                                        <TouchableOpacity
                                            onPress={() => router.push(`/workout/active?routineId=${workout.routineId}`)}
                                            activeOpacity={0.7}
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
                                                            <Text className="text-[10px] font-bold uppercase mr-2" style={{ color: Colors[theme].textMuted }}>
                                                                {formatDate(workout.date)}
                                                            </Text>
                                                            {isToday && (
                                                                <View className="bg-blue-500 px-2 py-0.5 rounded-full">
                                                                    <Text className="text-white text-[9px] font-bold">{t('common.today', 'HOY')}</Text>
                                                                </View>
                                                            )}
                                                            {workout.completed && (
                                                                <View className="bg-green-500/10 px-2 py-0.5 rounded-full ml-2">
                                                                    <Text className="text-green-500 text-[9px] font-bold">{t('common.completed', 'COMPLETADO')}</Text>
                                                                </View>
                                                            )}
                                                        </View>
                                                        <Text className="text-lg font-bold mb-1" style={{ color: Colors[theme].text }}>
                                                            {routine?.name || workout.routineName}
                                                        </Text>
                                                        <View className="flex-row items-center">
                                                            <Ionicons name="fitness-outline" size={12} color={Colors[theme].textMuted} />
                                                            <Text className="text-xs ml-1" style={{ color: Colors[theme].textSecondary }}>
                                                                {routine?.exercises.length || 0} {t('workout.exercises', 'ejercicios')} • {routine?.exercises.reduce((acc, ex) => acc + (ex.plannedSets || 3), 0) || 0} {t('workout.sets', 'series')}
                                                            </Text>
                                                        </View>
                                                    </View>

                                                    <View className="flex-row items-center gap-3">
                                                        <TouchableOpacity
                                                            onPress={(e) => {
                                                                e.stopPropagation();
                                                                setEditingWorkout(workout);
                                                                setSelectedNewDate(workout.date);
                                                            }}
                                                            className="w-10 h-10 rounded-xl items-center justify-center"
                                                            style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }}
                                                        >
                                                            <Ionicons name="calendar-outline" size={20} color={Colors[theme].textSecondary} />
                                                        </TouchableOpacity>

                                                        <TouchableOpacity
                                                            onPress={(e) => {
                                                                e.stopPropagation();
                                                                router.push(`/workout/active?routineId=${workout.routineId}`);
                                                            }}
                                                            className="w-10 h-10 rounded-xl items-center justify-center"
                                                            style={{ backgroundColor: workout.completed ? 'rgba(34, 197, 94, 0.1)' : 'rgba(59, 130, 246, 0.1)' }}
                                                        >
                                                            <Ionicons
                                                                name={workout.completed ? "checkmark-circle" : "play"}
                                                                size={24}
                                                                color={workout.completed ? "#22c55e" : "#3b82f6"}
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
                        className="rounded-t-3xl p-6"
                        style={{ backgroundColor: Colors[theme].background }}
                    >
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold" style={{ color: Colors[theme].text }}>
                                {t('workout.schedule.changeDate', 'Cambiar Fecha')}
                            </Text>
                            <TouchableOpacity onPress={() => setEditingWorkout(null)}>
                                <Ionicons name="close" size={24} color={Colors[theme].text} />
                            </TouchableOpacity>
                        </View>

                        {editingWorkout && (
                            <View
                                className="rounded-xl p-4 mb-6"
                                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }}
                            >
                                <Text className="text-[10px] font-bold uppercase mb-1" style={{ color: Colors[theme].textMuted }}>
                                    {t('workout.schedule.workout', 'ENTRENAMIENTO')}
                                </Text>
                                <Text className="font-bold text-lg" style={{ color: Colors[theme].text }}>
                                    {routines.find(r => r.id === editingWorkout.routineId)?.name || editingWorkout.routineName}
                                </Text>
                            </View>
                        )}

                        <Text className="text-sm mb-4 font-medium" style={{ color: Colors[theme].textSecondary }}>
                            {t('workout.schedule.selectNewDate', 'Selecciona nueva fecha:')}
                        </Text>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8">
                            <View className="flex-row gap-3">
                                {availableDates.map((d) => (
                                    <TouchableOpacity
                                        key={d.date}
                                        onPress={() => setSelectedNewDate(d.date)}
                                        className={`px-5 py-4 rounded-2xl items-center border ${selectedNewDate === d.date
                                            ? 'bg-blue-600 border-blue-600'
                                            : isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'
                                            }`}
                                        style={{ minWidth: 90 }}
                                    >
                                        <Text className={`text-[10px] font-bold uppercase mb-1 ${selectedNewDate === d.date ? 'text-blue-100' : 'text-gray-500'
                                            }`}>
                                            {d.dayName.substring(0, 3)}
                                        </Text>
                                        <Text className={`text-lg font-bold ${selectedNewDate === d.date ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                                            }`}>
                                            {d.label.split(',')[0]}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>

                        <View className="flex-row gap-4">
                            <TouchableOpacity
                                onPress={handleDelete}
                                className="flex-1 py-4 rounded-2xl items-center border border-red-500/30"
                                style={{ backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)' }}
                            >
                                <Text className="text-red-500 font-bold">{t('common.delete', 'Eliminar')}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleReschedule}
                                className="py-4 rounded-2xl items-center bg-blue-600 shadow-lg shadow-blue-500/30"
                                style={{ flex: 2 }}
                            >
                                <Text className="text-white font-bold">{t('common.saveChanges', 'Guardar Cambio')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScreenWrapper>
    );
}
