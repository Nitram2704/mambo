import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { WORKOUT_TEMPLATES, WorkoutTemplate, listWorkoutTemplates } from '@/utils/planTemplates';
import { useSavedRoutinesStore } from '@/store/savedRoutinesStore';
import { useWeeklyScheduleStore } from '@/store/weeklyScheduleStore';
import { DAY_NAMES } from '@/utils/scheduleUtils';
import { Card } from '@/components/ui/Card';

type GoalFilter = 'all' | 'hypertrophy' | 'strength' | 'endurance' | 'general';
type LevelFilter = 'all' | 'beginner' | 'intermediate' | 'advanced';

export default function WorkoutPlansScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { addRoutine } = useSavedRoutinesStore();
    const { scheduleWorkout, clearSchedule } = useWeeklyScheduleStore();
    const [adoptingId, setAdoptingId] = useState<string | null>(null);
    const [goalFilter, setGoalFilter] = useState<GoalFilter>('all');
    const [levelFilter, setLevelFilter] = useState<LevelFilter>('all');
    const [selectedTemplate, setSelectedTemplate] = useState<WorkoutTemplate | null>(null);

    // Day selector state
    const [showDaySelector, setShowDaySelector] = useState(false);
    const [selectedDays, setSelectedDays] = useState<number[]>([]);
    const [pendingTemplateId, setPendingTemplateId] = useState<string | null>(null);

    const templates = listWorkoutTemplates();

    const GOAL_OPTIONS: { key: GoalFilter; label: string; icon: string; color: string }[] = [
        { key: 'all', label: t('workoutPlans.goals.all'), icon: 'apps', color: '#60a5fa' },
        { key: 'hypertrophy', label: t('workoutPlans.goals.hypertrophy'), icon: 'body', color: '#f97316' },
        { key: 'strength', label: t('workoutPlans.goals.strength'), icon: 'barbell', color: '#ef4444' },
        { key: 'endurance', label: t('workoutPlans.goals.endurance'), icon: 'fitness', color: '#10b981' },
        { key: 'general', label: t('workoutPlans.goals.general'), icon: 'heart', color: '#8b5cf6' },
    ];

    const LEVEL_OPTIONS: { key: LevelFilter; label: string; color: string }[] = [
        { key: 'all', label: t('workoutPlans.levels.all'), color: '#60a5fa' },
        { key: 'beginner', label: t('workoutPlans.levels.beginner'), color: '#22c55e' },
        { key: 'intermediate', label: t('workoutPlans.levels.intermediate'), color: '#f59e0b' },
        { key: 'advanced', label: t('workoutPlans.levels.advanced'), color: '#ef4444' },
    ];

    const filteredTemplates = templates.filter(t => {
        const matchesGoal = goalFilter === 'all' || t.goal === goalFilter;
        const matchesLevel = levelFilter === 'all' || t.level === levelFilter;
        return matchesGoal && matchesLevel;
    });

    const handleAdoptClick = (templateId: string) => {
        const template = WORKOUT_TEMPLATES[templateId];
        if (!template) return;

        setPendingTemplateId(templateId);
        setSelectedTemplate(null);

        const optimalDays = getOptimalDaysForPlan(template.daysPerWeek);
        setSelectedDays(optimalDays);
        setShowDaySelector(true);
    };

    const getOptimalDaysForPlan = (daysPerWeek: number): number[] => {
        const schedules: Record<number, number[]> = {
            1: [0],
            2: [0, 3],
            3: [0, 2, 4],
            4: [0, 1, 3, 4],
            5: [0, 1, 2, 3, 4],
            6: [0, 1, 2, 3, 4, 5],
        };
        return schedules[Math.min(daysPerWeek, 6)] || schedules[3];
    };

    const toggleDay = (dayIndex: number) => {
        setSelectedDays(prev =>
            prev.includes(dayIndex)
                ? prev.filter(d => d !== dayIndex)
                : [...prev, dayIndex].sort((a, b) => a - b)
        );
    };

    const handleConfirmDays = async () => {
        if (!pendingTemplateId || selectedDays.length === 0) {
            Alert.alert(t('workoutPlans.alerts.error'), t('workoutPlans.alerts.selectDay'));
            return;
        }

        setShowDaySelector(false);
        setAdoptingId(pendingTemplateId);

        try {
            const template = WORKOUT_TEMPLATES[pendingTemplateId];
            if (!template) {
                Alert.alert(t('workoutPlans.alerts.error'), t('workoutPlans.alerts.templateNotFound'));
                return;
            }

            const { processWorkoutExercises } = await import('@/utils/exerciseMapper');
            const { generateScheduleWithSelectedDays } = await import('@/utils/scheduleUtils');

            const routineIds: string[] = [];

            for (const day of template.days) {
                const exercisesToMap = day.exercises.map(ex => ({
                    name: ex.name,
                    sets: ex.sets,
                    reps: ex.reps,
                    rest: ex.rest,
                    notes: ex.notes,
                }));

                const mappedExercises = await processWorkoutExercises(exercisesToMap);

                if (mappedExercises.length === 0) {
                    continue;
                }

                const routineId = await addRoutine(day.dayName, mappedExercises);
                if (routineId) {
                    routineIds.push(routineId);
                }
            }

            if (routineIds.length === 0) {
                Alert.alert(t('workoutPlans.alerts.error'), t('workoutPlans.alerts.noExercises'));
                return;
            }

            await clearSchedule();

            const smartSchedule = generateScheduleWithSelectedDays(
                routineIds,
                selectedDays,
                4
            );

            for (const workout of smartSchedule) {
                await scheduleWorkout(workout.routineId, workout.date.toISOString());
            }

            const dayNames = selectedDays.map(d => DAY_NAMES[d]).join(', ');
            Alert.alert(
                t('workoutPlans.alerts.adoptSuccessTitle'),
                t('workoutPlans.alerts.adoptSuccessMessage', {
                    count: routineIds.length,
                    days: dayNames,
                    total: smartSchedule.length
                }),
                [{ text: t('workoutPlans.alerts.viewSchedule'), onPress: () => router.push('/(tabs)/workout') }]
            );

        } catch (error) {
            console.error('Error adopting plan:', error);
            Alert.alert(t('common.error'), 'No se pudo adoptar el plan.');
        } finally {
            setAdoptingId(null);
            setPendingTemplateId(null);
        }
    };

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'beginner': return '#22c55e';
            case 'intermediate': return '#f59e0b';
            case 'advanced': return '#ef4444';
            default: return '#60a5fa';
        }
    };

    const getLevelLabel = (level: string) => {
        switch (level) {
            case 'beginner': return t('workoutPlans.levels.beginner');
            case 'intermediate': return t('workoutPlans.levels.intermediate');
            case 'advanced': return t('workoutPlans.levels.advanced');
            default: return level;
        }
    };

    const getGoalLabel = (goal: string) => {
        switch (goal) {
            case 'hypertrophy': return t('workoutPlans.goals.hypertrophy');
            case 'strength': return t('workoutPlans.goals.strength');
            case 'endurance': return t('workoutPlans.goals.endurance');
            case 'general': return t('workoutPlans.goals.general');
            default: return goal;
        }
    };

    return (
        <ScreenWrapper>
            {/* Header */}
            <View className="flex-row items-center p-4 border-b border-border/10">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="bg-surface-highlight/50 p-2 rounded-full mr-4"
                >
                    <Ionicons name="arrow-back" size={24} color="#f8fafc" />
                </TouchableOpacity>
                <View>
                    <Text className="text-text-secondary text-xs font-black uppercase tracking-widest">
                        {t('workoutPlans.title')}
                    </Text>
                    <Text className="text-text text-2xl font-black">Mambo Plans</Text>
                </View>
            </View>

            <ScrollView className="flex-1">
                {/* Goal Filter */}
                <View className="p-4">
                    <Text className="text-text-muted text-xs mb-3 font-black uppercase tracking-widest">{t('workoutPlans.objective')}</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View className="flex-row gap-2">
                            {GOAL_OPTIONS.map((option) => (
                                <TouchableOpacity
                                    key={option.key}
                                    onPress={() => setGoalFilter(option.key)}
                                    className={`px-4 py-2 rounded-full flex-row items-center ${goalFilter === option.key
                                        ? 'bg-primary'
                                        : 'bg-surface-highlight/50 border border-border/10'
                                        }`}
                                >
                                    <Ionicons
                                        name={option.icon as any}
                                        size={16}
                                        color={goalFilter === option.key ? 'white' : option.color}
                                    />
                                    <Text className={`ml-2 font-medium ${goalFilter === option.key ? 'text-white' : 'text-text-muted'
                                        }`}>
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                </View>

                {/* Level Filter */}
                <View className="px-4 pb-4">
                    <Text className="text-text-muted text-xs mb-3 font-black uppercase tracking-widest">{t('workoutPlans.level')}</Text>
                    <View className="flex-row gap-2 flex-wrap">
                        {LEVEL_OPTIONS.map((option) => (
                            <TouchableOpacity
                                key={option.key}
                                onPress={() => setLevelFilter(option.key)}
                                className={`px-4 py-2 rounded-full ${levelFilter === option.key
                                    ? 'bg-primary'
                                    : 'bg-surface-highlight/50 border border-border/10'
                                    }`}
                            >
                                <Text className={`font-medium ${levelFilter === option.key ? 'text-white' : 'text-text-muted'
                                    }`}>
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Templates List */}
                <View className="px-4 pb-8">
                    <Text className="text-text-muted text-[10px] font-black uppercase tracking-widest mb-3">
                        {t('workoutPlans.availablePlans', { count: filteredTemplates.length })}
                    </Text>

                    {filteredTemplates.length === 0 ? (
                        <View className="items-center py-12">
                            <Ionicons name="search" size={48} color="#4b5563" />
                            <Text className="text-text-muted mt-4 font-bold">{t('workoutPlans.noPlans')}</Text>
                        </View>
                    ) : (
                        <View className="gap-4">
                            {filteredTemplates.map((template) => (
                                <TouchableOpacity
                                    key={template.id}
                                    onPress={() => setSelectedTemplate(WORKOUT_TEMPLATES[template.id])}
                                    activeOpacity={0.8}
                                >
                                    <Card variant="glass" className="p-5 border-border/10">
                                        <View className="flex-row justify-between items-start mb-3">
                                            <View className="flex-1 mr-3">
                                                <Text className="text-text text-lg font-bold mb-1">
                                                    {template.name}
                                                </Text>
                                                <Text className="text-text-muted text-sm mb-2" numberOfLines={2}>
                                                    {template.description}
                                                </Text>
                                            </View>
                                            <View
                                                className="px-3 py-1 rounded-full"
                                                style={{ backgroundColor: getLevelColor(template.level) + '30' }}
                                            >
                                                <Text
                                                    className="font-bold text-xs"
                                                    style={{ color: getLevelColor(template.level) }}
                                                >
                                                    {getLevelLabel(template.level)}
                                                </Text>
                                            </View>
                                        </View>

                                        <View className="flex-row items-center gap-4">
                                            <View className="flex-row items-center">
                                                <Ionicons name="calendar" size={14} color="#60a5fa" />
                                                <Text className="text-primary text-sm ml-1">
                                                    {t('workoutPlans.daysPerWeek', { count: template.daysPerWeek })}
                                                </Text>
                                            </View>
                                            <View className="flex-row items-center">
                                                <Ionicons name="trending-up" size={14} color="#f97316" />
                                                <Text className="text-orange-400 text-sm ml-1">
                                                    {getGoalLabel(template.goal)}
                                                </Text>
                                            </View>
                                        </View>
                                    </Card>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Template Detail Modal */}
            <Modal
                visible={selectedTemplate !== null}
                transparent
                animationType="slide"
                onRequestClose={() => setSelectedTemplate(null)}
            >
                <View className="flex-1 justify-end bg-black/60">
                    <View className="bg-surface rounded-t-3xl max-h-[85%]">
                        {selectedTemplate && (
                            <>
                                <View className="p-6 border-b border-border/10">
                                    <View className="flex-row justify-between items-start">
                                        <View className="flex-1">
                                            <Text className="text-text text-2xl font-black">{selectedTemplate.name}</Text>
                                            <Text className="text-text-muted mt-1">{selectedTemplate.description}</Text>
                                        </View>
                                        <TouchableOpacity onPress={() => setSelectedTemplate(null)} className="p-2">
                                            <Ionicons name="close" size={24} color="#94a3b8" />
                                        </TouchableOpacity>
                                    </View>

                                    <View className="flex-row gap-3 mt-4">
                                        <View
                                            className="px-3 py-1 rounded-full"
                                            style={{ backgroundColor: getLevelColor(selectedTemplate.level) + '30' }}
                                        >
                                            <Text style={{ color: getLevelColor(selectedTemplate.level) }} className="font-bold text-sm">
                                                {getLevelLabel(selectedTemplate.level)}
                                            </Text>
                                        </View>
                                        <View className="bg-orange-500/20 px-3 py-1 rounded-full">
                                            <Text className="text-orange-400 font-bold text-sm">
                                                {getGoalLabel(selectedTemplate.goal)}
                                            </Text>
                                        </View>
                                        <View className="bg-primary/20 px-3 py-1 rounded-full">
                                            <Text className="text-primary font-bold text-sm">
                                                {selectedTemplate.daysPerWeek} {t('workoutPlans.daysPerWeek', { count: selectedTemplate.daysPerWeek }).split(' ')[1]}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                <ScrollView className="p-6">
                                    <Text className="text-text-muted text-xs font-black uppercase tracking-widest mb-4">{t('workoutPlans.structure')}</Text>
                                    {selectedTemplate.days.map((day, index) => (
                                        <View key={index} className="bg-surface-highlight/30 rounded-xl p-4 mb-3 border border-border/5">
                                            <Text className="text-text font-bold mb-2">{day.dayName}</Text>
                                            {day.exercises.map((ex, exIndex) => (
                                                <View key={exIndex} className="flex-row justify-between py-1">
                                                    <Text className="text-text-secondary flex-1" numberOfLines={1}>{ex.name}</Text>
                                                    <Text className="text-text-muted text-sm">{ex.sets}×{ex.reps}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    ))}
                                </ScrollView>

                                <View className="p-6 border-t border-border/10">
                                    <TouchableOpacity
                                        onPress={() => handleAdoptClick(selectedTemplate.id)}
                                        disabled={adoptingId !== null}
                                        className={`p-4 rounded-2xl items-center ${adoptingId ? 'bg-surface-highlight/50' : 'bg-primary'}`}
                                    >
                                        <Text className="text-white font-black uppercase tracking-widest">
                                            {adoptingId ? t('workoutPlans.adopting') : t('workoutPlans.adopt')}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </Modal>

            {/* Day Selector Modal */}
            <Modal
                visible={showDaySelector}
                transparent
                animationType="slide"
                onRequestClose={() => setShowDaySelector(false)}
            >
                <View className="flex-1 justify-end bg-black/60">
                    <View className="bg-surface rounded-t-3xl p-6">
                        <View className="flex-row justify-between items-center mb-6">
                            <View>
                                <Text className="text-text text-xl font-black">{t('workoutPlans.daysQuestion')}</Text>
                                <Text className="text-text-muted text-sm">{t('workoutPlans.daysSubtitle')}</Text>
                            </View>
                            <TouchableOpacity onPress={() => setShowDaySelector(false)} className="bg-surface-highlight/50 p-2 rounded-full">
                                <Ionicons name="close" size={24} color="#94a3b8" />
                            </TouchableOpacity>
                        </View>

                        <View className="flex-row justify-between mb-6">
                            {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map((day, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => toggleDay(index)}
                                    className={`w-11 h-11 rounded-full items-center justify-center border-2 ${selectedDays.includes(index)
                                        ? 'bg-primary border-primary'
                                        : 'bg-surface-highlight/30 border-border/10'
                                        }`}
                                >
                                    <Text className={`font-black ${selectedDays.includes(index) ? 'text-white' : 'text-text-muted'
                                        }`}>
                                        {day}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View className="mb-6 flex-row items-center justify-between">
                            <Text className="text-text-muted font-bold">
                                {t('workoutPlans.daysSelected', { count: selectedDays.length })}
                            </Text>
                            <Text className={`font-black ${selectedDays.length === selectedTemplate?.daysPerWeek ? 'text-success' : 'text-warning'}`}>
                                {selectedDays.length}/{selectedTemplate?.daysPerWeek}
                            </Text>
                        </View>

                        <TouchableOpacity
                            onPress={handleConfirmDays}
                            disabled={selectedDays.length === 0 || adoptingId !== null}
                            className={`py-5 rounded-3xl items-center shadow-lg ${selectedDays.length === 0 || adoptingId !== null ? 'bg-surface-highlight/50' : 'bg-primary'
                                }`}
                        >
                            <Text className="text-white font-black text-lg uppercase tracking-widest">
                                {adoptingId ? t('workoutPlans.creating') : t('workoutPlans.confirmAdopt')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScreenWrapper>
    );
}
