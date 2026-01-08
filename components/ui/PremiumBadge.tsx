import React from 'react';
import { View, Text } from 'react-native';
import { Icon } from './Icon';
import { Colors } from '@/constants/Colors';
import { SubscriptionTier } from '@/constants/SubscriptionConfig';

interface PremiumBadgeProps {
    tier?: SubscriptionTier; // 'PRO' or 'ELITE', defaults to PRO
    size?: 'sm' | 'md' | 'lg';
}

export function PremiumBadge({ tier = 'PRO', size = 'sm' }: PremiumBadgeProps) {
    const isElite = tier === 'ELITE';
    const color = isElite ? '#fbbf24' : '#8b5cf6'; // Amber for Elite, Violet for Pro

    const sizeClasses = {
        sm: 'px-1.5 py-0.5',
        md: 'px-2 py-1',
        lg: 'px-3 py-1.5'
    };

    const textSizes = {
        sm: 'text-[8px]',
        md: 'text-[10px]',
        lg: 'text-xs'
    };

    const iconSizes = {
        sm: 8,
        md: 10,
        lg: 12
    };

    return (
        <View
            className={`flex-row items-center rounded-full border ${sizeClasses[size]}`}
            style={{
                backgroundColor: `${color}20`,
                borderColor: `${color}40`
            }}
        >
            <Icon
                name={isElite ? "sparkles" : "star"}
                size={iconSizes[size]}
                color={color}
            />
            <Text
                className={`font-black ml-1 ${textSizes[size]}`}
                style={{ color }}
            >
                {tier}
            </Text>
        </View>
    );
}
