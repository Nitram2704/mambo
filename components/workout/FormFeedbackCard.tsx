import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { AccessibleText } from '@/components/ui/AccessibleText';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';
import { FormCheckResult } from '@/utils/formCheckService';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated';

interface FormFeedbackCardProps {
    result: FormCheckResult;
}

export function FormFeedbackCard({ result }: FormFeedbackCardProps) {
    const { theme } = useAppTheme();
    const colors = Colors[theme];

    const getScoreColor = (score: number) => {
        if (score >= 80) return colors.success;
        if (score >= 60) return colors.warning;
        return colors.error;
    };

    return (
        <View className="space-y-4">
            {/* Score Card with Technique Meter */}
            <Animated.View entering={ZoomIn.duration(600).springify()}>
                <Card variant="glass" className="p-6 items-center overflow-hidden">
                    <AccessibleText weight="bold" className="text-text-secondary text-xs uppercase tracking-widest mb-4">
                        Puntuación de Técnica
                    </AccessibleText>

                    {/* Technique Meter (Gauge) */}
                    <View className="w-48 h-48 items-center justify-center relative">
                        <View className="w-40 h-40 rounded-full border-8 border-white/5 items-center justify-center">
                            <View
                                className="absolute inset-0 rounded-full border-8"
                                style={{
                                    borderColor: getScoreColor(result.score),
                                    opacity: 0.2
                                }}
                            />
                            <AccessibleText weight="bold" className="text-6xl" style={{ color: getScoreColor(result.score) }}>
                                {result.score}
                            </AccessibleText>
                        </View>

                        {/* Animated Needle or Indicator could go here, but keeping it clean for now */}
                    </View>

                    <AccessibleText weight="bold" className="text-text text-lg mt-4 text-center">
                        {result.score >= 80 ? '¡Excelente técnica!' : result.score >= 60 ? 'Buena técnica, con margen de mejora' : 'Necesita correcciones importantes'}
                    </AccessibleText>
                    <AccessibleText className="text-text-secondary text-sm text-center mt-2 px-4">
                        Mambo Coach ha analizado tu movimiento y estos son los resultados.
                    </AccessibleText>
                </Card>
            </Animated.View>

            {/* Strengths */}
            {result.analysis.strengths.length > 0 && (
                <Animated.View entering={FadeInUp.delay(200).duration(500)}>
                    <Card variant="glass" className="p-4 border-success/30">
                        <View className="flex-row items-center mb-3">
                            <View className="w-8 h-8 rounded-full bg-success/20 items-center justify-center mr-3">
                                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                            </View>
                            <AccessibleText weight="bold" className="text-text text-lg">Puntos Fuertes</AccessibleText>
                        </View>
                        {result.analysis.strengths.map((strength, index) => (
                            <View key={index} className="flex-row items-start mb-2">
                                <Ionicons name="checkmark" size={16} color={colors.success} style={{ marginTop: 2, marginRight: 8 }} />
                                <AccessibleText className="text-text flex-1">{strength}</AccessibleText>
                            </View>
                        ))}
                    </Card>
                </Animated.View>
            )}

            {/* Issues */}
            {result.analysis.issues.length > 0 && (
                <Animated.View entering={FadeInUp.delay(400).duration(500)}>
                    <Card variant="glass" className="p-4 border-warning/30">
                        <View className="flex-row items-center mb-3">
                            <View className="w-8 h-8 rounded-full bg-warning/20 items-center justify-center mr-3">
                                <Ionicons name="alert-circle" size={20} color={colors.warning} />
                            </View>
                            <AccessibleText weight="bold" className="text-text text-lg">Problemas Detectados</AccessibleText>
                        </View>
                        {result.analysis.issues.map((issue, index) => (
                            <View key={index} className="flex-row items-start mb-2">
                                <Ionicons name="close-circle" size={16} color={colors.warning} style={{ marginTop: 2, marginRight: 8 }} />
                                <AccessibleText className="text-text flex-1">{issue}</AccessibleText>
                            </View>
                        ))}
                    </Card>
                </Animated.View>
            )}

            {/* Corrections */}
            {result.analysis.corrections.length > 0 && (
                <Animated.View entering={FadeInUp.delay(600).duration(500)}>
                    <Card variant="glass" className="p-4 border-primary/30">
                        <View className="flex-row items-center mb-3">
                            <View className="w-8 h-8 rounded-full bg-primary/20 items-center justify-center mr-3">
                                <Ionicons name="bulb" size={20} color={colors.primary} />
                            </View>
                            <AccessibleText weight="bold" className="text-text text-lg">Correcciones</AccessibleText>
                        </View>
                        {result.analysis.corrections.map((correction, index) => (
                            <View key={index} className="flex-row items-start mb-2">
                                <Ionicons name="arrow-forward" size={16} color={colors.primary} style={{ marginTop: 2, marginRight: 8 }} />
                                <AccessibleText className="text-text flex-1">{correction}</AccessibleText>
                            </View>
                        ))}
                    </Card>
                </Animated.View>
            )}

            {/* Key Points */}
            {result.keyPoints && Object.keys(result.keyPoints).length > 0 && (
                <Animated.View entering={FadeInUp.delay(800).duration(500)}>
                    <Card variant="glass" className="p-4">
                        <AccessibleText weight="bold" className="text-text text-lg mb-3">Puntos Clave</AccessibleText>
                        <View className="flex-row flex-wrap gap-2">
                            {Object.entries(result.keyPoints).map(([key, value]) => (
                                value && (
                                    <View key={key} className="bg-surface-highlight/50 px-3 py-2 rounded-xl border border-white/5 min-w-[45%] flex-1">
                                        <AccessibleText weight="bold" className="text-text-secondary text-[10px] uppercase tracking-widest mb-1">
                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                        </AccessibleText>
                                        <AccessibleText className="text-text text-xs">{value}</AccessibleText>
                                    </View>
                                )
                            ))}
                        </View>
                    </Card>
                </Animated.View>
            )}
        </View>
    );
}
