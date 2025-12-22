import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing } from 'react-native';

interface SkeletonProps {
    width?: number | string;
    height?: number | string;
    variant?: 'rect' | 'circle' | 'rounded';
    className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    width = '100%',
    height = 20,
    variant = 'rounded',
    className = ''
}) => {
    const opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 0.7,
                    duration: 800,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.3,
                    duration: 800,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        );

        animation.start();
        return () => animation.stop();
    }, [opacity]);

    const borderRadius =
        variant === 'circle' ? 9999 :
            variant === 'rounded' ? 12 : 0;

    return (
        <Animated.View
            style={{
                width,
                height,
                borderRadius,
                opacity,
            }}
            className={`bg-surface-highlight ${className}`}
        />
    );
};
