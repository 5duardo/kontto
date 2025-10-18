import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography, useTheme } from '../theme';
import { useAppStore } from '../store/useAppStore';

interface ScheduledPayment {
  id: string;
  title: string;
  description: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';
  nextDate: string;
  categoryId: string;
  isActive: boolean;
  icon: string;
  color: string;
  currency: string;
  accountId?: string;
  reminder: string;
  autoRenewal: boolean;
  hasEndDate: boolean;
}

const FREQUENCY_LABELS = {
  daily: 'Diaria',
  weekly: 'Semanal',
  biweekly: 'Quincenal',
  monthly: 'Mensual',
  yearly: 'Anual',
};

const AVAILABLE_CURRENCIES = [
  { code: 'HNL', name: 'Lempira Hondureño', symbol: 'L' },
  { code: 'USD', name: 'Dólar Estadounidense', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
];

const REMINDER_OPTIONS = [
  { id: 'never', label: 'Nunca' },
  { id: '1day', label: '1 día antes' },
  { id: '3days', label: '3 días antes' },
  { id: '1week', label: '1 semana antes' },
];

const AVAILABLE_ICONS = [
  'cash',
  'card',
  'wallet',
  'wifi',
  'phone-portrait',
  'water',
  'flash',
  'play-circle',
  'barbell-outline',
  'medkit',
  'school',
  'home',
  'car',
  'restaurant',
  'airplane',
  'heart',
  'cart',
  'briefcase',
  'tv',
  'fitness',
];

const AVAILABLE_COLORS = [
  '#3B82F6', // Blue
  '#06B6D4', // Cyan
  '#10B981', // Green
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#EF4444', // Red
  '#F59E0B', // Amber
  '#6B7280', // Gray
  '#14B8A6', // Teal
  '#F97316', // Orange
];

const INITIAL_PAYMENTS: ScheduledPayment[] = [];

export const ScheduledPaymentsScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const categories = useAppStore((state) => state.categories);
  const accounts = useAppStore((state) => state.accounts);
  const preferredCurrency = useAppStore((state) => state.preferredCurrency);
  const initializeDefaultData = useAppStore((state) => state.initializeDefaultData);
  const isInitialized = useAppStore((state) => state.isInitialized);

  // Inicializar datos del store si no están inicializados
  React.useEffect(() => {
    if (!isInitialized) {
      initializeDefaultData();
    }
  }, [isInitialized, initializeDefaultData]);

  const [payments, setPayments] = React.useState(INITIAL_PAYMENTS);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [datePickerVisible, setDatePickerVisible] = React.useState(false);
  const [categoryPickerVisible, setCategoryPickerVisible] = React.useState(false);
  const [currencyPickerVisible, setCurrencyPickerVisible] = React.useState(false);
  const [accountPickerVisible, setAccountPickerVisible] = React.useState(false);
  const [reminderPickerVisible, setReminderPickerVisible] = React.useState(false);

  const defaultPaymentState = {
    title: '',
    description: '',
    amount: '',
    frequency: 'monthly' as 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly',
    icon: 'calendar',
    color: '#3B82F6',
    nextDate: new Date().toISOString().split('T')[0],
    categoryId: categories.length > 0 ? categories[0].id : '',
    currency: preferredCurrency || 'HNL',
    accountId: accounts.length > 0 ? accounts[0].id : '',
    reminder: 'never',
    autoRenewal: true,
    hasEndDate: false,
  };

  const [newPayment, setNewPayment] = React.useState(defaultPaymentState);

  const [tempDate, setTempDate] = React.useState({
    day: new Date().getDate(),
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  const styles = React.useMemo(() => createStyles(colors), [colors]);

  // Actualizar categoryId y accountId cuando los datos del store cambian
  React.useEffect(() => {
    if (isInitialized && categories.length > 0 && !newPayment.categoryId) {
      setNewPayment(prev => ({
        ...prev,
        categoryId: categories[0].id,
      }));
    }
  }, [isInitialized, categories]);

  React.useEffect(() => {
    if (isInitialized && accounts.length > 0 && !newPayment.accountId) {
      setNewPayment(prev => ({
        ...prev,
        accountId: accounts[0].id,
      }));
    }
  }, [isInitialized, accounts]);

  // Sincronizar tempDate cuando se abre el modal
  React.useEffect(() => {
    if (datePickerVisible) {
      const date = new Date(newPayment.nextDate);
      setTempDate({
        day: date.getDate(),
        month: date.getMonth() + 1,
        year: date.getFullYear(),
      });
    }
  }, [datePickerVisible]);

  const handleTogglePayment = (id: string) => {
    setPayments(prev =>
      prev.map(p =>
        p.id === id ? { ...p, isActive: !p.isActive } : p
      )
    );
  };

  const handleDeletePayment = (id: string) => {
    Alert.alert(
      'Eliminar pago programado',
      '¿Estás seguro de que quieres eliminar este pago?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setPayments(prev => prev.filter(p => p.id !== id));
            Alert.alert('Éxito', 'Pago eliminado correctamente');
          },
        },
      ]
    );
  };

  const handleAddPayment = () => {
    if (!newPayment.title || !newPayment.amount) {
      Alert.alert('Error', 'Por favor completa los campos requeridos');
      return;
    }

    const payment: ScheduledPayment = {
      id: Date.now().toString(),
      title: newPayment.title,
      description: newPayment.description,
      amount: parseFloat(newPayment.amount),
      frequency: newPayment.frequency,
      nextDate: newPayment.nextDate,
      categoryId: newPayment.categoryId,
      isActive: true,
      icon: newPayment.icon,
      color: newPayment.color,
      currency: newPayment.currency,
      accountId: newPayment.accountId,
      reminder: newPayment.reminder,
      autoRenewal: newPayment.autoRenewal,
      hasEndDate: newPayment.hasEndDate,
    };

    setPayments(prev => [payment, ...prev]);
    setNewPayment({ 
      title: '', 
      description: '', 
      amount: '', 
      frequency: 'monthly',
      icon: 'calendar',
      color: '#3B82F6',
      nextDate: new Date().toISOString().split('T')[0],
      categoryId: categories.length > 0 ? categories[0].id : '',
      currency: preferredCurrency || 'HNL',
      accountId: accounts.length > 0 ? accounts[0].id : '',
      reminder: 'never',
      autoRenewal: true,
      hasEndDate: false,
    });
    setModalVisible(false);
    Alert.alert('Éxito', 'Pago programado creado correctamente');
  };

  const getFrequencyColor = (frequency: string) => {
    const colors: Record<string, string> = {
      daily: '#EF4444',
      weekly: '#F59E0B',
      biweekly: '#06B6D4',
      monthly: '#3B82F6',
      yearly: '#8B5CF6',
    };
    return colors[frequency] || '#6B7280';
  };

  const renderPaymentItem = (payment: ScheduledPayment) => {
    const daysUntil = Math.ceil((new Date(payment.nextDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    let timeText = '';
    
    if (daysUntil === 1) {
      timeText = 'mañana';
    } else if (daysUntil <= 7) {
      timeText = `en ${daysUntil} días`;
    } else if (daysUntil <= 30) {
      const weeks = Math.ceil(daysUntil / 7);
      timeText = `en ${weeks} semana${weeks > 1 ? 's' : ''}`;
    } else {
      const months = Math.ceil(daysUntil / 30);
      timeText = `en ${months} mes${months > 1 ? 'es' : ''}`;
    }

    return (
      <TouchableOpacity
        key={payment.id}
        style={[styles.paymentCard, !payment.isActive && styles.inactivePayment]}
        onLongPress={() => Alert.alert('Opciones', 'Toca el ícono de eliminar para borrar', [{ text: 'OK' }])}
      >
        <View style={styles.paymentLeft}>
          <View style={[styles.paymentIcon, { backgroundColor: payment.color }]}>
            <Ionicons name={payment.icon as any} size={24} color="#FFF" />
          </View>
          <View style={styles.paymentContent}>
            <Text style={styles.paymentTitle}>{payment.title}</Text>
            <Text style={styles.paymentTimeText}>{timeText}</Text>
          </View>
        </View>
        <View style={styles.paymentRight}>
          <Text style={styles.paymentAmount}>${payment.amount.toFixed(2)}</Text>
          <Text style={styles.paymentFrequencyLabel}>{FREQUENCY_LABELS[payment.frequency]}</Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeletePayment(payment.id)}
        >
          <Ionicons name="trash" size={18} color={colors.error} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const totalMonthly = payments
    .filter(p => p.isActive && p.frequency === 'monthly')
    .reduce((sum, p) => sum + p.amount, 0);

  const activePymentsCount = payments.filter(p => p.isActive).length;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Summary Cards */}
        <View style={styles.summarySection}>
          <View style={[styles.summaryCard, { backgroundColor: `${colors.primary}20` }]}>
            <View style={styles.summaryLeft}>
              <Ionicons name="checkmark-circle" size={32} color={colors.primary} />
              <View style={styles.summaryContent}>
                <Text style={styles.summaryLabel}>Pagos activos</Text>
                <Text style={styles.summaryValue}>{activePymentsCount}</Text>
              </View>
            </View>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: `${colors.success || '#10B981'}20` }]}>
            <View style={styles.summaryLeft}>
              <Ionicons
                name="cash"
                size={32}
                color={colors.success || '#10B981'}
              />
              <View style={styles.summaryContent}>
                <Text style={styles.summaryLabel}>Gasto mensual</Text>
                <Text style={styles.summaryValue}>${totalMonthly.toFixed(2)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Info Message */}
        {payments.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.backgroundSecondary }]}>
            <Ionicons name="calendar" size={60} color={colors.textSecondary} />
            <Text style={styles.emptyStateTitle}>Sin pagos programados</Text>
            <Text style={styles.emptyStateText}>
              Crea pagos programados para automatizar tus transacciones recurrentes
            </Text>
          </View>
        ) : (
          <>
            {/* Payments List */}
            <View style={styles.paymentsSection}>
              <Text style={styles.sectionTitle}>Mis pagos programados</Text>
              <View style={styles.paymentsList}>
                {payments.map((payment) => renderPaymentItem(payment))}
              </View>
            </View>

            {/* Upcoming Payments Info */}
            <View style={[styles.infoCard, { backgroundColor: `${colors.warning}20` }]}>
              <Ionicons name="information-circle" size={24} color={colors.warning} />
              <View style={styles.infoContent}>
                <Text style={[styles.infoTitle, { color: colors.warning }]}>
                  Próximos pagos
                </Text>
                <Text style={styles.infoText}>
                  Los pagos programados se ejecutarán automáticamente en las fechas especificadas
                </Text>
              </View>
            </View>
          </>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Add Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={32} color="#FFF" />
      </TouchableOpacity>

      {/* Add Payment Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color={colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Nuevo pago programado</Text>
              <View style={{ width: 28 }} />
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Icon + Name + Amount */}
              <View style={[styles.paymentFormTopSection, { backgroundColor: `${newPayment.color}15` }]}>
                <View style={[styles.paymentFormIconPreview, { backgroundColor: newPayment.color }]}>
                  <Ionicons name={newPayment.icon as any} size={32} color="#FFF" />
                </View>
                <View style={styles.paymentFormFields}>
                  <Text style={styles.inputLabel}>Nombre</Text>
                  <TextInput
                    style={[styles.paymentFormInput, { color: colors.textPrimary, borderColor: colors.border }]}
                    placeholder="Ej: Servicios de internet"
                    placeholderTextColor={colors.textSecondary}
                    value={newPayment.title}
                    onChangeText={(text) => setNewPayment({ ...newPayment, title: text })}
                  />
                </View>
              </View>

              {/* Monto y Moneda */}
              <View style={styles.amountSection}>
                <View style={styles.amountField}>
                  <Text style={styles.inputLabel}>Monto</Text>
                  <TextInput
                    style={[styles.input, { color: colors.textPrimary, borderColor: colors.border }]}
                    placeholder="0.00"
                    placeholderTextColor={colors.textSecondary}
                    value={newPayment.amount}
                    onChangeText={(text) => setNewPayment({ ...newPayment, amount: text })}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={styles.currencyField}>
                  <Text style={styles.inputLabel}>Moneda</Text>
                  <TouchableOpacity 
                    activeOpacity={0.7}
                    style={[styles.currencySelector, { borderColor: colors.border }]}
                    onPress={() => setCurrencyPickerVisible(true)}
                  >
                    <Text style={{ color: colors.textPrimary }}>
                      {AVAILABLE_CURRENCIES.find(c => c.code === newPayment.currency)?.name || 'Seleccionar'}
                    </Text>
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Categoría */}
              <Text style={styles.inputLabel}>Categoría</Text>
              <TouchableOpacity 
                activeOpacity={0.7}
                style={[styles.categorySelector, { borderColor: colors.border }]}
                onPress={() => setCategoryPickerVisible(true)}
              >
                <Text style={{ color: colors.textPrimary }}>
                  {categories.find(c => c.id === newPayment.categoryId)?.name || 'Seleccionar'}
                </Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              {/* Renovación automática */}
              <View style={styles.toggleSection}>
                <View>
                  <Text style={[styles.inputLabel, { marginBottom: 0 }]}>Renovación automática</Text>
                </View>
                <TouchableOpacity 
                  onPress={() => setNewPayment({ ...newPayment, autoRenewal: !newPayment.autoRenewal })}
                  style={styles.toggleSwitch}
                >
                  <View style={[styles.toggleTrack, { backgroundColor: newPayment.autoRenewal ? colors.primary : colors.border }]}>
                    <View style={[styles.toggleThumb, { left: newPayment.autoRenewal ? 12 : 0 }]} />
                  </View>
                </TouchableOpacity>
              </View>

              {/* Duración */}
              <View style={styles.toggleSection}>
                <Text style={[styles.inputLabel, { marginBottom: 0 }]}>Duración</Text>
                <TouchableOpacity 
                  onPress={() => setNewPayment({ ...newPayment, hasEndDate: !newPayment.hasEndDate })}
                  style={styles.toggleSwitch}
                >
                  <View style={[styles.toggleTrack, { backgroundColor: newPayment.hasEndDate ? colors.primary : colors.border }]}>
                    <View style={[styles.toggleThumb, { left: newPayment.hasEndDate ? 12 : 0 }]} />
                  </View>
                </TouchableOpacity>
              </View>

              {/* Inicia */}
              <Text style={styles.inputLabel}>Inicia</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                style={[styles.dateButton, { borderColor: colors.border }]}
                onPress={() => setDatePickerVisible(true)}
              >
                <Text style={[styles.dateButtonText, { color: colors.textPrimary }]}>
                  {new Date(newPayment.nextDate).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </TouchableOpacity>

              {/* Ciclo */}
              <Text style={styles.inputLabel}>Ciclo</Text>
              <View style={styles.cycleSection}>
                <View style={styles.cycleButtons}>
                  {(['daily', 'weekly', 'biweekly', 'monthly', 'yearly'] as const).map((freq) => (
                    <TouchableOpacity
                      key={freq}
                      style={[
                        styles.cycleButton,
                        newPayment.frequency === freq && { backgroundColor: colors.primary },
                        newPayment.frequency !== freq && { backgroundColor: colors.backgroundSecondary, borderWidth: 1, borderColor: colors.border },
                      ]}
                      onPress={() => setNewPayment({ ...newPayment, frequency: freq })}
                    >
                      <Text style={[styles.cycleButtonText, newPayment.frequency === freq && { color: '#FFF' }, newPayment.frequency !== freq && { color: colors.textPrimary }]}>
                        {FREQUENCY_LABELS[freq]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={styles.cycleControls}>
                  <Text style={{ color: colors.textPrimary, marginRight: spacing.md }}>Mensual</Text>
                  <TouchableOpacity style={styles.cycleButton}>
                    <Ionicons name="remove" size={18} color={colors.textPrimary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cycleButton}>
                    <Ionicons name="add" size={18} color={colors.textPrimary} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Cuenta de pago */}
              <Text style={styles.inputLabel}>Cuenta de pago</Text>
              <TouchableOpacity 
                activeOpacity={0.7}
                style={[styles.accountSelector, { borderColor: colors.border }]}
                onPress={() => setAccountPickerVisible(true)}
              >
                <Text style={{ color: accounts.find(a => a.id === newPayment.accountId) ? colors.textPrimary : colors.textSecondary }}>
                  {accounts.find(a => a.id === newPayment.accountId)?.title || 'Ninguno'}
                </Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              {/* Recordatorio de pago */}
              <Text style={styles.inputLabel}>Recordatorio de pago</Text>
              <TouchableOpacity 
                activeOpacity={0.7}
                style={[styles.reminderSelector, { borderColor: colors.border }]}
                onPress={() => setReminderPickerVisible(true)}
              >
                <Text style={{ color: colors.textPrimary }}>
                  {REMINDER_OPTIONS.find(r => r.id === newPayment.reminder)?.label || 'Nunca'}
                </Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              {/* Icono */}
              <Text style={styles.inputLabel}>Icono *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconScrollContainer}>
                <View style={styles.iconGrid}>
                  {AVAILABLE_ICONS.map((iconName) => (
                    <TouchableOpacity
                      key={iconName}
                      style={[
                        styles.iconGridButton,
                        newPayment.icon === iconName && styles.iconGridButtonSelected,
                      ]}
                      onPress={() => setNewPayment({ ...newPayment, icon: iconName })}
                    >
                      <Ionicons
                        name={iconName as any}
                        size={28}
                        color={newPayment.icon === iconName ? '#FFF' : colors.textSecondary}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              {/* Color */}
              <Text style={styles.inputLabel}>Color *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorScrollContainer}>
                <View style={styles.colorGrid}>
                  {AVAILABLE_COLORS.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorGridButton,
                        { backgroundColor: color },
                        newPayment.color === color && styles.colorGridButtonSelected,
                      ]}
                      onPress={() => setNewPayment({ ...newPayment, color })}
                    >
                      {newPayment.color === color && (
                        <Ionicons name="checkmark" size={20} color="#fff" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: colors.border }]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={[styles.modalButtonText, { color: colors.textPrimary }]}>
                    Cancelar
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: colors.primary }]}
                  onPress={handleAddPayment}
                >
                  <Text style={[styles.modalButtonText, { color: '#FFF' }]}>
                    Guardar
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Date Picker Modal */}
      <Modal
        visible={datePickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDatePickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setDatePickerVisible(false)}>
                <Ionicons name="close" size={28} color={colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Seleccionar fecha</Text>
              <View style={{ width: 28 }} />
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.datePickerContainer}>
                {/* Day Input */}
                <View style={styles.dateInputGroup}>
                  <Text style={styles.dateLabel}>Día</Text>
                  <TextInput
                    style={[styles.dateInput, { color: colors.textPrimary, borderColor: colors.border }]}
                    placeholder="01"
                    placeholderTextColor={colors.textSecondary}
                    value={tempDate.day.toString().padStart(2, '0')}
                    onChangeText={(text) => {
                      const day = parseInt(text) || 1;
                      if (day >= 1 && day <= 31) {
                        setTempDate({ ...tempDate, day });
                      }
                    }}
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                </View>

                {/* Month Input */}
                <View style={styles.dateInputGroup}>
                  <Text style={styles.dateLabel}>Mes</Text>
                  <TextInput
                    style={[styles.dateInput, { color: colors.textPrimary, borderColor: colors.border }]}
                    placeholder="01"
                    placeholderTextColor={colors.textSecondary}
                    value={tempDate.month.toString().padStart(2, '0')}
                    onChangeText={(text) => {
                      const month = parseInt(text) || 1;
                      if (month >= 1 && month <= 12) {
                        setTempDate({ ...tempDate, month });
                      }
                    }}
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                </View>

                {/* Year Input */}
                <View style={styles.dateInputGroup}>
                  <Text style={styles.dateLabel}>Año</Text>
                  <TextInput
                    style={[styles.dateInput, { color: colors.textPrimary, borderColor: colors.border }]}
                    placeholder="2025"
                    placeholderTextColor={colors.textSecondary}
                    value={tempDate.year.toString()}
                    onChangeText={(text) => {
                      const year = parseInt(text) || new Date().getFullYear();
                      setTempDate({ ...tempDate, year });
                    }}
                    keyboardType="number-pad"
                    maxLength={4}
                  />
                </View>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: colors.border }]}
                  onPress={() => setDatePickerVisible(false)}
                >
                  <Text style={[styles.modalButtonText, { color: colors.textPrimary }]}>
                    Cancelar
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: colors.primary }]}
                  onPress={() => {
                    const date = new Date(tempDate.year, tempDate.month - 1, tempDate.day);
                    const formattedDate = date.toISOString().split('T')[0];
                    setNewPayment({
                      ...newPayment,
                      nextDate: formattedDate,
                    });
                    setDatePickerVisible(false);
                  }}
                >
                  <Text style={[styles.modalButtonText, { color: '#FFF' }]}>
                    Confirmar
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Category Picker Modal */}
      <Modal
        visible={categoryPickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCategoryPickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setCategoryPickerVisible(false)}>
                <Ionicons name="close" size={28} color={colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Seleccionar categoría</Text>
              <View style={{ width: 28 }} />
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {categories && categories.length > 0 ? (
                categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.pickerItemRow,
                      { borderColor: colors.border, backgroundColor: colors.backgroundSecondary },
                      newPayment.categoryId === category.id && { borderColor: colors.primary, borderWidth: 2 },
                    ]}
                    onPress={() => {
                      setNewPayment({ ...newPayment, categoryId: category.id });
                      setCategoryPickerVisible(false);
                    }}
                  >
                    <Ionicons name={category.icon as any} size={24} color={category.color} />
                    <Text style={[styles.pickerItemText, { color: colors.textPrimary }]}>{category.name}</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={{ paddingVertical: spacing.lg, alignItems: 'center' }}>
                  <Text style={{ color: colors.textSecondary }}>No hay categorías disponibles</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Currency Picker Modal */}
      <Modal
        visible={currencyPickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCurrencyPickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setCurrencyPickerVisible(false)}>
                <Ionicons name="close" size={28} color={colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Seleccionar moneda</Text>
              <View style={{ width: 28 }} />
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {AVAILABLE_CURRENCIES.map((currency) => (
                <TouchableOpacity
                  key={currency.code}
                  style={[
                    styles.pickerItemRow,
                    { borderColor: colors.border, backgroundColor: colors.backgroundSecondary },
                    newPayment.currency === currency.code && { borderColor: colors.primary, borderWidth: 2 },
                  ]}
                  onPress={() => {
                    setNewPayment({ ...newPayment, currency: currency.code });
                    setCurrencyPickerVisible(false);
                  }}
                >
                  <Text style={[styles.currencySymbol, { color: colors.primary }]}>{currency.symbol}</Text>
                  <Text style={[styles.pickerItemText, { color: colors.textPrimary }]}>{currency.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Account Picker Modal */}
      <Modal
        visible={accountPickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAccountPickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setAccountPickerVisible(false)}>
                <Ionicons name="close" size={28} color={colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Seleccionar cuenta</Text>
              <View style={{ width: 28 }} />
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <TouchableOpacity
                style={[
                  styles.pickerItemRow,
                  { borderColor: colors.border, backgroundColor: colors.backgroundSecondary },
                  !newPayment.accountId && { borderColor: colors.primary, borderWidth: 2 },
                ]}
                onPress={() => {
                  setNewPayment({ ...newPayment, accountId: '' });
                  setAccountPickerVisible(false);
                }}
              >
                <Ionicons name="close-circle" size={24} color={colors.textSecondary} />
                <Text style={[styles.pickerItemText, { color: colors.textPrimary }]}>Ninguno</Text>
              </TouchableOpacity>

              {accounts && accounts.length > 0 ? (
                accounts.map((account) => (
                  <TouchableOpacity
                    key={account.id}
                    style={[
                      styles.pickerItemRow,
                      { borderColor: colors.border, backgroundColor: colors.backgroundSecondary },
                      newPayment.accountId === account.id && { borderColor: colors.primary, borderWidth: 2 },
                    ]}
                    onPress={() => {
                      setNewPayment({ ...newPayment, accountId: account.id });
                      setAccountPickerVisible(false);
                    }}
                  >
                    <Ionicons name={account.icon as any} size={24} color={account.color} />
                    <Text style={[styles.pickerItemText, { color: colors.textPrimary }]}>{account.title}</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={{ paddingVertical: spacing.lg, alignItems: 'center' }}>
                  <Text style={{ color: colors.textSecondary }}>No hay cuentas disponibles</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Reminder Picker Modal */}
      <Modal
        visible={reminderPickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setReminderPickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setReminderPickerVisible(false)}>
                <Ionicons name="close" size={28} color={colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Seleccionar recordatorio</Text>
              <View style={{ width: 28 }} />
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {REMINDER_OPTIONS.map((reminder) => (
                <TouchableOpacity
                  key={reminder.id}
                  style={[
                    styles.pickerItemRow,
                    { borderColor: colors.border, backgroundColor: colors.backgroundSecondary },
                    newPayment.reminder === reminder.id && { borderColor: colors.primary, borderWidth: 2 },
                  ]}
                  onPress={() => {
                    setNewPayment({ ...newPayment, reminder: reminder.id });
                    setReminderPickerVisible(false);
                  }}
                >
                  <Ionicons name="notifications" size={24} color={colors.primary} />
                  <Text style={[styles.pickerItemText, { color: colors.textPrimary }]}>{reminder.label}</Text>
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
  scrollView: {
    flex: 1,
  },
  summarySection: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  summaryContent: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  summaryValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginHorizontal: spacing.md,
    marginVertical: spacing.lg,
    borderRadius: 12,
  },
  emptyStateTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyStateText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  paymentsSection: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  paymentsList: {
    gap: spacing.md,
  },
  paymentCard: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inactivePayment: {
    opacity: 0.6,
  },
  paymentLeft: {
    flexDirection: 'row',
    flex: 1,
    gap: spacing.md,
  },
  paymentIcon: {
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentContent: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  paymentDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  paymentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  paymentFrequency: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  paymentFrequencyLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  paymentTimeText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  paymentDot: {
    color: colors.textSecondary,
  },
  paymentDate: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  paymentRight: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  paymentAmount: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  toggleButton: {
    padding: spacing.sm,
  },
  deleteButton: {
    padding: spacing.sm,
  },
  infoCard: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: 12,
    gap: spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.xs,
  },
  infoText: {
    fontSize: typography.sizes.sm,
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
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  modalBody: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.sizes.base,
    marginBottom: spacing.lg,
    backgroundColor: colors.background,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  iconScrollContainer: {
    marginBottom: spacing.lg,
  },
  iconGrid: {
    flexDirection: 'row',
    paddingRight: spacing.md,
    gap: spacing.md,
  },
  iconGridButton: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 2,
    borderColor: colors.border,
  },
  iconGridButtonSelected: {
    borderColor: colors.primary,
    borderWidth: 3,
  },
  colorScrollContainer: {
    marginBottom: spacing.lg,
  },
  colorGrid: {
    flexDirection: 'row',
    paddingRight: spacing.md,
    gap: spacing.md,
  },
  colorGridButton: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorGridButtonSelected: {
    borderColor: '#FFF',
    borderWidth: 3,
  },
  frequencyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  frequencyButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    flexBasis: '30%',
    alignItems: 'center',
  },
  frequencyButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.md,
    backgroundColor: 'rgba(0,0,0,0)',
  },
  dateButtonText: {
    flex: 1,
    fontSize: typography.sizes.base,
  },
  iconPreviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.background,
  },
  iconPreview: {
    width: 48,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconPreviewText: {
    flex: 1,
    fontSize: typography.sizes.base,
  },
  colorPreviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.background,
  },
  colorPreview: {
    width: 48,
    height: 48,
    borderRadius: 10,
  },
  colorPreviewText: {
    flex: 1,
    fontSize: typography.sizes.base,
  },
  pickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  pickerItem: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  pickerItemSelected: {
    borderWidth: 3,
  },
  datePickerContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  dateInputGroup: {
    flex: 1,
  },
  dateLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  dateInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
    backgroundColor: colors.background,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
  },
  bottomSpacing: {
    height: spacing.xl,
  },
  // Payment Form Styles
  paymentFormTopSection: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  paymentFormIconPreview: {
    width: 70,
    height: 70,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentFormFields: {
    flex: 1,
  },
  paymentFormInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.sizes.base,
    backgroundColor: 'transparent',
  },
  amountSection: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  amountField: {
    flex: 1,
  },
  currencyField: {
    flex: 1,
  },
  currencySelector: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0)',
  },
  categorySelector: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    backgroundColor: 'rgba(0,0,0,0)',
  },
  tagsSelector: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  toggleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  toggleSwitch: {
    width: 50,
    height: 28,
  },
  toggleTrack: {
    flex: 1,
    height: 28,
    borderRadius: 14,
    position: 'relative',
  },
  toggleThumb: {
    position: 'absolute',
    top: 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFF',
  },
  cycleSection: {
    marginBottom: spacing.lg,
  },
  cycleButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
    flexWrap: 'wrap',
  },
  cycleButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    minWidth: 70,
    alignItems: 'center',
  },
  cycleButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  cycleControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  accountSelector: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    backgroundColor: 'rgba(0,0,0,0)',
  },
  reminderSelector: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    backgroundColor: 'rgba(0,0,0,0)',
  },
  historySelector: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  pickerItemRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
    gap: spacing.md,
  },
  pickerItemText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
  },
  currencySymbol: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
});
