import React, { useMemo, useState } from 'react';
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

export const SecuritySettingsScreen = ({ navigation }: any) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const [pinEnabled, setPinEnabled] = useState(false);
    const [biometricEnabled, setBiometricEnabled] = useState(false);
    const [showPinSetup, setShowPinSetup] = useState(false);
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');

    const handleSetPin = () => {
        if (pin.length < 4) {
            Alert.alert('Error', 'El PIN debe tener al menos 4 dígitos');
            return;
        }
        if (pin !== confirmPin) {
            Alert.alert('Error', 'Los PINs no coinciden');
            return;
        }
        setPinEnabled(true);
        setShowPinSetup(false);
        setPin('');
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
                        setPinEnabled(false);
                        Alert.alert('Éxito', 'PIN eliminado');
                    },
                },
            ]
        );
    };

    const handleToggleBiometric = (value: boolean) => {
        if (value && !pinEnabled) {
            Alert.alert(
                'PIN Requerido',
                'Debes establecer un PIN antes de habilitar la autenticación biométrica'
            );
            return;
        }
        setBiometricEnabled(value);
    };

    const handleChangePIN = () => {
        Alert.alert(
            'Cambiar PIN',
            'Se cerrará la sesión actual para cambiar el PIN. ¿Continuar?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Continuar',
                    onPress: () => {
                        setPinEnabled(false);
                        setBiometricEnabled(false);
                        setShowPinSetup(true);
                        Alert.alert('Ingresa un nuevo PIN');
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Protección con PIN */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Protección con PIN</Text>
                    <View style={styles.settingRow}>
                        <View>
                            <Text style={styles.settingTitle}>PIN de Acceso</Text>
                            <Text style={styles.settingSubtitle}>
                                {pinEnabled ? 'PIN establecido' : 'Configurar PIN'}
                            </Text>
                        </View>
                        <Switch
                            value={pinEnabled}
                            onValueChange={(value) => {
                                if (!value) {
                                    handleRemovePin();
                                } else {
                                    setShowPinSetup(true);
                                }
                            }}
                            trackColor={{ false: colors.border, true: `${colors.primary}50` }}
                            thumbColor={pinEnabled ? colors.primary : colors.textSecondary}
                        />
                    </View>

                    {pinEnabled && (
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

                {/* Autenticación Biométrica */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Biometría</Text>
                    <View style={styles.settingRow}>
                        <View>
                            <Text style={styles.settingTitle}>Autenticación Biométrica</Text>
                            <Text style={styles.settingSubtitle}>
                                Usar huella dactilar o reconocimiento facial
                            </Text>
                        </View>
                        <Switch
                            value={biometricEnabled && pinEnabled}
                            onValueChange={handleToggleBiometric}
                            disabled={!pinEnabled}
                            trackColor={{ false: colors.border, true: `${colors.primary}50` }}
                            thumbColor={biometricEnabled && pinEnabled ? colors.primary : colors.textSecondary}
                        />
                    </View>
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
                                maxLength={6}
                                value={pin}
                                onChangeText={setPin}
                                placeholderTextColor={colors.textSecondary}
                            />
                            <TextInput
                                style={styles.pinInput}
                                placeholder="Confirmar PIN"
                                keyboardType="number-pad"
                                secureTextEntry
                                maxLength={6}
                                value={confirmPin}
                                onChangeText={setConfirmPin}
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
