import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
    withSequence,
    Easing,
    FadeIn
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { AccessibleText } from './AccessibleText';
import { Colors } from '@/constants/Colors';
import { useAppTheme } from '@/hooks/use-app-theme';

const { width } = Dimensions.get('window');

interface LoadingScreenProps {
    message?: string;
    variant?: 'fullscreen' | 'overlay';
}

/**
 * LoadingScreen - A premium reusable loading component for Mambo.
 * Features:
 * - Reanimated pulse and rotation effects.
 * - Integration with the app theme.
 * - Accessible text support.
 */
export const LoadingScreen: React.FC<LoadingScreenProps> = ({
    message = 'Cargando...',
    variant = 'fullscreen'
}) => {
    const { theme } = useAppTheme();
    const colors = Colors[theme];

    const rotation = useSharedValue(0);
    const scale = useSharedValue(1);

    useEffect(() => {
        rotation.value = withRepeat(
            withTiming(360, { duration: 2000, easing: Easing.linear }),
            -1
        );
        scale.value = withRepeat(
            withSequence(
                withTiming(1.2, { duration: 800, easing: Easing.bezier(0.4, 0, 0.2, 1) }),
                withTiming(1, { duration: 800, easing: Easing.bezier(0.4, 0, 0.2, 1) })
            ),
            -1
        );
    }, []);

    const spinnerStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }],
    }));

    const logoPulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const Content = (
        <Animated.View
            entering={FadeIn.duration(400)}
            style={styles.container}
        >
            <View style={styles.centerBox}>
                <Animated.View style={[styles.pulseCircle, logoPulseStyle, { borderColor: colors.primary }]} />
                <Animated.View style={[styles.spinner, spinnerStyle, { borderTopColor: colors.primary }]} />

                <View style={styles.logoPlaceholder}>
                    {/* We'll replace this with the actual logo later */}
                    <View style={[styles.dot, { backgroundColor: colors.primary }]} />
                </View>
            </View>

            <AccessibleText weight="bold" style={[styles.message, { color: colors.text }]}>
                {message}
            </AccessibleText>
        </Animated.View>
    );

    if (variant === 'overlay') {
        return (
            <View style={[StyleSheet.absoluteFill, styles.overlay]}>
                <BlurView intensity={20} style={StyleSheet.absoluteFill} />
                {Content}
            </View>
        );
    }

    return (
        <View style={[styles.fullscreen, { backgroundColor: colors.background }]}>
            {Content}
        </View>
    );
};

const styles = StyleSheet.create({
    fullscreen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlay: {
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerBox: {
        width: 100,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    pulseCircle: {
        position: 'absolute',
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        opacity: 0.3,
    },
    spinner: {
        position: 'absolute',
        width: 90,
        height: 90,
        borderRadius: 45,
        borderWidth: 3,
        borderLeftColor: 'transparent',
        borderBottomColor: 'transparent',
        borderRightColor: 'transparent',
    },
    logoPlaceholder: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    message: {
        fontSize: 16,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
});
