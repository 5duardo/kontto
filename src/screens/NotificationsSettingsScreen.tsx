import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography, useTheme } from '../theme';

export const NotificationsSettingsScreen = ({ navigation }: any) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const [allNotifications, setAllNotifications] = useState(true);
    const [transactionNotifications, setTransactionNotifications] = useState(true);
    const [budgetNotifications, setBudgetNotifications] = useState(true);
    const [goalNotifications, setGoalNotifications] = useState(true);
    const [reminderTime, setReminderTime] = useState('09:00');

    const reminderTimes = ['07:00', '09:00', '12:00', '18:00', '21:00'];

    return (
        <View style={styles.container}>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Todas las Notificaciones */}
                <View style={styles.section}>
                    <View style={styles.settingRow}>
                        <View>
                            <Text style={styles.settingTitle}>Todas las Notificaciones</Text>
                            <Text style={styles.settingSubtitle}>Habilitar todas las notificaciones</Text>
                        </View>
                        <Switch
                            value={allNotifications}
                            onValueChange={setAllNotifications}
                            trackColor={{ false: colors.border, true: `${colors.primary}50` }}
                            thumbColor={allNotifications ? colors.primary : colors.textSecondary}
                        />
                    </View>
                </View>

                {/* Tipos de Notificaciones */}
                {allNotifications && (
                    <>
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Tipos de Notificaciones</Text>

                            <View style={styles.notificationItem}>
                                <View style={[styles.iconContainer, { backgroundColor: '#3B82F620' }]}>
                                    <Ionicons name="swap-horizontal" size={20} color="#3B82F6" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.notificationTitle}>Transacciones</Text>
                                    <Text style={styles.notificationSubtitle}>
                                        Notificaciones de transacciones completadas
                                    </Text>
                                </View>
                                <Switch
                                    value={transactionNotifications}
                                    onValueChange={setTransactionNotifications}
                                    trackColor={{ false: colors.border, true: `${colors.primary}50` }}
                                    thumbColor={transactionNotifications ? colors.primary : colors.textSecondary}
                                />
                            </View>

                            <View style={styles.notificationItem}>
                                <View style={[styles.iconContainer, { backgroundColor: '#EC489920' }]}>
                                    <Ionicons name="pie-chart" size={20} color="#EC4899" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.notificationTitle}>Presupuestos</Text>
                                    <Text style={styles.notificationSubtitle}>
                                        Alertas cuando se aproxima al límite de presupuesto
                                    </Text>
                                </View>
                                <Switch
                                    value={budgetNotifications}
                                    onValueChange={setBudgetNotifications}
                                    trackColor={{ false: colors.border, true: `${colors.primary}50` }}
                                    thumbColor={budgetNotifications ? colors.primary : colors.textSecondary}
                                />
                            </View>

                            <View style={styles.notificationItem}>
                                <View style={[styles.iconContainer, { backgroundColor: '#10B98120' }]}>
                                    <Ionicons name="flag" size={20} color="#10B981" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.notificationTitle}>Objetivos</Text>
                                    <Text style={styles.notificationSubtitle}>
                                        Notificaciones de progreso de objetivos
                                    </Text>
                                </View>
                                <Switch
                                    value={goalNotifications}
                                    onValueChange={setGoalNotifications}
                                    trackColor={{ false: colors.border, true: `${colors.primary}50` }}
                                    thumbColor={goalNotifications ? colors.primary : colors.textSecondary}
                                />
                            </View>
                        </View>

                        {/* Hora de Recordatorio */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Hora de Recordatorio Diario</Text>
                            <View style={styles.timeGrid}>
                                {reminderTimes.map((time) => (
                                    <TouchableOpacity
                                        key={time}
                                        style={[
                                            styles.timeOption,
                                            reminderTime === time && styles.timeOptionSelected,
                                        ]}
                                        onPress={() => setReminderTime(time)}
                                    >
                                        <Text
                                            style={[
                                                styles.timeOptionText,
                                                reminderTime === time && styles.timeOptionTextSelected,
                                            ]}
                                        >
                                            {time}
                                        </Text>
                                        {reminderTime === time && (
                                            <Ionicons
                                                name="checkmark-circle"
                                                size={16}
                                                color={colors.primary}
                                            />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </>
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
        notificationItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.md,
            backgroundColor: colors.backgroundSecondary,
            borderRadius: 12,
            marginBottom: spacing.md,
        },
        iconContainer: {
            width: 44,
            height: 44,
            borderRadius: 10,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: spacing.md,
        },
        notificationTitle: {
            fontSize: typography.sizes.base,
            fontWeight: typography.weights.semibold as any,
            color: colors.textPrimary,
            marginBottom: spacing.xs,
        },
        notificationSubtitle: {
            fontSize: typography.sizes.sm,
            color: colors.textSecondary,
        },
        timeGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: spacing.md,
        },
        timeOption: {
            flex: 1,
            minWidth: '30%',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.sm,
            backgroundColor: colors.backgroundSecondary,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: colors.border,
        },
        timeOptionSelected: {
            borderColor: colors.primary,
            backgroundColor: `${colors.primary}10`,
        },
        timeOptionText: {
            fontSize: typography.sizes.base,
            fontWeight: typography.weights.semibold as any,
            color: colors.textSecondary,
        },
        timeOptionTextSelected: {
            color: colors.primary,
        },
    });
