import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Exercise } from '@/constants/exercises';
import { SavedRoutine } from '@/store/savedRoutinesStore';

interface EditRoutineModalProps {
    visible: boolean;
    routine: SavedRoutine | null;
    onSave: (updatedRoutine: SavedRoutine) => void;
    onDelete: () => void;
    onClose: () => void;
}

export default function EditRoutineModal({ visible, routine, onSave, onDelete, onClose }: EditRoutineModalProps) {
    const [name, setName] = useState(routine?.name || '');
    const [description, setDescription] = useState(routine?.description || '');
    const [exercises, setExercises] = useState<Exercise[]>(routine?.exercises || []);

    React.useEffect(() => {
        if (routine) {
            setName(routine.name);
            setDescription(routine.description || '');
            setExercises(routine.exercises);
        }
    }, [routine]);

    const handleSave = () => {
        if (!name.trim()) {
            Alert.alert('Error', 'El nombre es obligatorio');
            return;
        }

        if (exercises.length === 0) {
            Alert.alert('Error', 'Debe tener al menos un ejercicio');
            return;
        }

        const updatedRoutine: SavedRoutine = {
            id: routine!.id,
            name: name.trim(),
            description: description.trim(),
            exercises,
            createdAt: routine!.createdAt,
        };

        onSave(updatedRoutine);
        onClose();
    };

    const handleDelete = () => {
        Alert.alert(
            'Eliminar Rutina',
            '¿Estás seguro de eliminar esta rutina?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: () => {
                        onDelete();
                        onClose();
                    }
                }
            ]
        );
    };

    const updateExercise = (index: number, field: keyof Exercise, value: any) => {
        const updated = [...exercises];
        updated[index] = { ...updated[index], [field]: value };
        setExercises(updated);
    };

    const removeExercise = (index: number) => {
        Alert.alert(
            'Eliminar Ejercicio',
            '¿Eliminar este ejercicio de la rutina?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: () => {
                        setExercises(exercises.filter((_, i) => i !== index));
                    }
                }
            ]
        );
    };

    if (!routine) return null;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-gray-950">
                {/* Header */}
                <View className="flex-row items-center justify-between p-4 border-b border-gray-800">
                    <TouchableOpacity onPress={onClose}>
                        <Ionicons name="close" size={28} color="#fff" />
                    </TouchableOpacity>
                    <Text className="text-white text-lg font-bold">Editar Rutina</Text>
                    <TouchableOpacity onPress={handleDelete}>
                        <Ionicons name="trash" size={24} color="#ef4444" />
                    </TouchableOpacity>
                </View>

                <ScrollView className="flex-1 p-4">
                    {/* Nombre */}
                    <View className="mb-4">
                        <Text className="text-white text-sm font-semibold mb-2">Nombre</Text>
                        <TextInput
                            value={name}
                            onChangeText={setName}
                            placeholder="Nombre de la rutina"
                            placeholderTextColor="#6b7280"
                            className="bg-gray-800 text-white px-4 py-3 rounded-xl"
                        />
                    </View>

                    {/* Descripción */}
                    <View className="mb-4">
                        <Text className="text-white text-sm font-semibold mb-2">Descripción (opcional)</Text>
                        <TextInput
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Descripción..."
                            placeholderTextColor="#6b7280"
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                            className="bg-gray-800 text-white px-4 py-3 rounded-xl"
                        />
                    </View>

                    {/* Ejercicios */}
                    <Text className="text-white text-lg font-bold mb-3">
                        Ejercicios ({exercises.length})
                    </Text>

                    {exercises.map((exercise, index) => (
                        <View key={index} className="bg-gray-800 rounded-xl p-4 mb-3">
                            <View className="flex-row items-center justify-between mb-3">
                                <Text className="text-white font-semibold flex-1">{exercise.name}</Text>
                                <TouchableOpacity onPress={() => removeExercise(index)}>
                                    <Ionicons name="close-circle" size={24} color="#ef4444" />
                                </TouchableOpacity>
                            </View>

                            <View className="flex-row gap-3">
                                {/* Sets */}
                                <View className="flex-1">
                                    <Text className="text-gray-400 text-xs mb-1">Sets</Text>
                                    <TextInput
                                        value={exercise.plannedSets?.toString() || '3'}
                                        onChangeText={(val) => updateExercise(index, 'plannedSets', parseInt(val) || 3)}
                                        keyboardType="numeric"
                                        className="bg-gray-700 text-white px-3 py-2 rounded-lg text-center"
                                    />
                                </View>

                                {/* Rest */}
                                <View className="flex-1">
                                    <Text className="text-gray-400 text-xs mb-1">Descanso (s)</Text>
                                    <TextInput
                                        value={exercise.restTime?.toString() || '60'}
                                        onChangeText={(val) => updateExercise(index, 'restTime', parseInt(val) || 60)}
                                        keyboardType="numeric"
                                        className="bg-gray-700 text-white px-3 py-2 rounded-lg text-center"
                                    />
                                </View>
                            </View>
                        </View>
                    ))}

                    {/* Botón Guardar */}
                    <TouchableOpacity
                        onPress={handleSave}
                        className="bg-blue-500 py-4 rounded-xl mb-8 mt-4"
                    >
                        <Text className="text-white text-center font-bold text-lg">
                            Guardar Cambios
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </Modal>
    );
}
