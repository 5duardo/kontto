import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';
import { Transaction } from '../types';
import { spacing, typography, useTheme, borderRadius } from '../theme';
import { Card, ProgressBar } from '../components/common';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Mapeo de símbolos de moneda
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$', CAD: 'C$', MXN: '$', BRL: 'R$', ARS: '$', CLP: '$', COP: '$', PEN: 'S/',
  HNL: 'L', GTQ: 'Q', CRC: '₡', PAB: 'B/.', NIO: 'C$', DOP: 'RD$', UYU: '$U',
  BOB: 'Bs.', PYG: '₲', VES: 'Bs.', EUR: '€', GBP: '£', CHF: 'CHF', SEK: 'kr',
  NOK: 'kr', DKK: 'kr', PLN: 'zł', CZK: 'Kč', HUF: 'Ft', RON: 'lei', RUB: '₽',
  TRY: '₺', UAH: '₴', CNY: '¥', JPY: '¥', KRW: '₩', INR: '₹', IDR: 'Rp',
  THB: '฿', MYR: 'RM', SGD: 'S$', PHP: '₱', VND: '₫', PKR: '₨', BDT: '৳',
  LKR: 'Rs', MMK: 'K', KHR: '៛', LAK: '₭', HKD: 'HK$', TWD: 'NT$', AED: 'د.إ',
  SAR: '﷼', QAR: 'QR', KWD: 'د.ك', BHD: 'BD', OMR: 'ر.ع.', JOD: 'د.ا', ILS: '₪',
  IQD: 'د.ع', IRR: '﷼', LBP: 'ل.ل', ZAR: 'R', EGP: 'E£', NGN: '₦', KES: 'KSh',
  GHS: '₵', TZS: 'TSh', UGX: 'USh', MAD: 'د.م.', TND: 'د.ت', DZD: 'د.ج',
  AOA: 'Kz', ETB: 'Br', AUD: 'A$', NZD: 'NZ$', FJD: 'FJ$', BTC: '₿', ETH: 'Ξ',
};

// Reuse same month selector behavior as ScheduledPayments (prev/next + 12 months window)
const MONTHS_TO_SHOW = 12;

export const StatsScreen = () => {
  const { transactions, categories } = useAppStore();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(MONTHS_TO_SHOW - 1); // default to current month (last in window)
  const [showDetailedView, setShowDetailedView] = useState(false);
  const [granularity, setGranularity] = useState<'day' | 'week' | 'month'>('day');


  const formatCurrency = (amount: number, currency: string = 'HNL') => {
    const symbol = CURRENCY_SYMBOLS[currency] || currency;
    const decimals = 2;
    const formattedAmount = amount.toLocaleString('es-HN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    return `${symbol} ${formattedAmount}`;
  };

  const styles = useMemo(() => createStyles(colors), [colors]);

  // monthOptions derived from current month forward
  const monthDates = React.useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - (MONTHS_TO_SHOW - 1), 1);
    return Array.from({ length: MONTHS_TO_SHOW }, (_, i) => new Date(start.getFullYear(), start.getMonth() + i, 1));
  }, []);

  const monthOptions = React.useMemo(() => monthDates.map((d) => d.toLocaleDateString('es-HN', { year: 'numeric', month: 'long' })), [monthDates]);

  const selectedMonthKey = monthOptions[selectedMonthIndex] || monthOptions[0];

  React.useEffect(() => {
    const d = monthDates[selectedMonthIndex] || new Date();
    setSelectedMonth(new Date(d.getFullYear(), d.getMonth(), 1));
  }, [selectedMonthIndex, monthDates]);

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

  const incomesByCategory = useMemo(() => {
    const incomes = transactions.filter((t) => t.type === 'income');
    const categoryTotals: { [key: string]: number } = {};

    incomes.forEach((inc) => {
      if (categoryTotals[inc.categoryId]) {
        categoryTotals[inc.categoryId] += inc.amount;
      } else {
        categoryTotals[inc.categoryId] = inc.amount;
      }
    });

    return Object.entries(categoryTotals)
      .map(([categoryId, amount]) => {
        const category = categories.find((c) => c.id === categoryId);
        return {
          name: category?.name || 'Sin categoría',
          amount,
          color: category?.color || colors.income,
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

  // Series data depending on granularity: day / week / month (for the selected month)
  const periodSeries = useMemo(() => {
    if (!selectedMonthData) return [];

    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);

    const tx: (Transaction & { _date: Date })[] = selectedMonthData.transactions.map((t: Transaction) => ({ ...t, _date: new Date(t.date) }));

    if (granularity === 'day') {
      const daysInMonth = endOfMonth.getDate();
      const series: Array<any> = [];
      for (let d = 1; d <= daysInMonth; d++) {
        const dayStart = new Date(year, month, d, 0, 0, 0);
        const dayEnd = new Date(year, month, d, 23, 59, 59);
        const dayTx = tx.filter((t) => t._date >= dayStart && t._date <= dayEnd);
        const income = dayTx.filter((t) => t.type === 'income').reduce((s: number, t: Transaction) => s + t.amount, 0);
        const expense = dayTx.filter((t) => t.type === 'expense').reduce((s: number, t: Transaction) => s + t.amount, 0);
        series.push({ label: String(d), income, expense, balance: income - expense, start: dayStart, end: dayEnd });
      }
      return series;
    }

    if (granularity === 'week') {
      const series: Array<any> = [];
      let weekStart = new Date(startOfMonth);
      let weekIndex = 1;
      while (weekStart <= endOfMonth) {
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        const clampEnd = weekEnd > endOfMonth ? endOfMonth : weekEnd;
        const weekTx = tx.filter((t) => t._date >= weekStart && t._date <= clampEnd);
        const income = weekTx.filter((t) => t.type === 'income').reduce((s: number, t: Transaction) => s + t.amount, 0);
        const expense = weekTx.filter((t) => t.type === 'expense').reduce((s: number, t: Transaction) => s + t.amount, 0);
        const label = `${weekStart.getDate()}-${clampEnd.getDate()}`;
        series.push({ label: `Sem ${weekIndex} (${label})`, income, expense, balance: income - expense, start: new Date(weekStart), end: new Date(clampEnd) });
        weekIndex++;
        weekStart = new Date(weekStart);
        weekStart.setDate(weekStart.getDate() + 7);
      }
      return series;
    }

    const monthLabel = new Date(year, month).toLocaleDateString('es-HN', { month: 'long', year: 'numeric' });
    return [
      {
        label: monthLabel,
        income: selectedMonthData.income,
        expense: selectedMonthData.expense,
        balance: selectedMonthData.balance,
        start: startOfMonth,
        end: endOfMonth,
      },
    ];
  }, [granularity, selectedMonthData, selectedMonth]);

  const [selectedPeriodIndex, setSelectedPeriodIndex] = useState<number>(0);

  // When periodSeries or selectedMonth changes, default-select current day/week if inside month
  React.useEffect(() => {
    if (!periodSeries || periodSeries.length === 0) return;
    const today = new Date();
    const found = periodSeries.findIndex((p: any) => {
      const s: Date = p.start;
      const e: Date = p.end;
      return today >= s && today <= e;
    });
    setSelectedPeriodIndex(found >= 0 ? found : 0);
  }, [periodSeries, selectedMonth, granularity]);

  // Ensure when granularity changes the current day/week is selected (useLayoutEffect to run after periodSeries updates)
  React.useLayoutEffect(() => {
    if (!periodSeries || periodSeries.length === 0) return;
    const today = new Date();
    const found = periodSeries.findIndex((p: any) => {
      const s: Date = p.start;
      const e: Date = p.end;
      return today >= s && today <= e;
    });
    setSelectedPeriodIndex(found >= 0 ? found : 0);
  }, [granularity, periodSeries]);

  const selectedPeriod = periodSeries[selectedPeriodIndex] || null;

  const incomesByCategoryPeriod = useMemo(() => {
    if (!selectedPeriod || !selectedMonthData) return [];
    const start: Date = selectedPeriod.start;
    const end: Date = selectedPeriod.end;
    const tx = selectedMonthData.transactions.filter((t: Transaction) => {
      const d = new Date(t.date);
      return d >= start && d <= end && t.type === 'income';
    });
    const totals: { [key: string]: number } = {};
    tx.forEach((t: Transaction) => { totals[t.categoryId] = (totals[t.categoryId] || 0) + t.amount; });
    return Object.entries(totals).map(([categoryId, amount]) => ({ categoryId, name: getCategoryName(categoryId), amount, color: getCategoryColor(categoryId) })).sort((a, b) => b.amount - a.amount);
  }, [selectedPeriod, selectedMonthData]);

  const expensesByCategoryPeriod = useMemo(() => {
    if (!selectedPeriod || !selectedMonthData) return [];
    const start: Date = selectedPeriod.start;
    const end: Date = selectedPeriod.end;
    const tx = selectedMonthData.transactions.filter((t: Transaction) => {
      const d = new Date(t.date);
      return d >= start && d <= end && t.type === 'expense';
    });
    const totals: { [key: string]: number } = {};
    tx.forEach((t: Transaction) => { totals[t.categoryId] = (totals[t.categoryId] || 0) + t.amount; });
    return Object.entries(totals).map(([categoryId, amount]) => ({ categoryId, name: getCategoryName(categoryId), amount, color: getCategoryColor(categoryId) })).sort((a, b) => b.amount - a.amount);
  }, [selectedPeriod, selectedMonthData]);

  const periodTotalIncome = (selectedPeriod && selectedPeriod.income) || 0;
  const periodTotalExpense = (selectedPeriod && selectedPeriod.expense) || 0;

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

  function getCategoryName(categoryId: string) {
    return categories.find((c) => c.id === categoryId)?.name || 'Sin categoría';
  }

  function getCategoryColor(categoryId: string) {
    return categories.find((c) => c.id === categoryId)?.color || colors.textTertiary;
  }

  const currentMonthLabel = selectedMonth.toLocaleDateString('es-HN', { month: 'long', year: 'numeric' });

  // Verificar si el mes actual tiene datos
  const hasMonthData = selectedMonthData && (selectedMonthData.income > 0 || selectedMonthData.expense > 0);

  const totalExpense = expensesByCategory.reduce((sum, item) => sum + item.amount, 0);
  const totalIncome = incomesByCategory.reduce((sum, item) => sum + item.amount, 0);

  const displayIncomes = selectedPeriod ? incomesByCategoryPeriod : incomesByCategory;
  const displayExpenses = selectedPeriod ? expensesByCategoryPeriod : expensesByCategory;
  const displayTotalIncome = selectedPeriod ? periodTotalIncome : totalIncome;
  const displayTotalExpense = selectedPeriod ? periodTotalExpense : totalExpense;

  const renderTransactionItem = (transaction: Transaction) => {
    const categoryColor = getCategoryColor(transaction.categoryId);
    const categoryName = categories.find((c) => c.id === transaction.categoryId)?.name || 'Sin categoría';

    return (
      <View style={styles.transactionItem}>
        <View style={styles.transactionLeft}>
          <View style={[styles.transactionDot, { backgroundColor: categoryColor }]} />
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionCategory}>{categoryName}</Text>
            <Text style={styles.transactionDate}>
              {new Date(transaction.date).toLocaleDateString('es-HN')}
            </Text>
          </View>
        </View>
        <View style={styles.transactionRight}>
          <Text style={[styles.transactionSign, { color: transaction.type === 'income' ? colors.income : colors.expense }]}>
            {transaction.type === 'income' ? '+' : '-'}
          </Text>
          <Text style={[styles.transactionAmount, { color: transaction.type === 'income' ? colors.income : colors.expense }]}>
            {formatCurrency(transaction.amount)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Month Selector Header (prev / label / next) - always visible */}
      <View style={styles.monthSelectorContainer}>
        <TouchableOpacity
          onPress={() => setSelectedMonthIndex((s) => Math.max(0, s - 1))}
          style={styles.monthNavButton}
        >
          <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.monthLabelButton}>
          <Text style={styles.monthLabelText}>{selectedMonthKey}</Text>
        </View>

        <TouchableOpacity
          onPress={() => setSelectedMonthIndex((s) => Math.min(MONTHS_TO_SHOW - 1, s + 1))}
          style={styles.monthNavButton}
        >
          <Ionicons name="chevron-forward" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={!hasMonthData ? styles.emptyContainer : undefined}
      >

        {/* Granularity selector (día / semana / mes) - solo si hay datos del mes */}
        {hasMonthData && (
          <View style={styles.section}>
            <View style={styles.granularityContainer}>
              <TouchableOpacity
                style={[styles.granularityButton, granularity === 'day' && styles.granularityButtonActive]}
                onPress={() => setGranularity('day')}
              >
                <Text style={[styles.granularityText, granularity === 'day' && styles.granularityTextActive]}>Día</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.granularityButton, granularity === 'week' && styles.granularityButtonActive]}
                onPress={() => setGranularity('week')}
              >
                <Text style={[styles.granularityText, granularity === 'week' && styles.granularityTextActive]}>Semana</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.granularityButton, granularity === 'month' && styles.granularityButtonActive]}
                onPress={() => setGranularity('month')}
              >
                <Text style={[styles.granularityText, granularity === 'month' && styles.granularityTextActive]}>Mes</Text>
              </TouchableOpacity>
            </View>

            {/* Period series preview */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.periodScroll}>
              {periodSeries.map((p: any, idx: number) => {
                const isCurrent = (() => {
                  const today = new Date();
                  const s: Date = p.start;
                  const e: Date = p.end;
                  return today >= s && today <= e;
                })();
                return (
                  <TouchableOpacity
                    key={`${p.label}-${idx}`}
                    style={[
                      styles.periodCard,
                      idx === selectedPeriodIndex && { borderWidth: 2, borderColor: colors.primary },
                      isCurrent && idx !== selectedPeriodIndex && { borderWidth: 2, borderColor: colors.primary + '55' },
                    ]}
                    onPress={() => setSelectedPeriodIndex(idx)}
                  >
                    <Text style={styles.periodLabel}>{p.label}</Text>
                    <Text style={[styles.periodValue, { color: p.balance >= 0 ? colors.income : colors.expense }]}>{formatCurrency(p.balance)}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Month Summary Card */}
        {hasMonthData && (
          <View style={styles.section}>
            <Card style={styles.summaryCard}>
              {/* Balance removed per UI request */}
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <View style={styles.summaryIconContainer}>
                    <Ionicons name="arrow-down" size={20} color={colors.income} />
                  </View>
                  <View>
                    <Text style={styles.summaryLabel}>Ingresos</Text>
                    <Text style={[styles.summaryValue, { color: colors.income }]}>
                      {formatCurrency(displayTotalIncome)}
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
                      {formatCurrency(displayTotalExpense)}
                    </Text>
                  </View>
                </View>
              </View>
            </Card>
          </View>
        )}

        {/* Transactions list removed per request */}

        {/* Empty state for selected month (no stats) */}
        {!hasMonthData && (
          <View style={styles.emptyInline}>
            <Ionicons name="receipt-outline" size={48} color={colors.textTertiary} />
            <Text style={styles.emptyTitle}>No hay estadísticas disponibles</Text>
          </View>
        )}

        {/* Incomes by Category */}
        {hasMonthData && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ingresos por Categoría</Text>
            {displayIncomes.length > 0 ? (
              <>
                {displayIncomes.map((item, index) => (
                  // @ts-ignore
                  <React.Fragment key={`income-${index}-${item.name}`}>
                    <Card style={styles.categoryCard}>
                      <View style={styles.categoryRow}>
                        <View style={styles.categoryLeft}>
                          <View style={[styles.categoryDot, { backgroundColor: item.color }]} />
                          <Text style={styles.categoryName}>{item.name}</Text>
                        </View>
                        <Text style={styles.categoryAmount}>{formatCurrency(item.amount)}</Text>
                      </View>
                      <ProgressBar progress={displayTotalIncome > 0 ? item.amount / displayTotalIncome : 0} color={item.color} />
                      <Text style={styles.categoryPercentage}>{displayTotalIncome > 0 ? ((item.amount / displayTotalIncome) * 100).toFixed(1) : '0.0'}%</Text>
                    </Card>
                  </React.Fragment>
                ))}

                <Card style={styles.totalCard}>
                  <Text style={styles.totalLabel}>Total Ingresos</Text>
                  <Text style={[styles.totalAmount, { color: colors.income }]}>{formatCurrency(displayTotalIncome)}</Text>
                </Card>
              </>
            ) : (
              <Card style={styles.emptyCard}>
                <View style={styles.emptyContent}>
                  <Ionicons name="pie-chart-outline" size={48} color={colors.textTertiary} />
                  <Text style={styles.emptyText}>No hay datos de ingresos</Text>
                </View>
              </Card>
            )}
          </View>
        )}

        {/* Expenses by Category */}
        {hasMonthData && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gastos por Categoría</Text>
            {displayExpenses.length > 0 ? (
              <>
                {displayExpenses.map((item, index) => (
                  // @ts-ignore
                  <React.Fragment key={`category-${index}-${item.name}`}>
                    <Card style={styles.categoryCard}>
                      <View style={styles.categoryRow}>
                        <View style={styles.categoryLeft}>
                          <View style={[styles.categoryDot, { backgroundColor: item.color }]} />
                          <Text style={styles.categoryName}>{item.name}</Text>
                        </View>
                        <Text style={styles.categoryAmount}>{formatCurrency(item.amount)}</Text>
                      </View>
                      <ProgressBar progress={displayTotalExpense > 0 ? item.amount / displayTotalExpense : 0} color={item.color} />
                      <Text style={styles.categoryPercentage}>{displayTotalExpense > 0 ? ((item.amount / displayTotalExpense) * 100).toFixed(1) : '0.0'}%</Text>
                    </Card>
                  </React.Fragment>
                ))}

                <Card style={styles.totalCard}>
                  <Text style={styles.totalLabel}>Total Gastado</Text>
                  <Text style={styles.totalAmount}>{formatCurrency(displayTotalExpense)}</Text>
                </Card>
              </>
            ) : (
              <Card style={styles.emptyCard}>
                <View style={styles.emptyContent}>
                  <Ionicons name="pie-chart-outline" size={48} color={colors.textTertiary} />
                  <Text style={styles.emptyText}>No hay datos de gastos</Text>
                </View>
              </Card>
            )}
          </View>
        )}

        {/* Monthly Comparison removed per user request */}
      </ScrollView>

      {/* Month selector now uses prev/next UI (no modal) */}
    </View>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
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
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    monthSelectorText: {
      fontSize: typography.sizes.base,
      fontWeight: typography.weights.semibold,
      color: colors.textPrimary,
      textTransform: 'capitalize',
    },
    monthSelectorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      marginTop: spacing.sm,
      marginBottom: spacing.sm,
    },
    monthNavButton: {
      padding: spacing.sm,
      borderRadius: borderRadius.sm,
      backgroundColor: colors.surface,
    },
    monthLabelButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
      backgroundColor: colors.surface,
    },
    monthLabelText: {
      fontSize: typography.sizes.base,
      color: colors.textPrimary,
      marginRight: spacing.xs,
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
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.md,
      // mantener fondo del Card por defecto
    },
    summaryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    summaryItem: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    summaryIconContainer: {
      width: 44,
      height: 44,
      borderRadius: 22,
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
      height: 40,
      backgroundColor: colors.border,
      marginHorizontal: spacing.md,
    },
    balanceContainer: {
      alignItems: 'center',
      paddingTop: spacing.sm,
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
    transactionRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    transactionSign: {
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.bold,
      marginRight: spacing.xs,
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
    granularityContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
      gap: spacing.sm,
    },
    granularityButton: {
      flex: 1,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: 8,
      backgroundColor: colors.surface,
      alignItems: 'center',
    },
    granularityButtonActive: {
      backgroundColor: colors.primary,
    },
    granularityText: {
      fontSize: typography.sizes.sm,
      color: colors.textPrimary,
      fontWeight: typography.weights.medium,
    },
    granularityTextActive: {
      color: '#fff',
    },
    periodScroll: {
      marginTop: spacing.sm,
      paddingBottom: spacing.sm,
    },
    periodCard: {
      minWidth: 120,
      padding: spacing.md,
      borderRadius: 12,
      backgroundColor: colors.surface,
      marginRight: spacing.md,
      alignItems: 'center',
    },
    periodLabel: {
      fontSize: typography.sizes.sm,
      color: colors.textSecondary,
      marginBottom: spacing.xs,
    },
    periodValue: {
      fontSize: typography.sizes.lg,
      fontWeight: typography.weights.bold,
    },
    periodSub: {
      fontSize: typography.sizes.xs,
      color: colors.textTertiary,
      marginTop: spacing.xs,
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
      fontSize: typography.sizes.xl,
      fontWeight: typography.weights.semibold,
      color: colors.textSecondary,
      marginTop: spacing.lg,
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
    emptyDescription: {
      fontSize: typography.sizes.sm,
      color: colors.textSecondary,
      marginTop: spacing.sm,
      textAlign: 'center',
    },
    // Month Picker Modal Styles
    monthPickerOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    monthPickerContent: {
      backgroundColor: colors.background,
      borderTopLeftRadius: borderRadius.lg,
      borderTopRightRadius: borderRadius.lg,
      maxHeight: '70%',
    },
    monthPickerHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    monthPickerTitle: {
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
    // Empty inline (icon + text only)
    emptyInline: {
      alignItems: 'center',
      paddingVertical: spacing.lg,
    },
    emptyContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: spacing.lg,
    },
  });

