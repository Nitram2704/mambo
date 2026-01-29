import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import { triggerHaptic } from '@/utils/haptics';
import * as Haptics from 'expo-haptics';
import React, { useRef } from 'react';
import { Animated } from 'react-native';

export function HapticTab(props: BottomTabBarButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = (ev: any) => {
    if (process.env.EXPO_OS === 'ios') {
      // Add a soft haptic feedback when pressing down on the tabs.
      triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    }

    Animated.spring(scaleAnim, {
      toValue: 0.92,
      useNativeDriver: true,
    }).start();

    props.onPressIn?.(ev);
  };

  const handlePressOut = (ev: any) => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3, // Lower friction for more bounce
      tension: 60, // Higher tension for more speed
      useNativeDriver: true,
    }).start();

    props.onPressOut?.(ev);
  };

  return (
    <PlatformPressable
      {...props}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }], flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        {props.children}
      </Animated.View>
    </PlatformPressable>
  );
}
