import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Platform, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useRoutineStore } from '@/store/routineStore';
import { useSavedRoutinesStore } from '@/store/savedRoutinesStore';
import { ScheduleConfigurator } from '@/components/ScheduleConfigurator';
import { useUIStore } from '@/store/uiStore';
import { EmptyState } from '@/components/ui/EmptyState';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function CreateRoutineScreen() {
    const router = useRouter();
    const { routineId } = useLocalSearchParams<{ routineId: string }>();
    const isEditing = !!routineId;

    const {
        name, setName, exercises, removeExercise, updateRestTime,
        addSet, removeSet, linkSuperset, unlinkSuperset, resetRoutine, loadRoutine
    } = useRoutineStore();

    const { addRoutine, updateRoutine, routines } = useSavedRoutinesStore();
    const { showToast } = useUIStore();

    const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
    const [showRestTimerPicker, setShowRestTimerPicker] = useState(false);
    const [selectedRestTime, setSelectedRestTime] = useState(120);
    const [currentEditingExerciseId, setCurrentEditingExerciseId] = useState<string | null>(null);

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
            showToast('Por favor, ingresa un nombre para la rutina', 'warning');
            return;
        }

        if (exercises.length === 0) {
            showToast('Por favor, añade al menos un ejercicio', 'warning');
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
                showToast(`Rutina "${name}" actualizada correctamente`, 'success');
            } else {
                await addRoutine(name, exercises, scheduleData);
                showToast(`Rutina "${name}" guardada con éxito`, 'success');
            }
            resetRoutine();
            router.back();
        } catch (error) {
            console.error('Error saving routine:', error);
            showToast('No pudimos guardar tu rutina. Revisa tu conexión.', 'error');
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
                        <EmptyState
                            icon="barbell-outline"
                            title="Aún no hay ejercicios"
                            description="Añade ejercicios de nuestra biblioteca para empezar a construir tu rutina."
                            actionLabel="Añadir Ejercicio"
                            onAction={() => router.push('/exercises')}
                        />
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
                                                <Text className="text-gray-400 text-sm mb-2">Tiempo de Descanso</Text>
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        setCurrentEditingExerciseId(exercise.id);
                                                        setSelectedRestTime(exercise.restTime || 120);
                                                        setShowRestTimerPicker(true);
                                                    }}
                                                    className="bg-gray-700 p-4 rounded-lg flex-row items-center justify-between border border-gray-600"
                                                >
                                                    <View className="flex-row items-center gap-2">
                                                        <Ionicons name="timer-outline" size={20} color="#a78bfa" />
                                                        <Text className="text-white font-bold text-lg">
                                                            {Math.floor((exercise.restTime || 120) / 60)}:{((exercise.restTime || 120) % 60).toString().padStart(2, '0')}
                                                        </Text>
                                                    </View>
                                                    <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                                                </TouchableOpacity>
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

            {/* Rest Timer Picker Modal */}
            <Modal
                visible={showRestTimerPicker}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowRestTimerPicker(false)}
            >
                <View className="flex-1 justify-end bg-black/60">
                    <Card variant="glass" className="rounded-t-3xl border-white/10 pb-8">
                        <View className="p-6">
                            <View className="flex-row justify-between items-center mb-6">
                                <Text className="text-white font-black text-xl uppercase tracking-widest">Descanso</Text>
                                <TouchableOpacity
                                    onPress={() => setShowRestTimerPicker(false)}
                                    className="bg-gray-700 p-2 rounded-full"
                                >
                                    <Ionicons name="close" size={20} color="#f8fafc" />
                                </TouchableOpacity>
                            </View>

                            {/* Current Selection Display */}
                            <View className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6 mb-6 items-center">
                                <Text className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Tiempo Seleccionado</Text>
                                <Text className="text-blue-500 text-5xl font-black">
                                    {Math.floor(selectedRestTime / 60)}:{(selectedRestTime % 60).toString().padStart(2, '0')}
                                </Text>
                                <Text className="text-gray-500 text-xs mt-1">minutos</Text>
                            </View>

                            {/* Quick Presets */}
                            <Text className="text-gray-400 text-xs font-black uppercase tracking-widest mb-3">Presets Rápidos</Text>
                            <View className="flex-row gap-2 mb-6">
                                {[60, 90, 120, 180].map((seconds) => (
                                    <TouchableOpacity
                                        key={seconds}
                                        onPress={() => setSelectedRestTime(seconds)}
                                        className={`flex-1 py-3 rounded-xl border ${selectedRestTime === seconds
                                            ? 'bg-blue-600 border-blue-500/50'
                                            : 'bg-gray-700 border-gray-600'
                                            }`}
                                    >
                                        <Text className={`text-center font-black text-xs ${selectedRestTime === seconds ? 'text-white' : 'text-gray-400'}`}>
                                            {seconds < 60 ? `${seconds}s` : `${seconds / 60}m`}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Time Picker - 15 second increments */}
                            <Text className="text-gray-400 text-xs font-black uppercase tracking-widest mb-3">Personalizado</Text>
                            <ScrollView
                                className="max-h-48 bg-gray-800 rounded-xl border border-gray-700"
                                showsVerticalScrollIndicator={false}
                            >
                                {Array.from({ length: 25 }, (_, i) => i * 15).map((seconds) => (
                                    <TouchableOpacity
                                        key={seconds}
                                        onPress={() => setSelectedRestTime(seconds)}
                                        className={`p-4 border-b border-gray-700 ${selectedRestTime === seconds ? 'bg-blue-600/20' : ''}`}
                                    >
                                        <Text className={`text-center font-bold ${selectedRestTime === seconds ? 'text-blue-500' : 'text-white'}`}>
                                            {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            {/* Confirm Button */}
                            <Button
                                onPress={() => {
                                    if (currentEditingExerciseId) {
                                        updateRestTime(currentEditingExerciseId, selectedRestTime);
                                    }
                                    setShowRestTimerPicker(false);
                                }}
                                variant="primary"
                                label="Confirmar"
                                className="mt-6"
                            />
                        </View>
                    </Card>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
