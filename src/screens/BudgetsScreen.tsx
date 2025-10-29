import React, { useState, useMemo } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, Button, ProgressBar, CategoryIcon } from '../components/common';
import { Budget } from '../types';

// Símbolos de moneda
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$', CAD: 'C$', MXN: '$', BRL: 'R$', HNL: 'L', EUR: '€', GBP: '£',
};

const periodLabels: Record<string, string> = {
  daily: 'Diario',
  weekly: 'Semanal',
  monthly: 'Mensual',
  yearly: 'Anual',
};

export const BudgetsScreen = ({ navigation }: any) => {
  const {
    budgets,
    categories,
    transactions,
    addBudget,
    canCreateBudget,
    updateBudget,
    deleteBudget,
    preferredCurrency,
    recalculateBudgetsSpent
  } = useAppStore();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors, borderRadius), [colors]);
  const insets = useSafeAreaInsets();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);

  // Form states
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [currency, setCurrency] = useState(preferredCurrency);

  // Recalcular spent al cargar el componente
  React.useEffect(() => {
    recalculateBudgetsSpent();
  }, []);

  const formatCurrency = (amount: number, curr: string) => {
    const symbol = CURRENCY_SYMBOLS[curr] || curr;
    return `${symbol} ${amount.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Obtener categorías seleccionadas
  const getSelectedCategories = () => {
    return categories.filter(c => selectedCategoryIds.includes(c.id));
  };

  // Toggle selección de categoría
  const toggleCategory = (categoryId: string) => {
    setSelectedCategoryIds(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleAddBudget = () => {
    if (!amount || selectedCategoryIds.length === 0) {
      Alert.alert('Error', 'Por favor completa los campos requeridos');
      return;
    }

    const now = new Date();
    const startDate = new Date(now);
    const endDate = new Date(now);

    // Calcular fechas de inicio y fin según el período
    switch (period) {
      case 'daily':
        endDate.setDate(endDate.getDate() + 1);
        break;
      case 'weekly':
        endDate.setDate(endDate.getDate() + 7);
        break;
      case 'monthly':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case 'yearly':
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
    }

    if (editingBudget) {
      updateBudget(editingBudget.id, {
        categoryIds: selectedCategoryIds,
        amount: parseFloat(amount),
        currency,
        period,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
    } else {
      if (!canCreateBudget()) {
        Alert.alert('Límite alcanzado', 'Has alcanzado el límite de presupuestos gratuitos. ¿Quieres obtener Kontto Pro?', [
          { text: 'Más tarde' },
          { text: 'Obtener Pro', onPress: () => navigation.navigate('GetPro') },
        ]);
        return;
      }

      addBudget({
        categoryIds: selectedCategoryIds,
        amount: parseFloat(amount),
        currency,
        period,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
    }

    setModalVisible(false);
    resetForm();
  };

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget);
    setAmount(budget.amount.toString());
    setPeriod(budget.period);
    setSelectedCategoryIds([...budget.categoryIds]);
    setCurrency(budget.currency);
    setModalVisible(true);
  };

  const handleDeleteBudget = (budgetId: string) => {
    Alert.alert(
      'Eliminar Presupuesto',
      '¿Estás seguro de que deseas eliminar este presupuesto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            deleteBudget(budgetId);
            setDetailModalVisible(false);
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setAmount('');
    setPeriod('monthly');
    setSelectedCategoryIds([]);
    setCurrency(preferredCurrency);
    setEditingBudget(null);
  };

  const openDetailModal = (budget: Budget) => {
    setSelectedBudget(budget);
    setDetailModalVisible(true);
  };

  // Calcular estadísticas generales
  const totalBudgeted = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const overallProgress = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

  // Categorías de gastos para el formulario
  const expenseCategories = categories.filter(c => c.type === 'expense');

  return (
    <View style={styles.container}>
      {/* Header con estadísticas */}
      <View style={styles.header}>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Presupuesto Total</Text>
          <Text style={styles.summaryAmount}>{formatCurrency(totalBudgeted, preferredCurrency)}</Text>

          <View style={styles.progressContainer}>
            <ProgressBar
              progress={overallProgress}
              height={8}
            />
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryItemLabel}>Gastado</Text>
              <Text style={[styles.summaryItemValue, { color: colors.error }]}>
                {formatCurrency(totalSpent, preferredCurrency)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryItemLabel}>Disponible</Text>
              <Text style={[styles.summaryItemValue, { color: colors.success }]}>
                {formatCurrency(Math.max(0, totalBudgeted - totalSpent), preferredCurrency)}
              </Text>
            </View>
          </View>
        </Card>
      </View>

      {/* Lista de presupuestos */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {budgets.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Ionicons name="wallet-outline" size={64} color={colors.textTertiary} />
            <Text style={styles.emptyText}>No hay presupuestos</Text>
            <Text style={styles.emptySubtext}>
              Crea un presupuesto para controlar tus gastos por categoría
            </Text>
          </Card>
        ) : (
          budgets.map((budget) => {
            const spent = budget.spent;
            const progress = (spent / budget.amount) * 100;
            const isOverBudget = spent > budget.amount;
            const budgetCategories = categories.filter(c => budget.categoryIds.includes(c.id));

            return (
              <TouchableOpacity
                key={budget.id}
                onPress={() => openDetailModal(budget)}
                activeOpacity={0.7}
              >
                <Card style={styles.budgetCard}>
                  <View style={styles.budgetHeader}>
                    <View style={styles.budgetInfo}>
                      <View style={styles.categoriesIcons}>
                        {budgetCategories.slice(0, 3).map((cat, index) => (
                          <View
                            key={cat.id}
                            style={[
                              styles.categoryIconWrapper,
                              index > 0 && { marginLeft: -12 }
                            ]}
                          >
                            <CategoryIcon
                              icon={cat.icon}
                              color={cat.color}
                              size={20}
                            />
                          </View>
                        ))}
                        {budgetCategories.length > 3 && (
                          <View style={[styles.categoryIconWrapper, { marginLeft: -12 }]}>
                            <View style={styles.moreIcon}>
                              <Text style={styles.moreIconText}>+{budgetCategories.length - 3}</Text>
                            </View>
                          </View>
                        )}
                      </View>
                      <View style={styles.budgetTextInfo}>
                        {budgetCategories.length === 1 ? (
                          <Text style={styles.budgetName}>
                            {budgetCategories[0].name}
                          </Text>
                        ) : null}
                        <Text style={styles.budgetPeriod}>{periodLabels[budget.period]}</Text>
                      </View>
                    </View>
                    <View style={styles.budgetAmount}>
                      <Text style={[styles.spentAmount, isOverBudget && styles.overBudget]}>
                        {formatCurrency(spent, budget.currency)}
                      </Text>
                      <Text style={styles.totalAmount}>
                        de {formatCurrency(budget.amount, budget.currency)}
                      </Text>
                    </View>
                  </View>

                  <ProgressBar
                    progress={progress}
                    height={6}
                  />

                  <View style={styles.budgetFooter}>
                    <Text style={[styles.percentageText, isOverBudget && { color: colors.error }]}>
                      {progress.toFixed(0)}% utilizado
                    </Text>
                    {isOverBudget && (
                      <View style={styles.warningBadge}>
                        <Ionicons name="warning" size={14} color={colors.error} />
                        <Text style={styles.warningText}>Sobrepasado {(progress - 100).toFixed(0)}%</Text>
                      </View>
                    )}
                  </View>
                </Card>
              </TouchableOpacity>
            );
          })
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Botón flotante para agregar */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary, bottom: 16 + (insets.bottom || 0) }]}
        onPress={() => {
          resetForm();
          setModalVisible(true);
        }}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Modal para agregar/editar presupuesto */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setModalVisible(false);
          resetForm();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingBudget ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
              >
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Monto */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Monto del Presupuesto</Text>
                <TextInput
                  style={styles.input}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>

              {/* Período */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Período</Text>
                <View style={styles.periodSelector}>
                  {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((p) => (
                    <TouchableOpacity
                      key={p}
                      style={[
                        styles.periodButton,
                        period === p && { backgroundColor: colors.primary }
                      ]}
                      onPress={() => setPeriod(p)}
                    >
                      <Text
                        style={[
                          styles.periodButtonText,
                          period === p && { color: '#fff' }
                        ]}
                      >
                        {periodLabels[p]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Categorías */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Categorías</Text>
                <Text style={styles.sublabel}>Selecciona las categorías a incluir</Text>
                <View style={styles.categoriesGrid}>
                  {expenseCategories.map((category) => {
                    const isSelected = selectedCategoryIds.includes(category.id);
                    return (
                      <TouchableOpacity
                        key={category.id}
                        style={[
                          styles.categoryItem,
                          isSelected && {
                            backgroundColor: category.color + '20',
                            borderColor: category.color,
                            borderWidth: 2,
                          }
                        ]}
                        onPress={() => toggleCategory(category.id)}
                      >
                        <CategoryIcon
                          icon={category.icon}
                          color={category.color}
                          size={24}
                        />
                        <Text style={[styles.categoryName, isSelected && { fontWeight: '600' }]}>
                          {category.name}
                        </Text>
                        {isSelected && (
                          <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color={category.color}
                            style={styles.checkIcon}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={{ height: 20 }} />
            </ScrollView>

            <View style={[styles.modalFooter, { paddingBottom: spacing.xl + (insets.bottom || 0) }]}>
              <Button
                title={editingBudget ? 'Actualizar' : 'Crear Presupuesto'}
                onPress={handleAddBudget}
                variant="solidPrimary"
                style={[styles.button, { width: '100%' }]}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de detalles del presupuesto */}
      <Modal
        visible={detailModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedBudget && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Detalle del Presupuesto</Text>
                  <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                    <Ionicons name="close" size={24} color={colors.textPrimary} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                  {/* Información del presupuesto */}
                  <Card style={styles.detailCard}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Categorías:</Text>
                      <View style={styles.detailCategories}>
                        {categories
                          .filter(c => selectedBudget.categoryIds.includes(c.id))
                          .map(cat => (
                            <View key={cat.id} style={styles.detailCategoryChip}>
                              <CategoryIcon icon={cat.icon} color={cat.color} size={16} />
                              <Text style={styles.detailCategoryName}>{cat.name}</Text>
                            </View>
                          ))}
                      </View>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Período:</Text>
                      <Text style={styles.detailValue}>{periodLabels[selectedBudget.period]}</Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Fecha Inicio:</Text>
                      <Text style={styles.detailValue}>
                        {new Date(selectedBudget.startDate).toLocaleDateString('es-HN')}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Fecha Fin:</Text>
                      <Text style={styles.detailValue}>
                        {new Date(selectedBudget.endDate).toLocaleDateString('es-HN')}
                      </Text>
                    </View>

                    <View style={styles.detailDivider} />

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Presupuesto:</Text>
                      <Text style={[styles.detailValue, { fontWeight: '700' }]}>
                        {formatCurrency(selectedBudget.amount, selectedBudget.currency)}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Gastado:</Text>
                      <Text style={[styles.detailValue, { color: colors.error, fontWeight: '700' }]}>
                        {formatCurrency(selectedBudget.spent, selectedBudget.currency)}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Disponible:</Text>
                      <Text style={[styles.detailValue, { color: colors.success, fontWeight: '700' }]}>
                        {formatCurrency(
                          Math.max(0, selectedBudget.amount - selectedBudget.spent),
                          selectedBudget.currency
                        )}
                      </Text>
                    </View>
                  </Card>

                  {/* Transacciones relacionadas */}
                  <Text style={styles.sectionTitle}>Transacciones Recientes</Text>
                  {transactions
                    .filter(t => {
                      const transactionDate = new Date(t.date);
                      const startDate = new Date(selectedBudget.startDate);
                      const endDate = new Date(selectedBudget.endDate);
                      return (
                        t.type === 'expense' &&
                        selectedBudget.categoryIds.includes(t.categoryId) &&
                        transactionDate >= startDate &&
                        transactionDate <= endDate
                      );
                    })
                    .slice(0, 10)
                    .map((transaction) => {
                      const category = categories.find(c => c.id === transaction.categoryId);
                      return (
                        <Card key={transaction.id} style={styles.transactionCard}>
                          <View style={styles.transactionRow}>
                            {category && (
                              <CategoryIcon
                                icon={category.icon}
                                color={category.color}
                                size={20}
                              />
                            )}
                            <View style={styles.transactionInfo}>
                              <Text style={styles.transactionDescription}>
                                {transaction.description}
                              </Text>
                              <Text style={styles.transactionDate}>
                                {new Date(transaction.date).toLocaleDateString('es-HN')}
                              </Text>
                            </View>
                            <Text style={styles.transactionAmount}>
                              -{formatCurrency(transaction.amount, selectedBudget.currency)}
                            </Text>
                          </View>
                        </Card>
                      );
                    })}

                  <View style={{ height: 20 }} />
                </ScrollView>

                <View style={[styles.modalFooter, { flexDirection: 'column', paddingBottom: spacing.xl + (insets.bottom || 0) }]}>
                  <Button
                    title="Editar"
                    onPress={() => {
                      setDetailModalVisible(false);
                      handleEditBudget(selectedBudget);
                    }}
                    variant="solidPrimary"
                    style={[styles.button, { width: '100%', marginBottom: spacing.sm }]}
                  />
                  <Button
                    title="Eliminar"
                    onPress={() => handleDeleteBudget(selectedBudget.id)}
                    variant="solidPrimary"
                    style={[styles.button, styles.deleteButton, { width: '100%' }]}
                  />
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const createStyles = (colors: any, br: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.md,
    paddingTop: spacing.sm,
  },
  summaryCard: {
    padding: spacing.lg,
  },
  summaryLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  summaryAmount: {
    fontSize: typography.sizes['4xl'],
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  progressContainer: {
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
  },
  summaryItemLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  summaryItemValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  emptyCard: {
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.xl,
  },
  emptyText: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  budgetCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  budgetInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoriesIcons: {
    flexDirection: 'row',
    marginRight: spacing.sm,
  },
  categoryIconWrapper: {
    marginRight: spacing.xs,
  },
  moreIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
    backgroundColor: colors.surface,
  },
  moreIconText: {
    fontSize: 10,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
  },
  budgetTextInfo: {
    flex: 1,
  },
  budgetName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  budgetPeriod: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  budgetAmount: {
    alignItems: 'flex-end',
  },
  spentAmount: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  overBudget: {
    color: colors.error,
  },
  totalAmount: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  budgetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  percentageText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  warningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: br.sm,
  },
  warningText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.error,
    marginLeft: spacing.xs / 2,
  },
  fab: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: br.lg,
    borderTopRightRadius: br.lg,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  modalBody: {
    padding: spacing.md,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  sublabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: br.md,
    padding: spacing.md,
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  periodSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  periodButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: br.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  periodButtonText: {
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryItem: {
    width: '48%',
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: br.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryName: {
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  checkIcon: {
    marginLeft: spacing.xs,
  },
  button: {
    marginTop: 0,
  },
  deleteButton: {
    backgroundColor: colors.error,
  },
  detailCard: {
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  detailLabel: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
  },
  detailCategories: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginLeft: spacing.sm,
  },
  detailCategoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: br.sm,
    gap: spacing.xs / 2,
  },
  detailCategoryName: {
    fontSize: typography.sizes.sm,
    color: colors.textPrimary,
  },
  detailDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  transactionCard: {
    marginBottom: spacing.sm,
    padding: spacing.sm,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  transactionDescription: {
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
  },
  transactionDate: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  transactionAmount: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.error,
  },
});
