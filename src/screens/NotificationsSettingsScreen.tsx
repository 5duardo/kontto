import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography, useTheme } from '../theme';
import { Card } from '../components/common';

export const NotificationsSettingsScreen = ({ navigation }: any) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    // Solo un toggle global para activar/desactivar notificaciones
    const [enabled, setEnabled] = useState(true);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerIcon}>
                    <Ionicons name="notifications" size={32} color={colors.primary} />
                </View>
                <Text style={styles.headerTitle}>Notificaciones</Text>
                <Text style={styles.headerSubtitle}>Activa o desactiva las notificaciones de la aplicación</Text>
            </View>

            <Card style={styles.controlCard}>
                <View style={styles.controlRow}>
                    <Text style={styles.controlTitle}>Notificaciones</Text>
                    <Switch
                        value={enabled}
                        onValueChange={setEnabled}
                        trackColor={{ false: colors.border, true: `${colors.primary}40` }}
                        thumbColor={enabled ? colors.primary : colors.textTertiary}
                        ios_backgroundColor={colors.border}
                    />
                </View>
            </Card>
        </View>
    );
};

const createStyles = (colors: any) =>
    StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },

        // Header
        header: {
            alignItems: 'center',
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.xl,
            paddingTop: spacing['2xl'],
        },
        headerIcon: {
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: `${colors.primary}15`,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: spacing.md,
        },
        headerTitle: {
            fontSize: typography.sizes['2xl'],
            fontWeight: typography.weights.bold as any,
            color: colors.textPrimary,
            marginBottom: spacing.sm,
            textAlign: 'center',
        },
        headerSubtitle: {
            fontSize: typography.sizes.base,
            color: colors.textSecondary,
            textAlign: 'center',
            lineHeight: 22,
        },

        // Control
        controlCard: {
            marginHorizontal: spacing.lg,
            marginTop: spacing.lg,
        },
        controlRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.md,
            gap: spacing.md,
        },
        controlTitle: {
            fontSize: typography.sizes.lg,
            fontWeight: typography.weights.semibold as any,
            color: colors.textPrimary,
        },
    });
