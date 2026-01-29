import * as Haptics from 'expo-haptics';
import { triggerHaptic as hapticImpact, triggerNotification, triggerSelection } from '@/utils/haptics';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import { useUserProfileStore } from '@/store/userProfileStore';

export function useAppTheme() {
    const systemColorScheme = useSystemColorScheme();
    const { profile } = useUserProfileStore();

    const theme = profile?.theme || 'dark';

    const themeValue = theme === 'system' ? (systemColorScheme || 'light') : theme;

    const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection' = 'medium') => {
        switch (type) {
            case 'light': hapticImpact(Haptics.ImpactFeedbackStyle.Light); break;
            case 'medium': hapticImpact(Haptics.ImpactFeedbackStyle.Medium); break;
            case 'heavy': hapticImpact(Haptics.ImpactFeedbackStyle.Heavy); break;
            case 'success': triggerNotification(Haptics.NotificationFeedbackType.Success); break;
            case 'warning': triggerNotification(Haptics.NotificationFeedbackType.Warning); break;
            case 'error': triggerNotification(Haptics.NotificationFeedbackType.Error); break;
            case 'selection': triggerSelection(); break;
        }
    };

    return {
        theme: themeValue as 'light' | 'dark',
        isDark: themeValue === 'dark',
        triggerHaptic
    };
}
