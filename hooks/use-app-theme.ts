import { useColorScheme as useSystemColorScheme } from 'react-native';
import { useUserProfileStore } from '@/store/userProfileStore';

export function useAppTheme() {
    const systemColorScheme = useSystemColorScheme();
    const { profile } = useUserProfileStore();

    const theme = profile?.theme || 'system';

    const themeValue = theme === 'system' ? (systemColorScheme || 'light') : theme;

    return {
        theme: themeValue as 'light' | 'dark',
        isDark: themeValue === 'dark'
    };
}
