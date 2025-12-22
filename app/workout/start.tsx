import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Link } from 'expo-router';
import { useSavedRoutinesStore, SavedRoutine } from '@/store/savedRoutinesStore';
import { WorkoutStreakCard } from '@/components/WorkoutStreakBadge';
import { RecoverySuggestionCard } from '@/components/RecoverySuggestionCard';
import { ScheduleConfigurator } from '@/components/ScheduleConfigurator';

export default function StartWorkoutScreen() {
    const router = useRouter();
    const { routines, duplicateRoutine, updateRoutine } = useSavedRoutinesStore();

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
            startDate: routine.scheduleStartDate || new Date().toISOString().split('T')[0]
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
            Alert.alert('Programación Actualizada', 'La rutina se ha programado correctamente.');
        } else {
            // Disable schedule
            updateRoutine(schedulingRoutineId, {
                scheduleType: null,
                scheduleDays: [],
                scheduleInterval: undefined,
                scheduleStartDate: undefined
            });
            Alert.alert('Programación Eliminada', 'La rutina ya no está programada.');
        }
        setSchedulingRoutineId(null);
    };

    const renderItem = ({ item }: { item: SavedRoutine }) => (
        <View className="bg-gray-800 rounded-xl mb-3 border border-gray-700 flex-row items-center overflow-hidden">
            <TouchableOpacity
                className="flex-1 p-4 active:bg-gray-750"
                onPress={() => router.push(`/workout/active?routineId=${item.id}`)}
            >
                <View className="flex-row items-center gap-2 mb-1">
                    <Text className="text-white font-bold text-xl">{item.name}</Text>
                    {item.scheduleType && (
                        <View className="bg-blue-500/20 px-2 py-0.5 rounded text-xs">
                            <Text className="text-blue-400 text-[10px] font-bold uppercase">
                                {item.scheduleType === 'specific_days' ? 'Semanal' : 'Intervalo'}
                            </Text>
                        </View>
                    )}
                </View>
                <Text className="text-gray-400 text-sm">{item.exercises.length} ejercicios</Text>
            </TouchableOpacity>

            <View className="flex-row border-l border-gray-700">
                <TouchableOpacity
                    onPress={() => router.push(`/routines/create?routineId=${item.id}`)}
                    className="p-4 active:bg-gray-750 border-r border-gray-700"
                >
                    <Ionicons name="pencil-outline" size={20} color="#9ca3af" />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => handleOpenSchedule(item)}
                    className="p-4 active:bg-gray-750 border-r border-gray-700"
                >
                    <Ionicons name="calendar-outline" size={20} color={item.scheduleType ? "#60a5fa" : "#9ca3af"} />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => {
                        duplicateRoutine(item.id);
                    }}
                    className="p-4 active:bg-gray-750"
                >
                    <Ionicons name="copy-outline" size={20} color="#9ca3af" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-900">
            {/* Header */}
            <View className="flex-row items-center p-4 border-b border-gray-800">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold">Iniciar Entreno</Text>
            </View>

            <View className="flex-1 p-4">
                {/* Recovery Suggestion Card */}
                <RecoverySuggestionCard />

                <Text className="text-gray-400 mb-4 text-sm">Selecciona una rutina para comenzar</Text>

                {routines.length === 0 ? (
                    <View className="flex-1 items-center justify-center">
                        <Ionicons name="barbell-outline" size={64} color="#4b5563" />
                        <Text className="text-gray-500 text-lg mt-4">No hay rutinas creadas</Text>
                        <Text className="text-gray-600 text-sm mt-2 text-center px-8">
                            Crea tu primera rutina para comenzar a entrenar
                        </Text>
                        <Link href="/routines/create" asChild>
                            <TouchableOpacity className="bg-blue-600 px-6 py-3 rounded-xl mt-6 active:bg-blue-700">
                                <Text className="text-white font-bold">Crear Rutina</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                ) : (
                    <>
                        {/* Action Buttons */}
                        <View className="flex-row gap-3 mb-4">
                            <Link href="/routines/create" asChild>
                                <TouchableOpacity className="flex-1 bg-blue-600 p-4 rounded-xl flex-row items-center justify-center active:bg-blue-700">
                                    <Ionicons name="add" size={20} color="white" />
                                    <Text className="text-white font-bold ml-2">Crear Rutina</Text>
                                </TouchableOpacity>
                            </Link>
                            <Link href="/workout/plans" asChild>
                                <TouchableOpacity className="flex-1 bg-gray-800 border border-gray-700 p-4 rounded-xl flex-row items-center justify-center active:bg-gray-700">
                                    <Ionicons name="layers" size={20} color="#60a5fa" />
                                    <Text className="text-blue-400 font-bold ml-2">Ver Planes</Text>
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
                    <View className="bg-gray-900 rounded-t-3xl p-6 border-t border-gray-800 h-[70%]">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-white text-xl font-bold">Programar Rutina</Text>
                            <TouchableOpacity onPress={() => setSchedulingRoutineId(null)}>
                                <Ionicons name="close" size={24} color="#9ca3af" />
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
                            className="bg-blue-600 p-4 rounded-xl items-center mt-4"
                        >
                            <Text className="text-white font-bold text-lg">Guardar Cambios</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
