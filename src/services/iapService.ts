/**
 * Módulo de compras in-app deshabilitado
 * Las compras se manejan manualmente a través del estado Pro
 */

export const initializeIAP = async () => {
    console.log('✅ IAP deshabilitado - usando modo manual');
    return true;
};

export const checkPurchases = async () => {
    return [];
};
