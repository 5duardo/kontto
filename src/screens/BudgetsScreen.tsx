import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';
import { spacing, typography, borderRadius, useTheme } from '../theme';
import { Card, Button, ProgressBar } from '../components/common';

type PeriodType = 'daily' | 'weekly' | 'monthly' | 'yearly';

const AVAILABLE_CURRENCIES = [
  { code: 'USD', name: 'Dólar Americano', symbol: '$' },
  { code: 'HNL', name: 'Lempira Hondureño', symbol: 'L' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'MXN', name: 'Peso Mexicano', symbol: '$' },
  { code: 'CAD', name: 'Dólar Canadiense', symbol: 'C$' },
];

export const BudgetsScreen = () => {
  const { budgets, categories, transactions, deleteBudget, addBudget, updateBudget, preferredCurrency } = useAppStore();
  const { colors } = useTheme();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState<PeriodType>('monthly');
  const [currency, setCurrency] = useState(preferredCurrency);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);

  const styles = useMemo(() => createStyles(colors), [colors]);

  const formatCurrency = (amount: number, currencyCode: string) => {
    const currencySymbols: Record<string, string> = {
      USD: '$',
      HNL: 'L',
      EUR: '€',
      MXN: '$',
      CAD: 'C$',
    };
    const symbol = currencySymbols[currencyCode] || currencyCode;
    return `${symbol} ${amount.toLocaleString('es-HN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const calculateSpent = (budget: any) => {
    const startDate = new Date(budget.startDate);
    const endDate = new Date(budget.endDate);

    return transactions
      .filter(
        (t) =>
          budget.categoryIds.includes(t.categoryId) &&
          t.type === 'expense' &&
          new Date(t.date) >= startDate &&
          new Date(t.date) <= endDate
      )
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  const getPeriodLabel = (p: string) => {
    switch (p) {
      case 'daily':
        return 'Diario';
      case 'weekly':
        return 'Semanal';
      case 'monthly':
        return 'Mensual';
      case 'yearly':
        return 'Anual';
      default:
        return p;
    }
  };

  const toggleCategory = (categoryId: string) => {
    if (selectedCategoryIds.includes(categoryId)) {
      setSelectedCategoryIds(selectedCategoryIds.filter((id) => id !== categoryId));
    } else {
      setSelectedCategoryIds([...selectedCategoryIds, categoryId]);
    }
  };

  const calculateDateRange = (selectedPeriod: PeriodType) => {
    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();

    switch (selectedPeriod) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        break;
      case 'weekly':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay());
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
    }

    return { startDate: startDate.toISOString(), endDate: endDate.toISOString() };
  };

  const openAddModal = () => {
    setEditingBudgetId(null);
    setSelectedCategoryIds([]);
    setAmount('');
    setPeriod('monthly');
    setCurrency(preferredCurrency);
    setModalVisible(true);
  };

  const openEditModal = (budgetId: string) => {
    const budget = budgets.find((b) => b.id === budgetId);
    if (budget) {
      setEditingBudgetId(budgetId);
      setSelectedCategoryIds(budget.categoryIds);
      setAmount(budget.amount.toString());
      setPeriod(budget.period);
      setCurrency(budget.currency);
      setModalVisible(true);
    }
  };

  const handleSave = () => {
    if (!amount || selectedCategoryIds.length === 0) {
      Alert.alert('Error', 'Por favor completa todos los campos y selecciona al menos una categoría');
      return;
    }

    const { startDate, endDate } = calculateDateRange(period);
    
    const budgetData = {
      categoryIds: selectedCategoryIds,
      amount: parseFloat(amount),
      currency,
      period,
      startDate,
      endDate,
    };

    if (editingBudgetId) {
      updateBudget(editingBudgetId, budgetData);
      Alert.alert('Éxito', 'Presupuesto actualizado');
    } else {
      addBudget(budgetData);
      Alert.alert('Éxito', 'Presupuesto creado');
    }

    setModalVisible(false);
  };

  const handleDelete = (budgetId: string) => {
    Alert.alert(
      'Eliminar Presupuesto',
      '¿Estás seguro de que deseas eliminar este presupuesto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deleteBudget(budgetId),
        },
      ]
    );
  };

  const selectedCurrencyData = AVAILABLE_CURRENCIES.find((c) => c.code === currency);

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
            const budgetCategories = categories.filter((c) => budget.categoryIds.includes(c.id));
            const spent = calculateSpent(budget);
            const progress = spent / budget.amount;
            const remaining = budget.amount - spent;
            const firstCategory = budgetCategories[0];

            return (
              <TouchableOpacity
                key={budget.id}
                onPress={() => openEditModal(budget.id)}
              >
                <Card style={styles.budgetCard}>
                  <View style={styles.budgetHeader}>
                    <View style={styles.budgetLeft}>
                      <View
                        style={[
                          styles.budgetIcon,
                          { backgroundColor: `${firstCategory?.color || colors.primary}20` },
                        ]}
                      >
                        <Ionicons
                          name={(firstCategory?.icon as any) || 'wallet'}
                          size={24}
                          color={firstCategory?.color || colors.primary}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.budgetName}>
                          {budgetCategories.length === 1
                            ? budgetCategories[0].name
                            : `${budgetCategories.length} categorías`}
                        </Text>
                        <Text style={styles.budgetPeriod}>
                          {getPeriodLabel(budget.period)}
                        </Text>
                        {budgetCategories.length > 1 && (
                          <View style={styles.categoriesList}>
                            {budgetCategories.slice(0, 3).map((cat) => (
                              <View
                                key={cat.id}
                                style={[styles.categoryTag, { backgroundColor: `${cat.color}20` }]}
                              >
                                <Text style={[styles.categoryTagText, { color: cat.color }]}>
                                  {cat.name}
                                </Text>
                              </View>
                            ))}
                            {budgetCategories.length > 3 && (
                              <Text style={styles.moreCategories}>
                                +{budgetCategories.length - 3}
                              </Text>
                            )}
                          </View>
                        )}
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        handleDelete(budget.id);
                      }}
                    >
                      <Ionicons name="trash-outline" size={20} color={colors.error} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.budgetAmounts}>
                    <View style={styles.budgetAmountItem}>
                      <Text style={styles.budgetAmountLabel}>Gastado</Text>
                      <Text style={[styles.budgetAmountValue, { color: colors.expense }]}>
                        {formatCurrency(spent, budget.currency)}
                      </Text>
                    </View>
                    <View style={styles.budgetAmountItem}>
                      <Text style={styles.budgetAmountLabel}>Presupuesto</Text>
                      <Text style={styles.budgetAmountValue}>
                        {formatCurrency(budget.amount, budget.currency)}
                      </Text>
                    </View>
                    <View style={styles.budgetAmountItem}>
                      <Text style={styles.budgetAmountLabel}>Restante</Text>
                      <Text
                        style={[
                          styles.budgetAmountValue,
                          { color: remaining >= 0 ? colors.success : colors.error },
                        ]}
                      >
                        {formatCurrency(remaining, budget.currency)}
                      </Text>
                    </View>
                  </View>

                  <ProgressBar
                    progress={progress}
                    color={progress > 0.9 ? colors.error : colors.primary}
                    showPercentage
                  />
                </Card>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={openAddModal}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      {/* Modal para Crear/Editar Presupuesto */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingBudgetId ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Período */}
              <Text style={styles.label}>Período de Tiempo</Text>
              <View style={styles.periodContainer}>
                {(['daily', 'weekly', 'monthly', 'yearly'] as PeriodType[]).map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.periodButton,
                      period === p && styles.periodButtonActive,
                    ]}
                    onPress={() => setPeriod(p)}
                  >
                    <Text
                      style={[
                        styles.periodButtonText,
                        period === p && styles.periodButtonTextActive,
                      ]}
                    >
                      {getPeriodLabel(p)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Monto y Moneda */}
              <Text style={styles.label}>Monto del Presupuesto</Text>
              <View style={styles.amountContainer}>
                <TextInput
                  style={styles.amountInput}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0.00"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="numeric"
                />
                <TouchableOpacity
                  style={styles.currencyButton}
                  onPress={() => setShowCurrencyModal(true)}
                >
                  <Text style={styles.currencyButtonText}>
                    {selectedCurrencyData?.symbol} {currency}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Categorías */}
              <Text style={styles.label}>Categorías</Text>
              <Text style={styles.sectionDescription}>
                Selecciona una o más categorías. El presupuesto se gastará al realizar transacciones en estas categorías.
              </Text>
              <View style={styles.categoriesGrid}>
                {expenseCategories.map((category) => {
                  const isSelected = selectedCategoryIds.includes(category.id);
                  return (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryItem,
                        isSelected && styles.categoryItemActive,
                        { borderColor: category.color },
                      ]}
                      onPress={() => toggleCategory(category.id)}
                    >
                      <View
                        style={[
                          styles.categoryIcon,
                          { backgroundColor: isSelected ? category.color : `${category.color}20` },
                        ]}
                      >
                        <Ionicons
                          name={category.icon as any}
                          size={24}
                          color={isSelected ? '#fff' : category.color}
                        />
                      </View>
                      <Text
                        style={[
                          styles.categoryName,
                          isSelected && styles.categoryNameActive,
                        ]}
                      >
                        {category.name}
                      </Text>
                      {isSelected && (
                        <View style={styles.checkMark}>
                          <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={{ height: spacing.xl }} />
              <Button
                title={editingBudgetId ? 'Actualizar Presupuesto' : 'Crear Presupuesto'}
                onPress={handleSave}
              />
              <View style={{ height: spacing.xl }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal de Moneda */}
      <Modal
        visible={showCurrencyModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCurrencyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Moneda</Text>
              <TouchableOpacity onPress={() => setShowCurrencyModal(false)}>
                <Ionicons name="close" size={28} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalList}>
              {AVAILABLE_CURRENCIES.map((curr) => (
                <TouchableOpacity
                  key={curr.code}
                  style={[
                    styles.modalItem,
                    currency === curr.code && styles.modalItemActive,
                  ]}
                  onPress={() => {
                    setCurrency(curr.code);
                    setShowCurrencyModal(false);
                  }}
                >
                  <View style={styles.currencyInfo}>
                    <Text style={styles.currencyCode}>
                      {curr.symbol} {curr.code}
                    </Text>
                    <Text style={styles.currencyName}>{curr.name}</Text>
                  </View>
                  {currency === curr.code && (
                    <Ionicons name="checkmark" size={24} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
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
  categoriesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  categoryTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  categoryTagText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
  moreCategories: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    paddingHorizontal: spacing.sm,
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '90%',
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
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold as any,
    color: colors.textPrimary,
  },
  modalBody: {
    padding: spacing.lg,
  },
  label: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold as any,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  periodContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  periodButton: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: `${colors.primary}20`,
    borderColor: colors.primary,
  },
  periodButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium as any,
    color: colors.textSecondary,
  },
  periodButtonTextActive: {
    color: colors.primary,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  amountInput: {
    flex: 1,
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold as any,
    color: colors.textPrimary,
    backgroundColor: colors.background,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  currencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  currencyButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium as any,
    color: colors.textPrimary,
  },
  sectionDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryItem: {
    width: '48%',
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    position: 'relative',
  },
  categoryItemActive: {
    backgroundColor: colors.surfaceElevated,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoryName: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  categoryNameActive: {
    color: colors.textPrimary,
    fontWeight: typography.weights.semibold as any,
  },
  checkMark: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
  },
  modalList: {
    padding: spacing.md,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
  },
  modalItemActive: {
    backgroundColor: `${colors.primary}10`,
  },
  currencyInfo: {
    flex: 1,
  },
  currencyCode: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as any,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  currencyName: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
});
