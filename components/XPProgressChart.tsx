import React from 'react';
import { View, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useAchievementsStore } from '@/store/achievementsStore';
import { AccessibleText } from './ui/AccessibleText';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';

export const XPProgressChart: React.FC = () => {
    const { getTotalXp } = useAchievementsStore();
    const { theme } = useAppTheme();

    // For now, show a simple chart with current XP
    // In a real app, you'd track XP over time
    const data = {
        labels: ['Hoy'],
        datasets: [{
            data: [getTotalXp()],
        }],
    };

    const chartConfig = {
        backgroundGradientFrom: Colors[theme].surface,
        backgroundGradientTo: Colors[theme].surface,
        color: (opacity = 1) => theme === 'dark' ? `rgba(59, 130, 246, ${opacity})` : `rgba(37, 99, 235, ${opacity})`,
        strokeWidth: 2,
        barPercentage: 0.5,
        useShadowColorFromDataset: false,
        labelColor: (opacity = 1) => Colors[theme].textSecondary,
    };

    return (
        <View
            className="bg-surface rounded-xl p-4 border border-border/10"
            accessibilityLabel={`Progreso de XP: ${getTotalXp()} puntos de experiencia acumulados`}
        >
            <AccessibleText variant="h2" weight="bold" className="text-text font-bold text-lg mb-2">Progreso de XP</AccessibleText>
            <AccessibleText className="text-text-secondary text-sm mb-4">Tu experiencia acumulada</AccessibleText>
            <View className="items-center">
                <AccessibleText weight="bold" className="text-primary text-3xl font-bold mb-4">{getTotalXp()} XP</AccessibleText>
                <AccessibleText className="text-text-muted text-center">Gráfico de progreso próximamente</AccessibleText>
            </View>
        </View>
    );
};