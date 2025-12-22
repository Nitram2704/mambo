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
import { Colors } from '@/constants/Colors';
import { useMemo, useState } from 'react';
import WeeklyCheckinModal from '@/components/WeeklyCheckinModal';
import { WhyTooltip } from '@/components/WhyTooltip';
import { getLocalDateString } from '@/utils/dateUtils';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/hooks/use-app-theme';

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

  const handleLogout = async () => {
    Alert.alert(
      t('dashboard.logout'),
      t('dashboard.logoutConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('dashboard.exit'),
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase.auth.signOut();
            if (error) Alert.alert(t('common.error'), error.message);
          }
        }
      ]
    );
  };

  return (
    <ScreenWrapper safeArea={true}>
      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mb-8 mt-2 flex-row justify-between items-center">
          <View>
            <Text className="text-xs font-bold uppercase tracking-widest" style={{ color: Colors[theme].textSecondary }}>
              {new Date().toLocaleDateString(i18n.language === 'es' ? 'es-ES' : 'en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
            <Text className="text-4xl font-black mt-1" style={{ color: Colors[theme].text }}>{t('dashboard.title')}</Text>
          </View>
          <TouchableOpacity
            onPress={handleLogout}
            className="p-3 rounded-2xl border"
            style={{ backgroundColor: isDark ? 'rgba(31, 41, 55, 0.5)' : '#f1f5f9', borderColor: Colors[theme].border }}
          >
            <Ionicons name="log-out-outline" size={24} color={Colors[theme].error} />
          </TouchableOpacity>
        </View>

        {/* Main Stats Cards */}
        <View className="flex-row gap-4 mb-6">
          {/* Calories Card */}
          <Card className="flex-1 p-4">
            <View className="flex-row items-center mb-3">
              <View className="w-8 h-8 rounded-full items-center justify-center mr-2" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                <Ionicons name="flame" size={18} color="#ef4444" />
              </View>
              <Text className="text-xs font-medium" style={{ color: Colors[theme].textSecondary }}>{t('dashboard.calories')}</Text>
            </View>
            <Text className="text-3xl font-bold tracking-tight" style={{ color: Colors[theme].text }}>{todayData.caloriesConsumed}</Text>
            <Text className="text-xs font-medium mt-1" style={{ color: Colors[theme].textMuted }}>/ {calorieGoal} kcal</Text>
          </Card>

          {/* Workouts Card */}
          <Card className="flex-1 p-4">
            <View className="flex-row items-center mb-3">
              <View className="w-8 h-8 rounded-full items-center justify-center mr-2" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
                <Ionicons name="barbell" size={18} color="#22c55e" />
              </View>
              <Text className="text-xs font-medium" style={{ color: Colors[theme].textSecondary }}>{t('dashboard.workouts')}</Text>
            </View>
            <Text className="text-3xl font-bold tracking-tight" style={{ color: Colors[theme].text }}>{todayData.workouts.length}</Text>
            <Text className="text-xs font-medium mt-1" style={{ color: Colors[theme].textMuted }}>{t('dashboard.activeMinutes', { count: workoutMinutes })}</Text>
          </Card>
        </View>

        {/* Calorie Goal Progress */}
        <Card className="p-5 mb-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="font-bold text-lg" style={{ color: Colors[theme].text }}>{t('dashboard.dailyGoal')}</Text>
            <View className="px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(249, 115, 22, 0.1)' }}>
              <Text className="font-bold text-xs" style={{ color: Colors[theme].orange[500] }}>{percentageComplete}%</Text>
            </View>
          </View>

          <View className="h-4 rounded-full overflow-hidden mb-3 border" style={{ backgroundColor: isDark ? 'rgba(31, 41, 55, 0.5)' : '#f1f5f9', borderColor: Colors[theme].border }}>
            <LinearGradient
              colors={Colors.gradients.orange}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ width: `${Math.min(parseFloat(percentageComplete), 100)}%`, height: '100%' }}
            />
          </View>
          <Text className="text-sm font-medium text-right" style={{ color: Colors[theme].textSecondary }}>
            {t('dashboard.caloriesRemaining', { count: Math.round(caloriesRemaining) })}
          </Text>
        </Card>

        {/* Macros Grid */}
        <View className="flex-row gap-3 mb-6">
          {/* Protein */}
          <Card className="flex-1 p-3 items-center" style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
            <Text className="text-blue-500 text-[10px] font-bold mb-1">{t('dashboard.protein')}</Text>
            <Text className="font-bold text-lg" style={{ color: Colors[theme].text }}>{Math.round(proteinConsumed)}g</Text>
            <View className="w-full h-1.5 rounded-full mt-2 overflow-hidden" style={{ backgroundColor: isDark ? 'rgba(31, 41, 55, 0.5)' : '#f1f5f9' }}>
              <View className="h-full bg-blue-500" style={{ width: `${Math.min((proteinConsumed / proteinGoal) * 100, 100)}%` }} />
            </View>
          </Card>

          {/* Carbs */}
          <Card className="flex-1 p-3 items-center" style={{ borderColor: 'rgba(34, 197, 94, 0.3)' }}>
            <Text className="text-green-500 text-[10px] font-bold mb-1">{t('dashboard.carbs')}</Text>
            <Text className="font-bold text-lg" style={{ color: Colors[theme].text }}>{Math.round(carbsConsumed)}g</Text>
            <View className="w-full h-1.5 rounded-full mt-2 overflow-hidden" style={{ backgroundColor: isDark ? 'rgba(31, 41, 55, 0.5)' : '#f1f5f9' }}>
              <View className="h-full bg-green-500" style={{ width: `${Math.min((carbsConsumed / carbsGoal) * 100, 100)}%` }} />
            </View>
          </Card>

          {/* Fats */}
          <Card className="flex-1 p-3 items-center" style={{ borderColor: 'rgba(234, 179, 8, 0.3)' }}>
            <Text className="text-yellow-500 text-[10px] font-bold mb-1">{t('dashboard.fats')}</Text>
            <Text className="font-bold text-lg" style={{ color: Colors[theme].text }}>{Math.round(fatsConsumed)}g</Text>
            <View className="w-full h-1.5 rounded-full mt-2 overflow-hidden" style={{ backgroundColor: isDark ? 'rgba(31, 41, 55, 0.5)' : '#f1f5f9' }}>
              <View className="h-full bg-yellow-500" style={{ width: `${Math.min((fatsConsumed / fatsGoal) * 100, 100)}%` }} />
            </View>
          </Card>
        </View>

        {/* Water Tracker */}
        <Card className="p-5 mb-6" style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <View className="bg-blue-500/10 p-2 rounded-full mr-3">
                <Ionicons name="water" size={20} color="#3b82f6" />
              </View>
              <View>
                <View className="flex-row items-center flex-1">
                  <Text
                    className="font-bold text-lg"
                    style={{ color: Colors[theme].text }}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {t('dashboard.hydration')}
                  </Text>
                  <WhyTooltip
                    title={t('dashboard.whyDrinkWater')}
                    explanation={t('dashboard.waterExplanation')}
                    examples={t('dashboard.waterExamples', { returnObjects: true }) as string[]}
                    scientific={t('dashboard.waterScientific')}
                  />
                </View>
                <Text className="text-blue-500 text-xs">{waterData.totalAmount} / {waterData.goal} ml</Text>
              </View>
            </View>
            <Text className="text-blue-600 font-bold text-xl">{Math.round(waterPercentage)}%</Text>
          </View>

          <View className="h-3 rounded-full overflow-hidden mb-5 border" style={{ backgroundColor: isDark ? 'rgba(31, 41, 55, 0.5)' : '#f1f5f9', borderColor: Colors[theme].border }}>
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
              className="flex-1 py-3 rounded-xl border items-center justify-center"
              style={{
                backgroundColor: waterData.totalAmount < 250 ? (isDark ? 'rgba(31, 41, 55, 0.5)' : '#f1f5f9') : 'rgba(239, 68, 68, 0.1)',
                borderColor: waterData.totalAmount < 250 ? Colors[theme].border : 'rgba(239, 68, 68, 0.3)',
                opacity: waterData.totalAmount < 250 ? 0.5 : 1
              }}
            >
              <Text className="font-bold" style={{ color: waterData.totalAmount < 250 ? Colors[theme].textMuted : Colors[theme].error }}>-250ml</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => addWater(250)}
              className="flex-1 py-3 rounded-xl border items-center justify-center"
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderColor: 'rgba(59, 130, 246, 0.3)'
              }}
            >
              <Text className="text-blue-600 font-bold">+250ml</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Weekly Check-in Card */}
        {isMonday && (
          <TouchableOpacity
            onPress={() => setCheckinModalVisible(true)}
            className="mb-6"
          >
            <Card className="p-5" style={{ borderColor: 'rgba(168, 85, 247, 0.3)' }}>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View className="bg-purple-500/10 p-3 rounded-full mr-4">
                    <Ionicons name="analytics" size={24} color="#a855f7" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-bold text-lg mb-1" style={{ color: Colors[theme].text }}>{t('dashboard.weeklyCheckin')}</Text>
                    <Text className="text-sm" style={{ color: Colors[theme].textSecondary }}>
                      {t('dashboard.weeklyCheckinDesc')}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#a855f7" />
              </View>
            </Card>
          </TouchableOpacity>
        )}

        {/* Quick Actions Section */}
        <View className="mb-8">
          <Text className="font-bold text-xl mb-4" style={{ color: Colors[theme].text }}>{t('dashboard.quickActions')}</Text>

          {/* Main Action: Workout */}
          <TouchableOpacity
            onPress={() => router.push('/workout/start')}
            className="mb-4"
          >
            <LinearGradient
              colors={Colors.gradients.orange}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="rounded-2xl p-5 flex-row items-center justify-between"
            >
              <View className="flex-row items-center">
                <View className="bg-white/20 p-2 rounded-full mr-3">
                  <Ionicons name="barbell" size={24} color="white" />
                </View>
                <View>
                  <Text className="text-white font-bold text-lg">{t('dashboard.train')}</Text>
                  <Text className="text-orange-100 text-xs">{t('dashboard.startRoutine')}</Text>
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
              <Card className="p-4 items-center h-28 justify-center">
                <View className="bg-blue-500/10 p-2.5 rounded-full mb-2">
                  <Ionicons name="calendar" size={22} color="#3b82f6" />
                </View>
                <Text
                  className="font-bold text-xs text-center"
                  style={{ color: Colors[theme].text }}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {t('dashboard.agenda')}
                </Text>
              </Card>
            </TouchableOpacity>

            {/* Learn */}
            <Link href="/learn" asChild className="flex-1">
              <TouchableOpacity>
                <Card className="p-4 items-center h-28 justify-center">
                  <View className="bg-indigo-500/10 p-2.5 rounded-full mb-2">
                    <Ionicons name="school" size={22} color="#6366f1" />
                  </View>
                  <Text
                    className="font-bold text-xs text-center"
                    style={{ color: Colors[theme].text }}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {t('dashboard.learn')}
                  </Text>
                </Card>
              </TouchableOpacity>
            </Link>

            {/* Weight */}
            <TouchableOpacity
              onPress={() => router.push('/weight')}
              className="flex-1"
            >
              <Card className="p-4 items-center h-28 justify-center">
                <View className="bg-emerald-500/10 p-2.5 rounded-full mb-2">
                  <Ionicons name="scale" size={22} color="#10b981" />
                </View>
                <Text
                  className="font-bold text-xs text-center"
                  style={{ color: Colors[theme].text }}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {t('dashboard.weight')}
                </Text>
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
