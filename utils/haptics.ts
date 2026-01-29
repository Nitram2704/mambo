import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export const triggerHaptic = async (type: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Medium) => {
    if (Platform.OS === 'web') {
        return;
    }
    try {
        await Haptics.impactAsync(type);
    } catch (error) {
        // Ignore errors
    }
};

export const triggerSelection = async () => {
    if (Platform.OS === 'web') {
        return;
    }
    try {
        await Haptics.selectionAsync();
    } catch (error) {
        // Ignore errors
    }
};

export const triggerNotification = async (type: Haptics.NotificationFeedbackType) => {
    if (Platform.OS === 'web') {
        return;
    }
    try {
        await Haptics.notificationAsync(type);
    } catch (error) {
        // Ignore errors
    }
};
