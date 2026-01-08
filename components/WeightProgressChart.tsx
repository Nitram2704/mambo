import React from 'react';
import { View, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';

interface WeightProgressChartProps {
    weights: { date: string; value: number }[];
}

export default function WeightProgressChart({ weights }: WeightProgressChartProps) {
    const { theme } = useAppTheme();
    const colors = Colors[theme];
    const screenWidth = Dimensions.get('window').width - 32;

    if (weights.length === 0) {
        return null;
    }

    const sortedWeights = [...weights].sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const values = sortedWeights.map(w => w.value);
    const labels = sortedWeights.map(w => {
        const date = new Date(w.date);
        return `${date.getDate()}/${date.getMonth() + 1}`;
    });

    return (
        <View>
            <LineChart
                data={{
                    labels: labels,
                    datasets: [
                        {
                            data: values,
                            color: (opacity = 1) => colors.primary,
                            strokeWidth: 3,
                        },
                    ],
                }}
                width={screenWidth}
                height={220}
                chartConfig={{
                    backgroundColor: colors.surface,
                    backgroundGradientFrom: colors.surface,
                    backgroundGradientTo: colors.background,
                    decimalPlaces: 1,
                    color: (opacity = 1) => colors.text,
                    labelColor: (opacity = 1) => colors.textMuted,
                    style: {
                        borderRadius: 16,
                    },
                    propsForDots: {
                        r: '5',
                        strokeWidth: '2',
                        stroke: colors.primary,
                    },
                }}
                bezier
                style={{
                    marginVertical: 8,
                    borderRadius: 16,
                }}
                withInnerLines={false}
                withOuterLines={true}
                withVerticalLines={false}
                withHorizontalLines={true}
            />
        </View>
    );
}
