import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { AccessibleText } from '@/components/ui/AccessibleText';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';
import { FormCheckResult } from '@/utils/formCheckService';
import { LinearGradient } from 'expo-linear-gradient';

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

    const getScoreGradient = (score: number): [string, string] => {
        if (score >= 80) return [colors.success, colors.green[600]];
        if (score >= 60) return [colors.warning, colors.orange[600]];
        return [colors.error, colors.error];
    };

    return (
        <View className="space-y-4">
            {/* Score Card */}
            <Card variant="glass" className="p-6 items-center">
                <AccessibleText weight="bold" className="text-text-secondary text-xs uppercase tracking-widest mb-2">
                    Puntuación de Técnica
                </AccessibleText>
                <View className="w-32 h-32 rounded-full items-center justify-center mb-4" style={{ backgroundColor: `${getScoreColor(result.score)}20` }}>
                    <AccessibleText weight="bold" className="text-6xl" style={{ color: getScoreColor(result.score) }}>
                        {result.score}
                    </AccessibleText>
                </View>
                <AccessibleText className="text-text-secondary text-sm text-center">
                    {result.score >= 80 ? '¡Excelente técnica!' : result.score >= 60 ? 'Buena técnica, con margen de mejora' : 'Necesita correcciones importantes'}
                </AccessibleText>
            </Card>

            {/* Strengths */}
            {result.analysis.strengths.length > 0 && (
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
            )}

            {/* Issues */}
            {result.analysis.issues.length > 0 && (
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
            )}

            {/* Corrections */}
            {result.analysis.corrections.length > 0 && (
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
            )}

            {/* Key Points */}
            {result.keyPoints && Object.keys(result.keyPoints).length > 0 && (
                <Card variant="glass" className="p-4">
                    <AccessibleText weight="bold" className="text-text text-lg mb-3">Puntos Clave</AccessibleText>
                    {Object.entries(result.keyPoints).map(([key, value]) => (
                        value && (
                            <View key={key} className="mb-2">
                                <AccessibleText weight="medium" className="text-text-secondary text-xs uppercase tracking-widest">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                </AccessibleText>
                                <AccessibleText className="text-text">{value}</AccessibleText>
                            </View>
                        )
                    ))}
                </Card>
            )}
        </View>
    );
}
