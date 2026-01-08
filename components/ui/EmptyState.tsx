import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';
import { AccessibleText } from './AccessibleText';

interface EmptyStateProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    description,
    actionLabel,
    onAction,
}) => {
    const { theme } = useAppTheme();
    const colors = Colors[theme];

    return (
        <View className="flex-1 items-center justify-center p-8">
            <View
                className="w-24 h-24 rounded-full items-center justify-center mb-6"
                style={{ backgroundColor: colors.surfaceHighlight }}
            >
                <Ionicons name={icon} size={48} color={colors.primary} />
            </View>
            <AccessibleText weight="bold" className="text-xl text-center mb-3" style={{ color: colors.text }}>
                {title}
            </AccessibleText>
            <AccessibleText className="text-base text-center mb-8 leading-6" style={{ color: colors.textSecondary }}>
                {description}
            </AccessibleText>
            {actionLabel && onAction && (
                <TouchableOpacity
                    className="px-8 py-4 rounded-2xl shadow-lg"
                    style={{ backgroundColor: colors.primary }}
                    onPress={onAction}
                >
                    <AccessibleText weight="bold" className="text-white text-base">
                        {actionLabel}
                    </AccessibleText>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 12,
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
    },
    button: {
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
