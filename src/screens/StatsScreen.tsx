import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';
import { spacing, typography, useTheme } from '../theme';
import { Card, ProgressBar } from '../components/common';

export const StatsScreen = () => {
  const { transactions, categories } = useAppStore();
  const { colors } = useTheme();

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

  const monthlyData = useMemo(() => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const data = [];

    for (let i = 0; i < 6; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      const month = date.getMonth();
      const year = date.getFullYear();

      const monthTransactions = transactions.filter((t) => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === month && tDate.getFullYear() === year;
      });

      const income = monthTransactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expense = monthTransactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      data.push({
        month: months[month],
        income,
        expense,
      });
    }

    return data;
  }, [transactions]);

  const totalExpense = expensesByCategory.reduce((sum, item) => sum + item.amount, 0);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Expenses by Category */}
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

      {/* Monthly Comparison */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Comparación Mensual</Text>
        {monthlyData.some((d) => d.income > 0 || d.expense > 0) ? (
          monthlyData.map((data, index) => (
            <Card key={index} style={styles.monthCard}>
              <Text style={styles.monthName}>{data.month}</Text>
              <View style={styles.monthStats}>
                <View style={styles.monthStat}>
                  <View style={styles.monthStatHeader}>
                    <Ionicons name="arrow-down" size={16} color={colors.income} />
                    <Text style={styles.monthStatLabel}>Ingresos</Text>
                  </View>
                  <Text style={[styles.monthStatValue, { color: colors.income }]}>
                    {formatCurrency(data.income)}
                  </Text>
                </View>
                <View style={styles.monthStat}>
                  <View style={styles.monthStatHeader}>
                    <Ionicons name="arrow-up" size={16} color={colors.expense} />
                    <Text style={styles.monthStatLabel}>Gastos</Text>
                  </View>
                  <Text style={[styles.monthStatValue, { color: colors.expense }]}>
                    {formatCurrency(data.expense)}
                  </Text>
                </View>
              </View>
              <View style={styles.balanceRow}>
                <Text style={styles.balanceLabel}>Balance</Text>
                <Text
                  style={[
                    styles.balanceValue,
                    { color: (data.income - data.expense) >= 0 ? colors.income : colors.expense },
                  ]}
                >
                  {formatCurrency(data.income - data.expense)}
                </Text>
              </View>
            </Card>
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Ionicons name="bar-chart-outline" size={48} color={colors.textTertiary} />
            <Text style={styles.emptyText}>No hay datos mensuales</Text>
          </Card>
        )}
      </View>
    </ScrollView>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  balanceLabel: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
  },
  balanceValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  emptyCard: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  emptyText: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
});
