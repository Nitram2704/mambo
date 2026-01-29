import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { AccessibleText } from '@/components/ui/AccessibleText';
import { Icon } from '@/components/ui/Icon';
import { Colors } from '@/constants/Colors';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useAchievementsStore } from '@/store/achievementsStore';
import { ACHIEVEMENTS, Achievement } from '@/constants/achievements';
import { AchievementBadge } from '@/components/achievements/AchievementBadge';
import { Card } from '@/components/ui/Card';

export default function AchievementsScreen() {
    const router = useRouter();
    const { theme } = useAppTheme();
    const { unlockedAchievements, getCurrentLevel, getTotalXp } = useAchievementsStore();

    const levelInfo = getCurrentLevel();
    const totalXp = getTotalXp();

    const isUnlocked = (id: string) => unlockedAchievements.some(ua => ua.id === id);

    // Group achievements by category
    const groupedAchievements = ACHIEVEMENTS.reduce((acc, achievement) => {
        const category = achievement.category || 'GENERAL';
        if (!acc[category]) acc[category] = [];
        acc[category].push(achievement);
        return acc;
    }, {} as Record<string, Achievement[]>);

    return (
        <ScreenWrapper>
            <View className="flex-row items-center justify-between p-4">
                <TouchableOpacity onPress={() => router.back()} className="p-2">
                    <Icon name="arrow-back" size={24} color={Colors[theme].text} />
                </TouchableOpacity>
                <AccessibleText weight="bold" className="text-xl text-text">Logros</AccessibleText>
                <View className="w-10" />
            </View>

            <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
                {/* Level Card */}
                <Card variant="glass" className="p-6 mb-6 border-secondary/30">
                    <View className="flex-row items-center justify-between mb-4">
                        <View>
                            <AccessibleText className="text-text-secondary text-xs uppercase tracking-widest">Nivel Actual</AccessibleText>
                            <AccessibleText weight="bold" className="text-3xl text-secondary">{levelInfo.level}</AccessibleText>
                            <AccessibleText weight="bold" className="text-lg text-text">{levelInfo.title}</AccessibleText>
                        </View>
                        <View className="items-end">
                            <AccessibleText className="text-text-secondary text-xs uppercase tracking-widest">XP Total</AccessibleText>
                            <AccessibleText weight="bold" className="text-2xl text-text">{totalXp}</AccessibleText>
                        </View>
                    </View>

                    <View className="h-2 bg-surface-highlight rounded-full overflow-hidden mb-2">
                        <View
                            className="h-full bg-secondary"
                            style={{ width: `${levelInfo.progress * 100}%` }}
                        />
                    </View>
                    <View className="flex-row justify-between">
                        <AccessibleText className="text-text-muted text-[10px]">{levelInfo.currentLevelXp} XP</AccessibleText>
                        <AccessibleText className="text-text-muted text-[10px]">{levelInfo.nextLevelXp} XP</AccessibleText>
                    </View>
                </Card>

                {/* Achievements List */}
                {Object.entries(groupedAchievements).map(([category, achievements]) => (
                    <View key={category} className="mb-6">
                        <AccessibleText weight="bold" className="text-text-secondary text-sm uppercase tracking-widest mb-3 px-1">
                            {category}
                        </AccessibleText>
                        <View className="gap-3">
                            {achievements.map(achievement => (
                                <AchievementBadge
                                    key={achievement.id}
                                    achievement={achievement}
                                    unlocked={isUnlocked(achievement.id)}
                                    progress={0}
                                />
                            ))}
                        </View>
                    </View>
                ))}

                <View className="h-10" />
            </ScrollView>
        </ScreenWrapper>
    );
}
