import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';

const API_KEYS = {
    apple: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY || '',
    google: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY || '',
};

export const initializeRevenueCat = async (userId?: string) => {
    try {
        // Configure log level for development
        if (__DEV__) {
            Purchases.setLogLevel(LOG_LEVEL.DEBUG);
        }

        const apiKey = Platform.select({
            ios: API_KEYS.apple,
            android: API_KEYS.google,
            default: '',
        });

        if (!apiKey) {
            console.warn('RevenueCat API Key not found. Subscription features will be disabled.');
            return;
        }

        Purchases.configure({ apiKey, appUserID: userId || null });
        console.log('RevenueCat initialized successfully');
    } catch (error) {
        console.error('Error initializing RevenueCat:', error);
    }
};

export const identifyUser = async (userId: string) => {
    try {
        await Purchases.logIn(userId);
    } catch (error) {
        console.error('Error identifying user in RevenueCat:', error);
    }
};

export const logoutUser = async () => {
    try {
        await Purchases.logOut();
    } catch (error) {
        console.error('Error logging out of RevenueCat:', error);
    }
};
