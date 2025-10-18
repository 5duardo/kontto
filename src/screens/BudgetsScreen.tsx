import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';
import { spacing, typography, borderRadius, useTheme } from '../theme';
import { Card, Button, ProgressBar } from '../components/common';

export const BudgetsScreen = () => {
  const { budgets, categories, transactions, addBudget, deleteBudget } = useAppStore();
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState<'monthly' | 'weekly' | 'yearly'>('monthly');

  const styles = useMemo(() => createStyles(colors), [colors]);

  const formatCurrency = (amount: number) => {
    return `L ${amount.toLocaleString('es-HN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const calculateSpent = (budgetId: string, categoryId: string) => {
    const budget = budgets.find((b) => b.id === budgetId);
    if (!budget) return 0;

    const now = new Date();
    const startDate = new Date(budget.startDate);
    const endDate = new Date(budget.endDate);

    return transactions
      .filter(
        (t) =>
          t.categoryId === categoryId &&
          t.type === 'expense' &&
          new Date(t.date) >= startDate &&
          new Date(t.date) <= endDate
      )
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const handleAddBudget = () => {
    if (!amount || !selectedCategoryId) {
      alert('Por favor completa todos los campos');
      return;
    }

    const now = new Date();
    let startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    let endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    if (period === 'weekly') {
      startDate = new Date(now);
      endDate = new Date(now);
      endDate.setDate(endDate.getDate() + 7);
    } else if (period === 'yearly') {
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31);
    }

    addBudget({
      categoryId: selectedCategoryId,
      amount: parseFloat(amount),
      period,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });

    setModalVisible(false);
    setAmount('');
    setSelectedCategoryId('');
  };

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {budgets.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Ionicons name="wallet-outline" size={64} color={colors.textTertiary} />
            <Text style={styles.emptyText}>No hay presupuestos</Text>
            <Text style={styles.emptySubtext}>
              Crea un presupuesto para controlar tus gastos
            </Text>
          </Card>
        ) : (
          budgets.map((budget) => {
            const category = categories.find((c) => c.id === budget.categoryId);
            const spent = calculateSpent(budget.id, budget.categoryId);
            const progress = spent / budget.amount;
            const remaining = budget.amount - spent;

            return (
              <Card key={budget.id} style={styles.budgetCard}>
                <View style={styles.budgetHeader}>
                  <View style={styles.budgetLeft}>
                    <View
                      style={[
                        styles.budgetIcon,
                        { backgroundColor: `${category?.color || colors.primary}20` },
                      ]}
                    >
                      <Ionicons
                        name={(category?.icon as any) || 'wallet'}
                        size={24}
                        color={category?.color || colors.primary}
                      />
                    </View>
                    <View>
                      <Text style={styles.budgetName}>{category?.name || 'Sin categoría'}</Text>
                      <Text style={styles.budgetPeriod}>
                        {period === 'weekly' && 'Semanal'}
                        {period === 'monthly' && 'Mensual'}
                        {period === 'yearly' && 'Anual'}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => deleteBudget(budget.id)}>
                    <Ionicons name="trash-outline" size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>

                <View style={styles.budgetAmounts}>
                  <View style={styles.budgetAmountItem}>
                    <Text style={styles.budgetAmountLabel}>Gastado</Text>
                    <Text style={[styles.budgetAmountValue, { color: colors.expense }]}>
                      {formatCurrency(spent)}
                    </Text>
                  </View>
                  <View style={styles.budgetAmountItem}>
                    <Text style={styles.budgetAmountLabel}>Presupuesto</Text>
                    <Text style={styles.budgetAmountValue}>{formatCurrency(budget.amount)}</Text>
                  </View>
                  <View style={styles.budgetAmountItem}>
                    <Text style={styles.budgetAmountLabel}>Restante</Text>
                    <Text
                      style={[
                        styles.budgetAmountValue,
                        { color: remaining >= 0 ? colors.success : colors.error },
                      ]}
                    >
                      {formatCurrency(remaining)}
                    </Text>
                  </View>
                </View>

                <ProgressBar
                  progress={progress}
                  color={progress > 0.9 ? colors.error : colors.primary}
                  showPercentage
                />
              </Card>
            );
          })
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      {/* Add Budget Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nuevo Presupuesto</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.label}>Categoría</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                {expenseCategories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryChip,
                      selectedCategoryId === category.id && styles.categoryChipActive,
                    ]}
                    onPress={() => setSelectedCategoryId(category.id)}
                  >
                    <Ionicons
                      name={category.icon as any}
                      size={20}
                      color={selectedCategoryId === category.id ? '#fff' : category.color}
                    />
                    <Text
                      style={[
                        styles.categoryChipText,
                        selectedCategoryId === category.id && styles.categoryChipTextActive,
                      ]}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.label}>Monto del presupuesto</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor={colors.textTertiary}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
              />

              <Text style={styles.label}>Período</Text>
              <View style={styles.periodButtons}>
                {['weekly', 'monthly', 'yearly'].map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[styles.periodButton, period === p && styles.periodButtonActive]}
                    onPress={() => setPeriod(p as any)}
                  >
                    <Text
                      style={[
                        styles.periodButtonText,
                        period === p && styles.periodButtonTextActive,
                      ]}
                    >
                      {p === 'weekly' && 'Semanal'}
                      {p === 'monthly' && 'Mensual'}
                      {p === 'yearly' && 'Anual'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Button title="Crear Presupuesto" onPress={handleAddBudget} fullWidth />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  emptyCard: {
    alignItems: 'center',
    padding: spacing['3xl'],
    marginTop: spacing.xl,
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
  budgetCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  budgetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  budgetIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  budgetName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  budgetPeriod: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  budgetAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  budgetAmountItem: {
    alignItems: 'center',
  },
  budgetAmountLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  budgetAmountValue: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.backgroundSecondary,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  modalBody: {
    padding: spacing.lg,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  categoryScroll: {
    marginBottom: spacing.md,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    fontSize: typography.sizes.sm,
    color: colors.textPrimary,
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    fontSize: typography.sizes.lg,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  periodButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  periodButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  periodButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  periodButtonTextActive: {
    color: '#fff',
  },
});
