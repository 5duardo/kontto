import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography, useTheme } from '../theme';

export const SyncSettingsScreen = ({ navigation }: any) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const [autoSync, setAutoSync] = useState(true);
    const [syncWiFiOnly, setSyncWiFiOnly] = useState(false);
    const [lastSync, setLastSync] = useState('Hace 2 horas');

    const handleManualSync = () => {
        Alert.alert('Sincronizando...', 'Los datos se están sincronizando');
        setTimeout(() => {
            setLastSync('Justo ahora');
            Alert.alert('Éxito', 'Datos sincronizados correctamente');
        }, 2000);
    };

    const handleBackup = () => {
        Alert.alert('Crear copia de seguridad', 'Se está creando una copia de seguridad en la nube');
        setTimeout(() => {
            Alert.alert('Éxito', 'Copia de seguridad creada correctamente');
        }, 1500);
    };

    const handleRestore = () => {
        Alert.alert(
            'Restaurar datos',
            '¿Deseas restaurar los datos de la última copia de seguridad? Esta acción puede sobrescribir los datos actuales.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Restaurar',
                    style: 'destructive',
                    onPress: () => {
                        Alert.alert('Restaurando...', 'Los datos se están restaurando');
                        setTimeout(() => {
                            Alert.alert('Éxito', 'Datos restaurados correctamente');
                        }, 2000);
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Estado de Sincronización */}
                <View style={styles.section}>
                    <View style={styles.statusCard}>
                        <Ionicons name="checkmark-done" size={32} color={colors.primary} />
                        <View style={{ marginLeft: spacing.md, flex: 1 }}>
                            <Text style={styles.statusTitle}>Sincronización activa</Text>
                            <Text style={styles.statusSubtitle}>Última sincronización: {lastSync}</Text>
                        </View>
                    </View>
                </View>

                {/* Sincronización Automática */}
                <View style={styles.section}>
                    <View style={styles.settingRow}>
                        <View>
                            <Text style={styles.settingTitle}>Sincronización Automática</Text>
                            <Text style={styles.settingSubtitle}>Sincronizar cambios automáticamente</Text>
                        </View>
                        <Switch
                            value={autoSync}
                            onValueChange={setAutoSync}
                            trackColor={{ false: colors.border, true: `${colors.primary}50` }}
                            thumbColor={autoSync ? colors.primary : colors.textSecondary}
                        />
                    </View>
                </View>

                {/* Solo por WiFi */}
                {autoSync && (
                    <View style={styles.section}>
                        <View style={styles.settingRow}>
                            <View>
                                <Text style={styles.settingTitle}>Solo por WiFi</Text>
                                <Text style={styles.settingSubtitle}>Sincronizar solo con WiFi</Text>
                            </View>
                            <Switch
                                value={syncWiFiOnly}
                                onValueChange={setSyncWiFiOnly}
                                trackColor={{ false: colors.border, true: `${colors.primary}50` }}
                                thumbColor={syncWiFiOnly ? colors.primary : colors.textSecondary}
                            />
                        </View>
                    </View>
                )}

                {/* Acciones */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Acciones</Text>

                    <TouchableOpacity style={styles.actionButton} onPress={handleManualSync}>
                        <Ionicons name="sync" size={20} color={colors.primary} />
                        <Text style={styles.actionButtonText}>Sincronizar Ahora</Text>
                        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton} onPress={handleBackup}>
                        <Ionicons name="download" size={20} color="#06B6D4" />
                        <Text style={styles.actionButtonText}>Crear Copia de Seguridad</Text>
                        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton} onPress={handleRestore}>
                        <Ionicons name="arrow-up" size={20} color="#8B5CF6" />
                        <Text style={styles.actionButtonText}>Restaurar Datos</Text>
                        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>

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
        statusCard: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: spacing.lg,
            paddingHorizontal: spacing.md,
            backgroundColor: `${colors.primary}15`,
            borderRadius: 12,
            borderLeftWidth: 4,
            borderLeftColor: colors.primary,
        },
        statusTitle: {
            fontSize: typography.sizes.base,
            fontWeight: typography.weights.semibold as any,
            color: colors.textPrimary,
            marginBottom: spacing.xs,
        },
        statusSubtitle: {
            fontSize: typography.sizes.sm,
            color: colors.textSecondary,
        },
        settingRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.md,
            backgroundColor: colors.backgroundSecondary,
            borderRadius: 12,
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
    });

