import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Modal, Dimensions, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAssistantStore } from '@/store/assistantStore';
import { askAssistant } from '@/utils/aiService';
import { useUserProfileStore } from '@/store/userProfileStore';
import { useWeeklyScheduleStore } from '@/store/weeklyScheduleStore';
import { useSavedRoutinesStore } from '@/store/savedRoutinesStore';
import { useActiveWorkoutStore } from '@/store/activeWorkoutStore';
import * as Speech from 'expo-speech';
import { LinearGradient } from 'expo-linear-gradient';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { ActionCard } from '@/components/ui/ActionCard';
import Animated, { FadeInUp, useSharedValue, useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';
import * as ImagePicker from 'expo-image-picker';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { FactService } from '@/utils/factService';
import { supabase } from '@/lib/supabase';
import { AccessibleText } from './ui/AccessibleText';

export function AssistantChat() {
    const { t } = useTranslation();
    const { theme, isDark } = useAppTheme();
    const [input, setInput] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);
    const router = useRouter();
    const { messages, addMessage, isLoading, setLoading, setVisible, clearHistory, isVisible } = useAssistantStore();
    const { profile } = useUserProfileStore();
    const [activeTab, setActiveTab] = useState<'chat' | 'agenda'>('chat');
    const { getWorkoutsForDate, schedule } = useWeeklyScheduleStore();
    const { routine: activeRoutine, exercises: activeExercises } = useActiveWorkoutStore();
    const { subscription } = useSubscriptionStore();
    const currentTier = subscription?.tier_id || 'STARTER';
    const [userFacts, setUserFacts] = useState<string[]>([]);

    useEffect(() => {
        if (currentTier === 'ELITE' && profile?.id) {
            loadUserFacts();
        }
    }, [currentTier, profile?.id]);

    const loadUserFacts = async () => {
        if (!profile?.id) return;
        const facts = await FactService.getUserFacts(profile.id);
        setUserFacts(facts.map(f => f.fact));
    };

    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return d;
    });
    const [selectedRoutineId, setSelectedRoutineId] = useState<string | null>(null);
    const { routines } = useSavedRoutinesStore();

    const selectedRoutine = routines.find(r => r.id === selectedRoutineId);

    // Draggable Logic for Bubble
    const bubbleX = useSharedValue(0);
    const bubbleY = useSharedValue(0);
    const bubbleContextX = useSharedValue(0);
    const bubbleContextY = useSharedValue(0);

    const bubblePan = Gesture.Pan()
        .onStart(() => {
            bubbleContextX.value = bubbleX.value;
            bubbleContextY.value = bubbleY.value;
        })
        .onUpdate((event) => {
            bubbleX.value = event.translationX + bubbleContextX.value;
            bubbleY.value = event.translationY + bubbleContextY.value;
        });

    const bubbleStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: bubbleX.value },
                { translateY: bubbleY.value },
            ],
        };
    });

    // Draggable Logic for Window
    const windowX = useSharedValue(0);
    const windowY = useSharedValue(0);
    const windowContextX = useSharedValue(0);
    const windowContextY = useSharedValue(0);

    const windowPan = Gesture.Pan()
        .onStart(() => {
            windowContextX.value = windowX.value;
            windowContextY.value = windowY.value;
        })
        .onUpdate((event) => {
            windowX.value = event.translationX + windowContextX.value;
            windowY.value = event.translationY + windowContextY.value;
        });

    const windowStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: windowX.value },
                { translateY: windowY.value },
            ],
        };
    });

    const handleSend = async (text: string, imageBase64?: string) => {
        if (!text.trim() && !imageBase64) return;

        const userMessage = text.trim();
        if (userMessage) addMessage(userMessage, 'user');
        setInput('');
        setLoading(true);

        try {
            const context = {
                name: 'Usuario',
                weight: profile?.weight,
                height: profile?.height,
                goal: profile?.objective,
                calories: profile?.calorieGoal,
                macros: {
                    protein: profile?.proteinGoal || 0,
                    carbs: profile?.carbsGoal || 0,
                    fats: profile?.fatsGoal || 0,
                },
                activeWorkout: activeRoutine ? {
                    name: activeRoutine.name,
                    exercises: activeExercises.map(e => e.exerciseName)
                } : null,
                savedRoutines: routines.map(r => ({ id: r.id, name: r.name, exercises: r.exercises.map(e => e.name) })),
                tier: currentTier,
                coachStyle: profile?.coachStyle,
                userFacts: currentTier === 'ELITE' ? userFacts : []
            };

            const { response, transcription } = await askAssistant(userMessage, context, messages, undefined, imageBase64);
            addMessage(response, 'assistant');

            // 🧠 RAG Memory: Extract facts from user message (Elite only)
            const textToProcess = transcription || userMessage;
            if (currentTier === 'ELITE' && profile?.id && textToProcess) {
                FactService.processMessage(profile.id, textToProcess).then(() => {
                    loadUserFacts(); // Refresh facts for next turn
                });
            }
        } catch (error) {
            console.error('Assistant Error:', error);
            addMessage('Lo siento, hubo un error al procesar tu solicitud.', 'assistant');
        } finally {
            setLoading(false);
        }
    };

    const handlePickImage = async () => {
        if (currentTier !== 'ELITE') {
            Alert.alert('Elite Only', 'La visión nutricional solo está disponible para usuarios ELITE.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled && result.assets[0].base64) {
            handleSend("Analiza esta comida por favor", result.assets[0].base64);
        }
    };

    const { isRecording, startRecording, stopRecording } = useVoiceInput();

    const handleMicPress = async () => {
        if (isRecording) {
            try {
                const result = await stopRecording();
                console.log('Voice recording result:', result ? 'success' : 'null');

                if (result && result.base64) {
                    setLoading(true);

                    const context = {
                        name: 'Usuario',
                        weight: profile?.weight,
                        height: profile?.height,
                        goal: profile?.objective,
                        calories: profile?.calorieGoal,
                        macros: {
                            protein: profile?.proteinGoal || 0,
                            carbs: profile?.carbsGoal || 0,
                            fats: profile?.fatsGoal || 0,
                        },
                        activeWorkout: activeRoutine ? {
                            name: activeRoutine.name,
                            exercises: activeExercises.map(e => e.exerciseName)
                        } : null,
                        tier: currentTier,
                        coachStyle: profile?.coachStyle,
                        userFacts: currentTier === 'ELITE' ? userFacts : []
                    };

                    const { response, transcription } = await askAssistant('', context, messages, result.base64);
                    addMessage(response, 'assistant');

                    // 🧠 RAG Memory: Extract facts from transcribed text (Elite only)
                    if (currentTier === 'ELITE' && profile?.id && transcription) {
                        FactService.processMessage(profile.id, transcription).then(() => {
                            loadUserFacts();
                        });
                    }
                    setLoading(false);
                } else {
                    addMessage(t('assistant.errorVoice'), 'assistant');
                }
            } catch (error) {
                console.error('Error in voice processing:', error);
                addMessage(t('assistant.errorVoiceMessage'), 'assistant');
                setLoading(false);
            }
        } else {
            try {
                await startRecording();
            } catch (error) {
                console.error('Error starting recording:', error);
                addMessage(t('assistant.errorVoiceStart'), 'assistant');
            }
        }
    };

    const speak = (text: string) => {
        if (isSpeaking) {
            Speech.stop();
            setIsSpeaking(false);
        } else {
            setIsSpeaking(true);
            Speech.speak(text, {
                language: 'es-ES',
                onDone: () => setIsSpeaking(false),
                onStopped: () => setIsSpeaking(false),
            });
        }
    };

    useEffect(() => {
        if (messages.length === 0) {
            const objectiveText = profile?.objective === 'bulking' ? 'volumen' : 'definición';
            const welcomeMessage = t('assistant.welcome', { goal: objectiveText });
            addMessage(welcomeMessage, 'assistant');
        }
    }, []);

    useEffect(() => {
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, [messages]);

    // Scroll to end when chat becomes visible
    useEffect(() => {
        if (isVisible && !isMinimized && activeTab === 'chat') {
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: false });
            }, 300);
        }
    }, [isVisible, isMinimized, activeTab]);

    const renderWeeklyPlan = () => (
        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
            <View className="flex-row justify-between items-end mb-6">
                <View className="flex-1">
                    <AccessibleText variant="h2" weight="bold" className="text-2xl font-bold" style={{ color: Colors[theme].text }}>{t('assistant.weeklyAgenda')}</AccessibleText>
                    <AccessibleText className="text-sm" style={{ color: Colors[theme].textSecondary }}>{t('assistant.agendaSubtitle')}</AccessibleText>
                </View>
                <TouchableOpacity
                    onPress={() => {
                        setVisible(false);
                        router.push('/workout/schedule');
                    }}
                    className="px-3 py-2 rounded-xl border"
                    style={{ backgroundColor: Colors[theme].primary + '20', borderColor: Colors[theme].primary + '30' }}
                    accessibilityRole="button"
                    accessibilityLabel={t('assistant.viewAll')}
                >
                    <AccessibleText className="font-bold text-xs" style={{ color: Colors[theme].primary }}>{t('assistant.viewAll')}</AccessibleText>
                </TouchableOpacity>
            </View>

            {weekDays.map((date) => {
                const dateKey = date.toISOString().split('T')[0];
                const workouts = getWorkoutsForDate(dateKey);
                const isToday = dateKey === new Date().toISOString().split('T')[0];
                const dayName = date.toLocaleDateString(undefined, { weekday: 'long' });

                return (
                    <View key={dateKey} className="mb-4">
                        <LinearGradient
                            colors={isToday
                                ? [Colors[theme].primary + '33', Colors[theme].primary + '1A']
                                : isDark ? ['rgba(31, 41, 55, 0.6)', 'rgba(17, 24, 39, 0.8)'] : [Colors[theme].surface, Colors[theme].surfaceHighlight]}
                            className={`rounded-2xl p-4 border ${isToday ? '' : 'border-white/5'}`}
                            style={isToday ? { borderColor: Colors[theme].primary + '80' } : { borderColor: Colors[theme].border }}
                        >
                            <View className="flex-row items-center justify-between">
                                <View className="flex-1">
                                    <View className="flex-row items-center mb-1">
                                        <AccessibleText weight="bold" className="font-bold text-lg capitalize mr-2" style={{ color: Colors[theme].text }}>{dayName}</AccessibleText>
                                        {isToday && (
                                            <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: Colors[theme].primary }}>
                                                <AccessibleText weight="bold" className="text-white text-[10px] font-bold">{t('common.today')}</AccessibleText>
                                            </View>
                                        )}
                                    </View>

                                    {workouts.length > 0 ? (
                                        workouts.map((w, idx) => {
                                            const routine = routines.find(r => r.id === w.routineId);
                                            return (
                                                <View key={w.id} className={idx > 0 ? 'mt-2 border-t pt-2' : ''} style={{ borderTopColor: Colors[theme].border }}>
                                                    <AccessibleText weight="medium" className="font-medium text-sm" style={{ color: Colors[theme].primary }}>
                                                        {routine?.name || w.routineName}
                                                    </AccessibleText>
                                                    <AccessibleText className="text-xs" style={{ color: Colors[theme].textMuted }}>
                                                        {routine?.exercises.length || 0} {t('assistant.exercises')}
                                                    </AccessibleText>
                                                </View>
                                            );
                                        })
                                    ) : (
                                        <AccessibleText className="text-xs italic" style={{ color: Colors[theme].textMuted }}>{t('assistant.restDay')}</AccessibleText>
                                    )}
                                </View>

                                {workouts.length > 0 && (
                                    <TouchableOpacity
                                        onPress={() => {
                                            setVisible(false);
                                            router.push(`/workout/active?routineId=${workouts[0].routineId}`);
                                        }}
                                        className="p-2 rounded-full ml-4"
                                        style={{ backgroundColor: Colors[theme].primary }}
                                        accessibilityRole="button"
                                        accessibilityLabel={`Comenzar entrenamiento: ${routines.find(r => r.id === workouts[0].routineId)?.name || workouts[0].routineName}`}
                                    >
                                        <Ionicons name="play" size={20} color="white" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </LinearGradient>
                    </View>
                );
            })}
            <View className="h-10" />
        </ScrollView>
    );

    if (isMinimized || !isVisible) {
        return (
            <View pointerEvents="box-none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
                <GestureDetector gesture={bubblePan}>
                    <Animated.View style={[bubbleStyle, { position: 'absolute', bottom: 100, right: 20 }]}>
                        <TouchableOpacity
                            onPress={() => {
                                if (!isVisible) setVisible(true);
                                setIsMinimized(false);
                            }}
                            className="w-24 h-24 rounded-full items-center justify-center shadow-2xl border-2 animate-tilt"
                            style={{ backgroundColor: Colors[theme].primary, borderColor: 'rgba(255,255,255,0.2)' }}
                            accessibilityRole="button"
                            accessibilityLabel="Abrir asistente Mambo Coach"
                            accessibilityHint="Toca para chatear con tu coach IA"
                        >
                            <Ionicons name="chatbubbles" size={48} color="white" />
                            {isMinimized && (
                                <View className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border border-white" />
                            )}
                        </TouchableOpacity>
                    </Animated.View>
                </GestureDetector>
            </View>
        );
    }

    return (
        <View pointerEvents="box-none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
            <Animated.View
                style={[
                    windowStyle,
                    {
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '85%',
                        backgroundColor: Colors[theme].background,
                        borderTopLeftRadius: 24,
                        borderTopRightRadius: 24,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: -4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 10,
                        borderTopWidth: 1,
                        borderColor: Colors[theme].border
                    }
                ]}
            >
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                    {/* Header with Drag Handle */}
                    <GestureDetector gesture={windowPan}>
                        <View className="flex-row items-center justify-between p-4 border-b rounded-t-3xl" style={{ backgroundColor: Colors[theme].surface, borderBottomColor: Colors[theme].border }}>
                            <View className="flex-row gap-4">
                                <TouchableOpacity
                                    onPress={() => setActiveTab('chat')}
                                    accessibilityRole="tab"
                                    accessibilityState={{ selected: activeTab === 'chat' }}
                                >
                                    <AccessibleText weight="bold" className={`text-lg font-bold ${activeTab === 'chat' ? '' : 'text-gray-400'}`} style={activeTab === 'chat' ? { color: Colors[theme].primary } : {}}>{t('assistant.chat')}</AccessibleText>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => setActiveTab('agenda')}
                                    accessibilityRole="tab"
                                    accessibilityState={{ selected: activeTab === 'agenda' }}
                                >
                                    <AccessibleText weight="bold" className={`text-lg font-bold ${activeTab === 'agenda' ? '' : 'text-gray-400'}`} style={activeTab === 'agenda' ? { color: Colors[theme].primary } : {}}>{t('assistant.agenda')}</AccessibleText>
                                </TouchableOpacity>
                            </View>
                            <View className="flex-row gap-2">
                                <TouchableOpacity
                                    onPress={() => setIsMinimized(true)}
                                    className="p-2 rounded-full"
                                    style={{ backgroundColor: Colors[theme].surfaceHighlight }}
                                    accessibilityRole="button"
                                    accessibilityLabel="Minimizar chat"
                                >
                                    <Ionicons name="remove" size={20} color={Colors[theme].textSecondary} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => setVisible(false)}
                                    className="p-2 rounded-full"
                                    style={{ backgroundColor: Colors[theme].surfaceHighlight }}
                                    accessibilityRole="button"
                                    accessibilityLabel="Cerrar chat"
                                >
                                    <Ionicons name="close" size={20} color={Colors[theme].textSecondary} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </GestureDetector>

                    {activeTab === 'chat' ? (
                        <>
                            <ScrollView
                                ref={scrollViewRef}
                                className="flex-1 p-4"
                                contentContainerStyle={{ paddingBottom: 20 }}
                            >
                                {messages.map((msg) => (
                                    <Animated.View
                                        entering={FadeInUp.delay(100).springify()}
                                        key={msg.id}
                                        className={`mb-4 max-w-[85%] ${msg.role === 'user' ? 'self-end' : 'self-start'}`}
                                    >
                                        <View className={`p-3 rounded-2xl ${msg.role === 'user' ? 'rounded-tr-none' : 'rounded-tl-none border'}`}
                                            style={msg.role === 'user'
                                                ? { backgroundColor: Colors[theme].primary }
                                                : { backgroundColor: Colors[theme].surface, borderColor: Colors[theme].border }}>
                                            <AccessibleText className="text-base leading-6" style={{ color: msg.role === 'user' ? 'white' : Colors[theme].text }}>{msg.content}</AccessibleText>
                                            {msg.role === 'assistant' && (
                                                <TouchableOpacity
                                                    onPress={() => speak(msg.content)}
                                                    className="absolute -right-8 top-0 p-2"
                                                    accessibilityRole="button"
                                                    accessibilityLabel="Leer mensaje en voz alta"
                                                >
                                                    <Ionicons name="volume-medium-outline" size={16} color={Colors[theme].textMuted} />
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                        {msg.toolCall && (
                                            <ActionCard
                                                type={msg.toolCall.name}
                                                args={msg.toolCall.args}
                                                status={msg.toolResponse ? 'success' : 'pending'}
                                                result={msg.toolResponse?.result}
                                            />
                                        )}
                                    </Animated.View>
                                ))}
                                {isLoading && (
                                    <View className="self-start p-3 rounded-2xl rounded-tl-none border mb-4 animate-blink" style={{ backgroundColor: Colors[theme].surface, borderColor: Colors[theme].border }}>
                                        <ActivityIndicator color={Colors[theme].primary} />
                                    </View>
                                )}
                            </ScrollView>

                            {/* Command Suggestions */}
                            <View className="px-4 py-2">
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    <View className="flex-row gap-2">
                                        {[
                                            { label: '🥗 Generar Plan', cmd: 'Generar un nuevo plan de nutrición' },
                                            { label: '📅 Programar Entreno', cmd: 'Programa un entrenamiento para mañana' },
                                            { label: '❤️ Recuperación', cmd: 'Analiza mi recuperación' },
                                            { label: '🔄 Cambiar Ejercicio', cmd: 'Sustituye un ejercicio' },
                                            { label: '➕ Añadir Ejercicio', cmd: 'Añade un ejercicio a mi rutina' },
                                            { label: '🛌 Descanso', cmd: 'Hoy quiero descansar' },
                                        ].map((item, idx) => (
                                            <TouchableOpacity
                                                key={idx}
                                                onPress={() => handleSend(item.cmd)}
                                                className={`px-4 py-2 rounded-full border animate-fade-in-up animate-delay-${idx * 100}`}
                                                style={{ backgroundColor: Colors[theme].surfaceHighlight, borderColor: Colors[theme].border }}
                                                accessibilityRole="button"
                                                accessibilityLabel={`Sugerencia: ${item.label}`}
                                            >
                                                <AccessibleText weight="medium" className="text-xs font-medium" style={{ color: Colors[theme].text }}>{item.label}</AccessibleText>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </ScrollView>
                            </View>

                            <View className="p-4 border-t pb-8" style={{ borderTopColor: Colors[theme].border, backgroundColor: Colors[theme].surface }}>
                                <View className={`flex-row items-center rounded-full px-4 py-2 border ${isRecording ? 'border-red-500 bg-red-500/10' : ''}`} style={!isRecording ? { backgroundColor: Colors[theme].surfaceHighlight, borderColor: Colors[theme].border } : {}}>
                                    {!input.trim() && (
                                        <TouchableOpacity
                                            onPress={handleMicPress}
                                            className={`w-10 h-10 rounded-full items-center justify-center mr-2 ${isRecording ? 'bg-red-500' : ''}`}
                                            style={!isRecording ? { backgroundColor: Colors[theme].surfaceHighlight } : {}}
                                            accessibilityRole="button"
                                            accessibilityLabel={isRecording ? "Detener grabación" : "Grabar mensaje de voz"}
                                        >
                                            <Ionicons name={isRecording ? "stop" : "mic"} size={18} color={isRecording ? "white" : Colors[theme].textSecondary} />
                                        </TouchableOpacity>
                                    )}
                                    <TouchableOpacity
                                        onPress={handlePickImage}
                                        className="p-2 mr-1"
                                        accessibilityRole="button"
                                        accessibilityLabel="Adjuntar imagen"
                                        accessibilityHint="Analiza fotos de tus comidas (Solo Elite)"
                                    >
                                        <Ionicons name="image-outline" size={24} color={Colors[theme].textSecondary} />
                                    </TouchableOpacity>

                                    <TextInput
                                        className="flex-1 text-base max-h-24 py-2"
                                        style={{ color: Colors[theme].text }}
                                        placeholder={isRecording ? t('assistant.listening') : t('assistant.placeholder')}
                                        placeholderTextColor={Colors[theme].textMuted}
                                        value={input}
                                        onChangeText={setInput}
                                        multiline
                                        onSubmitEditing={() => handleSend(input)}
                                        accessibilityLabel="Escribe un mensaje al coach"
                                    />
                                    {!isRecording && (
                                        <TouchableOpacity
                                            onPress={() => handleSend(input)}
                                            disabled={!input.trim() || isLoading}
                                            className={`p-2 rounded-full ${input.trim() && !isLoading ? '' : ''}`}
                                            style={input.trim() && !isLoading ? { backgroundColor: Colors[theme].primary } : { backgroundColor: Colors[theme].surfaceHighlight }}
                                            accessibilityRole="button"
                                            accessibilityLabel="Enviar mensaje"
                                        >
                                            <Ionicons name="send" size={20} color={input.trim() && !isLoading ? "white" : Colors[theme].textMuted} />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        </>
                    ) : (
                        renderWeeklyPlan()
                    )}
                </KeyboardAvoidingView>
            </Animated.View>
        </View>
    );
}
