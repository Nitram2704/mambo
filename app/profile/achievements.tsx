import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ACHIEVEMENTS, Achievement } from '@/constants/achievements';
import { useAchievementsStore } from '@/store/achievementsStore';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Card } from '@/components/ui/Card';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';

export default function AchievementsScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { theme } = useAppTheme();
    const { unlockedAchievements, getTotalXp, getCurrentLevel } = useAchievementsStore();
    const levelData = getCurrentLevel();

    const isUnlocked = (id: string) => unlockedAchievements.some((ua) => ua.id === id);

    const renderAchievementCard = (achievement: Achievement) => {
        const unlocked = isUnlocked(achievement.id);

        return (
            <Card
                key={achievement.id}
                className={`mb-4 p-4 ${unlocked ? '' : 'opacity-70'}`}
                style={{
                    borderColor: unlocked ? Colors[theme].warning : Colors[theme].border + '20',
                    backgroundColor: unlocked ? Colors[theme].surfaceHighlight + '30' : Colors[theme].background
                }}
            >
                <View className="flex-row items-center">
                    <View
                        className="w-12 h-12 rounded-full items-center justify-center mr-4"
                        style={{ backgroundColor: unlocked ? Colors[theme].warning + '20' : Colors[theme].surfaceHighlight }}
                    >
                        <Ionicons
                            name={achievement.icon as any}
                            size={24}
                            color={unlocked ? Colors[theme].warning : Colors[theme].textMuted}
                        />
                    </View>
                    <View className="flex-1">
                        <Text
                            className="font-bold text-lg"
                            style={{ color: unlocked ? Colors[theme].text : Colors[theme].textMuted }}
                        >
                            {t(achievement.title)}
                        </Text>
                        <Text style={{ color: Colors[theme].textSecondary }} className="text-sm">
                            {t(achievement.description)}
                        </Text>
                    </View>
                    {unlocked && (
                        <View className="items-end">
                            <Text className="font-bold text-xs" style={{ color: Colors[theme].warning }}>+{achievement.xpReward} XP</Text>
                            <Ionicons name="checkmark-circle" size={20} color={Colors[theme].warning} />
                        </View>
                    )}
                </View>
            </Card>
        );
    };

    const categories = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'SPECIAL', 'STRENGTH', 'NUTRITION', 'LEARNING'];

    return (
        <ScreenWrapper safeArea={true}>
            {/* Header */}
            <View className="flex-row items-center p-4 border-b" style={{ borderColor: Colors[theme].border + '10' }}>
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Ionicons name="arrow-back" size={24} color={Colors[theme].text} />
                </TouchableOpacity>
                <Text className="text-xl font-bold" style={{ color: Colors[theme].text }}>{t('profile.achievementsScreen.title')}</Text>
            </View>

            <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
                {/* Summary Card */}
                <Card
                    className="p-6 mb-8 border"
                    style={{
                        backgroundColor: Colors[theme].primary + '10',
                        borderColor: Colors[theme].primary + '30'
                    }}
                >
                    <Text className="font-bold mb-1" style={{ color: Colors[theme].primary }}>{t('profile.achievementsScreen.currentLevel')}</Text>
                    <View className="flex-row items-end mb-4">
                        <Text className="text-4xl font-bold mr-2" style={{ color: Colors[theme].text }}>
                            {levelData.level}
                        </Text>
                        <Text className="mb-1" style={{ color: Colors[theme].textSecondary }}>
                            {levelData.title} ({t('profile.achievementsScreen.totalXp', { count: getTotalXp() })})
                        </Text>
                    </View>

                    <View
                        className="flex-row justify-between items-center p-3 rounded-xl"
                        style={{ backgroundColor: Colors[theme].background + '80' }}
                    >
                        <View>
                            <Text className="text-xs" style={{ color: Colors[theme].textSecondary }}>{t('profile.achievementsScreen.unlocked')}</Text>
                            <Text className="font-bold text-lg" style={{ color: Colors[theme].text }}>
                                {unlockedAchievements.length} / {ACHIEVEMENTS.length}
                            </Text>
                        </View>
                        <Ionicons name="trophy" size={32} color={Colors[theme].warning} />
                    </View>
                </Card>

                {/* Achievements List by Category */}
                {categories.map((category) => {
                    const categoryAchievements = ACHIEVEMENTS.filter(a => a.category === category);
                    if (categoryAchievements.length === 0) return null;

                    return (
                        <View key={category} className="mb-6">
                            <Text
                                className="font-bold mb-3 text-sm tracking-wider"
                                style={{ color: Colors[theme].primary }}
                            >
                                {t(`profile.achievementsScreen.categories.${category}`)}
                            </Text>
                            {categoryAchievements.map(renderAchievementCard)}
                        </View>
                    );
                })}

                <View className="h-10" />
            </ScrollView>
        </ScreenWrapper>
    );
}
