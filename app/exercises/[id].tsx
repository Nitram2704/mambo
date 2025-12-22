import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { ExerciseVideoPlayer } from '@/components/ExerciseVideoPlayer';
import { ExerciseGifPlayer } from '@/components/ExerciseGifPlayer';
import { ExerciseStatsTab } from '@/components/ExerciseStatsTab';
import { ExerciseHistoryTab } from '@/components/ExerciseHistoryTab';
import { CommonMistake } from '@/constants/exercises';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ExerciseVariation {
    title: string;
    level: string;
    description: string;
}

interface ExerciseWithEducation {
    id: string;
    name: string;
    muscle_group: string;
    equipment: string;
    video_url?: string;
    gif_url?: string;
    tutorial_steps?: string[];
    common_mistakes?: CommonMistake[];
    safety_tips?: string[];
    muscles_diagram_url?: string;
    difficulty_level?: string;
    estimated_duration?: number;
    target_muscles?: string[];
    secondary_muscles?: string[];
    equipment_needed?: string[];
    prerequisites?: string[];
    variations?: ExerciseVariation[];
    alternative_equipment?: string[];
}

export default function ExerciseDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [exercise, setExercise] = useState<ExerciseWithEducation | null>(null);
    const [loading, setLoading] = useState(true);
    const [mainTab, setMainTab] = useState<'stats' | 'history' | 'education'>('stats');
    const [educationTab, setEducationTab] = useState<'overview' | 'technique' | 'mistakes' | 'anatomy' | 'variations' | 'alternatives'>('overview');

    useEffect(() => {
        fetchExerciseDetails();
    }, [id]);

    const fetchExerciseDetails = async () => {
        try {
            setLoading(true);

            let exerciseId = id;
            let exerciseName = '';

            // Validate UUID
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            const isUuid = id && typeof id === 'string' && uuidRegex.test(id);

            if (!isUuid) {
                // If not a UUID, try to find the exercise in constants to get the name
                // This handles legacy IDs like "1", "20", etc.
                const { EXERCISES } = require('@/constants/exercises');
                const constantExercise = EXERCISES.find((e: any) => e.id === id);

                if (constantExercise) {
                    exerciseName = constantExercise.name;
                    console.log('Found exercise in constants:', exerciseName);
                } else {
                    console.warn('Invalid UUID and not found in constants:', id);
                    Alert.alert('Aviso', 'Este ejercicio no tiene información detallada disponible.');
                    router.back();
                    return;
                }
            }

            let query = supabase.from('exercises').select('*');

            if (isUuid) {
                query = query.eq('id', exerciseId);
            } else {
                // Try to match by name
                // Note: DB has "Sentadillas", Constant has "Sentadilla (Barra)"
                // We might need fuzzy matching or multiple attempts

                // Known mappings based on migration 006 vs constants
                const nameMappings: Record<string, string> = {
                    'Sentadilla (Barra)': 'Sentadillas',
                    'Flexiones': 'Flexiones', // Match
                    'Press de Banca (Barra)': 'Press de Banca (Barra)', // Match
                };

                const dbName = nameMappings[exerciseName] || exerciseName;
                query = query.eq('name', dbName);
            }

            const { data, error } = await query.single();

            if (error) {
                console.error('Error fetching exercise:', error);
                Alert.alert('Aviso', 'Información detallada no encontrada en la base de datos.');
                router.back();
                return;
            }

            setExercise(data);
        } catch (error) {
            console.error('Error:', error);
            Alert.alert('Error', 'Error al cargar los detalles del ejercicio');
        } finally {
            setLoading(false);
        }
    };

    const getDifficultyColor = (level?: string) => {
        switch (level) {
            case 'Beginner': return 'bg-green-500';
            case 'Intermediate': return 'bg-yellow-500';
            case 'Advanced': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    const getDifficultyText = (level?: string) => {
        switch (level) {
            case 'Beginner': return 'Principiante';
            case 'Intermediate': return 'Intermedio';
            case 'Advanced': return 'Avanzado';
            default: return 'Sin nivel';
        }
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-gray-900" edges={['top']}>
                <View className="flex-1 items-center justify-center">
                    <Text className="text-white">Cargando ejercicio...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!exercise) {
        return (
            <SafeAreaView className="flex-1 bg-gray-900" edges={['top']}>
                <View className="flex-1 items-center justify-center">
                    <Text className="text-white">Ejercicio no encontrado</Text>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="mt-4 bg-blue-600 px-6 py-3 rounded-xl">
                        <Text className="text-white font-bold">Volver</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-900" edges={['top']}>
            {/* Header */}
            <Animated.View
                entering={FadeInDown.delay(100)}
                className="flex-row items-center justify-between p-4 border-b border-gray-800">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <View className="flex-1 items-center mx-4">
                    <Text className="text-white text-lg font-bold text-center" numberOfLines={1}>
                        {exercise.name}
                    </Text>
                    <Text className="text-gray-400 text-xs text-center">
                        {exercise.muscle_group}
                    </Text>
                </View>
                <View style={{ width: 24 }} />
            </Animated.View>

            {/* Main Tabs */}
            <View className="flex-row border-b border-gray-800">
                {[
                    { key: 'stats', label: 'Resumen' },
                    { key: 'history', label: 'Historia' },
                    { key: 'education', label: 'Indicaciones' }
                ].map((tab) => (
                    <TouchableOpacity
                        key={tab.key}
                        onPress={() => setMainTab(tab.key as any)}
                        className={`flex-1 py-4 items-center border-b-2 ${mainTab === tab.key ? 'border-blue-500' : 'border-transparent'
                            }`}>
                        <Text className={`font-bold ${mainTab === tab.key ? 'text-blue-500' : 'text-gray-400'
                            }`}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {mainTab === 'stats' && (
                    <Animated.View entering={FadeInUp.delay(200)} className="px-4 pb-8">
                        <ExerciseStatsTab exerciseId={exercise.id} exerciseName={exercise.name} />
                    </Animated.View>
                )}

                {mainTab === 'history' && (
                    <Animated.View entering={FadeInUp.delay(200)} className="px-4 pb-8">
                        <ExerciseHistoryTab exerciseId={exercise.id} exerciseName={exercise.name} />
                    </Animated.View>
                )}

                {mainTab === 'education' && (
                    <Animated.View entering={FadeInUp.delay(200)}>
                        {/* Video/GIF Section */}
                        <View className="p-4">
                            {exercise.video_url || exercise.gif_url ? (
                                <View>
                                    {exercise.gif_url && !exercise.video_url && (
                                        <ExerciseGifPlayer
                                            gifUrl={exercise.gif_url}
                                            fallbackText="Vista previa del ejercicio"
                                        />
                                    )}
                                    {exercise.video_url && (
                                        <ExerciseVideoPlayer
                                            videoUrl={exercise.video_url}
                                            thumbnailUrl={exercise.gif_url}
                                            title={`Tutorial: ${exercise.name}`}
                                            autoplay={false}
                                            showControls={true}
                                        />
                                    )}
                                </View>
                            ) : (
                                <View className="bg-gray-800 rounded-xl p-8 items-center justify-center">
                                    <Ionicons name="videocam-off" size={48} color="#6b7280" />
                                    <Text className="text-gray-400 text-center mt-4">
                                        Contenido multimedia próximamente
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Education Sub-Tabs */}
                        <View className="px-4">
                            <View className="flex-row bg-gray-800 rounded-xl p-1 mb-4">
                                {[
                                    { key: 'overview', label: 'Resumen', icon: 'information-circle-outline' },
                                    { key: 'technique', label: 'Técnica', icon: 'list-outline' },
                                    { key: 'mistakes', label: 'Errores', icon: 'warning-outline' },
                                    { key: 'anatomy', label: 'Anatomía', icon: 'body-outline' },
                                    { key: 'variations', label: 'Variaciones', icon: 'git-branch-outline' },
                                    { key: 'alternatives', label: 'Alternativas', icon: 'swap-horizontal-outline' }
                                ].map((tab) => (
                                    <TouchableOpacity
                                        key={tab.key}
                                        onPress={() => setEducationTab(tab.key as any)}
                                        className={`flex-1 py-3 px-2 rounded-lg items-center ${educationTab === tab.key ? 'bg-blue-600' : ''
                                            }`}>
                                        <Ionicons
                                            name={tab.icon as any}
                                            size={18}
                                            color={educationTab === tab.key ? 'white' : '#9ca3af'}
                                        />
                                        <Text className={`text-xs mt-1 ${educationTab === tab.key ? 'text-white font-bold' : 'text-gray-400'
                                            }`}>
                                            {tab.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Sub-Tab Content */}
                            <View className="pb-8">
                                {educationTab === 'overview' && (
                                    <View className="space-y-4">
                                        <View className="bg-gray-800 rounded-xl p-4">
                                            <Text className="text-white font-bold mb-2">Descripción</Text>
                                            <Text className="text-gray-300 leading-6">
                                                Aprende la técnica correcta para {exercise.name.toLowerCase()}.
                                                {exercise.difficulty_level && ` Este ejercicio es de nivel ${getDifficultyText(exercise.difficulty_level).toLowerCase()}.`}
                                            </Text>
                                        </View>

                                        {exercise.equipment_needed && exercise.equipment_needed.length > 0 && (
                                            <View className="bg-gray-800 rounded-xl p-4">
                                                <Text className="text-white font-bold mb-2">Equipo Necesario</Text>
                                                <View className="flex-row flex-wrap gap-2">
                                                    {exercise.equipment_needed.map((item, index) => (
                                                        <View key={index} className="bg-gray-700 px-3 py-1 rounded-full">
                                                            <Text className="text-gray-300 text-sm">{item}</Text>
                                                        </View>
                                                    ))}
                                                </View>
                                            </View>
                                        )}
                                    </View>
                                )}

                                {educationTab === 'technique' && (
                                    <View className="space-y-4">
                                        {exercise.tutorial_steps && exercise.tutorial_steps.length > 0 ? (
                                            <View className="bg-gray-800 rounded-xl p-4">
                                                <Text className="text-white font-bold mb-4">Pasos de Ejecución</Text>
                                                {exercise.tutorial_steps.map((step, index) => (
                                                    <View key={index} className="flex-row items-start mb-3">
                                                        <View className="w-8 h-8 bg-blue-600 rounded-full items-center justify-center mr-3 mt-0.5">
                                                            <Text className="text-white font-bold text-sm">{index + 1}</Text>
                                                        </View>
                                                        <Text className="text-gray-300 flex-1 leading-6">{step}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        ) : (
                                            <View className="bg-gray-800 rounded-xl p-8 items-center">
                                                <Ionicons name="list-outline" size={48} color="#6b7280" />
                                                <Text className="text-gray-400 text-center mt-4">
                                                    Pasos de ejecución próximamente
                                                </Text>
                                            </View>
                                        )}

                                        {exercise.safety_tips && exercise.safety_tips.length > 0 && (
                                            <View className="bg-gray-800 rounded-xl p-4">
                                                <Text className="text-white font-bold mb-4">💡 Consejos de Seguridad</Text>
                                                {exercise.safety_tips.map((tip, index) => (
                                                    <View key={index} className="flex-row items-start mb-3">
                                                        <Ionicons name="shield-checkmark-outline" size={20} color="#10b981" style={{ marginRight: 12, marginTop: 2 }} />
                                                        <Text className="text-gray-300 flex-1 leading-6">{tip}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        )}
                                    </View>
                                )}

                                {educationTab === 'mistakes' && (
                                    <View className="space-y-4">
                                        {exercise.common_mistakes && exercise.common_mistakes.length > 0 ? (
                                            exercise.common_mistakes.map((mistake, index) => (
                                                <View key={index} className="bg-gray-800 rounded-xl p-4">
                                                    <View className="flex-row items-start mb-3">
                                                        <View className="w-10 h-10 bg-red-500/20 rounded-full items-center justify-center mr-3">
                                                            <Ionicons name="close-circle" size={24} color="#ef4444" />
                                                        </View>
                                                        <View className="flex-1">
                                                            <Text className="text-white font-bold mb-1">{mistake.title}</Text>
                                                            <Text className="text-gray-300 leading-6">{mistake.description}</Text>
                                                        </View>
                                                    </View>
                                                    {mistake.image_url && (
                                                        <View className="mt-3 p-3 bg-gray-700 rounded-lg">
                                                            <Text className="text-gray-400 text-sm text-center">
                                                                Imagen explicativa próximamente
                                                            </Text>
                                                        </View>
                                                    )}
                                                </View>
                                            ))
                                        ) : (
                                            <View className="bg-gray-800 rounded-xl p-8 items-center">
                                                <Ionicons name="warning-outline" size={48} color="#6b7280" />
                                                <Text className="text-gray-400 text-center mt-4">
                                                    Errores comunes próximamente
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                )}

                                {educationTab === 'anatomy' && (
                                    <View className="space-y-4">
                                        {exercise.muscles_diagram_url ? (
                                            <View className="bg-gray-800 rounded-xl p-4">
                                                <Text className="text-white font-bold mb-4">Anatomía del Movimiento</Text>
                                                <View className="bg-gray-700 rounded-lg p-6 items-center justify-center">
                                                    <Ionicons name="body-outline" size={48} color="#60a5fa" />
                                                    <Text className="text-gray-400 text-center mt-4">
                                                        Diagrama muscular próximamente
                                                    </Text>
                                                </View>
                                            </View>
                                        ) : (
                                            <View className="bg-gray-800 rounded-xl p-8 items-center">
                                                <Ionicons name="body-outline" size={48} color="#6b7280" />
                                                <Text className="text-gray-400 text-center mt-4">
                                                    Diagrama anatómico próximamente
                                                </Text>
                                            </View>
                                        )}

                                        {exercise.target_muscles && exercise.target_muscles.length > 0 && (
                                            <View className="bg-gray-800 rounded-xl p-4">
                                                <Text className="text-white font-bold mb-2">Músculos Principales:</Text>
                                                <View className="flex-row flex-wrap gap-2">
                                                    {exercise.target_muscles.map((muscle, index) => (
                                                        <View key={index} className="bg-blue-600/20 px-3 py-1 rounded-full">
                                                            <Text className="text-blue-400 text-sm">{muscle}</Text>
                                                        </View>
                                                    ))}
                                                </View>
                                            </View>
                                        )}
                                    </View>
                                )}

                                {educationTab === 'variations' && (
                                    <View className="space-y-4">
                                        {exercise.variations && exercise.variations.length > 0 ? (
                                            (() => {
                                                const groupedVariations = exercise.variations.reduce((acc, variation) => {
                                                    if (!acc[variation.level]) acc[variation.level] = [];
                                                    acc[variation.level].push(variation);
                                                    return acc;
                                                }, {} as Record<string, ExerciseVariation[]>);

                                                return Object.entries(groupedVariations).map(([level, variations]) => (
                                                    <View key={level} className="bg-gray-800 rounded-xl p-4">
                                                        <View className="flex-row items-center mb-4">
                                                            <View className={`w-3 h-3 rounded-full mr-2 ${getDifficultyColor(level)}`} />
                                                            <Text className="text-white font-bold text-lg">
                                                                {getDifficultyText(level)}
                                                            </Text>
                                                        </View>
                                                        {variations.map((variation, index) => (
                                                            <View key={index} className="mb-3 last:mb-0">
                                                                <Text className="text-blue-400 font-semibold mb-1">
                                                                    {variation.title}
                                                                </Text>
                                                                <Text className="text-gray-300 leading-6">
                                                                    {variation.description}
                                                                </Text>
                                                            </View>
                                                        ))}
                                                    </View>
                                                ));
                                            })()
                                        ) : (
                                            <View className="bg-gray-800 rounded-xl p-8 items-center">
                                                <Ionicons name="git-branch-outline" size={48} color="#6b7280" />
                                                <Text className="text-gray-400 text-center mt-4">
                                                    Variaciones próximamente
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                )}

                                {educationTab === 'alternatives' && (
                                    <View className="space-y-4">
                                        {exercise.alternative_equipment && exercise.alternative_equipment.length > 0 ? (
                                            <View className="bg-gray-800 rounded-xl p-4">
                                                <Text className="text-white font-bold mb-4">💡 Equipo Alternativo</Text>
                                                <Text className="text-gray-300 mb-4 leading-6">
                                                    Si no tienes acceso al equipo principal ({exercise.equipment}), puedes usar estas alternativas:
                                                </Text>
                                                <View className="flex-row flex-wrap gap-2">
                                                    {exercise.alternative_equipment.map((item, index) => (
                                                        <View key={index} className="bg-blue-600/20 px-4 py-2 rounded-full">
                                                            <Text className="text-blue-400 text-sm font-medium">{item}</Text>
                                                        </View>
                                                    ))}
                                                </View>
                                            </View>
                                        ) : (
                                            <View className="bg-gray-800 rounded-xl p-8 items-center">
                                                <Ionicons name="swap-horizontal-outline" size={48} color="#6b7280" />
                                                <Text className="text-gray-400 text-center mt-4">
                                                    Alternativas de equipo próximamente
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                )}
                            </View>
                        </View>
                    </Animated.View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}