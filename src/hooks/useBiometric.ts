import { useState, useEffect, useCallback } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';

interface BiometricAvailability {
    isBiometricAvailable: boolean;
    biometricTypes: string[];
    isDeviceSecure: boolean;
}

export const useBiometric = () => {
    const [biometricAvailability, setBiometricAvailability] = useState<BiometricAvailability>({
        isBiometricAvailable: false,
        biometricTypes: [],
        isDeviceSecure: false,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Detectar disponibilidad de biometría
    useEffect(() => {
        const checkBiometricAvailability = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Verificar si hay hardware biométrico disponible
                const compatible = await LocalAuthentication.hasHardwareAsync();
                const enrolled = await LocalAuthentication.isEnrolledAsync();

                // Obtener tipos de biometría disponibles
                let biometricTypes: string[] = [];
                if (compatible && enrolled) {
                    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
                    biometricTypes = types
                        .map((type) => {
                            if (type === LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION) {
                                return 'facial';
                            } else if (type === LocalAuthentication.AuthenticationType.FINGERPRINT) {
                                return 'fingerprint';
                            } else if (type === LocalAuthentication.AuthenticationType.IRIS) {
                                return 'iris';
                            }
                            return 'unknown';
                        })
                        .filter((type) => type !== 'unknown');
                }

                setBiometricAvailability({
                    isBiometricAvailable: compatible && enrolled,
                    biometricTypes,
                    isDeviceSecure: enrolled,
                });
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Error al verificar biometría';
                setError(errorMessage);
                setBiometricAvailability({
                    isBiometricAvailable: false,
                    biometricTypes: [],
                    isDeviceSecure: false,
                });
            } finally {
                setIsLoading(false);
            }
        };

        checkBiometricAvailability();
    }, []);

    // Autenticar con biometría
    const authenticate = useCallback(async (): Promise<boolean> => {
        try {
            setIsLoading(true);
            setError(null);

            const result = await LocalAuthentication.authenticateAsync({
                disableDeviceFallback: false,
            });

            return result.success;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error durante la autenticación biométrica';
            setError(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        ...biometricAvailability,
        authenticate,
        isLoading,
        error,
        isBiometricSupported: biometricAvailability.isBiometricAvailable,
    };
};

