import { useEffect, useState } from 'react';
import Purchases, { CustomerInfo, PurchasesOffering } from 'react-native-purchases';
import { Platform } from 'react-native';
import { REVENUECAT_CONFIG, OFFERING_ID, ENTITLEMENT_TO_TIER, ENTITLEMENTS } from '@/config/revenueCatConfig';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import type { SubscriptionTier } from '@/constants/SubscriptionConfig';

export const useRevenueCat = () => {
    const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
    const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { setTier, fetchSubscription } = useSubscriptionStore();

    // Initialize RevenueCat
    useEffect(() => {
        const initRevenueCat = async () => {
            try {
                // Use test key for development
                const apiKey = __DEV__ ? REVENUECAT_CONFIG.testApiKey : REVENUECAT_CONFIG.apiKey;

                if (!apiKey) {
                    console.warn('RevenueCat API key not configured');
                    return;
                }

                await Purchases.configure({ apiKey });

                // Set up listener for customer info updates
                Purchases.addCustomerInfoUpdateListener((info) => {
                    setCustomerInfo(info);
                    updateTierFromCustomerInfo(info);
                });

                // Fetch initial customer info
                const info = await Purchases.getCustomerInfo();
                setCustomerInfo(info);
                updateTierFromCustomerInfo(info);

                // Fetch offerings
                const offerings = await Purchases.getOfferings();
                if (offerings.current) {
                    setOfferings(offerings.current);
                }
            } catch (e) {
                console.error('Error initializing RevenueCat:', e);
                setError(e instanceof Error ? e.message : 'Unknown error');
            }
        };

        initRevenueCat();
    }, []);

    // Update tier based on customer info
    const updateTierFromCustomerInfo = (info: CustomerInfo) => {
        const activeEntitlements = info.entitlements.active;
        let newTier: SubscriptionTier = 'STARTER';

        if (activeEntitlements[ENTITLEMENTS.ELITE_FEATURES]) {
            newTier = 'ELITE';
        } else if (activeEntitlements[ENTITLEMENTS.PRO_FEATURES]) {
            newTier = 'PRO';
        }

        setTier(newTier);
        fetchSubscription(); // Sync with Supabase
    };

    // Purchase a package
    const purchasePackage = async (packageToPurchase: any) => {
        setLoading(true);
        setError(null);

        try {
            const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
            updateTierFromCustomerInfo(customerInfo);
            return { success: true, customerInfo };
        } catch (e: any) {
            if (!e.userCancelled) {
                setError(e.message || 'Purchase failed');
                console.error('Purchase error:', e);
            }
            return { success: false, error: e };
        } finally {
            setLoading(false);
        }
    };

    // Restore purchases
    const restorePurchases = async () => {
        setLoading(true);
        setError(null);

        try {
            const customerInfo = await Purchases.restorePurchases();
            updateTierFromCustomerInfo(customerInfo);
            return { success: true, customerInfo };
        } catch (e: any) {
            setError(e.message || 'Restore failed');
            console.error('Restore error:', e);
            return { success: false, error: e };
        } finally {
            setLoading(false);
        }
    };

    return {
        offerings,
        customerInfo,
        loading,
        error,
        purchasePackage,
        restorePurchases,
    };
};
