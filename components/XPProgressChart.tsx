import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useAchievementsStore } from '@/store/achievementsStore';

export const XPProgressChart: React.FC = () => {
    const { getTotalXp } = useAchievementsStore();

    // For now, show a simple chart with current XP
    // In a real app, you'd track XP over time
    const data = {
        labels: ['Hoy'],
        datasets: [{
            data: [getTotalXp()],
        }],
    };

    const chartConfig = {
        backgroundGradientFrom: '#1f2937',
        backgroundGradientTo: '#1f2937',
        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
        strokeWidth: 2,
        barPercentage: 0.5,
        useShadowColorFromDataset: false,
    };

    return (
        <View className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <Text className="text-white font-bold text-lg mb-2">Progreso de XP</Text>
            <Text className="text-gray-400 text-sm mb-4">Tu experiencia acumulada</Text>
            <View className="items-center">
                <Text className="text-blue-400 text-3xl font-bold mb-4">{getTotalXp()} XP</Text>
                <Text className="text-gray-500 text-center">Gráfico de progreso próximamente</Text>
            </View>
        </View>
    );
};