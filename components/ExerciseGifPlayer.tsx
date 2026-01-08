import React from 'react';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';
import { AccessibleText } from '@/components/ui/AccessibleText';
import { View, Image, ActivityIndicator, Dimensions } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GIF_HEIGHT = (SCREEN_WIDTH * 9) / 16; // 16:9 aspect ratio

interface ExerciseGifPlayerProps {
    gifUrl?: string;
    fallbackText?: string;
    className?: string;
}

export function ExerciseGifPlayer({
    gifUrl,
    fallbackText = "Vista previa no disponible",
    className = ""
}: ExerciseGifPlayerProps) {
    const [isLoading, setIsLoading] = React.useState(true);
    const [hasError, setHasError] = React.useState(false);
    const { theme } = useAppTheme();
    const colors = Colors[theme];

    if (!gifUrl) {
        return (
            <View className={`bg-surface-highlight border border-border/10 rounded-xl items-center justify-center ${className}`}
                style={{ height: GIF_HEIGHT }}>
                <Ionicons name="image-outline" size={48} color={colors.textMuted} />
                <AccessibleText

                    className="text-text-muted text-center mt-2 px-4">
                    {fallbackText}
                </AccessibleText>
            </View>
        );
    }

    return (
        <View className={`relative ${className}`}>
            <Image
                source={{ uri: gifUrl }}
                style={{
                    width: SCREEN_WIDTH - 32,
                    height: GIF_HEIGHT,
                    borderRadius: 12,
                }}
                resizeMode="contain"
                onLoadStart={() => setIsLoading(true)}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                    setIsLoading(false);
                    setHasError(true);
                }}
            />

            {isLoading && (
                <View className="absolute inset-0 bg-surface-highlight border border-border/10 rounded-xl items-center justify-center">
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            )}

            {hasError && (
                <View className="absolute inset-0 bg-surface-highlight border border-border/10 rounded-xl items-center justify-center">
                    <Ionicons name="image-outline" size={48} color={colors.textMuted} />
                    <AccessibleText

                        className="text-text-muted text-center mt-2 px-4">
                        Error al cargar GIF
                    </AccessibleText>
                </View>
            )}
        </View>
    );
}