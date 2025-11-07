/**
 * Hook de compras in-app deshabilitado
 * El módulo nativo ExpoInAppPurchases no está disponible
 * Las compras se manejan manualmente a través del estado Pro
 */

export const DEFAULT_PRODUCT_IDS = {
    weekly: 'KonttoPro1Semana',
};

const useInAppPurchases = () => {
    return {
        connected: false,
        products: [],
        loading: false,
        error: null,
        lastPurchases: null,
        buy: async () => {
            throw new Error('IAP deshabilitado - modo manual');
        },
        refreshProducts: async () => { },
        restorePurchases: async () => { },
        DEFAULT_PRODUCT_IDS,
        isModuleAvailable: false,
    } as const;
};

export default useInAppPurchases;

