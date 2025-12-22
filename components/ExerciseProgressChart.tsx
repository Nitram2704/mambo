import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';

interface ExerciseProgressChartProps {
    exerciseName: string;
    data: {
        date: string;
        weight: number;
    }[];
}

export default function ExerciseProgressChart({ exerciseName, data }: ExerciseProgressChartProps) {
    const screenWidth = Dimensions.get('window').width - 32; // padding

    // Prepare chart data
    const labels = data.slice(-7).map(d => {
        const date = new Date(d.date);
        return `${date.getDate()}/${date.getMonth() + 1}`;
    });

    const weights = data.slice(-7).map(d => d.weight);

    const chartData = {
        labels,
        datasets: [
            {
                data: weights.length > 0 ? weights : [0],
                color: (opacity = 1) => `rgba(96, 165, 250, ${opacity})`,
                strokeWidth: 3,
            },
        ],
    };

    const chartConfig = {
        backgroundColor: 'transparent',
        backgroundGradientFrom: 'rgba(30, 41, 59, 0.7)',
        backgroundGradientTo: 'rgba(15, 23, 42, 0.8)',
        decimalPlaces: 1,
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
        style: {
            borderRadius: 16,
        },
        propsForDots: {
            r: '5',
            strokeWidth: '2',
            stroke: '#60a5fa',
        },
        propsForBackgroundLines: {
            strokeDasharray: '',
            stroke: 'rgba(255, 255, 255, 0.1)',
        },
    };

    if (data.length === 0) {
        return (
            <LinearGradient
                colors={['rgba(30, 41, 59, 0.7)', 'rgba(15, 23, 42, 0.8)']}
                className="rounded-2xl p-5 border border-white/10"
            >
                <Text className="text-white font-bold text-lg mb-2">{exerciseName}</Text>
                <Text className="text-gray-400 text-center py-8">
                    No hay datos de progreso aún
                </Text>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient
            colors={['rgba(30, 41, 59, 0.7)', 'rgba(15, 23, 42, 0.8)']}
            className="rounded-2xl p-5 border border-white/10 mb-4"
        >
            <Text className="text-white font-bold text-lg mb-3">{exerciseName}</Text>
            <Text className="text-gray-400 text-sm mb-4">Progresión de Peso (kg)</Text>

            <LineChart
                data={chartData}
                width={screenWidth - 40}
                height={200}
                chartConfig={chartConfig}
                bezier
                style={{
                    marginVertical: 8,
                    borderRadius: 16,
                }}
                withInnerLines={true}
                withOuterLines={false}
                withVerticalLabels={true}
                withHorizontalLabels={true}
            />

            <View className="flex-row justify-between mt-3 pt-3 border-t border-white/5">
                <View>
                    <Text className="text-gray-400 text-xs">Mejor Peso</Text>
                    <Text className="text-white font-bold text-lg">
                        {Math.max(...weights).toFixed(1)} kg
                    </Text>
                </View>
                <View className="items-end">
                    <Text className="text-gray-400 text-xs">Último Registro</Text>
                    <Text className="text-white font-bold text-lg">
                        {weights[weights.length - 1].toFixed(1)} kg
                    </Text>
                </View>
            </View>
        </LinearGradient>
    );
}
