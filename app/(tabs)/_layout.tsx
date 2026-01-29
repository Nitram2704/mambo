import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useUserProfileStore } from '@/store/userProfileStore';
import { useSavedRoutinesStore } from '@/store/savedRoutinesStore';
import { useWorkoutHistoryStore } from '@/store/workoutHistoryStore';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';

export default function TabLayout() {
  const { fetchProfile } = useUserProfileStore();
  const { fetchRoutines } = useSavedRoutinesStore();
  const { fetchWorkouts } = useWorkoutHistoryStore();
  const { theme } = useAppTheme();
  const colors = Colors[theme];

  React.useEffect(() => {
    fetchProfile();
    fetchRoutines();
    fetchWorkouts();
  }, []);

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          tabBarAccessibilityLabel: 'Inicio',
        }}
      />
      <Tabs.Screen
        name="social"
        options={{
          title: 'Social',
          tabBarIcon: ({ color }) => <Ionicons name="people" size={24} color={color} />,
          tabBarAccessibilityLabel: 'Social y Comunidad',
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
          tabBarAccessibilityLabel: 'Perfil',
        }}
      />
      <Tabs.Screen
        name="nutricion"
        options={{
          title: 'Nutrición',
          tabBarIcon: ({ color }) => <Ionicons name="nutrition" size={24} color={color} />,
          tabBarAccessibilityLabel: 'Nutrición',
        }}
      />
      <Tabs.Screen
        name="sleep"
        options={{
          title: 'Sueño',
          tabBarIcon: ({ color }) => <Ionicons name="moon" size={24} color={color} />,
          tabBarAccessibilityLabel: 'Sueño y descanso',
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reportes',
          tabBarIcon: ({ color }) => <Ionicons name="bar-chart" size={24} color={color} />,
          tabBarAccessibilityLabel: 'Reportes y estadísticas',
        }}
      />
    </Tabs>
  );
}
