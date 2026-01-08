import React, { useState } from 'react';
import { View, TextInput, FlatList, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Link } from 'expo-router';
import { EXERCISES, Exercise, MuscleGroup } from '@/constants/exercises';
import { useRoutineStore } from '@/store/routineStore';
import { useUIStore } from '@/store/uiStore';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { AccessibleText } from '@/components/ui/AccessibleText';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';

const MUSCLE_GROUPS: (MuscleGroup | 'All')[] = ['All', 'chest', 'back', 'legs', 'shoulders', 'biceps', 'triceps', 'abs', 'cardio'];
const EQUIPMENT_TYPES = ['All', 'barbell', 'dumbbell', 'machine', 'cable', 'bodyweight'];

export default function ExercisesScreen() {
    const router = useRouter();
    const { theme } = useAppTheme();
    const colors = Colors[theme];
    const addExercise = useRoutineStore((state) => state.addExercise);
    const { showToast } = useUIStore();

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
        setSelectedMuscle(muscle);
    };

    const handleEquipmentFilter = (equipment: string) => {
        setSelectedEquipment(equipment);
    };

    const handleSelectExercise = (item: Exercise) => {
        addExercise(item);
        showToast(`${item.name} añadido`, 'success');
        router.back();
    };

    const handleViewDetails = (item: Exercise) => {
        router.push({
            pathname: '/exercises/[id]',
            params: { id: item.id }
        });
    };

    const renderItem = ({ item }: { item: Exercise }) => (
        <Pressable
            onPress={() => handleSelectExercise(item)}
            className="flex-row items-center justify-between p-4 border-b border-border/10 active:bg-surface-highlight/50">
            <View className="flex-1">
                <AccessibleText weight="bold" className="text-text text-lg">{item.name}</AccessibleText>
                <AccessibleText className="text-text-secondary text-sm">{item.muscleGroup} • {item.equipment}</AccessibleText>
            </View>
            <View className="flex-row items-center gap-3">
                <TouchableOpacity
                    onPress={(e) => {
                        e.stopPropagation();
                        handleViewDetails(item);
                    }}
                    className="p-2 bg-success/10 rounded-full"
                >
                    <Ionicons name="school-outline" size={20} color={colors.success} />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={(e) => {
                        e.stopPropagation();
                        router.push({
                            pathname: '/exercises/history',
                            params: { exerciseId: item.id, exerciseName: item.name }
                        });
                    }}
                    className="p-2 bg-primary/10 rounded-full"
                >
                    <Ionicons name="stats-chart" size={20} color={colors.primary} />
                </TouchableOpacity>
                <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
            </View>
        </Pressable>
    );

    return (
        <ScreenWrapper safeArea={true} edges={['top']}>
            {/* Header */}
            <View className="flex-row items-center p-4 border-b border-border/10">
                <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2 bg-surface-highlight rounded-full">
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <AccessibleText weight="bold" className="text-text text-xl">Ejercicios</AccessibleText>
            </View>

            {/* Search Bar */}
            <View className="p-4 pb-2">
                <View className="bg-surface-highlight/50 rounded-2xl flex-row items-center px-4 py-3 border border-border/10">
                    <Ionicons name="search" size={20} color={colors.textMuted} />
                    <TextInput
                        className="flex-1 ml-3 text-base"
                        style={{ color: colors.text }}
                        placeholder="Buscar ejercicio..."
                        placeholderTextColor={colors.textMuted}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color={colors.textMuted} />
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
                                ? 'bg-primary border-primary'
                                : 'bg-surface-highlight/50 border-border/10'
                                }`}>
                            <AccessibleText weight="bold" className={`text-sm ${selectedMuscle === muscle ? 'text-white' : 'text-text-secondary'}`}>
                                {muscle === 'All' ? 'Todos Músculos' : muscle}
                            </AccessibleText>
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
                                ? 'bg-primary border-primary'
                                : 'bg-surface-highlight/50 border-border/10'
                                }`}>
                            <AccessibleText weight="bold" className={`text-sm ${selectedEquipment === eq ? 'text-white' : 'text-text-secondary'}`}>
                                {eq === 'All' ? 'Todo Equipo' : eq}
                            </AccessibleText>
                        </Pressable>
                    ))}
                </ScrollView>
            </View>

            {/* Create Custom Exercise Button */}
            <Link href="/exercises/create" asChild>
                <TouchableOpacity className="mx-4 mb-4 bg-surface-highlight/30 p-4 rounded-2xl border border-primary/30 border-dashed flex-row items-center justify-center active:bg-surface-highlight/50">
                    <Ionicons name="add" size={24} color={colors.primary} />
                    <AccessibleText weight="bold" className="text-primary ml-2">Crear Ejercicio Personalizado</AccessibleText>
                </TouchableOpacity>
            </Link>

            {/* List */}
            <FlatList
                data={filteredExercises}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ paddingBottom: 20 }}
                ListEmptyComponent={
                    <EmptyState
                        icon="search-outline"
                        title="No se encontraron ejercicios"
                        description="Prueba con otros filtros o crea uno personalizado si no encuentras lo que buscas."
                        actionLabel="Crear Personalizado"
                        onAction={() => router.push('/exercises/create')}
                    />
                }
            />
        </ScreenWrapper>
    );
}
