import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { startMonitoring, stopMonitoring } from '@/utils/sleepSensors';
import { shouldWakeUp, DEFAULT_SLEEP_THRESHOLD } from '@/utils/smartAlarmService';
import { startAudioAnalysis, stopAudioAnalysis } from '@/utils/audioAnalysis';
import { useSleepStore } from '@/store/sleepStore';
import { getLocalDateString } from '@/utils/dateUtils';
import { Audio } from 'expo-av';

const { width } = Dimensions.get('window');

export default function SleepModeScreen() {
    const router = useRouter();
    const [isTracking, setIsTracking] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [wakeUpTime, setWakeUpTime] = useState(() => {
        const now = new Date();
        const alarm = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 7, 0, 0, 0);
        if (alarm <= now) {
            alarm.setDate(alarm.getDate() + 1);
        }
        return alarm;
    });
    const [isSmartWake, setIsSmartWake] = useState(true);
    const [noiseCount, setNoiseCount] = useState(0);
    const [movement, setMovement] = useState(0);
    const [isAlarmTriggered, setIsAlarmTriggered] = useState(false);
    const [bedTime, setBedTime] = useState<Date | null>(null);

    const alarmSound = useRef<Audio.Sound | null>(null);

    const [sunriseProgress, setSunriseProgress] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            setCurrentTime(now);

            // Calculate sunrise progress (30 mins before alarm)
            if (isTracking && !isAlarmTriggered) {
                const windowStart = new Date(wakeUpTime.getTime() - 30 * 60 * 1000);
                if (now >= windowStart) {
                    const total = 30 * 60 * 1000;
                    const elapsed = now.getTime() - windowStart.getTime();
                    setSunriseProgress(Math.min(elapsed / total, 1));
                } else {
                    setSunriseProgress(0);
                }
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [isTracking, isAlarmTriggered, wakeUpTime]);

    const startTracking = async () => {
        await activateKeepAwakeAsync();
        setBedTime(new Date());
        setIsTracking(true);
        setSunriseProgress(0);

        startMonitoring((m) => {
            setMovement(m);
            if (isSmartWake && !isAlarmTriggered) {
                const triggered = shouldWakeUp(new Date(), {
                    targetTime: wakeUpTime,
                    windowMinutes: 30,
                    threshold: DEFAULT_SLEEP_THRESHOLD
                }, m);

                if (triggered) {
                    triggerAlarm();
                }
            }
        });

        startAudioAnalysis((count) => {
            setNoiseCount(count);
        });
    };

    const stopTracking = async () => {
        await deactivateKeepAwake();
        stopMonitoring();
        const finalNoise = await stopAudioAnalysis();
        setIsTracking(false);

        if (bedTime) {
            const wakeTime = new Date();
            const date = getLocalDateString(wakeTime);
            const store = useSleepStore.getState();

            // Save log
            store.logSleep({
                date,
                bedTime,
                wakeTime,
                quality: 3,
            });

            // Calculate score, chronotype and debt
            store.calculateAndSaveScore(date, finalNoise);
            store.updateChronotype();
            store.calculateSleepDebt();

            router.push('/sleep/morning-briefing');
        }
    };

    const triggerAlarm = async () => {
        setIsAlarmTriggered(true);
        setSunriseProgress(1); // Full sunrise when alarm hits
        try {
            const { sound } = await Audio.Sound.createAsync(
                { uri: 'https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3' },
                { shouldPlay: true, isLooping: true, volume: 1.0 }
            );
            alarmSound.current = sound;
        } catch (e) {
            console.error('Failed to play alarm sound', e);
        }
    };

    const stopAlarm = async () => {
        if (alarmSound.current) {
            await alarmSound.current.stopAsync();
            await alarmSound.current.unloadAsync();
            alarmSound.current = null;
        }
        setIsAlarmTriggered(false);
        stopTracking();
    };

    // Sunrise colors based on progress
    const getSunriseColors = () => {
        if (sunriseProgress <= 0) return ['#000000', '#000000'];

        // Interpolate between deep purple/black and warm orange/yellow
        if (sunriseProgress < 0.5) {
            return ['#1a0b2e', '#3b0764']; // Deep night to purple
        } else if (sunriseProgress < 0.8) {
            return ['#4c1d95', '#7c3aed', '#f97316']; // Purple to orange
        } else {
            return ['#f97316', '#fbbf24', '#fef3c7']; // Orange to bright yellow
        }
    };

    return (
        <View className="flex-1 bg-black">
            {isTracking && (
                <LinearGradient
                    colors={getSunriseColors() as [string, string, ...string[]]}
                    style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
                    start={{ x: 0, y: 1 }}
                    end={{ x: 0, y: 0 }}
                />
            )}
            <SafeAreaView className="flex-1 items-center justify-center p-6">
                {!isTracking ? (
                    <View className="w-full items-center">
                        <Text className="text-white text-5xl font-bold mb-2">
                            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                        <Text className="text-gray-400 text-lg mb-12">Listo para descansar</Text>

                        <TouchableOpacity
                            onPress={startTracking}
                            className="bg-purple-600 w-full py-4 rounded-2xl items-center mb-4"
                        >
                            <Text className="text-white font-bold text-lg">Iniciar Seguimiento</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="py-2"
                        >
                            <Text className="text-gray-500 font-medium">Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View className="w-full items-center">
                        <Ionicons
                            name="moon"
                            size={80}
                            color={sunriseProgress > 0.5 ? '#f59e0b' : '#a855f7'}
                            className="mb-8"
                            style={{ opacity: 0.8 }}
                        />

                        <Text className="text-white text-6xl font-bold mb-4 shadow-lg">
                            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>

                        <View className="flex-row items-center mb-12">
                            <Ionicons name="alarm-outline" size={20} color={sunriseProgress > 0.5 ? '#4b5563' : '#6b7280'} />
                            <Text className={`${sunriseProgress > 0.5 ? 'text-gray-700' : 'text-gray-500'} text-lg ml-2 font-medium`}>
                                Alarma a las {wakeUpTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                        </View>

                        <View className={`w-full ${sunriseProgress > 0.5 ? 'bg-black/10' : 'bg-white/5'} p-6 rounded-3xl mb-12 border ${sunriseProgress > 0.5 ? 'border-black/10' : 'border-white/10'}`}>
                            <View className="flex-row justify-between mb-4">
                                <Text className={sunriseProgress > 0.5 ? 'text-gray-700' : 'text-gray-400'}>Ruidos detectados</Text>
                                <Text className={sunriseProgress > 0.5 ? 'text-black font-bold' : 'text-white font-bold'}>{noiseCount}</Text>
                            </View>
                            <View className="flex-row justify-between">
                                <Text className={sunriseProgress > 0.5 ? 'text-gray-700' : 'text-gray-400'}>Movimiento</Text>
                                <Text className={sunriseProgress > 0.5 ? 'text-black font-bold' : 'text-white font-bold'}>{(movement * 100).toFixed(1)}%</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={stopTracking}
                            className={`${sunriseProgress > 0.5 ? 'bg-black/20' : 'bg-red-500/20'} px-12 py-4 rounded-full border ${sunriseProgress > 0.5 ? 'border-black/20' : 'border-red-500/30'}`}
                        >
                            <Text className={`${sunriseProgress > 0.5 ? 'text-black' : 'text-red-400'} font-bold text-lg`}>Detener Seguimiento</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Alarm Modal */}
                <Modal visible={isAlarmTriggered} transparent animationType="fade">
                    <View className="flex-1 bg-black items-center justify-center p-6">
                        <LinearGradient
                            colors={['#a855f7', '#6366f1']}
                            className="w-full p-8 rounded-3xl items-center"
                        >
                            <Ionicons name="alarm" size={100} color="white" className="mb-6" />
                            <Text className="text-white text-4xl font-bold mb-2">¡Buenos días!</Text>
                            <Text className="text-white/80 text-lg mb-12 text-center">
                                Es hora de empezar el día con energía.
                            </Text>

                            <TouchableOpacity
                                onPress={stopAlarm}
                                className="bg-white w-full py-4 rounded-2xl items-center"
                            >
                                <Text className="text-purple-600 font-bold text-xl">Detener Alarma</Text>
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>
                </Modal>
            </SafeAreaView>
        </View>
    );
}
