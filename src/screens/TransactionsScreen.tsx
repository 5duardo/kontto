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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';
import { CURRENCIES } from '../components/CurrencySelector';
import { spacing, typography, borderRadius, useTheme } from '../theme';
import { Card } from '../components/common';
import { useExchangeRates } from '../hooks/useExchangeRates';

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

export const TransactionsScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const { transactions, categories, accounts, preferredCurrency } = useAppStore();
  const { rates: exchangeRates } = useExchangeRates();
  const styles = useMemo(() => createStyles(colors, borderRadius), [colors]);
  const insets = useSafeAreaInsets();

  // Use same month selector behavior as ScheduledPayments (prev/next + 12 months)
  const MONTHS_TO_SHOW = 12;
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(MONTHS_TO_SHOW - 1);

  const monthDates = React.useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - (MONTHS_TO_SHOW - 1), 1);
    return Array.from({ length: MONTHS_TO_SHOW }, (_, i) => new Date(start.getFullYear(), start.getMonth() + i, 1));
  }, []);

  const monthOptions = React.useMemo(() => monthDates.map((d) => d.toLocaleDateString('es-HN', { year: 'numeric', month: 'long' })), [monthDates]);

  React.useEffect(() => {
    const d = monthDates[selectedMonthIndex] || new Date();
    setSelectedDate(new Date(d.getFullYear(), d.getMonth(), 1));
  }, [selectedMonthIndex, monthDates]);

  /**
   * Convierte cualquier cantidad de una moneda a otra usando USD como base
   */
  const convertCurrency = (
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): number => {
    if (fromCurrency === toCurrency) return amount;
    const fromRate = exchangeRates[fromCurrency] || 1;
    const toRate = exchangeRates[toCurrency] || 1;
    return (amount / fromRate) * toRate;
  };

  const formatCurrencySimple = (amount: number, currency: string) => {
    const symbol = CURRENCY_SYMBOLS[currency] || currency;
    const decimals = 2;
    const formattedAmount = amount.toLocaleString('es-HN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    return `${symbol} ${formattedAmount}`;
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
      {/* Month Selector Header (prev / label / next) - same as ScheduledPayments */}
      <View style={styles.monthSelectorContainer}>
        <TouchableOpacity
          onPress={() => setSelectedMonthIndex((s) => Math.max(0, s - 1))}
          style={styles.monthNavButton}
        >
          <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.monthLabelButton}>
          <Text style={styles.monthLabelText}>{monthOptions[selectedMonthIndex]}</Text>
        </View>

        <TouchableOpacity
          onPress={() => setSelectedMonthIndex((s) => Math.min(MONTHS_TO_SHOW - 1, s + 1))}
          style={styles.monthNavButton}
        >
          <Ionicons name="chevron-forward" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={filteredTransactions.length === 0 ? styles.emptyContainer : undefined}
        showsVerticalScrollIndicator={false}
      >
        {filteredTransactions.length === 0 ? (
          <View style={styles.emptyInline}>
            <Ionicons name="receipt-outline" size={48} color={colors.textTertiary} />
            <Text style={styles.emptyText}>Sin transacciones</Text>
          </View>
        ) : (
          Object.entries(transactionsByDay).map(([day, dayTransactions]) => (
            <View key={day}>
              <Text style={styles.dayHeader}>{day}</Text>
              {dayTransactions.map((transaction) => {
                const category = categories.find((c) => c.id === transaction.categoryId);

                // Fallbacks to match Dashboard behaviour for adjustments and transfers
                const isAdjustment = transaction.categoryId === 'adjustment';
                const isTransfer = transaction.categoryId === 'transfer';

                const displayCategoryName = category?.name || (isAdjustment ? 'Ajuste de saldo' : isTransfer ? 'Transferencia' : 'Sin categoría');
                const displayIcon = (category?.icon as any) || (isAdjustment ? 'swap-vertical' : isTransfer ? 'swap-horizontal' : 'help-circle-outline');
                const displayColor = category?.color || (isAdjustment ? '#6B7280' : isTransfer ? colors.primary : colors.primary);

                return (
                  <TouchableOpacity
                    key={transaction.id}
                    onPress={() => navigation.navigate('AddTransaction', { transactionId: transaction.id })}
                  >
                    <Card style={styles.transactionCard}>
                      <View style={styles.transactionRow}>
                        <View style={styles.transactionLeft}>
                          <View
                            style={[
                              styles.transactionIcon,
                              { backgroundColor: `${displayColor}33` },
                            ]}
                          >
                            <Ionicons
                              name={displayIcon}
                              size={24}
                              color={displayColor}
                            />
                          </View>
                          <View style={styles.transactionInfo}>
                            <Text style={styles.transactionTitle}>
                              {displayCategoryName}
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
                          {(() => {
                            const account = transaction.accountId ? accounts.find(a => a.id === transaction.accountId) : undefined;
                            const accountCurrency = account?.currency || preferredCurrency || 'HNL';
                            const displayCurrency = preferredCurrency || 'HNL';
                            const converted = convertCurrency(transaction.amount, accountCurrency, displayCurrency);
                            const showConversion = accountCurrency !== displayCurrency;

                            return (
                              <View>
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
                                  {formatCurrencySimple(transaction.amount, accountCurrency)}
                                </Text>
                                {showConversion && (
                                  <Text style={styles.transactionAmountConverted}>
                                    ≈ {transaction.type === 'income' ? '+' : '-'}
                                    {formatCurrencySimple(converted, displayCurrency)}
                                  </Text>
                                )}
                              </View>
                            );
                          })()}
                        </View>
                      </View>
                    </Card>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))
        )}
      </ScrollView>

      {/* Month selector now uses prev/next UI (no modal) */}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('AddTransaction', {})}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      {/* NOTE: editing now handled in full-screen AddTransaction screen. */}
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
    borderRadius: br.sm,
    backgroundColor: colors.surface,
  },
  monthLabelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: br.md,
    backgroundColor: colors.surface,
  },
  monthLabelText: {
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
    marginRight: spacing.xs,
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
  transactionAmountConverted: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium as any,
    marginTop: spacing.xs,
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

  // Month Picker Modal Styles
  monthPickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  monthPickerContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: br.lg,
    borderTopRightRadius: br.lg,
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

  // Edit Modal Styles (using AddTransactionScreen styles)
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.backgroundSecondary,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '85%',
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
  editModalBody: {
    padding: spacing.lg,
    flex: 1,
  },
  editModalFooter: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
  },
  typeCard: {
    marginBottom: spacing.xl,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundTertiary,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeButtonActiveIncome: {
    backgroundColor: colors.income,
    borderColor: colors.income,
  },
  typeButtonActiveExpense: {
    backgroundColor: colors.expense,
    borderColor: colors.expense,
  },
  typeButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    paddingVertical: spacing.lg,
  },
  currency: {
    fontSize: typography.sizes['4xl'],
    fontWeight: typography.weights.bold,
    color: colors.textSecondary,
    marginRight: spacing.sm,
  },
  amountDisplay: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  categorySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  selectedCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundTertiary,
  },
  categoryName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  dateInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  dateInfoText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    textTransform: 'capitalize',
  },
  descriptionContainer: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  descriptionInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.sizes.base,
    textAlignVertical: 'top',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    backgroundColor: colors.error + '15',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    backgroundColor: colors.primary,
  },
  footerButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
  },
});

