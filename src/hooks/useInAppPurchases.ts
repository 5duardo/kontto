// Temporary file-level ignore for TS until 'expo-in-app-purchases' types are available in the project
// @ts-nocheck
import { useEffect, useState, useRef } from 'react';
import { NativeModules, Platform, Alert } from 'react-native';
let InAppPurchases: any = null;

type Product = any;

const DEFAULT_PRODUCT_IDS = {
    weekly: 'KonttoPro1Semana',
    monthly: 'com.kontto.app.subscription.monthly',
    annual: 'com.kontto.app.subscription.annual',
    lifetime: 'com.kontto.app.subscription.lifetime',
};

const useInAppPurchases = (productIds: string[] = Object.values(DEFAULT_PRODUCT_IDS)) => {
    const [connected, setConnected] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastPurchases, setLastPurchases] = useState<any[] | null>(null);
    const [isModuleAvailable, setIsModuleAvailable] = useState(false);
    const listenerAttached = useRef(false);

    useEffect(() => {
        let mounted = true;

        const init = async () => {
            setLoading(true);
            try {
                // Try to require the native module dynamically. If it isn't present this will throw
                try {
                    InAppPurchases = require('expo-in-app-purchases');
                } catch (reqErr) {
                    const msg = 'Módulo nativo ExpoInAppPurchases no disponible. Reconstruye la app con: npx expo prebuild --clean && eas build --platform ios';
                    console.warn(msg, reqErr);
                    setError(msg);
                    setIsModuleAvailable(false);
                    setLoading(false);
                    return;
                }

                // If the native module object exists but the native implementation isn't linked, check NativeModules
                const nativeExists = !!(NativeModules && (NativeModules as any).ExpoInAppPurchases);
                if ((Platform.OS === 'ios' || Platform.OS === 'android') && !nativeExists) {
                    const msg = 'Módulo nativo ExpoInAppPurchases no vinculado. Reconstruye la app con: npx expo prebuild --clean && eas build --platform ios';
                    console.warn(msg);
                    setError(msg);
                    setIsModuleAvailable(false);
                    setLoading(false);
                    return;
                }

                setIsModuleAvailable(true);

                const connectResult = await InAppPurchases.connectAsync();
                if (!mounted) return;
                setConnected(true);

                // attach listener once
                if (!listenerAttached.current) {
                    InAppPurchases.setPurchaseListener((payload: any) => {
                        const { results, errorCode } = payload || {};
                        if (results && results.length) {
                            setLastPurchases(results);
                        }
                        // results: array of purchases
                        if (results && results.length) {
                            results.forEach(async (purchase: any) => {
                                try {
                                    // For subscriptions, acknowledge/finish the transaction
                                    await InAppPurchases.finishTransactionAsync(purchase, false);
                                } catch (e) {
                                    // swallow — the app can re-try
                                    console.warn('finishTransaction error', e);
                                }
                            });
                        }
                        if (errorCode) {
                            console.warn('IAP listener error', errorCode);
                        }
                    });
                    listenerAttached.current = true;
                }

                // fetch product details
                const { responseCode, results } = await InAppPurchases.getProductsAsync(productIds);
                if (!mounted) return;
                if (results) setProducts(results as Product[]);
                setLoading(false);
            } catch (e: any) {
                console.warn('IAP init error', e);
                setError(String(e?.message || e));
                setLoading(false);
            }
        };

        init();

        return () => {
            mounted = false;
            // Best-effort disconnect when unmount (only if available)
            try {
                if (InAppPurchases && typeof InAppPurchases.disconnectAsync === 'function') {
                    InAppPurchases.disconnectAsync().catch(() => { });
                }
            } catch (e) {
                // ignore
            }
        };
    }, [productIds]);

    const refreshProducts = async () => {
        setLoading(true);
        try {
            if (!InAppPurchases || typeof InAppPurchases.getProductsAsync !== 'function') {
                const msg = 'IAP module not available: cannot refresh products.';
                setError(msg);
                setLoading(false);
                return;
            }
            const { results } = await InAppPurchases.getProductsAsync(productIds);
            setProducts(results as Product[]);
        } catch (e: any) {
            setError(String(e?.message || e));
        } finally {
            setLoading(false);
        }
    };

    const buy = async (productId: string) => {
        setLoading(true);
        setError(null);
        try {
            if (!isModuleAvailable) {
                throw new Error('El módulo nativo de compras no está disponible. Necesitas reconstruir la app.\n\nEjecuta:\nnpx expo prebuild --clean\neas build --platform ios --profile preview');
            }
            if (!InAppPurchases || typeof InAppPurchases.purchaseItemAsync !== 'function') {
                throw new Error('Módulo IAP no disponible: no se puede iniciar la compra.');
            }
            await InAppPurchases.purchaseItemAsync(productId);
        } catch (e: any) {
            setError(String(e?.message || e));
            setLoading(false);
            throw e;
        } finally {
            setLoading(false);
        }
    };

    const restorePurchases = async () => {
        setLoading(true);
        try {
            if (!InAppPurchases || typeof InAppPurchases.getPurchaseHistoryAsync !== 'function') {
                const msg = 'IAP module not available: cannot restore purchases.';
                setError(msg);
                setLoading(false);
                return;
            }
            await InAppPurchases.getPurchaseHistoryAsync();
        } catch (e: any) {
            setError(String(e?.message || e));
        } finally {
            setLoading(false);
        }
    };

    return {
        connected,
        products,
        loading,
        error,
        lastPurchases,
        buy,
        refreshProducts,
        restorePurchases,
        DEFAULT_PRODUCT_IDS,
        isModuleAvailable,
    } as const;
};

export default useInAppPurchases;
