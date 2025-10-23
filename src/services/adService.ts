/**
 * Servicio de gestión de anuncios
 * Compatible con Expo - usando modal nativo
 */

export const AD_UNIT_IDS = {
    // Banner ads
    BANNER_HOME: 'ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyyyy',
    BANNER_TRANSACTIONS: 'ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyyyy',

    // Interstitial ads
    INTERSTITIAL_ADD_TRANSACTION: 'ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyyyy',
    INTERSTITIAL_TRANSFER: 'ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyyyy',

    // Reward ads
    REWARD_GET_PRO: 'ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyyyy',
};

// Para pruebas, usa estos IDs de Google
export const TEST_AD_UNIT_IDS = {
    BANNER: 'ca-app-pub-3940256099942544/6300978111',
    INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712',
    REWARD: 'ca-app-pub-3940256099942544/5224354917',
};

/**
 * Inicializa el servicio de anuncios
 */
export const initializeAds = async () => {
    try {
        console.log('✅ Servicio de anuncios inicializado');
    } catch (error) {
        console.error('❌ Error inicializando anuncios:', error);
    }
};

/**
 * Determina si debe mostrar anuncios (ej: si el usuario no es premium)
 */
export const shouldShowAds = (isPremium: boolean): boolean => {
    return !isPremium;
};

/**
 * Tipos de anuncios disponibles
 */
export enum AdType {
    BANNER = 'banner',
    INTERSTITIAL = 'interstitial',
    REWARD = 'reward',
}

