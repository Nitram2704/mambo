import { Platform } from 'react-native';

// RevenueCat API Keys
export const REVENUECAT_CONFIG = {
    // Use the public API key from your RevenueCat dashboard
    apiKey: Platform.select({
        ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY,
        android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY,
    }) || 'test_RyTRbUkYMscyisshFPjmNkuSqiK', // Fallback to user's test key

    // For development/testing, use the test key
    testApiKey: 'test_RyTRbUkYMscyisshFPjmNkuSqiK',
};

// Product IDs (must match RevenueCat dashboard)
export const PRODUCT_IDS = {
    PRO_MONTHLY: 'mambo_pro_monthly',
    ELITE_MONTHLY: 'mambo_elite_monthly',
} as const;

// Entitlement IDs (must match RevenueCat dashboard)
export const ENTITLEMENTS = {
    PRO_FEATURES: 'pro_features',
    ELITE_FEATURES: 'elite_features',
} as const;

// Offering ID
export const OFFERING_ID = 'default';

// Map entitlements to subscription tiers
export const ENTITLEMENT_TO_TIER = {
    [ENTITLEMENTS.PRO_FEATURES]: 'PRO',
    [ENTITLEMENTS.ELITE_FEATURES]: 'ELITE',
} as const;
