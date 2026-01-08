import React, { useState } from 'react';
import { View, TouchableOpacity, FlatList, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Link } from 'expo-router';
import { useSavedRoutinesStore, SavedRoutine } from '@/store/savedRoutinesStore';
import { RoutineCard } from '@/components/workout/RoutineCard';
import { RecoverySuggestionCard } from '@/components/RecoverySuggestionCard';
import { ScheduleConfigurator } from '@/components/ScheduleConfigurator';
import { getLocalDateString } from '@/utils/dateUtils';
import Animated from 'react-native-reanimated';
import { useUIStore } from '@/store/uiStore';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { AccessibleText } from '@/components/ui/AccessibleText';
import { a11y } from '@/utils/accessibility';
import { Colors } from '@/constants/Colors';
import { useActiveWorkoutStore } from '@/store/activeWorkoutStore';
import { useAppTheme } from '@/hooks/use-app-theme';

export default function StartWorkoutScreen() {
    const router = useRouter();
    const { routines, duplicateRoutine, updateRoutine } = useSavedRoutinesStore();
    const { startWorkout } = useActiveWorkoutStore();
    const { showToast } = useUIStore();
    const { theme } = useAppTheme();
    const colors = Colors[theme];

    // Scheduling Modal State
    const [schedulingRoutineId, setSchedulingRoutineId] = useState<string | null>(null);
    const [tempSchedule, setTempSchedule] = useState<{
        type: 'specific_days' | 'interval';
        days?: number[];
        interval?: number;
        startDate?: string;
    } | null>(null);
    const [isScheduleEnabled, setIsScheduleEnabled] = useState(false);

    const handleOpenSchedule = (routine: SavedRoutine) => {
        setSchedulingRoutineId(routine.id);
        setIsScheduleEnabled(!!routine.scheduleType);
        setTempSchedule({
            type: routine.scheduleType || 'specific_days',
            days: routine.scheduleDays || [],
            interval: routine.scheduleInterval || 4,
            startDate: routine.scheduleStartDate || getLocalDateString()
        });
    };

    const handleSaveSchedule = () => {
        if (!schedulingRoutineId) return;

        if (isScheduleEnabled && tempSchedule) {
            updateRoutine(schedulingRoutineId, {
                scheduleType: tempSchedule.type,
                scheduleDays: tempSchedule.type === 'specific_days' ? tempSchedule.days : undefined,
                scheduleInterval: tempSchedule.type === 'interval' ? tempSchedule.interval : undefined,
                scheduleStartDate: tempSchedule.startDate
            });
            showToast('Programación Actualizada', 'success');
        } else {
            // Disable schedule
            updateRoutine(schedulingRoutineId, {
                scheduleType: null,
                scheduleDays: [],
                scheduleInterval: undefined,
                scheduleStartDate: undefined
            });
            showToast('Programación Eliminada', 'info');
        }
        setSchedulingRoutineId(null);
    };

    const renderItem = ({ item }: { item: SavedRoutine }) => (
        <Animated.View
            // @ts-ignore - sharedTransitionTag is valid in Reanimated 3+
            sharedTransitionTag={`routine-${item.id}`}
            className="mb-4"
        >
            <RoutineCard
                title={item.name}
                duration={item.exercises.reduce((acc, ex) => acc + (ex.restTime || 120) + (ex.plannedSets || 3) * 45, 0) / 60 | 0} // Estimate: rest + 45s per set
                difficulty="intermediate" // Default for now
                exercises={item.exercises.map(ex => ({
                    id: ex.id,
                    name: ex.name,
                    muscleGroup: ex.muscleGroup,
                    // TODO: Add image mapping from exercise ID
                }))}
                onStart={() => {
                    startWorkout(item);
                    router.push('/workout/active');
                }}
                onPress={() => {
                    // For now, just start. Later: Show details modal
                    startWorkout(item);
                    router.push('/workout/active');
                }}
            />

            {/* Actions Row */}
            <View className="flex-row justify-end gap-2 px-2 -mt-2">
                <TouchableOpacity
                    onPress={() => router.push(`/routines/create?routineId=${item.id}`)}
                    className="p-2 bg-surface-highlight/50 rounded-full border border-white/5"
                    {...a11y.button('Editar rutina', 'Modifica los ejercicios de esta rutina')}
                >
                    <Ionicons name="pencil-outline" size={18} color={colors.textMuted} />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => handleOpenSchedule(item)}
                    className={`p-2 rounded-full border border-white/5 ${item.scheduleType ? 'bg-primary/10' : 'bg-surface-highlight/50'}`}
                    {...a11y.button('Programar rutina', 'Configura los días o intervalos para esta rutina')}
                >
                    <Ionicons name="calendar-outline" size={18} color={item.scheduleType ? colors.primary : colors.textMuted} />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => duplicateRoutine(item.id)}
                    className="p-2 bg-surface-highlight/50 rounded-full border border-white/5"
                    {...a11y.button('Duplicar rutina', 'Crea una copia de esta rutina')}
                >
                    <Ionicons name="copy-outline" size={18} color={colors.textMuted} />
                </TouchableOpacity>
            </View>
        </Animated.View>
    );

    return (
        <ScreenWrapper
            header={
                <View className="flex-row items-center p-4 border-b border-border/10 bg-background">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="mr-4"
                        {...a11y.button('Volver', 'Regresa a la pantalla anterior')}
                    >
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <AccessibleText variant="h2" weight="bold" className="text-text">Iniciar Entreno</AccessibleText>
                </View>
            }
        >
            <View className="flex-1 p-4">
                {/* Recovery Suggestion Card */}
                <RecoverySuggestionCard />

                <AccessibleText variant="caption" className="text-text-secondary mb-4">Selecciona una rutina para comenzar</AccessibleText>

                {routines.length === 0 ? (
                    <EmptyState
                        icon="barbell-outline"
                        title="No hay rutinas creadas"
                        description="Crea tu primera rutina para comenzar a entrenar y llevar un seguimiento de tu progreso."
                        actionLabel="Crear Rutina"
                        onAction={() => router.push('/routines/create')}
                    />
                ) : (
                    <>
                        {/* Action Buttons */}
                        <View className="flex-row gap-3 mb-4">
                            <Link href="/routines/create" asChild>
                                <TouchableOpacity
                                    className="flex-1 bg-primary p-4 rounded-xl flex-row items-center justify-center active:bg-primary/80"
                                    {...a11y.button('Crear Rutina', 'Crea una nueva rutina personalizada')}
                                >
                                    <Ionicons name="add" size={20} color="white" />
                                    <AccessibleText weight="bold" className="text-white ml-2">Crear Rutina</AccessibleText>
                                </TouchableOpacity>
                            </Link>
                            <Link href="/workout/plans" asChild>
                                <TouchableOpacity
                                    className="flex-1 bg-surface border border-border/10 p-4 rounded-xl flex-row items-center justify-center active:bg-surface-highlight/10"
                                    {...a11y.button('Ver Planes', 'Explora planes de entrenamiento predefinidos')}
                                >
                                    <Ionicons name="layers" size={20} color={colors.primary} />
                                    <AccessibleText weight="bold" className="text-primary ml-2">Ver Planes</AccessibleText>
                                </TouchableOpacity>
                            </Link>
                        </View>

                        {/* Routines List */}
                        <FlatList
                            data={routines}
                            keyExtractor={(item) => item.id}
                            renderItem={renderItem}
                            contentContainerStyle={{ paddingBottom: 20 }}
                        />
                    </>
                )}
            </View>

            {/* Schedule Modal */}
            <Modal
                visible={!!schedulingRoutineId}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setSchedulingRoutineId(null)}
            >
                <View className="flex-1 bg-black/80 justify-end">
                    <View className="bg-surface rounded-t-3xl p-6 border-t border-border/10 h-[70%]">
                        <View className="flex-row justify-between items-center mb-6">
                            <AccessibleText variant="h2" weight="bold" className="text-text">Programar Rutina</AccessibleText>
                            <TouchableOpacity
                                onPress={() => setSchedulingRoutineId(null)}
                                {...a11y.button('Cerrar', 'Cierra el configurador de programación')}
                            >
                                <Ionicons name="close" size={24} color={colors.textMuted} />
                            </TouchableOpacity>
                        </View>

                        <ScheduleConfigurator
                            enabled={isScheduleEnabled}
                            onToggle={setIsScheduleEnabled}
                            initialSchedule={tempSchedule || undefined}
                            onScheduleChange={setTempSchedule}
                        />

                        <View className="flex-1" />

                        <TouchableOpacity
                            onPress={handleSaveSchedule}
                            className="bg-primary p-4 rounded-xl items-center mt-4"
                            {...a11y.button('Guardar Cambios', 'Guarda la configuración de programación para esta rutina')}
                        >
                            <AccessibleText weight="bold" variant="h3" className="text-white">Guardar Cambios</AccessibleText>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScreenWrapper>
    );
}
