import React from 'react';
import { View, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

interface WorkoutVolumeChartProps {
    weeklyVolumes: number[];
    labels: string[];
}

export default function WorkoutVolumeChart({ weeklyVolumes, labels }: WorkoutVolumeChartProps) {
    const screenWidth = Dimensions.get('window').width - 32;

    // Handle empty data
    if (weeklyVolumes.length === 0) {
        return null;
    }

    return (
        <View>
            <LineChart
                data={{
                    labels: labels,
                    datasets: [
                        {
                            data: weeklyVolumes.length > 0 ? weeklyVolumes : [0],
                            color: (opacity = 1) => `rgba(249, 115, 22, ${opacity})`, // Orange
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
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
                    style: {
                        borderRadius: 16,
                    },
                    propsForDots: {
                        r: '5',
                        strokeWidth: '2',
                        stroke: '#f97316',
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
