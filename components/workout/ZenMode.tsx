import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { useActiveWorkoutStore } from '@/store/activeWorkoutStore';
import { useUIStore } from '@/store/uiStore';
import { Icon } from '../ui/Icon';
import { Colors } from '@/constants/Colors';
import { GestureDetector, Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    runOnJS,
    interpolate,
    Extrapolate
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function ZenMode() {
    const {
        exercises,
        currentExerciseIndex,
        goToNextExercise,
        goToPreviousExercise,
        updateSet,
        toggleSetCompletion,
        activeRestTimer,
        stopRestTimer,
        removeSet,
        toggleZenMode
    } = useActiveWorkoutStore();
    const { showToast } = useUIStore();

    const currentExercise = exercises[currentExerciseIndex];

    // Find the first incomplete set, or the last set if all are complete
    const currentSetIndex = currentExercise.sets.findIndex(s => !s.completed);
    const activeSetIndex = currentSetIndex !== -1 ? currentSetIndex : currentExercise.sets.length - 1;
    const currentSet = currentExercise.sets[activeSetIndex];

    const translateX = useSharedValue(0);
    const opacity = useSharedValue(1);

    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            translateX.value = event.translationX;
            opacity.value = interpolate(
                Math.abs(event.translationX),
                [0, width / 2],
                [1, 0.5],
                Extrapolate.CLAMP
            );
        })
        .onEnd((event) => {
            if (event.translationX < -width / 4 && currentExerciseIndex < exercises.length - 1) {
                translateX.value = withSpring(-width, {}, () => {
                    runOnJS(goToNextExercise)();
                    translateX.value = 0;
                    opacity.value = 1;
                });
            } else if (event.translationX > width / 4 && currentExerciseIndex > 0) {
                translateX.value = withSpring(width, {}, () => {
                    runOnJS(goToPreviousExercise)();
                    translateX.value = 0;
                    opacity.value = 1;
                });
            } else {
                translateX.value = withSpring(0);
                opacity.value = withSpring(1);
            }
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
        opacity: opacity.value
    }));

    const [weight, setWeight] = useState(currentSet.weight > 0 ? currentSet.weight.toString() : '');
    const [reps, setReps] = useState(currentSet.reps > 0 ? currentSet.reps.toString() : '');
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        if (activeRestTimer.isRunning && activeRestTimer.startTime) {
            const updateTimer = () => {
                const elapsed = (Date.now() - activeRestTimer.startTime!) / 1000;
                const remaining = Math.max(0, Math.ceil(activeRestTimer.duration - elapsed));
                setTimeLeft(remaining);
            };

            updateTimer();
            const interval = setInterval(updateTimer, 1000);
            return () => clearInterval(interval);
        } else {
            setTimeLeft(0);
        }
    }, [activeRestTimer.isRunning, activeRestTimer.startTime, activeRestTimer.duration]);

    useEffect(() => {
        setWeight(currentSet.weight > 0 ? currentSet.weight.toString() : '');
        setReps(currentSet.reps > 0 ? currentSet.reps.toString() : '');
    }, [currentSet.id, currentSet.weight, currentSet.reps]);

    const handleUpdate = () => {
        const w = parseFloat(weight) || 0;
        const r = parseInt(reps) || 0;
        updateSet(currentExerciseIndex, currentSet.id, { weight: w, reps: r, rir: currentSet.rir });
    };

    const handleToggle = () => {
        const w = parseFloat(weight) || 0;
        const r = parseInt(reps) || 0;

        if (w <= 0 || r <= 0) {
            showToast('Ingresa peso y reps', 'error');
            return;
        }

        // Sync local state to store first
        updateSet(currentExerciseIndex, currentSet.id, { weight: w, reps: r, rir: currentSet.rir });

        // Then toggle completion
        toggleSetCompletion(currentExerciseIndex, currentSet.id);
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View className="flex-1 bg-black">
                    {/* Minimalist Header */}
                    <View className="flex-row justify-between items-center px-6 pt-12 pb-4">
                        <TouchableOpacity
                            onPress={toggleZenMode}
                            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                            className="w-10 h-10 items-center justify-center rounded-full bg-white/5"
                        >
                            <Icon name="close" size={20} color="white" />
                        </TouchableOpacity>
                        <Text className="text-white/20 font-black text-[10px] uppercase tracking-[4px]">Zen Mode</Text>
                        <TouchableOpacity
                            onPress={() => {
                                if (currentExercise.sets.length > 1) {
                                    removeSet(currentExerciseIndex, currentSet.id);
                                } else {
                                    showToast('No puedes eliminar la única serie', 'warning');
                                }
                            }}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            className="w-10 h-10 items-center justify-center rounded-full bg-white/5"
                        >
                            <Icon name="trash-outline" size={20} color="#ef4444" />
                        </TouchableOpacity>
                    </View>

                    <GestureDetector gesture={panGesture}>
                        <Animated.View style={[{ flex: 1 }, animatedStyle]} className="justify-center items-center px-8">
                            <Text className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">
                                {currentExercise.muscleGroup}
                            </Text>
                            <Text className="text-white text-4xl font-black text-center mb-16 leading-tight">
                                {currentExercise.exerciseName}
                            </Text>

                            <View className="w-full flex-row justify-center gap-12 mb-16">
                                <View className="items-center">
                                    <Text className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-4">Peso</Text>
                                    <TextInput
                                        className="text-white text-7xl font-black text-center min-w-[140px]"
                                        keyboardType="decimal-pad"
                                        value={weight}
                                        onChangeText={setWeight}
                                        onBlur={handleUpdate}
                                        placeholder="0"
                                        placeholderTextColor="#1a1a1a"
                                        selectTextOnFocus
                                    />
                                    <Text className="text-white/20 text-xs font-bold mt-2">KG</Text>
                                </View>
                                <View className="items-center">
                                    <Text className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-4">Reps</Text>
                                    <TextInput
                                        className="text-white text-7xl font-black text-center min-w-[100px]"
                                        keyboardType="number-pad"
                                        value={reps}
                                        onChangeText={setReps}
                                        onBlur={handleUpdate}
                                        placeholder="0"
                                        placeholderTextColor="#1a1a1a"
                                        selectTextOnFocus
                                    />
                                    <Text className="text-white/20 text-xs font-bold mt-2">REPS</Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={handleToggle}
                                className={`w-28 h-28 rounded-full items-center justify-center border-4 ${currentSet.completed ? 'bg-success border-success' : 'border-white/10'}`}
                                activeOpacity={0.7}
                            >
                                <Icon
                                    name={currentSet.completed ? "checkmark-sharp" : "play-sharp"}
                                    size={48}
                                    color="white"
                                />
                            </TouchableOpacity>
                            <Text className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-4">
                                {currentSet.completed ? 'Serie Completada' : 'Marcar Serie'}
                            </Text>

                            {activeRestTimer.isRunning && (
                                <TouchableOpacity
                                    onPress={stopRestTimer}
                                    className="mt-12 items-center"
                                    activeOpacity={0.7}
                                >
                                    <Text className="text-primary text-6xl font-black">
                                        {timeLeft}
                                    </Text>
                                    <Text className="text-primary/60 text-[10px] font-black uppercase tracking-[4px] mt-1">Descansando</Text>
                                    <View className="bg-white/5 px-3 py-1 rounded-full mt-4">
                                        <Text className="text-white/30 text-[8px] font-black uppercase tracking-widest">Saltar Descanso</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                        </Animated.View>
                    </GestureDetector>

                    {/* Minimalist Footer */}
                    <View className="pb-12 items-center">
                        <View className="flex-row gap-1.5 mb-4">
                            {currentExercise.sets.map((s, i) => (
                                <View
                                    key={s.id}
                                    className={`w-1.5 h-1.5 rounded-full ${i === activeSetIndex ? 'bg-white' : s.completed ? 'bg-success' : 'bg-white/10'}`}
                                />
                            ))}
                        </View>
                        <Text className="text-white/20 text-[10px] font-black uppercase tracking-widest">
                            Serie {activeSetIndex + 1} de {currentExercise.sets.length}
                        </Text>

                    </View>

                    {/* Subtle Background Progress for Rest Timer */}
                    {
                        activeRestTimer.isRunning && (() => {
                            const elapsed = (Date.now() - (activeRestTimer.startTime || 0)) / 1000;
                            const progress = Math.min(elapsed / activeRestTimer.duration, 1);
                            return (
                                <View className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
                                    <View
                                        className="h-full bg-primary"
                                        style={{ width: `${(timeLeft / activeRestTimer.duration) * 100}%` }}
                                    />
                                </View>
                            );
                        })()
                    }
                </View >
            </KeyboardAvoidingView >
        </GestureHandlerRootView >
    );
}
