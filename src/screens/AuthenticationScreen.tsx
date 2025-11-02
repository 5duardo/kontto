import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Keyboard,
    Dimensions,
    Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { spacing, typography, useTheme } from '../theme';
import { useAppStore } from '../store/useAppStore';

interface AuthenticationScreenProps {
    onAuthenticationSuccess: () => void;
}

export const AuthenticationScreen: React.FC<AuthenticationScreenProps> = ({
    onAuthenticationSuccess,
}) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    // Store
    const { validatePin, clearAllData } = useAppStore();

    // Local state
    const [pin, setPin] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [attemptCount, setAttemptCount] = useState(0);
    const [isLocked, setIsLocked] = useState(false);
    const [lockTimeRemaining, setLockTimeRemaining] = useState(0);

    // Timer para desbloqueo
    useEffect(() => {
        if (isLocked && lockTimeRemaining > 0) {
            const timer = setTimeout(() => {
                setLockTimeRemaining(lockTimeRemaining - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (isLocked && lockTimeRemaining === 0) {
            setIsLocked(false);
            setAttemptCount(0);
        }
    }, [isLocked, lockTimeRemaining]);

    // Auto-validar cuando se tienen 4 dígitos
    useEffect(() => {
        if (pin.length === 4) {
            handlePinSubmit();
        }
    }, [pin]);

    const handlePinSubmit = useCallback(() => {
        if (isLocked) {
            Alert.alert(
                'Acceso bloqueado',
                `Intenta de nuevo en ${lockTimeRemaining} segundo${lockTimeRemaining !== 1 ? 's' : ''}`
            );
            return;
        }

        if (pin.length !== 4) {
            return;
        }

        setIsLoading(true);
        Keyboard.dismiss();

        // Simular validación con pequeño delay para UX
        setTimeout(() => {
            if (validatePin(pin)) {
                setPin('');
                setAttemptCount(0);
                onAuthenticationSuccess();
            } else {
                const newAttemptCount = attemptCount + 1;
                setAttemptCount(newAttemptCount);

                if (newAttemptCount >= 3) {
                    setIsLocked(true);
                    setLockTimeRemaining(30); // 30 segundos de bloqueo
                    Alert.alert(
                        'Demasiados intentos',
                        'Tu acceso ha sido bloqueado por 30 segundos por seguridad'
                    );
                } else {
                    Alert.alert(
                        'PIN incorrecto',
                        `Intento ${newAttemptCount} de 3. Te quedan ${3 - newAttemptCount} intento${3 - newAttemptCount !== 1 ? 's' : ''}`
                    );
                }
                setPin('');
            }
            setIsLoading(false);
        }, 300);
    }, [pin, attemptCount, isLocked, lockTimeRemaining, validatePin, onAuthenticationSuccess]);

    const handlePinKeyPress = (digit: string) => {
        if (pin.length < 4 && !isLocked) {
            setPin(pin + digit);
        }
    };

    const handlePinDelete = () => {
        if (!isLocked) {
            setPin(pin.slice(0, -1));
        }
    };

    const PinKeypad = () => {
        const buttons = [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9],
            ['backspace', 0, 'none'],
        ];

        return (
            <View style={styles.keypad}>
                {buttons.map((row, rowIndex) => (
                    <View key={rowIndex} style={styles.keypadRow}>
                        {row.map((item) => {
                            if (item === 'none') {
                                return <View key="none" style={styles.keypadButtonPlaceholder} />;
                            }

                            if (item === 'backspace') {
                                return (
                                    <TouchableOpacity
                                        key="backspace"
                                        style={styles.keypadButton}
                                        onPress={handlePinDelete}
                                        disabled={isLoading || pin.length === 0}
                                    >
                                        <Ionicons name="backspace" size={28} color={colors.textPrimary} />
                                    </TouchableOpacity>
                                );
                            }

                            return (
                                <TouchableOpacity
                                    key={item}
                                    style={styles.keypadButton}
                                    onPress={() => handlePinKeyPress(item.toString())}
                                    disabled={isLoading}
                                >
                                    <Text style={styles.keypadButtonText}>{item}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                ))}
            </View>
        );
    };

    return (
        <LinearGradient
            colors={[colors.background, colors.backgroundSecondary]}
            style={styles.container}
        >
            <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <Ionicons name="lock-closed" size={60} color={colors.primary} />
                    <Text style={styles.title}>Acceso Seguro</Text>
                    <Text style={styles.subtitle}>Ingresa tu PIN de 4 dígitos</Text>
                </View>

                {/* PIN Input - 4 dots */}
                <View style={styles.pinInputContainer}>
                    {[0, 1, 2, 3].map((index) => (
                        <View
                            key={index}
                            style={[
                                styles.pinDot,
                                index < pin.length && styles.pinDotFilled,
                                isLocked && styles.pinDotError,
                            ]}
                        />
                    ))}
                </View>

                {/* Mensaje de intento */}
                {attemptCount > 0 && !isLocked && (
                    <Text style={styles.attemptsText}>
                        Intento {attemptCount} de 3
                    </Text>
                )}

                {isLocked && (
                    <Text style={styles.lockedText}>
                        Acceso bloqueado. Intenta en {lockTimeRemaining}s
                    </Text>
                )}

                {/* Teclado */}
                <PinKeypad />

                {/* Info de seguridad */}
                <View style={styles.securityInfo}>
                    <Ionicons name="shield-checkmark" size={16} color={colors.success} />
                    <Text style={styles.securityInfoText}>
                        Tu PIN es almacenado de forma segura
                    </Text>
                </View>
                {/* Olvidaste PIN */}
                <TouchableOpacity
                    onPress={() => {
                        Alert.alert(
                            '¿Olvidaste tu PIN?',
                            'Puedes contactar al soporte para recuperar el acceso o restablecer los datos locales (esto eliminará tus datos almacenados).',
                            [
                                {
                                    text: 'Contactar soporte',
                                    onPress: () => {
                                        const email = 'support@kontto.app';
                                        const subject = encodeURIComponent('Recuperación de PIN');
                                        const body = encodeURIComponent('Hola, necesito ayuda para recuperar mi PIN.');
                                        const url = `mailto:${email}?subject=${subject}&body=${body}`;
                                        Linking.openURL(url).catch(() => {
                                            Alert.alert('Error', 'No se pudo abrir el cliente de correo.');
                                        });
                                    },
                                },
                                {
                                    text: 'Restablecer datos',
                                    style: 'destructive',
                                    onPress: () => {
                                        Alert.alert(
                                            'Confirmar restablecimiento',
                                            '¿Estás seguro? Esto eliminará los datos locales y volverás al estado inicial.',
                                            [
                                                { text: 'Cancelar', style: 'cancel' },
                                                {
                                                    text: 'Restablecer',
                                                    style: 'destructive',
                                                    onPress: () => {
                                                        clearAllData();
                                                        Alert.alert('Restablecido', 'Los datos locales han sido eliminados.');
                                                    },
                                                },
                                            ]
                                        );
                                    },
                                },
                                { text: 'Cerrar', style: 'cancel' },
                            ]
                        );
                    }}
                    activeOpacity={0.7}
                    style={styles.forgotContainer}
                >
                    <Text style={styles.forgotText}>¿Olvidaste tu PIN? Toca aquí para recuperar</Text>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
};

const createStyles = (colors: any) => {
    const screenWidth = Dimensions.get('window').width;
    // Calcular tamaño de botón para que encajen 3 en una fila con espacios
    const availableWidth = screenWidth - spacing.lg * 2 - spacing.md * 4;
    const buttonSize = availableWidth / 3;

    return StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        content: {
            width: '100%',
            paddingHorizontal: spacing.lg,
            justifyContent: 'center',
            alignItems: 'center',
        },
        header: {
            alignItems: 'center',
            marginBottom: spacing.xl,
        },
        title: {
            fontSize: typography.sizes.xl,
            fontWeight: typography.weights.bold as any,
            color: colors.textPrimary,
            marginTop: spacing.lg,
        },
        subtitle: {
            fontSize: typography.sizes.base,
            color: colors.textSecondary,
            marginTop: spacing.xs,
        },
        pinInputContainer: {
            flexDirection: 'row',
            justifyContent: 'center',
            gap: spacing.lg,
            marginBottom: spacing.xl,
        },
        pinDot: {
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: colors.border,
            borderWidth: 2,
            borderColor: colors.border,
        },
        pinDotFilled: {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
        },
        pinDotError: {
            backgroundColor: colors.error,
            borderColor: colors.error,
        },
        attemptsText: {
            fontSize: typography.sizes.sm,
            color: colors.warning,
            marginBottom: spacing.lg,
            fontWeight: typography.weights.semibold as any,
        },
        lockedText: {
            fontSize: typography.sizes.sm,
            color: colors.error,
            marginBottom: spacing.lg,
            fontWeight: typography.weights.semibold as any,
        },
        keypad: {
            width: '100%',
            alignItems: 'center',
            gap: spacing.md,
            marginBottom: spacing.xl,
            marginTop: spacing.lg,
        },
        keypadRow: {
            flexDirection: 'row',
            justifyContent: 'center',
            gap: spacing.md,
            width: '100%',
        },
        keypadButton: {
            width: buttonSize,
            height: buttonSize,
            backgroundColor: colors.backgroundSecondary,
            borderRadius: 16,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.border,
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
        },
        keypadButtonPlaceholder: {
            width: buttonSize,
        },
        keypadButtonText: {
            fontSize: typography.sizes.lg,
            fontWeight: typography.weights.bold as any,
            color: colors.textPrimary,
        },
        securityInfo: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            justifyContent: 'center',
        },
        securityInfoText: {
            fontSize: typography.sizes.sm,
            color: colors.textSecondary,
        },
        forgotContainer: {
            marginTop: spacing.sm,
        },
        forgotText: {
            fontSize: typography.sizes.sm,
            color: colors.primary,
            fontWeight: typography.weights.semibold as any,
            textAlign: 'center',
        },
    });
};

