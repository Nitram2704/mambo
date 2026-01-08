import React from 'react';
import { View, ScrollView, TouchableOpacity, Dimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { useWeightStore } from '@/store/weightStore';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { AccessibleText } from '@/components/ui/AccessibleText';
import { Card } from '@/components/ui/Card';

export default function WeightScreen() {
    const router = useRouter();
    const { logs, getLatestWeight } = useWeightStore();
    const latestWeight = getLatestWeight();
    const { theme } = useAppTheme();
    const colors = Colors[theme];

    // Calculate trend
    const getTrend = () => {
        if (logs.length < 2) return null;
        const current = logs[0].weight;
        const previous = logs[1].weight;
        const diff = current - previous;
        return {
            value: Math.abs(diff).toFixed(1),
            direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'neutral',
            color: diff > 0 ? colors.error : diff < 0 ? colors.success : colors.textMuted
        };
    };

    const trend = getTrend();

    // Prepare chart data (last 7 entries reversed for chronological order)
    const chartData = {
        labels: logs.slice(0, 7).reverse().map(l => {
            const d = new Date(l.date);
            return `${d.getDate()}/${d.getMonth() + 1}`;
        }),
        datasets: [{
            data: logs.slice(0, 7).reverse().map(l => l.weight)
        }]
    };

    // Count measurements in a log
    const getMeasurementCount = (log: typeof logs[0]) => {
        if (!log.measurements) return 0;
        return Object.values(log.measurements).filter(v => v !== undefined).length;
    };

    return (
        <ScreenWrapper bg="bg-background" safeArea={true}>
            {/* Header */}
            <View className="flex-row items-center justify-between p-4 border-b border-border/10">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <AccessibleText weight="bold" className="text-text text-xl">Peso Corporal</AccessibleText>
                <TouchableOpacity onPress={() => router.push('/weight/log-weight')}>
                    <Ionicons name="add" size={28} color={colors.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Current Weight Card */}
                <Card variant="glass" className="m-4 p-6 items-center">
                    <AccessibleText className="text-text-secondary mb-2">Peso Actual</AccessibleText>
                    <View className="flex-row items-baseline mb-2">
                        <AccessibleText weight="bold" className="text-text text-5xl">
                            {latestWeight ? latestWeight : '--'}
                        </AccessibleText>
                        <AccessibleText className="text-text-muted text-2xl ml-2">kg</AccessibleText>
                    </View>

                    {trend && (
                        <View className="flex-row items-center bg-surface-highlight px-3 py-1 rounded-full">
                            <Ionicons
                                name={trend.direction === 'up' ? 'arrow-up' : 'arrow-down'}
                                size={16}
                                color={trend.color}
                            />
                            <AccessibleText weight="bold" style={{ color: trend.color }} className="ml-1">
                                {trend.value} kg vs anterior
                            </AccessibleText>
                        </View>
                    )}
                </Card>

                {/* Chart */}
                {logs.length > 1 && (
                    <View className="mb-6">
                        <AccessibleText weight="bold" className="text-text text-lg ml-4 mb-4">Tendencia</AccessibleText>
                        <LineChart
                            data={chartData}
                            width={Dimensions.get('window').width}
                            height={220}
                            chartConfig={{
                                backgroundColor: colors.background,
                                backgroundGradientFrom: colors.background,
                                backgroundGradientTo: colors.background,
                                decimalPlaces: 1,
                                color: (opacity = 1) => colors.primary,
                                labelColor: (opacity = 1) => colors.textMuted,
                                style: { borderRadius: 16 },
                                propsForDots: {
                                    r: "6",
                                    strokeWidth: "2",
                                    stroke: colors.primary
                                }
                            }}
                            bezier
                            style={{ marginVertical: 8 }}
                        />
                    </View>
                )}

                {/* History List */}
                <AccessibleText weight="bold" className="text-text text-lg ml-4 mb-4">Historial</AccessibleText>
                <View className="px-4 pb-8">
                    {logs && logs.length > 0 ? (
                        logs.map((log) => {
                            const measurementCount = getMeasurementCount(log);
                            return (
                                <TouchableOpacity
                                    key={log.id}
                                    onPress={() => router.push({ pathname: '/weight/detail', params: { weightId: log.id } })}
                                    activeOpacity={0.7}
                                    className="mb-3">
                                    <Card variant="glass" className="p-4">
                                        <View className="flex-row justify-between items-center">
                                            <View className="flex-row items-center flex-1">
                                                {log.photoUri ? (
                                                    <Image
                                                        source={{ uri: log.photoUri }}
                                                        className="w-12 h-12 rounded-lg mr-3 bg-surface-highlight"
                                                    />
                                                ) : (
                                                    <View className="w-12 h-12 rounded-lg mr-3 bg-surface-highlight items-center justify-center">
                                                        <Ionicons name="scale-outline" size={20} color={colors.textMuted} />
                                                    </View>
                                                )}
                                                <View className="flex-1">
                                                    <AccessibleText weight="bold" className="text-text text-lg">{log.weight} kg</AccessibleText>
                                                    <AccessibleText className="text-text-muted text-sm">{new Date(log.date).toLocaleDateString()}</AccessibleText>
                                                    {measurementCount > 0 && (
                                                        <View className="flex-row items-center mt-1">
                                                            <Ionicons name="body" size={12} color={colors.primary} />
                                                            <AccessibleText className="text-primary text-xs ml-1">
                                                                {measurementCount} medida{measurementCount > 1 ? 's' : ''}
                                                            </AccessibleText>
                                                        </View>
                                                    )}
                                                </View>
                                            </View>
                                            <View className="flex-row items-center">
                                                {log.note && (
                                                    <Ionicons name="document-text-outline" size={20} color={colors.textMuted} className="mr-2" />
                                                )}
                                                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                                            </View>
                                        </View>
                                    </Card>
                                </TouchableOpacity>
                            );
                        })
                    ) : (
                        <View className="items-center py-8">
                            <AccessibleText className="text-text-muted text-center mb-2">No hay registros de peso aún</AccessibleText>
                            <AccessibleText className="text-text-muted text-xs">Añade tu primer registro arriba</AccessibleText>
                        </View>
                    )}
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}
