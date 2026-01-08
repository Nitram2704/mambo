import * as Haptics from 'expo-haptics';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import { useUserProfileStore } from '@/store/userProfileStore';

export function useAppTheme() {
    const systemColorScheme = useSystemColorScheme();
    const { profile } = useUserProfileStore();

    const theme = profile?.theme || 'dark';

    const themeValue = theme === 'system' ? (systemColorScheme || 'light') : theme;

    const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection' = 'medium') => {
        switch (type) {
            case 'light': Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); break;
            case 'medium': Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); break;
            case 'heavy': Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); break;
            case 'success': Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); break;
            case 'warning': Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); break;
            case 'error': Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); break;
            case 'selection': Haptics.selectionAsync(); break;
        }
    };

    return {
        theme: themeValue as 'light' | 'dark',
        isDark: themeValue === 'dark',
        triggerHaptic
    };
}
