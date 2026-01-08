import '../global.css';
import './../lib/i18n';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useRouter, useSegments } from 'expo-router';
import { useUserProfileStore } from '@/store/userProfileStore';
import { useSavedRoutinesStore } from '@/store/savedRoutinesStore';
import { useWorkoutHistoryStore } from '@/store/workoutHistoryStore';
import { useActiveWorkoutStore } from '@/store/activeWorkoutStore';

import { useAppTheme } from '@/hooks/use-app-theme';
import { RestTimerProvider } from '@/context/RestTimerContext';
import { FloatingTimer } from '@/components/FloatingTimer';
import { AssistantButton } from '@/components/AssistantButton';
import { Toast } from '@/components/ui/Toast';
import { PostHogProvider } from 'posthog-react-native';
import { posthog } from '@/lib/posthog';
import { initSentry } from '@/lib/sentry';
import { NudgeService } from '@/utils/nudgeService';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { initializeRevenueCat, identifyUser } from '@/utils/revenuecat';

// Initialize Sentry
initSentry();

// Configure notification handler
if (Constants.appOwnership !== 'expo' || Platform.OS !== 'android') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

// ... (rest of imports)

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
  const isZenMode = useActiveWorkoutStore((state) => state.isZenMode);
  console.log('RootLayout: isZenMode', isZenMode);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        // Initialize RevenueCat and identify user
        initializeRevenueCat(session.user.id);
        identifyUser(session.user.id);
        // Fetch user data when session is restored
        fetchProfile();
        fetchRoutines(); // Kept this as it was not explicitly removed by the instruction
        fetchWorkouts(); // Kept this as it was not explicitly removed by the instruction
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        // Identify user in RevenueCat on login
        identifyUser(session.user.id);
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

    const inAuthGroup = segments[0] === 'auth' || segments[0] === 'welcome' || segments[0] === 'register' || segments[0] === 'forgot-password' || segments[0] === 'reset-password';
    const inOnboarding = segments[0] === 'onboarding';
    const inTabsGroup = segments[0] === '(tabs)';

    // Only redirect if we are not already where we should be
    if (session) {
      if (inAuthGroup) {
        // Allow access to forgot-password and reset-password even if logged in (to handle edge cases)
        const isPasswordReset = segments[0] === 'forgot-password' || segments[0] === 'reset-password';

        if (!isPasswordReset) {
          if (profile && !profile.hasCompletedOnboarding) {
            console.log('RootLayout: Redirecting to /onboarding because session exists, in auth group, and onboarding not completed');
            router.replace('/onboarding' as any);
          } else {
            console.log('RootLayout: Redirecting to (tabs) because session exists and in auth group');
            router.replace('/(tabs)');
          }
        }
      } else if (!inOnboarding && profile && !profile.hasCompletedOnboarding) {
        console.log('RootLayout: Redirecting to /onboarding because onboarding not completed');
        router.replace('/onboarding' as any);
      }
    } else if (!inAuthGroup) {
      console.log('RootLayout: Redirecting to /welcome because no session');
      router.replace('/welcome');
    }
  }, [session, segments, loaded, profileLoading, profile]);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      // Check for proactive nudges on app start
      NudgeService.checkAndTriggerNudges();
      // Request notification permissions (Skip in Expo Go on Android to avoid SDK 53 warning)
      if (Constants.appOwnership !== 'expo' || Platform.OS !== 'android') {
        Notifications.requestPermissionsAsync();
      }
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
    <PostHogProvider client={posthog}>
      <SafeAreaProvider>
        <View style={{ flex: 1 }} className={theme === 'dark' ? 'dark' : ''}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <ThemeProvider value={navigationTheme}>
              <RestTimerProvider>
                <Stack
                  screenOptions={{
                    headerShown: false,
                    gestureEnabled: true,
                    animation: 'slide_from_right',
                  }}
                >
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen name="welcome" />
                  <Stack.Screen name="auth" />
                  <Stack.Screen name="register" />
                  <Stack.Screen name="forgot-password" />
                  <Stack.Screen name="reset-password" />
                  <Stack.Screen name="onboarding/index" />
                  <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
                  <Stack.Screen name="routines/create" options={{ presentation: 'modal' }} />
                  <Stack.Screen
                    name="workout/active"
                    options={{
                      animation: 'fade',
                      gestureEnabled: false // Disable swipe back during active workout to prevent accidental exit
                    }}
                  />
                </Stack>
                {!isZenMode && <FloatingTimer />}
                {!isZenMode && <AssistantButton />}
                <Toast />
                <StatusBar style="auto" />
              </RestTimerProvider>
            </ThemeProvider>
          </GestureHandlerRootView>
        </View>
      </SafeAreaProvider>
    </PostHogProvider>
  );
}
