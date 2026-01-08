import * as Sentry from '@sentry/react-native';

export const initSentry = () => {
    const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
    if (!dsn) {
        if (__DEV__) {
            console.log('Sentry DSN not found, skipping initialization');
        }
        return;
    }

    Sentry.init({
        dsn,
        debug: __DEV__,
        enableAutoSessionTracking: true,
    });
};
