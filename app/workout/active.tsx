import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Modal, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { useActiveWorkoutStore } from '@/store/activeWorkoutStore';
import { useSavedRoutinesStore } from '@/store/savedRoutinesStore';
import { useWorkoutHistoryStore } from '@/store/workoutHistoryStore';
import { useWeeklyScheduleStore } from '@/store/weeklyScheduleStore';
import { useNutritionStore } from '@/store/nutritionStore';
import { useAchievementsStore } from '@/store/achievementsStore';
import { ACHIEVEMENTS } from '@/constants/achievements';
import { useUserProfileStore } from '@/store/userProfileStore';
import RestTimer from '@/components/RestTimer';
import SetRow from '@/components/SetRow';
import { PlateCalculator } from '@/components/PlateCalculator';
import { SupersetContainer, SupersetLinkButton } from '@/components/SupersetContainer';
import { WhyTooltip } from '@/components/WhyTooltip';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';

export default function ActiveWorkoutScreen() {
    const router = useRouter();
    const { routineId } = useLocalSearchParams<{ routineId: string }>();
    const [showPlateCalc, setShowPlateCalc] = useState(false);
    const [plateCalcInitialWeight, setPlateCalcInitialWeight] = useState(60);
    const [showPRModal, setShowPRModal] = useState(false);
    const [prExercise, setPrExercise] = useState('');
    const [showSubstituteModal, setShowSubstituteModal] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [techniqueFeedback, setTechniqueFeedback] = useState<string | null>(null);
    const [coachMessage, setCoachMessage] = useState<string | null>(null);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);

    const {
        routine,
        exercises,
        currentExerciseIndex,
        startWorkout,
        updateSet,
        updateSetType,
        addExtraSet,
        toggleSetCompletion,
        updateExerciseNote,
        updateRestTime,
        goToNextExercise,
        goToPreviousExercise,
        substituteExercise,
        endWorkout,
        updateExerciseVideo,
        isFocusMode,
        toggleFocusMode,
        linkSuperset,
        unlinkSuperset,
        startRestTimer,
        startTime
    } = useActiveWorkoutStore();

    const { routines, updateRoutine, fetchRoutines } = useSavedRoutinesStore();
    const { addWorkout: addWorkoutToHistory, workouts: history } = useWorkoutHistoryStore();
    const { markWorkoutCompleted } = useWeeklyScheduleStore();
    const { logWorkout } = useNutritionStore();
    const { checkAchievements, addXp } = useAchievementsStore();
    const { profile } = useUserProfileStore();

    // Initialize workout if needed
    React.useEffect(() => {
        const initWorkout = async () => {
            if (routineId && (!routine || routine.id !== routineId)) {
                let selectedRoutine = routines.find((r) => r.id === routineId);

                // If routine not found, try fetching routines
                if (!selectedRoutine && routines.length === 0) {
                    await fetchRoutines();
                    selectedRoutine = useSavedRoutinesStore.getState().routines.find((r) => r.id === routineId);
                }

                if (selectedRoutine) {
                    startWorkout(selectedRoutine);
                } else {
                    // Routine still not found
                    Alert.alert(
                        'Error',
                        'No se pudo encontrar la rutina. Inténtalo de nuevo.',
                        [{ text: 'Volver', onPress: () => router.back() }]
                    );
                }
            }
        };

        initWorkout();
    }, [routineId, routine, routines.length, startWorkout]); // Removed 'routines' from dependency to avoid loop, used length instead

    // Live Workout Timer
    useEffect(() => {
        if (!startTime) return;

        const interval = setInterval(() => {
            const now = new Date();
            const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
            setElapsedTime(elapsed);
        }, 1000);

        return () => clearInterval(interval);
    }, [startTime]);

    const formatElapsedTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;

        const parts = [];
        if (h > 0) parts.push(h.toString().padStart(2, '0'));
        parts.push(m.toString().padStart(2, '0'));
        parts.push(s.toString().padStart(2, '0'));

        return parts.join(':');
    };

    const currentExercise = exercises[currentExerciseIndex];

    // Get previous performance for current exercise - must be before any conditional return
    const previousSets = React.useMemo(() => {
        if (!currentExercise || !history) return [];

        // Find all workouts that contain this exercise
        const relevantWorkouts = history.filter(w =>
            w.exercises.some(e => e.exerciseId === currentExercise.exerciseId)
        );

        // Sort by date descending (newest first)
        relevantWorkouts.sort((a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime());

        if (relevantWorkouts.length === 0) return [];

        // Get the most recent workout's data for this exercise
        const lastWorkout = relevantWorkouts[0];
        const lastExerciseData = lastWorkout.exercises.find(e => e.exerciseId === currentExercise.exerciseId);

        return lastExerciseData ? lastExerciseData.sets : [];
    }, [history, currentExercise]);

    // Get previous performance summary (best weight/reps)
    const getPreviousPerformance = () => {
        if (!currentExercise) return null;

        const exerciseHistory = history
            .flatMap(w => w.exercises.map(e => ({ ...e, workoutDate: w.endTime })))
            .filter(e => e.exerciseId === currentExercise.exerciseId)
            .sort((a, b) => b.workoutDate.getTime() - a.workoutDate.getTime());

        if (exerciseHistory.length === 0) return null;

        const lastSession = exerciseHistory[0];
        const bestSet = lastSession.sets
            .filter(s => s.completed)
            .sort((a, b) => (b.weight * b.reps) - (a.weight * a.reps))[0];

        return {
            date: lastSession.workoutDate,
            bestWeight: bestSet?.weight || 0,
            bestReps: bestSet?.reps || 0,
            volume: lastSession.sets.filter(s => s.completed).reduce((sum, s) => sum + (s.weight * s.reps), 0)
        };
    };

    const previousPerformance = getPreviousPerformance();

    // Early return for loading state - AFTER all hooks
    if (!routine || exercises.length === 0) {
        return (
            <ScreenWrapper bg="bg-background" safeArea={true} className="items-center justify-center">
                <Text className="text-text mb-4">Cargando...</Text>
                <Button
                    onPress={() => router.back()}
                    variant="secondary"
                    label="Cancelar"
                />
            </ScreenWrapper>
        );
    }

    // Check for PR and show celebration
    const checkForPR = (exerciseId: string, weight: number, reps: number) => {
        const exerciseHistory = history
            .flatMap(w => w.exercises)
            .filter(e => e.exerciseId === exerciseId);

        const maxVolume = Math.max(...exerciseHistory.flatMap(e =>
            e.sets.filter(s => s.completed).map(s => s.weight * s.reps)
        ), 0);

        const maxWeight = Math.max(...exerciseHistory.flatMap(e =>
            e.sets.filter(s => s.completed).map(s => s.weight)
        ), 0);

        const currentVolume = weight * reps;
        const isVolumePR = currentVolume > maxVolume && maxVolume > 0;
        const isWeightPR = weight > maxWeight && maxWeight > 0;

        if (isVolumePR || isWeightPR) {
            setPrExercise(currentExercise.exerciseName);
            setShowPRModal(true);
            return true;
        }
        return false;
    };

    const handleToggleSetCompletion = (exerciseIndex: number, setId: string) => {
        const exercise = exercises[exerciseIndex];
        const set = exercise.sets.find(s => s.id === setId);

        if (set && !set.completed && set.weight > 0 && set.reps > 0) {
            checkForPR(exercise.exerciseId, set.weight, set.reps);

            // Mambo Coach Feedback based on RIR
            if (set.rir === 0) {
                setCoachMessage("¡Al fallo! Increíble esfuerzo. 🔥");
            } else if (set.rir <= 2) {
                setCoachMessage("Intensidad perfecta para hipertrofia. ¡Sigue así! 💪");
            } else if (set.rir >= 4) {
                setCoachMessage("Parece que tenías más en el tanque. ¡A por más peso! ⚡");
            } else {
                setCoachMessage("Buen trabajo. Mantén el ritmo. 👍");
            }

            // Auto Rest Timer
            startRestTimer(exercise.restTime || 120);
        }

        toggleSetCompletion(exerciseIndex, setId);
    };

    const checkIfShouldUpdateRoutine = () => {
        if (!routine) return false;

        // Check if any exercise has a different number of completed sets than planned
        const originalRoutine = routines.find(r => r.id === routine.id);
        if (!originalRoutine) return false;

        let hasChanges = false;

        exercises.forEach(exSession => {
            const originalExercise = originalRoutine.exercises.find(e => e.id === exSession.exerciseId);
            if (originalExercise) {
                // Count completed sets (ignoring empty ones)
                const completedSetsCount = exSession.sets.filter(s => s.completed).length;
                const plannedSets = originalExercise.plannedSets || 3;

                if (completedSetsCount > 0 && completedSetsCount !== plannedSets) {
                    hasChanges = true;
                }
            }
        });

        return hasChanges;
    };

    const promptUpdateRoutine = async () => {
        return new Promise<boolean>((resolve) => {
            if (checkIfShouldUpdateRoutine()) {
                Alert.alert(
                    'Actualizar Rutina',
                    'Has realizado un número diferente de series de lo planeado. ¿Quieres actualizar la rutina original con estos cambios?',
                    [
                        {
                            text: 'No, mantener original',
                            style: 'cancel',
                            onPress: () => resolve(false),
                        },
                        {
                            text: 'Sí, actualizar',
                            style: 'default',
                            onPress: () => {
                                // Update routine logic
                                if (routine) {
                                    const updatedExercises = routine.exercises.map(ex => {
                                        const session = exercises.find(s => s.exerciseId === ex.id);
                                        if (session) {
                                            const completedCount = session.sets.filter(s => s.completed).length;
                                            if (completedCount > 0) {
                                                return { ...ex, plannedSets: completedCount };
                                            }
                                        }
                                        return ex;
                                    });
                                    updateRoutine(routine.id, { exercises: updatedExercises });
                                }
                                resolve(true);
                            },
                        },
                    ]
                );
            } else {
                resolve(false);
            }
        });
    };

    const uploadVideo = async (uri: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;

            const ext = uri.split('.').pop();
            const fileName = `${user.id}/${Date.now()}.${ext}`;
            const formData = new FormData();

            // @ts-ignore
            formData.append('file', {
                uri,
                name: fileName,
                type: `video/${ext}`,
            });

            const { data, error } = await supabase.storage
                .from('workout-videos')
                .upload(fileName, formData, {
                    cacheControl: '3600',
                    upsert: false,
                });

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('workout-videos')
                .getPublicUrl(fileName);

            return publicUrl;
        } catch (error) {
            console.error('Error uploading video:', error);
            Alert.alert('Error', 'No se pudo subir el video');
            return null;
        }
    };

    const pickVideo = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permiso denegado', 'Necesitamos acceso a la galería para subir videos.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Videos,
                allowsEditing: true,
                quality: 0.5, // Compress video
            });

            if (!result.canceled) {
                Alert.alert('Subiendo video...', 'Por favor espera.');
                const videoUrl = await uploadVideo(result.assets[0].uri);
                if (videoUrl) {
                    updateExerciseVideo(currentExerciseIndex, videoUrl);
                    Alert.alert(
                        '¡Éxito!',
                        'Video subido correctamente. ¿Quieres que la IA analice tu técnica?',
                        [
                            { text: 'Ahora no', style: 'cancel' },
                            { text: 'Analizar', onPress: () => analyzeTechnique(videoUrl) }
                        ]
                    );
                }
            }
        } catch (error) {
            console.error('Error picking video:', error);
            Alert.alert('Error', 'Hubo un problema al seleccionar el video');
        }
    };

    const analyzeTechnique = async (videoUrl: string) => {
        setIsAnalyzing(true);
        setTechniqueFeedback(null);

        // Simulate AI analysis - in a real app this would call a backend with Gemini 1.5 Pro
        setTimeout(() => {
            setIsAnalyzing(false);
            const feedbacks = [
                "Tu técnica se ve sólida. Mantén los codos un poco más cerrados para proteger los hombros y asegúrate de controlar el descenso (fase excéntrica).",
                "Buen rango de movimiento. Intenta no bloquear las articulaciones al final de la fase concéntrica para mantener la tensión muscular.",
                "Excelente control. Asegúrate de mantener el core activo durante todo el movimiento para mayor estabilidad.",
                "Se observa una ligera compensación con la espalda baja. Intenta reducir un poco el peso para priorizar la forma perfecta."
            ];
            setTechniqueFeedback(feedbacks[Math.floor(Math.random() * feedbacks.length)]);
        }, 3000);
    };

    const handleFinish = async () => {
        Alert.alert(
            '¿Terminar entreno?',
            'Se guardará el progreso y finalizará la sesión.',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Finalizar',
                    style: 'default',
                    onPress: async () => {
                        // First check if we should update the routine
                        await promptUpdateRoutine();

                        const completedWorkout = await endWorkout();
                        if (completedWorkout) {
                            // FIXED: Get the actual Supabase ID from addWorkoutToHistory
                            const supabaseWorkoutId = await addWorkoutToHistory(completedWorkout);

                            // Mark the scheduled workout as completed
                            if (routineId) {
                                markWorkoutCompleted(routineId);
                            }

                            // Add XP for completing workout
                            addXp(10, 'Completed workout');

                            // Check for achievements
                            const newUnlocks = checkAchievements({
                                lastWorkout: completedWorkout,
                                history: [...history, completedWorkout],
                                userWeight: profile?.weight
                            });

                            if (newUnlocks.length > 0) {
                                const unlockNames = newUnlocks.map(u => {
                                    const ach = ACHIEVEMENTS.find(a => a.id === u.id);
                                    return ach?.title;
                                }).join(', ');

                                Alert.alert(
                                    '¡Logro Desbloqueado! 🏆',
                                    `Has desbloqueado: ${unlockNames}`,
                                    [{ text: '¡Genial!' }]
                                );
                            }

                            const durationMinutes = Math.round(completedWorkout.durationSeconds / 60);
                            const estimatedCalories = Math.round(durationMinutes * 6);
                            logWorkout({
                                duration: durationMinutes,
                                calories: estimatedCalories,
                            });

                            // FIXED: Use Supabase ID for navigation
                            if (supabaseWorkoutId) {
                                router.replace({
                                    pathname: '/workout/summary',
                                    params: { workoutId: supabaseWorkoutId }
                                });
                            } else {
                                // Fallback if save failed
                                Alert.alert('Error', 'No se pudo guardar el entreno');
                                router.push('/(tabs)');
                            }
                        } else {
                            router.push('/(tabs)');
                        }
                    },
                },
            ]
        );
    };

    return (
        <ScreenWrapper bg="bg-background" safeArea={true} edges={['top', 'left', 'right', 'bottom']}>
            {/* Header */}
            <View className="flex-row items-center justify-between p-4 border-b border-white/5">
                {!isFocusMode ? (
                    <TouchableOpacity onPress={() => router.back()}>
                        <Icon name="close" size={28} color="#f8fafc" />
                    </TouchableOpacity>
                ) : (
                    <View /> // Spacer
                )}

                <View className="flex-1 items-center">
                    <View className="flex-row items-center bg-surface-highlight/50 px-3 py-1.5 rounded-full border border-white/5">
                        <Icon name="time-outline" size={14} variant="primary" />
                        <Text className="text-text font-mono font-black ml-1.5 text-sm">
                            {formatElapsedTime(elapsedTime)}
                        </Text>
                    </View>
                </View>

                <View className="flex-row items-center gap-4">
                    <TouchableOpacity
                        onPress={toggleFocusMode}
                        className={`w-10 h-10 rounded-full items-center justify-center border ${isFocusMode ? 'bg-secondary/20 border-secondary' : 'bg-surface-highlight/50 border-white/10'}`}
                    >
                        <Icon name={isFocusMode ? "eye-off" : "eye"} size={20} color={isFocusMode ? "#8b5cf6" : "#f8fafc"} />
                    </TouchableOpacity>

                    {!isFocusMode && (
                        <>
                            <TouchableOpacity onPress={() => setShowPlateCalc(true)}>
                                <Icon name="calculator-outline" size={24} variant="primary" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleFinish}>
                                <Text className="text-primary font-black">Finalizar</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>

            {/* Focus Mode Exit Button (Floating) */}
            {isFocusMode && (
                <TouchableOpacity
                    onPress={handleFinish}
                    className="absolute top-4 left-4 z-50 bg-red-500/20 px-4 py-2 rounded-full border border-red-500/50"
                >
                    <Text className="text-red-400 font-bold text-xs">Finalizar</Text>
                </TouchableOpacity>
            )}

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
                        <Text className="text-text text-3xl font-black mt-2 text-center tracking-tighter uppercase">
                            ¡NUEVO RÉCORD!
                        </Text>
                        <View className="h-1 w-20 bg-warning/30 rounded-full my-4" />
                        <Text className="text-text text-lg font-black text-center">
                            {prExercise}
                        </Text>
                        <Text className="text-text-secondary text-center mt-2 text-sm">
                            Has superado tus límites. El Mambo Coach está impresionado. 🔥
                        </Text>
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
                    <Card variant="glass" className="w-full max-h-[80%] border-white/10">
                        <View className="flex-row justify-between items-center mb-6">
                            <View>
                                <Text className="text-text font-black text-xl uppercase tracking-widest">Historial</Text>
                                <Text className="text-text-secondary text-xs font-bold">{currentExercise.exerciseName}</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => setShowHistoryModal(false)}
                                className="bg-surface-highlight/50 p-2 rounded-full"
                            >
                                <Icon name="close" size={20} color="#f8fafc" />
                            </TouchableOpacity>
                        </View>

                        <View className="bg-surface-highlight/30 p-4 rounded-2xl border border-white/5 mb-6">
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
                                                        <Text className="text-primary text-[8px] font-black">{volume}</Text>
                                                    </View>
                                                    <View
                                                        className="absolute inset-0 bg-primary rounded-t-lg opacity-80"
                                                    />
                                                </View>
                                                <Text className="text-[8px] text-text-muted mt-2 font-black uppercase">
                                                    {workout.endTime.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                                                </Text>
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
                    <Card variant="glass" className="w-full max-h-[80%] border-white/10">
                        <View className="flex-row justify-between items-center mb-4">
                            <View>
                                <Text className="text-text font-black text-xl uppercase tracking-widest">Sustituir</Text>
                                <Text className="text-text-secondary text-xs font-bold">Alternativas para {currentExercise.exerciseName}</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => setShowSubstituteModal(false)}
                                className="bg-surface-highlight/50 p-2 rounded-full"
                            >
                                <Icon name="close" size={20} color="#f8fafc" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView className="mb-4">
                            {(() => {
                                const equipment = profile?.availableEquipment || 'full_gym';
                                const allAlternatives = [
                                    { name: 'Press de Banca con Mancuernas', equipment: ['full_gym', 'dumbbells'] },
                                    { name: 'Press Inclinado', equipment: ['full_gym'] },
                                    { name: 'Fondos', equipment: ['full_gym', 'bodyweight'] },
                                    { name: 'Flexiones', equipment: ['bodyweight', 'dumbbells', 'bands', 'full_gym'] },
                                    { name: 'Press con Bandas', equipment: ['bands'] },
                                ];

                                return allAlternatives
                                    .filter(alt => equipment === 'full_gym' || alt.equipment.includes(equipment))
                                    .map((alt) => (
                                        <TouchableOpacity
                                            key={alt.name}
                                            onPress={() => {
                                                const mockExercise = {
                                                    id: alt.name.toLowerCase().replace(/\s+/g, '_'),
                                                    name: alt.name,
                                                    muscleGroup: currentExercise.muscleGroup,
                                                };
                                                substituteExercise(currentExerciseIndex, mockExercise);
                                                setShowSubstituteModal(false);
                                            }}
                                            className="p-4 bg-surface-highlight/30 rounded-2xl mb-2 border border-white/5"
                                        >
                                            <View className="flex-row justify-between items-center">
                                                <Text className="text-text font-bold">{alt.name}</Text>
                                                <Icon name="chevron-forward" size={16} color="#64748b" />
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
                            >
                                <View className="bg-secondary px-4 py-2 rounded-full shadow-lg flex-row items-center gap-2">
                                    <Icon name="sparkles" size={14} color="#f8fafc" />
                                    <Text className="text-text font-black text-xs">{coachMessage}</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                        <View className="flex-row justify-between items-start mb-4">
                            <View className="flex-row gap-2 flex-wrap">
                                <View className="bg-surface-highlight/50 px-3 py-1 rounded-full">
                                    <Text className="text-text-secondary text-[10px] font-black uppercase tracking-widest">
                                        {currentExercise.muscleGroup}
                                    </Text>
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
                                        >
                                            <Icon name="link" size={12} variant="secondary" />
                                            <Text className="text-secondary text-[10px] font-black uppercase tracking-widest">
                                                Superset {currentIdxInSuperset + 1}/{supersetExercises.length}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })()}
                                <TouchableOpacity
                                    onPress={() => router.push({
                                        pathname: '/exercises/[id]',
                                        params: { id: currentExercise.exerciseId }
                                    })}
                                    className="bg-surface-highlight/50 px-2 py-1 rounded-full items-center justify-center"
                                >
                                    <Icon name="information-circle-outline" size={16} color="#f8fafc" />
                                </TouchableOpacity>
                            </View>
                            <View className="bg-surface-highlight/50 px-3 py-1 rounded-full">
                                <Text className="text-text font-black text-[10px] uppercase tracking-widest">
                                    {currentExerciseIndex + 1} / {exercises.length}
                                </Text>
                            </View>
                        </View>

                        <View className="flex-row items-center mb-1 pr-8">
                            <Text
                                className="text-text text-2xl font-black flex-1"
                                numberOfLines={1}
                                adjustsFontSizeToFit
                            >
                                {currentExercise.exerciseName}
                            </Text>
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
                        <Text className="text-text-secondary text-sm font-medium">
                            {currentExercise.sets.length} series planeadas
                        </Text>

                        {/* Previous Performance */}
                        {previousPerformance && (
                            <View className="mt-3 p-3 bg-surface-highlight/30 rounded-2xl border border-white/5">
                                <Text className="text-text-secondary text-[10px] font-black uppercase tracking-widest mb-1">ÚLTIMA SESIÓN</Text>
                                <Text className="text-text text-sm font-bold">
                                    {previousPerformance.bestWeight}kg × {previousPerformance.bestReps} reps
                                </Text>
                                <Text className="text-text-muted text-[10px] mt-0.5">
                                    {previousPerformance.date.toLocaleDateString()}
                                </Text>
                            </View>
                        )}

                        {/* Action Buttons */}
                        <View className="flex-row gap-2 mt-4">
                            <TouchableOpacity
                                onPress={() => setShowSubstituteModal(true)}
                                className="flex-1 bg-surface-highlight/50 py-2.5 px-1 rounded-xl items-center justify-center border border-white/5"
                            >
                                <Icon name="swap-horizontal" size={16} color="#f8fafc" />
                                <Text className="text-text text-[10px] font-black uppercase tracking-widest mt-1" numberOfLines={1} adjustsFontSizeToFit>Sustituir</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={pickVideo}
                                className="flex-1 bg-surface-highlight/50 py-2.5 px-1 rounded-xl items-center justify-center border border-white/5"
                            >
                                <Icon name="videocam" size={16} color="#f8fafc" />
                                <Text className="text-text text-[10px] font-black uppercase tracking-widest mt-1" numberOfLines={1} adjustsFontSizeToFit>Técnica</Text>
                            </TouchableOpacity>
                            {/* Superset Button */}
                            {currentExercise.supersetGroup ? (
                                <TouchableOpacity
                                    onPress={() => unlinkSuperset(currentExerciseIndex)}
                                    className="flex-1 bg-secondary/20 py-2.5 px-1 rounded-xl items-center justify-center border border-secondary/30"
                                >
                                    <Icon name="unlink" size={16} variant="secondary" />
                                    <Text className="text-secondary text-[10px] font-black uppercase tracking-widest mt-1" numberOfLines={1} adjustsFontSizeToFit>Desvincular</Text>
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
                                    className="flex-1 bg-surface-highlight/50 py-2.5 px-1 rounded-xl items-center justify-center border border-white/5"
                                >
                                    <Icon name="link" size={16} color="#f8fafc" />
                                    <Text className="text-text text-[10px] font-black uppercase tracking-widest mt-1" numberOfLines={1} adjustsFontSizeToFit>Superset</Text>
                                </TouchableOpacity>
                            ) : null}
                            <TouchableOpacity
                                onPress={() => setShowHistoryModal(true)}
                                className="flex-1 bg-surface-highlight/50 py-2.5 px-1 rounded-xl items-center justify-center border border-white/5"
                            >
                                <Icon name="stats-chart" size={16} color="#f8fafc" />
                                <Text className="text-text text-[10px] font-black uppercase tracking-widest mt-1" numberOfLines={1} adjustsFontSizeToFit>Historial</Text>
                            </TouchableOpacity>
                        </View>
                    </Card>
                </View>

                {/* Sets Table */}
                <View className="px-4 py-2">
                    <View className="flex-row justify-between items-center mb-4 px-1">
                        <Text className="text-text font-black text-lg uppercase tracking-widest">Series</Text>
                        <View className="flex-row items-center gap-2 bg-success/10 px-3 py-1 rounded-full border border-success/20">
                            <Icon name="checkmark-circle" size={14} variant="success" />
                            <Text className="text-success text-[10px] font-black uppercase tracking-widest">
                                {currentExercise.sets.filter(s => s.completed).length} completadas
                            </Text>
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
                        />
                    ))}

                    <TouchableOpacity
                        onPress={() => addExtraSet(currentExerciseIndex)}
                        className="mt-4 bg-primary/10 border-2 border-dashed border-primary/30 py-3.5 rounded-2xl flex-row items-center justify-center gap-2 active:bg-primary/20"
                        activeOpacity={0.7}
                    >
                        <Icon name="add" size={22} variant="primary" />
                        <Text className="text-primary font-black text-sm uppercase tracking-widest">Añadir Set</Text>
                    </TouchableOpacity>
                </View>

                {/* AI Technique Analysis */}
                <View className="px-4 py-2">
                    <View className="flex-row items-center mb-3 px-1">
                        <View className="bg-secondary/20 p-1.5 rounded-full mr-2">
                            <Icon name="sparkles" size={12} variant="secondary" />
                        </View>
                        <Text className="text-secondary text-xs font-black uppercase tracking-widest">Análisis Técnica Mambo Coach</Text>
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
                                <Text
                                    className="text-secondary font-black text-sm uppercase tracking-widest mb-1"
                                    numberOfLines={1}
                                    adjustsFontSizeToFit
                                >
                                    Subir Video para Análisis
                                </Text>
                                <Text className="text-text-secondary text-xs text-center px-4 leading-relaxed">
                                    Nuestra IA analizará tu forma y te dará recomendaciones personalizadas
                                </Text>
                            </TouchableOpacity>
                        ) : (
                            <View>
                                <View className="flex-row items-center justify-between mb-3">
                                    <View className="flex-row items-center gap-2">
                                        <Icon name="checkmark-circle" size={20} variant="secondary" />
                                        <Text className="text-text font-black uppercase tracking-widest text-xs">Video Registrado</Text>
                                    </View>
                                    <TouchableOpacity onPress={pickVideo}>
                                        <Text className="text-secondary text-[10px] font-black uppercase tracking-widest">Cambiar Video</Text>
                                    </TouchableOpacity>
                                </View>

                                {isAnalyzing ? (
                                    <View className="items-center py-4">
                                        <Text className="text-secondary animate-pulse font-black uppercase tracking-widest text-xs">IA Analizando técnica...</Text>
                                    </View>
                                ) : techniqueFeedback ? (
                                    <View className="bg-secondary/10 p-3 rounded-xl border border-secondary/20">
                                        <Text className="text-secondary text-sm italic">
                                            &quot;{techniqueFeedback}&quot;
                                        </Text>
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
                    <Text className="text-text-secondary text-[10px] font-black uppercase tracking-widest mb-2 px-1">Progreso de Fuerza</Text>
                    <Card variant="glass" className="p-4 border-white/5">
                        <Text className="text-text-secondary text-[10px] font-black uppercase tracking-widest mb-3">Últimas 4 sesiones</Text>
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
                                        <Text className="text-[8px] text-text-muted font-black mt-1">
                                            {workout.endTime.getDate()}/{workout.endTime.getMonth() + 1}
                                        </Text>
                                    </View>
                                );
                            })}
                        </View>
                    </Card>
                </View>

                {/* Exercise Note */}
                <View className="px-4 py-2">
                    <Text className="text-text-secondary text-[10px] font-black uppercase tracking-widest mb-2 px-1">Notas del Ejercicio</Text>
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
                        <Text className="text-text-secondary text-[10px] font-black uppercase tracking-widest">Descanso entre series</Text>
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
                                <Text className={`text-center font-black text-[10px] uppercase tracking-widest ${currentExercise.restTime === seconds ? 'text-white' : 'text-text-muted'
                                    }`}>
                                    {seconds / 60} min
                                </Text>
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
                        <Icon name="chevron-back" size={20} color={currentExerciseIndex === 0 ? "#64748b" : "#f8fafc"} />
                        <Text className={`font-black text-sm uppercase tracking-widest ${currentExerciseIndex === 0 ? 'text-text-muted' : 'text-text'
                            }`}>Anterior</Text>
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
                        <Text className={`font-black text-sm uppercase tracking-widest ${currentExerciseIndex === exercises.length - 1 ? 'text-text-muted' : 'text-white'
                            }`}>Siguiente</Text>
                        <Icon name="chevron-forward" size={20} color={currentExerciseIndex === exercises.length - 1 ? "#64748b" : "#ffffff"} />
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <RestTimer />
        </ScreenWrapper>
    );
}
