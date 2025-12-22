import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Card } from '@/components/ui/Card';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { useAchievementsStore } from '@/store/achievementsStore';

interface LearningPath {
    id: string;
    title: string;
    description: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    exerciseNames: string[];
}

interface ExerciseWithEducation {
    id: string;
    name: string;
    difficulty_level?: string;
    estimated_duration?: number;
    video_url?: string;
    gif_url?: string;
}

interface ExerciseProgress {
    exerciseId: string;
    completed: boolean;
    watchedVideo: boolean;
}

export default function LearningPathScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { theme, isDark } = useAppTheme();
    const { pathId } = useLocalSearchParams();
    const { incrementLessonsCompleted, addXp } = useAchievementsStore();
    const [path, setPath] = useState<LearningPath | null>(null);
    const [exercises, setExercises] = useState<ExerciseWithEducation[]>([]);
    const [userProgress, setUserProgress] = useState<Record<string, ExerciseProgress>>({});
    const [loading, setLoading] = useState(true);

    // Predefined paths data
    const pathsData: Record<string, LearningPath> = {
        basics: {
            id: 'basics',
            title: t('learn.learningPaths.data.basics.title'),
            description: t('learn.learningPaths.data.basics.description'),
            difficulty: 'Beginner',
            exerciseNames: ['Sentadillas', 'Flexiones', 'Plancha Abdominal', 'Zancadas', 'Dominadas', 'Burpees']
        },
        'upper-body': {
            id: 'upper-body',
            title: t('learn.learningPaths.data.upper-body.title'),
            description: t('learn.learningPaths.data.upper-body.description'),
            difficulty: 'Intermediate',
            exerciseNames: ['Flexiones', 'Flexiones Inclinadas', 'Dominadas', 'Remo Invertido', 'Superman', 'Fondos en Banco', 'Pike Push-ups', 'Curl Isométrico']
        },
        'lower-body': {
            id: 'lower-body',
            title: t('learn.learningPaths.data.lower-body.title'),
            description: t('learn.learningPaths.data.lower-body.description'),
            difficulty: 'Intermediate',
            exerciseNames: ['Sentadillas', 'Zancadas', 'Sentadilla Búlgara', 'Elevación de Gemelos', 'Burpees', 'Saltos de Tijera']
        },
        calisthenics: {
            id: 'calisthenics',
            title: t('learn.learningPaths.data.calisthenics.title'),
            description: t('learn.learningPaths.data.calisthenics.description'),
            difficulty: 'Advanced',
            exerciseNames: ['Dominadas', 'Fondos en Banco', 'Pike Push-ups', 'Handstand Push-ups', 'Russian Twist']
        }
    };

    useEffect(() => {
        if (pathId) {
            loadPathData();
        }
    }, [pathId]);

    const loadPathData = async () => {
        try {
            setLoading(true);

            // Get path info
            const pathInfo = pathsData[pathId as string];
            if (!pathInfo) {
                Alert.alert(t('common.error'), t('common.error'));
                router.back();
                return;
            }
            setPath(pathInfo);

            // Load exercises data
            const { data: exercisesData, error } = await supabase
                .from('exercises')
                .select('id, name, difficulty_level, estimated_duration, video_url, gif_url')
                .in('name', pathInfo.exerciseNames);

            if (error) {
                console.error('Error loading exercises:', error);
                Alert.alert(t('common.error'), t('common.error'));
                return;
            }

            setExercises(exercisesData || []);

            // Load user progress (mock data for now)
            const mockProgress: Record<string, ExerciseProgress> = {};
            exercisesData?.forEach(ex => {
                mockProgress[ex.id] = {
                    exerciseId: ex.id,
                    completed: Math.random() > 0.7,
                    watchedVideo: Math.random() > 0.5
                };
            });
            setUserProgress(mockProgress);

        } catch (error) {
            console.error('Error loading path data:', error);
            Alert.alert(t('common.error'), t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    const handleExercisePress = (exercise: ExerciseWithEducation) => {
        router.push({
            pathname: '/exercises/[id]',
            params: { id: exercise.id }
        });
    };

    const toggleExerciseCompletion = (exerciseId: string) => {
        const wasCompleted = userProgress[exerciseId]?.completed;
        setUserProgress(prev => ({
            ...prev,
            [exerciseId]: {
                ...prev[exerciseId],
                completed: !prev[exerciseId]?.completed
            }
        }));

        if (!wasCompleted) {
            incrementLessonsCompleted();
        }
    };

    const toggleVideoWatched = (exerciseId: string) => {
        const wasWatched = userProgress[exerciseId]?.watchedVideo;
        setUserProgress(prev => ({
            ...prev,
            [exerciseId]: {
                ...prev[exerciseId],
                watchedVideo: !prev[exerciseId]?.watchedVideo
            }
        }));

        if (!wasWatched) {
            addXp(20, 'Watched exercise video');
        }
    };

    const getDifficultyColor = (level?: string) => {
        switch (level) {
            case 'Beginner': return isDark ? 'bg-green-500/20' : 'bg-green-100';
            case 'Intermediate': return isDark ? 'bg-yellow-500/20' : 'bg-yellow-100';
            case 'Advanced': return isDark ? 'bg-red-500/20' : 'bg-red-100';
            default: return isDark ? 'bg-gray-500/20' : 'bg-gray-100';
        }
    };

    const getDifficultyTextColor = (level?: string) => {
        switch (level) {
            case 'Beginner': return '#22c55e';
            case 'Intermediate': return '#eab308';
            case 'Advanced': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const renderExercise = (exercise: ExerciseWithEducation, index: number) => {
        const progress = userProgress[exercise.id];
        const isCompleted = progress?.completed;
        const hasWatchedVideo = progress?.watchedVideo;
        const hasVideo = exercise.video_url || exercise.gif_url;

        return (
            <Animated.View
                key={exercise.id}
                entering={FadeInUp.delay(100 + index * 50)}
                className="mb-4">
                <Card
                    onPress={() => handleExercisePress(exercise)}
                    className="p-4">
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center flex-1">
                            {/* Completion Status */}
                            <TouchableOpacity
                                onPress={(e) => {
                                    e.stopPropagation();
                                    toggleExerciseCompletion(exercise.id);
                                }}
                                style={{ backgroundColor: isCompleted ? '#22c55e' : (isDark ? '#374151' : '#e5e7eb') }}
                                className="w-10 h-10 rounded-full items-center justify-center mr-4">
                                {isCompleted ? (
                                    <Ionicons name="checkmark" size={20} color="white" />
                                ) : (
                                    <Text style={{ color: Colors[theme].text }} className="font-bold">{index + 1}</Text>
                                )}
                            </TouchableOpacity>

                            {/* Exercise Info */}
                            <View className="flex-1">
                                <Text style={{ color: isCompleted ? '#22c55e' : Colors[theme].text }} className="text-lg font-bold mb-1">
                                    {exercise.name}
                                </Text>
                                <View className="flex-row items-center gap-3">
                                    {exercise.difficulty_level && (
                                        <View className={`px-2 py-0.5 rounded-full ${getDifficultyColor(exercise.difficulty_level)}`}>
                                            <Text style={{ color: getDifficultyTextColor(exercise.difficulty_level) }} className="text-xs">
                                                {exercise.difficulty_level === 'Beginner' ? t('levels.beginner') :
                                                    exercise.difficulty_level === 'Intermediate' ? t('levels.intermediate') : t('levels.advanced')}
                                            </Text>
                                        </View>
                                    )}
                                    {exercise.estimated_duration && (
                                        <View className="flex-row items-center">
                                            <Ionicons name="time-outline" size={12} color={Colors[theme].textSecondary} />
                                            <Text style={{ color: Colors[theme].textSecondary }} className="text-xs ml-1">
                                                {exercise.estimated_duration}s
                                            </Text>
                                        </View>
                                    )}
                                    {hasVideo && (
                                        <TouchableOpacity
                                            onPress={(e) => {
                                                e.stopPropagation();
                                                toggleVideoWatched(exercise.id);
                                            }}
                                            className="flex-row items-center">
                                            <Ionicons name={hasWatchedVideo ? "videocam" : "videocam-outline"} size={12} color={hasWatchedVideo ? "#22c55e" : "#3b82f6"} />
                                            <Text style={{ color: hasWatchedVideo ? '#22c55e' : '#3b82f6' }} className="text-xs ml-1">
                                                {hasWatchedVideo ? t('common.completed') : t('common.view')}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        </View>

                        <Ionicons name="chevron-forward" size={20} color={Colors[theme].textSecondary} />
                    </View>
                </Card>
            </Animated.View>
        );
    };

    const getPathProgressValue = () => {
        if (!path || !exercises.length) return 0;
        const completedCount = exercises.filter(ex => userProgress[ex.id]?.completed).length;
        return Math.round((completedCount / exercises.length) * 100);
    };

    if (loading) {
        return (
            <ScreenWrapper>
                <View className="flex-1 items-center justify-center">
                    <Text style={{ color: Colors[theme].text }}>{t('common.loading')}...</Text>
                </View>
            </ScreenWrapper>
        );
    }

    if (!path) {
        return (
            <ScreenWrapper>
                <View className="flex-1 items-center justify-center">
                    <Text style={{ color: Colors[theme].text }}>{t('common.error')}</Text>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={{ backgroundColor: Colors[theme].primary }}
                        className="mt-4 px-6 py-3 rounded-xl">
                        <Text className="text-white font-bold">{t('common.back')}</Text>
                    </TouchableOpacity>
                </View>
            </ScreenWrapper>
        );
    }

    const progress = getPathProgressValue();

    return (
        <ScreenWrapper>
            {/* Header */}
            <Animated.View
                entering={FadeInDown.delay(100)}
                className="p-4">
                <TouchableOpacity onPress={() => router.back()} className="mb-4">
                    <Ionicons name="arrow-back" size={24} color={Colors[theme].text} />
                </TouchableOpacity>

                <View className="items-center">
                    <Text style={{ color: Colors[theme].text }} className="text-2xl font-bold text-center mb-2">
                        {path.title}
                    </Text>
                    <Text style={{ color: Colors[theme].textSecondary }} className="text-center mb-4">
                        {path.description}
                    </Text>

                    {/* Progress */}
                    <View className="w-full mb-4">
                        <View className="flex-row justify-between items-center mb-2">
                            <Text style={{ color: Colors[theme].textSecondary }} className="text-sm">{t('learn.learningPaths.progress')}</Text>
                            <Text style={{ color: Colors[theme].text }} className="text-sm font-bold">{progress}%</Text>
                        </View>
                        <View style={{ backgroundColor: isDark ? '#374151' : '#e5e7eb' }} className="w-full rounded-full h-3">
                            <View
                                className="h-3 rounded-full bg-green-500"
                                style={{ width: `${progress}%` }}
                            />
                        </View>
                    </View>
                </View>
            </Animated.View>

            {/* Exercises List */}
            <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
                <Animated.View
                    entering={FadeInUp.delay(200)}
                    className="mb-6">
                    <Text style={{ color: Colors[theme].text }} className="text-lg font-bold mb-2">
                        {t('learn.learningPaths.pathExercises')}
                    </Text>
                    <Text style={{ color: Colors[theme].textSecondary }}>
                        {t('learn.learningPaths.completeToMaster')}
                    </Text>
                </Animated.View>

                {exercises.length > 0 ? (
                    exercises.map((exercise, index) => renderExercise(exercise, index))
                ) : (
                    <View className="items-center justify-center py-10">
                        <Ionicons name="list-outline" size={48} color={Colors[theme].textSecondary} />
                        <Text style={{ color: Colors[theme].textSecondary }} className="mt-4 text-center">
                            {t('learn.learningPaths.empty')}
                        </Text>
                    </View>
                )}
                <View style={{ height: 40 }} />
            </ScrollView>
        </ScreenWrapper>
    );
}