import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRoutineStore } from '@/store/routineStore';
import { useCustomExercisesStore } from '@/store/customExercisesStore';
import { useUIStore } from '@/store/uiStore';
import { MuscleGroup, Exercise } from '@/constants/exercises';

const MUSCLE_GROUPS: MuscleGroup[] = ['chest', 'back', 'legs', 'shoulders', 'arms' as any, 'abs' as any, 'cardio'];

export default function CreateExerciseScreen() {
    const router = useRouter();
    const addExerciseToRoutine = useRoutineStore((state) => state.addExercise);
    const addCustomExercise = useCustomExercisesStore((state) => state.addCustomExercise);
    const { showToast } = useUIStore();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup>('chest');

    const handleSave = () => {
        if (!name.trim()) {
            showToast('El ejercicio necesita un nombre para poder guardarlo.', 'warning');
            return;
        }

        const newExercise: Exercise = {
            id: 'custom-' + Date.now(),
            name: name.trim(),
            muscleGroup: selectedMuscle,
            equipment: 'other',
        };

        // 1. Persist custom exercise
        addCustomExercise(newExercise);

        // 2. Add to current routine being created
        addExerciseToRoutine(newExercise);

        showToast('¡Ejercicio creado y añadido!', 'success');

        // Use replace to go back to create routine screen
        router.replace('/routines/create');
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-900">
            {/* Header */}
            <View className="flex-row items-center justify-between p-4 border-b border-gray-800">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold">Nuevo Ejercicio</Text>
                <TouchableOpacity onPress={handleSave}>
                    <Text className="text-blue-500 text-lg font-bold">Guardar</Text>
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 p-4">
                {/* Name Input */}
                <View className="mb-6">
                    <Text className="text-gray-400 mb-2 text-sm uppercase font-bold tracking-wider">Nombre del Ejercicio</Text>
                    <TextInput
                        className="bg-gray-800 text-white p-4 rounded-xl text-lg border border-gray-700"
                        placeholder="Ej: Press de Banca Unilateral"
                        placeholderTextColor="#6b7280"
                        value={name}
                        onChangeText={setName}
                    />
                </View>

                {/* Description Input */}
                <View className="mb-6">
                    <Text className="text-gray-400 mb-2 text-sm uppercase font-bold tracking-wider">
                        Descripción (Opcional)
                    </Text>
                    <TextInput
                        className="bg-gray-800 text-white p-4 rounded-xl text-base border border-gray-700"
                        placeholder="Breve descripción o instrucciones..."
                        placeholderTextColor="#6b7280"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />
                </View>

                {/* Muscle Group Selection */}
                <View className="mb-6">
                    <Text className="text-gray-400 mb-2 text-sm uppercase font-bold tracking-wider">Grupo Muscular</Text>
                    <View className="flex-row flex-wrap gap-2">
                        {MUSCLE_GROUPS.map((muscle) => (
                            <TouchableOpacity
                                key={muscle}
                                onPress={() => setSelectedMuscle(muscle)}
                                className={`px-4 py-3 rounded-xl border ${selectedMuscle === muscle
                                    ? 'bg-blue-600 border-blue-600'
                                    : 'bg-gray-800 border-gray-700'
                                    }`}>
                                <Text
                                    className={`text-base font-medium capitalize ${selectedMuscle === muscle ? 'text-white' : 'text-gray-400'
                                        }`}>
                                    {muscle}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
