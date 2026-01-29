import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AccessibleText } from '../ui/AccessibleText';
import { Colors } from '@/constants/Colors';
import { useAppTheme } from '@/hooks/use-app-theme';

interface CameraOverlayProps {
    exerciseName: string;
}

export function CameraOverlay({ exerciseName }: CameraOverlayProps) {
    const { theme } = useAppTheme();
    const colors = Colors[theme];

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {/* Corner Guides */}
            <View className="flex-1 p-8 justify-between">
                <View className="flex-row justify-between">
                    <View className="w-12 h-12 border-t-4 border-l-4 border-secondary/60 rounded-tl-2xl" />
                    <View className="w-12 h-12 border-t-4 border-r-4 border-secondary/60 rounded-tr-2xl" />
                </View>

                {/* Center Guide (Human Silhouette Placeholder or Frame) */}
                <View className="items-center justify-center">
                    <View className="w-64 h-96 border-2 border-dashed border-white/20 rounded-[40px] items-center justify-center">
                        <View className="w-24 h-24 rounded-full border-2 border-dashed border-white/20 mb-4" />
                        <View className="w-48 h-48 border-2 border-dashed border-white/20 rounded-3xl" />
                    </View>
                </View>

                <View className="flex-row justify-between">
                    <View className="w-12 h-12 border-b-4 border-l-4 border-secondary/60 rounded-bl-2xl" />
                    <View className="w-12 h-12 border-b-4 border-r-4 border-secondary/60 rounded-br-2xl" />
                </View>
            </View>

            {/* Instruction Overlay */}
            <View className="absolute top-20 left-0 right-0 items-center px-10">
                <View className="bg-black/40 px-4 py-2 rounded-full border border-white/10">
                    <AccessibleText weight="bold" className="text-white text-center text-xs uppercase tracking-widest">
                        Colócate de perfil para {exerciseName}
                    </AccessibleText>
                </View>
            </View>
        </View>
    );
}
