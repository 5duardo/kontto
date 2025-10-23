import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    Alert,
    Modal,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { spacing, typography, useTheme } from '../theme';
import { Card } from '../components/common';

export const NotificationsSettingsScreen = ({ navigation }: any) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const [allNotifications, setAllNotifications] = useState(true);
    const [transactionNotifications, setTransactionNotifications] = useState(true);
    const [budgetNotifications, setBudgetNotifications] = useState(true);
    const [goalNotifications, setGoalNotifications] = useState(true);
    const [reminderTime, setReminderTime] = useState('09:00');
    const [timeDropdownVisible, setTimeDropdownVisible] = useState(false);

    const reminderTimes = ['07:00', '09:00', '12:00', '18:00', '21:00'];

    const handleTestNotification = () => {
        Alert.alert(
            'Notificación de Prueba',
            '¡Esta es una notificación de prueba! Las notificaciones están funcionando correctamente.',
            [{ text: 'OK' }]
        );
    };

    const handleTimeSelect = (time: string) => {
        setReminderTime(time);
        setTimeDropdownVisible(false);
    };

    return (
        <View style={styles.container}>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerIcon}>
                        <Ionicons name="notifications" size={32} color={colors.primary} />
                    </View>
                    <Text style={styles.headerTitle}>Notificaciones</Text>
                    <Text style={styles.headerSubtitle}>
                        Personaliza cómo y cuándo quieres recibir notificaciones sobre tu actividad financiera
                    </Text>
                </View>

                {/* Estado General */}
                <Card style={styles.statusCard}>
                    <View style={styles.statusHeader}>
                        <View style={styles.statusInfo}>
                            <Text style={styles.statusTitle}>Estado de Notificaciones</Text>
                            <Text style={styles.statusSubtitle}>
                                {allNotifications ? 'Activadas' : 'Desactivadas'}
                            </Text>
                        </View>
                        <View style={[styles.statusIndicator, { backgroundColor: allNotifications ? '#10B981' : '#EF4444' }]} />
                    </View>
                    <TouchableOpacity
                        style={styles.testButton}
                        onPress={handleTestNotification}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="notifications-circle" size={20} color={colors.primary} />
                        <Text style={styles.testButtonText}>Probar Notificación</Text>
                    </TouchableOpacity>
                </Card>

                {/* Control Principal */}
                <Card style={styles.mainControlCard}>
                    <View style={styles.mainControl}>
                        <View style={styles.mainControlInfo}>
                            <Ionicons name="notifications-outline" size={24} color={colors.primary} />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.mainControlTitle}>Todas las Notificaciones</Text>
                                <Text style={styles.mainControlSubtitle}>
                                    Activar o desactivar todas las notificaciones de la app
                                </Text>
                            </View>
                        </View>
                        <Switch
                            value={allNotifications}
                            onValueChange={(value) => {
                                setAllNotifications(value);
                                if (!value) {
                                    setTransactionNotifications(false);
                                    setBudgetNotifications(false);
                                    setGoalNotifications(false);
                                }
                            }}
                            trackColor={{ false: colors.border, true: `${colors.primary}40` }}
                            thumbColor={allNotifications ? colors.primary : colors.textTertiary}
                            ios_backgroundColor={colors.border}
                        />
                    </View>
                </Card>

                {/* Tipos de Notificaciones */}
                {allNotifications && (
                    <>
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Tipos de Notificaciones</Text>

                            <Card style={styles.notificationCard}>
                                <View style={styles.notificationItem}>
                                    <View style={[styles.iconContainer, { backgroundColor: '#3B82F615' }]}>
                                        <Ionicons name="swap-horizontal" size={22} color="#3B82F6" />
                                    </View>
                                    <View style={styles.notificationContent}>
                                        <Text style={styles.notificationTitle}>Transacciones</Text>
                                        <Text style={styles.notificationSubtitle}>
                                            Recibe notificaciones cuando completes transacciones importantes
                                        </Text>
                                    </View>
                                    <Switch
                                        value={transactionNotifications}
                                        onValueChange={setTransactionNotifications}
                                        trackColor={{ false: colors.border, true: '#3B82F640' }}
                                        thumbColor={transactionNotifications ? '#3B82F6' : colors.textTertiary}
                                        ios_backgroundColor={colors.border}
                                    />
                                </View>
                            </Card>

                            <Card style={styles.notificationCard}>
                                <View style={styles.notificationItem}>
                                    <View style={[styles.iconContainer, { backgroundColor: '#F59E0B15' }]}>
                                        <Ionicons name="pie-chart" size={22} color="#F59E0B" />
                                    </View>
                                    <View style={styles.notificationContent}>
                                        <Text style={styles.notificationTitle}>Presupuestos</Text>
                                        <Text style={styles.notificationSubtitle}>
                                            Alertas cuando te acerques al límite de tus presupuestos
                                        </Text>
                                    </View>
                                    <Switch
                                        value={budgetNotifications}
                                        onValueChange={setBudgetNotifications}
                                        trackColor={{ false: colors.border, true: '#F59E0B40' }}
                                        thumbColor={budgetNotifications ? '#F59E0B' : colors.textTertiary}
                                        ios_backgroundColor={colors.border}
                                    />
                                </View>
                            </Card>

                            <Card style={styles.notificationCard}>
                                <View style={styles.notificationItem}>
                                    <View style={[styles.iconContainer, { backgroundColor: '#10B98115' }]}>
                                        <Ionicons name="flag" size={22} color="#10B981" />
                                    </View>
                                    <View style={styles.notificationContent}>
                                        <Text style={styles.notificationTitle}>Objetivos</Text>
                                        <Text style={styles.notificationSubtitle}>
                                            Actualizaciones de progreso en tus objetivos financieros
                                        </Text>
                                    </View>
                                    <Switch
                                        value={goalNotifications}
                                        onValueChange={setGoalNotifications}
                                        trackColor={{ false: colors.border, true: '#10B98140' }}
                                        thumbColor={goalNotifications ? '#10B981' : colors.textTertiary}
                                        ios_backgroundColor={colors.border}
                                    />
                                </View>
                            </Card>
                        </View>

                        {/* Hora de Recordatorio */}
                        <View style={styles.section}>
                            <View style={styles.reminderHeader}>
                                <View style={styles.reminderHeaderLeft}>
                                    <View style={styles.reminderIconBg}>
                                        <Ionicons name="time" size={24} color={colors.primary} />
                                    </View>
                                    <View>
                                        <Text style={styles.sectionTitle}>Recordatorio Diario</Text>
                                        <Text style={styles.sectionSubtitle}>
                                            Elige la hora preferida para tu resumen diario
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            <Card style={styles.timeCard}>
                                <View style={styles.timeInfo}>
                                    <Ionicons name="time" size={20} color={colors.primary} />
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.timeCurrentLabel}>Hora seleccionada</Text>
                                        <Text style={styles.timeCurrentValue}>{reminderTime}</Text>
                                    </View>
                                </View>

                                <View style={styles.timeDivider} />

                                {/* Dropdown Selector */}
                                <TouchableOpacity
                                    style={styles.dropdownTrigger}
                                    onPress={() => setTimeDropdownVisible(!timeDropdownVisible)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.dropdownTriggerContent}>
                                        <Ionicons name="time" size={18} color={colors.primary} />
                                        <Text style={styles.dropdownTriggerText}>
                                            Cambiar hora
                                        </Text>
                                    </View>
                                    <Ionicons
                                        name={timeDropdownVisible ? "chevron-up" : "chevron-down"}
                                        size={20}
                                        color={colors.primary}
                                    />
                                </TouchableOpacity>

                                {/* Dropdown Menu */}
                                {timeDropdownVisible && (
                                    <View style={styles.dropdownMenu}>
                                        {reminderTimes.map((time) => (
                                            <TouchableOpacity
                                                key={time}
                                                style={[
                                                    styles.dropdownItem,
                                                    reminderTime === time && styles.dropdownItemSelected,
                                                ]}
                                                onPress={() => handleTimeSelect(time)}
                                                activeOpacity={0.6}
                                            >
                                                <Ionicons
                                                    name="time"
                                                    size={16}
                                                    color={reminderTime === time ? colors.primary : colors.textSecondary}
                                                />
                                                <Text
                                                    style={[
                                                        styles.dropdownItemText,
                                                        reminderTime === time && styles.dropdownItemTextSelected,
                                                    ]}
                                                >
                                                    {time}
                                                </Text>
                                                {reminderTime === time && (
                                                    <Ionicons
                                                        name="checkmark-circle"
                                                        size={18}
                                                        color={colors.primary}
                                                    />
                                                )}
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </Card>
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

        // Status Card
        statusCard: {
            marginHorizontal: spacing.lg,
            marginBottom: spacing.lg,
        },
        statusHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: spacing.md,
        },
        statusInfo: {
            flex: 1,
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
        statusIndicator: {
            width: 12,
            height: 12,
            borderRadius: 6,
        },
        testButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.sm,
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.md,
            backgroundColor: `${colors.primary}10`,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: `${colors.primary}20`,
        },
        testButtonText: {
            fontSize: typography.sizes.sm,
            fontWeight: typography.weights.medium as any,
            color: colors.primary,
        },

        // Main Control
        mainControlCard: {
            marginHorizontal: spacing.lg,
            marginBottom: spacing.xl,
        },
        mainControl: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.md,
        },
        mainControlInfo: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.md,
            flex: 1,
        },
        mainControlTitle: {
            fontSize: typography.sizes.lg,
            fontWeight: typography.weights.semibold as any,
            color: colors.textPrimary,
            marginBottom: spacing.xs,
        },
        mainControlSubtitle: {
            fontSize: typography.sizes.sm,
            color: colors.textSecondary,
            flex: 1,
        },

        // Sections
        section: {
            marginTop: spacing.lg,
            paddingHorizontal: spacing.lg,
        },
        sectionTitle: {
            fontSize: typography.sizes.lg,
            fontWeight: typography.weights.bold as any,
            color: colors.textPrimary,
            marginBottom: spacing.sm,
        },
        sectionSubtitle: {
            fontSize: typography.sizes.sm,
            color: colors.textSecondary,
            marginBottom: spacing.lg,
            lineHeight: 20,
        },

        // Notification Cards
        notificationCard: {
            marginBottom: spacing.md,
        },
        notificationItem: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.md,
        },
        iconContainer: {
            width: 48,
            height: 48,
            borderRadius: 12,
            justifyContent: 'center',
            alignItems: 'center',
        },
        notificationContent: {
            flex: 1,
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
            lineHeight: 18,
        },

        // Time Selection
        reminderHeader: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            marginBottom: spacing.lg,
        },
        reminderHeaderLeft: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: spacing.md,
            flex: 1,
        },
        reminderIconBg: {
            width: 44,
            height: 44,
            borderRadius: 12,
            backgroundColor: `${colors.primary}15`,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: spacing.xs,
        },
        timeCard: {
            marginTop: spacing.md,
        },
        timeInfo: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.md,
            paddingBottom: spacing.md,
        },
        timeCurrentLabel: {
            fontSize: typography.sizes.sm,
            color: colors.textSecondary,
            marginBottom: spacing.xs,
        },
        timeCurrentValue: {
            fontSize: typography.sizes.lg,
            fontWeight: typography.weights.bold as any,
            color: colors.primary,
        },
        timeDivider: {
            height: 1,
            backgroundColor: colors.border,
            marginVertical: spacing.md,
        },
        // Dropdown Styles
        dropdownTrigger: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.md,
            backgroundColor: `${colors.primary}10`,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.primary,
            marginTop: spacing.sm,
        },
        dropdownTriggerContent: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            flex: 1,
        },
        dropdownTriggerText: {
            fontSize: typography.sizes.base,
            fontWeight: typography.weights.semibold as any,
            color: colors.primary,
        },
        dropdownMenu: {
            marginTop: spacing.md,
            backgroundColor: colors.backgroundSecondary,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.border,
            overflow: 'hidden',
        },
        dropdownItem: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.md,
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        dropdownItemSelected: {
            backgroundColor: `${colors.primary}10`,
            borderBottomColor: colors.primary,
        },
        dropdownItemText: {
            fontSize: typography.sizes.base,
            fontWeight: typography.weights.medium as any,
            color: colors.textPrimary,
            flex: 1,
        },
        dropdownItemTextSelected: {
            color: colors.primary,
            fontWeight: typography.weights.semibold as any,
        },
    });
