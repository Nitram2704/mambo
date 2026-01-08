import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { AccessibleText } from './ui/AccessibleText';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';

interface LevelProgressBarProps {
    level: number;
    title: string;
    progress: number; // 0 to 1
    currentXp: number;
    nextLevelXp: number;
}

export const LevelProgressBar: React.FC<LevelProgressBarProps> = ({
    level,
    title,
    progress,
    currentXp,
    nextLevelXp
}) => {
    const { theme } = useAppTheme();
    const progressWidth = useSharedValue(0);

    useEffect(() => {
        progressWidth.value = withSpring(progress * 100);
    }, [progress, progressWidth]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            width: `${progressWidth.value}%`,
        };
    });

    return (
        <LinearGradient
            colors={theme === 'dark'
                ? ['rgba(30, 41, 59, 0.7)', 'rgba(15, 23, 42, 0.8)']
                : [Colors[theme].surfaceHighlight + '20', Colors[theme].surfaceHighlight + '40']}
            className="rounded-2xl p-5 border border-border/10 mb-6"
            accessibilityLabel={`Nivel ${level}, ${title}, ${Math.round(progress * 100)}% de progreso hacia el siguiente nivel`}
        >
            <View className="flex-row justify-between items-end mb-3">
                <View>
                    <AccessibleText weight="bold" className="text-text-secondary text-xs uppercase mb-1 tracking-wider">Nivel Actual</AccessibleText>
                    <View className="flex-row items-baseline">
                        <AccessibleText weight="bold" className="text-text text-4xl mr-2">{level}</AccessibleText>
                        <LinearGradient
                            colors={['#60a5fa', '#a78bfa']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            className="px-2 py-0.5 rounded-md"
                        >
                            <AccessibleText weight="bold" className="text-white text-xs uppercase">{title}</AccessibleText>
                        </LinearGradient>
                    </View>
                </View>
                <View className="items-end">
                    <AccessibleText weight="medium" className="text-text-secondary text-xs mb-1">XP Total</AccessibleText>
                    <AccessibleText weight="bold" className="text-text text-lg">
                        {currentXp.toLocaleString()} <AccessibleText className="text-text-muted text-sm">/ {nextLevelXp.toLocaleString()}</AccessibleText>
                    </AccessibleText>
                </View>
            </View>

            {/* Progress Bar Container */}
            <View className="h-4 bg-surface-highlight/30 rounded-full overflow-hidden border border-border/10 relative mb-2">
                {/* Animated Fill */}
                <Animated.View style={[styles.fill, animatedStyle]}>
                    <LinearGradient
                        colors={['#3b82f6', '#8b5cf6']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={StyleSheet.absoluteFill}
                    />
                </Animated.View>
            </View>

            <AccessibleText weight="medium" className="text-text-secondary text-xs text-center">
                Faltan {Math.round(nextLevelXp - currentXp).toLocaleString()} XP para subir de nivel
            </AccessibleText>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    fill: {
        height: '100%',
        borderRadius: 999,
    },
});
