import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { WORKOUT_TEMPLATES, WorkoutTemplate, listWorkoutTemplates } from '@/utils/planTemplates';
import { useSavedRoutinesStore } from '@/store/savedRoutinesStore';
import { useWeeklyScheduleStore } from '@/store/weeklyScheduleStore';
import { DAY_NAMES } from '@/utils/scheduleUtils';
import { Card } from '@/components/ui/Card';
import { AccessibleText } from '@/components/ui/AccessibleText';
import { a11y } from '@/utils/accessibility';
import { Colors } from '@/constants/Colors';
import { useAppTheme } from '@/hooks/use-app-theme';

type GoalFilter = 'all' | 'hypertrophy' | 'strength' | 'endurance' | 'general';
type LevelFilter = 'all' | 'beginner' | 'intermediate' | 'advanced';

export default function WorkoutPlansScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { theme } = useAppTheme();
    const colors = Colors[theme];
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
        { key: 'all', label: t('workoutPlans.goals.all'), icon: 'apps', color: colors.primary },
        { key: 'hypertrophy', label: t('workoutPlans.goals.hypertrophy'), icon: 'body', color: '#f97316' },
        { key: 'strength', label: t('workoutPlans.goals.strength'), icon: 'barbell', color: '#ef4444' },
        { key: 'endurance', label: t('workoutPlans.goals.endurance'), icon: 'fitness', color: '#10b981' },
        { key: 'general', label: t('workoutPlans.goals.general'), icon: 'heart', color: '#8b5cf6' },
    ];

    const LEVEL_OPTIONS: { key: LevelFilter; label: string; color: string }[] = [
        { key: 'all', label: t('workoutPlans.levels.all'), color: colors.primary },
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
                [{ text: t('workoutPlans.alerts.viewSchedule'), onPress: () => router.push('/workout/schedule') }]
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
            default: return colors.primary;
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
        <ScreenWrapper
            header={
                <View className="flex-row items-center p-4 border-b border-white/5 bg-background">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="bg-surface/50 p-2 rounded-full mr-4 border border-white/10"
                        {...a11y.button('Volver', 'Regresa a la pantalla anterior')}
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <View>
                        <AccessibleText variant="caption" weight="black" className="text-primary uppercase tracking-widest mb-1">
                            {t('workoutPlans.title')}
                        </AccessibleText>
                        <AccessibleText variant="h2" weight="black" className="text-white text-3xl tracking-tight">Mambo Plans</AccessibleText>
                    </View>
                </View>
            }
        >
            <ScrollView className="flex-1">
                {/* Goal Filter */}
                <View className="p-4">
                    <AccessibleText variant="caption" weight="bold" className="text-text-muted mb-3 uppercase tracking-widest">{t('workoutPlans.objective')}</AccessibleText>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View className="flex-row gap-2">
                            {GOAL_OPTIONS.map((option) => (
                                <TouchableOpacity
                                    key={option.key}
                                    onPress={() => setGoalFilter(option.key)}
                                    className={`px-4 py-2 rounded-full flex-row items-center ${goalFilter === option.key
                                        ? 'bg-primary shadow-glow'
                                        : 'bg-surface/50 border border-white/10'
                                        }`}
                                    {...a11y.button(`Filtrar por ${option.label}`, `Muestra solo planes de ${option.label}`)}
                                >
                                    <Ionicons
                                        name={option.icon as any}
                                        size={16}
                                        color={goalFilter === option.key ? 'black' : option.color}
                                    />
                                    <AccessibleText weight="bold" className={`ml-2 ${goalFilter === option.key ? 'text-black' : 'text-text-muted'}`}>
                                        {option.label}
                                    </AccessibleText>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                </View>

                {/* Level Filter */}
                <View className="px-4 pb-4">
                    <AccessibleText variant="caption" weight="bold" className="text-text-muted mb-3 uppercase tracking-widest">{t('workoutPlans.level')}</AccessibleText>
                    <View className="flex-row gap-2 flex-wrap">
                        {LEVEL_OPTIONS.map((option) => (
                            <TouchableOpacity
                                key={option.key}
                                onPress={() => setLevelFilter(option.key)}
                                className={`px-4 py-2 rounded-full ${levelFilter === option.key
                                    ? 'bg-white shadow-lg'
                                    : 'bg-surface/50 border border-white/10'
                                    }`}
                                {...a11y.button(`Filtrar por nivel ${option.label}`, `Muestra solo planes para nivel ${option.label}`)}
                            >
                                <AccessibleText weight="bold" className={`${levelFilter === option.key ? 'text-black' : 'text-text-muted'}`}>
                                    {option.label}
                                </AccessibleText>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Templates List */}
                <View className="px-4 pb-8">
                    <AccessibleText variant="caption" weight="bold" className="text-text-muted mb-3 uppercase tracking-widest">
                        {t('workoutPlans.availablePlans', { count: filteredTemplates.length })}
                    </AccessibleText>

                    {filteredTemplates.length === 0 ? (
                        <View className="items-center py-12">
                            <Ionicons name="search" size={48} color={colors.textMuted} />
                            <AccessibleText weight="bold" className="text-text-muted mt-4">{t('workoutPlans.noPlans')}</AccessibleText>
                        </View>
                    ) : (
                        <View className="gap-4">
                            {filteredTemplates.map((template) => (
                                <TouchableOpacity
                                    key={template.id}
                                    onPress={() => setSelectedTemplate(WORKOUT_TEMPLATES[template.id])}
                                    activeOpacity={0.8}
                                    {...a11y.button(
                                        `${template.name}. ${template.description}. Nivel ${getLevelLabel(template.level)}. ${template.daysPerWeek} días por semana.`,
                                        'Toca para ver detalles de este plan'
                                    )}
                                >
                                    <Card variant="glass" className="p-5 border-white/10">
                                        <View className="flex-row justify-between items-start mb-3">
                                            <View className="flex-1 mr-3">
                                                <AccessibleText variant="h3" weight="black" className="text-white mb-1 text-xl tracking-tight">
                                                    {template.name}
                                                </AccessibleText>
                                                <AccessibleText variant="caption" className="text-text-secondary mb-2 leading-5" numberOfLines={2}>
                                                    {template.description}
                                                </AccessibleText>
                                            </View>
                                            <View
                                                className="px-3 py-1 rounded-full"
                                                style={{ backgroundColor: getLevelColor(template.level) + '20' }}
                                            >
                                                <AccessibleText
                                                    weight="black"
                                                    variant="caption"
                                                    style={{ color: getLevelColor(template.level) }}
                                                    className="uppercase tracking-widest text-[10px]"
                                                >
                                                    {getLevelLabel(template.level)}
                                                </AccessibleText>
                                            </View>
                                        </View>

                                        <View className="flex-row items-center gap-4">
                                            <View className="flex-row items-center">
                                                <Ionicons name="calendar" size={14} color={colors.primary} />
                                                <AccessibleText variant="caption" weight="bold" className="text-primary ml-1 uppercase tracking-wider text-[10px]">
                                                    {t('workoutPlans.daysPerWeek', { count: template.daysPerWeek })}
                                                </AccessibleText>
                                            </View>
                                            <View className="flex-row items-center">
                                                <Ionicons name="trending-up" size={14} color="#f97316" />
                                                <AccessibleText variant="caption" weight="bold" className="text-orange-400 ml-1 uppercase tracking-wider text-[10px]">
                                                    {getGoalLabel(template.goal)}
                                                </AccessibleText>
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
                                <View className="p-6 border-b border-white/5">
                                    <View className="flex-row justify-between items-start">
                                        <View className="flex-1">
                                            <AccessibleText variant="h2" weight="bold" className="text-white">{selectedTemplate.name}</AccessibleText>
                                            <AccessibleText className="text-text-secondary mt-1">{selectedTemplate.description}</AccessibleText>
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => setSelectedTemplate(null)}
                                            className="p-2"
                                            {...a11y.button('Cerrar', 'Cierra los detalles del plan')}
                                        >
                                            <Ionicons name="close" size={24} color={colors.textMuted} />
                                        </TouchableOpacity>
                                    </View>

                                    <View className="flex-row gap-3 mt-4">
                                        <View
                                            className="px-3 py-1 rounded-full"
                                            style={{ backgroundColor: getLevelColor(selectedTemplate.level) + '30' }}
                                        >
                                            <AccessibleText style={{ color: getLevelColor(selectedTemplate.level) }} weight="bold" variant="caption">
                                                {getLevelLabel(selectedTemplate.level)}
                                            </AccessibleText>
                                        </View>
                                        <View className="bg-orange-500/20 px-3 py-1 rounded-full">
                                            <AccessibleText className="text-orange-400 font-bold" variant="caption">
                                                {getGoalLabel(selectedTemplate.goal)}
                                            </AccessibleText>
                                        </View>
                                        <View className="bg-primary/20 px-3 py-1 rounded-full">
                                            <AccessibleText className="text-primary font-bold" variant="caption">
                                                {selectedTemplate.daysPerWeek} {t('workoutPlans.daysPerWeek', { count: selectedTemplate.daysPerWeek }).split(' ')[1]}
                                            </AccessibleText>
                                        </View>
                                    </View>
                                </View>

                                <ScrollView className="p-6">
                                    <AccessibleText variant="caption" weight="bold" className="text-text-muted uppercase tracking-widest mb-4">{t('workoutPlans.structure')}</AccessibleText>
                                    {selectedTemplate.days.map((day, index) => (
                                        <View key={index} className="bg-surface-highlight/30 rounded-xl p-4 mb-3 border border-white/5">
                                            <AccessibleText weight="bold" className="text-white mb-2">{day.dayName}</AccessibleText>
                                            {day.exercises.map((ex, exIndex) => (
                                                <View key={exIndex} className="flex-row justify-between py-1">
                                                    <AccessibleText className="text-text-secondary flex-1" numberOfLines={1}>{ex.name}</AccessibleText>
                                                    <AccessibleText variant="caption" className="text-text-muted">{ex.sets}×{ex.reps}</AccessibleText>
                                                </View>
                                            ))}
                                        </View>
                                    ))}
                                </ScrollView>

                                <View className="p-6 border-t border-white/5">
                                    <TouchableOpacity
                                        onPress={() => handleAdoptClick(selectedTemplate.id)}
                                        disabled={adoptingId !== null}
                                        className={`p-4 rounded-2xl items-center ${adoptingId ? 'bg-surface/50' : 'bg-primary shadow-glow'}`}
                                        {...a11y.button(
                                            adoptingId ? t('workoutPlans.adopting') : t('workoutPlans.adopt'),
                                            'Toca para adoptar este plan de entrenamiento'
                                        )}
                                    >
                                        <AccessibleText weight="black" className={`${adoptingId ? 'text-text-muted' : 'text-black'} uppercase tracking-widest text-lg`}>
                                            {adoptingId ? t('workoutPlans.adopting') : t('workoutPlans.adopt')}
                                        </AccessibleText>
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
                                <AccessibleText variant="h2" weight="bold" className="text-white">{t('workoutPlans.daysQuestion')}</AccessibleText>
                                <AccessibleText className="text-text-secondary text-sm">{t('workoutPlans.daysSubtitle')}</AccessibleText>
                            </View>
                            <TouchableOpacity
                                onPress={() => setShowDaySelector(false)}
                                className="bg-surface-highlight/50 p-2 rounded-full"
                                {...a11y.button('Cerrar', 'Cierra el selector de días')}
                            >
                                <Ionicons name="close" size={24} color={colors.textMuted} />
                            </TouchableOpacity>
                        </View>

                        <View className="flex-row justify-between mb-6">
                            {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map((day, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => toggleDay(index)}
                                    className={`w-11 h-11 rounded-full items-center justify-center border-2 ${selectedDays.includes(index)
                                        ? 'bg-primary border-primary'
                                        : 'bg-surface-highlight/30 border-white/5'
                                        }`}
                                    {...a11y.button(
                                        `Seleccionar ${day}`,
                                        `Toca para ${selectedDays.includes(index) ? 'deseleccionar' : 'seleccionar'} este día`
                                    )}
                                >
                                    <AccessibleText weight="bold" className={`${selectedDays.includes(index) ? 'text-white' : 'text-text-muted'}`}>
                                        {day}
                                    </AccessibleText>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View className="mb-6 flex-row items-center justify-between">
                            <AccessibleText weight="bold" className="text-text-secondary">
                                {t('workoutPlans.daysSelected', { count: selectedDays.length })}
                            </AccessibleText>
                            <AccessibleText weight="bold" className={`${selectedDays.length === selectedTemplate?.daysPerWeek ? 'text-success' : 'text-warning'}`}>
                                {selectedDays.length}/{selectedTemplate?.daysPerWeek}
                            </AccessibleText>
                        </View>

                        <TouchableOpacity
                            onPress={handleConfirmDays}
                            disabled={selectedDays.length === 0 || adoptingId !== null}
                            className={`py-5 rounded-3xl items-center shadow-lg ${selectedDays.length === 0 || adoptingId !== null ? 'bg-surface-highlight/50' : 'bg-primary'
                                }`}
                            {...a11y.button(
                                adoptingId ? t('workoutPlans.creating') : t('workoutPlans.confirmAdopt'),
                                'Toca para confirmar los días y adoptar el plan'
                            )}
                        >
                            <AccessibleText weight="bold" variant="h3" className="text-white uppercase tracking-widest">
                                {adoptingId ? t('workoutPlans.creating') : t('workoutPlans.confirmAdopt')}
                            </AccessibleText>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScreenWrapper>
    );
}
