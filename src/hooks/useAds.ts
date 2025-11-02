import { useCallback } from 'react';
import { Alert } from 'react-native';

/**
 * Hook para mostrar anuncios interstitorios
 * Se muestran entre acciones del usuario
 */
export const useInterstitialAd = () => {
    const showInterstitialAd = useCallback(async () => {
        try {
            // TODO: Integrar con librería de anuncios real
            console.log('📺 Mostrando anuncio intersticial...');
            // await interstitialAd.show();
        } catch (error) {
            console.error('Error mostrando anuncio intersticial:', error);
        }
    }, []);

    return { showInterstitialAd };
};

/**
 * Hook para mostrar anuncios de recompensa
 * El usuario ve un anuncio a cambio de una recompensa
 */
export const useRewardAd = () => {
    const showRewardAd = useCallback(async (onReward: () => void) => {
        try {
            // TODO: Integrar con librería de anuncios real
            console.log('🎁 Mostrando anuncio de recompensa...');
            // await rewardAd.show();
            // Si el anuncio se completó:
            onReward?.();
        } catch (error) {
            console.error('Error mostrando anuncio de recompensa:', error);
            Alert.alert('Error', 'No se pudo cargar el anuncio');
        }
    }, []);

    return { showRewardAd };
};

/**
 * Hook para gestionar anuncios
 */
export const useAds = () => {
    const shouldShowBannerAd = true; // TODO: Obtener de preferencias del usuario

    return {
        shouldShowBannerAd,
    };
};

