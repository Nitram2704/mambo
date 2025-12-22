import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Link } from 'expo-router';
import { EXERCISES, Exercise, MuscleGroup } from '@/constants/exercises';
import { useRoutineStore } from '@/store/routineStore';

const MUSCLE_GROUPS: (MuscleGroup | 'All')[] = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio'];
const EQUIPMENT_TYPES = ['All', 'Barbell', 'Dumbbell', 'Machine', 'Cable', 'Bodyweight'];

export default function ExercisesScreen() {
    const router = useRouter();
    const addExercise = useRoutineStore((state) => state.addExercise);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | 'All'>('All');
    const [selectedEquipment, setSelectedEquipment] = useState<string>('All');

    const filteredExercises = EXERCISES.filter((ex) => {
        const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesMuscle = selectedMuscle === 'All' || ex.muscleGroup === selectedMuscle;
        const matchesEquipment = selectedEquipment === 'All' || ex.equipment === selectedEquipment;
        return matchesSearch && matchesMuscle && matchesEquipment;
    });

    const handleMuscleFilter = (muscle: MuscleGroup | 'All') => {
        console.log('Muscle filter clicked:', muscle);
        setSelectedMuscle(muscle);
    };

    const handleEquipmentFilter = (equipment: string) => {
        console.log('Equipment filter clicked:', equipment);
        setSelectedEquipment(equipment);
    };

    const handleSelectExercise = (item: Exercise) => {
        console.log('Exercise selected:', item.name);
        addExercise(item);
        console.log('Navigating back...');
        router.back();
    };

    const handleViewDetails = (item: Exercise) => {
        console.log('Viewing exercise details:', item.name);
        router.push({
            pathname: '/exercises/[id]',
            params: { id: item.id }
        });
    };

    const renderItem = ({ item }: { item: Exercise }) => (
        <Pressable
            onPress={() => handleSelectExercise(item)}
            className="flex-row items-center justify-between p-4 border-b border-gray-800 active:bg-gray-800">
            <View className="flex-1">
                <Text className="text-white text-lg font-medium">{item.name}</Text>
                <Text className="text-gray-500 text-sm">{item.muscleGroup} • {item.equipment}</Text>
            </View>
            <View className="flex-row items-center gap-3">
                <TouchableOpacity
                    onPress={(e) => {
                        e.stopPropagation();
                        handleViewDetails(item);
                    }}
                    className="p-2"
                >
                    <Ionicons name="school-outline" size={20} color="#10b981" />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={(e) => {
                        e.stopPropagation();
                        router.push({
                            pathname: '/exercises/history',
                            params: { exerciseId: item.id, exerciseName: item.name }
                        });
                    }}
                    className="p-2"
                >
                    <Ionicons name="stats-chart" size={20} color="#60a5fa" />
                </TouchableOpacity>
                <Ionicons name="add-circle-outline" size={24} color="#3b82f6" />
            </View>
        </Pressable>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-900" edges={['top']}>
            {/* Header */}
            <View className="flex-row items-center p-4 border-b border-gray-800">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold">Ejercicios</Text>
            </View>

            {/* Search Bar */}
            <View className="p-4 pb-2">
                <View className="bg-gray-800 rounded-xl flex-row items-center px-4 py-3 border border-gray-700">
                    <Ionicons name="search" size={20} color="#9ca3af" />
                    <TextInput
                        className="flex-1 text-white ml-3 text-base"
                        placeholder="Buscar ejercicio..."
                        placeholderTextColor="#9ca3af"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color="#9ca3af" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Filters */}
            <View className="max-h-14 mb-2">
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
                    {/* Muscle Filter */}
                    {MUSCLE_GROUPS.map((muscle) => (
                        <Pressable
                            key={muscle}
                            onPress={() => handleMuscleFilter(muscle)}
                            className={`px-4 py-2 rounded-full border ${selectedMuscle === muscle
                                ? 'bg-blue-600 border-blue-600'
                                : 'bg-gray-800 border-gray-700'
                                }`}>
                            <Text className={`text-sm font-medium ${selectedMuscle === muscle ? 'text-white' : 'text-gray-400'}`}>
                                {muscle === 'All' ? 'Todos Músculos' : muscle}
                            </Text>
                        </Pressable>
                    ))}
                </ScrollView>
            </View>

            <View className="max-h-14 mb-2">
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
                    {/* Equipment Filter */}
                    {EQUIPMENT_TYPES.map((eq) => (
                        <Pressable
                            key={eq}
                            onPress={() => handleEquipmentFilter(eq)}
                            className={`px-4 py-2 rounded-full border ${selectedEquipment === eq
                                ? 'bg-blue-600 border-blue-600'
                                : 'bg-gray-800 border-gray-700'
                                }`}>
                            <Text className={`text-sm font-medium ${selectedEquipment === eq ? 'text-white' : 'text-gray-400'}`}>
                                {eq === 'All' ? 'Todo Equipo' : eq}
                            </Text>
                        </Pressable>
                    ))}
                </ScrollView>
            </View>

            {/* Create Custom Exercise Button */}
            <Link href="/exercises/create" asChild>
                <TouchableOpacity className="mx-4 mb-4 bg-gray-800 p-4 rounded-xl border border-gray-700 border-dashed flex-row items-center justify-center active:bg-gray-750">
                    <Ionicons name="add" size={24} color="#3b82f6" />
                    <Text className="text-blue-500 font-bold ml-2">Crear Ejercicio Personalizado</Text>
                </TouchableOpacity>
            </Link>

            {/* List */}
            <FlatList
                data={filteredExercises}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ paddingBottom: 20 }}
                ListEmptyComponent={
                    <View className="items-center justify-center py-10">
                        <Text className="text-gray-500">No se encontraron ejercicios</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}
