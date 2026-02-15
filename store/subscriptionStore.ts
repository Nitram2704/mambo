import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { SUBSCRIPTION_TIERS, SubscriptionTier } from '@/constants/SubscriptionConfig';
import Purchases, { PurchasesOffering, PurchasesPackage } from 'react-native-purchases';

interface UserSubscription {
    tier_id: SubscriptionTier;
    cv_credits_used_monthly: number;
    chat_tokens_used_daily: number;
}

interface SubscriptionState {
    subscription: UserSubscription | null;
    offerings: PurchasesOffering | null;
    loading: boolean;

    fetchSubscription: () => Promise<void>;
    fetchOfferings: () => Promise<void>;
    purchasePackage: (pkg: PurchasesPackage) => Promise<boolean>;
    restorePurchases: () => Promise<void>;
    checkPermission: (feature: keyof typeof SUBSCRIPTION_TIERS['STARTER']['features']) => boolean;
    getRemainingCredits: (feature: 'cvCredits' | 'chatLimit') => number; // -1 for unlimited
    incrementUsage: (feature: 'cvCredits' | 'chatLimit') => Promise<void>;

    // Dev Tools
    setTier: (tier: SubscriptionTier) => Promise<void>;
    resetUsage: () => Promise<void>;
}

export const useSubscriptionStore = create<SubscriptionState>()(
    persist(
        (set, get) => ({
            subscription: null,
            offerings: null,
            loading: false,

            fetchSubscription: async () => {
                set({ loading: true });
                try {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) {
                        set({ subscription: null, loading: false });
                        return;
                    }

                    // BYPASS: Force ELITE tier for testing
                    const currentTier: SubscriptionTier = 'ELITE';

                    // 2. Sync with Supabase Subscription Data
                    const { data, error } = await supabase
                        .from('user_subscriptions')
                        .select('*')
                        .eq('user_id', user.id)
                        .single();

                    if (error && error.code === 'PGRST116') {
                        // Create ELITE subscription if not exists
                        const eliteSub = {
                            user_id: user.id,
                            tier_id: currentTier,
                            cv_credits_used_monthly: 0,
                            chat_tokens_used_daily: 0,
                        };

                        const { data: newSub } = await supabase
                            .from('user_subscriptions')
                            .insert(eliteSub)
                            .select()
                            .single();

                        if (newSub) {
                            set({ subscription: newSub as any });
                        }
                    } else if (data) {
                        // Force ELITE even if Supabase says otherwise
                        if (data.tier_id !== currentTier) {
                            await supabase
                                .from('user_subscriptions')
                                .update({ tier_id: currentTier })
                                .eq('user_id', user.id);

                            set({ subscription: { ...data, tier_id: currentTier } as any });
                        } else {
                            set({ subscription: data as any });
                        }
                    }
                } catch (e) {
                    console.error('Error fetching subscription:', e);
                } finally {
                    set({ loading: false });
                }
            },

            fetchOfferings: async () => {
                // BYPASS: Return null to avoid RevenueCat initialization errors
                set({ offerings: null });
            },

            purchasePackage: async (pkg: PurchasesPackage) => {
                // BYPASS: Always return true as if successful
                await get().fetchSubscription();
                return true;
            },

            restorePurchases: async () => {
                set({ loading: true });
                try {
                    await Purchases.restorePurchases();
                    await get().fetchSubscription();
                } catch (e) {
                    console.error('Error restoring purchases:', e);
                } finally {
                    set({ loading: false });
                }
            },

            checkPermission: (feature) => {
                const sub = get().subscription;
                if (!sub) return false;

                const tierConfig = SUBSCRIPTION_TIERS[sub.tier_id];
                const featureLimit = tierConfig.features[feature];

                if (typeof featureLimit === 'boolean') {
                    return featureLimit;
                }

                return featureLimit !== 0;
            },

            getRemainingCredits: (feature) => {
                const sub = get().subscription;
                if (!sub) return 0;

                const tierConfig = SUBSCRIPTION_TIERS[sub.tier_id];
                const limit = tierConfig.features[feature];

                if (limit === -1) return 9999; // Unlimited

                const used = feature === 'cvCredits'
                    ? sub.cv_credits_used_monthly
                    : sub.chat_tokens_used_daily;

                return Math.max(0, limit - used);
            },

            incrementUsage: async (feature) => {
                const sub = get().subscription;
                if (!sub) return;

                const field = feature === 'cvCredits' ? 'cv_credits_used_monthly' : 'chat_tokens_used_daily';
                const newValue = (feature === 'cvCredits' ? sub.cv_credits_used_monthly : sub.chat_tokens_used_daily) + 1;

                set({
                    subscription: {
                        ...sub,
                        [field]: newValue
                    }
                });

                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    await supabase
                        .from('user_subscriptions')
                        .update({ [field]: newValue })
                        .eq('user_id', user.id);
                }
            },

            setTier: async (tier) => {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                set(state => ({
                    subscription: state.subscription ? { ...state.subscription, tier_id: tier } : null
                }));

                await supabase
                    .from('user_subscriptions')
                    .update({ tier_id: tier })
                    .eq('user_id', user.id);
            },

            resetUsage: async () => {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                set(state => ({
                    subscription: state.subscription ? {
                        ...state.subscription,
                        cv_credits_used_monthly: 0,
                        chat_tokens_used_daily: 0
                    } : null
                }));

                await supabase
                    .from('user_subscriptions')
                    .update({ cv_credits_used_monthly: 0, chat_tokens_used_daily: 0 })
                    .eq('user_id', user.id);
            }
        }),
        {
            name: 'subscription-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
