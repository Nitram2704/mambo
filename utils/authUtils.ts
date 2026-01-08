import { Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useUserProfileStore } from '@/store/userProfileStore';
import { useNutritionStore } from '@/store/nutritionStore';
import { useSleepStore } from '@/store/sleepStore';
import { useWaterStore } from '@/store/waterStore';
import { useWeightStore } from '@/store/weightStore';
import { useActiveWorkoutStore } from '@/store/activeWorkoutStore';
import { useWorkoutHistoryStore } from '@/store/workoutHistoryStore';
import { useSavedRoutinesStore } from '@/store/savedRoutinesStore';
import { useAchievementsStore } from '@/store/achievementsStore';
import { useWeeklyScheduleStore } from '@/store/weeklyScheduleStore';
import { useUIStore } from '@/store/uiStore';

export const handleLogout = async (t: (key: string) => string) => {
    Alert.alert(
        t('dashboard.logout'),
        t('dashboard.logoutConfirm'),
        [
            { text: t('common.cancel'), style: 'cancel' },
            {
                text: t('dashboard.exit'),
                style: 'destructive',
                onPress: async () => {
                    try {
                        const { error } = await supabase.auth.signOut();
                        if (error) throw error;

                        // Clear all local stores
                        useUserProfileStore.getState().clearProfile();
                        useNutritionStore.getState().clearData();
                        useSleepStore.getState().clearData();
                        useWaterStore.getState().clearData();
                        useWeightStore.getState().clearData();
                        useActiveWorkoutStore.getState().reset();
                        useWorkoutHistoryStore.getState().clearHistory();
                        useSavedRoutinesStore.getState().clearRoutines();
                        useAchievementsStore.getState().reset();
                        useWeeklyScheduleStore.getState().clearSchedule();

                    } catch (error: any) {
                        useUIStore.getState().showToast(error.message, 'error');
                    }
                }
            }
        ]
    );
};

export const performSocialLogin = async (provider: 'google' | 'apple') => {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: provider,
            options: {
                redirectTo: 'mambo://auth/callback', // Ensure this matches your Supabase URL Configuration
            },
        });

        if (error) throw error;

        // Note: The actual redirection and session handling happens via the deep link 
        // and the onAuthStateChange listener in _layout.tsx
        return { data, error: null };
    } catch (error: any) {
        return { data: null, error };
    }
};
