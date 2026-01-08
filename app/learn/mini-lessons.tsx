import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Card } from '@/components/ui/Card';
import { MINI_LESSONS, MiniLesson } from '@/data/miniLessons';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

export default function MiniLessonsScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { theme, isDark } = useAppTheme();

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'BIOMECHANICS': return 'fitness';
            case 'NUTRITION': return 'nutrition';
            case 'RECOVERY': return 'bed';
            case 'FAT_LOSS': return 'trending-down';
            case 'SUPPLEMENTS': return 'medical';
            default: return 'school';
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'BIOMECHANICS': return '#3b82f6';
            case 'NUTRITION': return '#10b981';
            case 'RECOVERY': return '#8b5cf6';
            case 'FAT_LOSS': return '#f59e0b';
            case 'SUPPLEMENTS': return '#ec4899';
            default: return '#6b7280';
        }
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

    const renderLesson = ({ item: lesson, index }: { item: MiniLesson; index: number }) => (
        <Animated.View
            entering={FadeInUp.delay(100 + index * 50)}
            className="mb-4">
            <TouchableOpacity
                onPress={() => router.push({
                    pathname: '/learn/mini-lesson-viewer',
                    params: { lessonId: lesson.id }
                })}
                activeOpacity={0.7}
            >
                <Card className="p-4">
                    <View className="flex-row items-start">
                        <View
                            style={{ backgroundColor: getCategoryColor(lesson.category) + '20' }}
                            className="w-12 h-12 rounded-xl items-center justify-center mr-4">
                            <Ionicons
                                name={getCategoryIcon(lesson.category) as any}
                                size={24}
                                color={getCategoryColor(lesson.category)}
                            />
                        </View>

                        <View className="flex-1">
                            <Text style={{ color: Colors[theme].text }} className="text-lg font-bold mb-1">
                                {t(`learn.miniLessons.lessons.${lesson.id}.title`)}
                            </Text>
                            <Text style={{ color: Colors[theme].textSecondary }} className="text-sm mb-3">
                                {t(`learn.miniLessons.lessons.${lesson.id}.description`)}
                            </Text>

                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center gap-3">
                                    <View className={`px-2 py-1 rounded-full ${getDifficultyColor(lesson.difficulty)}`}>
                                        <Text style={{ color: getDifficultyTextColor(lesson.difficulty) }} className="text-xs font-bold">
                                            {getDifficultyText(lesson.difficulty)}
                                        </Text>
                                    </View>
                                    <View className="flex-row items-center">
                                        <Ionicons name="time-outline" size={14} color={Colors[theme].textSecondary} />
                                        <Text style={{ color: Colors[theme].textSecondary }} className="text-xs ml-1">
                                            {lesson.estimatedTime}
                                        </Text>
                                    </View>
                                </View>

                                <Ionicons name="chevron-forward" size={20} color={Colors[theme].textSecondary} />
                            </View>
                        </View>
                    </View>
                </Card>
            </TouchableOpacity>
        </Animated.View>
    );

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
                    {t('learn.miniLessons.title')}
                </Text>
            </Animated.View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Hero Section */}
                <Animated.View
                    entering={FadeInUp.delay(200)}
                    className="mx-4 mb-6 rounded-3xl overflow-hidden">
                    <LinearGradient
                        colors={isDark ? ['#065f46', '#047857'] : ['#10b981', '#34d399']}
                        className="p-6">
                        <View className="items-center">
                            <Ionicons name="school" size={48} color="white" className="mb-4" />
                            <Text className="text-white text-2xl font-bold text-center mb-2">
                                {t('learn.miniLessons.heroTitle')}
                            </Text>
                            <Text className="text-white text-center opacity-90">
                                {t('learn.miniLessons.heroSubtitle')}
                            </Text>
                        </View>
                    </LinearGradient>
                </Animated.View>

                {/* Lessons List */}
                <View className="flex-1 px-4">
                    <Text style={{ color: Colors[theme].text }} className="text-lg font-bold mb-4 px-2">
                        {t('learn.miniLessons.availableLessons')}
                    </Text>

                    <FlatList
                        data={MINI_LESSONS}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item, index }) => renderLesson({ item, index })}
                        scrollEnabled={false}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 20 }}
                        ListEmptyComponent={
                            <View className="items-center justify-center py-10">
                                <Ionicons name="book-outline" size={48} color={Colors[theme].textSecondary} />
                                <Text style={{ color: Colors[theme].textSecondary }} className="mt-4 text-center">
                                    {t('learn.miniLessons.empty')}
                                </Text>
                            </View>
                        }
                    />
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}