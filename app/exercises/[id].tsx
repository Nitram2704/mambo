import { View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { supabase } from '@/lib/supabase';
import { ExerciseStatsTab } from '@/components/ExerciseStatsTab';
import { ExerciseHistoryTab } from '@/components/ExerciseHistoryTab';
import { ExerciseGifPlayer } from '@/components/ExerciseGifPlayer';
import { ExerciseVideoPlayer } from '@/components/ExerciseVideoPlayer';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';
import { AccessibleText } from '@/components/ui/AccessibleText';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';

interface CommonMistake {
    title: string;
    description: string;
    image_url?: string;
}

interface ExerciseVariation {
    title: string;
    description: string;
    level: string;
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
    const { theme } = useAppTheme();
    const colors = Colors[theme];

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
                const { EXERCISES } = require('@/constants/exercises');
                const constantExercise = EXERCISES.find((e: any) => e.id === id);

                if (constantExercise) {
                    exerciseName = constantExercise.name;
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
                const nameMappings: Record<string, string> = {
                    'Sentadilla (Barra)': 'Sentadillas',
                    'Sentadilla': 'Sentadillas',
                    'Flexiones': 'Flexiones',
                    'Press de Banca (Barra)': 'Press de Banca (Barra)',
                    'Press de Banca': 'Press de Banca (Barra)',
                    'Peso Muerto (Barra)': 'Peso Muerto (Barra)',
                    'Peso Muerto': 'Peso Muerto (Barra)',
                };

                const dbName = nameMappings[exerciseName] || exerciseName;
                query = query.eq('name', dbName);
            }

            const { data, error } = await query.single();

            if (error) {
                console.error('Error fetching exercise:', error);

                // Fallback: try to find by name without strict mapping if first attempt fails
                if (!isUuid) {
                    const { data: fallbackData, error: fallbackError } = await supabase
                        .from('exercises')
                        .select('*')
                        .ilike('name', `%${exerciseName}%`)
                        .limit(1)
                        .single();

                    if (!fallbackError && fallbackData) {
                        setExercise(fallbackData);
                        setLoading(false);
                        return;
                    }
                }

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
            case 'Beginner': return colors.success;
            case 'Intermediate': return colors.warning;
            case 'Advanced': return colors.error;
            default: return colors.textMuted;
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
            <ScreenWrapper bg="bg-background">
                <View className="flex-1 items-center justify-center">
                    <AccessibleText className="text-text">Cargando ejercicio...</AccessibleText>
                </View>
            </ScreenWrapper>
        );
    }

    if (!exercise) {
        return (
            <ScreenWrapper bg="bg-background">
                <View className="flex-1 items-center justify-center">
                    <AccessibleText className="text-text">Ejercicio no encontrado</AccessibleText>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="mt-4 bg-primary px-6 py-3 rounded-xl">
                        <AccessibleText weight="bold" className="text-white">Volver</AccessibleText>
                    </TouchableOpacity>
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper bg="bg-background" safeArea={false}>
            <SafeAreaView edges={['top']} className="flex-1">
                {/* Header */}
                <Animated.View
                    entering={FadeInDown.delay(100)}
                    className="flex-row items-center justify-between p-4 border-b border-border/10">
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <View className="flex-1 items-center mx-4">
                        <AccessibleText weight="bold" className="text-text text-lg text-center" numberOfLines={1}>
                            {exercise.name}
                        </AccessibleText>
                        <AccessibleText className="text-text-secondary text-xs text-center">
                            {exercise.muscle_group}
                        </AccessibleText>
                    </View>
                    <View style={{ width: 24 }} />
                </Animated.View>

                {/* Main Tabs */}
                <View className="flex-row border-b border-border/10">
                    {[
                        { key: 'stats', label: 'Resumen' },
                        { key: 'history', label: 'Historia' },
                        { key: 'education', label: 'Indicaciones' }
                    ].map((tab) => (
                        <TouchableOpacity
                            key={tab.key}
                            onPress={() => setMainTab(tab.key as any)}
                            className={`flex-1 py-4 items-center border-b-2 ${mainTab === tab.key ? 'border-primary' : 'border-transparent'
                                }`}>
                            <AccessibleText weight="bold" className={mainTab === tab.key ? 'text-primary' : 'text-text-muted'}>
                                {tab.label}
                            </AccessibleText>
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
                                    <View className="bg-surface rounded-xl p-8 items-center justify-center border border-border/10">
                                        <Ionicons name="videocam-off" size={48} color={colors.textMuted} />
                                        <AccessibleText className="text-text-muted text-center mt-4">
                                            Contenido multimedia próximamente
                                        </AccessibleText>
                                    </View>
                                )}
                            </View>

                            {/* Education Sub-Tabs */}
                            <View className="px-4">
                                <View className="flex-row bg-surface rounded-xl p-1 mb-4 border border-border/10">
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
                                            className={`flex-1 py-3 px-2 rounded-lg items-center ${educationTab === tab.key ? 'bg-primary' : ''
                                                }`}>
                                            <Ionicons
                                                name={tab.icon as any}
                                                size={18}
                                                color={educationTab === tab.key ? 'white' : colors.textMuted}
                                            />
                                            <AccessibleText className={`text-[10px] mt-1 ${educationTab === tab.key ? 'text-white font-bold' : 'text-text-muted'
                                                }`}>
                                                {tab.label}
                                            </AccessibleText>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {/* Sub-Tab Content */}
                                <View className="pb-8">
                                    {educationTab === 'overview' && (
                                        <View className="space-y-4">
                                            <View className="bg-surface rounded-xl p-4 border border-border/10">
                                                <AccessibleText weight="bold" className="text-text mb-2">Descripción</AccessibleText>
                                                <AccessibleText className="text-text-secondary leading-6">
                                                    Aprende la técnica correcta para {exercise.name.toLowerCase()}.
                                                    {exercise.difficulty_level && ` Este ejercicio es de nivel ${getDifficultyText(exercise.difficulty_level).toLowerCase()}.`}
                                                </AccessibleText>
                                            </View>

                                            {exercise.equipment_needed && exercise.equipment_needed.length > 0 && (
                                                <View className="bg-surface rounded-xl p-4 border border-border/10">
                                                    <AccessibleText weight="bold" className="text-text mb-2">Equipo Necesario</AccessibleText>
                                                    <View className="flex-row flex-wrap gap-2">
                                                        {exercise.equipment_needed.map((item, index) => (
                                                            <View key={index} className="bg-surface-highlight px-3 py-1 rounded-full">
                                                                <AccessibleText className="text-text-secondary text-sm">{item}</AccessibleText>
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
                                                <View className="bg-surface rounded-xl p-4 border border-border/10">
                                                    <AccessibleText weight="bold" className="text-text mb-4">Pasos de Ejecución</AccessibleText>
                                                    {exercise.tutorial_steps.map((step, index) => (
                                                        <View key={index} className="flex-row items-start mb-3">
                                                            <View className="w-8 h-8 bg-primary rounded-full items-center justify-center mr-3 mt-0.5">
                                                                <AccessibleText weight="bold" className="text-white text-sm">{index + 1}</AccessibleText>
                                                            </View>
                                                            <AccessibleText className="text-text-secondary flex-1 leading-6">{step}</AccessibleText>
                                                        </View>
                                                    ))}
                                                </View>
                                            ) : (
                                                <View className="bg-surface rounded-xl p-8 items-center border border-border/10">
                                                    <Ionicons name="list-outline" size={48} color={colors.textMuted} />
                                                    <AccessibleText className="text-text-muted text-center mt-4">
                                                        Pasos de ejecución próximamente
                                                    </AccessibleText>
                                                </View>
                                            )}

                                            {exercise.safety_tips && exercise.safety_tips.length > 0 && (
                                                <View className="bg-surface rounded-xl p-4 border border-border/10">
                                                    <AccessibleText weight="bold" className="text-text mb-4">💡 Consejos de Seguridad</AccessibleText>
                                                    {exercise.safety_tips.map((tip, index) => (
                                                        <View key={index} className="flex-row items-start mb-3">
                                                            <Ionicons name="shield-checkmark-outline" size={20} color={colors.success} style={{ marginRight: 12, marginTop: 2 }} />
                                                            <AccessibleText className="text-text-secondary flex-1 leading-6">{tip}</AccessibleText>
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
                                                    <View key={index} className="bg-surface rounded-xl p-4 border border-border/10">
                                                        <View className="flex-row items-start mb-3">
                                                            <View className="w-10 h-10 bg-error/10 rounded-full items-center justify-center mr-3">
                                                                <Ionicons name="close-circle" size={24} color={colors.error} />
                                                            </View>
                                                            <View className="flex-1">
                                                                <AccessibleText weight="bold" className="text-text mb-1">{mistake.title}</AccessibleText>
                                                                <AccessibleText className="text-text-secondary leading-6">{mistake.description}</AccessibleText>
                                                            </View>
                                                        </View>
                                                        {mistake.image_url && (
                                                            <View className="mt-3 p-3 bg-surface-highlight rounded-lg">
                                                                <AccessibleText className="text-text-muted text-sm text-center">
                                                                    Imagen explicativa próximamente
                                                                </AccessibleText>
                                                            </View>
                                                        )}
                                                    </View>
                                                ))
                                            ) : (
                                                <View className="bg-surface rounded-xl p-8 items-center border border-border/10">
                                                    <Ionicons name="warning-outline" size={48} color={colors.textMuted} />
                                                    <AccessibleText className="text-text-muted text-center mt-4">
                                                        Errores comunes próximamente
                                                    </AccessibleText>
                                                </View>
                                            )}
                                        </View>
                                    )}

                                    {educationTab === 'anatomy' && (
                                        <View className="space-y-4">
                                            {exercise.muscles_diagram_url ? (
                                                <View className="bg-surface rounded-xl p-4 border border-border/10">
                                                    <AccessibleText weight="bold" className="text-text mb-4">Anatomía del Movimiento</AccessibleText>
                                                    <View className="bg-surface-highlight rounded-lg p-6 items-center justify-center">
                                                        <Ionicons name="body-outline" size={48} color={colors.primary} />
                                                        <AccessibleText className="text-text-muted text-center mt-4">
                                                            Diagrama muscular próximamente
                                                        </AccessibleText>
                                                    </View>
                                                </View>
                                            ) : (
                                                <View className="bg-surface rounded-xl p-8 items-center border border-border/10">
                                                    <Ionicons name="body-outline" size={48} color={colors.textMuted} />
                                                    <AccessibleText className="text-text-muted text-center mt-4">
                                                        Diagrama anatómico próximamente
                                                    </AccessibleText>
                                                </View>
                                            )}

                                            {exercise.target_muscles && exercise.target_muscles.length > 0 && (
                                                <View className="bg-surface rounded-xl p-4 border border-border/10">
                                                    <AccessibleText weight="bold" className="text-text mb-2">Músculos Principales:</AccessibleText>
                                                    <View className="flex-row flex-wrap gap-2">
                                                        {exercise.target_muscles.map((muscle, index) => (
                                                            <View key={index} className="bg-primary/20 px-3 py-1 rounded-full">
                                                                <AccessibleText className="text-primary text-sm">{muscle}</AccessibleText>
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
                                                        <View key={level} className="bg-surface rounded-xl p-4 border border-border/10">
                                                            <View className="flex-row items-center mb-4">
                                                                <View className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: getDifficultyColor(level) }} />
                                                                <AccessibleText weight="bold" className="text-text text-lg">
                                                                    {getDifficultyText(level)}
                                                                </AccessibleText>
                                                            </View>
                                                            {variations.map((variation, index) => (
                                                                <View key={index} className="mb-3 last:mb-0">
                                                                    <AccessibleText weight="semibold" className="text-primary mb-1">
                                                                        {variation.title}
                                                                    </AccessibleText>
                                                                    <AccessibleText className="text-text-secondary leading-6">
                                                                        {variation.description}
                                                                    </AccessibleText>
                                                                </View>
                                                            ))}
                                                        </View>
                                                    ));
                                                })()
                                            ) : (
                                                <View className="bg-surface rounded-xl p-8 items-center border border-border/10">
                                                    <Ionicons name="git-branch-outline" size={48} color={colors.textMuted} />
                                                    <AccessibleText className="text-text-muted text-center mt-4">
                                                        Variaciones próximamente
                                                    </AccessibleText>
                                                </View>
                                            )}
                                        </View>
                                    )}

                                    {educationTab === 'alternatives' && (
                                        <View className="space-y-4">
                                            {exercise.alternative_equipment && exercise.alternative_equipment.length > 0 ? (
                                                <View className="bg-surface rounded-xl p-4 border border-border/10">
                                                    <AccessibleText weight="bold" className="text-text mb-4">💡 Equipo Alternativo</AccessibleText>
                                                    <AccessibleText className="text-text-secondary mb-4 leading-6">
                                                        Si no tienes acceso al equipo principal ({exercise.equipment}), puedes usar estas alternativas:
                                                    </AccessibleText>
                                                    <View className="flex-row flex-wrap gap-2">
                                                        {exercise.alternative_equipment.map((item, index) => (
                                                            <View key={index} className="bg-primary/20 px-4 py-2 rounded-full">
                                                                <AccessibleText className="text-primary text-sm font-medium">{item}</AccessibleText>
                                                            </View>
                                                        ))}
                                                    </View>
                                                </View>
                                            ) : (
                                                <View className="bg-surface rounded-xl p-8 items-center border border-border/10">
                                                    <Ionicons name="swap-horizontal-outline" size={48} color={colors.textMuted} />
                                                    <AccessibleText className="text-text-muted text-center mt-4">
                                                        Alternativas de equipo próximamente
                                                    </AccessibleText>
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
        </ScreenWrapper>
    );
}