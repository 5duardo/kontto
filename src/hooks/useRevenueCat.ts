import { useEffect, useState, useCallback } from 'react';
import { CustomerInfo, PurchasesOffering, PurchasesPackage } from 'react-native-purchases';
import revenueCatService, { ENTITLEMENT_ID, PRODUCT_IDS } from '@services/revenueCatService';
import { useAppStore } from '@store/useAppStore';

interface UseRevenueCatState {
    // Loading states
    isLoading: boolean;
    isInitializing: boolean;

    // Customer data
    customerInfo: CustomerInfo | null;
    userId: string | null;

    // Subscription status
    isSubscribed: boolean;
    hasKottoPro: boolean;
    subscriptionRenewalDate: Date | null;

    // Offerings and products
    offerings: PurchasesOffering | null;
    availableProducts: Array<PurchasesPackage & { price: string }>;

    // Purchase state
    isPurchasing: boolean;
    lastPurchaseError: string | null;

    // Actions
    purchase: (packageId: string) => Promise<boolean>;
    restorePurchases: () => Promise<boolean>;
    refreshCustomerInfo: () => Promise<void>;
    updateUserId: (userId: string) => Promise<void>;
}

/**
 * Custom hook for managing RevenueCat subscriptions
 * Provides subscription state, customer info, and purchase actions
 *
 * Usage:
 * ```tsx
 * const { isSubscribed, hasKottoPro, purchase, isPurchasing } = useRevenueCat();
 *
 * // Check if user has Kontto Pro
 * if (hasKottoPro) {
 *   // Show pro features
 * }
 *
 * // Purchase a subscription
 * const success = await purchase('monthly');
 * ```
 */
export const useRevenueCat = (): UseRevenueCatState => {
    // State management
    const [isLoading, setIsLoading] = useState(true);
    const [isInitializing, setIsInitializing] = useState(true);
    const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [hasKottoPro, setHasKottoPro] = useState(false);
    const [subscriptionRenewalDate, setSubscriptionRenewalDate] = useState<Date | null>(null);
    const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
    const [availableProducts, setAvailableProducts] = useState<Array<PurchasesPackage & { price: string }>>([]);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [lastPurchaseError, setLastPurchaseError] = useState<string | null>(null);

    // Get store functions to update app-wide subscription state
    const setPro = useAppStore(state => state.setPro);
    const user = useAppStore(state => state.user);

    /**
     * Refresh customer info and update all subscription states
     */
    const refreshCustomerInfo = useCallback(async () => {
        try {
            setIsLoading(true);
            const info = await revenueCatService.getCustomerInfo();

            if (info) {
                setCustomerInfo(info);

                // Check if subscribed
                const subscribed = await revenueCatService.isSubscribed();
                setIsSubscribed(subscribed);

                // Check if has Kontto Pro entitlement
                const hasProAccess = await revenueCatService.hasEntitlement(ENTITLEMENT_ID);
                setHasKottoPro(hasProAccess);

                // Update app store Pro status
                setPro(hasProAccess);

                // Get renewal date
                const renewalDate = await revenueCatService.getSubscriptionRenewalDate();
                setSubscriptionRenewalDate(renewalDate);

                console.log('✅ Customer info refreshed');
            }
        } catch (error) {
            console.error('❌ Failed to refresh customer info:', error);
        } finally {
            setIsLoading(false);
        }
    }, [setPro]);

    /**
     * Update user ID for RevenueCat
     */
    const updateUserId = useCallback(
        async (newUserId: string) => {
            try {
                await revenueCatService.setCurrentUserId(newUserId);
                setUserId(newUserId);
                await refreshCustomerInfo();
            } catch (error) {
                console.error('❌ Failed to update user ID:', error);
            }
        },
        [refreshCustomerInfo]
    );

    /**
     * Purchase a package
     */
    const purchase = useCallback(
        async (packageId: string): Promise<boolean> => {
            try {
                setIsPurchasing(true);
                setLastPurchaseError(null);

                const result = await revenueCatService.purchasePackage(packageId);

                if (result.success && result.customerInfo) {
                    // Update all subscription states
                    setCustomerInfo(result.customerInfo);

                    // Check for entitlements
                    const hasProAccess = await revenueCatService.hasEntitlement(ENTITLEMENT_ID);
                    setHasKottoPro(hasProAccess);
                    setPro(hasProAccess);

                    // Refresh other data
                    await refreshCustomerInfo();

                    console.log('✅ Purchase completed successfully');
                    return true;
                } else {
                    const errorMessage = result.error || 'Purchase failed';
                    setLastPurchaseError(errorMessage);
                    console.error('❌ Purchase failed:', errorMessage);
                    return false;
                }
            } catch (error: any) {
                const errorMessage = error.message || 'Unknown error occurred';
                setLastPurchaseError(errorMessage);
                console.error('❌ Purchase error:', error);
                return false;
            } finally {
                setIsPurchasing(false);
            }
        },
        [refreshCustomerInfo, setPro]
    );

    /**
     * Restore purchases
     */
    const restorePurchases = useCallback(async (): Promise<boolean> => {
        try {
            setIsPurchasing(true);
            setLastPurchaseError(null);

            const result = await revenueCatService.restorePurchases();

            if (result.success && result.customerInfo) {
                setCustomerInfo(result.customerInfo);
                await refreshCustomerInfo();
                console.log('✅ Purchases restored successfully');
                return true;
            } else {
                const errorMessage = result.error || 'Restore failed';
                setLastPurchaseError(errorMessage);
                return false;
            }
        } catch (error: any) {
            const errorMessage = error.message || 'Restore failed';
            setLastPurchaseError(errorMessage);
            console.error('❌ Restore error:', error);
            return false;
        } finally {
            setIsPurchasing(false);
        }
    }, [refreshCustomerInfo]);

    /**
     * Initialize RevenueCat on mount
     */
    useEffect(() => {
        const initRevenueCat = async () => {
            try {
                setIsInitializing(true);

                // Initialize RevenueCat with API key
                const initResult = await revenueCatService.initializeRevenueCat();

                if (initResult.success) {
                    // If user is logged in, identify them
                    if (user?.id) {
                        await updateUserId(user.id);
                    } else {
                        // Just refresh customer info for anonymous users
                        await refreshCustomerInfo();
                    }

                    // Get offerings
                    const currentOfferings = await revenueCatService.getOfferings();
                    setOfferings(currentOfferings);

                    // Get available products
                    const products = await revenueCatService.getAvailableProducts();
                    setAvailableProducts(products || []);

                    // Setup listeners for real-time updates
                    revenueCatService.setupRevenueCatListeners({
                        onCustomerInfoUpdated: async (info: CustomerInfo) => {
                            console.log('🔄 Customer info updated from listener');
                            await refreshCustomerInfo();
                        },
                        onEntitlementGranted: (entitlement: string) => {
                            console.log(`🎉 Entitlement granted: ${entitlement}`);
                            setHasKottoPro(true);
                            setPro(true);
                        },
                    });

                    // Enable debug logs in development
                    if (__DEV__) {
                        revenueCatService.enableDebugLogs();
                    }
                }
            } catch (error) {
                console.error('❌ RevenueCat initialization failed:', error);
            } finally {
                setIsInitializing(false);
            }
        };

        initRevenueCat();
    }, []);

    /**
     * Update user ID when user logs in
     */
    useEffect(() => {
        if (user?.id && userId !== user.id) {
            updateUserId(user.id);
        }
    }, [user?.id]);

    return {
        isLoading,
        isInitializing,
        customerInfo,
        userId,
        isSubscribed,
        hasKottoPro,
        subscriptionRenewalDate,
        offerings,
        availableProducts,
        isPurchasing,
        lastPurchaseError,
        purchase,
        restorePurchases,
        refreshCustomerInfo,
        updateUserId,
    };
};

export default useRevenueCat;
