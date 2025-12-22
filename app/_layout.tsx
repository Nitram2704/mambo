import '../global.css';
import './../lib/i18n';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useRouter, useSegments } from 'expo-router';
import { useUserProfileStore } from '@/store/userProfileStore';
import { useSavedRoutinesStore } from '@/store/savedRoutinesStore';
import { useWorkoutHistoryStore } from '@/store/workoutHistoryStore';

import { useAppTheme } from '@/hooks/use-app-theme';
import { RestTimerProvider } from '@/context/RestTimerContext';
import { FloatingTimer } from '@/components/FloatingTimer';
import { AssistantButton } from '@/components/AssistantButton';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

import { AppLightTheme, AppDarkTheme } from '@/constants/theme';

export default function RootLayout() {
  const { theme } = useAppTheme();
  const [loaded, error] = useFonts({
    ...Ionicons.font,
  });
  const [session, setSession] = useState<Session | null>(null);
  const segments = useSegments();
  const router = useRouter();

  const { profile, loading: profileLoading, fetchProfile } = useUserProfileStore();
  const { fetchRoutines } = useSavedRoutinesStore();
  const { fetchWorkouts } = useWorkoutHistoryStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        // Fetch user data when session is restored
        fetchProfile();
        fetchRoutines(); // Kept this as it was not explicitly removed by the instruction
        fetchWorkouts(); // Kept this as it was not explicitly removed by the instruction
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        // Fetch user data when user logs in
        fetchProfile();
        fetchRoutines(); // Kept this as it was not explicitly removed by the instruction
        fetchWorkouts(); // Kept this as it was not explicitly removed by the instruction
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!loaded || profileLoading) return;

    console.log('RootLayout: segments', segments);
    console.log('RootLayout: session', !!session);
    console.log('RootLayout: profile', !!profile);

    const inAuthGroup = segments[0] === 'auth';
    const inOnboarding = segments[0] === 'onboarding';
    const inTabsGroup = segments[0] === '(tabs)'; // Added this line based on the provided snippet

    // Only redirect if we are not already where we should be
    if (session) {
      if (inAuthGroup) {
        if (profile && !profile.hasCompletedOnboarding) {
          console.log('RootLayout: Redirecting to /onboarding because session exists, in auth group, and onboarding not completed');
          router.replace('/onboarding' as any);
        } else {
          console.log('RootLayout: Redirecting to (tabs) because session exists and in auth group');
          router.replace('/(tabs)');
        }
      } else if (!inOnboarding && profile && !profile.hasCompletedOnboarding) {
        console.log('RootLayout: Redirecting to /onboarding because onboarding not completed');
        router.replace('/onboarding' as any);
      }
    } else if (!inAuthGroup) {
      console.log('RootLayout: Redirecting to /auth because no session');
      router.replace('/auth');
    }
  }, [session, segments, loaded, profileLoading, profile]);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    if (profile?.language) {
      const { changeLanguage } = require('@/lib/i18n');
      changeLanguage(profile.language);
    }
  }, [profile?.language]);

  if (!loaded) {
    return null;
  }

  const navigationTheme = theme === 'dark' ? AppDarkTheme : AppLightTheme;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={navigationTheme}>
        <RestTimerProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="auth" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding/index" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            <Stack.Screen name="routines/create" options={{ presentation: 'modal', headerShown: false }} />
          </Stack>
          <FloatingTimer />
          <AssistantButton />
          <StatusBar style="auto" />
        </RestTimerProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
