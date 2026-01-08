import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AccessibleText } from './ui/AccessibleText';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';

interface EmptyStateProps {
    icon?: keyof typeof Ionicons.glyphMap;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
}

export function EmptyState({ icon = 'document-text-outline', title, description, actionLabel, onAction, className }: EmptyStateProps) {
    const { theme, triggerHaptic } = useAppTheme();

    const handlePress = () => {
        triggerHaptic('selection');
        onAction?.();
    };

    return (
        <View className={`items-center justify-center p-8 ${className}`}>
            <View className="w-16 h-16 rounded-full bg-surface-highlight items-center justify-center mb-4">
                <Ionicons name={icon} size={32} color={Colors[theme].textMuted} />
            </View>
            <AccessibleText variant="h3" weight="bold" className="text-center mb-2">
                {title}
            </AccessibleText>
            <AccessibleText className="text-text-secondary text-center mb-6 leading-5">
                {description}
            </AccessibleText>
            {actionLabel && onAction && (
                <TouchableOpacity
                    onPress={handlePress}
                    className="bg-primary px-6 py-3 rounded-xl active:opacity-80"
                >
                    <AccessibleText weight="bold" className="text-white">
                        {actionLabel}
                    </AccessibleText>
                </TouchableOpacity>
            )}
        </View>
    );
}
