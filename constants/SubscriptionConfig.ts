export type SubscriptionTier = 'STARTER' | 'PRO' | 'ELITE';

export interface TierConfig {
    name: string;
    price: string;
    features: {
        barcodeScanner: boolean;
        cvCredits: number; // -1 for unlimited
        chatLimit: number; // -1 for unlimited
        agentActions: boolean;
        ragMemory: boolean;
        nutritionVision: boolean;
    };
}

export const SUBSCRIPTION_TIERS: Record<SubscriptionTier, TierConfig> = {
    STARTER: {
        name: 'Starter',
        price: 'Gratis',
        features: {
            barcodeScanner: true,
            cvCredits: 1,
            chatLimit: 20,
            agentActions: false,
            ragMemory: false,
            nutritionVision: false,
        },
    },
    PRO: {
        name: 'Pro',
        price: '$9.99/mes',
        features: {
            barcodeScanner: true,
            cvCredits: 5,
            chatLimit: 50,
            agentActions: true,
            ragMemory: false,
            nutritionVision: false,
        },
    },
    ELITE: {
        name: 'Elite',
        price: '$29.99/mes',
        features: {
            barcodeScanner: true,
            cvCredits: -1, // Unlimited
            chatLimit: -1, // Unlimited
            agentActions: true,
            ragMemory: true,
            nutritionVision: true,
        },
    },
};
