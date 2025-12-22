import React from 'react';
import { View, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

interface WeightProgressChartProps {
    weights: { date: string; value: number }[];
}

export default function WeightProgressChart({ weights }: WeightProgressChartProps) {
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
                            color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`, // Blue
                            strokeWidth: 3,
                        },
                    ],
                }}
                width={screenWidth}
                height={220}
                chartConfig={{
                    backgroundColor: '#1f2937',
                    backgroundGradientFrom: '#1f2937',
                    backgroundGradientTo: '#111827',
                    decimalPlaces: 1,
                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
                    style: {
                        borderRadius: 16,
                    },
                    propsForDots: {
                        r: '5',
                        strokeWidth: '2',
                        stroke: '#3b82f6',
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
