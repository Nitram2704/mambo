import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { AccessibleText } from '../ui/AccessibleText';
import { Colors } from '@/constants/Colors';
import { useAppTheme } from '@/hooks/use-app-theme';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

export function PremiumLoading() {
    const { theme } = useAppTheme();
    const colors = Colors[theme];
    const [step, setStep] = useState(0);

    const steps = [
        "Subiendo video a la nube...",
        "Analizando biomecánica...",
        "Detectando puntos clave...",
        "Generando recomendaciones...",
        "Finalizando reporte..."
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    return (
        <View className="items-center py-8">
            <View className="mb-6">
                <ActivityIndicator size="large" color={colors.secondary} />
            </View>

            <Animated.View
                key={step}
                entering={FadeIn.duration(500)}
                exiting={FadeOut.duration(500)}
                className="items-center"
            >
                <AccessibleText weight="bold" className="text-white text-lg text-center mb-2">
                    {steps[step]}
                </AccessibleText>
                <AccessibleText className="text-white/60 text-sm text-center">
                    Mambo Coach está revisando tu técnica
                </AccessibleText>
            </Animated.View>

            {/* Progress Bar */}
            <View className="w-64 h-1.5 bg-white/10 rounded-full mt-8 overflow-hidden">
                <Animated.View
                    className="h-full bg-secondary"
                    style={{ width: `${((step + 1) / steps.length) * 100}%` }}
                />
            </View>
        </View>
    );
}
