import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCustomFoodsStore } from '@/store/customFoodsStore';
import { FoodItem } from '@/data/foodDatabase';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';

export default function AddCustomFoodScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { theme } = useAppTheme();
    const isDark = theme === 'dark';
    const { addCustomFood } = useCustomFoodsStore();

    const [name, setName] = useState('');
    const [category, setCategory] = useState<FoodItem['category']>('protein');
    const [servingSize, setServingSize] = useState('');
    const [calories, setCalories] = useState('');
    const [protein, setProtein] = useState('');
    const [carbs, setCarbs] = useState('');
    const [fats, setFats] = useState('');

    const categories: FoodItem['category'][] = ['protein', 'carbs', 'fats', 'vegetables', 'dairy', 'fruits'];

    const getCategoryLabel = (cat: FoodItem['category']): string => {
        return t(`nutrition.categories.${cat}`);
    };

    const handleSave = () => {
        if (!name || !servingSize || !calories) {
            Alert.alert(t('common.error'), t('nutrition.addCustomFood.fillRequired'));
            return;
        }

        addCustomFood({
            name,
            category,
            servingSize,
            calories: parseInt(calories) || 0,
            protein: parseFloat(protein) || 0,
            carbs: parseFloat(carbs) || 0,
            fats: parseFloat(fats) || 0,
        });

        Alert.alert(t('common.success'), t('nutrition.addCustomFood.savedSuccess'), [
            { text: 'OK', onPress: () => router.back() }
        ]);
    };

    return (
        <ScreenWrapper>
            {/* Header */}
            <View className="flex-row items-center justify-between p-4 border-b" style={{ borderColor: Colors[theme].border }}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="close" size={24} color={Colors[theme].text} />
                </TouchableOpacity>
                <Text className="text-xl font-bold" style={{ color: Colors[theme].text }}>{t('nutrition.addCustomFood.title')}</Text>
                <TouchableOpacity onPress={handleSave}>
                    <Text className="text-lg font-bold" style={{ color: Colors[theme].orange[500] }}>{t('common.save')}</Text>
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 p-4">
                {/* Name */}
                <View className="mb-4">
                    <Text className="text-sm mb-2" style={{ color: Colors[theme].textSecondary }}>{t('nutrition.addCustomFood.nameLabel')}</Text>
                    <TextInput
                        className="p-4 rounded-xl border text-lg"
                        style={{
                            backgroundColor: isDark ? 'rgba(31, 41, 55, 0.5)' : '#f9fafb',
                            color: Colors[theme].text,
                            borderColor: Colors[theme].border
                        }}
                        placeholder={t('nutrition.addCustomFood.namePlaceholder')}
                        placeholderTextColor={Colors[theme].textMuted}
                        value={name}
                        onChangeText={setName}
                    />
                </View>

                {/* Category */}
                <View className="mb-4">
                    <Text className="text-sm mb-2" style={{ color: Colors[theme].textSecondary }}>{t('nutrition.addCustomFood.categoryLabel')}</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
                        {categories.map((cat) => (
                            <TouchableOpacity
                                key={cat}
                                onPress={() => setCategory(cat)}
                                className={`px-4 py-2 rounded-full border ${category === cat ? 'bg-orange-500 border-orange-400' : (isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200')}`}
                                style={{ marginRight: 8 }}
                            >
                                <Text className={`font-medium ${category === cat ? 'text-white' : Colors[theme].textSecondary}`}>
                                    {getCategoryLabel(cat)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Serving Size */}
                <View className="mb-4">
                    <Text className="text-sm mb-2" style={{ color: Colors[theme].textSecondary }}>{t('nutrition.addCustomFood.portionLabel')}</Text>
                    <TextInput
                        className="p-4 rounded-xl border text-lg"
                        style={{
                            backgroundColor: isDark ? 'rgba(31, 41, 55, 0.5)' : '#f9fafb',
                            color: Colors[theme].text,
                            borderColor: Colors[theme].border
                        }}
                        placeholder={t('nutrition.addCustomFood.portionPlaceholder')}
                        placeholderTextColor={Colors[theme].textMuted}
                        value={servingSize}
                        onChangeText={setServingSize}
                    />
                </View>

                {/* Calories */}
                <View className="mb-4">
                    <Text className="text-sm mb-2" style={{ color: Colors[theme].textSecondary }}>{t('nutrition.addCustomFood.caloriesLabel')}</Text>
                    <TextInput
                        className="p-4 rounded-xl border text-lg"
                        style={{
                            backgroundColor: isDark ? 'rgba(31, 41, 55, 0.5)' : '#f9fafb',
                            color: Colors[theme].text,
                            borderColor: Colors[theme].border
                        }}
                        placeholder={t('nutrition.addCustomFood.caloriesPlaceholder')}
                        placeholderTextColor={Colors[theme].textMuted}
                        keyboardType="number-pad"
                        value={calories}
                        onChangeText={setCalories}
                    />
                </View>

                {/* Macros Grid */}
                <View className="mb-6">
                    <Text className="text-sm mb-2" style={{ color: Colors[theme].textSecondary }}>{t('nutrition.addCustomFood.macrosLabel')}</Text>
                    <View className="flex-row gap-4">
                        <View className="flex-1">
                            <Text className="text-blue-400 text-xs mb-1">{t('nutrition.addCustomFood.proteinLabel')}</Text>
                            <TextInput
                                className="p-3 rounded-lg border text-center"
                                style={{
                                    backgroundColor: isDark ? 'rgba(31, 41, 55, 0.5)' : '#f9fafb',
                                    color: Colors[theme].text,
                                    borderColor: Colors[theme].border
                                }}
                                placeholder="0"
                                placeholderTextColor={Colors[theme].textMuted}
                                keyboardType="decimal-pad"
                                value={protein}
                                onChangeText={setProtein}
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-green-400 text-xs mb-1">{t('nutrition.addCustomFood.carbsLabel')}</Text>
                            <TextInput
                                className="p-3 rounded-lg border text-center"
                                style={{
                                    backgroundColor: isDark ? 'rgba(31, 41, 55, 0.5)' : '#f9fafb',
                                    color: Colors[theme].text,
                                    borderColor: Colors[theme].border
                                }}
                                placeholder="0"
                                placeholderTextColor={Colors[theme].textMuted}
                                keyboardType="decimal-pad"
                                value={carbs}
                                onChangeText={setCarbs}
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-orange-400 text-xs mb-1">{t('nutrition.addCustomFood.fatsLabel')}</Text>
                            <TextInput
                                className="p-3 rounded-lg border text-center"
                                style={{
                                    backgroundColor: isDark ? 'rgba(31, 41, 55, 0.5)' : '#f9fafb',
                                    color: Colors[theme].text,
                                    borderColor: Colors[theme].border
                                }}
                                placeholder="0"
                                placeholderTextColor={Colors[theme].textMuted}
                                keyboardType="decimal-pad"
                                value={fats}
                                onChangeText={setFats}
                            />
                        </View>
                    </View>
                </View>

                {/* Info */}
                <View className="rounded-xl p-4 border" style={{ backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)', borderColor: 'rgba(59, 130, 246, 0.3)' }}>
                    <View className="flex-row items-center mb-2">
                        <Ionicons name="information-circle" size={20} color="#3b82f6" />
                        <Text className="text-blue-400 font-bold ml-2">{t('nutrition.addCustomFood.tipTitle')}</Text>
                    </View>
                    <Text className="text-blue-400 text-sm">
                        {t('nutrition.addCustomFood.tipNote')}
                    </Text>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}
