import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useRoutineStore } from '@/store/routineStore';
import { useSavedRoutinesStore } from '@/store/savedRoutinesStore';
import { ScheduleConfigurator } from '@/components/ScheduleConfigurator';

export default function CreateRoutineScreen() {
    const router = useRouter();
    const { routineId } = useLocalSearchParams<{ routineId: string }>();
    const isEditing = !!routineId;

    const {
        name, setName, exercises, removeExercise, updateRestTime,
        addSet, removeSet, linkSuperset, unlinkSuperset, resetRoutine, loadRoutine
    } = useRoutineStore();

    const { addRoutine, updateRoutine, routines } = useSavedRoutinesStore();

    const [expandedExercise, setExpandedExercise] = useState<string | null>(null);

    // Schedule State
    const [isScheduled, setIsScheduled] = useState(false);
    const [scheduleType, setScheduleType] = useState<'specific_days' | 'interval'>('specific_days');
    const [selectedDays, setSelectedDays] = useState<number[]>([]);
    const [intervalDays, setIntervalDays] = useState<string>('4');
    const [startDate, setStartDate] = useState(new Date());

    // Load routine data if editing
    useEffect(() => {
        if (isEditing && routineId) {
            const routine = routines.find(r => r.id === routineId);
            if (routine) {
                loadRoutine(routine.name, routine.exercises);
                setIsScheduled(!!routine.scheduleType);
                if (routine.scheduleType) {
                    setScheduleType(routine.scheduleType);
                    if (routine.scheduleDays) setSelectedDays(routine.scheduleDays);
                    if (routine.scheduleInterval) setIntervalDays(routine.scheduleInterval.toString());
                    if (routine.scheduleStartDate) setStartDate(new Date(routine.scheduleStartDate));
                }
            }
        } else {
            resetRoutine();
        }
    }, [isEditing, routineId]);

    const handleSave = async () => {
        if (!name.trim()) {
            alert('Por favor, ingresa un nombre para la rutina');
            return;
        }

        if (exercises.length === 0) {
            alert('Por favor, añade al menos un ejercicio');
            return;
        }

        const scheduleData = isScheduled ? {
            type: scheduleType,
            days: scheduleType === 'specific_days' ? selectedDays : undefined,
            interval: scheduleType === 'interval' ? parseInt(intervalDays) : undefined,
            startDate: startDate.toISOString().split('T')[0]
        } : undefined;

        try {
            if (isEditing && routineId) {
                await updateRoutine(routineId, {
                    name,
                    exercises,
                    scheduleType: scheduleData?.type || null,
                    scheduleDays: scheduleData?.days || [],
                    scheduleInterval: scheduleData?.interval,
                    scheduleStartDate: scheduleData?.startDate
                });
                alert(`Rutina "${name}" actualizada correctamente`);
            } else {
                await addRoutine(name, exercises, scheduleData);
                alert(`Rutina "${name}" guardada con ${exercises.length} ejercicios`);
            }
            resetRoutine();
            router.back();
        } catch (error) {
            console.error('Error saving routine:', error);
            alert('Hubo un error al guardar la rutina. Por favor intenta de nuevo.');
        }
    };

    const toggleExpand = (exerciseId: string) => {
        setExpandedExercise(expandedExercise === exerciseId ? null : exerciseId);
    };

    const formatRestTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        if (secs === 0) return `${mins}min`;
        return `${mins}:${secs.toString().padStart(2, '0')}min`;
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-900">
            {/* Header */}
            <View className="flex-row items-center justify-between p-4 border-b border-gray-800">
                <TouchableOpacity onPress={() => router.back()}>
                    <Text className="text-gray-400 text-lg">Cancelar</Text>
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold">
                    {isEditing ? 'Editar Rutina' : 'Nueva Rutina'}
                </Text>
                <TouchableOpacity onPress={handleSave}>
                    <Text className="text-blue-500 text-lg font-bold">Guardar</Text>
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 p-4">
                {/* Routine Name Input */}
                <View className="mb-6">
                    <Text className="text-gray-400 mb-2 text-sm uppercase font-bold tracking-wider">Nombre de la Rutina</Text>
                    <TextInput
                        className="bg-gray-800 text-white p-4 rounded-xl text-lg border border-gray-700"
                        placeholder="Ej: Torso Hipertrofia"
                        placeholderTextColor="#6b7280"
                        value={name}
                        onChangeText={setName}
                    />
                </View>

                {/* Schedule Section */}
                <ScheduleConfigurator
                    enabled={isScheduled}
                    onToggle={setIsScheduled}
                    initialSchedule={{
                        type: scheduleType,
                        days: selectedDays,
                        interval: parseInt(intervalDays),
                        startDate: startDate.toISOString().split('T')[0]
                    }}
                    onScheduleChange={(schedule) => {
                        if (schedule) {
                            setScheduleType(schedule.type);
                            if (schedule.days) setSelectedDays(schedule.days);
                            if (schedule.interval) setIntervalDays(schedule.interval.toString());
                            if (schedule.startDate) setStartDate(new Date(schedule.startDate));
                        }
                    }}
                />

                {/* Exercises List */}
                <View className="mb-6">
                    <Text className="text-gray-400 mb-2 text-sm uppercase font-bold tracking-wider">
                        Ejercicios ({exercises.length})
                    </Text>

                    {exercises.length === 0 ? (
                        <View className="bg-gray-800/50 rounded-xl p-8 items-center justify-center border border-gray-700 border-dashed mb-4">
                            <Ionicons name="barbell-outline" size={48} color="#4b5563" />
                            <Text className="text-gray-500 mt-2 text-center">Aún no hay ejercicios</Text>
                        </View>
                    ) : (
                        <View className="mb-4">
                            {exercises.map((exercise, index) => (
                                <View
                                    key={exercise.id + index}
                                    className={`bg-gray-800 rounded-xl mb-2 border ${exercise.supersetGroup ? 'border-purple-500/50' : 'border-gray-700'}`}>
                                    {/* Superset Indicator */}
                                    {exercise.supersetGroup && (() => {
                                        const supersetExercises = exercises.filter(
                                            ex => ex.supersetGroup === exercise.supersetGroup
                                        );
                                        const currentIdxInSuperset = supersetExercises.findIndex(
                                            ex => ex.id === exercise.id
                                        );
                                        return (
                                            <View className="bg-purple-500/20 px-3 py-1.5 flex-row items-center gap-2 rounded-t-xl">
                                                <Ionicons name="link" size={14} color="#a855f7" />
                                                <Text className="text-purple-300 text-xs font-bold">
                                                    Superset {currentIdxInSuperset + 1}/{supersetExercises.length}
                                                </Text>
                                                <View className="flex-1" />
                                                <TouchableOpacity
                                                    onPress={() => unlinkSuperset(exercise.id)}
                                                    className="bg-purple-500/30 px-2 py-0.5 rounded"
                                                >
                                                    <Text className="text-purple-300 text-xs">Desvincular</Text>
                                                </TouchableOpacity>
                                            </View>
                                        );
                                    })()}
                                    {/* Exercise Header */}
                                    <TouchableOpacity
                                        onPress={() => toggleExpand(exercise.id)}
                                        className="p-4 flex-row items-center justify-between">
                                        <View className="flex-1">
                                            <Text className="text-white font-bold text-lg">{exercise.name}</Text>
                                            <Text className="text-gray-400 text-sm">{exercise.muscleGroup} • {exercise.equipment}</Text>
                                            {exercise.restTime && (
                                                <Text className="text-blue-400 text-xs mt-1">
                                                    {exercise.plannedSets || 1} sets • Descanso: {formatRestTime(exercise.restTime)}
                                                </Text>
                                            )}
                                        </View>
                                        <View className="flex-row gap-2">
                                            {/* Superset Link Button - only if not already in superset and not last exercise */}
                                            {!exercise.supersetGroup && index < exercises.length - 1 && (
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        const nextExercise = exercises[index + 1];
                                                        Alert.alert(
                                                            'Crear Superset',
                                                            `¿Vincular "${exercise.name}" con "${nextExercise.name}" como superset?`,
                                                            [
                                                                { text: 'Cancelar', style: 'cancel' },
                                                                { text: 'Vincular', onPress: () => linkSuperset(exercise.id, nextExercise.id) }
                                                            ]
                                                        );
                                                    }}
                                                    className="bg-purple-500/20 p-2 rounded-lg">
                                                    <Ionicons name="link" size={20} color="#a855f7" />
                                                </TouchableOpacity>
                                            )}
                                            <TouchableOpacity
                                                onPress={() => removeExercise(exercise.id)}
                                                className="bg-red-500/20 p-2 rounded-lg">
                                                <Ionicons name="trash-outline" size={20} color="#ef4444" />
                                            </TouchableOpacity>
                                            <Ionicons
                                                name={expandedExercise === exercise.id ? "chevron-up" : "chevron-down"}
                                                size={24}
                                                color="#9ca3af"
                                            />
                                        </View>
                                    </TouchableOpacity>

                                    {/* Expanded Configuration */}
                                    {expandedExercise === exercise.id && (
                                        <View className="px-4 pb-4 border-t border-gray-700 pt-4">
                                            {/* Rest Timer Input */}
                                            <View className="mb-4">
                                                <Text className="text-gray-400 text-sm mb-2">Tiempo de Descanso (segundos)</Text>
                                                <TextInput
                                                    className="bg-gray-700 text-white p-3 rounded-lg text-center text-lg border border-gray-600"
                                                    placeholder="120"
                                                    placeholderTextColor="#6b7280"
                                                    keyboardType="number-pad"
                                                    value={(exercise.restTime || 120).toString()}
                                                    onChangeText={(text) => {
                                                        const seconds = parseInt(text) || 120;
                                                        // Max 10 minutes = 600 seconds
                                                        const clamped = Math.min(Math.max(seconds, 0), 600);
                                                        updateRestTime(exercise.id, clamped);
                                                    }}
                                                />
                                                <Text className="text-gray-500 text-xs mt-1 text-center">
                                                    Máximo: 10 minutos (600s)
                                                </Text>
                                            </View>

                                            {/* Quick Presets */}
                                            <View className="mb-4">
                                                <Text className="text-gray-400 text-sm mb-2">Presets Rápidos</Text>
                                                <View className="flex-row gap-2">
                                                    {[
                                                        { label: '1m', value: 60 },
                                                        { label: '1.5m', value: 90 },
                                                        { label: '2m', value: 120 },
                                                        { label: '3m', value: 180 },
                                                    ].map((option) => (
                                                        <TouchableOpacity
                                                            key={option.value}
                                                            onPress={() => updateRestTime(exercise.id, option.value)}
                                                            className="flex-1 p-2 rounded-lg bg-gray-700 active:bg-gray-600">
                                                            <Text className="text-center font-bold text-gray-300 text-sm">
                                                                {option.label}
                                                            </Text>
                                                        </TouchableOpacity>
                                                    ))}
                                                </View>
                                            </View>

                                            {/* Sets Table */}
                                            <View className="mb-3">
                                                <Text className="text-gray-400 text-sm mb-2">Series Planificadas</Text>
                                                <View className="bg-gray-700/50 rounded-lg p-3">
                                                    {/* Header */}
                                                    <View className="flex-row mb-2 pb-2 border-b border-gray-600">
                                                        <Text className="text-gray-400 text-xs font-bold flex-1 text-center">SET</Text>
                                                        <Text className="text-gray-400 text-xs font-bold flex-1 text-center">KG</Text>
                                                        <Text className="text-gray-400 text-xs font-bold flex-1 text-center">REPS</Text>
                                                    </View>
                                                    {/* Set Rows */}
                                                    {Array.from({ length: exercise.plannedSets || 1 }).map((_, setIndex) => (
                                                        <View key={setIndex} className="flex-row py-2 border-b border-gray-700 last:border-b-0">
                                                            <Text className="text-white text-sm flex-1 text-center">{setIndex + 1}</Text>
                                                            <Text className="text-gray-500 text-sm flex-1 text-center">-</Text>
                                                            <Text className="text-gray-500 text-sm flex-1 text-center">-</Text>
                                                        </View>
                                                    ))}
                                                </View>
                                            </View>

                                            {/* Add/Remove Set Buttons */}
                                            <View className="flex-row gap-2">
                                                <TouchableOpacity
                                                    onPress={() => addSet(exercise.id)}
                                                    className="flex-1 bg-gray-700 p-3 rounded-lg flex-row items-center justify-center active:bg-gray-600">
                                                    <Ionicons name="add" size={18} color="white" />
                                                    <Text className="text-white font-bold ml-1">Add Set</Text>
                                                </TouchableOpacity>
                                                {(exercise.plannedSets || 1) > 1 && (
                                                    <TouchableOpacity
                                                        onPress={() => removeSet(exercise.id)}
                                                        className="bg-red-500/20 p-3 rounded-lg">
                                                        <Ionicons name="remove" size={18} color="#ef4444" />
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                        </View>
                                    )}
                                </View>
                            ))}
                        </View>
                    )}


                    {/* Add Exercise Button */}
                    <TouchableOpacity
                        onPress={() => router.push('/exercises')}
                        className="bg-blue-600 p-4 rounded-xl flex-row items-center justify-center active:bg-blue-700">
                        <Ionicons name="add" size={24} color="white" />
                        <Text className="text-white font-bold ml-2 text-lg">Añadir Ejercicio</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
