/**
 * RevenueCat Configuration
 * Manage API keys and settings for different environments
 */

export const REVENUECAT_CONFIG = {
    // API keys from RevenueCat Dashboard
    // Project Settings → API Keys

    // iOS App Store API Key
    iOS: {
        apiKey: 'appl_ZwOrAmxMqZTamXhNxjTefgIYDQL',
        bundleId: 'com.kontto.app',
    },

    // Android Google Play API Key
    android: {
        apiKey: 'appl_ZwOrAmxMqZTamXhNxjTefgIYDQL', // Update with Android key when available
        packageName: 'com.kontto.app',
    },

    // Entitlements (must match your RevenueCat dashboard)
    entitlements: {
        pro: 'Kontto Pro', // Entitlement ID for premium features
    },

    // Products (must match your app store listings)
    products: {
        weekly: 'weekly',
        monthly: 'monthly',
        yearly: 'yearly',
        lifetime: 'lifetime',
    },

    // Offering (from RevenueCat dashboard)
    offering: 'default', // Use the offering ID provided from RevenueCat dashboard

    // Debug options
    debug: {
        enableLogs: __DEV__, // Enable logs in development
        simulateNetwork: false, // Simulate network requests (for testing)
    },
};

/**
 * Get API Key for current platform
 */
export const getRevenueCatApiKey = (): string => {
    // This will be determined by Platform.OS in the actual service
    // For now, return a placeholder
    return 'YOUR_API_KEY_HERE';
};

/**
 * Validate configuration
 * Checks if API keys are properly configured
 */
export const validateRevenueCatConfig = (): {
    valid: boolean;
    errors: string[];
} => {
    const errors: string[] = [];

    if (
        REVENUECAT_CONFIG.iOS.apiKey === 'YOUR_IOS_PUBLIC_API_KEY' ||
        REVENUECAT_CONFIG.iOS.apiKey.length === 0
    ) {
        errors.push('iOS API key not configured');
    }

    if (
        REVENUECAT_CONFIG.android.apiKey === 'YOUR_ANDROID_PUBLIC_API_KEY' ||
        REVENUECAT_CONFIG.android.apiKey.length === 0
    ) {
        errors.push('Android API key not configured');
    }

    return {
        valid: errors.length === 0,
        errors,
    };
};
