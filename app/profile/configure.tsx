import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUserProfileStore, Gender, ActivityLevel, Objective, GoalVelocity } from '@/store/userProfileStore';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { AccessibleText } from '@/components/ui/AccessibleText';
import { Card } from '@/components/ui/Card';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';
import { useTranslation } from 'react-i18next';
import {
    calculateBMR,
    calculateTDEE,
    calculateCalorieGoal,
    calculateMacros,
    getActivityLevelDisplayName,
    getActivityLevelDescription,
    getObjectiveDisplayName,
    getObjectiveDescription,
} from '@/utils/nutrition';

export default function ConfigureProfileScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const { profile, setProfile } = useUserProfileStore();
    const { theme } = useAppTheme();
    const colors = Colors[theme];

    // Initialize with existing profile or defaults
    const [age, setAge] = useState(profile?.age.toString() || '26');
    const [gender, setGender] = useState<Gender>(profile?.gender || 'male');
    const [height, setHeight] = useState(profile?.height.toString() || '175');
    const [weight, setWeight] = useState(profile?.weight.toString() || '70');
    const [targetWeight, setTargetWeight] = useState(profile?.targetWeight?.toString() || '');
    const [activityLevel, setActivityLevel] = useState<ActivityLevel>(profile?.activityLevel || 'moderate');
    const [objective, setObjective] = useState<Objective>(profile?.objective || 'maintenance');
    const [goalVelocity, setGoalVelocity] = useState<GoalVelocity>(profile?.goalVelocity || 'moderate');

    // BMI Calculation
    const heightNum = parseFloat(height) || 0;
    const weightNum = parseFloat(weight) || 0;
    const bmi = heightNum > 0 ? weightNum / Math.pow(heightNum / 100, 2) : 0;

    const getBMICategory = (bmi: number) => {
        if (bmi < 18.5) return { label: t('nutrition.bmi.underweight', 'Bajo peso'), color: 'text-info' };
        if (bmi < 25) return { label: t('nutrition.bmi.normal', 'Peso normal'), color: 'text-success' };
        if (bmi < 30) return { label: t('nutrition.bmi.overweight', 'Sobrepeso'), color: 'text-warning' };
        return { label: t('nutrition.bmi.obesity', 'Obesidad'), color: 'text-error' };
    };

    const bmiCategory = getBMICategory(bmi);
    const minNormalWeight = 18.5 * Math.pow(heightNum / 100, 2);
    const maxNormalWeight = 24.9 * Math.pow(heightNum / 100, 2);

    const handleCalculate = () => {
        const ageNum = parseInt(age);
        const heightNum = parseFloat(height);
        const weightNum = parseFloat(weight);
        const targetWeightNum = parseFloat(targetWeight) || weightNum;

        if (!ageNum || !heightNum || !weightNum) {
            Alert.alert(t('common.error'), t('profile.configure.completeAllFields', 'Por favor, completa todos los campos'));
            return;
        }

        // Calculate nutritional data
        const bmr = calculateBMR(weightNum, heightNum, ageNum, gender);
        const tdee = calculateTDEE(bmr, activityLevel);

        // Adjust calorie goal based on velocity
        let velocityMultiplier = 0;
        if (objective === 'weight_loss' || objective === 'aggressive_cut') {
            switch (goalVelocity) {
                case 'slow': velocityMultiplier = -0.10; break; // -10%
                case 'moderate': velocityMultiplier = -0.20; break; // -20%
                case 'fast': velocityMultiplier = -0.25; break; // -25%
            }
        } else if (objective === 'bulking' || objective === 'lean_bulk') {
            switch (goalVelocity) {
                case 'slow': velocityMultiplier = 0.05; break; // +5%
                case 'moderate': velocityMultiplier = 0.10; break; // +10%
                case 'fast': velocityMultiplier = 0.15; break; // +15%
            }
        }

        const baseCalorieGoal = calculateCalorieGoal(tdee, objective);
        const calorieGoal = velocityMultiplier !== 0
            ? Math.round(tdee * (1 + velocityMultiplier))
            : baseCalorieGoal;

        const macros = calculateMacros(calorieGoal, weightNum, objective);

        // Save profile
        setProfile({
            age: ageNum,
            gender,
            height: heightNum,
            weight: weightNum,
            targetWeight: targetWeightNum,
            activityLevel,
            objective,
            goalVelocity,
            bmr,
            tdee,
            calorieGoal,
            proteinGoal: macros.protein,
            carbsGoal: macros.carbs,
            fatsGoal: macros.fats,
        });

        Alert.alert(t('common.success'), `${t('profile.configure.calculatedTitle', 'Plan Nutricional Calculado!')}\n${calorieGoal} ${t('nutrition.caloriesPerDay', 'calorías diarias')}`);
        router.back();
    };

    const activityLevels: ActivityLevel[] = ['sedentary', 'light', 'moderate', 'active'];
    const objectives: Objective[] = ['weight_loss', 'maintenance', 'lean_bulk', 'bulking', 'aggressive_cut'];

    return (
        <ScreenWrapper safeArea={true}>
            {/* Header */}
            <View className="flex-row items-center p-4 border-b border-border/10">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <View className="flex-1 ml-4">
                    <AccessibleText variant="h2" weight="bold" className="text-text">{t('profile.configure.title', 'Configurar Perfil')}</AccessibleText>
                    <AccessibleText className="text-text-secondary text-sm">{t('profile.configure.subtitle', 'Personaliza tu plan nutricional')}</AccessibleText>
                </View>
            </View>

            <ScrollView className="flex-1 p-4">
                {/* Datos Básicos */}
                <Card variant="glass" className="p-4 mb-4 border-border/10">
                    <AccessibleText variant="h3" weight="bold" className="text-text mb-4">{t('profile.configure.basicInfo', 'Datos Básicos')}</AccessibleText>

                    {/* Edad */}
                    <View className="mb-4">
                        <AccessibleText className="text-text-secondary text-sm mb-2">{t('onboarding.basicInfo.ageLabel')} *</AccessibleText>
                        <TextInput
                            className="bg-surface-highlight/50 text-text p-3 rounded-lg text-lg border border-border/10"
                            placeholder="26"
                            placeholderTextColor={colors.textMuted}
                            keyboardType="number-pad"
                            value={age}
                            onChangeText={setAge}
                        />
                    </View>

                    {/* Género */}
                    <View className="mb-4">
                        <AccessibleText className="text-text-secondary text-sm mb-2">{t('onboarding.basicInfo.genderLabel')}</AccessibleText>
                        <View className="flex-row gap-2">
                            <TouchableOpacity
                                onPress={() => setGender('male')}
                                className={`flex-1 p-3 rounded-lg ${gender === 'male' ? 'bg-primary' : 'bg-surface-highlight/50'
                                    }`}>
                                <AccessibleText weight="bold" className={`text-center ${gender === 'male' ? 'text-white' : 'text-text'}`}>{t('common.male', 'Masculino')}</AccessibleText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setGender('female')}
                                className={`flex-1 p-3 rounded-lg ${gender === 'female' ? 'bg-primary' : 'bg-surface-highlight/50'
                                    }`}>
                                <AccessibleText weight="bold" className={`text-center ${gender === 'female' ? 'text-white' : 'text-text'}`}>{t('common.female', 'Femenino')}</AccessibleText>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Altura, Peso y Peso Objetivo */}
                    <View className="mb-4">
                        <View className="flex-row gap-4 mb-4">
                            <View className="flex-1">
                                <AccessibleText className="text-text-secondary text-sm mb-2">{t('onboarding.basicInfo.heightLabel')} (cm) *</AccessibleText>
                                <TextInput
                                    className="bg-surface-highlight/50 text-text p-3 rounded-lg text-lg border border-border/10"
                                    placeholder="175.00"
                                    placeholderTextColor={colors.textMuted}
                                    keyboardType="decimal-pad"
                                    value={height}
                                    onChangeText={setHeight}
                                />
                            </View>
                            <View className="flex-1">
                                <AccessibleText className="text-text-secondary text-sm mb-2">{t('onboarding.basicInfo.weightLabel')} (kg) *</AccessibleText>
                                <TextInput
                                    className="bg-surface-highlight/50 text-text p-3 rounded-lg text-lg border border-border/10"
                                    placeholder="70.00"
                                    placeholderTextColor={colors.textMuted}
                                    keyboardType="decimal-pad"
                                    value={weight}
                                    onChangeText={setWeight}
                                />
                            </View>
                        </View>

                        <View>
                            <AccessibleText className="text-text-secondary text-sm mb-2">{t('profile.configure.targetWeight', 'Peso Objetivo')} (kg)</AccessibleText>
                            <TextInput
                                className="bg-surface-highlight/50 text-text p-3 rounded-lg text-lg border border-border/10"
                                placeholder="65.00"
                                placeholderTextColor={colors.textMuted}
                                keyboardType="decimal-pad"
                                value={targetWeight}
                                onChangeText={setTargetWeight}
                            />
                        </View>
                    </View>

                    {/* BMI Info */}
                    {heightNum > 0 && weightNum > 0 && (
                        <View className="bg-surface-highlight/30 p-3 rounded-lg mb-4 border border-border/10 border-dashed">
                            <View className="flex-row justify-between items-center mb-1">
                                <AccessibleText className="text-text-secondary text-sm">IMC: <AccessibleText weight="bold" className="text-text">{bmi.toFixed(1)}</AccessibleText></AccessibleText>
                                <AccessibleText weight="bold" className={`text-sm ${bmiCategory.color}`}>{bmiCategory.label}</AccessibleText>
                            </View>
                            <AccessibleText variant="caption" className="text-text-secondary">
                                {t('nutrition.bmi.suggestedWeight', 'Peso normal sugerido')}: {Math.round(minNormalWeight)}-{Math.round(maxNormalWeight)} kg
                            </AccessibleText>
                        </View>
                    )}
                </Card>

                {/* Nivel de Actividad */}
                <Card variant="glass" className="p-4 mb-4 border-border/10">
                    <AccessibleText variant="h3" weight="bold" className="text-text mb-4">{t('profile.configure.activityLevel', 'Nivel de Actividad')}</AccessibleText>
                    {activityLevels.map((level) => (
                        <TouchableOpacity
                            key={level}
                            onPress={() => setActivityLevel(level)}
                            className={`p-4 rounded-lg mb-2 border ${activityLevel === level
                                ? 'bg-primary/10 border-primary'
                                : 'bg-surface-highlight/50 border-transparent'
                                }`}>
                            <AccessibleText weight="bold" className={`mb-1 ${activityLevel === level ? 'text-primary' : 'text-text'}`}>
                                {getActivityLevelDisplayName(level)}
                            </AccessibleText>
                            <AccessibleText variant="caption" className="text-text-secondary">
                                {getActivityLevelDescription(level)}
                            </AccessibleText>
                        </TouchableOpacity>
                    ))}
                </Card>

                {/* Objetivo */}
                <Card variant="glass" className="p-4 mb-4 border-border/10">
                    <AccessibleText variant="h3" weight="bold" className="text-text mb-4">{t('profile.configure.objective', 'Objetivo')}</AccessibleText>
                    {objectives.map((obj) => (
                        <TouchableOpacity
                            key={obj}
                            onPress={() => setObjective(obj)}
                            className={`p-4 rounded-lg mb-2 border ${objective === obj
                                ? 'bg-success/10 border-success'
                                : 'bg-surface-highlight/50 border-transparent'
                                }`}>
                            <AccessibleText weight="bold" className={`mb-1 ${objective === obj ? 'text-success' : 'text-text'}`}>
                                {getObjectiveDisplayName(obj)}
                            </AccessibleText>
                            <AccessibleText variant="caption" className="text-text-secondary">
                                {getObjectiveDescription(obj)}
                            </AccessibleText>
                        </TouchableOpacity>
                    ))}
                </Card>

                {/* Velocidad del Objetivo */}
                <Card variant="glass" className="p-4 mb-4 border-border/10">
                    <AccessibleText variant="h3" weight="bold" className="text-text mb-4">{t('profile.configure.velocity', 'Velocidad')}</AccessibleText>
                    <View className="gap-3">
                        {[
                            { id: 'fast', label: t('profile.configure.velocityFast', 'Acelerado'), desc: t('profile.configure.velocityFastDesc', 'Mayor cambio, más difícil') },
                            { id: 'moderate', label: t('profile.configure.velocityModerate', 'Moderado'), desc: t('profile.configure.velocityModerateDesc', 'Balanceado y sostenible') },
                            { id: 'slow', label: t('profile.configure.velocitySlow', 'Lento'), desc: t('profile.configure.velocitySlowDesc', 'Cambios graduales, fácil de mantener') }
                        ].map((v) => (
                            <TouchableOpacity
                                key={v.id}
                                onPress={() => setGoalVelocity(v.id as GoalVelocity)}
                                className={`flex-row items-center p-3 rounded-lg border ${goalVelocity === v.id
                                    ? 'bg-info/10 border-info'
                                    : 'bg-surface-highlight/50 border-transparent'
                                    }`}
                            >
                                <View className={`w-5 h-5 rounded-full border-2 mr-3 items-center justify-center ${goalVelocity === v.id ? 'border-info' : 'border-border/20'
                                    }`}>
                                    {goalVelocity === v.id && <View className="w-2.5 h-2.5 rounded-full bg-info" />}
                                </View>
                                <View>
                                    <AccessibleText weight="bold" className={`${goalVelocity === v.id ? 'text-info' : 'text-text'}`}>
                                        {v.label}
                                    </AccessibleText>
                                    <AccessibleText variant="caption" className="text-text-secondary">{v.desc}</AccessibleText>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Card>

                {/* Calcular Button */}
                <TouchableOpacity
                    onPress={handleCalculate}
                    className="bg-primary p-4 rounded-xl active:bg-primary/80 mb-8">
                    <AccessibleText weight="bold" className="text-white text-center text-lg">
                        {t('profile.configure.calculateButton', 'Calcular Plan Nutricional')}
                    </AccessibleText>
                </TouchableOpacity>
            </ScrollView>
        </ScreenWrapper>
    );
}
