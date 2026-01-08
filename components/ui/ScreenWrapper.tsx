import React from 'react';
import {
    View,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    ViewStyle,
    TouchableOpacity,
} from 'react-native';
import { cssInterop } from 'react-native-css-interop';
import { Edge, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AccessibleText } from './AccessibleText';
import { a11y } from '@/utils/accessibility';

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
    header?: React.ReactNode;
    pureBlack?: boolean;
    footer?: React.ReactNode;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
    children,
    safeArea = true,
    edges = ['top', 'left', 'right', 'bottom'],
    scrollable = false,
    className = '',
    contentContainerClassName = '',
    bg = 'bg-background',
    style,
    headerTitle,
    header,
    pureBlack = false,
    footer
}) => {
    const { theme, isDark } = useAppTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    return (
        <View
            style={[
                {
                    flex: 1,
                    backgroundColor: pureBlack ? '#000000' : Colors[theme].background,
                    paddingTop: edges.includes('top') ? insets.top : 0,
                    paddingLeft: edges.includes('left') ? insets.left : 0,
                    paddingRight: edges.includes('right') ? insets.right : 0,
                },
                style
            ]}
            className={className}
        >
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            {header ? header : headerTitle && (
                <View className="flex-row items-center px-4 py-3 border-b" style={{ borderBottomColor: Colors[theme].surfaceHighlight }}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="mr-4"
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        {...a11y.button('Volver', 'Regresa a la pantalla anterior')}
                    >
                        <Ionicons name="arrow-back" size={24} color={Colors[theme].text} />
                    </TouchableOpacity>
                    <AccessibleText variant="h3" weight="bold" style={{ color: Colors[theme].text }}>{headerTitle}</AccessibleText>
                </View>
            )}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                {scrollable ? (
                    <ScrollView
                        className="flex-1"
                        contentContainerClassName={contentContainerClassName}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {children}
                    </ScrollView>
                ) : (
                    <View className={`flex-1 ${contentContainerClassName}`}>
                        {children}
                    </View>
                )}
                {footer && (
                    <View style={{
                        paddingBottom: Math.max(insets.bottom + 16, 60),
                        backgroundColor: Colors[theme].background,
                        paddingTop: 8,
                        borderTopWidth: 1,
                        borderTopColor: Colors[theme].surfaceHighlight
                    }}>
                        {footer}
                    </View>
                )}
            </KeyboardAvoidingView>
        </View>
    );
};

cssInterop(ScreenWrapper, {
    className: {
        target: 'style',
    },
});
