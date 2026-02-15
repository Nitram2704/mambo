import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useUserProfileStore } from '@/store/userProfileStore';
import { LoadingScreen } from '../ui/LoadingScreen';

interface OnboardingGuardProps {
    children: React.ReactNode;
}

/**
 * OnboardingGuard - Protects routes and ensures user profile status is verified.
 * 
 * Logic:
 * 1. If session exists but profile isn't loaded -> Show Loading
 * 2. If profile exists but onboarding NOT complete -> Redirect to /onboarding
 * 3. If everything is fine -> Render children (Tabs)
 */
export const OnboardingGuard: React.FC<OnboardingGuardProps> = ({ children }) => {
    const { profile, loading: profileLoading, fetchProfile } = useUserProfileStore();
    const [sessionChecked, setSessionChecked] = useState(false);
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session && !profile) {
                await fetchProfile();
            }
            setSessionChecked(true);
        };

        checkSession();
    }, []);

    useEffect(() => {
        if (!sessionChecked || profileLoading) return;

        const inAuthGroup = segments[0] === 'auth' ||
            segments[0] === 'welcome' ||
            segments[0] === 'register' ||
            segments[0] === 'forgot-password' ||
            segments[0] === 'reset-password';

        const inOnboarding = segments[0] === 'onboarding';

        // If we have a profile but onboarding is not completed, and we are not in onboarding
        if (profile && !profile.hasCompletedOnboarding && !inOnboarding && !inAuthGroup) {
            console.log('OnboardingGuard: Redirecting to /onboarding');
            router.replace('/onboarding' as any);
        }

        // If user is at auth screen but already has a finished profile, send to tabs
        if (profile?.hasCompletedOnboarding && inAuthGroup) {
            console.log('OnboardingGuard: Redirecting to /(tabs) from auth');
            router.replace('/(tabs)');
        }

    }, [profile, profileLoading, sessionChecked, segments]);

    // Show loading while we are verifying the user state
    if (!sessionChecked || profileLoading) {
        return <LoadingScreen message="Verificando perfil..." />;
    }

    return <>{children}</>;
};
