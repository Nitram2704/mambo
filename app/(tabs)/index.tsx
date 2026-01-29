import { View, Text, ScrollView, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Card } from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';
import { useUserProfileStore } from '@/store/userProfileStore';
import { useNutritionStore, DailyNutrition } from '@/store/nutritionStore';
import { useSleepStore } from '@/store/sleepStore';
import { useWaterStore } from '@/store/waterStore';
import { useWeightStore } from '@/store/weightStore';
import { useUIStore } from '@/store/uiStore';
import { Colors } from '@/constants/Colors';
import { AccessibleText } from '@/components/ui/AccessibleText';
import { useMemo, useState } from 'react';
import WeeklyCheckinModal from '@/components/WeeklyCheckinModal';
import { WhyTooltip } from '@/components/WhyTooltip';
import { getLocalDateString } from '@/utils/dateUtils';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/hooks/use-app-theme';
import { handleLogout } from '@/utils/authUtils';

const { width } = Dimensions.get('window');

// Helper to create empty day data
const createEmptyDay = (): DailyNutrition => ({
  date: getLocalDateString(),
  caloriesConsumed: 0,
  caloriesBurned: 0,
  proteinConsumed: 0,
  carbsConsumed: 0,
  fatsConsumed: 0,
  meals: [],
  workouts: [],
});

export default function DashboardScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { theme } = useAppTheme();
  const isDark = theme === 'dark';
  const { profile } = useUserProfileStore();
  const { showToast } = useUIStore();

  // Subscribe to nutrition data directly for reactivity
  const nutritionDailyData = useNutritionStore((state) => state.dailyData);

  // Water Store - get data first, then select
  const addWater = useWaterStore((state) => state.addWater);
  const dailyWater = useWaterStore((state) => state.dailyWater);
  const defaultGoal = useWaterStore((state) => state.defaultGoal);

  const waterData = useMemo(() => {
    const today = getLocalDateString();
    return dailyWater[today] || {
      date: today,
      totalAmount: 0,
      logs: [],
      goal: defaultGoal
    };
  }, [dailyWater, defaultGoal]);

  const waterPercentage = Math.min((waterData.totalAmount / waterData.goal) * 100, 100);

  // Weight Store
  const weightStore = useWeightStore();

  // Sleep Store - subscribe to sleepLogs directly for reactivity
  const sleepLogs = useSleepStore((state) => state.sleepLogs);

  // Compute today's data reactively
  const todayData = useMemo(() => {
    const today = getLocalDateString();
    return nutritionDailyData[today] || createEmptyDay();
  }, [nutritionDailyData]);

  const caloriesRemaining = profile
    ? profile.calorieGoal - todayData.caloriesConsumed + todayData.caloriesBurned
    : 2587;
  const calorieGoal = profile?.calorieGoal || 2587;

  const proteinConsumed = todayData.proteinConsumed;
  const proteinGoal = profile?.proteinGoal || 112;

  const carbsConsumed = todayData.carbsConsumed;
  const carbsGoal = profile?.carbsGoal || 341;

  const fatsConsumed = todayData.fatsConsumed;
  const fatsGoal = profile?.fatsGoal || 86;

  const workoutMinutes = todayData.workouts.reduce((acc, w) => acc + w.duration, 0);

  const percentageComplete = ((todayData.caloriesConsumed / calorieGoal) * 100).toFixed(0);

  // Weekly Check-in State
  const [checkinModalVisible, setCheckinModalVisible] = useState(false);

  // Check if it's Monday (TEMPORARILY DISABLED FOR TESTING - always show)
  const isMonday = true; // new Date().getDay() === 1;

  const handleLogoutPress = () => {
    handleLogout(t);
  };

  return (
    <ScreenWrapper safeArea={true}>
      <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mb-5 mt-3 flex-row justify-between items-center animate-fade-in-down">
          <View>
            <AccessibleText className="text-primary text-xs font-black uppercase tracking-widest mb-1">
              {new Date().toLocaleDateString(i18n.language === 'es' ? 'es-ES' : 'en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </AccessibleText>
            <AccessibleText variant="h1" weight="black" className="text-text text-4xl tracking-tighter">{t('dashboard.title')}</AccessibleText>
          </View>
          <TouchableOpacity
            onPress={handleLogoutPress}
            className="p-3 rounded-2xl border border-border bg-surface-highlight/50"
          >
            <Ionicons name="log-out-outline" size={24} color={Colors[theme].error} />
          </TouchableOpacity>
        </View>

        {/* Main Stats Cards */}
        <View className="flex-row gap-3 mb-4">
          {/* Calories Card */}
          <Card variant="glass" className="flex-1 p-5 shadow-glow-sm animate-fade-in-up animate-delay-100 border-primary/20">
            <View className="flex-row items-center mb-3">
              <View className="w-8 h-8 rounded-full items-center justify-center mr-2 bg-primary/10">
                <Ionicons name="flame" size={18} color={Colors[theme].primary} />
              </View>
              <AccessibleText className="text-text-secondary text-xs font-bold uppercase tracking-wider">{t('dashboard.calories')}</AccessibleText>
            </View>
            <AccessibleText weight="black" className="text-text text-3xl tracking-tighter">{todayData.caloriesConsumed}</AccessibleText>
            <AccessibleText className="text-text-muted text-xs font-medium mt-1">/ {calorieGoal} kcal</AccessibleText>
          </Card>

          {/* Workouts Card */}
          <Card variant="glass" className="flex-1 p-5 shadow-glow-sm animate-fade-in-up animate-delay-200 border-secondary/20">
            <View className="flex-row items-center mb-3">
              <View className="w-8 h-8 rounded-full items-center justify-center mr-2 bg-secondary/10">
                <Ionicons name="barbell" size={18} color={Colors[theme].secondary} />
              </View>
              <AccessibleText className="text-text-secondary text-xs font-bold uppercase tracking-wider">{t('dashboard.workouts')}</AccessibleText>
            </View>
            <AccessibleText weight="black" className="text-text text-3xl tracking-tighter">{todayData.workouts.length}</AccessibleText>
            <AccessibleText className="text-text-muted text-xs font-medium mt-1">{t('dashboard.activeMinutes', { count: workoutMinutes })}</AccessibleText>
          </Card>
        </View>

        {/* Calorie Goal Progress */}
        <Card variant="glass" className="p-4 mb-4 animate-fade-in-up animate-delay-300">
          <View className="flex-row justify-between items-center mb-3">
            <AccessibleText weight="bold" className="text-text text-lg">{t('dashboard.dailyGoal')}</AccessibleText>
            <View className="px-3 py-1 rounded-full bg-primary/10">
              <AccessibleText weight="bold" className="text-primary text-xs">{percentageComplete}%</AccessibleText>
            </View>
          </View>

          <View className="h-4 rounded-full overflow-hidden mb-3 border border-border bg-surface-highlight/50">
            <LinearGradient
              colors={Colors.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ width: `${Math.min(parseFloat(percentageComplete), 100)}%`, height: '100%' }}
            />
          </View>
          <AccessibleText className="text-text-secondary text-sm font-medium text-right">
            {t('dashboard.caloriesRemaining', { count: Math.round(caloriesRemaining) })}
          </AccessibleText>
        </Card>

        {/* Macros Grid */}
        <View className="flex-row gap-2.5 mb-4">
          {/* Protein */}
          <Card variant="glass" className="flex-1 p-2.5 items-center border-blue-500/30 animate-fade-in-up animate-delay-400">
            <AccessibleText weight="bold" className="text-blue-500 text-[10px] uppercase mb-1">{t('dashboard.protein')}</AccessibleText>
            <AccessibleText weight="bold" className="text-text text-lg">{Math.round(proteinConsumed)}g</AccessibleText>
            <View className="w-full h-1.5 rounded-full mt-2 overflow-hidden bg-surface-highlight/50 animate-jiggle">
              <View className="h-full bg-blue-500" style={{ width: `${Math.min((proteinConsumed / proteinGoal) * 100, 100)}%` }} />
            </View>
          </Card>

          {/* Carbs */}
          <Card variant="glass" className="flex-1 p-2.5 items-center border-green-500/30 animate-fade-in-up animate-delay-500">
            <AccessibleText weight="bold" className="text-green-500 text-[10px] uppercase mb-1">{t('dashboard.carbs')}</AccessibleText>
            <AccessibleText weight="bold" className="text-text text-lg">{Math.round(carbsConsumed)}g</AccessibleText>
            <View className="w-full h-1.5 rounded-full mt-2 overflow-hidden bg-surface-highlight/50 animate-jiggle">
              <View className="h-full bg-green-500" style={{ width: `${Math.min((carbsConsumed / carbsGoal) * 100, 100)}%` }} />
            </View>
          </Card>

          {/* Fats */}
          <Card variant="glass" className="flex-1 p-2.5 items-center border-yellow-500/30 animate-fade-in-up animate-delay-600">
            <AccessibleText weight="bold" className="text-yellow-500 text-[10px] uppercase mb-1">{t('dashboard.fats')}</AccessibleText>
            <AccessibleText weight="bold" className="text-text text-lg">{Math.round(fatsConsumed)}g</AccessibleText>
            <View className="w-full h-1.5 rounded-full mt-2 overflow-hidden bg-surface-highlight/50 animate-jiggle">
              <View className="h-full bg-yellow-500" style={{ width: `${Math.min((fatsConsumed / fatsGoal) * 100, 100)}%` }} />
            </View>
          </Card>
        </View>

        {/* Water Tracker */}
        <Card variant="glass" className="p-4 mb-4 border-blue-500/30 animate-fade-in-up animate-delay-700">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <View className="bg-blue-500/10 p-2 rounded-full mr-3">
                <Ionicons name="water" size={20} color={Colors[theme].primary} />
              </View>
              <View>
                <View className="flex-row items-center flex-1">
                  <AccessibleText
                    weight="bold"
                    className="text-text text-lg"
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {t('dashboard.hydration')}
                  </AccessibleText>
                  <WhyTooltip
                    title={t('dashboard.whyDrinkWater')}
                    explanation={t('dashboard.waterExplanation')}
                    examples={t('dashboard.waterExamples', { returnObjects: true }) as string[]}
                    scientific={t('dashboard.waterScientific')}
                  />
                </View>
                <AccessibleText className="text-primary text-xs">{waterData.totalAmount} / {waterData.goal} ml</AccessibleText>
              </View>
            </View>
            <AccessibleText weight="bold" className="text-primary text-xl">{Math.round(waterPercentage)}%</AccessibleText>
          </View>

          <View className="h-3 rounded-full overflow-hidden mb-5 border border-border bg-surface-highlight/50">
            <LinearGradient
              colors={Colors.gradients.blue}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ width: `${waterPercentage}%`, height: '100%' }}
            />
          </View>

          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => addWater(-250)}
              disabled={waterData.totalAmount < 250}
              className={`flex-1 py-3 rounded-xl border items-center justify-center ${waterData.totalAmount < 250 ? 'bg-surface-highlight/50 border-border opacity-50' : 'bg-error/10 border-error/30'}`}
            >
              <AccessibleText weight="bold" className={`${waterData.totalAmount < 250 ? 'text-text-muted' : 'text-error'}`}>-250ml</AccessibleText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => addWater(250)}
              className="flex-1 py-3 rounded-xl border items-center justify-center bg-primary/10 border-primary/30"
            >
              <AccessibleText weight="bold" className="text-primary">+250ml</AccessibleText>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Weekly Check-in Card */}
        {isMonday && (
          <TouchableOpacity
            onPress={() => setCheckinModalVisible(true)}
            className="mb-4 animate-pop animate-delay-800"
          >
            <Card variant="glass" className="p-4 border-secondary/30">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View className="bg-secondary/10 p-3 rounded-full mr-4">
                    <Ionicons name="analytics" size={24} color={Colors[theme].secondary} />
                  </View>
                  <View className="flex-1">
                    <AccessibleText weight="bold" className="text-text text-lg mb-1">{t('dashboard.weeklyCheckin')}</AccessibleText>
                    <AccessibleText className="text-text-secondary text-sm">
                      {t('dashboard.weeklyCheckinDesc')}
                    </AccessibleText>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={24} color={Colors[theme].secondary} />
              </View>
            </Card>
          </TouchableOpacity>
        )}

        {/* Quick Actions Section */}
        <View className="mb-8 pb-4 animate-fade-in-up animate-delay-900">
          <AccessibleText weight="bold" className="text-text text-xl mb-4">{t('dashboard.quickActions')}</AccessibleText>

          {/* Main Action: Workout */}
          <TouchableOpacity
            onPress={() => router.push('/workout/start')}
            className="mb-4 animate-pulse overflow-hidden rounded-2xl"
          >
            <LinearGradient
              colors={Colors.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="p-6 flex-row items-center justify-between shadow-glow"
            >
              {/* Shine Effect */}
              <View className="absolute inset-0 overflow-hidden pointer-events-none">
                <View
                  className="absolute top-0 bottom-0 w-1/2 bg-white/20 -skew-x-12 animate-shine"
                  style={{ left: '-100%' }}
                />
              </View>

              <View className="flex-row items-center">
                <View className="bg-white/20 p-2 rounded-full mr-3">
                  <Ionicons name="barbell" size={24} color="white" />
                </View>
                <View>
                  <AccessibleText weight="black" className="text-black text-xl italic">{t('dashboard.train').toUpperCase()}</AccessibleText>
                  <AccessibleText className="text-black/70 text-xs font-bold uppercase tracking-widest">{t('dashboard.startRoutine')}</AccessibleText>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
            </LinearGradient>
          </TouchableOpacity>

          {/* Secondary Actions Grid */}
          <View className="flex-row gap-3">
            {/* Agenda */}
            <TouchableOpacity
              onPress={() => router.push('/workout/schedule')}
              className="flex-1"
            >
              <Card variant="glass" className="p-4 items-center h-28 justify-center">
                <View className="bg-blue-500/10 p-2.5 rounded-full mb-2">
                  <Ionicons name="calendar" size={22} color={Colors[theme].primary} />
                </View>
                <AccessibleText
                  weight="bold"
                  className="text-text text-xs text-center"
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {t('dashboard.agenda')}
                </AccessibleText>
              </Card>
            </TouchableOpacity>

            {/* Academy */}
            <Link href={"/academy" as any} asChild className="flex-1">
              <TouchableOpacity>
                <Card variant="glass" className="p-4 items-center h-28 justify-center">
                  <View className="bg-indigo-500/10 p-2.5 rounded-full mb-2">
                    <Ionicons name="school" size={22} color={Colors[theme].secondary} />
                  </View>
                  <AccessibleText
                    weight="bold"
                    className="text-text text-xs text-center"
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    Academy
                  </AccessibleText>
                </Card>
              </TouchableOpacity>
            </Link>

            {/* Weight */}
            <TouchableOpacity
              onPress={() => router.push('/weight')}
              className="flex-1"
            >
              <Card variant="glass" className="p-4 items-center h-28 justify-center">
                <View className="bg-emerald-500/10 p-2.5 rounded-full mb-2">
                  <Ionicons name="scale" size={22} color="#10b981" />
                </View>
                <AccessibleText
                  weight="bold"
                  className="text-text text-xs text-center"
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {t('dashboard.weight')}
                </AccessibleText>
              </Card>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <WeeklyCheckinModal
        visible={checkinModalVisible}
        onClose={() => setCheckinModalVisible(false)}
      />
    </ScreenWrapper>
  );
}
