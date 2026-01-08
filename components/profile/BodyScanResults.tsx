import React from 'react';
import { View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';
import { AccessibleText } from '@/components/ui/AccessibleText';
import { Card } from '@/components/ui/Card';
import { BodyScanResult } from '@/utils/bodyScanService';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface BodyScanResultsProps {
    result: BodyScanResult;
}

export const BodyScanResults: React.FC<BodyScanResultsProps> = ({ result }) => {
    const { theme } = useAppTheme();
    const colors = Colors[theme];

    const MetricRow = ({ label, value, icon, suffix = '%' }: { label: string, value: number, icon: string, suffix?: string }) => (
        <View className="mb-4">
            <View className="flex-row justify-between items-center mb-2">
                <View className="flex-row items-center">
                    <Ionicons name={icon as any} size={18} color={colors.primary} className="mr-2" />
                    <AccessibleText weight="bold">{label}</AccessibleText>
                </View>
                <AccessibleText weight="bold" className="text-primary">{value}{suffix}</AccessibleText>
            </View>
            <View className="h-2 bg-surface-highlight rounded-full overflow-hidden" style={{ backgroundColor: colors.surfaceHighlight }}>
                <Animated.View
                    entering={FadeInDown.delay(200)}
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${Math.min(value, 100)}%`, backgroundColor: colors.primary }}
                />
            </View>
        </View>
    );

    return (
        <View className="py-4">
            <Animated.View entering={FadeInDown.duration(500)}>
                <Card variant="glass" className="p-6 mb-6">
                    <AccessibleText variant="h3" weight="bold" className="mb-6">Análisis de Estética</AccessibleText>

                    <MetricRow label="V-Taper (Hombros/Cintura)" value={result.metrics.vTaper} icon="triangle-outline" />
                    <MetricRow label="Simetría Muscular" value={result.metrics.symmetry} icon="git-compare-outline" />
                    <MetricRow label="Masa Muscular" value={result.metrics.muscleMass} icon="fitness-outline" />
                    <MetricRow label="Definición (Grasa Est.)" value={result.metrics.definition} icon="water-outline" suffix="%" />
                    <MetricRow label="Potencial Genético" value={result.metrics.potential} icon="flash-outline" />
                </Card>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(200).duration(500)}>
                <Card variant="glass" className="p-6 mb-6 border-primary/20">
                    <View className="flex-row items-center mb-4">
                        <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-3">
                            <Ionicons name="leaf-outline" size={20} color={colors.primary} />
                        </View>
                        <View>
                            <AccessibleText weight="bold">Probabilidad Natural</AccessibleText>
                            <AccessibleText variant="caption" className="text-text-secondary">Basado en volumen y definición</AccessibleText>
                        </View>
                        <View className="flex-1 items-end">
                            <AccessibleText variant="h3" weight="bold" className="text-primary">{result.naturalProbability}%</AccessibleText>
                        </View>
                    </View>
                </Card>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(400).duration(500)}>
                <Card variant="glass" className="p-6 mb-6">
                    <AccessibleText weight="bold" className="mb-4">Puntos Fuertes</AccessibleText>
                    <View className="flex-row flex-wrap">
                        {result.insights.strongPoints.map((point, i) => (
                            <View key={i} className="bg-success/10 px-3 py-1 rounded-full mr-2 mb-2 flex-row items-center">
                                <Ionicons name="checkmark" size={14} color={colors.success} className="mr-1" />
                                <AccessibleText variant="caption" className="text-success">{point}</AccessibleText>
                            </View>
                        ))}
                    </View>

                    <AccessibleText weight="bold" className="mt-4 mb-4">Puntos a Mejorar</AccessibleText>
                    <View className="flex-row flex-wrap">
                        {result.insights.weakPoints.map((point, i) => (
                            <View key={i} className="bg-warning/10 px-3 py-1 rounded-full mr-2 mb-2 flex-row items-center">
                                <Ionicons name="alert-circle-outline" size={14} color={colors.warning} className="mr-1" />
                                <AccessibleText variant="caption" className="text-warning">{point}</AccessibleText>
                            </View>
                        ))}
                    </View>
                </Card>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(600).duration(500)}>
                <Card variant="glass" className="p-6 bg-primary/5 border-primary/10">
                    <AccessibleText weight="bold" className="mb-2">Consejo del Coach</AccessibleText>
                    <AccessibleText className="text-text-secondary italic">
                        &quot;{result.insights.generalAdvice}&quot;
                    </AccessibleText>
                </Card>
            </Animated.View>
        </View>
    );
};
