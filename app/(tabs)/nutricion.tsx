import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Card } from '@/components/ui/Card';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { useNutritionStore, MealType, DailyNutrition } from '@/store/nutritionStore';
import { useUserProfileStore } from '@/store/userProfileStore';
import { useMealPlanStore, Meal } from '@/store/mealPlanStore';
import { WhyTooltip } from '@/components/WhyTooltip';
import { getLocalDateString } from '@/utils/dateUtils';
import { AccessibleText } from '@/components/ui/AccessibleText';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';

// Meal type configuration helper moved inside component to access theme

interface MealSectionProps {
    mealType: MealType;
    label: string;
    icon: any;
    color: string;
    meals: any[];
    plannedMeals: Meal[];
    selectedDate: Date;
    canPaste: boolean;
    canPasteSingleMeal: boolean;
    onAddFood: () => void;
    onDeleteMeal: (mealId: string) => void;
    onLogPlannedMeal: (meal: Meal) => void;
    onCopy: () => void;
    onPaste: () => void;
    onCopySingleMeal: (meal: any) => void;
    onPasteSingleMeal: () => void;
    t: any;
}

function MealSection({ mealType, label, icon, color, meals, plannedMeals, selectedDate, canPaste, canPasteSingleMeal, onAddFood, onDeleteMeal, onLogPlannedMeal, onCopy, onPaste, onCopySingleMeal, onPasteSingleMeal, t }: MealSectionProps) {
    const { theme } = useAppTheme();
    const colors = Colors[theme];
    const [isExpanded, setIsExpanded] = useState(true);

    const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
    const totalProtein = meals.reduce((sum, meal) => sum + meal.protein, 0);
    const totalCarbs = meals.reduce((sum, meal) => sum + meal.carbs, 0);
    const totalFats = meals.reduce((sum, meal) => sum + meal.fats, 0);

    return (
        <View className="mb-4">
            <Card variant="glass" className="overflow-hidden p-0">
                {/* Header */}
                <TouchableOpacity
                    onPress={() => setIsExpanded(!isExpanded)}
                    className="flex-row items-center justify-between p-4"
                    activeOpacity={0.7}
                >
                    <View className="flex-row items-center flex-1">
                        <View
                            className="w-10 h-10 rounded-2xl items-center justify-center mr-3"
                            style={{ backgroundColor: `${color}20` }}
                        >
                            <Ionicons name={icon} size={28} color={color} />
                        </View>
                        <View className="flex-1">
                            <AccessibleText weight="bold" className="text-text text-base">{label}</AccessibleText>
                            <AccessibleText className="text-text-muted text-xs">
                                {totalCalories} kcal • {meals.length} {t('nutrition.foodItems', { count: meals.length })}
                            </AccessibleText>
                        </View>
                    </View>
                    <View className="flex-row items-center gap-3">
                        {/* Copy Button */}
                        {meals.length > 0 && (
                            <TouchableOpacity
                                onPress={(e) => {
                                    e.stopPropagation();
                                    onCopy();
                                }}
                                className="w-10 h-10 rounded-xl items-center justify-center bg-primary/20"
                            >
                                <Ionicons name="copy-outline" size={20} color={colors.primary} />
                            </TouchableOpacity>
                        )}
                        {/* Paste Section Button */}
                        {canPaste && (
                            <TouchableOpacity
                                onPress={(e) => {
                                    e.stopPropagation();
                                    onPaste();
                                }}
                                className="w-10 h-10 rounded-xl items-center justify-center bg-success/20"
                            >
                                <Ionicons name="layers-outline" size={20} color={colors.success} />
                            </TouchableOpacity>
                        )}
                        {/* Paste Single Meal Button */}
                        {canPasteSingleMeal && (
                            <TouchableOpacity
                                onPress={(e) => {
                                    e.stopPropagation();
                                    onPasteSingleMeal();
                                }}
                                className="w-10 h-10 rounded-xl items-center justify-center bg-success/20"
                            >
                                <Ionicons name="clipboard-outline" size={20} color={colors.success} />
                            </TouchableOpacity>
                        )}
                        {/* Add Button */}
                        <TouchableOpacity
                            onPress={onAddFood}
                            className="w-10 h-10 rounded-xl items-center justify-center"
                            style={{ backgroundColor: `${color}30` }}
                        >
                            <Ionicons name="add" size={24} color={color} />
                        </TouchableOpacity>
                        <Ionicons
                            name={isExpanded ? 'chevron-up' : 'chevron-down'}
                            size={20}
                            color={colors.textMuted}
                        />
                    </View>
                </TouchableOpacity>

                {/* Expanded Content */}
                {isExpanded && (
                    <View className="px-4 pb-4">
                        {/* Planned Meals (Ghost Items) */}
                        {plannedMeals.length > 0 && (
                            <View className="mb-3">
                                <AccessibleText weight="bold" className="text-text-muted text-[10px] mb-2 uppercase tracking-widest">{t('nutrition.suggestedByAI')}</AccessibleText>
                                {plannedMeals.map((meal) => (
                                    <View key={meal.id} className="bg-primary/5 rounded-2xl p-3 mb-2 border border-primary/30 border-dashed">
                                        <View className="flex-row justify-between items-start">
                                            <View className="flex-1">
                                                <AccessibleText weight="bold" className="text-text text-sm mb-1">
                                                    {meal.name}
                                                </AccessibleText>
                                                <View className="flex-row gap-3 mb-1">
                                                    <AccessibleText className="text-primary/70 text-xs">P: {Math.round(meal.protein)}g</AccessibleText>
                                                    <AccessibleText className="text-success/70 text-xs">C: {Math.round(meal.carbs)}g</AccessibleText>
                                                    <AccessibleText className="text-warning/70 text-xs">G: {Math.round(meal.fat)}g</AccessibleText>
                                                </View>
                                                {/* Show Ingredients */}
                                                {meal.ingredients && meal.ingredients.length > 0 && (
                                                    <View className="flex-row flex-wrap gap-1 mt-1">
                                                        {meal.ingredients.map((ing, i) => (
                                                            <AccessibleText key={i} className="text-text-muted text-[10px] italic">
                                                                • {ing}
                                                            </AccessibleText>
                                                        ))}
                                                    </View>
                                                )}
                                            </View>
                                            <View className="items-end">
                                                <TouchableOpacity
                                                    onPress={() => onLogPlannedMeal(meal)}
                                                    className="bg-primary px-3 py-1.5 rounded-full flex-row items-center"
                                                >
                                                    <Ionicons name="checkmark" size={14} color="white" />
                                                    <AccessibleText weight="bold" className="text-white text-xs ml-1">{t('nutrition.eat')}</AccessibleText>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}

                        {meals.length === 0 && plannedMeals.length === 0 ? (
                            <View className="py-6 items-center">
                                <AccessibleText className="text-text-muted text-sm">{t('nutrition.noFoods')}</AccessibleText>
                                <TouchableOpacity
                                    onPress={onAddFood}
                                    className="mt-3 px-4 py-2 rounded-full"
                                    style={{ backgroundColor: `${color}20` }}
                                >
                                    <AccessibleText weight="bold" className="text-sm" style={{ color }}>
                                        {t('nutrition.addFood')}
                                    </AccessibleText>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <>
                                {/* Food List */}
                                {meals.map((meal) => {
                                    const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
                                        const trans = dragX.interpolate({
                                            inputRange: [-100, 0],
                                            outputRange: [0, 100],
                                            extrapolate: 'clamp',
                                        });

                                        return (
                                            <Animated.View
                                                style={{
                                                    transform: [{ translateX: trans }],
                                                }}
                                                className="justify-center"
                                            >
                                                <TouchableOpacity
                                                    onPress={() => onDeleteMeal(meal.id)}
                                                    className="bg-error h-full justify-center px-6 rounded-r-2xl"
                                                >
                                                    <Ionicons name="trash" size={24} color="white" />
                                                </TouchableOpacity>
                                            </Animated.View>
                                        );
                                    };

                                    return (
                                        <Swipeable
                                            key={meal.id}
                                            renderRightActions={renderRightActions}
                                            overshootRight={false}
                                        >
                                            <View className="bg-surface-highlight/30 rounded-2xl p-3 mb-2 border border-border/5">
                                                <View className="flex-row justify-between items-start">
                                                    <View className="flex-1">
                                                        <AccessibleText weight="bold" className="text-text text-sm mb-1">
                                                            {meal.name}
                                                        </AccessibleText>
                                                        <View className="flex-row gap-3">
                                                            <AccessibleText className="text-primary text-xs">P: {Math.round(meal.protein)}g</AccessibleText>
                                                            <AccessibleText className="text-success text-xs">C: {Math.round(meal.carbs)}g</AccessibleText>
                                                            <AccessibleText className="text-warning text-xs">G: {Math.round(meal.fats)}g</AccessibleText>
                                                        </View>
                                                    </View>
                                                    <View className="flex-row items-center gap-3">
                                                        <TouchableOpacity
                                                            onPress={() => onCopySingleMeal(meal)}
                                                            className="w-8 h-8 rounded-xl items-center justify-center bg-surface-highlight"
                                                        >
                                                            <Ionicons name="copy-outline" size={16} color={colors.textMuted} />
                                                        </TouchableOpacity>
                                                        <View className="items-end">
                                                            <AccessibleText weight="bold" className="text-warning text-base">
                                                                {meal.calories}
                                                            </AccessibleText>
                                                            <AccessibleText weight="bold" className="text-text-muted text-[10px] uppercase">kcal</AccessibleText>
                                                        </View>
                                                    </View>
                                                </View>
                                            </View>
                                        </Swipeable>
                                    );
                                })}

                                {/* Meal Totals */}
                                <View className="mt-2 pt-3 border-t border-border/10">
                                    <View className="flex-row justify-between items-center">
                                        <AccessibleText weight="bold" className="text-text-muted text-xs uppercase tracking-widest">{t('nutrition.total')}</AccessibleText>
                                        <View className="flex-row gap-3">
                                            <AccessibleText weight="bold" className="text-primary text-xs">P: {Math.round(totalProtein)}g</AccessibleText>
                                            <AccessibleText weight="bold" className="text-success text-xs">C: {Math.round(totalCarbs)}g</AccessibleText>
                                            <AccessibleText weight="bold" className="text-warning text-xs">G: {Math.round(totalFats)}g</AccessibleText>
                                        </View>
                                    </View>
                                </View>
                            </>
                        )}
                    </View>
                )}
            </Card>
        </View>
    );
}

// Helper to create empty day data
const createEmptyDay = (dateKey: string): DailyNutrition => ({
    date: dateKey,
    caloriesConsumed: 0,
    caloriesBurned: 0,
    proteinConsumed: 0,
    carbsConsumed: 0,
    fatsConsumed: 0,
    meals: [],
    workouts: [],
});

export default function NutricionScreen() {
    const router = useRouter();
    const { t, i18n } = useTranslation();
    const { theme } = useAppTheme();
    const colors = Colors[theme];
    const { profile } = useUserProfileStore();
    // Subscribe to dailyData directly for reactivity
    const dailyData = useNutritionStore((state) => state.dailyData);
    const deleteMeal = useNutritionStore((state) => state.deleteMeal);
    const logMeal = useNutritionStore((state) => state.logMeal);
    const copyMealSection = useNutritionStore((state) => state.copyMealSection);
    const pasteMealSection = useNutritionStore((state) => state.pasteMealSection);
    const copySingleMeal = useNutritionStore((state) => state.copySingleMeal);
    const pasteSingleMeal = useNutritionStore((state) => state.pasteSingleMeal);
    const clipboard = useNutritionStore((state) => state.clipboard);
    const singleMealClipboard = useNutritionStore((state) => state.singleMealClipboard);

    const mealTypes = useMemo(() => [
        { id: 'breakfast', label: t('nutrition.mealTypes.breakfast'), icon: 'sunny', color: colors.orange[500] },
        { id: 'mid_morning', label: t('nutrition.mealTypes.mid_morning'), icon: 'cafe', color: colors.yellow[500] },
        { id: 'lunch', label: t('nutrition.mealTypes.lunch'), icon: 'restaurant', color: colors.green[500] },
        { id: 'snack', label: t('nutrition.mealTypes.snack'), icon: 'ice-cream', color: colors.secondary },
        { id: 'dinner', label: t('nutrition.mealTypes.dinner'), icon: 'moon', color: colors.primary },
    ], [t, colors]);

    // Meal Plan Store
    const { weeklyPlan, weeklyTemplates, fetchWeeklyPlan } = useMealPlanStore();

    // Date navigation state
    const [selectedDate, setSelectedDate] = useState(new Date());

    useEffect(() => {
        fetchWeeklyPlan();
    }, []);

    // Use local date for key to avoid timezone issues
    const getDateKey = (date: Date) => {
        return getLocalDateString(date);
    };

    // Compute day data reactively using useMemo
    const dayData = useMemo(() => {
        const dateKey = getDateKey(selectedDate);
        return dailyData[dateKey] || createEmptyDay(dateKey);
    }, [dailyData, selectedDate]);

    // Get planned meals for the selected date
    const plannedDay = useMemo(() => {
        const dateKey = getDateKey(selectedDate);
        // 1. Check for specific plan for this date
        const specificPlan = weeklyPlan.find(p => getLocalDateString(p.date) === dateKey);
        if (specificPlan) return specificPlan;

        // 2. Fallback to template for this day of week
        const dayOfWeek = selectedDate.getDay();
        return weeklyTemplates.find(t => t.dayOfWeek === dayOfWeek);
    }, [weeklyPlan, weeklyTemplates, selectedDate]);

    // Navigate to previous/next day
    const goToPreviousDay = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() - 1);
        setSelectedDate(newDate);
    };

    const goToNextDay = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + 1);
        setSelectedDate(newDate);
    };

    const goToToday = () => {
        setSelectedDate(new Date());
    };

    const isToday = getDateKey(selectedDate) === getDateKey(new Date());

    // Format date for display
    const formatDateDisplay = (date: Date) => {
        return date.toLocaleDateString(i18n.language === 'es' ? 'es-ES' : i18n.language, {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });
    };

    const caloriesConsumed = dayData.caloriesConsumed;
    const caloriesBurned = dayData.caloriesBurned;
    const calorieGoal = profile?.calorieGoal || 2500;
    const caloriesRemaining = calorieGoal - caloriesConsumed + caloriesBurned;

    const proteinConsumed = dayData.proteinConsumed;
    const proteinGoal = profile?.proteinGoal || 150;

    const carbsConsumed = dayData.carbsConsumed;
    const carbsGoal = profile?.carbsGoal || 250;

    const fatsConsumed = dayData.fatsConsumed;
    const fatsGoal = profile?.fatsGoal || 70;

    const percentageComplete = Math.min((caloriesConsumed / calorieGoal) * 100, 100);

    // Group meals by type
    const getMealsByType = (type: MealType) => {
        return dayData.meals.filter((meal: any) => meal.mealType === type);
    };

    const getPlannedMealsByType = (type: MealType) => {
        if (!plannedDay) return [];
        return plannedDay.meals.filter((m: Meal) => m.type === type);
    };

    const handleAddFood = (mealType: MealType) => {
        router.push({
            pathname: '/nutrition/log-meal',
            params: {
                mealType: mealType
            }
        });
    };

    const handleLogPlannedMeal = (meal: Meal) => {
        logMeal({
            name: meal.name,
            calories: meal.calories,
            protein: meal.protein,
            carbs: meal.carbs,
            fats: meal.fat,
            mealType: meal.type,
        });
        Alert.alert(t('nutrition.alerts.registered'), t('nutrition.alerts.addedToDiary', { name: meal.name }));
    };

    const handleCopyMeal = (mealType: MealType) => {
        const dateKey = getDateKey(selectedDate);
        copyMealSection(dateKey, mealType);
        Alert.alert(t('nutrition.alerts.copied'), t('nutrition.alerts.copiedToClipboard'));
    };

    const handlePasteMeal = () => {
        if (!clipboard) return;
        const dateKey = getDateKey(selectedDate);
        Alert.alert(
            t('nutrition.alerts.pasteSectionTitle'),
            t('nutrition.alerts.pasteSectionMessage', { count: clipboard.meals.length, type: t(`nutrition.mealTypes.${clipboard.mealType}`) }),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.continue'),
                    onPress: () => {
                        pasteMealSection(dateKey);
                        Alert.alert(t('nutrition.alerts.pasted'), t('nutrition.alerts.pastedSuccess'));
                    },
                },
            ]
        );
    };

    const handleCopySingleMeal = (meal: any) => {
        copySingleMeal(meal);
        Alert.alert(t('nutrition.alerts.copied'), t('nutrition.alerts.addedToDiary', { name: meal.name }));
    };

    const handlePasteSingleMeal = (mealType: MealType) => {
        if (!singleMealClipboard) return;
        const dateKey = getDateKey(selectedDate);
        pasteSingleMeal(dateKey, mealType);
        Alert.alert(t('nutrition.alerts.pasted'), t('nutrition.alerts.pastedSingleSuccess', { name: singleMealClipboard.name }));
    };

    const handleDeleteMeal = (mealId: string) => {
        Alert.alert(
            t('nutrition.alerts.deleteTitle'),
            t('nutrition.alerts.deleteMessage'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.delete'),
                    style: 'destructive',
                    onPress: () => {
                        deleteMeal(mealId);
                    },
                },
            ]
        );
    };

    return (
        <ScreenWrapper bg="bg-background" safeArea={true}>
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View className="p-4">
                    {/* Date Navigation */}
                    <Card variant="glass" className="mb-6 border-primary/30">
                        <View className="flex-row items-center justify-between">
                            <TouchableOpacity
                                onPress={goToPreviousDay}
                                className="w-10 h-10 rounded-2xl bg-primary/20 items-center justify-center"
                                accessibilityLabel={t('nutrition.previousDay')}
                            >
                                <Ionicons name="chevron-back" size={24} color={colors.primary} />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={goToToday} className="items-center">
                                <AccessibleText weight="bold" className="text-text text-lg">
                                    {formatDateDisplay(selectedDate)}
                                </AccessibleText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={goToNextDay}
                                className="w-10 h-10 rounded-2xl bg-primary/20 items-center justify-center"
                                accessibilityLabel={t('nutrition.nextDay')}
                            >
                                <Ionicons name="chevron-forward" size={24} color={colors.primary} />
                            </TouchableOpacity>
                        </View>
                    </Card>

                    <View className="mb-6">
                        <AccessibleText weight="bold" className="text-text-secondary text-xs uppercase tracking-widest">
                            {isToday ? t('nutrition.today') : formatDateDisplay(selectedDate).split(' de ')[0]}
                        </AccessibleText>
                        <AccessibleText weight="bold" className="text-text text-4xl mt-1">{t('nutrition.title')}</AccessibleText>
                        <TouchableOpacity onPress={() => fetchWeeklyPlan()} className="absolute right-0 top-2 p-2">
                            <Ionicons name="refresh" size={20} color={colors.primary} />
                        </TouchableOpacity>
                    </View>

                    {/* Calories Summary Card */}
                    <Card variant="glass" className="mb-6 border-warning/30">
                        <View className="flex-row justify-between items-start mb-4">
                            <View>
                                <View className="flex-row items-center mb-1">
                                    <AccessibleText weight="bold" className="text-text-secondary text-xs uppercase tracking-widest">{t('nutrition.caloriesRemaining')}</AccessibleText>
                                    <WhyTooltip
                                        title="¿Por Qué el Balance Calórico?"
                                        explanation="El balance calórico es la relación entre las calorías que consumes y las que quemas. Es el factor determinante para el cambio de peso corporal."
                                        examples={[
                                            "Superávit = Ganancia de peso",
                                            "Déficit = Pérdida de peso",
                                            "Mantenimiento = Peso estable"
                                        ]}
                                        scientific="La primera ley de la termodinámica dicta que la energía no se crea ni se destruye, solo se transforma. El balance energético es la base de la nutrición (Hall et al., 2012)."
                                    />
                                </View>
                                <AccessibleText weight="bold" className="text-text text-5xl">
                                    {Math.round(caloriesRemaining)}
                                </AccessibleText>
                                <AccessibleText weight="medium" className="text-text-muted text-xs mt-1">
                                    {caloriesConsumed} {t('nutrition.caloriesConsumed')} • {caloriesBurned} {t('nutrition.caloriesBurned')}
                                </AccessibleText>
                            </View>
                            <View className="bg-warning/20 px-3 py-1.5 rounded-full">
                                <AccessibleText weight="bold" className="text-warning text-sm">
                                    {Math.round(percentageComplete)}%
                                </AccessibleText>
                            </View>
                        </View>

                        {/* Progress Bar */}
                        <View className="h-4 bg-surface-highlight/50 rounded-full overflow-hidden mb-3 border border-border/5">
                            <LinearGradient
                                colors={Colors.gradients.orange}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={{ width: `${percentageComplete}%`, height: '100%' }}
                            />
                        </View>

                        {/* Macros Grid */}
                        <View className="flex-row gap-2 mt-2">
                            {/* Protein */}
                            <Card variant="outline" className="flex-1 p-3 border-primary/20">
                                <View className="flex-row items-center mb-1">
                                    <AccessibleText weight="bold" className="text-primary text-[10px] uppercase tracking-widest">{t('nutrition.protein')}</AccessibleText>
                                    <WhyTooltip
                                        title="Importancia de la Proteína"
                                        explanation="La proteína repara los tejidos y construye músculo. Es el macronutriente más saciante, lo que ayuda a controlar el hambre."
                                        examples={[
                                            "1.6-2.2g por kg de peso",
                                            "Fuentes: Pollo, huevos, legumbres",
                                            "Esencial para la recuperación"
                                        ]}
                                        scientific="La ingesta adecuada de proteína es crucial para mantener el balance de nitrógeno positivo necesario para la hipertrofia (Morton et al., 2018)."
                                    />
                                </View>
                                <AccessibleText weight="bold" className="text-text text-lg">
                                    {Math.round(proteinConsumed)}g
                                </AccessibleText>
                                <View className="h-1 bg-surface-highlight rounded-full mt-2 overflow-hidden">
                                    <View
                                        className="h-full bg-primary"
                                        style={{ width: `${Math.min((proteinConsumed / proteinGoal) * 100, 100)}%` }}
                                    />
                                </View>
                            </Card>

                            {/* Carbs */}
                            <Card variant="outline" className="flex-1 p-3 border-success/20">
                                <AccessibleText weight="bold" className="text-success text-[10px] uppercase tracking-widest mb-1">{t('nutrition.carbs')}</AccessibleText>
                                <AccessibleText weight="bold" className="text-text text-lg">
                                    {Math.round(carbsConsumed)}g
                                </AccessibleText>
                                <View className="h-1 bg-surface-highlight rounded-full mt-2 overflow-hidden">
                                    <View
                                        className="h-full bg-success"
                                        style={{ width: `${Math.min((carbsConsumed / carbsGoal) * 100, 100)}%` }}
                                    />
                                </View>
                            </Card>

                            {/* Fats */}
                            <Card variant="outline" className="flex-1 p-3 border-warning/20">
                                <AccessibleText weight="bold" className="text-warning text-[10px] uppercase tracking-widest mb-1">{t('nutrition.fats')}</AccessibleText>
                                <AccessibleText weight="bold" className="text-text text-lg">
                                    {Math.round(fatsConsumed)}g
                                </AccessibleText>
                                <View className="h-1 bg-surface-highlight rounded-full mt-2 overflow-hidden">
                                    <View
                                        className="h-full bg-warning"
                                        style={{ width: `${Math.min((fatsConsumed / fatsGoal) * 100, 100)}%` }}
                                    />
                                </View>
                            </Card>
                        </View>
                    </Card>

                    {/* Meal Sections */}
                    {mealTypes.map((mealType) => (
                        <MealSection
                            key={mealType.id}
                            mealType={mealType.id as MealType}
                            label={mealType.label}
                            icon={mealType.icon}
                            color={mealType.color}
                            meals={getMealsByType(mealType.id as MealType)}
                            plannedMeals={getPlannedMealsByType(mealType.id as MealType)}
                            selectedDate={selectedDate}
                            canPaste={clipboard?.mealType === mealType.id}
                            canPasteSingleMeal={!!singleMealClipboard}
                            onAddFood={() => handleAddFood(mealType.id as MealType)}
                            onDeleteMeal={handleDeleteMeal}
                            onLogPlannedMeal={handleLogPlannedMeal}
                            onCopy={() => handleCopyMeal(mealType.id as MealType)}
                            onPaste={handlePasteMeal}
                            onCopySingleMeal={handleCopySingleMeal}
                            onPasteSingleMeal={() => handlePasteSingleMeal(mealType.id as MealType)}
                            t={t}
                        />
                    ))}

                    {/* Quick Access Buttons */}
                    <View className="mt-2 mb-32 flex-row gap-3">
                        <TouchableOpacity
                            onPress={() => router.push('/nutrition/food-database')}
                            className="flex-1"
                        >
                            <Card variant="glass" className="border-primary/30 items-center">
                                <Ionicons name="search" size={24} color={colors.primary} />
                                <AccessibleText weight="bold" className="text-primary text-[10px] uppercase tracking-widest mt-2 text-center">
                                    {t('nutrition.foodDatabase')}
                                </AccessibleText>
                            </Card>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => router.push('/nutrition/shopping-list')}
                            className="flex-1"
                        >
                            <Card variant="glass" className="border-secondary/30 items-center">
                                <Ionicons name="cart" size={24} color={colors.secondary} />
                                <AccessibleText weight="bold" className="text-secondary text-[10px] uppercase tracking-widest mt-2 text-center">
                                    {t('nutrition.shoppingList')}
                                </AccessibleText>
                            </Card>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => router.push('/nutrition/recipes')}
                            className="flex-1"
                        >
                            <Card variant="glass" className="border-warning/30 items-center">
                                <Ionicons name="restaurant" size={24} color={colors.warning} />
                                <AccessibleText weight="bold" className="text-warning text-[10px] uppercase tracking-widest mt-2 text-center">
                                    {t('nutrition.myRecipes')}
                                </AccessibleText>
                            </Card>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}
