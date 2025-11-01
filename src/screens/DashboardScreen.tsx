import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';
import { spacing, typography, useTheme } from '../theme';
import { AccountDetailModal } from '../components/AccountDetailModal';
import { ProgressBar } from '../components/common/ProgressBar';
import { Account } from '../types';
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

/**
 * Convierte cualquier cantidad de una moneda a otra usando USD como base
 * Fórmula: (amount / fromRate) * toRate
 */
const convertCurrency = (
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: Record<string, number>
): number => {
  if (fromCurrency === toCurrency) return amount;

  // Obtén las tasas (con fallback a 1 si no existen)
  const fromRate = rates[fromCurrency] || 1;
  const toRate = rates[toCurrency] || 1;

  // Convertir: (amount / fromRate) * toRate
  // Esto convierte primero a USD (la base), luego a la moneda objetivo
  return (amount / fromRate) * toRate;
};

/**
 * Convierte una cantidad a USD (base de la API)
 */
const convertToUSD = (amount: number, currency: string, rates: Record<string, number>): number => {
  const rate = rates[currency] || 1;
  return amount / rate;
};

/**
 * Mantener por compatibilidad con código existente que usa "HNL" como base conceptual
 * En realidad convierte a la moneda preferida
 */
const convertToBase = (amount: number, currency: string, rates: Record<string, number>): number => {
  return convertToUSD(amount, currency, rates);
};

export const DashboardScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const { transactions, goals, accounts, budgets, recurringPayments, categories, initializeDefaultData, isInitialized, preferredCurrency, conversionCurrency, updateAccount, reorderAccounts } = useAppStore();
  const { rates: exchangeRates, isLoading: ratesLoading } = useExchangeRates();
  const [activeTab, setActiveTab] = useState<'cuentas' | 'total'>('cuentas');
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [archivedExpanded, setArchivedExpanded] = useState(false);
  const [activeReorderId, setActiveReorderId] = useState<string | null>(null);

  // Ciclo de estados: 'base' → 'conversion' → 'hidden' → 'base'
  const [displayState, setDisplayState] = useState<'base' | 'conversion' | 'hidden'>('base');

  // Crear estilos dinámicamente basados en los colores del tema
  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleAccountPress = (account: Account) => {
    setSelectedAccount(account);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setTimeout(() => setSelectedAccount(null), 300);
  };

  // Ciclo a través de los estados al hacer clic en el saldo
  // Click: base → conversion → hidden → base
  const handleBalancePress = useCallback(() => {
    setDisplayState((currentState) => {
      switch (currentState) {
        case 'base':
          return 'conversion';
        case 'conversion':
          return 'hidden';
        case 'hidden':
          return 'base';
        default:
          return 'base';
      }
    });
  }, []);

  // Mover cuenta arriba/abajo en la lista de cuentas no archivadas
  const handleMoveAccount = (accountId: string, delta: number) => {
    const active = accounts.filter(a => !a.isArchived);
    const idx = active.findIndex(a => a.id === accountId);
    if (idx === -1) return;
    const newIdx = idx + delta;
    if (newIdx < 0 || newIdx >= active.length) return;

    const newActive = [...active];
    const [item] = newActive.splice(idx, 1);
    newActive.splice(newIdx, 0, item);

    // Mantener las archivadas al final en su orden actual
    const archived = accounts.filter(a => a.isArchived);
    const newOrder = [...newActive, ...archived];

    // Persistir en el store
    reorderAccounts(newOrder);
  };

  // Obtener moneda y visibilidad según estado
  const getDisplayInfo = () => {
    switch (displayState) {
      case 'base':
        return { currency: preferredCurrency, isHidden: false };
      case 'conversion':
        return { currency: conversionCurrency, isHidden: false };
      case 'hidden':
        return { currency: preferredCurrency, isHidden: true };
      default:
        return { currency: preferredCurrency, isHidden: false };
    }
  };

  useEffect(() => {
    if (!isInitialized) {
      initializeDefaultData();
    }
  }, [isInitialized]);

  const stats = useMemo(() => {
    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Sumar el saldo de todas las cuentas convertidas a USD (base)
    const accountsBalanceUSD = accounts
      .filter((a) => a.includeInTotal && !a.isArchived)
      .reduce((sum, a) => sum + convertToUSD(a.balance, a.currency, exchangeRates), 0);

    // Obtener el balance en la moneda de display
    const displayInfo = getDisplayInfo();
    const displayBalance = convertCurrency(accountsBalanceUSD, 'USD', displayInfo.currency, exchangeRates);

    // Calcular presupuesto total incluyendo todos los períodos activos
    const currentMonth = new Date().toLocaleString('es-HN', { month: '2-digit', year: 'numeric' });
    const today = new Date();

    // Función para verificar si un presupuesto está activo hoy
    const isBudgetActiveToday = (budget: typeof budgets[0]) => {
      const startDate = new Date(budget.startDate);
      const endDate = new Date(budget.endDate);
      return today >= startDate && today <= endDate;
    };

    // Incluir presupuestos de todos los períodos que están activos
    // - Diarios: si están activos hoy
    // - Semanales: si están activos hoy
    // - Mensuales: siempre (se aplican al mes actual)
    // - Anuales: siempre (se aplican al año actual)
    const activeBudgetsForDisplay = budgets.filter((b) => {
      if (b.period === 'monthly' || b.period === 'yearly') {
        return true; // Los mensuales y anuales siempre se incluyen
      }
      if (b.period === 'daily' || b.period === 'weekly') {
        return isBudgetActiveToday(b); // Los diarios y semanales solo si están activos hoy
      }
      return false;
    });

    // Convertir presupuestos a USD para comparación consistente
    const monthlyBudgetAmountUSD = activeBudgetsForDisplay.reduce((sum, b) => sum + convertToUSD(b.amount, b.currency, exchangeRates), 0);

    // Gastos que coinciden con las categorías de presupuestos activos
    const activeCategories = new Set(
      activeBudgetsForDisplay.flatMap((b) => b.categoryIds)
    );

    // Calcular gastos en USD (obtener moneda de la cuenta asociada)
    const monthlyExpenseAmountUSD = transactions
      .filter((t) => {
        if (t.type !== 'expense') return false;
        const transactionMonth = new Date(t.date).toLocaleString('es-HN', { month: '2-digit', year: 'numeric' });
        // Incluir gastos del mes actual que coincidan con categorías de presupuestos activos
        return transactionMonth === currentMonth && activeCategories.has(t.categoryId);
      })
      .reduce((sum, t) => {
        const account = accounts.find(a => a.id === t.accountId);
        const accountCurrency = account?.currency || preferredCurrency;
        return sum + convertToUSD(t.amount, accountCurrency, exchangeRates);
      }, 0);

    // Convertir a la moneda de display para visualización
    const monthlyBudgetDisplay = convertCurrency(monthlyBudgetAmountUSD, 'USD', getDisplayInfo().currency, exchangeRates);
    const monthlyExpenseDisplay = convertCurrency(monthlyExpenseAmountUSD, 'USD', getDisplayInfo().currency, exchangeRates);

    return {
      totalIncome,
      totalExpense,
      balance: displayBalance,
      transactionsBalance: totalIncome - totalExpense,
      monthlyBudget: monthlyBudgetDisplay,
      monthlyExpense: monthlyExpenseDisplay,
    };
  }, [transactions, accounts, budgets, exchangeRates, displayState, preferredCurrency, conversionCurrency]);

  // Total de metas convertido a la moneda de visualización
  const totalGoalsUSD = useMemo(
    () => goals.reduce((sum, g) => sum + convertToUSD(g.currentAmount, g.currency, exchangeRates), 0),
    [goals, exchangeRates]
  );
  const totalGoalsDisplay = useMemo(
    () => convertCurrency(totalGoalsUSD, 'USD', getDisplayInfo().currency, exchangeRates),
    [totalGoalsUSD, exchangeRates, displayState, preferredCurrency, conversionCurrency]
  );

  const formatCurrency = (amount: number, currency: string = 'HNL') => {
    const symbol = CURRENCY_SYMBOLS[currency] || currency;
    const formattedAmount = amount.toLocaleString('es-HN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${symbol} ${formattedAmount}`;
  };

  const formatAccountBalance = (amount: number, currency: string) => {
    const symbol = CURRENCY_SYMBOLS[currency] || currency;
    const decimals = 2;
    const formattedAmount = amount.toLocaleString('es-HN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    return `${symbol} ${formattedAmount}`;
  };

  const renderCurrencyLabel = (code: string) => {
    const symbol = CURRENCY_SYMBOLS[code] || code;
    const iconName = code === 'BTC' ? 'logo-bitcoin' : code === 'ETH' ? 'logo-ethereum' : 'cash';
    return (
      <View style={styles.currencyLabelRow}>
        <View style={[styles.currencyBadge, { backgroundColor: colors.backgroundSecondary }]}>
          <Text style={styles.currencyBadgeText}>{symbol}</Text>
        </View>
        <Text style={styles.totalCurrency}>{code}</Text>
        <Ionicons name={iconName as any} size={16} color={colors.textSecondary} style={{ marginLeft: spacing.sm }} />
      </View>
    );
  };

  // Función para obtener el saldo convertido a la moneda preferida
  const getConvertedBalance = (account: Account): string => {
    const converted = convertCurrency(
      account.balance,
      account.currency,
      preferredCurrency,
      exchangeRates
    );
    return formatAccountBalance(converted, preferredCurrency);
  };

  // Función para obtener pagos próximos en los próximos 7 días
  const getUpcomingPayments = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    return recurringPayments
      .filter((payment) => {
        if (!payment.isActive) return false;
        const nextDate = new Date(payment.nextDate);
        nextDate.setHours(0, 0, 0, 0);
        return nextDate >= today && nextDate <= sevenDaysFromNow;
      })
      .sort((a, b) => new Date(a.nextDate).getTime() - new Date(b.nextDate).getTime());
  }, [recurringPayments]);

  return (
    <View style={styles.container}>
      {/* Header con balance total */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <TouchableOpacity
          style={styles.headerContent}
          onPress={handleBalancePress}
          activeOpacity={0.7}
          delayPressIn={0}
          delayPressOut={0}
        >
          <Text style={styles.headerTitle}>Saldo total</Text>
          <View style={styles.headerBalanceContainer}>
            {getDisplayInfo().isHidden ? (
              <Text style={styles.headerBalance}>••••••</Text>
            ) : (
              <Text style={styles.headerBalance}>
                {formatCurrency(stats.balance, getDisplayInfo().currency)}
              </Text>
            )}
          </View>
        </TouchableOpacity>
        <View style={styles.headerSpacer} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'cuentas' && styles.tabActive]}
          onPress={() => setActiveTab('cuentas')}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Ionicons name="wallet" size={18} color={activeTab === 'cuentas' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'cuentas' && styles.tabTextActive]}>
              Cuentas
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'total' && styles.tabActive]}
          onPress={() => setActiveTab('total')}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Ionicons name="cash" size={18} color={activeTab === 'total' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'total' && styles.tabTextActive]}>
              Total
            </Text>
            {/* total amount removed from tab selector per request */}
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View>
          {activeTab === 'total' ? (
            // Vista Total - Desglose por moneda
            <View style={styles.totalViewContent}>
              {/* Total general */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Total</Text>

                <View style={styles.totalCard}>
                  {/* HNL Total */}
                  <View style={styles.totalRow}>
                    {renderCurrencyLabel('HNL')}
                    <Text style={styles.totalAmount}>
                      {formatCurrency(
                        accounts
                          .filter(a => a.currency === 'HNL' && a.includeInTotal && !a.isArchived)
                          .reduce((sum, a) => sum + a.balance, 0)
                      )}
                    </Text>
                  </View>

                  {/* USD Total */}
                  <View style={styles.totalRow}>
                    {renderCurrencyLabel('USD')}
                    <Text style={styles.totalAmount}>
                      {formatCurrency(
                        accounts
                          .filter(a => a.currency === 'USD' && a.includeInTotal && !a.isArchived)
                          .reduce((sum, a) => sum + a.balance, 0),
                        'USD'
                      )}
                    </Text>
                  </View>

                  {/* EUR Total */}
                  {accounts.some(a => a.currency === 'EUR' && a.includeInTotal && !a.isArchived) && (
                    <View style={styles.totalRow}>
                      {renderCurrencyLabel('EUR')}
                      <Text style={styles.totalAmount}>
                        {formatCurrency(
                          accounts
                            .filter(a => a.currency === 'EUR' && a.includeInTotal && !a.isArchived)
                            .reduce((sum, a) => sum + a.balance, 0),
                          'EUR'
                        )}
                      </Text>
                    </View>
                  )}

                  {/* Total Convertido */}
                  <View style={styles.totalRowHighlight}>
                    <Text style={styles.totalConvertedLabel}>{getDisplayInfo().currency}</Text>
                    <Text style={styles.totalConvertedAmount}>
                      {!getDisplayInfo().isHidden ? formatCurrency(stats.balance, getDisplayInfo().currency) : '••••••'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Cuentas - Todas las cuentas (regulares + ahorro) */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Cuentas</Text>

                <View style={styles.totalCard}>
                  {/* HNL Cuentas */}
                  <View style={styles.totalRow}>
                    {renderCurrencyLabel('HNL')}
                    <Text style={styles.totalAmount}>
                      {formatCurrency(
                        accounts
                          .filter(a => a.currency === 'HNL' && a.includeInTotal && !a.isArchived)
                          .reduce((sum, a) => sum + a.balance, 0)
                      )}
                    </Text>
                  </View>

                  {/* USD Cuentas */}
                  <View style={styles.totalRow}>
                    {renderCurrencyLabel('USD')}
                    <Text style={styles.totalAmount}>
                      {formatCurrency(
                        accounts
                          .filter(a => a.currency === 'USD' && a.includeInTotal && !a.isArchived)
                          .reduce((sum, a) => sum + a.balance, 0),
                        'USD'
                      )}
                    </Text>
                  </View>

                  {/* EUR Cuentas */}
                  {accounts.some(a => a.currency === 'EUR' && a.includeInTotal && !a.isArchived) && (
                    <View style={styles.totalRow}>
                      {renderCurrencyLabel('EUR')}
                      <Text style={styles.totalAmount}>
                        {formatCurrency(
                          accounts
                            .filter(a => a.currency === 'EUR' && a.includeInTotal && !a.isArchived)
                            .reduce((sum, a) => sum + a.balance, 0),
                          'EUR'
                        )}
                      </Text>
                    </View>
                  )}

                  {/* Total Cuentas Convertido */}
                  <View style={styles.totalRowHighlight}>
                    <Text style={styles.totalConvertedLabel}>Total</Text>
                    <Text style={styles.totalConvertedAmount}>
                      {(() => {
                        const totalUSD = accounts
                          .filter(a => a.includeInTotal && !a.isArchived)
                          .reduce((sum, a) => sum + convertToUSD(a.balance, a.currency, exchangeRates), 0);
                        const totalDisplay = convertCurrency(totalUSD, 'USD', preferredCurrency, exchangeRates);
                        return formatCurrency(totalDisplay, preferredCurrency);
                      })()}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Metas */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Metas</Text>

                <View style={styles.totalCard}>
                  {/* Total Metas Convertido */}
                  <View style={styles.totalRowHighlight}>
                    <Text style={styles.totalConvertedLabel}>Total</Text>
                    <Text style={styles.totalConvertedAmount}>
                      {!getDisplayInfo().isHidden ? (
                        formatCurrency(totalGoalsDisplay, getDisplayInfo().currency)
                      ) : (
                        '••••••'
                      )}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={{ height: 100 }} />
            </View>
          ) : (
            // Vista Cuentas - Original
            <View>
              {/* Presupuesto - movido arriba de Cuentas */}
              {stats.monthlyBudget > 0 && (
                <View style={styles.section}>
                  <Text style={styles.budgetTitle}>Presupuesto</Text>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => navigation.navigate('Budgets')}
                  >
                    <View style={styles.budgetCard}>
                      <View style={styles.budgetHeader}>
                        <View style={styles.budgetLeftInfo}>
                          <Text style={styles.budgetLabel}>Gasto</Text>
                          <Text style={styles.budgetAmountSpent}>{getDisplayInfo().isHidden ? '••••••' : formatCurrency(stats.monthlyExpense, getDisplayInfo().currency)}</Text>
                        </View>
                        <View style={styles.budgetRightInfo}>
                          <Text style={styles.budgetLabel}>Presupuesto</Text>
                          <Text style={styles.budgetAmountTotal}>{getDisplayInfo().isHidden ? '••••••' : formatCurrency(stats.monthlyBudget, getDisplayInfo().currency)}</Text>
                        </View>
                      </View>

                      <View style={styles.budgetProgressContainer}>
                        <ProgressBar
                          progress={(stats.monthlyExpense / (stats.monthlyBudget || 1)) * 100}
                          backgroundColor={colors.backgroundTertiary}
                          height={8}
                          showPercentage={false}
                        />
                      </View>

                      <View style={styles.budgetFooter}>
                        <Text style={styles.budgetPercentage}>{`${Math.round((stats.monthlyExpense / (stats.monthlyBudget || 1)) * 100)}% utilizado`}</Text>
                        <Text style={[
                          styles.budgetRemaining,
                          { color: stats.monthlyExpense > stats.monthlyBudget ? '#EF4444' : colors.textSecondary }
                        ]}>
                          {getDisplayInfo().isHidden ? '••••••' : (stats.monthlyExpense > stats.monthlyBudget
                            ? `Excedido: ${formatCurrency(stats.monthlyExpense - stats.monthlyBudget, getDisplayInfo().currency)}`
                            : `Disponible: ${formatCurrency(Math.max(0, stats.monthlyBudget - stats.monthlyExpense), getDisplayInfo().currency)}`)}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              )}

              {/* Sección Cuentas - Incluye todas las cuentas (regulares + ahorro) */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Cuentas</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                    {!getDisplayInfo().isHidden ? (
                      <Text style={styles.sectionBalance}>
                        {(() => {
                          const totalUSD = accounts
                            .filter(a => a.includeInTotal && !a.isArchived)
                            .reduce((sum, a) => sum + convertToUSD(a.balance, a.currency, exchangeRates), 0);
                          const totalDisplay = convertCurrency(totalUSD, 'USD', getDisplayInfo().currency, exchangeRates);
                          return formatCurrency(totalDisplay, getDisplayInfo().currency);
                        })()}
                      </Text>
                    ) : (
                      <Text style={styles.sectionBalance}>••••••</Text>
                    )}
                  </View>
                </View>

                {accounts.filter(a => !a.isArchived).length === 0 ? (
                  <View style={styles.emptyState}>
                    <Ionicons name="wallet-outline" size={48} color={colors.textSecondary} />
                    <Text style={styles.emptyText}>No tienes cuentas</Text>
                    <Text style={styles.emptySubtext}>Agrega tu primera cuenta financiera</Text>
                  </View>
                ) : (
                  // Modo normal: mostrar lista de cuentas; si estamos en reorderMode mostrar controles subir/bajar
                  accounts
                    .filter(a => !a.isArchived)
                    .map((account, index, arr) => (
                      <TouchableOpacity
                        key={account.id}
                        style={styles.accountCard}
                        onPress={() => {
                          // Si los controles de reorden están visibles, ocultarlos al tocar
                          if (activeReorderId) {
                            setActiveReorderId(null);
                            return;
                          }
                          handleAccountPress(account);
                        }}
                        onLongPress={() => setActiveReorderId(account.id)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.accountLeft}>
                          <View style={[styles.accountIcon, { backgroundColor: `${account.color}33` }]}>
                            <Ionicons name={account.icon as any} size={24} color={account.color} />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.accountName}>{account.title}</Text>
                            <View style={styles.accountBalanceContainer}>
                              {!getDisplayInfo().isHidden ? (
                                <>
                                  <Text style={styles.accountBalance}>
                                    {formatAccountBalance(account.balance, account.currency)}
                                  </Text>
                                  {account.currency !== preferredCurrency && (
                                    <Text style={styles.accountBalanceConverted}>
                                      ≈ {getConvertedBalance(account)}
                                    </Text>
                                  )}
                                </>
                              ) : (
                                <Text style={styles.accountBalance}>••••••</Text>
                              )}
                            </View>
                          </View>
                        </View>

                        {activeReorderId === account.id && (
                          <View style={styles.reorderControls}>
                            <TouchableOpacity
                              onPress={() => handleMoveAccount(account.id, -1)}
                              disabled={index === 0}
                              style={[
                                styles.reorderButton,
                                index === 0 && { opacity: 0.4 },
                                { transform: [{ translateY: -4 }] }, // subir un poco la flecha hacia arriba
                              ]}
                              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                              <Ionicons name="chevron-up" size={24} color={colors.primary} style={styles.reorderIcon} />
                            </TouchableOpacity>

                            <TouchableOpacity
                              onPress={() => handleMoveAccount(account.id, 1)}
                              disabled={index === arr.length - 1}
                              style={[
                                styles.reorderButton,
                                index === arr.length - 1 && { opacity: 0.4 },
                              ]}
                              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                              <Ionicons name="chevron-down" size={24} color={colors.primary} style={styles.reorderIcon} />
                            </TouchableOpacity>
                          </View>
                        )}
                      </TouchableOpacity>
                    ))
                )}

                <TouchableOpacity
                  style={styles.addAccountButton}
                  onPress={() => navigation.navigate('AddAccount')}
                >
                  <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
                  <Text style={styles.addAccountText}>Añadir cuenta financiera</Text>
                </TouchableOpacity>
              </View>



              {/* Sección Pagos Próximos */}
              {getUpcomingPayments.length > 0 && (
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={styles.section}
                  onPress={() => navigation.navigate('ScheduledPayments')}
                >
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Pagos Próximos</Text>
                    <Text style={styles.sectionBalance}>{getDisplayInfo().isHidden ? '••••••' : (() => {
                      const totalUSD = getUpcomingPayments.reduce((sum, p) => sum + convertToUSD(p.amount, p.currency, exchangeRates), 0);
                      const totalDisplay = convertCurrency(totalUSD, 'USD', getDisplayInfo().currency, exchangeRates);
                      return formatCurrency(totalDisplay, getDisplayInfo().currency);
                    })()}</Text>
                  </View>

                  {getUpcomingPayments.map((payment, index) => {
                    const paymentDate = new Date(payment.nextDate);
                    const today = new Date();
                    const daysUntil = Math.ceil((paymentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    const dateFormatted = paymentDate.toLocaleDateString('es-HN', { month: 'short', day: 'numeric' });

                    return (
                      // @ts-ignore
                      <React.Fragment key={payment.id}>
                        <View style={[styles.upcomingPaymentCard, { borderLeftColor: payment.color }]}>
                          <View style={styles.upcomingPaymentLeft}>
                            <View style={[styles.accountIcon, { backgroundColor: `${payment.color}33` }]}>
                              <Ionicons name={payment.icon as any} size={24} color={payment.color} />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.upcomingPaymentDescription}>{payment.title}</Text>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                                <Text style={styles.upcomingPaymentCategory}>{payment.type === 'expense' ? 'Gasto' : 'Ingreso'}</Text>
                                {payment.paid && (
                                  <View style={[styles.upcomingPaymentBadge, { backgroundColor: colors.success + '20' }]}>
                                    <Text style={[styles.upcomingPaymentBadgeText, { color: colors.success }]}>✓ Pagado</Text>
                                  </View>
                                )}
                                {!payment.paid && (
                                  <View style={[styles.upcomingPaymentBadge, { backgroundColor: colors.textTertiary + '30' }]}>
                                    <Text style={[styles.upcomingPaymentBadgeText, { color: colors.textTertiary }]}>Pendiente</Text>
                                  </View>
                                )}
                              </View>
                            </View>
                          </View>

                          <View style={styles.upcomingPaymentRight}>
                            <Text style={styles.upcomingPaymentAmount}>{getDisplayInfo().isHidden ? '••••••' : formatAccountBalance(payment.amount, payment.currency)}</Text>
                            {!getDisplayInfo().isHidden && (
                              <View style={[styles.upcomingPaymentDaysTag, { backgroundColor: daysUntil <= 1 ? '#EF4444' : daysUntil <= 3 ? '#F59E0B' : colors.primary }]}>
                                <Text style={styles.upcomingPaymentDaysText}>
                                  {daysUntil === 0 ? 'Hoy' : daysUntil === 1 ? 'Mañana' : `En ${daysUntil}d`}
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>
                      </React.Fragment>
                    );
                  })}
                </TouchableOpacity>
              )}

              {/* Sección Metas */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Metas</Text>
                  {!getDisplayInfo().isHidden ? (
                    <Text style={styles.sectionBalance}>
                      {formatCurrency(totalGoalsDisplay, getDisplayInfo().currency)}
                    </Text>
                  ) : (
                    <Text style={styles.sectionBalance}>••••••</Text>
                  )}
                </View>

                {goals.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Ionicons name="star-outline" size={48} color={colors.textSecondary} />
                    <Text style={styles.emptyText}>No tienes metas</Text>
                    <Text style={styles.emptySubtext}>Agrega tu primera meta de ahorro</Text>
                  </View>
                ) : (
                  goals.map((goal) => {
                    const progress = (goal.currentAmount / goal.targetAmount) * 100;
                    return (
                      <TouchableOpacity
                        key={goal.id}
                        style={styles.goalCard}
                        onPress={() => {
                          navigation.navigate('EditGoal', { goal });
                        }}
                      >
                        <View style={styles.goalHeader}>
                          <View style={styles.goalLeft}>
                            <View style={[styles.accountIcon, { backgroundColor: `${goal.color}33` }]}>
                              <Ionicons name={goal.icon as any} size={24} color={goal.color} />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.accountName}>{goal.name}</Text>
                              <Text style={styles.goalTarget}>
                                Objetivo: {!getDisplayInfo().isHidden ? formatCurrency(goal.targetAmount, goal.currency) : '••••••'}
                              </Text>
                            </View>
                          </View>
                          <View style={styles.goalAmount}>
                            {!getDisplayInfo().isHidden ? (
                              <Text style={styles.goalCurrentAmount}>
                                {formatCurrency(goal.currentAmount, goal.currency)}
                              </Text>
                            ) : (
                              <Text style={styles.goalCurrentAmount}>••••••</Text>
                            )}
                            <Text style={styles.goalProgress}>{Math.round(progress)}%</Text>
                          </View>
                        </View>
                        <View style={styles.progressBarContainer}>
                          <View style={styles.progressBar}>
                            <View
                              style={[
                                styles.progressBarFill,
                                {
                                  width: `${Math.min(progress, 100)}%`,
                                  backgroundColor: goal.color,
                                },
                              ]}
                            />
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })
                )}

                <TouchableOpacity
                  style={styles.addAccountButton}
                  onPress={() => navigation.navigate('AddGoal')}
                >
                  <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
                  <Text style={styles.addAccountText}>Añadir meta</Text>
                </TouchableOpacity>
              </View>

              {/* Sección Últimas Transacciones */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Últimas transacciones</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
                    <Text style={styles.sectionLink}>Ver todas</Text>
                  </TouchableOpacity>
                </View>

                {transactions.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Ionicons name="swap-horizontal-outline" size={48} color={colors.textSecondary} />
                    <Text style={styles.emptyText}>No tienes transacciones</Text>
                    <Text style={styles.emptySubtext}>Agrega tu primera transacción</Text>
                  </View>
                ) : (
                  transactions
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 3)
                    .map((transaction) => {
                      const account = accounts.find(a => a.id === transaction.accountId);
                      const category = categories.find(c => c.id === transaction.categoryId);
                      const isIncome = transaction.type === 'income';

                      // Special fallbacks for transactions created as account adjustments or transfers
                      const isAdjustment = transaction.categoryId === 'adjustment';
                      const isTransfer = transaction.categoryId === 'transfer';

                      const displayCategoryName = category?.name || (isAdjustment ? 'Ajuste de saldo' : isTransfer ? 'Transferencia' : 'Sin categoría');
                      const displayIcon = (category?.icon as any) || (isAdjustment ? 'swap-vertical' : isTransfer ? 'swap-horizontal' : 'help-circle-outline');
                      const displayColor = category?.color || (isAdjustment ? '#6B7280' : isTransfer ? colors.primary : colors.primary);

                      return (
                        <TouchableOpacity
                          key={transaction.id}
                          style={styles.transactionCard}
                          onPress={() => navigation.navigate('Transactions')}
                        >
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
                              <Text style={styles.transactionCategory}>{displayCategoryName}</Text>
                              <Text style={styles.transactionDescription}>{transaction.description}</Text>
                            </View>
                          </View>
                          <View style={styles.transactionRight}>
                            <Text
                              style={[
                                styles.transactionAmount,
                                {
                                  color: isIncome ? colors.success : colors.textPrimary,
                                },
                              ]}
                            >
                              {isIncome ? '+' : '-'}
                              {formatAccountBalance(transaction.amount, account?.currency || preferredCurrency)}
                            </Text>
                            <Text style={styles.transactionDate}>
                              {new Date(transaction.date).toLocaleDateString('es-HN', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })
                )}
              </View>

              {/* Sección Cuentas Archivadas */}
              {accounts.some(a => a.isArchived) && (
                <View style={styles.section}>
                  <TouchableOpacity
                    style={styles.sectionHeader}
                    onPress={() => setArchivedExpanded(!archivedExpanded)}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Cuentas Archivadas</Text>
                      <Ionicons
                        name={archivedExpanded ? "chevron-up" : "chevron-down"}
                        size={20}
                        color={colors.textSecondary}
                        style={styles.chevronIcon}
                      />
                    </View>
                  </TouchableOpacity>

                  {archivedExpanded && (
                    <View>
                      {accounts
                        .filter(a => a.isArchived)
                        .map((account) => (
                          <TouchableOpacity
                            key={account.id}
                            style={styles.accountCard}
                            onPress={() => handleAccountPress(account)}
                          >
                            <View style={styles.accountLeft}>
                              <View style={[styles.accountIcon, { backgroundColor: `${account.color}33`, opacity: 0.6 }]}>
                                <Ionicons name={account.icon as any} size={24} color={account.color} />
                              </View>
                              <View style={{ flex: 1 }}>
                                <Text style={[styles.accountName, { opacity: 0.6 }]}>{account.title}</Text>
                                <View style={styles.accountBalanceContainer}>
                                  {!getDisplayInfo().isHidden ? (
                                    <>
                                      <Text style={[styles.accountBalance, { opacity: 0.6 }]}>
                                        {formatAccountBalance(account.balance, account.currency)}
                                      </Text>
                                      {account.currency !== preferredCurrency && (
                                        <Text style={[styles.accountBalanceConverted, { opacity: 0.6 }]}>
                                          ≈ {getConvertedBalance(account)}
                                        </Text>
                                      )}
                                    </>
                                  ) : (
                                    <Text style={[styles.accountBalance, { opacity: 0.6 }]}>••••••</Text>
                                  )}
                                </View>
                              </View>
                            </View>
                          </TouchableOpacity>
                        ))}
                    </View>
                  )}
                </View>
              )}

              <View style={{ height: 100 }} />
            </View>
          )}
        </View>
      </ScrollView>

      {/* Account Detail Modal */}
      <AccountDetailModal
        visible={modalVisible}
        account={selectedAccount}
        onClose={handleCloseModal}
        onEdit={() => {
          handleCloseModal();
          navigation.navigate('EditAccount', { account: selectedAccount });
        }}
        onArchive={() => {
          if (selectedAccount) {
            updateAccount(selectedAccount.id, { isArchived: !selectedAccount.isArchived });
          }
          handleCloseModal();
        }}
        onTransactions={() => {
          handleCloseModal();
          navigation.navigate('Transactions');
        }}
        onIncome={() => {
          handleCloseModal();
          navigation.navigate('AddTransaction', { type: 'income', accountId: selectedAccount?.id });
        }}
        onTransfer={() => {
          handleCloseModal();
          navigation.navigate('Transfer', { accountId: selectedAccount?.id });
        }}
        onExpense={() => {
          handleCloseModal();
          navigation.navigate('AddTransaction', { type: 'expense', accountId: selectedAccount?.id });
        }}
      />
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    paddingTop: spacing.xl + 30,
    backgroundColor: colors.surface,
    gap: spacing.md,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSpacer: {
    width: 48,
  },
  headerBalanceContainer: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  headerBalance: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold as any,
    color: colors.textPrimary,
  },
  currencyLabel: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: typography.weights.semibold as any,
  },
  stateHint: {
    fontSize: typography.sizes.xs,
    color: colors.textTertiary,
    fontStyle: 'italic' as any,
    marginTop: spacing.xs,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium as any,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: typography.weights.semibold as any,
  },

  content: {
    flex: 1,
  },
  section: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as any,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  sectionBalance: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium as any,
    color: colors.textSecondary,
  },
  accountCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    paddingRight: spacing.lg * 2,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  accountLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  accountIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium as any,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  accountBalance: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as any,
    color: colors.textPrimary,
  },
  accountBalanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  accountBalanceConverted: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium as any,
  },
  goalCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  goalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  goalTarget: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 4,
  },
  goalAmount: {
    alignItems: 'flex-end',
  },
  goalCurrentAmount: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold as any,
    color: '#FFFFFF',
  },
  goalProgress: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 4,
    fontWeight: typography.weights.medium as any,
  },
  progressBarContainer: {
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  addAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    padding: spacing.md,
    borderRadius: 12,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  addAccountText: {
    fontSize: typography.sizes.base,
    color: colors.primary,
    fontWeight: typography.weights.medium as any,
    marginLeft: spacing.sm,
  },
  emptyGoalCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold as any,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  totalViewContent: {
    flex: 1,
  },
  totalCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  currencyLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  currencyBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currencyBadgeText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold as any,
    color: colors.textPrimary,
  },
  totalCurrency: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold as any,
    color: colors.textPrimary,
  },
  totalAmount: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold as any,
    color: colors.primary,
  },
  totalRowHighlight: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: `${colors.primary}15`,
  },
  totalConvertedLabel: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold as any,
    color: colors.textPrimary,
  },
  totalConvertedAmount: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold as any,
    color: colors.primary,
  },
  chevronIcon: {
    marginLeft: spacing.xs,
  },
  budgetCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  budgetLeftInfo: {
    flex: 1,
  },
  budgetRightInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  budgetLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontWeight: typography.weights.medium as any,
  },
  budgetAmountSpent: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold as any,
    color: colors.textPrimary,
  },
  budgetAmountTotal: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold as any,
    color: colors.primary,
  },
  budgetProgressContainer: {
    marginBottom: spacing.md,
  },
  budgetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  budgetPercentage: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold as any,
    color: colors.textPrimary,
  },
  budgetRemaining: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium as any,
  },
  budgetTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as any,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  upcomingPaymentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  upcomingPaymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  upcomingPaymentRight: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  upcomingPaymentDescription: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium as any,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  upcomingPaymentCategory: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium as any,
  },
  upcomingPaymentAmount: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold as any,
    color: colors.textPrimary,
  },
  upcomingPaymentDaysTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  upcomingPaymentDaysText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold as any,
    color: '#FFFFFF',
  },
  upcomingPaymentBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  upcomingPaymentBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold as any,
  },
  sectionLink: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium as any,
    color: colors.primary,
  },
  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionCategory: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold as any,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  transactionDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  transactionRight: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  transactionAmount: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold as any,
  },
  transactionAmountConverted: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium as any,
    marginTop: spacing.xs,
  },
  transactionDate: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium as any,
  },
  reorderControls: {
    position: 'absolute',
    right: spacing.md,
    top: '50%',
    transform: [{ translateY: -20 }],
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reorderButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  reorderIcon: {},
});
