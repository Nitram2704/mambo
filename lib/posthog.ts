import PostHog from 'posthog-react-native';
import { Platform } from 'react-native';

const isExporting = typeof window === 'undefined';

export const posthog = !isExporting
    ? new PostHog(process.env.EXPO_PUBLIC_POSTHOG_API_KEY || 'phc_placeholder', {
        host: 'https://app.posthog.com',
    })
    : ({
        capture: () => { },
        identify: () => { },
        reset: () => { },
        screen: () => { },
        alias: () => { },
        group: () => { },
        flush: () => Promise.resolve(),
    } as any);
