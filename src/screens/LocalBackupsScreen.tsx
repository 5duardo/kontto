import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, RefreshControl, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography, useTheme } from '../theme';
import { useAppStore } from '../store/useAppStore';
import { createLocalBackup, listLocalBackups, restoreLocalBackup, deleteLocalBackup, shareLocalBackup, BackupInfo } from '../services/dataService';
import { useFocusEffect } from '@react-navigation/native';

export const LocalBackupsScreen = ({ navigation }: any) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const [backups, setBackups] = useState<BackupInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedBackupDetails, setSelectedBackupDetails] = useState<any>(null);

    const loadBackups = async () => {
        try {
            const backupList = await listLocalBackups();
            setBackups(backupList);
        } catch (e: any) {
            Alert.alert('Error', 'No se pudieron cargar los respaldos.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadBackups();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        loadBackups();
    };

    const handleCreateBackup = async () => {
        try {
            const state = useAppStore.getState();
            const backupData = {
                transactions: state.transactions,
                categories: state.categories,
                budgets: state.budgets,
                goals: state.goals,
                recurringPayments: state.recurringPayments,
                accounts: state.accounts,
            };

            await createLocalBackup(backupData);
            Alert.alert('Respaldo creado', 'Se ha creado una copia de seguridad local exitosamente.');
            loadBackups();
        } catch (e: any) {
            Alert.alert('Error', e?.message || 'No se pudo crear el respaldo.');
        }
    };

    const handleRestoreBackup = (backup: BackupInfo) => {
        Alert.alert(
            'Restaurar respaldo',
            `¿Estás seguro que quieres restaurar el respaldo del ${formatDate(backup.date)}? Esto reemplazará todos tus datos actuales.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Restaurar',
                    style: 'default',
                    onPress: async () => {
                        try {
                            const data = await restoreLocalBackup(backup.fileUri);

                            // Update store with restored data
                            useAppStore.setState({
                                transactions: data.transactions,
                                categories: data.categories,
                                budgets: data.budgets,
                                goals: data.goals,
                                recurringPayments: data.recurringPayments,
                                accounts: data.accounts,
                            });

                            Alert.alert('Restauración completa', 'Tus datos han sido restaurados exitosamente.');
                        } catch (e: any) {
                            Alert.alert('Error', e?.message || 'No se pudo restaurar el respaldo.');
                        }
                    },
                },
            ]
        );
    };

    const handleDeleteBackup = (backup: BackupInfo) => {
        Alert.alert(
            'Eliminar respaldo',
            `¿Estás seguro que quieres eliminar el respaldo del ${formatDate(backup.date)}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteLocalBackup(backup.fileUri);
                            Alert.alert('Eliminado', 'El respaldo ha sido eliminado.');
                            loadBackups();
                        } catch (e: any) {
                            Alert.alert('Error', 'No se pudo eliminar el respaldo.');
                        }
                    },
                },
            ]
        );
    };

    const handleShareBackup = async (backup: BackupInfo) => {
        try {
            await shareLocalBackup(backup.fileUri);
        } catch (e: any) {
            Alert.alert('Error', e?.message || 'No se pudo compartir el respaldo.');
        }
    };

    const handleViewBackupDetails = async (backup: BackupInfo) => {
        try {
            const data = await restoreLocalBackup(backup.fileUri);
            setSelectedBackupDetails({
                backup,
                data,
            });
            setDetailModalVisible(true);
        } catch (e: any) {
            Alert.alert('Error', e?.message || 'No se pudo cargar los detalles del respaldo.');
        }
    };

    const formatDate = (dateStr: string) => {
        try {
            if (!dateStr) return 'Fecha no disponible';

            let date: Date;

            // Si es un timestamp en milisegundos
            if (!isNaN(Number(dateStr)) && dateStr.length > 10) {
                date = new Date(Number(dateStr));
            } else {
                // Si es ISO string o fecha normal
                date = new Date(dateStr);
            }

            // Validar que la fecha sea correcta
            if (isNaN(date.getTime())) {
                return 'Fecha no disponible';
            }

            return date.toLocaleString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            });
        } catch (error) {
            return 'Fecha no disponible';
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const renderBackupItem = (backup: BackupInfo) => (
        <View key={backup.fileUri} style={styles.backupCard}>
            <View style={styles.backupHeader}>
                <Ionicons name="document-text" size={24} color={colors.primary} />
                <View style={styles.backupInfo}>
                    <Text style={styles.backupDate}>{formatDate(backup.date)}</Text>
                    <Text style={styles.backupSize}>{formatSize(backup.size)}</Text>
                </View>
            </View>

            <View style={styles.backupActions}>
                {/* Primera fila: Ver datos y Restaurar */}
                <View style={styles.actionRow}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleViewBackupDetails(backup)}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="eye" size={20} color={colors.primary} />
                        <Text style={styles.actionButtonText}>Ver datos</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleRestoreBackup(backup)}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="refresh" size={20} color={colors.primary} />
                        <Text style={styles.actionButtonText}>Restaurar</Text>
                    </TouchableOpacity>
                </View>

                {/* Segunda fila: Compartir y Eliminar */}
                <View style={styles.actionRow}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleShareBackup(backup)}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="share-outline" size={20} color={colors.textSecondary} />
                        <Text style={styles.actionButtonText}>Compartir</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleDeleteBackup(backup)}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="trash-outline" size={20} color={colors.error} />
                        <Text style={[styles.actionButtonText, { color: colors.error }]}>Eliminar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                }
            >
                <View style={styles.header}>
                    <Text style={styles.title}>Copias de Seguridad</Text>
                    <Text style={styles.subtitle}>
                        Crea y restaura copias de seguridad locales de todos tus datos
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.createButton}
                    onPress={handleCreateBackup}
                    activeOpacity={0.7}
                >
                    <Ionicons name="add-circle" size={24} color="#FFFFFF" />
                    <Text style={styles.createButtonText}>Crear nueva copia de seguridad</Text>
                </TouchableOpacity>

                {backups.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="folder-open-outline" size={64} color={colors.textSecondary} />
                        <Text style={styles.emptyText}>No hay copias de seguridad</Text>
                        <Text style={styles.emptySubtext}>
                            Crea tu primera copia de seguridad para proteger tus datos
                        </Text>
                    </View>
                ) : (
                    <View style={styles.backupsList}>
                        <Text style={styles.sectionTitle}>Respaldos disponibles ({backups.length})</Text>
                        {backups.map(renderBackupItem)}
                    </View>
                )}

                <View style={{ height: 60 }} />
            </ScrollView>

            {/* Modal de detalles del respaldo */}
            <Modal
                visible={detailModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setDetailModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {selectedBackupDetails && (
                            <>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>Datos del Respaldo</Text>
                                    <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                                        <Ionicons name="close" size={24} color={colors.textPrimary} />
                                    </TouchableOpacity>
                                </View>

                                <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                                    <View style={styles.detailSection}>
                                        <Text style={styles.detailDate}>
                                            {formatDate(selectedBackupDetails.backup.date)}
                                        </Text>
                                        <Text style={styles.detailSize}>
                                            Tamaño: {formatSize(selectedBackupDetails.backup.size)}
                                        </Text>
                                    </View>

                                    {selectedBackupDetails.data.accounts && selectedBackupDetails.data.accounts.length > 0 && (
                                        <View style={styles.dataCard}>
                                            <View style={styles.dataCardHeader}>
                                                <Ionicons name="wallet" size={20} color={colors.primary} />
                                                <Text style={styles.dataCardTitle}>Cuentas</Text>
                                                <Text style={styles.dataCardCount}>
                                                    {selectedBackupDetails.data.accounts.length}
                                                </Text>
                                            </View>
                                            {selectedBackupDetails.data.accounts.map((account: any) => (
                                                <View key={account.id} style={styles.dataItem}>
                                                    <Text style={styles.dataItemText}>{account.title}</Text>
                                                    <Text style={styles.dataItemValue}>
                                                        {account.currency} {account.balance.toFixed(2)}
                                                    </Text>
                                                </View>
                                            ))}
                                        </View>
                                    )}

                                    {selectedBackupDetails.data.categories && selectedBackupDetails.data.categories.length > 0 && (
                                        <View style={styles.dataCard}>
                                            <View style={styles.dataCardHeader}>
                                                <Ionicons name="pricetag" size={20} color={colors.primary} />
                                                <Text style={styles.dataCardTitle}>Categorías</Text>
                                                <Text style={styles.dataCardCount}>
                                                    {selectedBackupDetails.data.categories.length}
                                                </Text>
                                            </View>
                                            {selectedBackupDetails.data.categories.map((category: any) => (
                                                <View key={category.id} style={styles.dataItem}>
                                                    <Text style={styles.dataItemText}>{category.name}</Text>
                                                    <Text style={styles.dataItemValue}>{category.type === 'income' ? 'Ingreso' : 'Gasto'}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    )}

                                    {selectedBackupDetails.data.transactions && selectedBackupDetails.data.transactions.length > 0 && (
                                        <View style={styles.dataCard}>
                                            <View style={styles.dataCardHeader}>
                                                <Ionicons name="swap-horizontal" size={20} color={colors.primary} />
                                                <Text style={styles.dataCardTitle}>Transacciones</Text>
                                                <Text style={styles.dataCardCount}>
                                                    {selectedBackupDetails.data.transactions.length}
                                                </Text>
                                            </View>
                                            <Text style={styles.dataItemText}>
                                                {selectedBackupDetails.data.transactions.filter((t: any) => t.type === 'income').length} Ingresos
                                            </Text>
                                            <Text style={styles.dataItemText}>
                                                {selectedBackupDetails.data.transactions.filter((t: any) => t.type === 'expense').length} Gastos
                                            </Text>
                                        </View>
                                    )}

                                    {selectedBackupDetails.data.budgets && selectedBackupDetails.data.budgets.length > 0 && (
                                        <View style={styles.dataCard}>
                                            <View style={styles.dataCardHeader}>
                                                <Ionicons name="calculator" size={20} color={colors.primary} />
                                                <Text style={styles.dataCardTitle}>Presupuestos</Text>
                                                <Text style={styles.dataCardCount}>
                                                    {selectedBackupDetails.data.budgets.length}
                                                </Text>
                                            </View>
                                            {selectedBackupDetails.data.budgets.map((budget: any) => (
                                                <View key={budget.id} style={styles.dataItem}>
                                                    <Text style={styles.dataItemText}>
                                                        {budget.amount} {budget.currency}
                                                    </Text>
                                                    <Text style={styles.dataItemValue}>{budget.period}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    )}

                                    {selectedBackupDetails.data.goals && selectedBackupDetails.data.goals.length > 0 && (
                                        <View style={styles.dataCard}>
                                            <View style={styles.dataCardHeader}>
                                                <Ionicons name="flag" size={20} color={colors.primary} />
                                                <Text style={styles.dataCardTitle}>Metas</Text>
                                                <Text style={styles.dataCardCount}>
                                                    {selectedBackupDetails.data.goals.length}
                                                </Text>
                                            </View>
                                            {selectedBackupDetails.data.goals.map((goal: any) => (
                                                <View key={goal.id} style={styles.dataItem}>
                                                    <Text style={styles.dataItemText}>{goal.title}</Text>
                                                    <Text style={styles.dataItemValue}>
                                                        {goal.currentAmount} / {goal.targetAmount} {goal.currency}
                                                    </Text>
                                                </View>
                                            ))}
                                        </View>
                                    )}

                                    {selectedBackupDetails.data.recurringPayments && selectedBackupDetails.data.recurringPayments.length > 0 && (
                                        <View style={styles.dataCard}>
                                            <View style={styles.dataCardHeader}>
                                                <Ionicons name="repeat" size={20} color={colors.primary} />
                                                <Text style={styles.dataCardTitle}>Pagos Recurrentes</Text>
                                                <Text style={styles.dataCardCount}>
                                                    {selectedBackupDetails.data.recurringPayments.length}
                                                </Text>
                                            </View>
                                            {selectedBackupDetails.data.recurringPayments.map((payment: any) => (
                                                <View key={payment.id} style={styles.dataItem}>
                                                    <Text style={styles.dataItemText}>{payment.description}</Text>
                                                    <Text style={styles.dataItemValue}>{payment.frequency}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    )}

                                    <View style={{ height: 40 }} />
                                </ScrollView>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const createStyles = (colors: any) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        centerContent: {
            justifyContent: 'center',
            alignItems: 'center',
        },
        content: {
            flex: 1,
        },
        header: {
            padding: spacing.lg,
            paddingTop: spacing.md,
        },
        title: {
            fontSize: typography.sizes.xl,
            fontWeight: typography.weights.bold as any,
            color: colors.textPrimary,
            marginBottom: spacing.xs,
        },
        subtitle: {
            fontSize: typography.sizes.sm,
            color: colors.textSecondary,
            lineHeight: 20,
        },
        createButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.primary,
            marginHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            borderRadius: 12,
            gap: spacing.sm,
        },
        createButtonText: {
            fontSize: typography.sizes.base,
            fontWeight: typography.weights.semibold as any,
            color: '#FFFFFF',
        },
        backupsList: {
            marginTop: spacing.xl,
            paddingHorizontal: spacing.lg,
        },
        sectionTitle: {
            fontSize: typography.sizes.sm,
            fontWeight: typography.weights.semibold as any,
            color: colors.textSecondary,
            marginBottom: spacing.md,
            textTransform: 'uppercase',
        },
        backupCard: {
            backgroundColor: colors.backgroundSecondary,
            borderRadius: 12,
            padding: spacing.md,
            marginBottom: spacing.md,
        },
        backupHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.md,
            marginBottom: spacing.md,
        },
        backupInfo: {
            flex: 1,
        },
        backupDate: {
            fontSize: typography.sizes.base,
            fontWeight: typography.weights.medium as any,
            color: colors.textPrimary,
            marginBottom: 2,
        },
        backupSize: {
            fontSize: typography.sizes.sm,
            color: colors.textSecondary,
        },
        backupActions: {
            borderTopWidth: 1,
            borderTopColor: colors.border,
            paddingTop: spacing.md,
        },
        actionRow: {
            flexDirection: 'row',
            gap: spacing.md,
            marginBottom: spacing.sm,
        },
        actionButton: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.xs,
            paddingVertical: spacing.md,
            borderRadius: 8,
            backgroundColor: colors.background,
        },
        actionButtonText: {
            fontSize: typography.sizes.sm,
            fontWeight: typography.weights.medium as any,
            color: colors.textSecondary,
        },
        emptyState: {
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: spacing['3xl'],
            paddingHorizontal: spacing.xl,
        },
        emptyText: {
            fontSize: typography.sizes.lg,
            fontWeight: typography.weights.semibold as any,
            color: colors.textPrimary,
            marginTop: spacing.lg,
            marginBottom: spacing.xs,
        },
        emptySubtext: {
            fontSize: typography.sizes.sm,
            color: colors.textSecondary,
            textAlign: 'center',
            lineHeight: 20,
        },
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
        },
        modalContent: {
            backgroundColor: colors.background,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: '90%',
            paddingTop: spacing.md,
        },
        modalHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: spacing.lg,
            paddingBottom: spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        modalTitle: {
            fontSize: typography.sizes.lg,
            fontWeight: typography.weights.bold as any,
            color: colors.textPrimary,
        },
        modalBody: {
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
        },
        detailSection: {
            marginBottom: spacing.lg,
        },
        detailDate: {
            fontSize: typography.sizes.base,
            fontWeight: typography.weights.semibold as any,
            color: colors.textPrimary,
            marginBottom: spacing.xs,
        },
        detailSize: {
            fontSize: typography.sizes.sm,
            color: colors.textSecondary,
        },
        dataCard: {
            backgroundColor: colors.backgroundSecondary,
            borderRadius: 12,
            padding: spacing.md,
            marginBottom: spacing.md,
        },
        dataCardHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            marginBottom: spacing.md,
            paddingBottom: spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        dataCardTitle: {
            fontSize: typography.sizes.base,
            fontWeight: typography.weights.semibold as any,
            color: colors.textPrimary,
            flex: 1,
        },
        dataCardCount: {
            fontSize: typography.sizes.base,
            fontWeight: typography.weights.bold as any,
            color: colors.primary,
            backgroundColor: colors.primary + '20',
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs,
            borderRadius: 6,
        },
        dataItem: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: spacing.sm,
            borderBottomWidth: 1,
            borderBottomColor: colors.backgroundTertiary,
        },
        dataItemText: {
            fontSize: typography.sizes.sm,
            color: colors.textPrimary,
            flex: 1,
        },
        dataItemValue: {
            fontSize: typography.sizes.sm,
            color: colors.textSecondary,
            fontWeight: typography.weights.medium as any,
        },
    });

