import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface PremiumBadgeProps {
    size?: 'sm' | 'md' | 'lg';
    label?: string;
}

export const PremiumBadge: React.FC<PremiumBadgeProps> = ({
    size = 'md',
    label = 'PRO'
}) => {
    const getSizeStyles = () => {
        switch (size) {
            case 'sm':
                return { container: 'px-2 py-0.5', text: 'text-xs', icon: 12 };
            case 'lg':
                return { container: 'px-4 py-2', text: 'text-base', icon: 18 };
            default:
                return { container: 'px-3 py-1', text: 'text-sm', icon: 14 };
        }
    };

    const styles = getSizeStyles();

    return (
        <View className="rounded-full overflow-hidden">
            <LinearGradient
                colors={['#f59e0b', '#f97316']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className={`flex-row items-center ${styles.container}`}
            >
                <Ionicons name="star" size={styles.icon} color="#ffffff" />
                <Text className={`ml-1 font-bold text-white ${styles.text}`}>
                    {label}
                </Text>
            </LinearGradient>
        </View>
    );
};
