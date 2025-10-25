import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography, useTheme } from '../theme';
import { useAppStore } from '../store/useAppStore';
import { exportAccountsToFile, pickAndImportAccounts } from '../services/dataService';

export const DataScreen = ({ navigation }: any) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const onLocalBackups = () => {
        navigation.navigate('LocalBackups');
    };

    const onImport = async () => {
        try {
            const res = await pickAndImportAccounts();
            if (!res) return; // cancelado

            // Reemplazar cuentas actuales por las importadas
            useAppStore.setState({ accounts: res.accounts });

            Alert.alert('Importación completa', `Se importaron ${res.accounts.length} cuentas${res.fileName ? ` desde "${res.fileName}"` : ''}.`);
        } catch (e: any) {
            Alert.alert('Error al importar', e?.message || 'No se pudo importar el archivo.');
        }
    };

    const onExport = async () => {
        try {
            const accounts = useAppStore.getState().accounts;
            const { fileName } = await exportAccountsToFile(accounts);
            Alert.alert('Exportación completa', `Se exportaron ${accounts.length} cuentas${fileName ? ` a "${fileName}"` : ''}.`);
        } catch (e: any) {
            Alert.alert('Error al exportar', e?.message || 'No se pudo exportar los datos.');
        }
    };

    const onDelete = () => {
        Alert.alert(
            'Eliminar mis datos',
            '¿Estás seguro que quieres eliminar permanentemente todos los datos? Esta acción no se puede deshacer.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: () => {
                        useAppStore.getState().clearAllData();
                        // Reiniciar el onboarding de configuración
                        useAppStore.setState({ hasCompletedSetupOnboarding: false });
                        Alert.alert(
                            'Datos eliminados',
                            'Todos tus datos han sido eliminados permanentemente. Se reiniciará la aplicación.'
                        );
                    }
                },
            ]
        );
    };

    const renderRow = (icon: string, title: string, subtitle: string, onPress: () => void) => (
        <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.rowLeft}>
                <Ionicons name={icon as any} size={22} color={colors.textPrimary} />
                <View style={styles.rowText}>
                    <Text style={styles.rowTitle}>{title}</Text>
                    <Text style={styles.rowSubtitle}>{subtitle}</Text>
                </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.section}>
                    {renderRow('reader-outline', 'Copias locales de datos', 'Crear y restaurar datos a partir de una copia local de datos', onLocalBackups)}
                    <View style={styles.divider} />
                    {renderRow('cloud-upload-outline', 'Importar cuentas', 'Importa un archivo .json con tus cuentas', onImport)}
                    <View style={styles.divider} />
                    {renderRow('download-outline', 'Exportar cuentas', 'Exporta tus cuentas a un archivo .json', onExport)}
                    <View style={styles.divider} />
                    {renderRow('trash-outline', 'Eliminar mis datos', 'Eliminar permanentemente todos los datos', onDelete)}
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
        row: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: spacing.md,
            backgroundColor: colors.backgroundSecondary,
            borderRadius: 8,
            paddingHorizontal: spacing.md,
        },
        rowLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
        rowText: { flex: 1 },
        rowTitle: { fontSize: typography.sizes.base, fontWeight: typography.weights.medium as any, color: colors.textPrimary },
        rowSubtitle: { fontSize: typography.sizes.sm, color: colors.textSecondary },
        divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
    });
