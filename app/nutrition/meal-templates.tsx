import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useMealTemplateStore } from '@/store/mealTemplateStore';
import { useNutritionStore } from '@/store/nutritionStore';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Card } from '@/components/ui/Card';

export default function MealTemplatesScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { theme } = useAppTheme();
    const isDark = theme === 'dark';
    const { mealType } = useLocalSearchParams<{ mealType: string }>();
    const { templates, deleteTemplate } = useMealTemplateStore();
    const { logMeal } = useNutritionStore();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredTemplates = templates.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleUseTemplate = (template: typeof templates[0]) => {
        // Log all foods from the template
        logMeal({
            name: template.name,
            calories: template.totalCalories,
            protein: template.totalProtein,
            carbs: template.totalCarbs,
            fats: template.totalFats,
            mealType: (mealType as any) || 'snack',
        });

        Alert.alert(
            t('nutrition.mealTemplates.templateUsed'),
            t('nutrition.mealTemplates.templateUsedNote', { name: template.name }),
            [{ text: 'OK', onPress: () => router.back() }]
        );
    };

    const handleDeleteTemplate = (id: string, name: string) => {
        Alert.alert(
            t('nutrition.mealTemplates.deleteTemplateTitle'),
            t('nutrition.mealTemplates.deleteTemplateMessage', { name }),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.delete'),
                    style: 'destructive',
                    onPress: () => deleteTemplate(id),
                },
            ]
        );
    };

    return (
        <ScreenWrapper>
            {/* Header */}
            <View className="flex-row items-center justify-between p-4 border-b" style={{ borderColor: Colors[theme].border }}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={Colors[theme].text} />
                </TouchableOpacity>
                <Text className="text-xl font-bold" style={{ color: Colors[theme].text }}>{t('nutrition.mealTemplates.title')}</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Search Bar */}
            <View className="p-4">
                <View className="rounded-xl p-3 flex-row items-center border" style={{ backgroundColor: isDark ? 'rgba(31, 41, 55, 0.5)' : '#f9fafb', borderColor: Colors[theme].border }}>
                    <Ionicons name="search" size={20} color={Colors[theme].textMuted} />
                    <TextInput
                        className="flex-1 ml-2 text-base"
                        style={{ color: Colors[theme].text }}
                        placeholder={t('nutrition.mealTemplates.searchPlaceholder')}
                        placeholderTextColor={Colors[theme].textMuted}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
                {filteredTemplates.length > 0 ? (
                    filteredTemplates.map((template) => (
                        <Card
                            key={template.id}
                            className="p-5 mb-4"
                        >
                            <View className="flex-row justify-between items-start mb-3">
                                <View className="flex-1">
                                    <Text className="font-bold text-lg" style={{ color: Colors[theme].text }}>{template.name}</Text>
                                    <Text className="text-sm mt-1" style={{ color: Colors[theme].textSecondary }}>
                                        {t('nutrition.mealTemplates.foodsCount', { count: template.foods.length })}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => handleDeleteTemplate(template.id, template.name)}
                                    className="p-2"
                                >
                                    <Ionicons name="trash-outline" size={20} color={Colors[theme].error} />
                                </TouchableOpacity>
                            </View>

                            {/* Macros */}
                            <View className="flex-row justify-between mb-4 rounded-xl p-3" style={{ backgroundColor: isDark ? 'rgba(31, 41, 55, 0.3)' : '#f1f5f9' }}>
                                <View>
                                    <Text className="text-xs" style={{ color: Colors[theme].textSecondary }}>{t('nutrition.logMeal.calories')}</Text>
                                    <Text className="font-bold text-lg" style={{ color: Colors[theme].text }}>
                                        {template.totalCalories}
                                    </Text>
                                </View>
                                <View>
                                    <Text className="text-xs" style={{ color: Colors[theme].textSecondary }}>{t('nutrition.logMeal.protein')}</Text>
                                    <Text className="font-bold text-lg" style={{ color: Colors.blue[400] }}>
                                        {template.totalProtein}g
                                    </Text>
                                </View>
                                <View>
                                    <Text className="text-xs" style={{ color: Colors[theme].textSecondary }}>{t('nutrition.logMeal.carbs')}</Text>
                                    <Text className="font-bold text-lg" style={{ color: Colors.yellow[500] }}>
                                        {template.totalCarbs}g
                                    </Text>
                                </View>
                                <View>
                                    <Text className="text-xs" style={{ color: Colors[theme].textSecondary }}>{t('nutrition.logMeal.fats')}</Text>
                                    <Text className="font-bold text-lg" style={{ color: Colors.orange[400] }}>
                                        {template.totalFats}g
                                    </Text>
                                </View>
                            </View>

                            {/* Use Template Button */}
                            <TouchableOpacity onPress={() => handleUseTemplate(template)}>
                                <LinearGradient
                                    colors={Colors.gradients.success}
                                    className="rounded-xl p-3"
                                >
                                    <Text className="text-white font-bold text-center">
                                        {t('nutrition.mealTemplates.useTemplate')}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </Card>
                    ))
                ) : (
                    <View className="items-center justify-center py-12">
                        <Ionicons name="restaurant-outline" size={64} color={Colors[theme].textMuted} />
                        <Text className="text-center mt-4 text-base" style={{ color: Colors[theme].textSecondary }}>
                            {searchQuery ? t('nutrition.mealTemplates.noTemplatesFound') : t('nutrition.mealTemplates.noTemplatesNote')}
                        </Text>
                        <Text className="text-center mt-2 text-sm px-8" style={{ color: Colors[theme].textMuted }}>
                            {t('nutrition.mealTemplates.createFromLogMeal')}
                        </Text>
                    </View>
                )}
            </ScrollView>
        </ScreenWrapper>
    );
}
