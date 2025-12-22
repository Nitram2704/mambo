import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Animated } from 'react-native';
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

// Meal type configuration
const getMealTypes = (t: any) => [
    { id: 'breakfast', label: t('nutrition.mealTypes.breakfast'), icon: 'sunny', color: '#f97316' },
    { id: 'mid_morning', label: t('nutrition.mealTypes.mid_morning'), icon: 'cafe', color: '#eab308' },
    { id: 'lunch', label: t('nutrition.mealTypes.lunch'), icon: 'restaurant', color: '#22c55e' },
    { id: 'snack', label: t('nutrition.mealTypes.snack'), icon: 'ice-cream', color: '#a855f7' },
    { id: 'dinner', label: t('nutrition.mealTypes.dinner'), icon: 'moon', color: '#3b82f6' },
];

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
                            <Text className="text-text font-bold text-base">{label}</Text>
                            <Text className="text-text-muted text-xs">
                                {totalCalories} kcal • {meals.length} {t('nutrition.foodItems', { count: meals.length })}
                            </Text>
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
                                className="w-16 h-16 rounded-xl items-center justify-center bg-primary/20"
                            >
                                <Ionicons name="copy-outline" size={28} color="#3b82f6" />
                            </TouchableOpacity>
                        )}
                        {/* Paste Section Button */}
                        {canPaste && (
                            <TouchableOpacity
                                onPress={(e) => {
                                    e.stopPropagation();
                                    onPaste();
                                }}
                                className="w-16 h-16 rounded-xl items-center justify-center bg-success/20"
                            >
                                <Ionicons name="layers-outline" size={28} color="#22c55e" />
                            </TouchableOpacity>
                        )}
                        {/* Paste Single Meal Button */}
                        {canPasteSingleMeal && (
                            <TouchableOpacity
                                onPress={(e) => {
                                    e.stopPropagation();
                                    onPasteSingleMeal();
                                }}
                                className="w-16 h-16 rounded-xl items-center justify-center bg-success/20"
                            >
                                <Ionicons name="clipboard-outline" size={28} color="#22c55e" />
                            </TouchableOpacity>
                        )}
                        {/* Add Button */}
                        <TouchableOpacity
                            onPress={onAddFood}
                            className="w-16 h-16 rounded-xl items-center justify-center"
                            style={{ backgroundColor: `${color}30` }}
                        >
                            <Ionicons name="add" size={28} color={color} />
                        </TouchableOpacity>
                        <Ionicons
                            name={isExpanded ? 'chevron-up' : 'chevron-down'}
                            size={20}
                            color="#64748b"
                        />
                    </View>
                </TouchableOpacity>

                {/* Expanded Content */}
                {isExpanded && (
                    <View className="px-4 pb-4">
                        {/* Planned Meals (Ghost Items) */}
                        {plannedMeals.length > 0 && (
                            <View className="mb-3">
                                <Text className="text-text-muted text-[10px] font-black mb-2 uppercase tracking-widest">{t('nutrition.suggestedByAI')}</Text>
                                {plannedMeals.map((meal) => (
                                    <View key={meal.id} className="bg-primary/5 rounded-2xl p-3 mb-2 border border-primary/30 border-dashed">
                                        <View className="flex-row justify-between items-start">
                                            <View className="flex-1">
                                                <Text className="text-text font-bold text-sm mb-1">
                                                    {meal.name}
                                                </Text>
                                                <View className="flex-row gap-3 mb-1">
                                                    <Text className="text-primary/70 text-xs">P: {Math.round(meal.protein)}g</Text>
                                                    <Text className="text-success/70 text-xs">C: {Math.round(meal.carbs)}g</Text>
                                                    <Text className="text-warning/70 text-xs">G: {Math.round(meal.fat)}g</Text>
                                                </View>
                                                {/* Show Ingredients */}
                                                {meal.ingredients && meal.ingredients.length > 0 && (
                                                    <View className="flex-row flex-wrap gap-1 mt-1">
                                                        {meal.ingredients.map((ing, i) => (
                                                            <Text key={i} className="text-text-muted text-[10px] italic">
                                                                • {ing}
                                                            </Text>
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
                                                    <Text className="text-white text-xs font-bold ml-1">{t('nutrition.eat')}</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}

                        {meals.length === 0 && plannedMeals.length === 0 ? (
                            <View className="py-6 items-center">
                                <Text className="text-text-muted text-sm">{t('nutrition.noFoods')}</Text>
                                <TouchableOpacity
                                    onPress={onAddFood}
                                    className="mt-3 px-4 py-2 rounded-full"
                                    style={{ backgroundColor: `${color}20` }}
                                >
                                    <Text className="font-bold text-sm" style={{ color }}>
                                        {t('nutrition.addFood')}
                                    </Text>
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
                                                        <Text className="text-text font-bold text-sm mb-1">
                                                            {meal.name}
                                                        </Text>
                                                        <View className="flex-row gap-3">
                                                            <Text className="text-primary text-xs">P: {Math.round(meal.protein)}g</Text>
                                                            <Text className="text-success text-xs">C: {Math.round(meal.carbs)}g</Text>
                                                            <Text className="text-warning text-xs">G: {Math.round(meal.fats)}g</Text>
                                                        </View>
                                                    </View>
                                                    <View className="flex-row items-center gap-3">
                                                        <TouchableOpacity
                                                            onPress={() => onCopySingleMeal(meal)}
                                                            className="w-8 h-8 rounded-xl items-center justify-center bg-surface-highlight"
                                                        >
                                                            <Ionicons name="copy-outline" size={16} color="#94a3b8" />
                                                        </TouchableOpacity>
                                                        <View className="items-end">
                                                            <Text className="text-warning font-black text-base">
                                                                {meal.calories}
                                                            </Text>
                                                            <Text className="text-text-muted text-[10px] font-bold uppercase">kcal</Text>
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
                                        <Text className="text-text-muted text-xs font-black uppercase tracking-widest">{t('nutrition.total')}</Text>
                                        <View className="flex-row gap-3">
                                            <Text className="text-primary text-xs font-bold">P: {Math.round(totalProtein)}g</Text>
                                            <Text className="text-success text-xs font-bold">C: {Math.round(totalCarbs)}g</Text>
                                            <Text className="text-warning text-xs font-bold">G: {Math.round(totalFats)}g</Text>
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
                            >
                                <Ionicons name="chevron-back" size={24} color="#3b82f6" />
                            </TouchableOpacity>

                            <View className="flex-1 items-center mx-3">
                                <Text className="text-text text-lg font-bold capitalize">
                                    {formatDateDisplay(selectedDate)}
                                </Text>
                                {!isToday && (
                                    <TouchableOpacity onPress={goToToday}>
                                        <Text className="text-primary text-xs mt-1 font-bold">{t('nutrition.backToToday')}</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            <TouchableOpacity
                                onPress={goToNextDay}
                                className="w-10 h-10 rounded-2xl bg-primary/20 items-center justify-center"
                            >
                                <Ionicons name="chevron-forward" size={24} color="#3b82f6" />
                            </TouchableOpacity>
                        </View>
                    </Card>

                    <View className="mb-6">
                        <Text className="text-text-secondary text-xs font-black uppercase tracking-widest">
                            {isToday ? t('nutrition.today') : formatDateDisplay(selectedDate).split(' de ')[0]}
                        </Text>
                        <Text className="text-text text-4xl font-black mt-1">{t('nutrition.title')}</Text>
                        <TouchableOpacity onPress={() => fetchWeeklyPlan()} className="absolute right-0 top-2 p-2">
                            <Ionicons name="refresh" size={20} color="#3b82f6" />
                        </TouchableOpacity>
                    </View>

                    {/* Calories Summary Card */}
                    <Card variant="glass" className="mb-6 border-warning/30">
                        <View className="flex-row justify-between items-start mb-4">
                            <View>
                                <View className="flex-row items-center mb-1">
                                    <Text className="text-text-secondary text-xs font-black uppercase tracking-widest">{t('nutrition.caloriesRemaining')}</Text>
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
                                <Text className="text-text text-5xl font-black">
                                    {Math.round(caloriesRemaining)}
                                </Text>
                                <Text className="text-text-muted text-xs font-medium mt-1">
                                    {caloriesConsumed} {t('nutrition.caloriesConsumed')} • {caloriesBurned} {t('nutrition.caloriesBurned')}
                                </Text>
                            </View>
                            <View className="bg-warning/20 px-3 py-1.5 rounded-full">
                                <Text className="text-warning font-black text-sm">
                                    {Math.round(percentageComplete)}%
                                </Text>
                            </View>
                        </View>

                        {/* Progress Bar */}
                        <View className="h-4 bg-surface-highlight/50 rounded-full overflow-hidden mb-3 border border-border/5">
                            <LinearGradient
                                colors={['#f97316', '#ea580c']}
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
                                    <Text className="text-primary text-[10px] font-black uppercase tracking-widest">{t('nutrition.protein')}</Text>
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
                                <Text className="text-text font-bold text-lg">
                                    {Math.round(proteinConsumed)}g
                                </Text>
                                <View className="h-1 bg-surface-highlight rounded-full mt-2 overflow-hidden">
                                    <View
                                        className="h-full bg-primary"
                                        style={{ width: `${Math.min((proteinConsumed / proteinGoal) * 100, 100)}%` }}
                                    />
                                </View>
                            </Card>

                            {/* Carbs */}
                            <Card variant="outline" className="flex-1 p-3 border-success/20">
                                <Text className="text-success text-[10px] font-black uppercase tracking-widest mb-1">{t('nutrition.carbs')}</Text>
                                <Text className="text-text font-bold text-lg">
                                    {Math.round(carbsConsumed)}g
                                </Text>
                                <View className="h-1 bg-surface-highlight rounded-full mt-2 overflow-hidden">
                                    <View
                                        className="h-full bg-success"
                                        style={{ width: `${Math.min((carbsConsumed / carbsGoal) * 100, 100)}%` }}
                                    />
                                </View>
                            </Card>

                            {/* Fats */}
                            <Card variant="outline" className="flex-1 p-3 border-warning/20">
                                <Text className="text-warning text-[10px] font-black uppercase tracking-widest mb-1">{t('nutrition.fats')}</Text>
                                <Text className="text-text font-bold text-lg">
                                    {Math.round(fatsConsumed)}g
                                </Text>
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
                    {getMealTypes(t).map((mealType) => (
                        <MealSection
                            key={mealType.id}
                            mealType={mealType.id as MealType}
                            label={mealType.label}
                            icon={mealType.icon}
                            color={mealType.color}
                            meals={getMealsByType(mealType.id)}
                            plannedMeals={getPlannedMealsByType(mealType.id)}
                            selectedDate={selectedDate}
                            canPaste={clipboard?.mealType === mealType.id}
                            canPasteSingleMeal={!!singleMealClipboard}
                            onAddFood={() => handleAddFood(mealType.id)}
                            onDeleteMeal={handleDeleteMeal}
                            onLogPlannedMeal={handleLogPlannedMeal}
                            onCopy={() => handleCopyMeal(mealType.id)}
                            onPaste={handlePasteMeal}
                            onCopySingleMeal={handleCopySingleMeal}
                            onPasteSingleMeal={() => handlePasteSingleMeal(mealType.id)}
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
                                <Ionicons name="search" size={24} color="#3b82f6" />
                                <Text className="text-primary font-bold text-[10px] font-black uppercase tracking-widest mt-2 text-center">
                                    {t('nutrition.foodDatabase')}
                                </Text>
                            </Card>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => router.push('/nutrition/shopping-list')}
                            className="flex-1"
                        >
                            <Card variant="glass" className="border-secondary/30 items-center">
                                <Ionicons name="cart" size={24} color="#8b5cf6" />
                                <Text className="text-secondary font-bold text-[10px] font-black uppercase tracking-widest mt-2 text-center">
                                    {t('nutrition.shoppingList')}
                                </Text>
                            </Card>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => router.push('/nutrition/recipes')}
                            className="flex-1"
                        >
                            <Card variant="glass" className="border-warning/30 items-center">
                                <Ionicons name="restaurant" size={24} color="#eab308" />
                                <Text className="text-warning font-bold text-[10px] font-black uppercase tracking-widest mt-2 text-center">
                                    {t('nutrition.myRecipes')}
                                </Text>
                            </Card>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}
