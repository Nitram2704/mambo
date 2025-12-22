import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useUserProfileStore } from '@/store/userProfileStore';
import { useSavedRoutinesStore } from '@/store/savedRoutinesStore';
import { useWorkoutHistoryStore } from '@/store/workoutHistoryStore';

export default function TabLayout() {
  const { fetchProfile } = useUserProfileStore();
  const { fetchRoutines } = useSavedRoutinesStore();
  const { fetchWorkouts } = useWorkoutHistoryStore();

  React.useEffect(() => {
    fetchProfile();
    fetchRoutines();
    fetchWorkouts();
  }, []);

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        tabBarActiveTintColor: '#3b82f6', // blue-500
        tabBarInactiveTintColor: '#9ca3af', // gray-400
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: '#111827', // gray-900
          borderTopColor: '#1f2937', // gray-800
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="nutricion"
        options={{
          title: 'Nutrición',
          tabBarIcon: ({ color }) => <Ionicons name="nutrition" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="sleep"
        options={{
          title: 'Sueño',
          tabBarIcon: ({ color }) => <Ionicons name="moon" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reportes',
          tabBarIcon: ({ color }) => <Ionicons name="bar-chart" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
