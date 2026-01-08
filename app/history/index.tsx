import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useWorkoutHistoryStore } from '@/store/workoutHistoryStore';
import { useNutritionStore } from '@/store/nutritionStore';
import { useSleepStore, formatSleepDuration } from '@/store/sleepStore';
import { useWaterStore } from '@/store/waterStore';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { AccessibleText } from '@/components/ui/AccessibleText';

type HistoryType = 'all' | 'workouts' | 'meals' | 'sleep' | 'water';

export default function HistoryScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { theme, isDark } = useAppTheme();
  const colors = Colors[theme];
  const [activeTab, setActiveTab] = useState<HistoryType>('all');

  const { workouts } = useWorkoutHistoryStore();
  const { dailyData } = useNutritionStore();
  const { sleepLogs } = useSleepStore();
  const { dailyWater } = useWaterStore();

  // Combine and sort by date
  const getAllHistory = () => {
    const workoutHistory = workouts.map(w => ({
      type: 'workout' as const,
      date: w.startTime,
      id: w.id,
      data: w,
    }));

    const mealHistory: { type: 'meal', date: Date, id: string, data: any }[] = [];
    Object.entries(dailyData).forEach(([date, logs]) => {
      logs.meals.forEach((meal, index) => {
        mealHistory.push({
          type: 'meal',
          date: new Date(date),
          id: `${date}-${index}`,
          data: { ...meal, logDate: date },
        });
      });
    });

    const sleepHistory = Object.values(sleepLogs)
      .filter(sleep => sleep.wakeTime)
      .map(sleep => ({
        type: 'sleep' as const,
        date: new Date(sleep.wakeTime),
        id: sleep.id,
        data: sleep,
      }));

    const waterHistory: { type: 'water', date: Date, id: string, data: any }[] = [];
    if (dailyWater) {
      Object.values(dailyWater).forEach(day => {
        if (day && day.logs && Array.isArray(day.logs)) {
          day.logs.forEach(log => {
            if (log && log.timestamp) {
              waterHistory.push({
                type: 'water' as const,
                date: new Date(log.timestamp),
                id: log.id || `water-${Date.now()}`,
                data: log
              });
            }
          });
        }
      });
    }

    const combined = [...workoutHistory, ...mealHistory, ...sleepHistory, ...waterHistory];
    const validItems = combined.filter(item => item.date && item.date instanceof Date && !isNaN(item.date.getTime()));
    return validItems.sort((a, b) => b.date.getTime() - a.date.getTime());
  };

  const getFilteredHistory = () => {
    const all = getAllHistory();
    if (activeTab === 'workouts') return all.filter(h => h.type === 'workout');
    if (activeTab === 'meals') return all.filter(h => h.type === 'meal');
    if (activeTab === 'sleep') return all.filter(h => h.type === 'sleep');
    if (activeTab === 'water') return all.filter(h => h.type === 'water');
    return all;
  };

  const history = getFilteredHistory();

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return t('common.today');
    if (date.toDateString() === yesterday.toDateString()) return t('common.yesterday');

    return date.toLocaleDateString(i18n.language === 'es' ? 'es-ES' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(i18n.language === 'es' ? 'es-ES' : 'en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const tabs: { id: HistoryType; label: string; color: string }[] = [
    { id: 'all', label: t('history.tabs.all'), color: colors.primary },
    { id: 'workouts', label: t('history.tabs.workouts'), color: '#f97316' },
    { id: 'meals', label: t('history.tabs.meals'), color: '#22c55e' },
    { id: 'sleep', label: t('history.tabs.sleep'), color: '#a855f7' },
    { id: 'water', label: t('history.tabs.water'), color: '#60a5fa' },
  ];

  return (
    <ScreenWrapper>
      {/* Header */}
      <View className="p-4 border-b" style={{ borderBottomColor: colors.border }}>
        <AccessibleText className="text-text-secondary text-sm font-medium uppercase tracking-wider">
          {t('history.subtitle')}
        </AccessibleText>
        <AccessibleText weight="bold" className="text-text text-3xl mt-1 mb-4">{t('history.title')}</AccessibleText>

        {/* Category Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2">
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full border ${activeTab === tab.id
                  ? 'border-transparent'
                  : ''
                  }`}
                style={[
                  activeTab === tab.id
                    ? { backgroundColor: tab.color }
                    : { backgroundColor: colors.surface, borderColor: colors.border }
                ]}
              >
                <AccessibleText
                  weight="bold"
                  className="text-sm"
                  style={{ color: activeTab === tab.id ? 'white' : colors.textSecondary }}
                >
                  {tab.label}
                </AccessibleText>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* History List */}
      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        {history.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <View style={{ backgroundColor: colors.surface }} className="w-24 h-24 rounded-full items-center justify-center mb-4">
              <Ionicons name="time-outline" size={40} color={colors.textMuted} />
            </View>
            <AccessibleText weight="bold" className="text-text-secondary text-lg">{t('history.empty')}</AccessibleText>
            <AccessibleText className="text-text-muted text-sm mt-2 text-center px-8">
              {t('history.emptyDesc')}
            </AccessibleText>
          </View>
        ) : (
          history.map((item) => (
            <View key={item.id} className="mb-3">
              {item.type === 'workout' ? (
                <TouchableOpacity
                  onPress={() => router.push({ pathname: '/workout/summary', params: { workoutId: item.data.id } })}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={isDark ? ['rgba(249, 115, 22, 0.15)', 'rgba(234, 88, 12, 0.1)'] : ['rgba(249, 115, 22, 0.05)', 'rgba(234, 88, 12, 0.02)']}
                    className="rounded-2xl p-4 border"
                    style={{ borderColor: 'rgba(249, 115, 22, 0.3)' }}
                  >
                    <View className="flex-row items-center justify-between mb-3">
                      <View className="flex-row items-center flex-1">
                        <View className="bg-orange-500/20 p-2.5 rounded-xl mr-3">
                          <Ionicons name="barbell" size={22} color="#f97316" />
                        </View>
                        <View className="flex-1">
                          <AccessibleText weight="bold" className="text-text text-base">{item.data.routineName}</AccessibleText>
                          <AccessibleText className="text-text-secondary text-xs">{formatDate(item.date)} • {formatTime(item.date)}</AccessibleText>
                        </View>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color="#f97316" />
                    </View>
                    <View className="flex-row gap-3">
                      <View style={{ backgroundColor: colors.surface, borderColor: colors.border }} className="flex-1 rounded-xl p-2.5 border">
                        <AccessibleText className="text-text-muted text-xs mb-0.5">{t('history.items.duration')}</AccessibleText>
                        <AccessibleText weight="bold" className="text-text text-sm">{Math.round(item.data.durationSeconds / 60)}min</AccessibleText>
                      </View>
                      <View style={{ backgroundColor: colors.surface, borderColor: colors.border }} className="flex-1 rounded-xl p-2.5 border">
                        <AccessibleText className="text-text-muted text-xs mb-0.5">{t('history.items.volume')}</AccessibleText>
                        <AccessibleText weight="bold" className="text-text text-sm">{item.data.volume.toLocaleString()}kg</AccessibleText>
                      </View>
                      <View style={{ backgroundColor: colors.surface, borderColor: colors.border }} className="flex-1 rounded-xl p-2.5 border">
                        <AccessibleText className="text-text-muted text-xs mb-0.5">{t('history.items.exercises')}</AccessibleText>
                        <AccessibleText weight="bold" className="text-text text-sm">{item.data.exercises.length}</AccessibleText>
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ) : item.type === 'sleep' ? (
                <LinearGradient
                  colors={isDark ? ['rgba(168, 85, 247, 0.15)', 'rgba(99, 102, 241, 0.1)'] : ['rgba(168, 85, 247, 0.05)', 'rgba(99, 102, 241, 0.02)']}
                  className="rounded-2xl p-4 border"
                  style={{ borderColor: 'rgba(168, 85, 247, 0.3)' }}
                >
                  <View className="flex-row items-center mb-3">
                    <View className="bg-purple-500/20 p-2.5 rounded-xl mr-3">
                      <Ionicons name="moon" size={22} color="#a855f7" />
                    </View>
                    <View className="flex-1">
                      <AccessibleText weight="bold" className="text-text text-base">{t('history.tabs.sleep')}</AccessibleText>
                      <AccessibleText className="text-text-secondary text-xs">{formatDate(item.date)}</AccessibleText>
                    </View>
                  </View>
                  <View className="flex-row gap-3">
                    <View style={{ backgroundColor: colors.surface, borderColor: colors.border }} className="flex-1 rounded-xl p-2.5 border">
                      <AccessibleText className="text-text-muted text-xs mb-0.5">{t('history.items.duration')}</AccessibleText>
                      <AccessibleText weight="bold" className="text-text text-sm">{formatSleepDuration(item.data.duration)}</AccessibleText>
                    </View>
                    <View style={{ backgroundColor: colors.surface, borderColor: colors.border }} className="flex-1 rounded-xl p-2.5 border">
                      <AccessibleText className="text-text-muted text-xs mb-0.5">{t('history.items.quality')}</AccessibleText>
                      <View className="flex-row">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Ionicons
                            key={star}
                            name={item.data.quality >= star ? 'star' : 'star-outline'}
                            size={12}
                            color={item.data.quality >= star ? '#fbbf24' : colors.textMuted}
                          />
                        ))}
                      </View>
                    </View>
                  </View>
                </LinearGradient>
              ) : item.type === 'water' ? (
                <LinearGradient
                  colors={isDark ? ['rgba(96, 165, 250, 0.15)', 'rgba(59, 130, 246, 0.1)'] : ['rgba(96, 165, 250, 0.05)', 'rgba(59, 130, 246, 0.02)']}
                  className="rounded-2xl p-4 border"
                  style={{ borderColor: 'rgba(96, 165, 250, 0.3)' }}
                >
                  <View className="flex-row items-center mb-3">
                    <View className="bg-blue-500/20 p-2.5 rounded-xl mr-3">
                      <Ionicons name="water" size={22} color="#60a5fa" />
                    </View>
                    <View className="flex-1">
                      <AccessibleText weight="bold" className="text-text text-base">{t('history.tabs.water')}</AccessibleText>
                      <AccessibleText className="text-text-secondary text-xs">{formatDate(item.date)} • {formatTime(item.date)}</AccessibleText>
                    </View>
                  </View>
                  <View style={{ backgroundColor: colors.surface, borderColor: colors.border }} className="rounded-xl p-2.5 border">
                    <AccessibleText className="text-text-muted text-xs mb-0.5">{t('history.items.amount')}</AccessibleText>
                    <AccessibleText weight="bold" className={`text-lg ${item.data.amount > 0 ? 'text-blue-400' : 'text-red-400'}`}>
                      {item.data.amount > 0 ? '+' : ''}{item.data.amount} ml
                    </AccessibleText>
                  </View>
                </LinearGradient>
              ) : (
                <LinearGradient
                  colors={isDark ? ['rgba(34, 197, 94, 0.15)', 'rgba(22, 163, 74, 0.1)'] : ['rgba(34, 197, 94, 0.05)', 'rgba(22, 163, 74, 0.02)']}
                  className="rounded-2xl p-4 border"
                  style={{ borderColor: 'rgba(34, 197, 94, 0.3)' }}
                >
                  <View className="flex-row items-center mb-3">
                    <View className="bg-green-500/20 p-2.5 rounded-xl mr-3">
                      <Ionicons name="restaurant" size={22} color="#22c55e" />
                    </View>
                    <View className="flex-1">
                      <AccessibleText weight="bold" className="text-text text-base">{item.data.name}</AccessibleText>
                      <AccessibleText className="text-text-secondary text-xs">{formatDate(item.date)} • {formatTime(item.date)}</AccessibleText>
                    </View>
                  </View>
                  <View className="flex-row gap-2">
                    <View style={{ backgroundColor: colors.surface, borderColor: colors.border }} className="flex-1 rounded-xl p-2.5 border">
                      <AccessibleText className="text-text-muted text-xs mb-0.5">{t('history.items.cal')}</AccessibleText>
                      <AccessibleText weight="bold" className="text-text text-sm">{item.data.calories}</AccessibleText>
                    </View>
                    <View style={{ backgroundColor: colors.surface, borderColor: colors.border }} className="flex-1 rounded-xl p-2.5 border">
                      <AccessibleText className="text-text-muted text-xs mb-0.5">{t('history.items.prot')}</AccessibleText>
                      <AccessibleText weight="bold" className="text-blue-400 text-sm">{item.data.protein}g</AccessibleText>
                    </View>
                    <View style={{ backgroundColor: colors.surface, borderColor: colors.border }} className="flex-1 rounded-xl p-2.5 border">
                      <AccessibleText className="text-text-muted text-xs mb-0.5">{t('history.items.carbs')}</AccessibleText>
                      <AccessibleText weight="bold" className="text-green-400 text-sm">{item.data.carbs}g</AccessibleText>
                    </View>
                    <View style={{ backgroundColor: colors.surface, borderColor: colors.border }} className="flex-1 rounded-xl p-2.5 border">
                      <AccessibleText className="text-text-muted text-xs mb-0.5">{t('history.items.fat')}</AccessibleText>
                      <AccessibleText weight="bold" className="text-yellow-400 text-sm">{item.data.fats}g</AccessibleText>
                    </View>
                  </View>
                </LinearGradient>
              )}
            </View>
          ))
        )}
        <View className="h-20" />
      </ScrollView>
    </ScreenWrapper>
  );
}
