import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

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
            colors={['rgba(30, 41, 59, 0.7)', 'rgba(15, 23, 42, 0.8)']}
            className="rounded-2xl p-5 border border-white/10 mb-6"
        >
            <View className="flex-row justify-between items-end mb-3">
                <View>
                    <Text className="text-gray-400 text-xs uppercase font-bold mb-1 tracking-wider">Nivel Actual</Text>
                    <View className="flex-row items-baseline">
                        <Text className="text-white text-4xl font-bold mr-2">{level}</Text>
                        <LinearGradient
                            colors={['#60a5fa', '#a78bfa']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            className="px-2 py-0.5 rounded-md"
                        >
                            <Text className="text-white font-bold text-xs uppercase">{title}</Text>
                        </LinearGradient>
                    </View>
                </View>
                <View className="items-end">
                    <Text className="text-gray-400 text-xs mb-1 font-medium">XP Total</Text>
                    <Text className="text-white font-bold text-lg">
                        {currentXp.toLocaleString()} <Text className="text-gray-500 text-sm">/ {nextLevelXp.toLocaleString()}</Text>
                    </Text>
                </View>
            </View>

            {/* Progress Bar Container */}
            <View className="h-4 bg-gray-900/50 rounded-full overflow-hidden border border-white/5 relative mb-2">
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

            <Text className="text-gray-400 text-xs text-center font-medium">
                Faltan {Math.round(nextLevelXp - currentXp).toLocaleString()} XP para subir de nivel
            </Text>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    fill: {
        height: '100%',
        borderRadius: 999,
    },
});
