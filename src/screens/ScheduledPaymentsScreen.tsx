import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';
import { spacing, typography, borderRadius, useTheme } from '../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, Button, CategoryIcon } from '../components/common';
import { CurrencySelector } from '../components/CurrencySelector';
import { RecurringPayment } from '../types';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useExchangeRates } from '../hooks/useExchangeRates';

const frequencyLabels: Record<string, string> = {
  daily: 'Diario',
  weekly: 'Semanal',
  biweekly: 'Quincenalmente',
  monthly: 'Mensual',
  yearly: 'Anual',
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$', CAD: 'C$', MXN: '$', BRL: 'R$', HNL: 'L', EUR: '€', GBP: '£',
};

// Convert amount from one currency to another using provided rates
// rates are expected to be in the format returned by the exchange service (base USD): rates[CUR] = units per 1 USD
const convertCurrency = (
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: Record<string, number>
): number => {
  if (!amount || fromCurrency === toCurrency) return amount;

  // rates use USD as base: rates[CUR] = how many CUR units == 1 USD
  const fromRate = rates[fromCurrency] || 1; // units per USD
  const toRate = rates[toCurrency] || 1;

  // Convert amount -> USD, then USD -> target
  const amountInUSD = amount / fromRate;
  const amountInTarget = amountInUSD * toRate;
  return amountInTarget;
};

// Número de meses a mostrar en el selector/ventana
const MONTHS_TO_SHOW = 12;

export const ScheduledPaymentsScreen = ({ navigation }: any) => {
  const {
    recurringPayments,
    categories,
    addRecurringPayment,
    updateRecurringPayment,
    deleteRecurringPayment,
    preferredCurrency,
  } = useAppStore();
  const { colors } = useTheme();
  const { rates: exchangeRates } = useExchangeRates();
  const styles = useMemo(() => createStyles(colors, borderRadius), [colors]);
  const insets = useSafeAreaInsets();

  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<RecurringPayment | null>(null);
  const [selectedOccurrenceDate, setSelectedOccurrenceDate] = useState<Date | null>(null);
  // Selector de mes: mostrar ventana de meses previos + actual
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(MONTHS_TO_SHOW - 1); // default to current month (last in window)

  const monthOptions = useMemo(() => {
    const now = new Date();
    // start N-1 months before current month
    const start = new Date(now.getFullYear(), now.getMonth() - (MONTHS_TO_SHOW - 1), 1);
    return Array.from({ length: MONTHS_TO_SHOW }, (_, i) => {
      const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
      return d.toLocaleDateString('es-HN', { year: 'numeric', month: 'long' });
    });
  }, []);

  const selectedMonthKey = monthOptions[selectedMonthIndex] || (() => {
    const now = new Date();
    return now.toLocaleDateString('es-HN', { year: 'numeric', month: 'long' });
  })();



  const formatCurrency = (amount: number, curr: string = preferredCurrency) => {
    const symbol = CURRENCY_SYMBOLS[curr] || curr;
    return `${symbol} ${amount.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getRelativeDate = (date: Date | string) => {
    const nextDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    nextDate.setHours(0, 0, 0, 0);

    const diffTime = nextDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let timeText = '';
    if (diffDays === 0) timeText = 'Hoy';
    else if (diffDays === 1) timeText = 'Mañana';
    else if (diffDays === 7) timeText = 'en 1 semana';
    else if (diffDays > 1 && diffDays < 7) timeText = `en ${diffDays} días`;
    else if (diffDays > 7 && diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      timeText = `en ${weeks} semana${weeks > 1 ? 's' : ''}`;
    } else if (diffDays >= 30) {
      const months = Math.floor(diffDays / 30);
      timeText = `en ${months} mes${months > 1 ? 'es' : ''}`;
    } else {
      timeText = 'Próximamente';
    }

    // Mostrar sólo la representación relativa (ej. 'Hoy', 'Mañana', 'en 3 días')
    return timeText;
  };

  // Agrupar pagos por mes generando ocurrencias para los próximos meses
  const paymentsByMonth = useMemo(() => {
    // Grouped maps month label -> array of { payment, date }
    const grouped: Record<string, Array<{ payment: RecurringPayment; date: Date }>> = {};

    const now = new Date();
    const windowStart = new Date(now.getFullYear(), now.getMonth(), 1); // start of current month
    const monthsToShow = 12;
    const windowEnd = new Date(windowStart.getFullYear(), windowStart.getMonth() + monthsToShow, 0); // end of last month in window

    const addMonthsSafe = (date: Date, months: number) => {
      const d = new Date(date);
      const day = d.getDate();
      d.setMonth(d.getMonth() + months);
      if (d.getDate() < day) {
        d.setDate(0);
      }
      return d;
    };

    const getOccurrences = (payment: RecurringPayment, start: Date, end: Date) => {
      const occurrences: Date[] = [];
      let current = new Date(payment.nextDate);

      const advanceOnce = () => {
        switch (payment.frequency) {
          case 'daily':
            current = new Date(current.getFullYear(), current.getMonth(), current.getDate() + 1);
            break;
          case 'weekly':
            current = new Date(current.getTime() + 7 * 24 * 60 * 60 * 1000);
            break;
          case 'biweekly':
            current = new Date(current.getTime() + 14 * 24 * 60 * 60 * 1000);
            break;
          case 'monthly':
            current = addMonthsSafe(current, 1);
            break;
          case 'yearly':
            current = addMonthsSafe(current, 12);
            break;
          default:
            current = addMonthsSafe(current, 1);
        }
      };

      let safety = 0;
      while (current < start && safety < 1000) {
        advanceOnce();
        safety += 1;
      }

      safety = 0;
      while (current <= end && safety < 1000) {
        occurrences.push(new Date(current));
        advanceOnce();
        safety += 1;
      }

      return occurrences;
    };

    const sortedPayments = [...recurringPayments].sort((a, b) => new Date(a.nextDate).getTime() - new Date(b.nextDate).getTime());
    sortedPayments.forEach((payment) => {
      const occs = getOccurrences(payment, windowStart, windowEnd);
      if (occs.length === 0) {
        const nd = new Date(payment.nextDate);
        if (nd >= windowStart && nd <= windowEnd) occs.push(nd);
      }

      occs.forEach((date) => {
        const key = date.toLocaleDateString('es-HN', { year: 'numeric', month: 'long' });
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push({ payment, date });
      });
    });

    return grouped;
  }, [recurringPayments]);

  // Totales para el mes seleccionado (por moneda y convertido a moneda preferida)
  const monthTotals = useMemo(() => {
    const paymentsForMonth = (paymentsByMonth[selectedMonthKey] || []) as Array<{ payment: RecurringPayment; date: Date }>;
    const totalsByCurrency: Record<string, { income: number; expense: number }> = {};

    paymentsForMonth.forEach(({ payment }) => {
      const cur = payment.currency || preferredCurrency;
      if (!totalsByCurrency[cur]) totalsByCurrency[cur] = { income: 0, expense: 0 };
      if (payment.type === 'income') totalsByCurrency[cur].income += payment.amount;
      else totalsByCurrency[cur].expense += payment.amount;
    });

    // Convert totals to preferred currency
    const converted = { income: 0, expense: 0 };
    Object.entries(totalsByCurrency).forEach(([cur, v]) => {
      converted.income += convertCurrency(v.income, cur, preferredCurrency, exchangeRates);
      converted.expense += convertCurrency(v.expense, cur, preferredCurrency, exchangeRates);
    });

    return { totalsByCurrency, converted };
  }, [paymentsByMonth, selectedMonthKey, preferredCurrency, exchangeRates]);

  const handleDeletePayment = (paymentId: string) => {
    Alert.alert(
      'Eliminar Pago Programado',
      '¿Estás seguro de que deseas eliminar este pago?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            deleteRecurringPayment(paymentId);
            setDetailModalVisible(false);
          },
        },
      ]
    );
  };

  const handleToggleActive = (payment: RecurringPayment) => {
    updateRecurringPayment(payment.id, { isActive: !payment.isActive });
  };

  const openDetailModal = (payment: RecurringPayment, occurrenceDate?: Date | null) => {
    setSelectedPayment(payment);
    setSelectedOccurrenceDate(occurrenceDate || null);
    setDetailModalVisible(true);
  };

  useEffect(() => {
    if (!detailModalVisible) {
      setSelectedPayment(null);
      setSelectedOccurrenceDate(null);
    }
  }, [detailModalVisible]);

  // (Removed upcomingPayments section — we will list all payments sorted by nextDate)

  const totalMonthly = useMemo(() => {
    const total = recurringPayments
      .filter((p) => p.frequency === 'monthly' && p.isActive && p.type === 'expense')
      .reduce((sum, p) => sum + convertCurrency(p.amount, p.currency, preferredCurrency, exchangeRates), 0);
    return total;
  }, [recurringPayments, exchangeRates, preferredCurrency]);

  // Total de todos los pagos programados convertidos a moneda preferida
  const totalAllPayments = useMemo(() => {
    const total = recurringPayments
      .filter((p) => p.isActive)
      .reduce((sum, p) => {
        const amountInPref = convertCurrency(p.amount, p.currency, preferredCurrency, exchangeRates);
        return p.type === 'income' ? sum + amountInPref : sum - amountInPref;
      }, 0);
    return total;
  }, [recurringPayments, exchangeRates, preferredCurrency]);

  return (
    <View style={styles.container}>
      {/* Selector de mes: botones prev/next y opción para abrir modal con lista de meses */}
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

      {/* Selector de mes ahora solo mediante flechas; modal eliminado */}

      {/* Lista de pagos */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {recurringPayments.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Ionicons name="calendar-outline" size={64} color={colors.textTertiary} />
            <Text style={styles.emptyText}>No hay pagos programados</Text>
            <Text style={styles.emptySubtext}>
              Crea un pago programado para recordar tus suscripciones y gastos recurrentes
            </Text>
          </Card>
        ) : (
          // Mostrar sólo el mes seleccionado
          (() => {
            const paymentsForMonth = paymentsByMonth[selectedMonthKey] || [];
            return (
              <React.Fragment>
                <View>
                  {/* Resumen del mes: diseño simplificado */}
                  <View style={styles.monthSummaryContainer}>
                    <TouchableOpacity style={[styles.summaryBox, { marginRight: spacing.sm }]} activeOpacity={0.9}>
                      <View style={styles.summaryHeader}>
                        <Ionicons name="arrow-up" size={18} color={colors.success} />
                        <Text style={styles.summaryBoxTitle}>Ingreso</Text>
                      </View>
                      <Text style={[styles.bigAmount, { color: colors.success }]}>{formatCurrency(monthTotals.converted.income)}</Text>
                      <View style={{ marginTop: spacing.xs }}>
                        {Object.entries(monthTotals.totalsByCurrency).length === 0 ? (
                          <Text style={styles.summaryEmpty}>-</Text>
                        ) : (
                          Object.entries(monthTotals.totalsByCurrency).map(([cur, v]) => (
                            <Text key={`inc-${cur}`} style={styles.currencyLineSmall}>{cur} {formatCurrency(v.income, cur)}</Text>
                          ))
                        )}
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.summaryBox} activeOpacity={0.9}>
                      <View style={styles.summaryHeader}>
                        <Ionicons name="arrow-down" size={18} color={colors.error} />
                        <Text style={styles.summaryBoxTitle}>Gasto</Text>
                      </View>
                      <Text style={[styles.bigAmount, { color: colors.error }]}>{formatCurrency(monthTotals.converted.expense)}</Text>
                      <View style={{ marginTop: spacing.xs }}>
                        {Object.entries(monthTotals.totalsByCurrency).length === 0 ? (
                          <Text style={styles.summaryEmpty}>-</Text>
                        ) : (
                          Object.entries(monthTotals.totalsByCurrency).map(([cur, v]) => (
                            <Text key={`exp-${cur}`} style={styles.currencyLineSmall}>{cur} {formatCurrency(v.expense, cur)}</Text>
                          ))
                        )}
                      </View>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.monthTitle}>{selectedMonthKey}</Text>
                  {paymentsForMonth.length === 0 ? (
                    <Card style={styles.emptyCard}>
                      <Text style={styles.emptyText}>No hay pagos programados para este mes</Text>
                    </Card>
                  ) : (
                    paymentsForMonth.map((item) => {
                      const payment = item.payment;
                      const occDate: Date = item.date;
                      const paymentCardStyle = !payment.isActive
                        ? [styles.paymentCard, styles.paymentCardInactive]
                        : styles.paymentCard;
                      return (
                        <TouchableOpacity
                          key={`${payment.id}-${occDate.toISOString()}`}
                          onPress={() => openDetailModal(payment, occDate)}
                          activeOpacity={0.7}
                        >
                          {/* Fecha explícita encima de cada pago */}
                          <Text style={styles.occurrenceDateLabel}>{occDate.toLocaleDateString('es-HN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</Text>
                          <Card style={paymentCardStyle as any}>
                            <View style={[styles.cardStripe, { backgroundColor: payment.color }]} />
                            <View style={styles.paymentHeader}>
                              <View style={styles.paymentInfo}>
                                <View
                                  style={[
                                    styles.categoryIconContainer,
                                    { backgroundColor: `${payment.color}20` },
                                  ]}
                                >
                                  <Ionicons name={payment.icon as any} size={20} color={payment.color} />
                                </View>
                                <View style={styles.paymentTextInfo}>
                                  <Text style={styles.paymentDescription}>{payment.title}</Text>
                                  <View style={styles.paymentMeta}>
                                    <Text style={styles.paymentFrequency}>{frequencyLabels[payment.frequency]}</Text>
                                    {payment.paid ? (
                                      <View style={[styles.activeBadge, { backgroundColor: colors.success + '20', flexDirection: 'row', alignItems: 'center', gap: spacing.xs }]}>
                                        <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                                        <Text style={[styles.activeBadgeText, { color: colors.success }]}>Pagado</Text>
                                      </View>
                                    ) : (
                                      <View style={[styles.activeBadge, { backgroundColor: colors.textTertiary + '30', flexDirection: 'row', alignItems: 'center', gap: spacing.xs }]}>
                                        <Ionicons name="close-circle" size={14} color={colors.textTertiary} />
                                        <Text style={[styles.activeBadgeText, { color: colors.textTertiary }]}>No pagado</Text>
                                      </View>
                                    )}
                                  </View>
                                </View>
                              </View>
                              <View style={styles.paymentAmount}>
                                <Text style={[
                                  styles.amountText,
                                  payment.type === 'income' ? styles.income : styles.amountExpense,
                                ]}>
                                  {formatCurrency(payment.amount, payment.currency)}
                                </Text>
                                <Text style={styles.dateText}>{getRelativeDate(occDate)}</Text>
                              </View>
                            </View>
                          </Card>
                        </TouchableOpacity>
                      );
                    })
                  )}
                </View>
              </React.Fragment>
            );
          })()
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Botón flotante */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary, bottom: 16 + (insets.bottom || 0) }]}
        onPress={() => navigation.navigate('AddPayment')}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Modal de detalles */}
      <Modal
        visible={detailModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedPayment && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Detalles del Pago</Text>
                  <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                    <Ionicons name="close" size={24} color={colors.textPrimary} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                  <Card style={styles.detailCard}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Título:</Text>
                      <Text style={styles.detailValue}>{selectedPayment.title}</Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Monto:</Text>
                      <Text style={[styles.detailValue, { fontWeight: '700', color: selectedPayment.type === 'income' ? colors.success : colors.error }]}>
                        {formatCurrency(selectedPayment.amount)}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Tipo:</Text>
                      <Text style={styles.detailValue}>
                        {selectedPayment.type === 'expense' ? 'Gasto' : 'Ingreso'}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Frecuencia:</Text>
                      <Text style={styles.detailValue}>
                        {frequencyLabels[selectedPayment.frequency]}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Próximo pago:</Text>
                      <Text style={styles.detailValue}>
                        {selectedOccurrenceDate ? selectedOccurrenceDate.toLocaleDateString('es-HN') : new Date(selectedPayment.nextDate).toLocaleDateString('es-HN')}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Pagado:</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                        {selectedPayment.paid ? (
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                            <Text style={styles.detailValue}>Sí</Text>
                          </View>
                        ) : (
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                            <Ionicons name="close-circle" size={16} color={colors.textTertiary} />
                            <Text style={styles.detailValue}>No</Text>
                          </View>
                        )}
                        <TouchableOpacity
                          onPress={() => {
                            updateRecurringPayment(selectedPayment.id, { paid: !selectedPayment.paid });
                            // refresh selectedPayment in modal
                            setSelectedPayment({ ...selectedPayment, paid: !selectedPayment.paid });
                          }}
                          style={[styles.toggleButton, { backgroundColor: selectedPayment.paid ? colors.primary : colors.surface }]}
                        >
                          <Ionicons name={selectedPayment.paid ? 'checkmark' : 'close'} size={16} color={selectedPayment.paid ? '#fff' : colors.textSecondary} />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Estado:</Text>
                      <View
                        style={[
                          styles.stateBadge,
                          {
                            backgroundColor: selectedPayment.isActive
                              ? colors.success + '20'
                              : colors.textTertiary + '30',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.stateBadgeText,
                            {
                              color: selectedPayment.isActive ? colors.success : colors.textTertiary,
                            },
                          ]}
                        >
                          {selectedPayment.isActive ? 'Activo' : 'Inactivo'}
                        </Text>
                      </View>
                    </View>
                  </Card>
                </ScrollView>

                <View style={[styles.modalFooter, { flexDirection: 'column', paddingBottom: spacing.xl + (insets.bottom || 0) }]}>
                  <Button
                    title={selectedPayment.isActive ? 'Desactivar' : 'Activar'}
                    onPress={() => {
                      handleToggleActive(selectedPayment);
                      setDetailModalVisible(false);
                    }}
                    variant="solidPrimary"
                    style={[styles.button, { width: '100%', marginBottom: spacing.sm }]}
                  />
                  <Button
                    title="Editar"
                    onPress={() => {
                      setDetailModalVisible(false);
                      navigation.navigate('EditPayment', { payment: selectedPayment });
                    }}
                    variant="solidPrimary"
                    style={[styles.button, { width: '100%', marginBottom: spacing.sm }]}
                  />
                  <Button
                    title="Eliminar"
                    onPress={() => handleDeletePayment(selectedPayment.id)}
                    variant="solidPrimary"
                    style={[styles.button, { width: '100%' }, styles.deleteButton]}
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
    marginBottom: spacing.sm,
  },
  summarySubtext: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  upcomingSection: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  upcomingScroll: {
    marginHorizontal: -spacing.md,
    paddingHorizontal: spacing.md,
  },
  upcomingCard: {
    marginRight: spacing.md,
    padding: spacing.md,
    width: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upcomingCardIncome: {
    backgroundColor: colors.success + '10',
  },
  upcomingInfo: {
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  upcomingAmount: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  upcomingDays: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
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
  monthTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  paymentCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  paymentCardInactive: {
    opacity: 0.6,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  paymentInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentTextInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: br.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentDescription: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  paymentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.sm,
  },
  paymentFrequency: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  activeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: br.sm,
  },
  activeBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  paymentAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  amountWhite: {
    color: '#fff',
  },
  income: {
    color: colors.success,
  },
  expense: {
    color: colors.textPrimary,
  },
  dateText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  reminderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.xs,
  },
  reminderText: {
    fontSize: typography.sizes.xs,
    color: colors.primary,
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
  input: {
    backgroundColor: colors.surface,
    borderRadius: br.md,
    padding: spacing.md,
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  typeButton: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: br.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeButtonText: {
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
    gap: spacing.xs,
  },
  categoryItemName: {
    fontSize: typography.sizes.sm,
    color: colors.textPrimary,
    flex: 1,
  },
  frequencySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  frequencyButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: br.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  frequencyButtonText: {
    fontSize: typography.sizes.sm,
    color: colors.textPrimary,
  },
  dateButton: {
    backgroundColor: colors.surface,
    borderRadius: br.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  dateButtonText: {
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
    flex: 1,
  },
  reminderToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  stateText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.sm,
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
  stateBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: br.sm,
  },
  stateBadgeText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
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
  modalOverlayCentered: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  monthPickerContent: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: colors.background,
    borderRadius: br.lg,
    padding: spacing.md,
    maxHeight: '80%'
  },
  modalTitleSmall: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  monthOption: {
    padding: spacing.sm,
    borderRadius: br.sm,
  },
  monthOptionActive: {
    backgroundColor: colors.primary + '10',
  },
  monthOptionText: {
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
    paddingVertical: spacing.xs,
  },
  monthOptionTextActive: {
    fontSize: typography.sizes.base,
    color: colors.primary,
    fontWeight: typography.weights.semibold,
    paddingVertical: spacing.xs,
  },
  occurrenceDateLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
    marginBottom: spacing.xs,
  },
  amountExpense: {
    color: colors.error,
  },
  cardStripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
    borderTopLeftRadius: br.md,
    borderBottomLeftRadius: br.md,
  },
  monthSummaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 0, // quitar espacio lateral para alinear con la lista
    marginBottom: spacing.sm,
    width: '100%',
  },
  summaryBox: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: br.md,
    borderWidth: 1,
    borderColor: colors.border,
    // asegurar que ocupen la misma anchura que la lista
    minWidth: 0,
  },
  summaryBoxTitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  summaryEmpty: {
    color: colors.textSecondary,
  },
  currencyLine: {
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
  },
  convertedTotal: {
    marginTop: spacing.xs,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.weights.semibold,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  bigAmount: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  currencyLineSmall: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
});

