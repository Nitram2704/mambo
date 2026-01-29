import React, { useState, useMemo } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { analyzeWeeklyProgress, applyAdjustment, WellnessData, AnalysisResult } from '@/utils/adaptiveService';
import { useSleepStore } from '@/store/sleepStore';
import { useWeeklyScheduleStore } from '@/store/weeklyScheduleStore';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';

interface WeeklyCheckinModalProps {
    visible: boolean;
    onClose: () => void;
    isDeloadWeek?: boolean;
}

export default function WeeklyCheckinModal({ visible, onClose, isDeloadWeek = false }: WeeklyCheckinModalProps) {
    const [step, setStep] = useState<'quiz' | 'results'>('quiz');
    const [stressLevel, setStressLevel] = useState(3);
    const [energyLevel, setEnergyLevel] = useState(3);
    const [mood, setMood] = useState(3);
    const [domsLevel, setDomsLevel] = useState(2);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [loading, setLoading] = useState(false);
    const { theme } = useAppTheme();
    const isDark = theme === 'dark';

    // Fetch workout schedule
    const { schedule } = useWeeklyScheduleStore();

    // Calculate weekly workout progress
    const weeklyProgress = useMemo(() => {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const monday = new Date(today);
        monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
        monday.setHours(0, 0, 0, 0);

        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);

        const weekWorkouts = schedule.filter(w => {
            const workoutDate = new Date(w.date);
            return workoutDate >= monday && workoutDate <= sunday;
        });

        const scheduled = weekWorkouts.length;
        const completed = weekWorkouts.filter(w => w.completed).length;
        const percentage = scheduled > 0 ? Math.round((completed / scheduled) * 100) : 0;

        return { scheduled, completed, percentage };
    }, [schedule]);

    // Fetch last night's sleep
    const sleepLogs = useSleepStore((state) => state.sleepLogs);
    const lastNightSleep = useMemo(() => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        const log = sleepLogs[yesterdayStr];
        if (log) {
            const hours = log.duration / 60; // Convert minutes to hours
            return Math.round(hours * 10) / 10; // Round to 1 decimal
        }
        return 7; // Default to 7 hours if no data
    }, [sleepLogs]);

    const getEmojiForLevel = (level: number, type: 'stress' | 'energy' | 'mood' | 'doms') => {
        if (type === 'stress') {
            const emojis = ['😌', '🙂', '😐', '😰', '🤯'];
            return emojis[level - 1];
        } else if (type === 'energy') {
            const emojis = ['😴', '🥱', '😊', '💪', '⚡'];
            return emojis[level - 1];
        } else if (type === 'mood') {
            const emojis = ['😢', '😕', '😐', '😊', '😄'];
            return emojis[level - 1];
        } else {
            const emojis = ['😊', '🙂', '😐', '😣', '🤕'];
            return emojis[level - 1];
        }
    };

    const handleAnalyze = async () => {
        setLoading(true);
        try {
            const wellnessData: WellnessData = {
                stressLevel,
                energyLevel,
                mood,
                domsLevel,
                sleepHours: lastNightSleep
            };

            const result = await analyzeWeeklyProgress(wellnessData, isDeloadWeek);
            setAnalysisResult(result);
            setStep('results');
        } catch (error) {
            Alert.alert('Error', 'No se pudo analizar tu progreso. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const handleApplyAdjustment = async () => {
        if (!analysisResult) return;

        try {
            const message = await applyAdjustment(
                analysisResult.recommendation,
                analysisResult.suggestedRirAdjustment
            );
            Alert.alert('¡Ajuste Aplicado!', message, [
                {
                    text: 'OK', onPress: () => {
                        onClose();
                        resetModal();
                    }
                }
            ]);
        } catch (error) {
            Alert.alert('Error', 'No se pudo aplicar el ajuste.');
        }
    };

    const resetModal = () => {
        setStep('quiz');
        setStressLevel(3);
        setEnergyLevel(3);
        setMood(3);
        setDomsLevel(2);
        setAnalysisResult(null);
    };

    const handleClose = () => {
        onClose();
        resetModal();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View className="flex-1 bg-black/60 justify-end">
                <View
                    className="rounded-t-3xl max-h-[85%]"
                    style={{ backgroundColor: Colors[theme].background }}
                >
                    {step === 'quiz' ? (
                        <ScrollView className="p-6">
                            <View className="flex-row justify-between items-center mb-6">
                                <Text className="text-2xl font-bold" style={{ color: Colors[theme].text }}>Check-in Semanal</Text>
                                <TouchableOpacity onPress={handleClose}>
                                    <Ionicons name="close" size={28} color={Colors[theme].text} />
                                </TouchableOpacity>
                            </View>

                            <Text className="mb-4" style={{ color: Colors[theme].textSecondary }}>
                                Antes de ver los números, cuéntame cómo te sientes esta semana:
                            </Text>

                            {/* Weekly Workout Progress */}
                            {weeklyProgress.scheduled > 0 && (
                                <View
                                    className="border rounded-xl p-4 mb-4"
                                    style={{
                                        backgroundColor: isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.05)',
                                        borderColor: 'rgba(34, 197, 94, 0.3)'
                                    }}
                                >
                                    <View className="flex-row justify-between items-center mb-2">
                                        <View className="flex-row items-center">
                                            <Ionicons name="barbell" size={20} color="#22c55e" />
                                            <Text className="text-green-500 ml-2 font-bold">Progreso Semanal</Text>
                                        </View>
                                        <Text className="text-green-500 font-bold">
                                            {weeklyProgress.completed}/{weeklyProgress.scheduled}
                                        </Text>
                                    </View>
                                    <View className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: isDark ? '#374151' : '#e5e7eb' }}>
                                        <View
                                            className="bg-green-500 h-full rounded-full"
                                            style={{ width: `${weeklyProgress.percentage}%` }}
                                        />
                                    </View>
                                    <Text className="text-xs mt-2 text-center" style={{ color: Colors[theme].textSecondary }}>
                                        {weeklyProgress.percentage === 100
                                            ? '🎉 ¡Completaste todos tus entrenamientos!'
                                            : weeklyProgress.percentage >= 50
                                                ? '💪 ¡Vas muy bien!'
                                                : '🚀 ¡Sigue adelante!'}
                                    </Text>
                                </View>
                            )}

                            {/* Sleep Info */}
                            <View
                                className="border rounded-xl p-3 mb-6"
                                style={{
                                    backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
                                    borderColor: 'rgba(59, 130, 246, 0.3)'
                                }}
                            >
                                <View className="flex-row items-center">
                                    <Ionicons name="moon" size={20} color="#60a5fa" />
                                    <Text className="text-blue-500 ml-2 font-bold">Anoche dormiste: {lastNightSleep}h</Text>
                                </View>
                            </View>

                            {/* Stress Level */}
                            <View className="mb-8">
                                <View className="flex-row justify-between items-center mb-3">
                                    <Text className="font-bold text-lg" style={{ color: Colors[theme].text }}>🧠 Nivel de Estrés</Text>
                                    <Text className="text-4xl animate-jelly">{getEmojiForLevel(stressLevel, 'stress')}</Text>
                                </View>
                                <Slider
                                    minimumValue={1}
                                    maximumValue={5}
                                    step={1}
                                    value={stressLevel}
                                    onValueChange={setStressLevel}
                                    minimumTrackTintColor="#ef4444"
                                    maximumTrackTintColor={isDark ? '#374151' : '#e5e7eb'}
                                    thumbTintColor="#ef4444"
                                />
                                <View className="flex-row justify-between mt-2">
                                    <Text className="text-xs" style={{ color: Colors[theme].textSecondary }}>Relajado</Text>
                                    <Text className="text-xs" style={{ color: Colors[theme].textSecondary }}>Muy Estresado</Text>
                                </View>
                            </View>

                            {/* Energy Level */}
                            <View className="mb-8">
                                <View className="flex-row justify-between items-center mb-3">
                                    <Text className="font-bold text-lg" style={{ color: Colors[theme].text }}>⚡ Nivel de Energía</Text>
                                    <Text className="text-4xl animate-jelly">{getEmojiForLevel(energyLevel, 'energy')}</Text>
                                </View>
                                <Slider
                                    minimumValue={1}
                                    maximumValue={5}
                                    step={1}
                                    value={energyLevel}
                                    onValueChange={setEnergyLevel}
                                    minimumTrackTintColor="#10b981"
                                    maximumTrackTintColor={isDark ? '#374151' : '#e5e7eb'}
                                    thumbTintColor="#10b981"
                                />
                                <View className="flex-row justify-between mt-2">
                                    <Text className="text-xs" style={{ color: Colors[theme].textSecondary }}>Agotado</Text>
                                    <Text className="text-xs" style={{ color: Colors[theme].textSecondary }}>Lleno de Energía</Text>
                                </View>
                            </View>

                            {/* Mood */}
                            <View className="mb-8">
                                <View className="flex-row justify-between items-center mb-3">
                                    <Text className="font-bold text-lg" style={{ color: Colors[theme].text }}>😌 Estado de Ánimo</Text>
                                    <Text className="text-4xl animate-jelly">{getEmojiForLevel(mood, 'mood')}</Text>
                                </View>
                                <Slider
                                    minimumValue={1}
                                    maximumValue={5}
                                    step={1}
                                    value={mood}
                                    onValueChange={setMood}
                                    minimumTrackTintColor="#3b82f6"
                                    maximumTrackTintColor={isDark ? '#374151' : '#e5e7eb'}
                                    thumbTintColor="#3b82f6"
                                />
                                <View className="flex-row justify-between mt-2">
                                    <Text className="text-xs" style={{ color: Colors[theme].textSecondary }}>Mal</Text>
                                    <Text className="text-xs" style={{ color: Colors[theme].textSecondary }}>Excelente</Text>
                                </View>
                            </View>

                            {/* DOMS Level */}
                            <View className="mb-8">
                                <View className="flex-row justify-between items-center mb-3">
                                    <Text className="font-bold text-lg" style={{ color: Colors[theme].text }}>💪 Dolor Muscular (DOMS)</Text>
                                    <Text className="text-4xl animate-jelly">{getEmojiForLevel(domsLevel, 'doms')}</Text>
                                </View>
                                <Slider
                                    minimumValue={1}
                                    maximumValue={5}
                                    step={1}
                                    value={domsLevel}
                                    onValueChange={setDomsLevel}
                                    minimumTrackTintColor="#f59e0b"
                                    maximumTrackTintColor={isDark ? '#374151' : '#e5e7eb'}
                                    thumbTintColor="#f59e0b"
                                />
                                <View className="flex-row justify-between mt-2">
                                    <Text className="text-xs" style={{ color: Colors[theme].textSecondary }}>Sin Dolor</Text>
                                    <Text className="text-xs" style={{ color: Colors[theme].textSecondary }}>Muy Adolorido</Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={handleAnalyze}
                                disabled={loading}
                                className="bg-blue-600 py-4 rounded-2xl items-center mt-4"
                            >
                                <Text className="text-white font-bold text-lg">
                                    {loading ? 'Analizando...' : 'Analizar Mi Progreso'}
                                </Text>
                            </TouchableOpacity>
                        </ScrollView>
                    ) : (
                        <ScrollView className="p-6">
                            <View className="flex-row justify-between items-center mb-6">
                                <Text className="text-2xl font-bold" style={{ color: Colors[theme].text }}>Tu Reporte Holístico</Text>
                                <TouchableOpacity onPress={handleClose}>
                                    <Ionicons name="close" size={28} color={Colors[theme].text} />
                                </TouchableOpacity>
                            </View>

                            {analysisResult && (
                                <>
                                    {/* Message */}
                                    <View className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 mb-6 animate-fade-in-up">
                                        <Text className="text-blue-400 text-base leading-6">
                                            {analysisResult.message}
                                        </Text>
                                    </View>

                                    {/* Stats */}
                                    <View className="flex-row gap-3 mb-6 animate-fade-in-up animate-delay-100">
                                        <View
                                            className="flex-1 rounded-xl p-4 items-center"
                                            style={{ backgroundColor: isDark ? 'rgba(31, 41, 55, 0.5)' : '#f3f4f6' }}
                                        >
                                            <Text className="text-xs mb-1" style={{ color: Colors[theme].textSecondary }}>Cumplimiento</Text>
                                            <Text className="font-bold text-2xl" style={{ color: Colors[theme].text }}>
                                                {Math.round(analysisResult.completionRate * 100)}%
                                            </Text>
                                        </View>
                                        <View
                                            className="flex-1 rounded-xl p-4 items-center"
                                            style={{ backgroundColor: isDark ? 'rgba(31, 41, 55, 0.5)' : '#f3f4f6' }}
                                        >
                                            <Text className="text-xs mb-1" style={{ color: Colors[theme].textSecondary }}>Progresión</Text>
                                            <Text className="font-bold text-2xl" style={{ color: Colors[theme].text }}>
                                                {Math.round(analysisResult.progressionRate * 100)}%
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Wellness Summary */}
                                    <View
                                        className="rounded-2xl p-4 mb-6 animate-fade-in-up animate-delay-200"
                                        style={{ backgroundColor: isDark ? 'rgba(31, 41, 55, 0.5)' : '#f3f4f6' }}
                                    >
                                        <Text className="font-bold mb-3" style={{ color: Colors[theme].text }}>Estado General</Text>
                                        <View className="flex-row justify-between mb-2">
                                            <Text style={{ color: Colors[theme].textSecondary }}>Sueño</Text>
                                            <Text style={{ color: Colors[theme].text }}>{analysisResult.wellnessFactor.sleep}h</Text>
                                        </View>
                                        <View className="flex-row justify-between mb-2">
                                            <Text style={{ color: Colors[theme].textSecondary }}>Dolor Muscular</Text>
                                            <Text style={{ color: Colors[theme].text }}>{analysisResult.wellnessFactor.doms}/5</Text>
                                        </View>
                                        <View className="flex-row justify-between mb-2">
                                            <Text style={{ color: Colors[theme].textSecondary }}>Estrés</Text>
                                            <Text style={{ color: Colors[theme].text }}>{analysisResult.wellnessFactor.stress}/5</Text>
                                        </View>
                                        <View className="flex-row justify-between mb-2">
                                            <Text style={{ color: Colors[theme].textSecondary }}>Energía</Text>
                                            <Text style={{ color: Colors[theme].text }}>{analysisResult.wellnessFactor.energy}/5</Text>
                                        </View>
                                        <View className="flex-row justify-between">
                                            <Text style={{ color: Colors[theme].textSecondary }}>Ánimo</Text>
                                            <Text style={{ color: Colors[theme].text }}>{analysisResult.wellnessFactor.mood}/5</Text>
                                        </View>
                                    </View>

                                    {/* Action Button */}
                                    {analysisResult.recommendation !== 'maintain' && (
                                        <TouchableOpacity
                                            onPress={handleApplyAdjustment}
                                            className="bg-green-600 py-4 rounded-2xl items-center mb-4"
                                        >
                                            <Text className="text-white font-bold text-lg">Aplicar Ajuste Recomendado</Text>
                                        </TouchableOpacity>
                                    )}

                                    <TouchableOpacity
                                        onPress={handleClose}
                                        className="bg-gray-800 py-4 rounded-2xl items-center"
                                    >
                                        <Text className="text-white font-bold">Cerrar</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </ScrollView>
                    )}
                </View>
            </View>
        </Modal>
    );
}
