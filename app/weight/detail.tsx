import React from 'react';
import { View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useWeightStore, BodyMeasurements } from '@/store/weightStore';
import { MEASUREMENT_LABELS } from '@/utils/measurementInstructions';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { AccessibleText } from '@/components/ui/AccessibleText';
import { Card } from '@/components/ui/Card';

export default function WeightDetailScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ weightId: string }>();
    const weightId = params.weightId;
    const { theme } = useAppTheme();
    const colors = Colors[theme];

    const { logs } = useWeightStore();
    const weightLog = logs.find(log => log.id === weightId);

    if (!weightLog) {
        return (
            <ScreenWrapper bg="bg-background">
                <View className="p-4 items-center justify-center flex-1">
                    <AccessibleText className="text-text">Registro no encontrado</AccessibleText>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="mt-4 bg-primary px-6 py-3 rounded-xl">
                        <AccessibleText weight="bold" className="text-white">Volver</AccessibleText>
                    </TouchableOpacity>
                </View>
            </ScreenWrapper>
        );
    }

    const date = new Date(weightLog.date);
    const formattedDate = date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Get all weight logs sorted by date
    const allWeights = [...logs].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const currentIndex = allWeights.findIndex(w => w.id === weightLog.id);
    const previousWeight = currentIndex < allWeights.length - 1 ? allWeights[currentIndex + 1] : null;
    const weightChange = previousWeight ? weightLog.weight - previousWeight.weight : 0;

    // Get measurements as array
    const measurements = weightLog.measurements
        ? Object.entries(weightLog.measurements)
            .filter(([_, value]) => value !== undefined)
            .map(([key, value]) => ({
                key: key as keyof BodyMeasurements,
                label: MEASUREMENT_LABELS[key] || key,
                value: value!,
                unit: key === 'bodyFat' ? '%' : key === 'leanMass' || key === 'weight' ? 'kg' : 'cm'
            }))
        : [];

    return (
        <ScreenWrapper bg="bg-background" safeArea={true}>
            {/* Header */}
            <View className="flex-row items-center justify-between p-4 border-b border-border/10">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <AccessibleText weight="bold" className="text-text text-xl">Detalle de Peso</AccessibleText>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
                {/* Main Weight Card */}
                <Card variant="glass" className="p-6 mb-4 items-center">
                    <AccessibleText className="text-text-muted text-sm mb-2">{formattedDate}</AccessibleText>
                    <View className="flex-row items-baseline mb-2">
                        <AccessibleText weight="bold" className="text-text text-6xl">{weightLog.weight}</AccessibleText>
                        <AccessibleText className="text-text-muted text-xl ml-2">kg</AccessibleText>
                    </View>

                    {weightChange !== 0 && (
                        <View className="flex-row items-center mt-4 bg-surface-highlight px-3 py-1 rounded-full">
                            <Ionicons
                                name={weightChange > 0 ? 'trending-up' : 'trending-down'}
                                size={20}
                                color={weightChange > 0 ? colors.error : colors.success}
                            />
                            <AccessibleText weight="bold" className="ml-2" style={{ color: weightChange > 0 ? colors.error : colors.success }}>
                                {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} kg
                            </AccessibleText>
                            <AccessibleText className="text-text-muted ml-2 text-xs">desde último registro</AccessibleText>
                        </View>
                    )}
                </Card>

                {/* Measurements Section */}
                {measurements.length > 0 && (
                    <Card variant="glass" className="p-4 mb-4">
                        <View className="flex-row items-center mb-4">
                            <Ionicons name="body" size={20} color={colors.primary} />
                            <AccessibleText weight="bold" className="text-text text-lg ml-2">Medidas Corporales</AccessibleText>
                        </View>
                        <View className="gap-3">
                            {measurements.map((measurement, index) => (
                                <View
                                    key={measurement.key}
                                    className={`flex-row justify-between items-center py-2 ${index < measurements.length - 1 ? 'border-b border-border/10' : ''}`}>
                                    <AccessibleText className="text-text-secondary">{measurement.label}</AccessibleText>
                                    <AccessibleText weight="bold" className="text-text">
                                        {measurement.value} {measurement.unit}
                                    </AccessibleText>
                                </View>
                            ))}
                        </View>
                    </Card>
                )}

                {/* Photo Section */}
                {weightLog.photoUri && (
                    <Card variant="glass" className="p-4 mb-4">
                        <AccessibleText weight="bold" className="text-text text-lg mb-3">Foto de Progreso</AccessibleText>
                        <Image
                            source={{ uri: weightLog.photoUri }}
                            style={{ width: '100%', height: 400, borderRadius: 12 }}
                            resizeMode="cover"
                        />
                    </Card>
                )}

                {/* Photo Comparison */}
                {weightLog.photoUri && previousWeight?.photoUri && (
                    <Card variant="glass" className="p-4 mb-4">
                        <AccessibleText weight="bold" className="text-text text-lg mb-3">Comparación</AccessibleText>
                        <View className="flex-row gap-2">
                            <View className="flex-1">
                                <AccessibleText className="text-text-muted text-sm mb-2">Anterior</AccessibleText>
                                <Image
                                    source={{ uri: previousWeight.photoUri }}
                                    style={{ width: '100%', height: 200, borderRadius: 8 }}
                                    resizeMode="cover"
                                />
                                <AccessibleText className="text-text-muted text-center mt-2">
                                    {previousWeight.weight} kg
                                </AccessibleText>
                            </View>
                            <View className="flex-1">
                                <AccessibleText className="text-primary text-sm mb-2">Actual</AccessibleText>
                                <Image
                                    source={{ uri: weightLog.photoUri }}
                                    style={{ width: '100%', height: 200, borderRadius: 8 }}
                                    resizeMode="cover"
                                />
                                <AccessibleText weight="bold" className="text-text text-center mt-2">
                                    {weightLog.weight} kg
                                </AccessibleText>
                            </View>
                        </View>
                    </Card>
                )}

                {/* Notes Section */}
                {weightLog.note && (
                    <Card variant="glass" className="p-4 mb-4">
                        <AccessibleText weight="bold" className="text-text text-lg mb-2">Notas</AccessibleText>
                        <AccessibleText className="text-text-secondary">{weightLog.note}</AccessibleText>
                    </Card>
                )}

                {/* Stats Card */}
                <Card variant="glass" className="p-4 mb-8">
                    <AccessibleText weight="bold" className="text-text text-lg mb-3">Estadísticas</AccessibleText>
                    <View className="flex-row justify-between mb-2">
                        <AccessibleText className="text-text-secondary">Registros totales</AccessibleText>
                        <AccessibleText weight="bold" className="text-text">{allWeights.length}</AccessibleText>
                    </View>
                    <View className="flex-row justify-between mb-2">
                        <AccessibleText className="text-text-secondary">Peso inicial</AccessibleText>
                        <AccessibleText weight="bold" className="text-text">
                            {allWeights[allWeights.length - 1]?.weight} kg
                        </AccessibleText>
                    </View>
                    <View className="flex-row justify-between">
                        <AccessibleText className="text-text-secondary">Cambio total</AccessibleText>
                        <AccessibleText weight="bold" className={weightLog.weight - allWeights[allWeights.length - 1]?.weight > 0
                            ? 'text-error'
                            : 'text-success'
                        }>
                            {weightLog.weight - allWeights[allWeights.length - 1]?.weight > 0 ? '+' : ''}
                            {(weightLog.weight - allWeights[allWeights.length - 1]?.weight).toFixed(1)} kg
                        </AccessibleText>
                    </View>
                </Card>
            </ScrollView>
        </ScreenWrapper>
    );
}
