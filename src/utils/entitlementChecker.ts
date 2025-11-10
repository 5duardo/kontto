import revenueCatService, { ENTITLEMENT_ID } from '@services/revenueCatService';
import { useAppStore } from '@store/useAppStore';

/**
 * Utility functions for checking Kontto Pro entitlements
 * These functions verify if a user has access to premium features
 */

/**
 * Check if user has Kontto Pro entitlement
 * This is the main function to use throughout the app for feature gating
 */
export const checkKottoPro = async (): Promise<boolean> => {
    try {
        const hasAccess = await revenueCatService.hasEntitlement(ENTITLEMENT_ID);
        return hasAccess;
    } catch (error) {
        console.error('❌ Error checking Kontto Pro entitlement:', error);
        return false;
    }
};

/**
 * Check if user is subscribed to any plan
 */
export const checkIsSubscribed = async (): Promise<boolean> => {
    try {
        const isSubscribed = await revenueCatService.isSubscribed();
        return isSubscribed;
    } catch (error) {
        console.error('❌ Error checking subscription status:', error);
        return false;
    }
};

/**
 * Get subscription renewal date
 */
export const getProRenewalDate = async (): Promise<Date | null> => {
    try {
        const renewalDate = await revenueCatService.getSubscriptionRenewalDate();
        return renewalDate;
    } catch (error) {
        console.error('❌ Error getting renewal date:', error);
        return null;
    }
};

/**
 * Check if a specific product is subscribed
 */
export const checkProductSubscription = async (productId: string): Promise<boolean> => {
    try {
        const isSubscribed = await revenueCatService.isSubscribed(productId);
        return isSubscribed;
    } catch (error) {
        console.error(`❌ Error checking subscription for product ${productId}:`, error);
        return false;
    }
};

/**
 * Feature gating utility
 * Use this to gate specific features behind Kontto Pro
 */
export const gateFeature = async (featureName: string): Promise<boolean> => {
    try {
        const hasProAccess = await checkKottoPro();

        if (!hasProAccess) {
            console.log(`⚠️ Feature "${featureName}" requires Kontto Pro`);
            return false;
        }

        return true;
    } catch (error) {
        console.error(`❌ Error gating feature "${featureName}":`, error);
        return false;
    }
};

/**
 * List of features that require Kontto Pro
 * Use these constants throughout the app for consistency
 */
export const PRO_FEATURES = {
    UNLIMITED_ACCOUNTS: 'unlimited_accounts',
    ADVANCED_REPORTS: 'advanced_reports',
    BUDGET_TRACKING: 'budget_tracking',
    RECURRING_TRANSACTIONS: 'recurring_transactions',
    DATA_EXPORT: 'data_export',
    PRIORITY_SUPPORT: 'priority_support',
    NO_ADS: 'no_ads',
    CUSTOM_CATEGORIES: 'custom_categories',
    CUSTOMER_CENTER: 'customer_center', // RevenueCat Customer Center access
} as const;

/**
 * Check if a specific feature is available
 */
export const hasProFeature = async (feature: keyof typeof PRO_FEATURES): Promise<boolean> => {
    try {
        const hasAccess = await checkKottoPro();
        return hasAccess;
    } catch (error) {
        console.error(`❌ Error checking feature "${feature}":`, error);
        return false;
    }
};

/**
 * Hook-compatible version using Zustand store
 * For use within React components
 */
export const useCheckProAccess = () => {
    const isPro = useAppStore(state => state.isPro);
    return isPro;
};

/**
 * Get formatted pro status message
 */
export const getProStatusMessage = async (): Promise<string> => {
    try {
        const hasAccess = await checkKottoPro();

        if (!hasAccess) {
            return 'Subscribe to unlock Kontto Pro features';
        }

        const renewalDate = await getProRenewalDate();

        if (renewalDate) {
            const formattedDate = renewalDate.toLocaleDateString();
            return `Kontto Pro active (renews ${formattedDate})`;
        }

        return 'Kontto Pro active';
    } catch (error) {
        console.error('❌ Error getting pro status message:', error);
        return 'Unable to check subscription status';
    }
};

/**
 * Get list of locked features (for use in UI)
 */
export const getLockedFeatures = (isPro: boolean): Array<string> => {
    if (isPro) {
        return [];
    }

    return [
        'Unlimited accounts',
        'Advanced analytics',
        'Budget tracking tools',
        'Recurring transactions',
        'Data export (CSV, PDF, Excel)',
        'Priority support',
        'Ad-free experience',
        'Custom categories',
    ];
};

/**
 * Get list of unlocked features
 */
export const getUnlockedFeatures = (): Array<string> => {
    return [
        '3 accounts',
        '2 goals',
        '2 budgets',
        '2 recurring payments',
        'Basic categories',
        'Transaction tracking',
        'Mobile app',
    ];
};

export default {
    checkKottoPro,
    checkIsSubscribed,
    getProRenewalDate,
    checkProductSubscription,
    gateFeature,
    hasProFeature,
    useCheckProAccess,
    getProStatusMessage,
    getLockedFeatures,
    getUnlockedFeatures,
    PRO_FEATURES,
};
