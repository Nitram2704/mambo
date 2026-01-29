import React from 'react';
import { View, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Card } from '@/components/ui/Card';
import { AccessibleText } from '@/components/ui/AccessibleText';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';
import { useTranslation } from 'react-i18next';

interface ExercisePreview {
    id: string;
    name: string;
    image?: string;
    muscleGroup?: string;
}

interface RoutineCardProps {
    title: string;
    duration: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    exercises: ExercisePreview[];
    onStart: () => void;
    onPress: () => void;
}

export function RoutineCard({ title, duration, difficulty, exercises, onStart, onPress }: RoutineCardProps) {
    const { theme, triggerHaptic } = useAppTheme();
    const { t } = useTranslation();

    const handleStart = () => {
        triggerHaptic('success');
        onStart();
    };

    const handlePress = () => {
        triggerHaptic('selection');
        onPress();
    };

    const getDifficultyColor = () => {
        switch (difficulty) {
            case 'beginner': return Colors[theme].success;
            case 'intermediate': return Colors[theme].warning;
            case 'advanced': return Colors[theme].error;
            default: return Colors[theme].textSecondary;
        }
    };

    return (
        <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
            <Card variant="glass" className="p-0 overflow-hidden mb-4 border-white/10 animate-pop">
                {/* Header Section */}
                <View className="p-4 pb-2">
                    <View className="flex-row justify-between items-start mb-2">
                        <View className="flex-1 mr-4">
                            <AccessibleText variant="h3" weight="bold" className="text-text text-xl mb-1">
                                {title}
                            </AccessibleText>
                            <View className="flex-row items-center gap-3">
                                <View className="flex-row items-center">
                                    <Ionicons name="time-outline" size={14} color={Colors[theme].textSecondary} />
                                    <AccessibleText className="text-text-secondary text-xs ml-1">
                                        {duration} min
                                    </AccessibleText>
                                </View>
                                <View className="flex-row items-center">
                                    <Ionicons name="fitness-outline" size={14} color={getDifficultyColor()} />
                                    <AccessibleText className="text-xs ml-1 capitalize" style={{ color: getDifficultyColor() }}>
                                        {t(`common.${difficulty}`)}
                                    </AccessibleText>
                                </View>
                                <View className="flex-row items-center">
                                    <Ionicons name="list-outline" size={14} color={Colors[theme].textSecondary} />
                                    <AccessibleText className="text-text-secondary text-xs ml-1">
                                        {exercises.length} {t('common.exercises')}
                                    </AccessibleText>
                                </View>
                            </View>
                        </View>
                        <TouchableOpacity
                            onPress={handleStart}
                            className="bg-primary rounded-full p-3 shadow-lg shadow-primary/30"
                        >
                            <Ionicons name="play" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Exercises Horizontal Scroll */}
                <View className="pb-4">
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
                    >
                        {exercises.map((exercise, index) => (
                            <View key={`${exercise.id}-${index}`} className="w-20 items-center">
                                <View className="w-20 h-20 rounded-xl bg-surface-highlight mb-2 overflow-hidden items-center justify-center border border-white/5">
                                    {exercise.image ? (
                                        <Image source={{ uri: exercise.image }} className="w-full h-full" resizeMode="cover" />
                                    ) : (
                                        <Ionicons name="barbell" size={24} color={Colors[theme].textMuted} />
                                    )}
                                </View>
                                <AccessibleText
                                    className="text-text-secondary text-[10px] text-center"
                                    numberOfLines={2}
                                >
                                    {exercise.name}
                                </AccessibleText>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            </Card>
        </TouchableOpacity>
    );
}
