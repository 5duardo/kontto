import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';
import { spacing, typography, borderRadius, useTheme } from '../theme';
import { Card } from '../components/common';

export const TransactionsScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const { transactions, categories, deleteTransaction } = useAppStore();
  const styles = useMemo(() => createStyles(colors, borderRadius), [colors]);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const formatCurrency = (amount: number) => {
    return `L ${amount.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Obtener todos los meses/años con transacciones
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    transactions.forEach((t) => {
      const date = new Date(t.date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, '0')}`;
      months.add(monthYear);
    });
    
    // Convertir a array y ordenar descendentemente
    return Array.from(months)
      .sort()
      .reverse()
      .map((monthYear) => {
        const [year, month] = monthYear.split('-');
        const date = new Date(parseInt(year), parseInt(month));
        return {
          monthYear,
          label: date.toLocaleDateString('es-HN', { month: 'long', year: 'numeric' }),
          date,
        };
      });
  }, [transactions]);

  // Transacciones filtradas por mes seleccionado
  const filteredTransactions = useMemo(() => {
    return [...transactions]
      .filter((t) => {
        const tDate = new Date(t.date);
        return (
          tDate.getFullYear() === selectedDate.getFullYear() &&
          tDate.getMonth() === selectedDate.getMonth()
        );
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, selectedDate]);

  const currentMonthLabel = selectedDate.toLocaleDateString('es-HN', {
    month: 'long',
    year: 'numeric',
  });

  // Agrupar transacciones por día
  const transactionsByDay = useMemo(() => {
    const grouped: { [key: string]: typeof filteredTransactions } = {};
    filteredTransactions.forEach((t) => {
      const date = new Date(t.date).toLocaleDateString('es-HN');
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(t);
    });
    return grouped;
  }, [filteredTransactions]);

  return (
    <View style={styles.container}>
      {/* Month Selector Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.monthSelectorButton}
          onPress={() => setShowMonthPicker(true)}
        >
          <Ionicons name="calendar" size={20} color={colors.primary} />
          <Text style={styles.monthSelectorText}>{currentMonthLabel}</Text>
          <Ionicons name="chevron-down" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredTransactions.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Ionicons name="receipt-outline" size={64} color={colors.textTertiary} />
            <Text style={styles.emptyText}>Sin transacciones</Text>
            <Text style={styles.emptySubtext}>
              No hay transacciones en {currentMonthLabel}. Presiona el botón "+" para agregar una
            </Text>
          </Card>
        ) : (
          Object.entries(transactionsByDay).map(([day, dayTransactions]) => (
            <View key={day}>
              <Text style={styles.dayHeader}>{day}</Text>
              {dayTransactions.map((transaction) => {
                const category = categories.find((c) => c.id === transaction.categoryId);
                return (
                  <Card key={transaction.id} style={styles.transactionCard}>
                    <View style={styles.transactionRow}>
                      <View style={styles.transactionLeft}>
                        <View
                          style={[
                            styles.transactionIcon,
                            { backgroundColor: `${category?.color || colors.primary}20` },
                          ]}
                        >
                          <Ionicons
                            name={(category?.icon as any) || 'wallet'}
                            size={24}
                            color={category?.color || colors.primary}
                          />
                        </View>
                        <View style={styles.transactionInfo}>
                          <Text style={styles.transactionTitle}>
                            {category?.name || 'Sin categoría'}
                          </Text>
                          <Text style={styles.transactionDescription}>
                            {transaction.description}
                          </Text>
                          <Text style={styles.transactionTime}>
                            {new Date(transaction.date).toLocaleTimeString('es-HN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.transactionRight}>
                        <Text
                          style={[
                            styles.transactionAmount,
                            {
                              color:
                                transaction.type === 'income' ? colors.success : colors.error,
                            },
                          ]}
                        >
                          {transaction.type === 'income' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </Text>
                        <TouchableOpacity
                          onPress={() => deleteTransaction(transaction.id)}
                          style={styles.deleteButton}
                        >
                          <Ionicons name="trash-outline" size={20} color={colors.error} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </Card>
                );
              })}
            </View>
          ))
        )}
      </ScrollView>

      {/* Month Picker Modal */}
      <Modal
        visible={showMonthPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowMonthPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Mes</Text>
              <TouchableOpacity onPress={() => setShowMonthPicker(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.monthList} showsVerticalScrollIndicator={false}>
              {availableMonths.length === 0 ? (
                <View style={styles.emptyMonthList}>
                  <Text style={styles.emptyMonthText}>
                    No hay transacciones registradas
                  </Text>
                </View>
              ) : (
                availableMonths.map((month) => (
                  <TouchableOpacity
                    key={month.monthYear}
                    style={[
                      styles.monthOption,
                      selectedDate.getFullYear() === month.date.getFullYear() &&
                      selectedDate.getMonth() === month.date.getMonth() &&
                        styles.monthOptionActive,
                    ]}
                    onPress={() => {
                      setSelectedDate(month.date);
                      setShowMonthPicker(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.monthOptionText,
                        selectedDate.getFullYear() === month.date.getFullYear() &&
                        selectedDate.getMonth() === month.date.getMonth() &&
                          styles.monthOptionTextActive,
                      ]}
                    >
                      {month.label}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('AddTransaction', {})}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (colors: any, br: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  monthSelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: br.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  monthSelectorText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    textTransform: 'capitalize',
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  dayHeader: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.textSecondary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    marginLeft: spacing.sm,
    textTransform: 'capitalize',
  },
  emptyCard: {
    alignItems: 'center',
    padding: spacing['3xl'],
    marginTop: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  emptyText: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
  emptySubtext: {
    fontSize: typography.sizes.base,
    color: colors.textTertiary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  transactionCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: br.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  transactionDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  transactionTime: {
    fontSize: typography.sizes.xs,
    color: colors.textTertiary,
    marginTop: 2,
  },
  transactionRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  transactionAmount: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  deleteButton: {
    padding: spacing.xs,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: br.lg,
    borderTopRightRadius: br.lg,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  monthList: {
    paddingVertical: spacing.md,
  },
  monthOption: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  monthOptionActive: {
    backgroundColor: colors.primary + '15',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  monthOptionText: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  monthOptionTextActive: {
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
  emptyMonthList: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  emptyMonthText: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
  },
});
