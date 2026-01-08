import React, { useEffect } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { useUIStore } from '@/store/uiStore';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';
import { AccessibleText } from './AccessibleText';

const { width } = Dimensions.get('window');

export const Toast = () => {
    const { message, type, visible, hideToast } = useUIStore();
    const { theme } = useAppTheme();
    const colors = Colors[theme];
    const translateY = React.useRef(new Animated.Value(-100)).current;

    useEffect(() => {
        if (visible) {
            Animated.spring(translateY, {
                toValue: 50,
                useNativeDriver: true,
                tension: 20,
                friction: 7,
            }).start();
        } else {
            Animated.timing(translateY, {
                toValue: -100,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    if (!message && !visible) return null;

    const getIcon = () => {
        switch (type) {
            case 'success': return 'checkmark-circle';
            case 'error': return 'alert-circle';
            case 'warning': return 'warning';
            default: return 'information-circle';
        }
    };

    const getIconColor = () => {
        switch (type) {
            case 'success': return '#10b981'; // green-500
            case 'error': return '#ef4444'; // red-500
            case 'warning': return '#f59e0b'; // amber-500
            default: return colors.primary;
        }
    };

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [{ translateY }],
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                }
            ]}
            accessibilityLiveRegion="polite"
            accessibilityLabel={`Notificación: ${message}`}
        >
            <View style={styles.content}>
                <Ionicons name={getIcon()} size={24} color={getIconColor()} />
                <AccessibleText style={[styles.text, { color: colors.text }]} numberOfLines={2}>
                    {message}
                </AccessibleText>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 20,
        right: 20,
        zIndex: 9999,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    text: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
    },
});
