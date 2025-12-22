import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
    useAnimatedProps,
    useSharedValue,
    withTiming,
    interpolate
} from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface SleepScoreRingProps {
    score: number;
    size?: number;
    strokeWidth?: number;
}

export default function SleepScoreRing({
    score,
    size = 180,
    strokeWidth = 12
}: SleepScoreRingProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = useSharedValue(0);

    useEffect(() => {
        progress.value = withTiming(score / 100, { duration: 1500 });
    }, [score]);

    const animatedProps = useAnimatedProps(() => ({
        strokeDashoffset: circumference * (1 - progress.value),
    }));

    // Determine color based on score
    const getColor = () => {
        if (score >= 85) return '#10b981'; // Green
        if (score >= 70) return '#a855f7'; // Purple
        if (score >= 50) return '#fbbf24'; // Yellow
        return '#ef4444'; // Red
    };

    return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
                <Defs>
                    <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <Stop offset="0%" stopColor="#a855f7" />
                        <Stop offset="100%" stopColor="#6366f1" />
                    </LinearGradient>
                </Defs>
                {/* Background Circle */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                />
                {/* Progress Circle */}
                <AnimatedCircle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="url(#grad)"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    animatedProps={animatedProps}
                    strokeLinecap="round"
                    fill="transparent"
                />
            </Svg>
            <View className="absolute inset-0 items-center justify-center">
                <Text className="text-white text-4xl font-bold">{score}</Text>
                <Text className="text-gray-400 text-xs font-medium uppercase tracking-widest">Score</Text>
            </View>
        </View>
    );
}
