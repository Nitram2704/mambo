import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { AccessibleText } from '@/components/ui/AccessibleText';
import { Achievement } from '@/constants/achievements';
import { Colors } from '@/constants/Colors';
import { useAppTheme } from '@/hooks/use-app-theme';

interface AchievementBadgeProps {
    achievement: Achievement;
    unlocked: boolean;
    progress?: number; // 0 to 1
    compact?: boolean;
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
    achievement,
    unlocked,
    progress = 0,
    compact = false
}) => {
    const { theme } = useAppTheme();

    if (compact) {
        return (
            <Animated.View
                entering={FadeIn.duration(500)}
                className={`w-16 h-16 rounded-2xl items-center justify-center border ${unlocked ? 'bg-secondary/20 border-secondary/30' : 'bg-surface-highlight/30 border-border/10 opacity-50'
                    }`}
            >
                <Icon
                    name={achievement.icon as any}
                    size={24}
                    variant={unlocked ? 'secondary' : 'textMuted'}
                />
            </Animated.View>
        );
    }

    return (
        <Animated.View entering={FadeIn.delay(100).duration(600)}>
            <Card
                variant="glass"
                className={`p-4 border ${unlocked ? 'border-secondary/30' : 'border-border/10 opacity-60'
                    }`}
            >
                <View className="flex-row items-center gap-4">
                    <View className={`w-14 h-14 rounded-2xl items-center justify-center ${unlocked ? 'bg-secondary/20' : 'bg-surface-highlight/50'
                        }`}>
                        <Icon
                            name={achievement.icon as any}
                            size={28}
                            variant={unlocked ? 'secondary' : 'textMuted'}
                        />
                    </View>

                    <View className="flex-1">
                        <AccessibleText weight="bold" className="text-text text-sm uppercase tracking-widest">
                            {achievement.title}
                        </AccessibleText>
                        <AccessibleText className="text-text-secondary text-xs mt-1">
                            {achievement.description}
                        </AccessibleText>

                        {!unlocked && progress > 0 && (
                            <View className="mt-3">
                                <View className="h-1.5 w-full bg-surface-highlight rounded-full overflow-hidden">
                                    <View
                                        className="h-full bg-secondary"
                                        style={{ width: `${progress * 100}%` }}
                                    />
                                </View>
                                <AccessibleText className="text-[10px] text-text-muted mt-1 font-bold uppercase">
                                    {Math.round(progress * 100)}% Completado
                                </AccessibleText>
                            </View>
                        )}

                        {unlocked && (
                            <View className="mt-2 flex-row items-center gap-1">
                                <Icon name="star" size={12} variant="secondary" />
                                <AccessibleText weight="bold" className="text-secondary text-[10px] uppercase tracking-widest">
                                    +{achievement.xpReward} XP
                                </AccessibleText>
                            </View>
                        )}
                    </View>
                </View>
            </Card>
        </Animated.View>
    );
};
