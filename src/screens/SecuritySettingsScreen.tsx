import React, { useMemo, useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    Alert,
    TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography, useTheme } from '../theme';
import { useAppStore } from '../store/useAppStore';


export const SecuritySettingsScreen = ({ navigation }: any) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    // Store global
    const {
        pinEnabled: storePinEnabled,
        pin: storePin,
        setPinEnabled,
        setPin,
        validatePin,
    } = useAppStore();

    // Estado local
    const [showPinSetup, setShowPinSetup] = useState(false);
    const [pin, setLocalPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');

    const handleSetPin = () => {
        if (pin.length !== 4 || !pin.match(/^\d+$/)) {
            Alert.alert('Error', 'El PIN debe tener exactamente 4 dígitos');
            return;
        }
        if (pin !== confirmPin) {
            Alert.alert('Error', 'Los PINs no coinciden');
            return;
        }

        // Guardar en store
        setPin(pin);
        setPinEnabled(true);
        setShowPinSetup(false);
        setLocalPin('');
        setConfirmPin('');
        Alert.alert('Éxito', 'PIN establecido correctamente');
    };

    const handleRemovePin = () => {
        Alert.alert(
            'Eliminar PIN',
            '¿Estás seguro de que deseas eliminar el PIN?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: () => {
                        setPin('');
                        setPinEnabled(false);
                        Alert.alert('Éxito', 'PIN eliminado');
                    },
                },
            ]
        );
    };

    const handleChangePIN = () => {
        Alert.prompt(
            'Cambiar PIN',
            'Ingresa el PIN actual (4 dígitos)',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Continuar',
                    onPress: (currentPin?: string) => {
                        if (!currentPin || currentPin.length !== 4) {
                            Alert.alert('Error', 'El PIN debe tener exactamente 4 dígitos');
                            return;
                        }

                        if (!validatePin(currentPin)) {
                            Alert.alert('Error', 'PIN incorrecto');
                            return;
                        }

                        setShowPinSetup(true);
                        Alert.alert('Nuevo PIN', 'Ingresa un nuevo PIN (4 dígitos)');
                    },
                },
            ],
            'secure-text'
        );
    }; return (
        <View style={styles.container}>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Protección con PIN */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Protección con PIN</Text>
                    <View style={styles.settingRow}>
                        <View>
                            <Text style={styles.settingTitle}>PIN de Acceso</Text>
                            <Text style={styles.settingSubtitle}>
                                {storePinEnabled ? 'PIN establecido (4 dígitos)' : 'Configurar PIN de 4 dígitos'}
                            </Text>
                        </View>
                        <Switch
                            value={storePinEnabled}
                            onValueChange={(value) => {
                                if (!value) {
                                    handleRemovePin();
                                } else {
                                    setShowPinSetup(true);
                                }
                            }}
                            trackColor={{ false: colors.border, true: `${colors.primary}50` }}
                            thumbColor={storePinEnabled ? colors.primary : colors.textSecondary}
                        />
                    </View>

                    {storePinEnabled && (
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={handleChangePIN}
                        >
                            <Ionicons name="refresh" size={20} color={colors.primary} />
                            <Text style={styles.actionButtonText}>Cambiar PIN</Text>
                            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Información de Privacidad */}
                <View style={styles.section}>
                    <View style={styles.infoCard}>
                        <Ionicons name="information-circle" size={24} color={colors.primary} />
                        <Text style={styles.infoText}>
                            Tu seguridad es importante. Los datos se almacenan de forma encriptada y no se comparten con terceros.
                        </Text>
                    </View>
                </View>

                {/* Configuración de PIN */}
                {showPinSetup && (
                    <View style={styles.section}>
                        <View style={styles.pinSetupCard}>
                            <Text style={styles.pinSetupTitle}>Configurar PIN</Text>
                            <TextInput
                                style={styles.pinInput}
                                placeholder="PIN (4 dígitos)"
                                keyboardType="number-pad"
                                secureTextEntry
                                maxLength={4}
                                value={pin}
                                onChangeText={(text) => {
                                    // Solo permitir números
                                    const numericText = text.replace(/[^0-9]/g, '');
                                    setLocalPin(numericText);
                                }}
                                placeholderTextColor={colors.textSecondary}
                            />
                            <TextInput
                                style={styles.pinInput}
                                placeholder="Confirmar PIN"
                                keyboardType="number-pad"
                                secureTextEntry
                                maxLength={4}
                                value={confirmPin}
                                onChangeText={(text) => {
                                    // Solo permitir números
                                    const numericText = text.replace(/[^0-9]/g, '');
                                    setConfirmPin(numericText);
                                }}
                                placeholderTextColor={colors.textSecondary}
                            />
                            <View style={styles.pinButtonsContainer}>
                                <TouchableOpacity
                                    style={[styles.pinButton, { backgroundColor: colors.border }]}
                                    onPress={() => {
                                        setShowPinSetup(false);
                                        setPin('');
                                        setConfirmPin('');
                                    }}
                                >
                                    <Text style={[styles.pinButtonText, { color: colors.textPrimary }]}>
                                        Cancelar
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.pinButton, { backgroundColor: colors.primary }]}
                                    onPress={handleSetPin}
                                >
                                    <Text style={[styles.pinButtonText, { color: 'white' }]}>
                                        Establecer PIN
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}

                <View style={{ height: 60 }} />
            </ScrollView>
        </View>
    );
};

const createStyles = (colors: any) =>
    StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        content: { flex: 1 },
        section: {
            marginTop: spacing.lg,
            paddingHorizontal: spacing.md,
        },
        sectionTitle: {
            fontSize: typography.sizes.lg,
            fontWeight: typography.weights.bold as any,
            color: colors.textPrimary,
            marginBottom: spacing.md,
        },
        settingRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.md,
            backgroundColor: colors.backgroundSecondary,
            borderRadius: 12,
            marginBottom: spacing.md,
        },
        settingTitle: {
            fontSize: typography.sizes.base,
            fontWeight: typography.weights.semibold as any,
            color: colors.textPrimary,
            marginBottom: spacing.xs,
        },
        settingSubtitle: {
            fontSize: typography.sizes.sm,
            color: colors.textSecondary,
        },
        actionButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.md,
            backgroundColor: colors.backgroundSecondary,
            borderRadius: 12,
            marginBottom: spacing.md,
        },
        actionButtonText: {
            flex: 1,
            fontSize: typography.sizes.base,
            fontWeight: typography.weights.semibold as any,
            color: colors.textPrimary,
            marginLeft: spacing.md,
        },
        infoCard: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            paddingVertical: spacing.lg,
            paddingHorizontal: spacing.md,
            backgroundColor: `${colors.primary}15`,
            borderRadius: 12,
            borderLeftWidth: 4,
            borderLeftColor: colors.primary,
        },
        infoText: {
            flex: 1,
            fontSize: typography.sizes.sm,
            color: colors.textPrimary,
            marginLeft: spacing.md,
            lineHeight: 20,
        },
        pinSetupCard: {
            paddingVertical: spacing.lg,
            paddingHorizontal: spacing.md,
            backgroundColor: colors.backgroundSecondary,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: colors.primary,
        },
        pinSetupTitle: {
            fontSize: typography.sizes.base,
            fontWeight: typography.weights.semibold as any,
            color: colors.textPrimary,
            marginBottom: spacing.md,
        },
        pinInput: {
            fontSize: typography.sizes.base,
            color: colors.textPrimary,
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.md,
            backgroundColor: colors.background,
            borderRadius: 8,
            marginBottom: spacing.md,
            borderWidth: 1,
            borderColor: colors.border,
        },
        pinButtonsContainer: {
            flexDirection: 'row',
            gap: spacing.md,
        },
        pinButton: {
            flex: 1,
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.md,
            borderRadius: 8,
            alignItems: 'center',
        },
        pinButtonText: {
            fontSize: typography.sizes.base,
            fontWeight: typography.weights.semibold as any,
        },
    });
