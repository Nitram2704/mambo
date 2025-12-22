import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Card } from '@/components/ui/Card';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface LearningPath {
    id: string;
    title: string;
    description: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    estimatedTime: string;
    exerciseCount: number;
    exerciseNames: string[];
    icon: string;
    color: string;
}

export default function LearnScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { theme, isDark } = useAppTheme();
    const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
    const [loading, setLoading] = useState(true);

    // Predefined learning paths
    const defaultPaths: LearningPath[] = [
        {
            id: 'basics',
            title: t('learn.learningPaths.data.basics.title'),
            description: t('learn.learningPaths.data.basics.description'),
            difficulty: 'Beginner',
            estimatedTime: '2-3 h',
            exerciseCount: 6,
            exerciseNames: ['Sentadillas', 'Flexiones', 'Plancha Abdominal', 'Zancadas', 'Dominadas', 'Burpees'],
            icon: 'school-outline',
            color: Colors[theme].primary
        },
        {
            id: 'upper-body',
            title: t('learn.learningPaths.data.upper-body.title'),
            description: t('learn.learningPaths.data.upper-body.description'),
            difficulty: 'Intermediate',
            estimatedTime: '3-4 h',
            exerciseCount: 8,
            exerciseNames: ['Flexiones', 'Flexiones Inclinadas', 'Dominadas', 'Remo Invertido', 'Superman', 'Fondos en Banco', 'Pike Push-ups', 'Curl Isométrico'],
            icon: 'barbell-outline',
            color: '#3b82f6'
        },
        {
            id: 'lower-body',
            title: t('learn.learningPaths.data.lower-body.title'),
            description: t('learn.learningPaths.data.lower-body.description'),
            difficulty: 'Intermediate',
            estimatedTime: '2.5-3.5 h',
            exerciseCount: 6,
            exerciseNames: ['Sentadillas', 'Zancadas', 'Sentadilla Búlgara', 'Elevación de Gemelos', 'Burpees', 'Saltos de Tijera'],
            icon: 'footsteps-outline',
            color: '#10b981'
        },
        {
            id: 'calisthenics',
            title: t('learn.learningPaths.data.calisthenics.title'),
            description: t('learn.learningPaths.data.calisthenics.description'),
            difficulty: 'Advanced',
            estimatedTime: '4-5 h',
            exerciseCount: 5,
            exerciseNames: ['Dominadas', 'Fondos en Banco', 'Pike Push-ups', 'Handstand Push-ups', 'Russian Twist'],
            icon: 'body-outline',
            color: '#ef4444'
        }
    ];

    useEffect(() => {
        loadLearningPaths();
    }, []);

    const loadLearningPaths = async () => {
        setLearningPaths(defaultPaths);
        setLoading(false);
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Beginner': return isDark ? 'bg-green-500/20' : 'bg-green-100';
            case 'Intermediate': return isDark ? 'bg-yellow-500/20' : 'bg-yellow-100';
            case 'Advanced': return isDark ? 'bg-red-500/20' : 'bg-red-100';
            default: return isDark ? 'bg-gray-500/20' : 'bg-gray-100';
        }
    };

    const getDifficultyTextColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Beginner': return '#22c55e';
            case 'Intermediate': return '#eab308';
            case 'Advanced': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const getDifficultyText = (difficulty: string) => {
        switch (difficulty) {
            case 'Beginner': return t('levels.beginner');
            case 'Intermediate': return t('levels.intermediate');
            case 'Advanced': return t('levels.advanced');
            default: return t('levels.all');
        }
    };

    const getPathProgress = (path: LearningPath) => {
        return 0;
    };

    const handlePathPress = (path: LearningPath) => {
        router.push({
            pathname: '/learn/[pathId]',
            params: { pathId: path.id, pathTitle: path.title }
        });
    };

    const renderLearningPath = (path: LearningPath) => {
        const progress = getPathProgress(path);

        return (
            <Animated.View
                key={path.id}
                entering={FadeInUp.delay(200)}
                className="mb-4">
                <Card
                    onPress={() => handlePathPress(path)}
                    className="p-6">
                    {/* Header */}
                    <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row items-center">
                            <View className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                                style={{ backgroundColor: path.color + '20' }}>
                                <Ionicons
                                    name={path.icon as any}
                                    size={24}
                                    color={path.color}
                                />
                            </View>
                            <View className="flex-1">
                                <Text
                                    style={{ color: Colors[theme].text }}
                                    className="text-xl font-bold mb-1"
                                    numberOfLines={1}
                                    adjustsFontSizeToFit
                                >
                                    {path.title}
                                </Text>
                                <Text style={{ color: Colors[theme].textSecondary }} className="text-sm">
                                    {path.description}
                                </Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color={Colors[theme].textSecondary} />
                    </View>

                    {/* Stats */}
                    <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row items-center gap-4">
                            <View className={`px-3 py-1 rounded-full ${getDifficultyColor(path.difficulty)}`}>
                                <Text style={{ color: getDifficultyTextColor(path.difficulty) }} className="text-xs font-bold">
                                    {getDifficultyText(path.difficulty)}
                                </Text>
                            </View>
                            <View className="flex-row items-center">
                                <Ionicons name="time-outline" size={14} color={Colors[theme].textSecondary} />
                                <Text style={{ color: Colors[theme].textSecondary }} className="text-sm ml-1">
                                    {path.estimatedTime}
                                </Text>
                            </View>
                            <View className="flex-row items-center">
                                <Ionicons name="list-outline" size={14} color={Colors[theme].textSecondary} />
                                <Text style={{ color: Colors[theme].textSecondary }} className="text-sm ml-1">
                                    {path.exerciseCount} {t('workout.exercises')}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Progress Bar */}
                    <View className="mb-2">
                        <View className="flex-row justify-between items-center mb-2">
                            <Text style={{ color: Colors[theme].textSecondary }} className="text-sm">{t('learn.learningPaths.progress')}</Text>
                            <Text style={{ color: Colors[theme].text }} className="text-sm font-bold">{progress}%</Text>
                        </View>
                        <View style={{ backgroundColor: isDark ? '#374151' : '#e5e7eb' }} className="w-full rounded-full h-2">
                            <View
                                className="h-2 rounded-full"
                                style={{
                                    width: `${progress}%`,
                                    backgroundColor: path.color
                                }}
                            />
                        </View>
                    </View>

                    {/* Exercise Previews */}
                    <View className="flex-row items-center">
                        <Text style={{ color: Colors[theme].textSecondary }} className="text-sm mr-3">{t('learn.learningPaths.pathExercises')}:</Text>
                        <View className="flex-row">
                            {path.exerciseNames.slice(0, 4).map((name, index) => {
                                return (
                                    <View
                                        key={index}
                                        style={{ backgroundColor: isDark ? '#4b5563' : '#f3f4f6' }}
                                        className="w-8 h-8 rounded-full items-center justify-center mr-1">
                                        <Text style={{ color: Colors[theme].text }} className="text-xs font-bold">
                                            {index + 1}
                                        </Text>
                                    </View>
                                );
                            })}
                            {path.exerciseNames.length > 4 && (
                                <View style={{ backgroundColor: isDark ? '#4b5563' : '#f3f4f6' }} className="w-8 h-8 rounded-full items-center justify-center">
                                    <Text style={{ color: Colors[theme].text }} className="text-xs font-bold">
                                        +{path.exerciseNames.length - 4}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                </Card>
            </Animated.View>
        );
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

    return (
        <ScreenWrapper>
            {/* Header */}
            <Animated.View
                entering={FadeInDown.delay(100)}
                className="flex-row items-center justify-between p-4">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={Colors[theme].text} />
                </TouchableOpacity>
                <Text style={{ color: Colors[theme].text }} className="text-xl font-bold flex-1 text-center mr-8">
                    {t('learn.title')}
                </Text>
            </Animated.View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Hero Section */}
                <Animated.View
                    entering={FadeInUp.delay(200)}
                    className="mx-4 mb-6 rounded-3xl overflow-hidden">
                    <LinearGradient
                        colors={isDark ? ['#1e40af', '#4338ca'] : ['#3b82f6', '#6366f1']}
                        className="p-6">
                        <View className="items-center">
                            <Ionicons name="school" size={48} color="white" className="mb-4" />
                            <Text className="text-white text-2xl font-bold text-center mb-2">
                                {t('learn.hero.title')}
                            </Text>
                            <Text className="text-white text-center opacity-90">
                                {t('learn.hero.subtitle')}
                            </Text>
                        </View>
                    </LinearGradient>
                </Animated.View>

                {/* Mini Lessons Section */}
                <TouchableOpacity
                    onPress={() => router.push('/learn/mini-lessons')}
                    className="mx-4 mb-6">
                    <LinearGradient
                        colors={isDark ? ['rgba(34, 197, 94, 0.1)', 'rgba(34, 197, 94, 0.05)'] : ['rgba(34, 197, 94, 0.1)', 'rgba(34, 197, 94, 0.05)']}
                        className="rounded-2xl p-6 border border-green-500/30">
                        <View className="flex-row items-center justify-between">
                            <View className="flex-1">
                                <View className="flex-row items-center mb-2">
                                    <Ionicons name="school" size={24} color="#22c55e" />
                                    <Text className="text-green-400 font-bold text-sm ml-2 uppercase tracking-wider">
                                        {t('learn.miniLessons.new')}
                                    </Text>
                                </View>
                                <Text
                                    style={{ color: Colors[theme].text }}
                                    className="text-xl font-bold mb-1"
                                    numberOfLines={1}
                                    adjustsFontSizeToFit
                                >
                                    {t('learn.miniLessons.title')}
                                </Text>
                                <Text style={{ color: Colors[theme].textSecondary }} className="text-sm">
                                    {t('learn.miniLessons.subtitle')}
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={24} color="#22c55e" />
                        </View>
                    </LinearGradient>
                </TouchableOpacity>

                {/* Learning Paths */}
                <View className="flex-1 px-4">
                    <Animated.View
                        entering={FadeInUp.delay(300)}
                        className="mb-6 px-2">
                        <Text style={{ color: Colors[theme].text }} className="text-xl font-bold mb-2">
                            {t('learn.learningPaths.title')}
                        </Text>
                        <Text style={{ color: Colors[theme].textSecondary }}>
                            {t('learn.learningPaths.subtitle')}
                        </Text>
                    </Animated.View>

                    {learningPaths.map((path) => renderLearningPath(path))}
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}