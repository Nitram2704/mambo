import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, ScrollView, Alert, Modal, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { AccessibleText } from '@/components/ui/AccessibleText';
import { Colors } from '@/constants/Colors';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useActiveWorkoutStore } from '@/store/activeWorkoutStore';
import { useSavedRoutinesStore } from '@/store/savedRoutinesStore';
import { useWorkoutHistoryStore } from '@/store/workoutHistoryStore';
import { useWeeklyScheduleStore } from '@/store/weeklyScheduleStore';
import { useNutritionStore } from '@/store/nutritionStore';
import { useAchievementsStore } from '@/store/achievementsStore';
import { ACHIEVEMENTS } from '@/constants/achievements';
import { useUserProfileStore } from '@/store/userProfileStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import RestTimer from '@/components/RestTimer';
import ZenMode from '@/components/workout/ZenMode';
import { EXERCISES } from '@/constants/exercises';
import { PlateCalculator } from '@/components/PlateCalculator';
import SetRow from '@/components/SetRow';
import { WhyTooltip } from '@/components/WhyTooltip';
import * as ImagePicker from 'expo-image-picker';
import { CameraView } from 'expo-camera';
import { Video, ResizeMode } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { FormFeedbackCard } from '@/components/workout/FormFeedbackCard';
import { analyzeExerciseForm, FormCheckResult } from '@/utils/formCheckService';
import { useFormCheckStore } from '@/store/formCheckStore';
import { CameraOverlay } from '@/components/workout/CameraOverlay';
import { PremiumLoading } from '@/components/workout/PremiumLoading';
import { readFileAsBase64 } from '@/utils/fileSystem';
import { generateWorkoutPost } from '@/utils/social/postGenerator';
import { useSocialStore } from '@/store/socialStore';
import { LinearGradient } from 'expo-linear-gradient';
import { GeminiService } from '@/utils/GeminiService';
import { VoiceCoach } from '@/utils/voiceCoach';
import { triggerNotification } from '@/utils/haptics';
import * as Haptics from 'expo-haptics';

export default function ActiveWorkoutScreen() {
    const router = useRouter();
    const { theme } = useAppTheme();

    // Local State
    const [showPlateCalc, setShowPlateCalc] = useState(false);
    const [plateCalcInitialWeight, setPlateCalcInitialWeight] = useState(0);
    const [showPRModal, setShowPRModal] = useState(false);
    const [prExercise, setPrExercise] = useState('');
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [showSubstituteModal, setShowSubstituteModal] = useState(false);
    const [coachMessage, setCoachMessage] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [techniqueFeedback, setTechniqueFeedback] = useState<string | null>(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [showFormCheckModal, setShowFormCheckModal] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordedVideoUri, setRecordedVideoUri] = useState<string | null>(null);
    const [formCheckResult, setFormCheckResult] = useState<FormCheckResult | null>(null);
    const [cameraRef, setCameraRef] = useState<any>(null);
    const [showShareModal, setShowShareModal] = useState(false);
    const [sharePostContent, setSharePostContent] = useState('');
    const [completedWorkoutData, setCompletedWorkoutData] = useState<any>(null);
    const [aiCue, setAiCue] = useState<string | null>(null);
    const { createPost } = useSocialStore();

    const {
        exercises,
        currentExerciseIndex,
        startTime,
        isZenMode: isFocusMode,
        toggleZenMode: toggleFocusMode,
        updateSet,
        updateSetType,
        toggleSetCompletion,
        addExtraSet,
        removeSet,
        updateExerciseNote,
        updateRestTime,
        goToNextExercise,
        goToPreviousExercise,
        substituteExercise,
        linkSuperset,
        unlinkSuperset,
        endWorkout,
        updateExerciseVideo
    } = useActiveWorkoutStore();

    const { addWorkout, workouts: history } = useWorkoutHistoryStore();
    const { markWorkoutCompleted } = useWeeklyScheduleStore();
    const { logWorkout } = useNutritionStore();
    const { checkAchievements } = useAchievementsStore();
    const { profile } = useUserProfileStore();
    const { subscription } = useSubscriptionStore();

    const currentExercise = exercises[currentExerciseIndex];
    const previousSets = history
        .filter(w => w.exercises.some(e => e.exerciseId === currentExercise?.exerciseId))
        .sort((a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime())[0]
        ?.exercises.find(e => e.exerciseId === currentExercise?.exerciseId)?.sets || [];

    const previousPerformance = (() => {
        const pastWorkouts = history.filter(w =>
            w.exercises.some(e => e.exerciseId === currentExercise?.exerciseId)
        );
        if (pastWorkouts.length === 0) return null;

        const lastWorkout = pastWorkouts.sort((a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime())[0];
        const lastExerciseData = lastWorkout.exercises.find(e => e.exerciseId === currentExercise?.exerciseId);

        if (!lastExerciseData) return null;

        const bestSet = lastExerciseData.sets
            .filter(s => s.completed)
            .sort((a, b) => (b.weight * b.reps) - (a.weight * a.reps))[0];

        if (!bestSet) return null;

        return {
            date: new Date(lastWorkout.endTime),
            bestWeight: bestSet.weight,
            bestReps: bestSet.reps
        };
    })();

    // AI Coach Logic
    useEffect(() => {
        if (!profile?.aiCoachEnabled || !currentExercise) return;

        const triggerCue = async () => {
            const currentSetIndex = currentExercise.sets.findIndex(s => !s.completed);
            if (currentSetIndex === -1) return;

            const cue = await GeminiService.getWorkoutCue({
                exerciseName: currentExercise.exerciseName,
                currentSet: currentSetIndex + 1,
                totalSets: currentExercise.sets.length,
                lastWeight: previousPerformance?.bestWeight,
                lastReps: previousPerformance?.bestReps,
                targetReps: currentExercise.sets[currentSetIndex].reps || 10,
            }, {
                coachStyle: profile.coachStyle,
                tier: subscription?.tier_id,
            });

            if (cue) {
                setAiCue(cue);
                VoiceCoach.speak(cue);
                // Auto-hide cue after 8 seconds
                setTimeout(() => setAiCue(null), 8000);
            }
        };

        // Trigger when exercise changes or when rest timer starts (meaning a set was completed)
        triggerCue();
    }, [currentExerciseIndex, useActiveWorkoutStore.getState().activeRestTimer.isRunning]);

    useEffect(() => {
        if (!startTime) return;
        const interval = setInterval(() => {
            setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, [startTime]);

    const formatElapsedTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const checkForPR = (exerciseName: string, weight: number, reps: number) => {
        const exerciseHistory = history
            .flatMap(w => w.exercises)
            .filter(e => e.exerciseName === exerciseName)
            .flatMap(e => e.sets)
            .filter(s => s.completed);

        const currentOneRM = weight * (1 + reps / 30);
        const maxPreviousOneRM = Math.max(
            ...exerciseHistory.map(s => s.weight * (1 + s.reps / 30)),
            0
        );

        if (currentOneRM > maxPreviousOneRM && maxPreviousOneRM > 0) {
            setPrExercise(exerciseName);
            setShowPRModal(true);

            // Check for achievement
            checkAchievements({
                history,
                lastWorkout: {
                    id: 'temp',
                    routineId: '',
                    routineName: '',
                    startTime: new Date(),
                    endTime: new Date(),
                    durationSeconds: 0,
                    volume: 0,
                    exercises: []
                }
            });
        }
    };

    const handleToggleSetCompletion = (exerciseIndex: number, setId: string) => {
        toggleSetCompletion(exerciseIndex, setId);

        const set = exercises[exerciseIndex].sets.find(s => s.id === setId);
        if (set && !set.completed) { // If we just completed it (state updates are async, but logic holds)
            // Check for PR
            checkForPR(exercises[exerciseIndex].exerciseName, set.weight, set.reps);
        }
    };

    const handleFinish = async () => {
        const completedWorkout = await endWorkout();
        if (completedWorkout) {
            addWorkout(completedWorkout);

            // Mark as completed in schedule if it was a scheduled routine
            if (completedWorkout.routineId) {
                markWorkoutCompleted(completedWorkout.routineId, new Date().toISOString());
            }

            // Log calories (approximate)
            const calories = Math.floor(completedWorkout.durationSeconds / 60 * 5); // ~5 cal/min
            logWorkout({
                duration: Math.floor(completedWorkout.durationSeconds / 60),
                calories
            });

            // Check achievements
            checkAchievements({
                history: [...history, completedWorkout],
                lastWorkout: completedWorkout
            });

            // Prepare Social Post
            const postData = await generateWorkoutPost(completedWorkout);
            setSharePostContent(postData.content);
            setCompletedWorkoutData(completedWorkout);

            // Check for Auto-Post setting
            if (profile?.autoPostWorkouts) {
                // Generate workout data object for the post
                const workoutData = postData.workout_data;
                await createPost(postData.content, undefined, true, workoutData);
                triggerNotification(Haptics.NotificationFeedbackType.Success);

                router.replace({
                    pathname: '/workout/summary',
                    params: { workoutId: completedWorkout.id }
                });
            } else {
                setShowShareModal(true);
            }
        } else {
            router.back();
        }
    };


    const confirmShare = async () => {
        if (completedWorkoutData) {
            // Generate workout data object for the post
            const postData = await generateWorkoutPost(completedWorkoutData);
            const workoutData = postData.workout_data;

            await createPost(sharePostContent, undefined, true, workoutData);
            setShowShareModal(false);
            router.replace({
                pathname: '/workout/summary',
                params: { workoutId: completedWorkoutData.id }
            });
        }
    };

    const skipShare = () => {
        setShowShareModal(false);
        if (completedWorkoutData) {
            router.replace({
                pathname: '/workout/summary',
                params: { workoutId: completedWorkoutData.id }
            });
        }
    };

    const pickVideo = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Videos,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            updateExerciseVideo(currentExerciseIndex, result.assets[0].uri);
            analyzeTechnique(result.assets[0].uri);
        }
    };

    const analyzeTechnique = async (videoUri: string) => {
        setIsAnalyzing(true);
        // Mock AI analysis
        setTimeout(() => {
            setIsAnalyzing(false);
            setTechniqueFeedback("Tu espalda está un poco arqueada. Intenta mantener el core más tenso y la espalda neutra para evitar lesiones y mejorar la transferencia de fuerza.");
            setCoachMessage("¡He analizado tu técnica! Toca para ver recomendaciones.");
        }, 3000);
    };

    if (isFocusMode) {
        return <ZenMode />;
    }

    if (!currentExercise) {
        return (
            <ScreenWrapper>
                <View className="flex-1 items-center justify-center">
                    <AccessibleText>Cargando entrenamiento...</AccessibleText>
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper safeArea={true} edges={['top', 'left', 'right', 'bottom']}>
            {/* Header */}
            <View className="flex-row items-center justify-between p-4 border-b border-border/10">
                <TouchableOpacity
                    onPress={() => router.back()}
                    accessibilityRole="button"
                    accessibilityLabel="Cerrar entrenamiento"
                >
                    <Icon name="close" size={28} color={Colors[theme].text} />
                </TouchableOpacity>

                <View className="flex-1 items-center">
                    <View className="flex-row items-center bg-surface/50 px-4 py-2 rounded-full border border-primary/20 shadow-glow animate-pulse">
                        <Icon name="time-outline" size={16} variant="primary" />
                        <AccessibleText weight="black" className="text-primary ml-2 text-base font-mono tracking-widest">
                            {formatElapsedTime(elapsedTime)}
                        </AccessibleText>
                    </View>
                </View>

                <View className="flex-row items-center gap-4">
                    <TouchableOpacity
                        onPress={toggleFocusMode}
                        className={`w-10 h-10 rounded-full items-center justify-center border bg-surface-highlight/50 border-border/10`}
                        accessibilityRole="button"
                        accessibilityLabel="Activar modo enfoque"
                    >
                        <Icon name="eye" size={20} color={Colors[theme].text} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setShowPlateCalc(true)}
                        accessibilityRole="button"
                        accessibilityLabel="Calculadora de discos"
                    >
                        <Icon name="calculator-outline" size={24} variant="primary" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleFinish}
                        accessibilityRole="button"
                        accessibilityLabel="Finalizar entrenamiento"
                        className="bg-primary/20 px-3 py-1.5 rounded-xl border border-primary/30"
                    >
                        <AccessibleText weight="black" className="text-primary text-xs uppercase tracking-widest">Finalizar</AccessibleText>
                    </TouchableOpacity>
                </View>
            </View>

            <Modal
                visible={showPlateCalc}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowPlateCalc(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/80 p-4">
                    <View className="w-full">
                        <PlateCalculator
                            initialWeight={plateCalcInitialWeight}
                            onClose={() => setShowPlateCalc(false)}
                        />
                    </View>
                </View>
            </Modal>

            {/* PR Celebration Modal */}
            <Modal
                visible={showPRModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowPRModal(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/80 p-6">
                    <Card variant="glass" className="p-8 items-center max-w-sm w-full border-warning/50">
                        <View className="bg-warning/20 p-4 rounded-2xl mb-4">
                            <Icon name="trophy" size={60} variant="warning" />
                        </View>
                        <AccessibleText className="text-text text-3xl font-black mt-2 text-center tracking-tighter uppercase">
                            ¡NUEVO RÉCORD!
                        </AccessibleText>
                        <View className="h-1 w-20 bg-warning/30 rounded-full my-4" />
                        <AccessibleText className="text-text text-lg font-black text-center">
                            {prExercise}
                        </AccessibleText>
                        <AccessibleText className="text-text-secondary text-center mt-2 text-sm">
                            Has superado tus límites. El Mambo Coach está impresionado. 🔥
                        </AccessibleText>
                        <Button
                            onPress={() => setShowPRModal(false)}
                            variant="primary"
                            className="mt-8 w-full"
                            label="¡A POR MÁS!"
                        />
                    </Card>
                </View>
            </Modal>

            {/* Quick History Modal */}
            <Modal
                visible={showHistoryModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowHistoryModal(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/60 px-4">
                    <Card variant="glass" className="w-full max-h-[80%] border-border/10">
                        <View className="flex-row justify-between items-center mb-6">
                            <View>
                                <AccessibleText className="text-text font-black text-xl uppercase tracking-widest">Historial</AccessibleText>
                                <AccessibleText className="text-text-secondary text-xs font-bold">{currentExercise.exerciseName}</AccessibleText>
                            </View>
                            <TouchableOpacity
                                onPress={() => setShowHistoryModal(false)}
                                className="bg-surface-highlight/50 p-2 rounded-full"
                                accessibilityRole="button"
                                accessibilityLabel="Cerrar historial"
                            >
                                <Icon name="close" size={20} color={Colors[theme].text} />
                            </TouchableOpacity>
                        </View>

                        <View className="bg-surface-highlight/30 p-4 rounded-2xl border border-border/10 mb-6">
                            <View className="flex-row items-end justify-between h-32 gap-2">
                                {history
                                    .filter(w => w.exercises.some(e => e.exerciseId === currentExercise.exerciseId))
                                    .slice(0, 5)
                                    .reverse()
                                    .map((workout, index, arr) => {
                                        const exerciseData = workout.exercises.find(e => e.exerciseId === currentExercise.exerciseId);
                                        const bestSet = exerciseData?.sets
                                            .filter(s => s.completed)
                                            .sort((a, b) => (b.weight * b.reps) - (a.weight * a.reps))[0];
                                        const volume = bestSet ? bestSet.weight * bestSet.reps : 0;

                                        const volumes = arr.map(w => {
                                            const ed = w.exercises.find(e => e.exerciseId === currentExercise.exerciseId);
                                            const bs = ed?.sets.filter(s => s.completed).sort((a, b) => (b.weight * b.reps) - (a.weight * a.reps))[0];
                                            return bs ? bs.weight * bs.reps : 0;
                                        });
                                        const maxVol = Math.max(...volumes, 1);
                                        const height = (volume / maxVol) * 100;

                                        return (
                                            <View key={index} className="flex-1 items-center">
                                                <View className="w-full bg-primary/10 rounded-t-lg relative" style={{ height: `${height}%` }}>
                                                    <View className="absolute -top-6 left-0 right-0 items-center">
                                                        <AccessibleText className="text-primary text-[8px] font-black">{volume}</AccessibleText>
                                                    </View>
                                                    <View
                                                        className="absolute inset-0 bg-primary rounded-t-lg opacity-80"
                                                    />
                                                </View>
                                                <AccessibleText className="text-[8px] text-text-muted mt-2 font-black uppercase">
                                                    {workout.endTime.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                                                </AccessibleText>
                                            </View>
                                        );
                                    })}
                            </View>
                        </View>

                        <Button
                            onPress={() => setShowHistoryModal(false)}
                            variant="secondary"
                            label="Cerrar"
                        />
                    </Card>
                </View>
            </Modal>

            {/* Exercise Substitution Modal */}
            <Modal
                visible={showSubstituteModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowSubstituteModal(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/60 px-4">
                    <Card variant="glass" className="w-full max-h-[80%] border-border/10">
                        <View className="flex-row justify-between items-center mb-4">
                            <View>
                                <AccessibleText className="text-text font-black text-xl uppercase tracking-widest">Sustituir</AccessibleText>
                                <AccessibleText className="text-text-secondary text-xs font-bold">Alternativas para {currentExercise.exerciseName}</AccessibleText>
                            </View>
                            <TouchableOpacity
                                onPress={() => setShowSubstituteModal(false)}
                                className="bg-surface-highlight/50 p-2 rounded-full"
                                accessibilityRole="button"
                                accessibilityLabel="Cerrar sustitución"
                            >
                                <Icon name="close" size={20} color={Colors[theme].text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView className="mb-4">
                            {(() => {
                                const alternatives = EXERCISES.filter(e =>
                                    e.muscleGroup === currentExercise.muscleGroup &&
                                    e.id !== currentExercise.exerciseId
                                );

                                if (alternatives.length === 0) {
                                    return (
                                        <View className="p-4 items-center">
                                            <AccessibleText className="text-text-secondary text-center">
                                                No se encontraron alternativas directas para este grupo muscular.
                                            </AccessibleText>
                                        </View>
                                    );
                                }

                                return alternatives.map((alt) => (
                                    <TouchableOpacity
                                        key={alt.id}
                                        onPress={() => {
                                            substituteExercise(currentExerciseIndex, {
                                                id: alt.id,
                                                name: alt.name,
                                                muscleGroup: alt.muscleGroup,
                                            });
                                            setShowSubstituteModal(false);
                                        }}
                                        className="p-4 bg-surface-highlight/30 rounded-2xl mb-2 border border-border/10"
                                        accessibilityRole="button"
                                        accessibilityLabel={`Sustituir por ${alt.name}`}
                                    >
                                        <View className="flex-row justify-between items-center">
                                            <View>
                                                <AccessibleText className="text-text font-bold">{alt.name}</AccessibleText>
                                                <AccessibleText className="text-text-secondary text-xs capitalize">{alt.equipment}</AccessibleText>
                                            </View>
                                            <Icon name="chevron-forward" size={16} color={Colors[theme].textMuted} />
                                        </View>
                                    </TouchableOpacity>
                                ));
                            })()}
                        </ScrollView>

                        <Button
                            onPress={() => setShowSubstituteModal(false)}
                            variant="secondary"
                            label="Cancelar"
                        />
                    </Card>
                </View>
            </Modal>

            <ScrollView className="flex-1">
                {/* Exercise Info Card */}
                <View className="mx-4 mt-4 mb-2">
                    <Card variant="glass" className="border-warning/30 p-5">
                        {coachMessage && (
                            <TouchableOpacity
                                onPress={() => setCoachMessage(null)}
                                className="absolute -top-10 left-0 right-0 items-center"
                                accessibilityRole="button"
                                accessibilityLabel="Cerrar mensaje del coach"
                            >
                                <View className="bg-secondary px-4 py-2 rounded-full shadow-lg flex-row items-center gap-2">
                                    <Icon name="sparkles" size={14} color={Colors[theme].text} />
                                    <AccessibleText className="text-text font-black text-xs">{coachMessage}</AccessibleText>
                                </View>
                            </TouchableOpacity>
                        )}
                        <View className="flex-row justify-between items-start mb-4">
                            <View className="flex-row gap-2 flex-wrap">
                                <View className="bg-surface-highlight/50 px-3 py-1 rounded-full">
                                    <AccessibleText className="text-text-secondary text-[10px] font-black uppercase tracking-widest">
                                        {currentExercise.muscleGroup}
                                    </AccessibleText>
                                </View>
                                {/* Superset Indicator Badge */}
                                {currentExercise.supersetGroup && (() => {
                                    const supersetExercises = exercises.filter(
                                        ex => ex.supersetGroup === currentExercise.supersetGroup
                                    );
                                    const currentIdxInSuperset = supersetExercises.findIndex(
                                        ex => ex.exerciseId === currentExercise.exerciseId
                                    );
                                    return (
                                        <TouchableOpacity
                                            onPress={() => unlinkSuperset(currentExerciseIndex)}
                                            className="bg-secondary/20 px-3 py-1 rounded-full flex-row items-center gap-1"
                                            accessibilityRole="button"
                                            accessibilityLabel={`Superset ${currentIdxInSuperset + 1} de ${supersetExercises.length}`}
                                            accessibilityHint="Toca para desvincular el superset"
                                        >
                                            <Icon name="link" size={12} variant="secondary" />
                                            <AccessibleText className="text-secondary text-[10px] font-black uppercase tracking-widest">
                                                Superset {currentIdxInSuperset + 1}/{supersetExercises.length}
                                            </AccessibleText>
                                        </TouchableOpacity>
                                    );
                                })()}
                                <TouchableOpacity
                                    onPress={() => router.push({
                                        pathname: '/exercises/[id]',
                                        params: { id: currentExercise.exerciseId }
                                    })}
                                    className="bg-surface-highlight/50 px-2 py-1 rounded-full items-center justify-center"
                                    accessibilityRole="button"
                                    accessibilityLabel="Ver detalles del ejercicio"
                                >
                                    <Icon name="information-circle-outline" size={16} color={Colors[theme].text} />
                                </TouchableOpacity>
                            </View>
                            <View className="bg-surface-highlight/50 px-3 py-1 rounded-full">
                                <AccessibleText className="text-text font-black text-[10px] uppercase tracking-widest">
                                    {currentExerciseIndex + 1} / {exercises.length}
                                </AccessibleText>
                            </View>
                        </View>

                        <View className="flex-row items-center mb-1 pr-8">
                            <AccessibleText
                                weight="black"
                                className="text-text text-3xl tracking-tight flex-1"
                                numberOfLines={1}
                                adjustsFontSizeToFit
                            >
                                {currentExercise.exerciseName}
                            </AccessibleText>
                            <WhyTooltip
                                title="¿Por Qué 8-12 Reps?"
                                explanation="El rango de 8-12 repeticiones es óptimo para hipertrofia muscular porque permite usar pesos moderados que causan suficiente estrés en las fibras musculares sin comprometer la técnica."
                                examples={[
                                    "Pesos demasiado ligeros = poca tensión muscular",
                                    "Pesos demasiado pesados = fallo técnico temprano",
                                    "8-12 reps = equilibrio perfecto para crecimiento"
                                ]}
                                scientific="Estudios muestran que el rango 8-12 reps maximiza la activación de fibras de tipo II, responsables del crecimiento muscular (Schoenfeld et al., 2017)."
                            />
                        </View>
                        <AccessibleText weight="medium" className="text-text-secondary text-sm">
                            {currentExercise.sets.length} series planeadas
                        </AccessibleText>

                        {/* Previous Performance */}
                        {previousPerformance && (
                            <View className="mt-3 p-3 bg-surface-highlight/30 rounded-2xl border border-border/10">
                                <AccessibleText weight="bold" className="text-text-secondary text-[10px] uppercase tracking-widest mb-1">ÚLTIMA SESIÓN</AccessibleText>
                                <AccessibleText weight="bold" className="text-text text-sm font-bold">
                                    {previousPerformance.bestWeight}kg × {previousPerformance.bestReps} reps
                                </AccessibleText>
                                <AccessibleText className="text-text-muted text-[10px] mt-0.5">
                                    {previousPerformance.date.toLocaleDateString()}
                                </AccessibleText>
                            </View>
                        )}

                        {/* Action Buttons */}
                        <View className="flex-row gap-2 mt-4">
                            <TouchableOpacity
                                onPress={() => setShowSubstituteModal(true)}
                                className="flex-1 bg-surface-highlight/50 py-2.5 px-1 rounded-xl items-center justify-center border border-border/10"
                            >
                                <Icon name="swap-horizontal" size={16} color={Colors[theme].text} />
                                <AccessibleText weight="bold" className="text-text text-[10px] uppercase tracking-widest mt-1" numberOfLines={1} adjustsFontSizeToFit>Sustituir</AccessibleText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={pickVideo}
                                className="flex-1 bg-surface-highlight/50 py-2.5 px-1 rounded-xl items-center justify-center border border-border/10"
                            >
                                <Icon name="videocam" size={16} color={Colors[theme].text} />
                                <AccessibleText weight="bold" className="text-text text-[10px] uppercase tracking-widest mt-1" numberOfLines={1} adjustsFontSizeToFit>Técnica</AccessibleText>
                            </TouchableOpacity>
                            {(subscription?.tier_id === 'PRO' || subscription?.tier_id === 'ELITE') && (
                                <TouchableOpacity
                                    onPress={() => setShowFormCheckModal(true)}
                                    className="flex-1 bg-secondary/20 py-3 px-1 rounded-xl items-center justify-center border border-secondary/30 shadow-glow"
                                >
                                    <Icon name="camera" size={16} variant="secondary" />
                                    <AccessibleText weight="bold" className="text-secondary text-[10px] uppercase tracking-widest mt-1" numberOfLines={1} adjustsFontSizeToFit>Form Check</AccessibleText>
                                </TouchableOpacity>
                            )}
                            {/* Superset Button */}
                            {currentExercise.supersetGroup ? (
                                <TouchableOpacity
                                    onPress={() => unlinkSuperset(currentExerciseIndex)}
                                    className="flex-1 bg-secondary/20 py-2.5 px-1 rounded-xl items-center justify-center border border-secondary/30"
                                >
                                    <Icon name="unlink" size={16} variant="secondary" />
                                    <AccessibleText weight="bold" className="text-secondary text-[10px] uppercase tracking-widest mt-1" numberOfLines={1} adjustsFontSizeToFit>Desvincular</AccessibleText>
                                </TouchableOpacity>
                            ) : currentExerciseIndex < exercises.length - 1 ? (
                                <TouchableOpacity
                                    onPress={() => {
                                        Alert.alert(
                                            'Crear Superset',
                                            `¿Vincular "${currentExercise.exerciseName}" con "${exercises[currentExerciseIndex + 1].exerciseName}" como superset?`,
                                            [
                                                { text: 'Cancelar', style: 'cancel' },
                                                {
                                                    text: 'Vincular',
                                                    onPress: () => linkSuperset(currentExerciseIndex, currentExerciseIndex + 1)
                                                }
                                            ]
                                        );
                                    }}
                                    className="flex-1 bg-surface-highlight/50 py-2.5 px-1 rounded-xl items-center justify-center border border-border/10"
                                >
                                    <Icon name="link" size={16} color={Colors[theme].text} />
                                    <AccessibleText weight="bold" className="text-text text-[10px] uppercase tracking-widest mt-1" numberOfLines={1} adjustsFontSizeToFit>Superset</AccessibleText>
                                </TouchableOpacity>
                            ) : null}
                            <TouchableOpacity
                                onPress={() => setShowHistoryModal(true)}
                                className="flex-1 bg-surface-highlight/50 py-2.5 px-1 rounded-xl items-center justify-center border border-border/10"
                            >
                                <Icon name="stats-chart" size={16} color={Colors[theme].text} />
                                <AccessibleText weight="bold" className="text-text text-[10px] uppercase tracking-widest mt-1" numberOfLines={1} adjustsFontSizeToFit>Historial</AccessibleText>
                            </TouchableOpacity>
                        </View>
                    </Card>
                </View>

                {/* Sets Table */}
                <View className="px-4 py-2">
                    <View className="flex-row justify-between items-center mb-4 px-1">
                        <AccessibleText weight="bold" className="text-text text-lg uppercase tracking-widest">Series</AccessibleText>
                        <View className="flex-row items-center gap-2 bg-success/10 px-3 py-1 rounded-full border border-success/20">
                            <Icon name="checkmark-circle" size={14} variant="success" />
                            <AccessibleText weight="bold" className="text-success text-[10px] uppercase tracking-widest">
                                {currentExercise.sets.filter(s => s.completed).length} completadas
                            </AccessibleText>
                        </View>
                    </View>

                    {/* Set Rows */}
                    {currentExercise.sets.map((set, index) => (
                        <SetRow
                            key={set.id}
                            set={set}
                            index={index}
                            onUpdate={(values) => updateSet(currentExerciseIndex, set.id, values)}
                            onTypeChange={(type) => updateSetType(currentExerciseIndex, set.id, type)}
                            onToggle={() => handleToggleSetCompletion(currentExerciseIndex, set.id)}
                            onOpenCalc={(w) => {
                                setPlateCalcInitialWeight(w);
                                setShowPlateCalc(true);
                            }}
                            previousSet={previousSets[index]}
                            show1RM={true}
                            onRemove={() => removeSet(currentExerciseIndex, set.id)}
                        />
                    ))}

                    <TouchableOpacity
                        onPress={() => addExtraSet(currentExerciseIndex)}
                        className="mt-4 bg-primary/10 border-2 border-dashed border-primary/30 py-3.5 rounded-2xl flex-row items-center justify-center gap-2 active:bg-primary/20"
                        activeOpacity={0.7}
                    >
                        <Icon name="add" size={22} variant="primary" />
                        <AccessibleText weight="bold" className="text-primary text-sm uppercase tracking-widest">Añadir Set</AccessibleText>
                    </TouchableOpacity>
                </View>

                {/* AI Technique Analysis */}
                <View className="px-4 py-2">
                    <View className="flex-row items-center mb-3 px-1">
                        <View className="bg-secondary/20 p-1.5 rounded-full mr-2">
                            <Icon name="sparkles" size={12} variant="secondary" />
                        </View>
                        <AccessibleText weight="bold" className="text-secondary text-xs uppercase tracking-widest">Análisis Técnica Mambo Coach</AccessibleText>
                    </View>
                    <Card variant="glass" className="p-4 border-secondary/30">
                        {!currentExercise.videoUrl ? (
                            <TouchableOpacity
                                onPress={pickVideo}
                                className="items-center py-6"
                                activeOpacity={0.7}
                            >
                                <View className="bg-secondary/20 p-4 rounded-2xl mb-3">
                                    <Icon name="videocam" size={36} variant="secondary" />
                                </View>
                                <AccessibleText
                                    weight="bold"
                                    className="text-secondary text-sm uppercase tracking-widest mb-1"
                                    numberOfLines={1}
                                    adjustsFontSizeToFit
                                >
                                    Subir Video para Análisis
                                </AccessibleText>
                                <AccessibleText className="text-text-secondary text-xs text-center px-4 leading-relaxed">
                                    Nuestra IA analizará tu forma y te dará recomendaciones personalizadas
                                </AccessibleText>
                            </TouchableOpacity>
                        ) : (
                            <View>
                                <View className="flex-row items-center justify-between mb-3">
                                    <View className="flex-row items-center gap-2">
                                        <Icon name="checkmark-circle" size={20} variant="secondary" />
                                        <AccessibleText weight="bold" className="text-text uppercase tracking-widest text-xs">Video Registrado</AccessibleText>
                                    </View>
                                    <TouchableOpacity onPress={pickVideo}>
                                        <AccessibleText weight="bold" className="text-secondary text-[10px] uppercase tracking-widest">Cambiar Video</AccessibleText>
                                    </TouchableOpacity>
                                </View>

                                {isAnalyzing ? (
                                    <View className="items-center py-4">
                                        <AccessibleText weight="bold" className="text-secondary animate-pulse uppercase tracking-widest text-xs">IA Analizando técnica...</AccessibleText>
                                    </View>
                                ) : techniqueFeedback ? (
                                    <View className="bg-secondary/10 p-3 rounded-xl border border-secondary/20">
                                        <AccessibleText className="text-secondary text-sm italic">
                                            &quot;{techniqueFeedback}&quot;
                                        </AccessibleText>
                                    </View>
                                ) : (
                                    <Button
                                        onPress={() => analyzeTechnique(currentExercise.videoUrl!)}
                                        variant="secondary"
                                        label="Analizar Técnica"
                                        icon={<Icon name="sparkles" size={16} color="#f8fafc" />}
                                    />
                                )}
                            </View>
                        )}
                    </Card>
                </View>

                {/* Progress Graph */}
                <View className="px-4 py-2">
                    <AccessibleText weight="bold" className="text-text-secondary text-[10px] uppercase tracking-widest mb-2 px-1">Progreso de Fuerza</AccessibleText>
                    <Card variant="glass" className="p-4 border-white/5">
                        <AccessibleText className="text-text-secondary text-[10px] font-black uppercase tracking-widest mb-3">Últimas 4 sesiones</AccessibleText>
                        <View className="flex-row items-end justify-between h-16">
                            {history.slice(0, 4).reverse().map((workout, index) => {
                                const exerciseData = workout.exercises.find(e => e.exerciseId === currentExercise.exerciseId);
                                const maxVolume = exerciseData ?
                                    Math.max(...exerciseData.sets.filter(s => s.completed).map(s => s.weight * s.reps)) : 0;
                                const height = maxVolume > 0 ? Math.max((maxVolume / 100) * 50, 10) : 5;
                                return (
                                    <View key={index} className="flex-1 items-center">
                                        <View
                                            className="bg-primary rounded-sm w-2"
                                            style={{ height: Math.min(height, 50) }}
                                        />
                                        <AccessibleText weight="bold" className="text-[8px] text-text-muted mt-1">
                                            {workout.endTime.getDate()}/{workout.endTime.getMonth() + 1}
                                        </AccessibleText>
                                    </View>
                                );
                            })}
                        </View>
                    </Card>
                </View>

                {/* Exercise Note */}
                <View className="px-4 py-2">
                    <AccessibleText weight="bold" className="text-text-secondary text-[10px] uppercase tracking-widest mb-2 px-1">Notas del Ejercicio</AccessibleText>
                    <Card variant="glass" className="p-0 border-white/5">
                        <TextInput
                            className="text-text p-4 min-h-[80px]"
                            placeholder="Añade notas sobre tu técnica, sensaciones..."
                            placeholderTextColor="#64748b"
                            multiline
                            value={currentExercise.note}
                            onChangeText={(text) => updateExerciseNote(currentExerciseIndex, text)}
                        />
                    </Card>
                </View>

                {/* Rest Timer Config */}
                <View className="px-4 py-2 mb-4">
                    <View className="flex-row items-center mb-2 px-1">
                        <AccessibleText weight="bold" className="text-text-secondary text-[10px] uppercase tracking-widest">Descanso entre series</AccessibleText>
                        <WhyTooltip
                            title="¿Por Qué Descansar 1-3 Min?"
                            explanation="El descanso permite que tus niveles de ATP y fosfocreatina se recuperen, lo que te permite mantener la intensidad en la siguiente serie. Descansos muy cortos limitan el volumen total, mientras que muy largos pueden enfriar el músculo."
                            examples={[
                                "1 min: Enfoque metabólico/resistencia",
                                "2-3 min: Enfoque fuerza/hipertrofia",
                                "Descansa lo suficiente para rendir igual"
                            ]}
                            scientific="Descansos de 2-3 minutos han demostrado ser superiores para la hipertrofia en comparación con descansos de 1 minuto al permitir un mayor volumen de entrenamiento (Schoenfeld et al., 2016)."
                        />
                    </View>
                    <View className="flex-row gap-2">
                        {[60, 90, 120, 180].map((seconds) => (
                            <TouchableOpacity
                                key={seconds}
                                onPress={() => updateRestTime(currentExerciseIndex, seconds)}
                                className={`flex-1 py-3 px-2 rounded-xl border ${currentExercise.restTime === seconds
                                    ? 'bg-primary border-primary/50'
                                    : 'bg-surface-highlight/50 border-white/5'
                                    }`}>
                                <AccessibleText weight="bold" className={`text-center text-[10px] uppercase tracking-widest ${currentExercise.restTime === seconds ? 'text-white' : 'text-text-muted'
                                    }`}>
                                    {seconds / 60} min
                                </AccessibleText>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Navigation */}
                <View className="px-4 flex-row gap-3 mb-32">
                    <TouchableOpacity
                        onPress={goToPreviousExercise}
                        disabled={currentExerciseIndex === 0}
                        className={`flex-1 py-4 rounded-2xl flex-row items-center justify-center gap-2 ${currentExerciseIndex === 0
                            ? 'bg-surface-highlight/30 opacity-50'
                            : 'bg-surface-highlight border border-white/10 active:bg-surface'
                            }`}
                        activeOpacity={0.7}
                    >
                        <Icon name="chevron-back" size={20} color={currentExerciseIndex === 0 ? Colors[theme].textMuted : Colors[theme].text} />
                        <AccessibleText weight="bold" className={`text-sm uppercase tracking-widest ${currentExerciseIndex === 0 ? 'text-text-muted' : 'text-text'
                            }`}>Anterior</AccessibleText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={goToNextExercise}
                        disabled={currentExerciseIndex === exercises.length - 1}
                        className={`flex-[2] py-4 rounded-2xl flex-row items-center justify-center gap-2 ${currentExerciseIndex === exercises.length - 1
                            ? 'bg-surface-highlight/30 opacity-50'
                            : 'bg-primary border border-primary/50 active:bg-primary/90'
                            }`}
                        activeOpacity={0.7}
                    >
                        <AccessibleText weight="bold" className={`text-sm uppercase tracking-widest ${currentExerciseIndex === exercises.length - 1 ? 'text-text-muted' : 'text-white'
                            }`}>Siguiente</AccessibleText>
                        <Icon name="chevron-forward" size={20} color={currentExerciseIndex === exercises.length - 1 ? Colors[theme].textMuted : "#ffffff"} />
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <RestTimer />

            {/* Form Check Modal */}
            <Modal
                visible={showFormCheckModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => {
                    setShowFormCheckModal(false);
                    setRecordedVideoUri(null);
                    setFormCheckResult(null);
                    setIsRecording(false);
                }}
            >
                <View className="flex-1 bg-black">
                    {!recordedVideoUri && !formCheckResult && (
                        <View className="flex-1">
                            <CameraView
                                ref={(ref: any) => setCameraRef(ref)}
                                style={{ flex: 1 }}
                                facing="back"
                            />
                            <CameraOverlay exerciseName={currentExercise.exerciseName} />

                            {/* Camera Controls */}
                            <View className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80">
                                <View className="items-center mb-4">
                                    <AccessibleText weight="bold" className="text-white text-lg mb-2">
                                        {currentExercise.exerciseName}
                                    </AccessibleText>
                                    <AccessibleText className="text-white/70 text-sm text-center">
                                        {isRecording ? 'Grabando... Realiza tu serie' : 'Presiona para grabar tu serie'}
                                    </AccessibleText>
                                </View>

                                <View className="flex-row items-center justify-center gap-4">
                                    <TouchableOpacity
                                        onPress={() => {
                                            setShowFormCheckModal(false);
                                            setRecordedVideoUri(null);
                                            setFormCheckResult(null);
                                        }}
                                        className="w-16 h-16 rounded-full bg-white/20 items-center justify-center"
                                    >
                                        <Icon name="close" size={28} color="white" />
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={async () => {
                                            if (isRecording && cameraRef) {
                                                setIsRecording(false);
                                                cameraRef.stopRecording();
                                            } else if (cameraRef) {
                                                setIsRecording(true);
                                                const video = await cameraRef.recordAsync({
                                                    maxDuration: 30,
                                                    quality: '720p'
                                                });
                                                setRecordedVideoUri(video.uri);
                                                setIsRecording(false);
                                            }
                                        }}
                                        className={`w-20 h-20 rounded-full items-center justify-center ${isRecording ? 'bg-red-500' : 'bg-secondary'
                                            }`}
                                    >
                                        {isRecording ? (
                                            <View className="w-8 h-8 bg-white rounded-sm" />
                                        ) : (
                                            <View className="w-16 h-16 rounded-full border-4 border-white" />
                                        )}
                                    </TouchableOpacity>

                                    <View className="w-16 h-16" />
                                </View>
                            </View>
                        </View>
                    )}

                    {recordedVideoUri && !formCheckResult && (
                        <View className="flex-1 bg-black">
                            <Video
                                source={{ uri: recordedVideoUri }}
                                style={{ flex: 1 }}
                                useNativeControls
                                resizeMode={ResizeMode.CONTAIN}
                                isLooping
                                shouldPlay
                            />

                            <View className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/80">
                                <View className="flex-row items-center justify-between">
                                    <TouchableOpacity
                                        onPress={() => {
                                            setRecordedVideoUri(null);
                                        }}
                                        className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
                                    >
                                        <Icon name="arrow-back" size={24} color="white" />
                                    </TouchableOpacity>

                                    <AccessibleText weight="bold" className="text-white text-lg">
                                        Vista Previa
                                    </AccessibleText>

                                    <TouchableOpacity
                                        onPress={() => {
                                            setShowFormCheckModal(false);
                                            setRecordedVideoUri(null);
                                        }}
                                        className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
                                    >
                                        <Icon name="close" size={24} color="white" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80">
                                {isAnalyzing ? (
                                    <PremiumLoading />
                                ) : (
                                    <View className="flex-row gap-3">
                                        <TouchableOpacity
                                            onPress={() => setRecordedVideoUri(null)}
                                            className="flex-1 bg-white/20 py-4 rounded-2xl items-center"
                                        >
                                            <AccessibleText weight="bold" className="text-white">
                                                Grabar de Nuevo
                                            </AccessibleText>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            onPress={async () => {
                                                setIsAnalyzing(true);
                                                try {
                                                    const publicUrl = await useFormCheckStore.getState().uploadVideo(recordedVideoUri);

                                                    const base64 = await readFileAsBase64(recordedVideoUri);

                                                    const result = await analyzeExerciseForm(base64, currentExercise.exerciseName);

                                                    // Guardar resultado
                                                    await useFormCheckStore.getState().saveFormCheck({
                                                        exercise_name: currentExercise.exerciseName,
                                                        video_url: publicUrl,
                                                        result
                                                    });

                                                    // Verificar logros de IA
                                                    const formChecks = useFormCheckStore.getState().formChecks;
                                                    useAchievementsStore.getState().checkAchievements({
                                                        formCheckCount: formChecks.length,
                                                        formCheckScore: result.score
                                                    });

                                                    setFormCheckResult(result);
                                                } catch (error) {
                                                    console.error('Error analyzing form:', error);
                                                    Alert.alert('Error', 'No se pudo analizar el video. Intenta de nuevo.');
                                                    setRecordedVideoUri(null);
                                                } finally {
                                                    setIsAnalyzing(false);
                                                }
                                            }}
                                            className="flex-1 bg-secondary py-4 rounded-2xl items-center"
                                        >
                                            <AccessibleText weight="bold" className="text-white">
                                                Analizar Técnica
                                            </AccessibleText>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        </View>
                    )}

                    {formCheckResult && (
                        <ScrollView className="flex-1 bg-surface" showsVerticalScrollIndicator={false}>
                            <View className="p-6">
                                <View className="flex-row items-center justify-between mb-6">
                                    <View>
                                        <AccessibleText weight="bold" className="text-text text-2xl">
                                            Análisis Completo
                                        </AccessibleText>
                                        <AccessibleText className="text-text-secondary">
                                            {currentExercise.exerciseName}
                                        </AccessibleText>
                                    </View>

                                    <TouchableOpacity
                                        onPress={() => {
                                            setShowFormCheckModal(false);
                                            setRecordedVideoUri(null);
                                            setFormCheckResult(null);
                                        }}
                                        className="w-10 h-10 rounded-full bg-surface-highlight items-center justify-center"
                                    >
                                        <Icon name="close" size={24} color={Colors[theme].text} />
                                    </TouchableOpacity>
                                </View>

                                <FormFeedbackCard result={formCheckResult} />

                                <View className="mt-6 gap-3">
                                    <Button
                                        onPress={() => {
                                            setShowFormCheckModal(false);
                                            setRecordedVideoUri(null);
                                            setFormCheckResult(null);
                                        }}
                                        variant="primary"
                                        label="Continuar Entrenamiento"
                                    />

                                    <Button
                                        onPress={() => {
                                            setFormCheckResult(null);
                                            setRecordedVideoUri(null);
                                        }}
                                        variant="secondary"
                                        label="Grabar Otro Video"
                                    />
                                </View>
                            </View>
                        </ScrollView>
                    )}
                </View>
            </Modal>
            {/* Share to Feed Modal */}
            <Modal
                visible={showShareModal}
                transparent={true}
                animationType="slide"
                onRequestClose={skipShare}
            >
                <View className="flex-1 justify-end bg-black/80">
                    <View className="bg-surface rounded-t-[32px] p-6 border-t border-white/10">
                        <View className="items-center mb-6">
                            <View className="w-16 h-16 bg-primary/20 rounded-full items-center justify-center mb-4 animate-bounce">
                                <Icon name="flame" size={32} variant="primary" />
                            </View>
                            <AccessibleText variant="h2" weight="black" className="text-white text-center uppercase tracking-tight">
                                ¡Entrenamiento Completado!
                            </AccessibleText>
                            <AccessibleText className="text-text-secondary text-center mt-2">
                                Comparte tu victoria con la comunidad Mambo.
                            </AccessibleText>
                        </View>

                        <View className="bg-surface-highlight/30 p-4 rounded-2xl border border-white/5 mb-6">
                            <TextInput
                                value={sharePostContent}
                                onChangeText={setSharePostContent}
                                multiline
                                className="text-white text-base min-h-[80px]"
                                placeholder="Escribe algo..."
                                placeholderTextColor="#64748b"
                            />
                        </View>

                        <View className="gap-3">
                            <TouchableOpacity onPress={confirmShare}>
                                <LinearGradient
                                    colors={Colors.gradients.primary}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    className="py-4 rounded-2xl items-center shadow-lg shadow-primary/20"
                                >
                                    <AccessibleText weight="black" className="text-black text-lg uppercase tracking-wider">
                                        Compartir en Feed
                                    </AccessibleText>
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={skipShare}
                                className="py-4 rounded-2xl items-center bg-surface-highlight/50"
                            >
                                <AccessibleText weight="bold" className="text-text-secondary uppercase tracking-wider">
                                    No, gracias
                                </AccessibleText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            {/* AI Coach Overlay */}
            {aiCue && (
                <View className="absolute top-24 left-6 right-6 z-50 animate-fade-in">
                    <Card variant="glass" className="bg-primary/90 border-primary p-4 shadow-2xl shadow-primary/40">
                        <View className="flex-row items-center">
                            <View className="bg-white/20 p-2 rounded-full mr-3">
                                <Icon name="sparkles" size={20} color="white" />
                            </View>
                            <AccessibleText weight="bold" className="text-white flex-1 text-sm italic">
                                "{aiCue}"
                            </AccessibleText>
                        </View>
                    </Card>
                </View>
            )}
        </ScreenWrapper>
    );
}
