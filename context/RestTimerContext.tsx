import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface RestTimerContextType {
    timeLeft: number;
    totalTime: number;
    isActive: boolean;
    startTimer: (seconds: number) => void;
    stopTimer: () => void;
    addTime: (seconds: number) => void;
}

const RestTimerContext = createContext<RestTimerContextType | undefined>(undefined);

export const useRestTimer = () => {
    const context = useContext(RestTimerContext);
    if (!context) {
        throw new Error('useRestTimer must be used within a RestTimerProvider');
    }
    return context;
};

export const RestTimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [timeLeft, setTimeLeft] = useState(0);
    const [totalTime, setTotalTime] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [endTime, setEndTime] = useState<number | null>(null);

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const appState = useRef(AppState.currentState);

    // Load saved timer state on mount
    useEffect(() => {
        const loadTimer = async () => {
            try {
                const savedEndTime = await AsyncStorage.getItem('timer_end_time');
                const savedTotalTime = await AsyncStorage.getItem('timer_total_time');

                if (savedEndTime && savedTotalTime) {
                    const end = parseInt(savedEndTime);
                    const total = parseInt(savedTotalTime);
                    const now = Date.now();

                    if (end > now) {
                        const remaining = Math.ceil((end - now) / 1000);
                        setTotalTime(total);
                        setEndTime(end);
                        setTimeLeft(remaining);
                        setIsActive(true);
                    }
                }
            } catch (e) {
                console.error('Failed to load timer', e);
            }
        };
        loadTimer();
    }, []);

    // Handle App State changes (background/foreground)
    useEffect(() => {
        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => subscription.remove();
    }, [endTime, isActive]);

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
        if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
            // App came to foreground
            if (isActive && endTime) {
                const now = Date.now();
                if (endTime > now) {
                    const remaining = Math.ceil((endTime - now) / 1000);
                    setTimeLeft(remaining);
                } else {
                    stopTimer();
                }
            }
        }
        appState.current = nextAppState;
    };

    // Timer tick
    useEffect(() => {
        if (isActive && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        stopTimer();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            stopTimer();
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isActive, timeLeft]);

    const startTimer = async (seconds: number) => {
        const now = Date.now();
        const end = now + (seconds * 1000);

        setTimeLeft(seconds);
        setTotalTime(seconds);
        setEndTime(end);
        setIsActive(true);

        try {
            await AsyncStorage.setItem('timer_end_time', end.toString());
            await AsyncStorage.setItem('timer_total_time', seconds.toString());
        } catch (e) {
            console.error('Failed to save timer', e);
        }
    };

    const stopTimer = async () => {
        setIsActive(false);
        setTimeLeft(0);
        setEndTime(null);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        try {
            await AsyncStorage.removeItem('timer_end_time');
            await AsyncStorage.removeItem('timer_total_time');
        } catch (e) {
            console.error('Failed to clear timer', e);
        }
    };

    const addTime = async (seconds: number) => {
        if (!isActive) return;

        const newTimeLeft = timeLeft + seconds;
        const newTotalTime = totalTime + seconds;
        const newEndTime = (endTime || Date.now()) + (seconds * 1000);

        setTimeLeft(newTimeLeft);
        setTotalTime(newTotalTime);
        setEndTime(newEndTime);

        try {
            await AsyncStorage.setItem('timer_end_time', newEndTime.toString());
            await AsyncStorage.setItem('timer_total_time', newTotalTime.toString());
        } catch (e) {
            console.error('Failed to update timer', e);
        }
    };

    return (
        <RestTimerContext.Provider value={{ timeLeft, totalTime, isActive, startTimer, stopTimer, addTime }}>
            {children}
        </RestTimerContext.Provider>
    );
};
