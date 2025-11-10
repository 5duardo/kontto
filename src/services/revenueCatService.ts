import Purchases, {
    CustomerInfo,
    PurchasesOffering,
    PurchasesPackage,
    PURCHASES_ERROR_CODE,
    LOG_LEVEL,
} from 'react-native-purchases';
import { Platform } from 'react-native';

/**
 * RevenueCat Service
 * Handles all RevenueCat SDK interactions including:
 * - Initialization
 * - User identification
 * - Product fetching
 * - Purchase handling
 * - Entitlement checking
 * - Customer info retrieval
 */

// Constants
// Production API Key for iOS (Apple App Store)
export const REVENUECAT_API_KEY = 'appl_ZwOrAmxMqZTamXhNxjTefgIYDQL';

// Test Store API Key (use this for development/testing with Expo or development builds)
// https://rev.cat/sdk-test-store
export const REVENUECAT_TEST_API_KEY = 'test_wFjgiaTpneOeSLCBjxLUpcZOrNr';

export const ENTITLEMENT_ID = 'Kontto Pro';

// Product identifiers for your app
export const PRODUCT_IDS = {
    WEEKLY: 'weekly',
    MONTHLY: 'monthly',
    YEARLY: 'yearly',
    LIFETIME: 'lifetime',
};

// Use the offering ID from RevenueCat dashboard (provided)
// Note: RevenueCat returns offerings by identifier. If you set this offering as "default" in the dashboard,
// it will be returned as offerings.current
export const OFFERING_ID = 'default'; // Use 'default' which is the standard offering identifier

interface RevenueCatInitConfig {
    apiKey: string;
    userId?: string;
}

/**
 * Initialize RevenueCat SDK
 * Should be called once at app startup (typically in App.tsx)
 * 
 * Note: In development with Expo Go, use Test Store API Key.
 * For production, use the real API key and create a development build with EAS.
 */
export const initializeRevenueCat = async (config?: Partial<RevenueCatInitConfig>) => {
    try {
        let apiKey = config?.apiKey;

        if (!apiKey) {
            // Use Test Store API Key in development
            // In production, use the real API key
            apiKey = __DEV__ ? REVENUECAT_TEST_API_KEY : REVENUECAT_API_KEY;
        }

        console.log(`🚀 Initializing RevenueCat with ${__DEV__ ? 'Test Store' : 'Production'} key`);

        // Configure Purchases SDK with error handling
        const purchasesConfig: any = {
            apiKey,
            // Use observer mode on Android to avoid conflicts
            observerMode: Platform.OS === 'android',
        };

        // Add platform-specific configuration
        if (Platform.OS === 'ios') {
            purchasesConfig.usesStoreKit2IfAvailable = true;
        }

        await Purchases.configure(purchasesConfig);

        console.log('✅ RevenueCat initialized successfully');
        console.log('💡 Tip: If running in Expo Go, purchases won\'t work. Use: eas build --platform ios --profile preview');

        // If userId provided, identify the user
        if (config?.userId) {
            await setCurrentUserId(config.userId);
        }

        return { success: true };
    } catch (error: any) {
        console.error('❌ RevenueCat initialization failed:', {
            message: error?.message,
            code: error?.code,
            fullError: error,
        });
        return { success: false, error };
    }
};

/**
 * Set or update the current user ID
 * Useful when user logs in or registers
 */
export const setCurrentUserId = async (userId: string) => {
    try {
        if (!userId) return { success: false, error: 'User ID is required' };

        Purchases.logIn(userId);
        console.log(`✅ User identified: ${userId}`);
        return { success: true, userId };
    } catch (error) {
        console.error('❌ Failed to identify user:', error);
        return { success: false, error };
    }
};

/**
 * Logout current user
 */
export const logoutRevenueCat = async () => {
    try {
        Purchases.logOut();
        console.log('✅ User logged out from RevenueCat');
        return { success: true };
    } catch (error) {
        console.error('❌ Failed to logout:', error);
        return { success: false, error };
    }
};

/**
 * Get current customer info
 * Includes purchase history, active subscriptions, and entitlements
 */
export const getCustomerInfo = async (): Promise<CustomerInfo | null> => {
    try {
        const customerInfo = await Purchases.getCustomerInfo();
        console.log('✅ Customer info retrieved:', {
            userId: customerInfo.originalAppUserId,
            subscriptions: Object.keys(customerInfo.activeSubscriptions),
            entitlements: Object.keys(customerInfo.entitlements.active),
        });
        return customerInfo;
    } catch (error) {
        console.error('❌ Failed to get customer info:', error);
        return null;
    }
};

/**
 * Check if user has a specific entitlement
 * Used to verify Kontto Pro access
 */
export const hasEntitlement = async (entitlementId: string = ENTITLEMENT_ID): Promise<boolean> => {
    try {
        const customerInfo = await getCustomerInfo();
        if (!customerInfo) return false;

        const hasAccess = entitlementId in customerInfo.entitlements.active;
        console.log(`✅ Entitlement check for "${entitlementId}": ${hasAccess}`);
        return hasAccess;
    } catch (error) {
        console.error(`❌ Failed to check entitlement "${entitlementId}":`, error);
        return false;
    }
};

/**
 * Get offerings and products from RevenueCat
 * Offerings are created in the RevenueCat dashboard
 */
export const getOfferings = async (): Promise<PurchasesOffering | null> => {
    try {
        const offerings = await Purchases.getOfferings();

        // Try offerings.current first (standard case)
        let chosen = offerings.current;

        // If current is null, try offerings.all[OFFERING_ID] (when using Test Store)
        if (!chosen && (offerings as any).all) {
            chosen = (offerings as any).all[OFFERING_ID];
        }

        if (!chosen) {
            console.warn('⚠️ No offerings found. Make sure you have configured offerings in RevenueCat dashboard');
            console.warn('⚠️ Debug info:', { OFFERING_ID, offerings });
            return null;
        }

        console.log('✅ Offerings retrieved:', {
            offeringId: chosen.identifier,
            packageCount: chosen.availablePackages.length,
            packages: chosen.availablePackages.map(p => p.identifier),
        });

        return chosen;
    } catch (error) {
        console.error('❌ Failed to get offerings:', error);
        return null;
    }
};

/**
 * Get a specific package from offerings
 */
export const getPackage = async (packageIdentifier: string): Promise<PurchasesPackage | null> => {
    try {
        const offering = await getOfferings();
        if (!offering) return null;

        const pkg = offering.availablePackages.find(
            p => p.identifier === packageIdentifier || p.product.identifier === packageIdentifier
        );

        if (!pkg) {
            console.warn(`⚠️ Package "${packageIdentifier}" not found`);
            return null;
        }

        console.log(`✅ Package found: ${pkg.identifier}`, {
            price: pkg.product.priceString,
            period: pkg.product.subscriptionPeriod,
        });

        return pkg;
    } catch (error) {
        console.error(`❌ Failed to get package "${packageIdentifier}":`, error);
        return null;
    }
};

/**
 * Purchase a product
 */
export const purchasePackage = async (
    packageIdentifier: string,
    userId?: string
): Promise<{ success: boolean; customerInfo?: CustomerInfo; error?: string }> => {
    try {
        const pkg = await getPackage(packageIdentifier);
        if (!pkg) {
            return { success: false, error: `Package "${packageIdentifier}" not found` };
        }

        console.log(`💳 Attempting to purchase: ${packageIdentifier}`);

        const purchaseResult = await Purchases.purchasePackage(pkg);

        console.log('✅ Purchase successful!', {
            entitlements: Object.keys(purchaseResult.customerInfo.entitlements.active),
        });

        return { success: true, customerInfo: purchaseResult.customerInfo };
    } catch (error: any) {
        // Handle user cancellation
        if (error.userCancelled) {
            console.log('ℹ️ User cancelled purchase');
            return { success: false, error: 'User cancelled' };
        }

        console.error('❌ Purchase failed:', error);
        return { success: false, error: error.message || 'Purchase failed' };
    }
};

/**
 * Restore purchases
 * Useful when user switches devices or reinstalls the app
 */
export const restorePurchases = async (): Promise<{
    success: boolean;
    customerInfo?: CustomerInfo;
    error?: string;
}> => {
    try {
        console.log('🔄 Restoring purchases...');
        await Purchases.syncPurchases();
        const customerInfo = await Purchases.getCustomerInfo();

        console.log('✅ Purchases restored!', {
            subscriptions: Object.keys(customerInfo.activeSubscriptions),
            entitlements: Object.keys(customerInfo.entitlements.active),
        });

        return { success: true, customerInfo };
    } catch (error: any) {
        console.error('❌ Restore purchases failed:', error);
        return { success: false, error: error.message || 'Restore failed' };
    }
};

/**
 * Get all available products with pricing
 */
export const getAvailableProducts = async (): Promise<
    Array<PurchasesPackage & { price: string }> | null
> => {
    try {
        const offering = await getOfferings();
        if (!offering) return null;

        const products = offering.availablePackages.map(pkg => ({
            ...pkg,
            price: pkg.product.priceString,
        }));

        console.log('✅ Available products:', products.map(p => ({ id: p.identifier, price: p.price })));

        return products;
    } catch (error) {
        console.error('❌ Failed to get products:', error);
        return null;
    }
};

/**
 * Format price for display
 */
export const formatPrice = (priceString: string): string => {
    // priceString is typically something like "$9.99" or "€9,99"
    return priceString;
};

/**
 * Check if user is subscribed to any product
 */
export const isSubscribed = async (productId?: string): Promise<boolean> => {
    try {
        const customerInfo = await getCustomerInfo();
        if (!customerInfo) return false;

        if (productId) {
            // Check specific product
            return productId in customerInfo.activeSubscriptions;
        }

        // Check if any subscription is active
        return customerInfo.activeSubscriptions.length > 0;
    } catch (error) {
        console.error('❌ Failed to check subscription:', error);
        return false;
    }
};

/**
 * Get subscription renewal date
 */
export const getSubscriptionRenewalDate = async (
    productId?: string
): Promise<Date | null> => {
    try {
        const customerInfo = await getCustomerInfo();
        if (!customerInfo) return null;

        // Get the latest expiration date from active subscriptions
        let latestDate: Date | null = null;

        if (productId && productId in customerInfo.allExpirationDates) {
            const expirationDate = customerInfo.allExpirationDates[productId];
            if (expirationDate) {
                latestDate = new Date(expirationDate);
            }
        } else if (customerInfo.activeSubscriptions.length > 0) {
            // Get the first active subscription's expiration date
            const firstSub = customerInfo.activeSubscriptions[0];
            if (firstSub in customerInfo.allExpirationDates) {
                const expirationDate = customerInfo.allExpirationDates[firstSub];
                if (expirationDate) {
                    latestDate = new Date(expirationDate);
                }
            }
        }

        if (latestDate) {
            console.log('✅ Subscription renewal date:', latestDate.toISOString());
        }

        return latestDate;
    } catch (error) {
        console.error('❌ Failed to get subscription renewal date:', error);
        return null;
    }
};

/**
 * Setup RevenueCat listeners for real-time updates
 * Call this once to listen for purchase and entitlement changes
 */
export const setupRevenueCatListeners = (callbacks: {
    onCustomerInfoUpdated?: (customerInfo: CustomerInfo) => void;
    onPurchaseCompleted?: (product: string) => void;
    onEntitlementGranted?: (entitlement: string) => void;
}) => {
    try {
        // Listen for customer info updates (purchases, subscription changes)
        Purchases.addCustomerInfoUpdateListener((customerInfo: CustomerInfo) => {
            console.log('🔄 Customer info updated');
            callbacks.onCustomerInfoUpdated?.(customerInfo);

            // Check for newly granted entitlements
            if (customerInfo.entitlements.active.Kontto_Pro) {
                callbacks.onEntitlementGranted?.('Kontto Pro');
            }
        });

        console.log('✅ RevenueCat listeners initialized');
    } catch (error) {
        console.error('❌ Failed to setup listeners:', error);
    }
};

/**
 * Enable debug logs (useful for development)
 */
export const enableDebugLogs = () => {
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    console.log('✅ RevenueCat debug logs enabled');
};

/**
 * Disable debug logs
 */
export const disableDebugLogs = () => {
    Purchases.setLogLevel(LOG_LEVEL.INFO);
    console.log('✅ RevenueCat debug logs disabled');
};

export default {
    initializeRevenueCat,
    setCurrentUserId,
    logoutRevenueCat,
    getCustomerInfo,
    hasEntitlement,
    getOfferings,
    getPackage,
    purchasePackage,
    restorePurchases,
    getAvailableProducts,
    formatPrice,
    isSubscribed,
    getSubscriptionRenewalDate,
    setupRevenueCatListeners,
    enableDebugLogs,
    disableDebugLogs,
};
