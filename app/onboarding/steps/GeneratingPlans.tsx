import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { UserProfile, useUserProfileStore } from '@/store/userProfileStore';
import { useSavedRoutinesStore } from '@/store/savedRoutinesStore';
import { generateWorkoutPlan, generateNutritionPlan } from '@/utils/planGenerator';
import { Card } from '@/components/ui/Card';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { AccessibleText } from '@/components/ui/AccessibleText';
import { a11y } from '@/utils/accessibility';
import { Colors } from '@/constants/Colors';
import { useAppTheme } from '@/hooks/use-app-theme';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default function GeneratingPlans() {
    const { t } = useTranslation();
    const [status, setStatus] = useState(t('onboarding.generating.preparing'));
    const [progress, setProgress] = useState(0);
    const router = useRouter();
    const { profile, updateProfile } = useUserProfileStore();
    const { addRoutine } = useSavedRoutinesStore();
    const { theme } = useAppTheme();
    const colors = Colors[theme];

    useEffect(() => {
        if (profile) {
            generatePlan();
        }
    }, []);

    const calculateMacros = (profile: Partial<UserProfile>) => {
        const weight = profile.weight || 70;
        const height = profile.height || 170;
        const age = profile.age || 25;
        const gender = profile.gender || 'male';

        let bmr: number;
        if (gender === 'male') {
            bmr = 10 * weight + 6.25 * height - 5 * age + 5;
        } else {
            bmr = 10 * weight + 6.25 * height - 5 * age - 161;
        }

        const activityMultiplier = { 1: 1.2, 2: 1.3, 3: 1.4, 4: 1.5, 5: 1.6, 6: 1.7, 7: 1.8 };
        const days = profile.workoutDaysPerWeek || 3;
        const tdee = bmr * (activityMultiplier[days as keyof typeof activityMultiplier] || 1.4);

        let calorieGoal = tdee;
        if (profile.fitnessGoal === 'lose_fat') {
            calorieGoal = tdee - 500;
        } else if (profile.fitnessGoal === 'gain_muscle') {
            calorieGoal = tdee + 300;
        }

        const proteinGoal = Math.round(weight * 2);
        const fatGoal = Math.round((calorieGoal * 0.25) / 9);
        const carbsGoal = Math.round((calorieGoal - (proteinGoal * 4) - (fatGoal * 9)) / 4);

        return {
            bmr: Math.round(bmr),
            tdee: Math.round(tdee),
            calorieGoal: Math.round(calorieGoal),
            proteinGoal,
            carbsGoal,
            fatsGoal: fatGoal,
        };
    };

    const generatePlan = async () => {
        if (!profile) return;
        try {
            setStatus(t('onboarding.generating.calculatingMacros'));
            setProgress(10);
            await sleep(1000);

            const macros = calculateMacros(profile);
            const completeProfile = { ...profile, ...macros } as UserProfile;

            setStatus(t('onboarding.generating.creatingWorkout'));
            setProgress(30);
            await sleep(500);

            const workoutPlan = await generateWorkoutPlan(completeProfile);

            setStatus(t('onboarding.generating.workoutDone'));
            setProgress(60);
            await sleep(500);

            setStatus(t('onboarding.generating.designingNutrition'));
            setProgress(70);

            const nutritionPlan = await generateNutritionPlan(completeProfile);

            setStatus(t('onboarding.generating.nutritionDone'));
            setProgress(90);
            await sleep(500);

            setStatus(t('onboarding.generating.saving'));
            setProgress(95);

            // Save workout routines
            if (workoutPlan && workoutPlan.routines) {
                const { processWorkoutExercises } = await import('@/utils/exerciseMapper');
                const { useWeeklyScheduleStore } = await import('@/store/weeklyScheduleStore');
                const { scheduleWorkout, clearSchedule } = useWeeklyScheduleStore.getState();

                const routineNameToId: Record<string, string> = {};
                for (const routine of workoutPlan.routines) {
                    const mappedExercises = await processWorkoutExercises(routine.exercises);
                    if (mappedExercises.length > 0) {
                        const routineId = await addRoutine(routine.name, mappedExercises);
                        if (routineId) routineNameToId[routine.name] = routineId;
                    }
                }

                if (Object.keys(routineNameToId).length > 0) {
                    await clearSchedule();
                    const { generateScheduleFromPlan } = await import('@/utils/scheduleUtils');
                    const smartSchedule = generateScheduleFromPlan(routineNameToId, workoutPlan.schedule, 4);
                    for (const workout of smartSchedule) {
                        await scheduleWorkout(workout.routineId, workout.date.toISOString());
                    }
                }
            }

            // Save nutrition plan
            if (nutritionPlan) {
                const { useMealPlanStore } = await import('@/store/mealPlanStore');
                const { saveMealPlan } = useMealPlanStore.getState();
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const dailyPlans = (nutritionPlan.days || []).map((day, index) => {
                    const date = new Date(today);
                    date.setDate(date.getDate() + index);
                    return {
                        id: `day-${index}`,
                        date,
                        meals: day.meals.map((meal, mealIdx) => ({
                            id: `meal-${index}-${mealIdx}`,
                            type: meal.type,
                            name: meal.name,
                            calories: meal.calories,
                            protein: meal.protein,
                            carbs: meal.carbs,
                            fat: meal.fat,
                            ingredients: meal.ingredients || [],
                            instructions: meal.instructions,
                            prepTime: meal.prepTime,
                        }))
                    };
                });
                await saveMealPlan(dailyPlans);
            }

            await updateProfile({ ...completeProfile, hasCompletedOnboarding: true });

            setStatus(t('onboarding.generating.allDone'));
            setProgress(100);
            await sleep(1000);
            router.replace('/(tabs)');

        } catch (error) {
            console.error('Error generating plans:', error);
            Alert.alert(
                t('common.error'),
                t('onboarding.generating.error'),
                [
                    { text: t('onboarding.generating.retry'), onPress: generatePlan },
                    {
                        text: t('onboarding.generating.continueWithoutPlan'),
                        onPress: async () => {
                            const macros = calculateMacros(profile);
                            await updateProfile({ ...profile, ...macros, hasCompletedOnboarding: true } as UserProfile);
                            router.replace('/(tabs)');
                        }
                    }
                ]
            );
        }
    };

    return (
        <ScreenWrapper className="justify-center items-center px-6">
            <Ionicons name="sparkles-outline" size={80} color={colors.primary} />

            <AccessibleText variant="h1" weight="bold" className="text-white text-center mt-6">
                {t('onboarding.generating.title')}
            </AccessibleText>

            <AccessibleText className="text-text-secondary text-center mt-3 mb-8">
                {t('onboarding.generating.subtitle')}
            </AccessibleText>

            <View className="w-full mb-6" accessibilityRole="progressbar" accessibilityLabel={`Progreso de generación: ${progress}%`}>
                <View className="h-2 bg-surface rounded-full overflow-hidden">
                    <View
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${progress}%` }}
                    />
                </View>
                <AccessibleText weight="bold" className="text-primary text-sm text-center mt-2">
                    {progress}%
                </AccessibleText>
            </View>

            <ActivityIndicator size="large" color={colors.primary} />

            <AccessibleText weight="medium" className="text-text-secondary text-center mt-4">
                {status}
            </AccessibleText>

            <Card variant="glass" className="mt-8 w-full p-6">
                <AccessibleText variant="caption" className="text-text-secondary text-center leading-relaxed">
                    {progress < 30 && t('onboarding.generating.tip1')}
                    {progress >= 30 && progress < 60 && t('onboarding.generating.tip2')}
                    {progress >= 60 && progress < 90 && t('onboarding.generating.tip3')}
                    {progress >= 90 && t('onboarding.generating.tip4')}
                </AccessibleText>
            </Card>
        </ScreenWrapper>
    );
}
