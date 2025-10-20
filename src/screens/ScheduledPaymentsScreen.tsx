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

const convertToHNL = (amount: number, currency: string, rates: Record<string, number>): number => {
  const rate = rates[currency] || 1;
  return amount * rate;
};

const convertCurrency = (
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: Record<string, number>
): number => {
  if (fromCurrency === toCurrency) return amount;
  const toHNL = convertToHNL(amount, fromCurrency, rates);
  const targetRate = rates[toCurrency] || 1;
  return toHNL / targetRate;
};

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

  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<RecurringPayment | null>(null);
  const [editingPayment, setEditingPayment] = useState<RecurringPayment | null>(null);

  // Form states
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly'>('monthly');
  const [nextDate, setNextDate] = useState<Date>(new Date());
  const [displayDate, setDisplayDate] = useState(new Date().toLocaleDateString('es-HN'));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderDaysBefore, setReminderDaysBefore] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [currency, setCurrency] = useState(preferredCurrency);
  const [paid, setPaid] = useState(false);

  const formatCurrency = (amount: number, curr: string = preferredCurrency) => {
    const symbol = CURRENCY_SYMBOLS[curr] || curr;
    return `${symbol} ${amount.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const filteredCategories = categories.filter((c) => c.type === type);

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  // Agrupar pagos por mes
  const paymentsByMonth = useMemo(() => {
    const grouped: Record<string, RecurringPayment[]> = {};
    // Sort by nextDate ascending (soonest first)
    const sorted = [...recurringPayments].sort((a, b) => new Date(a.nextDate).getTime() - new Date(b.nextDate).getTime());
    sorted.forEach((payment) => {
      const date = new Date(payment.nextDate);
      const key = date.toLocaleDateString('es-HN', { year: 'numeric', month: 'long' });
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(payment);
    });
    return grouped;
  }, [recurringPayments]);

  const handleAddPayment = () => {
    if (!amount || !selectedCategoryId) {
      Alert.alert('Error', 'Por favor completa los campos requeridos');
      return;
    }

    if (editingPayment) {
      updateRecurringPayment(editingPayment.id, {
        type,
        amount: parseFloat(amount),
        categoryId: selectedCategoryId,
        description: description || selectedCategory?.name || '',
        frequency,
        nextDate: nextDate.toISOString(),
        isActive,
        reminderEnabled,
        reminderDaysBefore: parseInt(reminderDaysBefore) || 0,
        currency,
        paid,
      });
    } else {
      addRecurringPayment({
        type,
        amount: parseFloat(amount),
        categoryId: selectedCategoryId,
        description: description || selectedCategory?.name || '',
        frequency,
        nextDate: nextDate.toISOString(),
        isActive,
        reminderEnabled,
        reminderDaysBefore: parseInt(reminderDaysBefore) || 0,
        currency,
      });
    }

    setModalVisible(false);
    resetForm();
  };

  const handleEditPayment = (payment: RecurringPayment) => {
    setEditingPayment(payment);
    setType(payment.type);
    setAmount(payment.amount.toString());
    setDescription(payment.description);
    setSelectedCategoryId(payment.categoryId);
    setFrequency(payment.frequency);
    setNextDate(new Date(payment.nextDate));
    setDisplayDate(new Date(payment.nextDate).toLocaleDateString('es-HN'));
    setReminderEnabled(payment.reminderEnabled);
    setReminderDaysBefore(payment.reminderDaysBefore.toString());
    setIsActive(payment.isActive);
    setCurrency(payment.currency);
    setPaid(!!payment.paid);
    setModalVisible(true);
  };

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

  const resetForm = () => {
    setType('expense');
    setAmount('');
    setDescription('');
    setSelectedCategoryId('');
    setFrequency('monthly');
    setNextDate(new Date());
    setDisplayDate(new Date().toLocaleDateString('es-HN'));
    setReminderEnabled(true);
    setReminderDaysBefore('0');
    setIsActive(true);
    setCurrency(preferredCurrency);
    setEditingPayment(null);
  };

  const openDetailModal = (payment: RecurringPayment) => {
    setSelectedPayment(payment);
    setDetailModalVisible(true);
  };

  // (Removed upcomingPayments section — we will list all payments sorted by nextDate)

  const totalMonthly = useMemo(() => {
    const total = recurringPayments
      .filter((p) => p.frequency === 'monthly' && p.isActive && p.type === 'expense')
      .reduce((sum, p) => sum + convertToHNL(p.amount, p.currency, exchangeRates), 0);
    return convertCurrency(total, 'HNL', preferredCurrency, exchangeRates);
  }, [recurringPayments, exchangeRates, preferredCurrency]);

  // Total de todos los pagos programados convertidos a moneda preferida
  const totalAllPayments = useMemo(() => {
    const total = recurringPayments
      .filter((p) => p.isActive)
      .reduce((sum, p) => {
        const amountInHNL = convertToHNL(p.amount, p.currency, exchangeRates);
        return p.type === 'income' ? sum + amountInHNL : sum - amountInHNL;
      }, 0);
    return convertCurrency(total, 'HNL', preferredCurrency, exchangeRates);
  }, [recurringPayments, exchangeRates, preferredCurrency]);

  return (
    <View style={styles.container}>
      {/* Header con resumen */}
      <View style={styles.header}>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Pagos Programados</Text>
          <Text style={styles.summaryAmount}>{formatCurrency(Math.abs(totalAllPayments), preferredCurrency)}</Text>
          <Text style={styles.summarySubtext}>
            {recurringPayments.filter((p) => p.isActive).length} pagos activos
          </Text>
        </Card>
      </View>

      {/* 'Próximos Pagos' section removed — showing full list below sorted by soonest date */}

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
          Object.entries(paymentsByMonth).map(([month, payments]) => (
            <View key={month}>
              <Text style={styles.monthTitle}>{month}</Text>
              {payments.map((payment) => {
                const cat = categories.find((c) => c.id === payment.categoryId);
                const paymentCardStyle = !payment.isActive
                  ? [styles.paymentCard, styles.paymentCardInactive]
                  : styles.paymentCard;
                return (
                  <TouchableOpacity
                    key={payment.id}
                    onPress={() => openDetailModal(payment)}
                    activeOpacity={0.7}
                  >
                    <Card
                      style={paymentCardStyle as any}
                    >
                      <View style={styles.paymentHeader}>
                        <View style={styles.paymentInfo}>
                          {cat && (
                            <CategoryIcon icon={cat.icon} color={cat.color} size={20} />
                          )}
                          <View style={styles.paymentTextInfo}>
                            <Text style={styles.paymentDescription}>
                              {payment.description}
                            </Text>
                            <View style={styles.paymentMeta}>
                              <Text style={styles.paymentFrequency}>
                                {frequencyLabels[payment.frequency]}
                              </Text>
                              {payment.paid ? (
                                <View style={[styles.activeBadge, { backgroundColor: colors.success + '20' }]}>
                                  <Text style={[styles.activeBadgeText, { color: colors.success }]}>
                                    Pagado
                                  </Text>
                                </View>
                              ) : (
                                <View style={[styles.activeBadge, { backgroundColor: colors.textTertiary + '30' }]}>
                                  <Text style={[styles.activeBadgeText, { color: colors.textTertiary }]}>
                                    No pagado
                                  </Text>
                                </View>
                              )}
                            </View>
                          </View>
                        </View>
                        <View style={styles.paymentAmount}>
                          <Text
                            style={[
                              styles.amountText,
                              payment.type === 'income' ? styles.income : styles.amountWhite,
                            ]}
                          >
                            {formatCurrency(payment.amount, payment.currency)}
                          </Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                            <Text style={styles.dateText}>
                              {new Date(payment.nextDate).toLocaleDateString('es-HN')}
                            </Text>
                          </View>
                        </View>
                      </View>
                      {payment.reminderEnabled && (
                        <View style={styles.reminderInfo}>
                          <Ionicons name="notifications" size={14} color={colors.primary} />
                          <Text style={styles.reminderText}>
                            Recordatorio {payment.reminderDaysBefore} días antes
                          </Text>
                        </View>
                      )}
                    </Card>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Botón flotante */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary, bottom: 16 + (insets.bottom || 0) }]}
        onPress={() => {
          resetForm();
          setModalVisible(true);
        }}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Modal para agregar/editar pago */}
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
                {editingPayment ? 'Editar Pago' : 'Nuevo Pago Programado'}
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
              {/* Tipo de pago */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tipo de Pago</Text>
                <View style={styles.typeSelector}>
                  {(['expense', 'income'] as const).map((t) => (
                    <TouchableOpacity
                      key={t}
                      style={[
                        styles.typeButton,
                        type === t && {
                          backgroundColor: colors.primary,
                        },
                      ]}
                      onPress={() => {
                        setType(t);
                        setSelectedCategoryId('');
                      }}
                    >
                      <Text
                        style={[
                          styles.typeButtonText,
                          type === t && { color: '#fff' },
                        ]}
                      >
                        {t === 'expense' ? 'Gasto' : 'Ingreso'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Monto */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Monto</Text>
                <TextInput
                  style={styles.input}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>

              {/* Moneda */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Moneda</Text>
                <CurrencySelector
                  selectedCurrency={currency}
                  onCurrencyChange={setCurrency}
                  label="Seleccionar moneda"
                />
              </View>

              {/* Descripción */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Descripción</Text>
                <TextInput
                  style={styles.input}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Netflix, Spotify, etc."
                  placeholderTextColor={colors.textTertiary}
                />
              </View>

              {/* Categoría */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Categoría</Text>
                <View style={styles.categoriesGrid}>
                  {filteredCategories.map((category) => {
                    const isSelected = selectedCategoryId === category.id;
                    return (
                      <TouchableOpacity
                        key={category.id}
                        style={[
                          styles.categoryItem,
                          isSelected && {
                            backgroundColor: category.color + '20',
                            borderColor: category.color,
                            borderWidth: 2,
                          },
                        ]}
                        onPress={() => setSelectedCategoryId(category.id)}
                      >
                        <CategoryIcon
                          icon={category.icon}
                          color={category.color}
                          size={24}
                        />
                        <Text style={styles.categoryItemName}>{category.name}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Frecuencia */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Frecuencia</Text>
                <View style={styles.frequencySelector}>
                  {(['daily', 'weekly', 'biweekly', 'monthly', 'yearly'] as const).map((f) => (
                    <TouchableOpacity
                      key={f}
                      style={[
                        styles.frequencyButton,
                        frequency === f && { backgroundColor: colors.primary },
                      ]}
                      onPress={() => setFrequency(f)}
                    >
                      <Text
                        style={[
                          styles.frequencyButtonText,
                          frequency === f && { color: '#fff' },
                        ]}
                      >
                        {frequencyLabels[f]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Próxima fecha */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Próximo Pago</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Ionicons name="calendar" size={20} color={colors.textSecondary} />
                  <Text style={styles.dateButtonText}>{displayDate}</Text>
                </TouchableOpacity>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={nextDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event: any, selectedDate?: Date) => {
                    if (selectedDate) {
                      setShowDatePicker(Platform.OS === 'ios');
                      setNextDate(selectedDate);
                      setDisplayDate(selectedDate.toLocaleDateString('es-HN'));
                    } else {
                      setShowDatePicker(false);
                    }
                  }}
                  minimumDate={new Date()}
                />
              )}

              {/* Recordatorio */}
              <View style={styles.inputGroup}>
                <View style={styles.reminderToggle}>
                  <Text style={styles.label}>Recordatorio</Text>
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      { backgroundColor: reminderEnabled ? colors.primary : colors.surface },
                    ]}
                    onPress={() => setReminderEnabled(!reminderEnabled)}
                  >
                    <Ionicons
                      name={reminderEnabled ? 'checkmark' : 'close'}
                      size={16}
                      color={reminderEnabled ? '#fff' : colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>

                {reminderEnabled && (
                  <TextInput
                    style={styles.input}
                    value={reminderDaysBefore}
                    onChangeText={setReminderDaysBefore}
                    keyboardType="number-pad"
                    placeholder="Días antes (ej: 1)"
                    placeholderTextColor={colors.textTertiary}
                  />
                )}
              </View>

              {/* Estado activo */}
              <View style={styles.inputGroup}>
                <View style={styles.reminderToggle}>
                  <Text style={styles.label}>Estado</Text>
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      { backgroundColor: isActive ? colors.success : colors.textTertiary },
                    ]}
                    onPress={() => setIsActive(!isActive)}
                  >
                    <Ionicons
                      name={isActive ? 'checkmark' : 'close'}
                      size={16}
                      color="#fff"
                    />
                  </TouchableOpacity>
                </View>
                <Text style={styles.stateText}>
                  {isActive ? 'Pago activo' : 'Pago inactivo'}
                </Text>
              </View>

              {/* Pagado */}
              <View style={styles.inputGroup}>
                <View style={styles.reminderToggle}>
                  <Text style={styles.label}>Pagado</Text>
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      { backgroundColor: paid ? colors.primary : colors.surface },
                    ]}
                    onPress={() => setPaid(!paid)}
                  >
                    <Ionicons
                      name={paid ? 'checkmark' : 'close'}
                      size={16}
                      color={paid ? '#fff' : colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
                <Text style={styles.stateText}>
                  {paid ? 'Marcado como pagado' : 'No pagado'}
                </Text>
              </View>

              <View style={{ height: 20 }} />
            </ScrollView>

            <View style={[styles.modalFooter, { paddingBottom: spacing.xl + (insets.bottom || 0) }]}>
              <Button
                title={editingPayment ? 'Actualizar' : 'Crear Pago'}
                onPress={handleAddPayment}
                variant="solidPrimary"
                style={[styles.button, { width: '100%' }]}
              />
            </View>
          </View>
        </View>
      </Modal>

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
                      <Text style={styles.detailLabel}>Descripción:</Text>
                      <Text style={styles.detailValue}>{selectedPayment.description}</Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Monto:</Text>
                      <Text style={[styles.detailValue, { fontWeight: '700' }]}>
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
                        {new Date(selectedPayment.nextDate).toLocaleDateString('es-HN')}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Recordatorio:</Text>
                      <Text style={styles.detailValue}>
                        {selectedPayment.reminderEnabled
                          ? `${selectedPayment.reminderDaysBefore} días antes`
                          : 'Desactivado'}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Pagado:</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                        <Text style={styles.detailValue}>{selectedPayment.paid ? 'Sí' : 'No'}</Text>
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
                      handleEditPayment(selectedPayment);
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
});
