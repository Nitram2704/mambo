import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Dimensions, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { useAnalyticsStore } from '@/store/analyticsStore';
import { analyzeWeaknesses, WeaknessInsight } from '@/utils/WeaknessAnalyzer';
import { predict1RM, predictWeightTrend } from '@/utils/aiService';
import { useUserProfileStore } from '@/store/userProfileStore';
import { useWeightStore } from '@/store/weightStore';
import { useWorkoutHistoryStore } from '@/store/workoutHistoryStore';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';

const screenWidth = Dimensions.get('window').width;

export const AnalyticsDashboard: React.FC = () => {
    const { t } = useTranslation();
    const { theme, isDark } = useAppTheme();
    const colors = Colors[theme];

    const chartConfig = {
        backgroundGradientFrom: colors.surface,
        backgroundGradientTo: colors.background,
        color: (opacity = 1) => isDark ? `rgba(96, 165, 250, ${opacity})` : `rgba(37, 99, 235, ${opacity})`,
        labelColor: (opacity = 1) => colors.textSecondary,
        strokeWidth: 2,
        barPercentage: 0.5,
        useShadowColorFromDataset: false,
        decimalPlaces: 0,
    };

    const { getWeeklyVolume, getPRHistory, getNutritionalAdherence, getMuscleBalance, getBodyCompTimeline } = useAnalyticsStore();
    const { profile } = useUserProfileStore();
    const { getLatestWeight } = useWeightStore();
    const { workouts } = useWorkoutHistoryStore();

    const [insights, setInsights] = useState<WeaknessInsight[]>([]);
    const [weightPrediction, setWeightPrediction] = useState<string>('');
    const [loadingPredictions, setLoadingPredictions] = useState(false);

    const [selectedExercise, setSelectedExercise] = useState<string>('');
    const [prHistory, setPrHistory] = useState<{ labels: string[], data: number[] }>({ labels: [], data: [] });
    const [oneRMPrediction, setOneRMPrediction] = useState<string>('');
    const [loadingPRPrediction, setLoadingPRPrediction] = useState(false);

    const weeklyVolume = getWeeklyVolume();
    const muscleBalance = getMuscleBalance();
    const bodyComp = getBodyCompTimeline();
    const adherence = getNutritionalAdherence(7);

    // Get unique exercise names from history
    const exerciseNames = Array.from(new Set(workouts.flatMap(w => w.exercises.map(ex => ex.exerciseName))));

    useEffect(() => {
        setInsights(analyzeWeaknesses());
        loadPredictions();
        if (exerciseNames.length > 0 && !selectedExercise) {
            setSelectedExercise(exerciseNames[0]);
        }
    }, [workouts, profile]);

    useEffect(() => {
        if (selectedExercise) {
            setPrHistory(getPRHistory(selectedExercise));
            loadPRPrediction();
        }
    }, [selectedExercise, workouts]);

    const loadPredictions = async () => {
        if (!profile || !getLatestWeight()) return;
        setLoadingPredictions(true);
        try {
            const pred = await predictWeightTrend(getLatestWeight()!, profile.targetWeight, adherence);
            setWeightPrediction(pred);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingPredictions(false);
        }
    };

    const loadPRPrediction = async () => {
        if (!selectedExercise) return;
        setLoadingPRPrediction(true);
        try {
            // Get history for this exercise
            const history = workouts.flatMap(w =>
                w.exercises
                    .filter(ex => ex.exerciseName === selectedExercise)
                    .map(ex => ({
                        date: w.startTime.toISOString(),
                        weight: Math.max(...ex.sets.map(s => s.weight)),
                        reps: ex.sets.find(s => s.weight === Math.max(...ex.sets.map(s2 => s2.weight)))?.reps || 0
                    }))
            ).slice(-5);

            if (history.length > 0) {
                const pred = await predict1RM(selectedExercise, history);
                setOneRMPrediction(pred);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingPRPrediction(false);
        }
    };


    const pieData = muscleBalance.map((m, i) => ({
        name: m.muscle,
        population: m.volume,
        color: [colors.primary, colors.success, colors.orange[500], colors.accent, colors.pink[500]][i % 5],
        legendFontColor: colors.textSecondary,
        legendFontSize: 10,
    }));

    return (
        <ScrollView className="flex-1" style={{ backgroundColor: colors.background }} showsVerticalScrollIndicator={false}>
            {/* AI Predictions Header */}
            <Animated.View entering={FadeInDown.delay(100)} className="m-4">
                <LinearGradient
                    colors={isDark ? ['#1e3a8a', '#1e1b4b'] : [colors.primary, colors.secondary]}
                    className="p-6 rounded-3xl border shadow-xl"
                    style={{ borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : 'transparent' }}>
                    <View className="flex-row items-center mb-3">
                        <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.2)' }}>
                            <Ionicons name="sparkles" size={20} color={isDark ? '#60a5fa' : 'white'} />
                        </View>
                        <Text className="text-white text-lg font-bold">{t('analytics.aiPredictions')}</Text>
                    </View>
                    {loadingPredictions ? (
                        <ActivityIndicator color={isDark ? '#60a5fa' : 'white'} />
                    ) : (
                        <Text className="text-white/90 leading-6 italic">
                            &quot;{weightPrediction || t('analytics.moreDataNeeded')}&quot;
                        </Text>
                    )}
                </LinearGradient>
            </Animated.View>

            {/* Weekly Volume Chart */}
            <Animated.View entering={FadeInUp.delay(200)} className="mb-6">
                <Text className="font-bold text-lg ml-6 mb-4" style={{ color: colors.text }}>{t('analytics.weeklyVolume')}</Text>
                <BarChart
                    data={{
                        labels: weeklyVolume.labels,
                        datasets: [{ data: weeklyVolume.data }]
                    }}
                    width={screenWidth - 32}
                    height={220}
                    yAxisLabel=""
                    yAxisSuffix=""
                    chartConfig={{
                        ...chartConfig,
                        color: (opacity = 1) => isDark ? `rgba(96, 165, 250, ${opacity})` : `rgba(37, 99, 235, ${opacity})`,
                    }}
                    style={{
                        marginHorizontal: 16,
                        borderRadius: 16,
                    }}
                />
            </Animated.View>

            {/* PR Progression Chart */}
            <Animated.View entering={FadeInUp.delay(250)} className="mb-6">
                <View className="flex-row items-center justify-between px-6 mb-4">
                    <Text className="font-bold text-lg" style={{ color: colors.text }}>{t('analytics.prProgression')}</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-grow-0 ml-4">
                        {exerciseNames.slice(0, 5).map(name => (
                            <TouchableOpacity
                                key={name}
                                onPress={() => setSelectedExercise(name)}
                                className={`px-3 py-1 rounded-full mr-2 ${selectedExercise === name ? 'bg-blue-600' : ''}`}
                                style={{
                                    backgroundColor: selectedExercise === name ? colors.primary : colors.surface,
                                    borderWidth: 1,
                                    borderColor: selectedExercise === name ? colors.primary : colors.surfaceHighlight
                                }}>
                                <Text className={`text-xs ${selectedExercise === name ? 'text-white font-bold' : ''}`} style={{ color: selectedExercise === name ? 'white' : colors.textSecondary }}>
                                    {name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
                {prHistory.data.length > 1 ? (
                    <LineChart
                        data={{
                            labels: prHistory.labels,
                            datasets: [{ data: prHistory.data }]
                        }}
                        width={screenWidth - 32}
                        height={200}
                        chartConfig={{
                            ...chartConfig,
                            color: (opacity = 1) => isDark ? `rgba(16, 185, 129, ${opacity})` : `rgba(5, 150, 105, ${opacity})`,
                        }}
                        bezier
                        style={{
                            marginHorizontal: 16,
                            borderRadius: 16,
                        }}
                    />
                ) : (
                    <View className="mx-4 p-10 rounded-3xl items-center" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.surfaceHighlight }}>
                        <Text className="text-center" style={{ color: colors.textMuted }}>{t('analytics.moreExerciseData', { exercise: selectedExercise || t('analytics.exercises') })}</Text>
                    </View>
                )}
                {selectedExercise && (
                    <View className="mx-4 mt-4 p-4 rounded-2xl border" style={{ backgroundColor: isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.05)', borderColor: isDark ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.1)' }}>
                        <View className="flex-row items-center mb-1">
                            <Ionicons name="trending-up" size={16} color="#22c55e" />
                            <Text className="font-bold text-xs ml-2" style={{ color: isDark ? '#4ade80' : '#16a34a' }}>{t('analytics.oneRMPrediction')}</Text>
                        </View>
                        {loadingPRPrediction ? (
                            <ActivityIndicator size="small" color="#22c55e" />
                        ) : (
                            <Text className="text-xs italic" style={{ color: colors.textSecondary }}>&quot;{oneRMPrediction || t('analytics.calculating')}&quot;</Text>
                        )}
                    </View>
                )}
            </Animated.View>

            {/* Muscle Balance */}
            <Animated.View entering={FadeInUp.delay(300)} className="mb-6 mx-4 p-6 rounded-3xl border" style={{ backgroundColor: colors.surface, borderColor: colors.surfaceHighlight }}>
                <Text className="font-bold text-lg mb-4" style={{ color: colors.text }}>{t('analytics.muscleBalance')}</Text>
                {muscleBalance.length > 0 ? (
                    <PieChart
                        data={pieData}
                        width={screenWidth - 64}
                        height={200}
                        chartConfig={chartConfig}
                        accessor="population"
                        backgroundColor="transparent"
                        paddingLeft="15"
                        absolute
                    />
                ) : (
                    <View className="items-center py-10">
                        <Text style={{ color: colors.textMuted }}>{t('analytics.noTrainingData')}</Text>
                    </View>
                )}
            </Animated.View>

            {/* Insights & Weaknesses */}
            <Animated.View entering={FadeInUp.delay(400)} className="mb-6 mx-4">
                <Text className="font-bold text-lg mb-4" style={{ color: colors.text }}>{t('analytics.performanceInsights')}</Text>
                {insights.length > 0 ? (
                    insights.map((insight, i) => (
                        <View key={i} className="p-4 rounded-2xl border mb-3 flex-row items-start" style={{ backgroundColor: colors.surface, borderColor: colors.surfaceHighlight }}>
                            <View className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${insight.severity === 'high' ? 'bg-red-500/20' :
                                insight.severity === 'medium' ? 'bg-yellow-500/20' : 'bg-blue-500/20'
                                }`}>
                                <Ionicons
                                    name={insight.type === 'balance' ? 'fitness' : 'nutrition'}
                                    size={20}
                                    color={
                                        insight.severity === 'high' ? '#ef4444' :
                                            insight.severity === 'medium' ? '#f59e0b' : '#3b82f6'
                                    }
                                />
                            </View>
                            <View className="flex-1">
                                <Text className="font-bold mb-1" style={{ color: colors.text }}>{insight.title}</Text>
                                <Text className="text-xs mb-2" style={{ color: colors.textSecondary }}>{insight.description}</Text>
                                <View className="p-2 rounded-lg border" style={{ backgroundColor: colors.background, borderColor: colors.surfaceHighlight }}>
                                    <Text className="text-[10px] font-bold uppercase mb-1" style={{ color: colors.primary }}>{t('analytics.recommendation')}:</Text>
                                    <Text className="text-xs" style={{ color: colors.text }}>{insight.recommendation}</Text>
                                </View>
                            </View>
                        </View>
                    ))
                ) : (
                    <View className="p-6 rounded-2xl border items-center" style={{ backgroundColor: isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.05)', borderColor: isDark ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.1)' }}>
                        <Ionicons name="checkmark-circle" size={32} color="#22c55e" />
                        <Text className="font-bold mt-2" style={{ color: isDark ? '#4ade80' : '#16a34a' }}>{t('analytics.allGood')}</Text>
                        <Text className="text-center text-xs mt-1" style={{ color: colors.textSecondary }}>{t('analytics.excellentBalance')}</Text>
                    </View>
                )}
            </Animated.View>

            {/* Body Composition Timeline */}
            <Animated.View entering={FadeInUp.delay(500)} className="mb-10">
                <Text className="font-bold text-lg ml-6 mb-4" style={{ color: colors.text }}>{t('analytics.weightEvolution')}</Text>
                {bodyComp.weight.length > 1 ? (
                    <LineChart
                        data={{
                            labels: bodyComp.labels,
                            datasets: [
                                { data: bodyComp.weight, color: (opacity = 1) => isDark ? `rgba(251, 146, 60, ${opacity})` : `rgba(234, 88, 12, ${opacity})` },
                                ...(bodyComp.target ? [{ data: Array(bodyComp.weight.length).fill(bodyComp.target), withDots: false, color: (opacity = 0.3) => `rgba(34, 197, 94, ${opacity})` }] : [])
                            ]
                        }}
                        width={screenWidth - 32}
                        height={220}
                        chartConfig={{
                            ...chartConfig,
                            color: (opacity = 1) => isDark ? `rgba(251, 146, 60, ${opacity})` : `rgba(234, 88, 12, ${opacity})`,
                        }}
                        bezier
                        style={{
                            marginHorizontal: 16,
                            borderRadius: 16,
                        }}
                    />
                ) : (
                    <View className="mx-4 p-10 rounded-3xl items-center" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.surfaceHighlight }}>
                        <Text style={{ color: colors.textMuted }}>{t('analytics.moreWeightData')}</Text>
                    </View>
                )}
            </Animated.View>
        </ScrollView>
    );
};
