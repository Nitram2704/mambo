import React from 'react';
import {
    View,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    ViewStyle
} from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';

interface ScreenWrapperProps {
    children: React.ReactNode;
    safeArea?: boolean;
    edges?: Edge[];
    scrollable?: boolean;
    className?: string;
    contentContainerClassName?: string;
    bg?: string;
    style?: ViewStyle;
    headerTitle?: string;
}

import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { TouchableOpacity, Text } from 'react-native';

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
    children,
    safeArea = true,
    edges = ['top', 'left', 'right'],
    scrollable = false,
    className = '',
    contentContainerClassName = '',
    bg = 'bg-background',
    style,
    headerTitle
}) => {
    const { theme, isDark } = useAppTheme();
    const router = useRouter();
    const Container = safeArea ? SafeAreaView : View;
    const Content = scrollable ? ScrollView : View;

    return (
        <Container
            style={[{ flex: 1, backgroundColor: Colors[theme].background }, style]}
            className={className}
            edges={edges}
        >
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            {headerTitle && (
                <View className="flex-row items-center px-4 py-3 border-b" style={{ borderBottomColor: Colors[theme].surfaceHighlight }}>
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <Ionicons name="arrow-back" size={24} color={Colors[theme].text} />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold" style={{ color: Colors[theme].text }}>{headerTitle}</Text>
                </View>
            )}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                {scrollable ? (
                    <ScrollView
                        className="flex-1"
                        contentContainerClassName={contentContainerClassName}
                        showsVerticalScrollIndicator={false}
                    >
                        {children}
                    </ScrollView>
                ) : (
                    <View className={`flex-1 ${contentContainerClassName}`}>
                        {children}
                    </View>
                )}
            </KeyboardAvoidingView>
        </Container>
    );
};
