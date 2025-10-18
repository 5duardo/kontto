import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography, useTheme } from '../theme';
import { useAppStore } from '../store/useAppStore';

interface ScheduledPayment {
  id: string;
  title: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';
  nextDate: string;
  categoryId: string;
  isActive: boolean;
  icon: string;
  color: string;
  currency: string;
  accountId: string;
  reminder: string;
  autoRenewal: boolean;
}

const FREQUENCY_LABELS = {
  daily: 'Día',
  weekly: 'Semana',
  biweekly: 'Quincena',
  monthly: 'Mes',
  yearly: 'Año',
};

const CURRENCIES = [
  { code: 'HNL', name: 'Lempira Hondureño' },
  { code: 'USD', name: 'Dólar Estadounidense' },
  { code: 'EUR', name: 'Euro' },
];

const REMINDERS = [
  { id: 'never', label: 'Nunca' },
  { id: '1day', label: '1 día antes' },
  { id: '3days', label: '3 días antes' },
  { id: '1week', label: '1 semana antes' },
];

const ICONS = [
  'cash', 'card', 'wallet', 'wifi', 'phone-portrait',
  'water', 'flash', 'play-circle', 'barbell-outline', 'medkit',
  'school', 'home', 'car', 'restaurant', 'airplane',
  'heart', 'cart', 'briefcase', 'tv', 'fitness',
];

const COLORS = [
  '#3B82F6', '#06B6D4', '#10B981', '#8B5CF6', '#EC4899',
  '#EF4444', '#F59E0B', '#6B7280', '#14B8A6', '#F97316',
];

export const ScheduledPaymentsScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const categories = useAppStore((state) => state.categories);
  const accounts = useAppStore((state) => state.accounts);
  const initializeDefaultData = useAppStore((state) => state.initializeDefaultData);
  const isInitialized = useAppStore((state) => state.isInitialized);

  const [payments, setPayments] = useState<ScheduledPayment[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);

  const [form, setForm] = useState({
    title: '',
    amount: '',
    frequency: 'monthly' as any,
    nextDate: new Date().toISOString().split('T')[0],
    categoryId: '',
    icon: 'calendar',
    color: '#3B82F6',
    currency: 'HNL',
    accountId: '',
    reminder: 'never',
    autoRenewal: true,
  });

  const [dateForm, setDateForm] = useState({
    day: new Date().getDate(),
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  const styles = useMemo(() => createStyles(colors), [colors]);

  useEffect(() => {
    if (!isInitialized) {
      initializeDefaultData();
    }
  }, []);

  useEffect(() => {
    if (categories.length > 0 && !form.categoryId) {
      setForm(prev => ({ ...prev, categoryId: categories[0].id }));
    }
  }, [categories]);

  const handleAdd = () => {
    if (!form.title.trim() || !form.amount) {
      Alert.alert('Error', 'Completa los campos requeridos');
      return;
    }

    const newPayment: ScheduledPayment = {
      id: Date.now().toString(),
      title: form.title.trim(),
      amount: parseFloat(form.amount),
      frequency: form.frequency,
      nextDate: form.nextDate,
      categoryId: form.categoryId,
      icon: form.icon,
      color: form.color,
      currency: form.currency,
      accountId: form.accountId,
      reminder: form.reminder,
      autoRenewal: form.autoRenewal,
      isActive: true,
    };

    setPayments([newPayment, ...payments]);
    setForm({
      title: '',
      amount: '',
      frequency: 'monthly',
      nextDate: new Date().toISOString().split('T')[0],
      categoryId: categories[0]?.id || '',
      icon: 'calendar',
      color: '#3B82F6',
      currency: 'HNL',
      accountId: '',
      reminder: 'never',
      autoRenewal: true,
    });
    setShowAddModal(false);
    Alert.alert('Éxito', 'Pago programado creado');
  };

  const handleDelete = (id: string) => {
    Alert.alert('Eliminar', '¿Eliminar este pago?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => setPayments(payments.filter(p => p.id !== id)),
      },
    ]);
  };

  const getDaysUntil = (dateStr: string) => {
    const days = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (days === 1) return 'mañana';
    if (days <= 7) return `en ${days} días`;
    const weeks = Math.ceil(days / 7);
    if (days <= 30) return `en ${weeks} semana${weeks > 1 ? 's' : ''}`;
    const months = Math.ceil(days / 30);
    return `en ${months} mes${months > 1 ? 'es' : ''}`;
  };

  const activeCount = payments.filter(p => p.isActive).length;
  const monthlyTotal = payments
    .filter(p => p.isActive && p.frequency === 'monthly')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll}>
        {/* Summary */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: `${colors.primary}15` }]}>
            <Ionicons name="checkmark-circle" size={28} color={colors.primary} />
            <View style={styles.summaryText}>
              <Text style={styles.summaryLabel}>Activos</Text>
              <Text style={styles.summaryValue}>{activeCount}</Text>
            </View>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: '#10B98115' }]}>
            <Ionicons name="cash" size={28} color="#10B981" />
            <View style={styles.summaryText}>
              <Text style={styles.summaryLabel}>Mensual</Text>
              <Text style={styles.summaryValue}>${monthlyTotal.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Payments List */}
        {payments.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="calendar" size={60} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>Sin pagos programados</Text>
            <Text style={styles.emptyText}>Crea pagos para automatizar transacciones</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {payments.map((payment) => (
              <TouchableOpacity
                key={payment.id}
                style={styles.paymentCard}
                onLongPress={() => handleDelete(payment.id)}
              >
                <View style={[styles.paymentIcon, { backgroundColor: payment.color }]}>
                  <Ionicons name={payment.icon as any} size={24} color="#FFF" />
                </View>
                <View style={styles.paymentContent}>
                  <Text style={styles.paymentTitle}>{payment.title}</Text>
                  <Text style={styles.paymentTime}>{getDaysUntil(payment.nextDate)}</Text>
                </View>
                <View style={styles.paymentRight}>
                  <Text style={styles.paymentAmount}>${payment.amount.toFixed(2)}</Text>
                  <Text style={styles.paymentFreq}>{FREQUENCY_LABELS[payment.frequency]}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => setShowAddModal(true)}
      >
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>

      {/* Add Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={28} color={colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Nuevo Pago</Text>
              <View style={{ width: 28 }} />
            </View>

            <ScrollView>
              {/* Icon Preview + Name */}
              <View style={[styles.topSection, { backgroundColor: `${form.color}15` }]}>
                <View style={[styles.iconPreview, { backgroundColor: form.color }]}>
                  <Ionicons name={form.icon as any} size={32} color="#FFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>NOMBRE</Text>
                  <TextInput
                    style={[styles.input, { color: colors.textPrimary, borderColor: colors.border }]}
                    placeholder="Ej: Internet"
                    placeholderTextColor={colors.textSecondary}
                    value={form.title}
                    onChangeText={(title) => setForm({ ...form, title })}
                  />
                </View>
              </View>

              {/* Amount & Currency */}
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>MONTO</Text>
                  <TextInput
                    style={[styles.input, { color: colors.textPrimary, borderColor: colors.border }]}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                    value={form.amount}
                    onChangeText={(amount) => setForm({ ...form, amount })}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Text style={styles.label}>MONEDA</Text>
                  <TouchableOpacity
                    style={[styles.selector, { borderColor: colors.border }]}
                    onPress={() => setShowCurrencyModal(true)}
                  >
                    <Text style={{ color: colors.textPrimary }}>
                      {CURRENCIES.find(c => c.code === form.currency)?.name || 'Seleccionar'}
                    </Text>
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Category */}
              <Text style={styles.label}>CATEGORÍA</Text>
              <TouchableOpacity
                style={[styles.selector, { borderColor: colors.border }]}
                onPress={() => setShowCategoryModal(true)}
              >
                <Text style={{ color: colors.textPrimary }}>
                  {categories.find(c => c.id === form.categoryId)?.name || 'Seleccionar'}
                </Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              {/* Auto Renewal Toggle */}
              <View style={styles.toggleRow}>
                <Text style={[styles.label, { marginBottom: 0 }]}>RENOVACIÓN AUTOMÁTICA</Text>
                <TouchableOpacity onPress={() => setForm({ ...form, autoRenewal: !form.autoRenewal })}>
                  <View style={[styles.toggle, { backgroundColor: form.autoRenewal ? colors.primary : colors.border }]}>
                    <View style={[styles.toggleThumb, { marginLeft: form.autoRenewal ? 22 : 2 }]} />
                  </View>
                </TouchableOpacity>
              </View>

              {/* Start Date */}
              <Text style={styles.label}>INICIA</Text>
              <TouchableOpacity
                style={[styles.selector, { borderColor: colors.border }]}
                onPress={() => setShowDateModal(true)}
              >
                <Text style={{ color: colors.textPrimary }}>
                  {new Date(form.nextDate).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                </Text>
              </TouchableOpacity>

              {/* Frequency */}
              <Text style={styles.label}>CICLO</Text>
              <View style={styles.chipRow}>
                {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((freq) => (
                  <TouchableOpacity
                    key={freq}
                    style={[
                      styles.chip,
                      form.frequency === freq
                        ? { backgroundColor: colors.primary }
                        : { backgroundColor: colors.backgroundSecondary, borderWidth: 1, borderColor: colors.border }
                    ]}
                    onPress={() => setForm({ ...form, frequency: freq })}
                  >
                    <Text style={[styles.chipText, { color: form.frequency === freq ? '#FFF' : colors.textPrimary }]}>
                      {FREQUENCY_LABELS[freq]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Account */}
              <Text style={styles.label}>CUENTA DE PAGO</Text>
              <TouchableOpacity
                style={[styles.selector, { borderColor: colors.border }]}
                onPress={() => setShowAccountModal(true)}
              >
                <Text style={{ color: colors.textPrimary }}>
                  {accounts.find(a => a.id === form.accountId)?.title || 'Ninguno'}
                </Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              {/* Reminder */}
              <Text style={styles.label}>RECORDATORIO</Text>
              <TouchableOpacity
                style={[styles.selector, { borderColor: colors.border }]}
                onPress={() => setShowReminderModal(true)}
              >
                <Text style={{ color: colors.textPrimary }}>
                  {REMINDERS.find(r => r.id === form.reminder)?.label || 'Nunca'}
                </Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              {/* Icons */}
              <Text style={styles.label}>ICONO</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.lg }}>
                <View style={styles.iconGrid}>
                  {ICONS.map((iconName) => (
                    <TouchableOpacity
                      key={iconName}
                      style={[
                        styles.iconButton,
                        { borderColor: form.icon === iconName ? colors.primary : colors.border }
                      ]}
                      onPress={() => setForm({ ...form, icon: iconName })}
                    >
                      <Ionicons name={iconName as any} size={24} color={form.icon === iconName ? '#FFF' : colors.textSecondary} />
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              {/* Colors */}
              <Text style={styles.label}>COLOR</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.lg }}>
                <View style={styles.iconGrid}>
                  {COLORS.map((colorItem) => (
                    <TouchableOpacity
                      key={colorItem}
                      style={[
                        styles.colorButton,
                        { backgroundColor: colorItem, borderColor: form.color === colorItem ? '#FFF' : 'transparent' }
                      ]}
                      onPress={() => setForm({ ...form, color: colorItem })}
                    >
                      {form.color === colorItem && <Ionicons name="checkmark" size={20} color="#FFF" />}
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              {/* Buttons */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: colors.border }]}
                  onPress={() => setShowAddModal(false)}
                >
                  <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: colors.primary }]}
                  onPress={handleAdd}
                >
                  <Text style={{ color: '#FFF', fontWeight: '600' }}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Category Modal */}
      <Modal visible={showCategoryModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Ionicons name="close" size={28} color={colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Categoría</Text>
              <View style={{ width: 28 }} />
            </View>
            <ScrollView>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.listItem, { borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]}
                  onPress={() => {
                    setForm({ ...form, categoryId: cat.id });
                    setShowCategoryModal(false);
                  }}
                >
                  <Ionicons name={cat.icon as any} size={24} color={cat.color} />
                  <Text style={[styles.listItemText, { color: colors.textPrimary }]}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Currency Modal */}
      <Modal visible={showCurrencyModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowCurrencyModal(false)}>
                <Ionicons name="close" size={28} color={colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Moneda</Text>
              <View style={{ width: 28 }} />
            </View>
            <ScrollView>
              {CURRENCIES.map((curr) => (
                <TouchableOpacity
                  key={curr.code}
                  style={[styles.listItem, { borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]}
                  onPress={() => {
                    setForm({ ...form, currency: curr.code });
                    setShowCurrencyModal(false);
                  }}
                >
                  <Text style={[styles.listItemText, { color: colors.textPrimary }]}>{curr.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Account Modal */}
      <Modal visible={showAccountModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowAccountModal(false)}>
                <Ionicons name="close" size={28} color={colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Cuenta</Text>
              <View style={{ width: 28 }} />
            </View>
            <ScrollView>
              <TouchableOpacity
                style={[styles.listItem, { borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]}
                onPress={() => {
                  setForm({ ...form, accountId: '' });
                  setShowAccountModal(false);
                }}
              >
                <Text style={[styles.listItemText, { color: colors.textSecondary }]}>Ninguno</Text>
              </TouchableOpacity>
              {accounts.map((acc) => (
                <TouchableOpacity
                  key={acc.id}
                  style={[styles.listItem, { borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]}
                  onPress={() => {
                    setForm({ ...form, accountId: acc.id });
                    setShowAccountModal(false);
                  }}
                >
                  <Ionicons name={acc.icon as any} size={24} color={acc.color} />
                  <Text style={[styles.listItemText, { color: colors.textPrimary }]}>{acc.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Reminder Modal */}
      <Modal visible={showReminderModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowReminderModal(false)}>
                <Ionicons name="close" size={28} color={colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Recordatorio</Text>
              <View style={{ width: 28 }} />
            </View>
            <ScrollView>
              {REMINDERS.map((rem) => (
                <TouchableOpacity
                  key={rem.id}
                  style={[styles.listItem, { borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]}
                  onPress={() => {
                    setForm({ ...form, reminder: rem.id });
                    setShowReminderModal(false);
                  }}
                >
                  <Text style={[styles.listItemText, { color: colors.textPrimary }]}>{rem.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Date Modal */}
      <Modal visible={showDateModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowDateModal(false)}>
                <Ionicons name="close" size={28} color={colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Fecha</Text>
              <View style={{ width: 28 }} />
            </View>
            <View style={styles.dateRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>DÍA</Text>
                <TextInput
                  style={[styles.dateInput, { color: colors.textPrimary, borderColor: colors.border }]}
                  keyboardType="number-pad"
                  maxLength={2}
                  value={dateForm.day.toString().padStart(2, '0')}
                  onChangeText={(text) => {
                    const day = parseInt(text) || 1;
                    if (day >= 1 && day <= 31) setDateForm({ ...dateForm, day });
                  }}
                />
              </View>
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={styles.label}>MES</Text>
                <TextInput
                  style={[styles.dateInput, { color: colors.textPrimary, borderColor: colors.border }]}
                  keyboardType="number-pad"
                  maxLength={2}
                  value={dateForm.month.toString().padStart(2, '0')}
                  onChangeText={(text) => {
                    const month = parseInt(text) || 1;
                    if (month >= 1 && month <= 12) setDateForm({ ...dateForm, month });
                  }}
                />
              </View>
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={styles.label}>AÑO</Text>
                <TextInput
                  style={[styles.dateInput, { color: colors.textPrimary, borderColor: colors.border }]}
                  keyboardType="number-pad"
                  maxLength={4}
                  value={dateForm.year.toString()}
                  onChangeText={(text) => {
                    const year = parseInt(text) || new Date().getFullYear();
                    setDateForm({ ...dateForm, year });
                  }}
                />
              </View>
            </View>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.border }]}
                onPress={() => setShowDateModal(false)}
              >
                <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.primary }]}
                onPress={() => {
                  const date = new Date(dateForm.year, dateForm.month - 1, dateForm.day);
                  setForm({ ...form, nextDate: date.toISOString().split('T')[0] });
                  setShowDateModal(false);
                }}
              >
                <Text style={{ color: '#FFF', fontWeight: '600' }}>Confirmar</Text>
              </TouchableOpacity>
            </View>
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
  scroll: {
    flex: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.md,
  },
  summaryCard: {
    flex: 1,
    flexDirection: 'row',
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    gap: spacing.md,
  },
  summaryText: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  empty: {
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  list: {
    padding: spacing.md,
    gap: spacing.md,
  },
  paymentCard: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.md,
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentContent: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  paymentTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  paymentRight: {
    alignItems: 'flex-end',
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  paymentFreq: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    padding: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  topSection: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  iconPreview: {
    width: 64,
    height: 64,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.md,
    fontSize: 15,
  },
  row: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  selector: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.md,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 2,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFF',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  iconGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
  },
  colorButton: {
    width: 48,
    height: 48,
    borderRadius: 10,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  button: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 10,
    alignItems: 'center',
  },
  listItem: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.sm,
    alignItems: 'center',
    gap: spacing.md,
  },
  listItemText: {
    fontSize: 15,
    fontWeight: '500',
  },
  dateRow: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  dateInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.md,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
