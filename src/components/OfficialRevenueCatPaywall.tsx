import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useTheme } from '@theme';
import { RevenueCatPaywall } from './RevenueCatPaywall';

interface OfficialRevenueCatPaywallProps {
    onClose?: () => void;
    onPurchaseSuccess?: () => void;
}

/**
 * Official RevenueCat Paywall Component (Fallback)
 * 
 * Note: For full official paywall support on iOS, you need to:
 * 1. Create a Paywall in RevenueCat Dashboard
 * 2. Set entitlements correctly
 * 
 * For now, we're using the custom RevenueCatPaywall which works without dashboard configuration
 */
export const OfficialRevenueCatPaywall: React.FC<OfficialRevenueCatPaywallProps> = ({
    onClose,
    onPurchaseSuccess,
}) => {
    return (
        <RevenueCatPaywall
            onClose={onClose}
            onPurchaseSuccess={onPurchaseSuccess}
            showCloseButton={true}
        />
    );
};
