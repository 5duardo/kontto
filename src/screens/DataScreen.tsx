import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography, useTheme } from '../theme';

export const DataScreen = ({ navigation }: any) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const onLocalBackups = () => {
        Alert.alert('Copias locales de datos', 'Crear y restaurar datos a partir de una copia local de datos');
    };

    const onImport = () => {
        Alert.alert('Importar datos', 'Importar datos');
    };

    const onExport = () => {
        Alert.alert('Exportar datos', 'Exportar datos');
    };

    const onDelete = () => {
        Alert.alert(
            'Eliminar mis datos',
            '¿Estás seguro que quieres eliminar permanentemente todos los datos?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Eliminar', style: 'destructive', onPress: () => Alert.alert('Eliminado', 'Tus datos han sido eliminados (simulación)') },
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
                    {renderRow('cloud-upload-outline', 'Importar datos', 'Importar datos', onImport)}
                    <View style={styles.divider} />
                    {renderRow('download-outline', 'Exportar datos', 'Exportar datos', onExport)}
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
