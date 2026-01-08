import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUserProfileStore } from '@/store/userProfileStore';
import { useUIStore } from '@/store/uiStore';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { AccessibleText } from '@/components/ui/AccessibleText';
import { Card } from '@/components/ui/Card';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';
import { useTranslation } from 'react-i18next';

export default function EditGoalsScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const { profile, updateProfile } = useUserProfileStore();
    const { showToast } = useUIStore();
    const { theme } = useAppTheme();
    const colors = Colors[theme];

    const [calories, setCalories] = useState('');
    const [protein, setProtein] = useState('');
    const [carbs, setCarbs] = useState('');
    const [fats, setFats] = useState('');

    useEffect(() => {
        if (profile) {
            setCalories(profile.calorieGoal.toString());
            setProtein(profile.proteinGoal.toString());
            setCarbs(profile.carbsGoal.toString());
            setFats(profile.fatsGoal.toString());
        }
    }, [profile]);

    const handleSave = () => {
        const cal = parseInt(calories);
        const pro = parseInt(protein);
        const car = parseInt(carbs);
        const fat = parseInt(fats);

        if (isNaN(cal) || isNaN(pro) || isNaN(car) || isNaN(fat)) {
            showToast(t('profile.goals.invalidValues', 'Asegúrate de que todos los valores sean números válidos.'), 'warning');
            return;
        }

        updateProfile({
            calorieGoal: cal,
            proteinGoal: pro,
            carbsGoal: car,
            fatsGoal: fat
        });

        showToast(t('profile.goals.updatedSuccess', 'Metas actualizadas correctamente.'), 'success');
        router.back();
    };

    const handleReset = () => {
        Alert.alert(
            t('profile.goals.resetTitle', 'Restablecer Calculados'),
            t('profile.goals.resetMessage', '¿Quieres volver a calcular tus metas basadas en tus datos físicos?'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('profile.goals.recalculate', 'Sí, recalcular'),
                    onPress: () => {
                        showToast(t('profile.goals.recalculateHint', 'Para recalcular automáticamente, actualiza tu peso en el perfil.'), 'info');
                    }
                }
            ]
        );
    };

    return (
        <ScreenWrapper safeArea={true}>
            <View className="flex-row items-center justify-between p-4 border-b border-border/10">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
                <AccessibleText weight="bold" className="text-text text-lg">{t('profile.goals.editTitle', 'Editar Metas')}</AccessibleText>
                <TouchableOpacity onPress={handleSave}>
                    <AccessibleText weight="bold" className="text-primary">{t('common.save')}</AccessibleText>
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 p-4">
                <Card variant="glass" className="p-4 mb-4 border-border/10">
                    <AccessibleText className="text-text-secondary mb-4 text-sm">
                        {t('profile.goals.manualAdjustmentDesc', 'Ajusta manualmente tus objetivos diarios. Los cambios se reflejarán en el Dashboard.')}
                    </AccessibleText>

                    <View className="mb-4">
                        <AccessibleText weight="bold" className="text-text mb-2">{t('nutrition.calories')} (kcal)</AccessibleText>
                        <TextInput
                            className="bg-surface-highlight/50 text-text p-4 rounded-xl border border-border/10 font-bold text-lg"
                            keyboardType="numeric"
                            value={calories}
                            onChangeText={setCalories}
                            placeholderTextColor={colors.textMuted}
                        />
                    </View>

                    <View className="flex-row gap-4">
                        <View className="flex-1 mb-4">
                            <AccessibleText weight="bold" className="text-text mb-2">{t('nutrition.protein')} (g)</AccessibleText>
                            <TextInput
                                className="bg-surface-highlight/50 text-text p-4 rounded-xl border border-border/10 font-bold"
                                keyboardType="numeric"
                                value={protein}
                                onChangeText={setProtein}
                                placeholderTextColor={colors.textMuted}
                            />
                        </View>
                        <View className="flex-1 mb-4">
                            <AccessibleText weight="bold" className="text-text mb-2">{t('nutrition.carbs')} (g)</AccessibleText>
                            <TextInput
                                className="bg-surface-highlight/50 text-text p-4 rounded-xl border border-border/10 font-bold"
                                keyboardType="numeric"
                                value={carbs}
                                onChangeText={setCarbs}
                                placeholderTextColor={colors.textMuted}
                            />
                        </View>
                        <View className="flex-1 mb-4">
                            <AccessibleText weight="bold" className="text-text mb-2">{t('nutrition.fats')} (g)</AccessibleText>
                            <TextInput
                                className="bg-surface-highlight/50 text-text p-4 rounded-xl border border-border/10 font-bold"
                                keyboardType="numeric"
                                value={fats}
                                onChangeText={setFats}
                                placeholderTextColor={colors.textMuted}
                            />
                        </View>
                    </View>
                </Card>

                <TouchableOpacity
                    onPress={handleReset}
                    className="p-4 rounded-xl border border-border/10 items-center active:bg-surface-highlight/30"
                >
                    <AccessibleText className="text-text-secondary">{t('profile.goals.resetToCalculated', 'Restablecer a valores calculados')}</AccessibleText>
                </TouchableOpacity>
            </ScrollView>
        </ScreenWrapper>
    );
}
