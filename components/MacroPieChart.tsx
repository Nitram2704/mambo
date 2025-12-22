import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';

interface MacroPieChartProps {
    protein: number;
    carbs: number;
    fats: number;
}

export default function MacroPieChart({ protein, carbs, fats }: MacroPieChartProps) {
    const { t } = useTranslation();
    const { theme } = useAppTheme();
    const colors = Colors[theme];
    const screenWidth = Dimensions.get('window').width - 32;

    // Calculate calories from macros (protein: 4cal/g, carbs: 4cal/g, fats: 9cal/g)
    const proteinCal = protein * 4;
    const carbsCal = carbs * 4;
    const fatsCal = fats * 9;
    const total = proteinCal + carbsCal + fatsCal;

    const data = [
        {
            name: t('nutrition.protein'),
            population: proteinCal,
            color: colors.primary,
            legendFontColor: colors.textSecondary,
            legendFontSize: 12,
        },
        {
            name: t('nutrition.carbs'),
            population: carbsCal,
            color: colors.success,
            legendFontColor: colors.textSecondary,
            legendFontSize: 12,
        },
        {
            name: t('nutrition.fats'),
            population: fatsCal,
            color: colors.orange[500],
            legendFontColor: colors.textSecondary,
            legendFontSize: 12,
        },
    ];

    return (
        <View>
            <PieChart
                data={data}
                width={screenWidth}
                height={200}
                chartConfig={{
                    color: (opacity = 1) => colors.text,
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute={false}
            />
            <View className="flex-row justify-between mt-4 px-4">
                <View>
                    <Text className="text-xs" style={{ color: colors.primary }}>{t('nutrition.protein')}</Text>
                    <Text className="font-bold" style={{ color: colors.text }}>{protein}g</Text>
                    <Text className="text-xs" style={{ color: colors.textMuted }}>
                        {total > 0 ? ((proteinCal / total) * 100).toFixed(0) : 0}%
                    </Text>
                </View>
                <View>
                    <Text className="text-xs" style={{ color: colors.success }}>{t('nutrition.carbs')}</Text>
                    <Text className="font-bold" style={{ color: colors.text }}>{carbs}g</Text>
                    <Text className="text-xs" style={{ color: colors.textMuted }}>
                        {total > 0 ? ((carbsCal / total) * 100).toFixed(0) : 0}%
                    </Text>
                </View>
                <View>
                    <Text className="text-xs" style={{ color: colors.orange[500] }}>{t('nutrition.fats')}</Text>
                    <Text className="font-bold" style={{ color: colors.text }}>{fats}g</Text>
                    <Text className="text-xs" style={{ color: colors.textMuted }}>
                        {total > 0 ? ((fatsCal / total) * 100).toFixed(0) : 0}%
                    </Text>
                </View>
            </View>
        </View>
    );
}
