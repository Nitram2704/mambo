import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { useWeightStore } from '@/store/weightStore';

export default function WeightScreen() {
    const router = useRouter();
    const { logs, getLatestWeight } = useWeightStore();
    const latestWeight = getLatestWeight();

    // Calculate trend
    const getTrend = () => {
        if (logs.length < 2) return null;
        const current = logs[0].weight;
        const previous = logs[1].weight;
        const diff = current - previous;
        return {
            value: Math.abs(diff).toFixed(1),
            direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'neutral',
            color: diff > 0 ? '#ef4444' : diff < 0 ? '#22c55e' : '#9ca3af'
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

    return (
        <SafeAreaView className="flex-1 bg-gray-900">
            {/* Header */}
            <View className="flex-row items-center justify-between p-4 border-b border-gray-800">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold">Peso Corporal</Text>
                <TouchableOpacity onPress={() => router.push('/weight/log-weight')}>
                    <Ionicons name="add" size={28} color="#fb923c" />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1">
                {/* Current Weight Card */}
                <View className="m-4 bg-gray-800 p-6 rounded-2xl border border-gray-700 items-center">
                    <Text className="text-gray-400 mb-2">Peso Actual</Text>
                    <Text className="text-white text-5xl font-bold mb-2">
                        {latestWeight ? latestWeight : '--'} <Text className="text-2xl text-gray-500">kg</Text>
                    </Text>

                    {trend && (
                        <View className="flex-row items-center bg-gray-900 px-3 py-1 rounded-full">
                            <Ionicons
                                name={trend.direction === 'up' ? 'arrow-up' : 'arrow-down'}
                                size={16}
                                color={trend.color}
                            />
                            <Text style={{ color: trend.color }} className="font-bold ml-1">
                                {trend.value} kg vs anterior
                            </Text>
                        </View>
                    )}
                </View>

                {/* Chart */}
                {logs.length > 1 && (
                    <View className="mb-6">
                        <Text className="text-white font-bold text-lg ml-4 mb-4">Tendencia</Text>
                        <LineChart
                            data={chartData}
                            width={Dimensions.get('window').width}
                            height={220}
                            chartConfig={{
                                backgroundColor: '#111827',
                                backgroundGradientFrom: '#111827',
                                backgroundGradientTo: '#111827',
                                decimalPlaces: 1,
                                color: (opacity = 1) => `rgba(251, 146, 60, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
                                style: { borderRadius: 16 },
                                propsForDots: {
                                    r: "6",
                                    strokeWidth: "2",
                                    stroke: "#fb923c"
                                }
                            }}
                            bezier
                            style={{ marginVertical: 8 }}
                        />
                    </View>
                )}

                {/* History List */}
                <Text className="text-white font-bold text-lg ml-4 mb-4">Historial</Text>
                <View className="px-4 pb-8">
                    {logs && logs.length > 0 ? (
                        logs.map((log) => (
                            <TouchableOpacity
                                key={log.id}
                                onPress={() => router.push({ pathname: '/weight/detail', params: { weightId: log.id } })}
                                className="bg-gray-800 p-4 rounded-xl mb-3 border border-gray-700 flex-row justify-between items-center active:bg-gray-700">
                                <View className="flex-row items-center">
                                    {log.photoUri ? (
                                        <Image
                                            source={{ uri: log.photoUri }}
                                            className="w-12 h-12 rounded-lg mr-3 bg-gray-700"
                                        />
                                    ) : (
                                        <View className="w-12 h-12 rounded-lg mr-3 bg-gray-700 items-center justify-center">
                                            <Ionicons name="scale-outline" size={20} color="#9ca3af" />
                                        </View>
                                    )}
                                    <View>
                                        <Text className="text-white font-bold text-lg">{log.weight} kg</Text>
                                        <Text className="text-gray-400 text-sm">{new Date(log.date).toLocaleDateString()}</Text>
                                    </View>
                                </View>
                                <View className="flex-row items-center">
                                    {log.note && (
                                        <Ionicons name="document-text-outline" size={20} color="#6b7280" className="mr-2" />
                                    )}
                                    <Ionicons name="chevron-forward" size={20} color="#6b7280" />
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View className="items-center py-8">
                            <Text className="text-gray-500 text-center mb-2">No hay registros de peso aún</Text>
                            <Text className="text-gray-700 text-xs">Añade tu primer registro arriba</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
