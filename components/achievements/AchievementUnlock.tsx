import React, { useEffect } from 'react';
import { View, TouchableOpacity } from 'react-native';
import Animated, { SlideInUp, SlideOutUp } from 'react-native-reanimated';
import { useAchievementsStore } from '@/store/achievementsStore';
import { AchievementBadge } from './AchievementBadge';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const AchievementUnlock = () => {
    const { achievementQueue, removeFromQueue } = useAchievementsStore();
    const insets = useSafeAreaInsets();

    const currentAchievement = achievementQueue[0];

    useEffect(() => {
        if (currentAchievement) {
            // Auto dismiss after 4 seconds
            const timer = setTimeout(() => {
                removeFromQueue();
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [currentAchievement, removeFromQueue]);

    if (!currentAchievement) return null;

    return (
        <Animated.View
            entering={SlideInUp.springify().damping(15)}
            exiting={SlideOutUp}
            style={{
                position: 'absolute',
                top: insets.top + 10,
                left: 20,
                right: 20,
                zIndex: 10000
            }}
        >
            <TouchableOpacity onPress={removeFromQueue} activeOpacity={0.9}>
                <AchievementBadge
                    achievement={currentAchievement}
                    unlocked={true}
                />
            </TouchableOpacity>
        </Animated.View>
    );
};
