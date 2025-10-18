import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';
import { Transaction } from '../types';
import { spacing, typography, useTheme } from '../theme';
import { Card, ProgressBar } from '../components/common';

export const StatsScreen = () => {
  const { transactions, categories } = useAppStore();
  const { colors } = useTheme();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [showDetailedView, setShowDetailedView] = useState(false);
  
  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const formatCurrency = (amount: number) => {
    return `L ${amount.toLocaleString('es-HN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const styles = useMemo(() => createStyles(colors), [colors]);

  const expensesByCategory = useMemo(() => {
    const expenses = transactions.filter((t) => t.type === 'expense');
    const categoryTotals: { [key: string]: number } = {};

    expenses.forEach((expense) => {
      if (categoryTotals[expense.categoryId]) {
        categoryTotals[expense.categoryId] += expense.amount;
      } else {
        categoryTotals[expense.categoryId] = expense.amount;
      }
    });

    return Object.entries(categoryTotals)
      .map(([categoryId, amount]) => {
        const category = categories.find((c) => c.id === categoryId);
        return {
          name: category?.name || 'Sin categoría',
          amount,
          color: category?.color || colors.primary,
        };
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6);
  }, [transactions, categories]);

  // Fecha del primer mes que tiene transacciones (primero del mes)
  const earliestMonthDate = useMemo(() => {
    if (!transactions || transactions.length === 0) return null;
    const dates = transactions.map((t) => new Date(t.date));
    let min = dates[0];
    for (let i = 1; i < dates.length; i++) {
      if (dates[i] < min) min = dates[i];
    }
    return new Date(min.getFullYear(), min.getMonth(), 1);
  }, [transactions]);

  const monthlyData = useMemo(() => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const data: Array<any> = [];

    const today = new Date();
    // Si no hay transacciones, por defecto mostrar últimos 12 meses
    const start = earliestMonthDate ? new Date(earliestMonthDate) : new Date(today.getFullYear(), today.getMonth() - 11, 1);
    const end = new Date(today.getFullYear(), today.getMonth(), 1);

    // Iterar mes a mes desde start hasta end (inclusive)
    for (let d = new Date(start); d <= end; d.setMonth(d.getMonth() + 1)) {
      const month = d.getMonth();
      const year = d.getFullYear();

        const monthTransactions = transactions.filter((t: Transaction) => {
          const tDate = new Date(t.date);
          return tDate.getMonth() === month && tDate.getFullYear() === year;
        });

      const income = monthTransactions
        .filter((t: Transaction) => t.type === 'income')
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

      const expense = monthTransactions
        .filter((t: Transaction) => t.type === 'expense')
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

      data.push({
        month: months[month],
        monthNum: month,
        year,
        income,
        expense,
        balance: income - expense,
        transactions: monthTransactions,
      });
    }

    return data;
  }, [transactions, earliestMonthDate]);

  const selectedMonthData = useMemo(() => {
    return monthlyData.find(
      (d) => d.monthNum === selectedMonth.getMonth() && d.year === selectedMonth.getFullYear()
    );
  }, [selectedMonth, monthlyData]);

  const transactionsByType = useMemo(() => {
    if (!selectedMonthData) return { income: [] as Transaction[], expense: [] as Transaction[] };
    
    return {
      income: selectedMonthData.transactions
        .filter((t: Transaction) => t.type === 'income')
        .sort((a: Transaction, b: Transaction) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      expense: selectedMonthData.transactions
        .filter((t: Transaction) => t.type === 'expense')
        .sort((a: Transaction, b: Transaction) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    };
  }, [selectedMonthData]);

  // Trigger animation cuando hay datos
  useEffect(() => {
    if (selectedMonthData && (selectedMonthData.income > 0 || selectedMonthData.expense > 0)) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [selectedMonthData]);

  const handlePreviousMonth = () => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setSelectedMonth(newDate);
  };

  const isPrevMonthDisabled = () => {
    if (!earliestMonthDate) return false;
    const prev = new Date(selectedMonth);
    prev.setMonth(prev.getMonth() - 1);
    // comparar al primer día del mes
    const prevMonthStart = new Date(prev.getFullYear(), prev.getMonth(), 1);
    return prevMonthStart < earliestMonthDate;
  };

  const handleNextMonth = () => {
    const today = new Date();
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    
    // Solo avanzar si no hemos llegado al mes actual
    if (newDate <= today) {
      setSelectedMonth(newDate);
    }
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || 'Sin categoría';
  };

  const getCategoryColor = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.color || colors.textTertiary;
  };

  const isNextMonthDisabled = () => {
    const today = new Date();
    const nextMonth = new Date(selectedMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return nextMonth > today;
  };

  // Verificar si el mes actual tiene datos
  const hasMonthData = selectedMonthData && (selectedMonthData.income > 0 || selectedMonthData.expense > 0);

  const totalExpense = expensesByCategory.reduce((sum, item) => sum + item.amount, 0);

  const renderTransactionItem = (transaction: Transaction) => {
    const categoryColor = getCategoryColor(transaction.categoryId);
    const categoryName = categories.find((c) => c.id === transaction.categoryId)?.name || 'Sin categoría';

    return (
      <View key={transaction.id} style={styles.transactionItem}>
        <View style={styles.transactionLeft}>
          <View style={[styles.transactionDot, { backgroundColor: categoryColor }]} />
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionCategory}>{categoryName}</Text>
            <Text style={styles.transactionDate}>
              {new Date(transaction.date).toLocaleDateString('es-HN')}
            </Text>
          </View>
        </View>
        <Text
          style={[
            styles.transactionAmount,
            { color: transaction.type === 'income' ? colors.income : colors.expense },
          ]}
        >
          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
        </Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Month Selector */}
      <View style={styles.monthSelector}>
        <TouchableOpacity onPress={handlePreviousMonth} style={styles.monthButton} disabled={isPrevMonthDisabled()}>
          <Ionicons name="chevron-back" size={24} color={isPrevMonthDisabled() ? colors.textTertiary : colors.primary} />
        </TouchableOpacity>

        <View style={styles.monthDisplay}>
          <Text style={styles.monthDisplayText}>
            {selectedMonthData?.month} {selectedMonth.getFullYear()}
          </Text>
        </View>

        <TouchableOpacity 
          onPress={handleNextMonth} 
          style={styles.monthButton}
          disabled={isNextMonthDisabled()}
        >
          <Ionicons 
            name="chevron-forward" 
            size={24} 
            color={isNextMonthDisabled() ? colors.textTertiary : colors.primary} 
          />
        </TouchableOpacity>
      </View>

      {/* Month Summary Card */}
      {hasMonthData && (
        <View style={styles.section}>
          <Card style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <View style={styles.summaryIconContainer}>
                  <Ionicons name="arrow-down" size={20} color={colors.income} />
                </View>
                <View>
                  <Text style={styles.summaryLabel}>Ingresos</Text>
                  <Text style={[styles.summaryValue, { color: colors.income }]}>
                    {formatCurrency(selectedMonthData.income)}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.summaryItem}>
                <View style={styles.summaryIconContainer}>
                  <Ionicons name="arrow-up" size={20} color={colors.expense} />
                </View>
                <View>
                  <Text style={styles.summaryLabel}>Gastos</Text>
                  <Text style={[styles.summaryValue, { color: colors.expense }]}>
                    {formatCurrency(selectedMonthData.expense)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.balanceContainer}>
              <Text style={styles.balanceLabel}>Balance</Text>
              <Text
                style={[
                  styles.balanceValue,
                  { color: selectedMonthData.balance >= 0 ? colors.income : colors.expense },
                ]}
              >
                {formatCurrency(selectedMonthData.balance)}
              </Text>
            </View>
          </Card>
        </View>
      )}

      {/* Transactions List */}
      {selectedMonthData && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transacciones del Mes</Text>

          {/* Income Transactions */}
          {transactionsByType.income.length > 0 && (
            <Animated.View 
              style={[
                { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
              ]}
            >
              <View style={styles.transactionSection}>
                <Text style={styles.transactionSectionTitle}>
                  <Ionicons name="arrow-down" size={16} color={colors.income} /> Ingresos
                </Text>
                {transactionsByType.income.map((transaction: Transaction) => renderTransactionItem(transaction))}
              </View>
            </Animated.View>
          )}

          {/* Expense Transactions */}
          {transactionsByType.expense.length > 0 && (
            <Animated.View 
              style={[
                { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
              ]}
            >
              <View style={styles.transactionSection}>
                <Text style={styles.transactionSectionTitle}>
                  <Ionicons name="arrow-up" size={16} color={colors.expense} /> Gastos
                </Text>
                {transactionsByType.expense.map((transaction: Transaction) => renderTransactionItem(transaction))}
              </View>
            </Animated.View>
          )}

          {transactionsByType.income.length === 0 && transactionsByType.expense.length === 0 && (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyContent}>
                <Ionicons name="stats-chart" size={64} color={colors.textTertiary} />
                <Text style={styles.emptyTitle}>Las estadísticas estarían aquí</Text>
                <Text style={styles.emptySubtitle}>
                  Comienza a añadir ingresos o gastos para ver tus datos
                </Text>
              </View>
            </Card>
          )}
        </View>
      )}

      {/* Expenses by Category */}
      {hasMonthData && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gastos por Categoría</Text>
        {expensesByCategory.length > 0 ? (
          <>
            {expensesByCategory.map((item, index) => {
              const percentage = (item.amount / totalExpense) * 100;
              return (
                <Card key={index} style={styles.categoryCard}>
                  <View style={styles.categoryRow}>
                    <View style={styles.categoryLeft}>
                      <View style={[styles.categoryDot, { backgroundColor: item.color }]} />
                      <Text style={styles.categoryName}>{item.name}</Text>
                    </View>
                    <Text style={styles.categoryAmount}>{formatCurrency(item.amount)}</Text>
                  </View>
                  <ProgressBar progress={item.amount / totalExpense} color={item.color} />
                  <Text style={styles.categoryPercentage}>{percentage.toFixed(1)}%</Text>
                </Card>
              );
            })}
            
            <Card style={styles.totalCard}>
              <Text style={styles.totalLabel}>Total Gastado</Text>
              <Text style={styles.totalAmount}>{formatCurrency(totalExpense)}</Text>
            </Card>
          </>
        ) : (
          <Card style={styles.emptyCard}>
            <Ionicons name="pie-chart-outline" size={48} color={colors.textTertiary} />
            <Text style={styles.emptyText}>No hay datos de gastos</Text>
          </Card>
        )}
        </View>
      )}

      {/* Monthly Comparison removed per user request */}
    </ScrollView>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    monthSelector: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    monthButton: {
      padding: spacing.sm,
      borderRadius: 8,
    },
    monthDisplay: {
      paddingHorizontal: spacing.lg,
    },
    monthDisplayText: {
      fontSize: typography.sizes.lg,
      fontWeight: typography.weights.bold,
      color: colors.textPrimary,
    },
    section: {
      padding: spacing.lg,
    },
    sectionTitle: {
      fontSize: typography.sizes.xl,
      fontWeight: typography.weights.bold,
      color: colors.textPrimary,
      marginBottom: spacing.md,
    },
    summaryCard: {
      padding: spacing.lg,
    },
    summaryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    summaryItem: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    summaryIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.backgroundTertiary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    summaryLabel: {
      fontSize: typography.sizes.sm,
      color: colors.textSecondary,
      marginBottom: spacing.xs,
    },
    summaryValue: {
      fontSize: typography.sizes.lg,
      fontWeight: typography.weights.bold,
    },
    divider: {
      width: 1,
      height: 48,
      backgroundColor: colors.border,
      marginHorizontal: spacing.md,
    },
    balanceContainer: {
      alignItems: 'center',
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    balanceLabel: {
      fontSize: typography.sizes.sm,
      color: colors.textSecondary,
      marginBottom: spacing.xs,
    },
    balanceValue: {
      fontSize: typography.sizes['2xl'],
      fontWeight: typography.weights.bold,
    },
    transactionSection: {
      marginBottom: spacing.lg,
    },
    transactionSectionTitle: {
      fontSize: typography.sizes.base,
      fontWeight: typography.weights.bold,
      color: colors.textSecondary,
      marginBottom: spacing.md,
    },
    transactionItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      backgroundColor: colors.surface,
      borderRadius: 8,
      marginBottom: spacing.sm,
    },
    transactionLeft: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    transactionDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
    },
    transactionInfo: {
      flex: 1,
    },
    transactionCategory: {
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.medium,
      color: colors.textPrimary,
      marginBottom: spacing.xs,
    },
    transactionDate: {
      fontSize: typography.sizes.xs,
      color: colors.textTertiary,
    },
    transactionAmount: {
      fontSize: typography.sizes.base,
      fontWeight: typography.weights.bold,
    },
    categoryCard: {
      marginBottom: spacing.md,
      padding: spacing.md,
    },
    categoryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    categoryLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    categoryDot: {
      width: 16,
      height: 16,
      borderRadius: 8,
    },
    categoryName: {
      fontSize: typography.sizes.base,
      color: colors.textPrimary,
      fontWeight: typography.weights.medium,
    },
    categoryAmount: {
      fontSize: typography.sizes.base,
      fontWeight: typography.weights.bold,
      color: colors.textPrimary,
    },
    categoryPercentage: {
      fontSize: typography.sizes.sm,
      color: colors.textSecondary,
      textAlign: 'right',
      marginTop: spacing.xs,
    },
    totalCard: {
      padding: spacing.lg,
      alignItems: 'center',
      backgroundColor: colors.backgroundTertiary,
    },
    totalLabel: {
      fontSize: typography.sizes.sm,
      color: colors.textSecondary,
      marginBottom: spacing.xs,
    },
    totalAmount: {
      fontSize: typography.sizes['3xl'],
      fontWeight: typography.weights.bold,
      color: colors.expense,
    },
    monthCard: {
      marginBottom: spacing.md,
      padding: spacing.md,
    },
    monthName: {
      fontSize: typography.sizes.lg,
      fontWeight: typography.weights.bold,
      color: colors.textPrimary,
      marginBottom: spacing.md,
    },
    monthStats: {
      flexDirection: 'row',
      gap: spacing.lg,
      marginBottom: spacing.md,
    },
    monthStat: {
      flex: 1,
    },
    monthStatHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      marginBottom: spacing.xs,
    },
    monthStatLabel: {
      fontSize: typography.sizes.sm,
      color: colors.textSecondary,
    },
    monthStatValue: {
      fontSize: typography.sizes.lg,
      fontWeight: typography.weights.bold,
    },
    balanceRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    emptyCard: {
      alignItems: 'center',
      padding: spacing.xl,
      backgroundColor: colors.surface,
      borderRadius: 12,
    },
    emptyContent: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyTitle: {
      fontSize: typography.sizes.lg,
      fontWeight: typography.weights.bold,
      color: colors.textPrimary,
      marginTop: spacing.md,
      textAlign: 'center',
    },
    emptySubtitle: {
      fontSize: typography.sizes.sm,
      color: colors.textSecondary,
      marginTop: spacing.sm,
      textAlign: 'center',
    },
    emptyText: {
      fontSize: typography.sizes.base,
      color: colors.textSecondary,
      marginTop: spacing.md,
    },
  });
