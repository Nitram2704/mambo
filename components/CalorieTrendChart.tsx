import { View, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';

interface CalorieTrendChartProps {
    dailyCalories: number[];
    labels: string[];
    goalCalories?: number;
}

export default function CalorieTrendChart({ dailyCalories, labels, goalCalories }: CalorieTrendChartProps) {
    const { t } = useTranslation();
    const { theme, isDark } = useAppTheme();
    const colors = Colors[theme];
    const screenWidth = Dimensions.get('window').width - 32;

    return (
        <View>
            <LineChart
                data={{
                    labels: labels,
                    datasets: [
                        {
                            data: dailyCalories,
                            color: (opacity = 1) => `rgba(234, 88, 12, ${opacity})`, // Orange
                            strokeWidth: 2,
                        },
                        ...(goalCalories
                            ? [
                                {
                                    data: new Array(dailyCalories.length).fill(goalCalories),
                                    color: (opacity = 1) => `rgba(34, 197, 94, ${opacity * 0.3})`, // Green dashed
                                    strokeWidth: 1,
                                    withDots: false,
                                },
                            ]
                            : []),
                    ],
                    legend: [t('reports.consumed'), ...(goalCalories ? [t('reports.goal')] : [])],
                }}
                width={screenWidth}
                height={220}
                chartConfig={{
                    backgroundColor: colors.surface,
                    backgroundGradientFrom: colors.surface,
                    backgroundGradientTo: colors.background,
                    decimalPlaces: 0,
                    color: (opacity = 1) => colors.text,
                    labelColor: (opacity = 1) => colors.textSecondary,
                    style: {
                        borderRadius: 16,
                    },
                    propsForDots: {
                        r: '4',
                        strokeWidth: '2',
                        stroke: '#ea580c',
                    },
                }}
                bezier
                style={{
                    marginVertical: 8,
                    borderRadius: 16,
                }}
            />
        </View>
    );
}
