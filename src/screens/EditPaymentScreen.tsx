import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { spacing, typography, borderRadius, useTheme } from '../theme';
import { Card, Button, CategoryIcon } from '../components/common';
import { CurrencySelector } from '../components/CurrencySelector';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useExchangeRates } from '../hooks/useExchangeRates';

const frequencyLabels: Record<string, string> = {
  daily: 'Diario',
  weekly: 'Semanal',
  biweekly: 'Quincenalmente',
  monthly: 'Mensual',
  yearly: 'Anual',
};

const br = borderRadius;

export const EditPaymentScreen = ({ navigation, route }: any) => {
  const { payment } = route.params || {};
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors, br, insets), [colors, insets]);
  
  const {
    categories,
    updateRecurringPayment,
    deleteRecurringPayment,
    preferredCurrency,
  } = useAppStore();

  // Form states
  const [type, setType] = useState<'income' | 'expense'>(payment?.type || 'expense');
  const [amount, setAmount] = useState(payment?.amount?.toString() || '');
  const [description, setDescription] = useState(payment?.description || '');
  const [selectedCategoryId, setSelectedCategoryId] = useState(payment?.categoryId || '');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly'>(
    payment?.frequency || 'monthly'
  );
  const [nextDate, setNextDate] = useState<Date>(new Date(payment?.nextDate || new Date()));
  const [displayDate, setDisplayDate] = useState(
    new Date(payment?.nextDate || new Date()).toLocaleDateString('es-HN')
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(payment?.reminderEnabled ?? true);
  const [reminderDaysBefore, setReminderDaysBefore] = useState(
    payment?.reminderDaysBefore?.toString() || '0'
  );
  const [isActive, setIsActive] = useState(payment?.isActive ?? true);
  const [currency, setCurrency] = useState(payment?.currency || preferredCurrency);
  const [paid, setPaid] = useState(payment?.paid ?? false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const filteredCategories = categories.filter((c) => c.type === type);
  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  const handleSave = () => {
    if (!amount || !selectedCategoryId) {
      Alert.alert('Error', 'Por favor completa los campos requeridos (monto y categoría)');
      return;
    }

    updateRecurringPayment(payment.id, {
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

    navigation.goBack();
  };

  const handleDelete = () => {
    Alert.alert(
      'Eliminar Pago',
      '¿Estás seguro de que deseas eliminar este pago programado?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            deleteRecurringPayment(payment.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  useEffect(() => {
    navigation.setOptions({
      title: 'Editar Pago Programado',
    });
  }, [navigation]);

  return (
    <View style={[styles.container, {
      paddingBottom: insets.bottom,
      paddingLeft: insets.left,
      paddingRight: insets.right,
    }]}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: spacing.lg }}
        showsVerticalScrollIndicator={false}
      >
        {/* Type Selector Card */}
        <Card style={styles.typeCard}>
          <View style={styles.typeButtons}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                type === 'income' && styles.typeButtonActiveIncome,
              ]}
              onPress={() => {
                setType('income');
                setSelectedCategoryId('');
              }}
            >
              <Ionicons
                name="arrow-down-circle"
                size={24}
                color={type === 'income' ? '#fff' : colors.income}
              />
              <Text
                style={[
                  styles.typeButtonText,
                  type === 'income' && styles.typeButtonTextActive,
                ]}
              >
                Ingreso
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeButton,
                type === 'expense' && styles.typeButtonActiveExpense,
              ]}
              onPress={() => {
                setType('expense');
                setSelectedCategoryId('');
              }}
            >
              <Ionicons
                name="arrow-up-circle"
                size={24}
                color={type === 'expense' ? '#fff' : colors.expense}
              />
              <Text
                style={[
                  styles.typeButtonText,
                  type === 'expense' && styles.typeButtonTextActive,
                ]}
              >
                Gasto
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Amount Input */}
        <View style={styles.amountContainer}>
          <Text style={styles.currency}>{currency}</Text>
          <TextInput
            style={styles.amountInput}
            placeholder="0.00"
            placeholderTextColor={colors.textTertiary}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />
        </View>

        {/* Currency Selector */}
        <Text style={styles.label}>Moneda</Text>
        <CurrencySelector
          selectedCurrency={currency}
          onCurrencyChange={setCurrency}
          label="Seleccionar moneda"
        />

        {/* Category Selection */}
        <Text style={styles.label}>Categoría (Requerida)</Text>
        <TouchableOpacity
          style={styles.categorySelector}
          onPress={() => setShowCategoryModal(true)}
        >
          {selectedCategory ? (
            <View style={styles.selectedCategory}>
              <View
                style={[
                  styles.categoryIconContainer,
                  { backgroundColor: `${selectedCategory.color}20` },
                ]}
              >
                <Ionicons
                  name={selectedCategory.icon as any}
                  size={24}
                  color={selectedCategory.color}
                />
              </View>
              <Text style={styles.categoryName}>{selectedCategory.name}</Text>
            </View>
          ) : (
            <View style={styles.selectedCategory}>
              <View style={styles.categoryIconContainer}>
                <Ionicons name="apps" size={24} color={colors.textSecondary} />
              </View>
              <Text style={styles.categoryPlaceholder}>Seleccionar categoría</Text>
            </View>
          )}
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* Description Input */}
        <Text style={styles.label}>Descripción (Opcional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Netflix, Spotify, etc."
          placeholderTextColor={colors.textTertiary}
          value={description}
          onChangeText={setDescription}
        />

        {/* Frequency Selection */}
        <Text style={styles.label}>Frecuencia</Text>
        <View style={styles.frequencyGrid}>
          {(['daily', 'weekly', 'biweekly', 'monthly', 'yearly'] as const).map((f) => (
            <TouchableOpacity
              key={f}
              style={[
                styles.frequencyButton,
                frequency === f && { backgroundColor: colors.primary, borderColor: colors.primary },
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

        {/* Date Selection */}
        <Text style={styles.label}>Próximo Pago</Text>
        <TouchableOpacity
          style={[styles.categorySelector, styles.dateSelector]}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.categoryName}>{displayDate}</Text>
          <Ionicons name="calendar" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

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

        {/* Reminder Toggle */}
        <View style={styles.toggleSection}>
          <View style={styles.toggleHeader}>
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

        {/* Active State Toggle */}
        <View style={styles.toggleSection}>
          <View style={styles.toggleHeader}>
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

        {/* Paid State Toggle */}
        <View style={styles.toggleSection}>
          <View style={styles.toggleHeader}>
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

        {/* Footer actions */}
        <View style={styles.modalFooter}>
          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Actualizar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.deleteButton]}
            onPress={handleDelete}
          >
            <Text style={styles.deleteButtonText}>Eliminar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Category Modal */}
      {showCategoryModal && (
        <TouchableOpacity
          activeOpacity={1}
          style={styles.categoryModalOverlay}
          onPress={() => setShowCategoryModal(false)}
        >
          <View style={styles.categoryModal}>
            <View style={styles.categoryModalHeader}>
              <Text style={styles.categoryModalTitle}>Categoría</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.categoryModalContent} showsVerticalScrollIndicator={false}>
              <View style={styles.categoryGrid}>
                {filteredCategories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryGridItem,
                      selectedCategoryId === category.id && {
                        backgroundColor: category.color + '20',
                        borderColor: category.color,
                        borderWidth: 2,
                      },
                    ]}
                    onPress={() => {
                      setSelectedCategoryId(category.id);
                      setShowCategoryModal(false);
                    }}
                  >
                    <CategoryIcon icon={category.icon} color={category.color} size={32} />
                    <Text style={styles.categoryGridItemName}>{category.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const createStyles = (colors: any, br: any, insets: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
    },
    typeCard: {
      marginBottom: spacing.lg,
      padding: spacing.md,
    },
    typeButtons: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    typeButton: {
      flex: 1,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.sm,
      borderRadius: br.md,
      alignItems: 'center',
      gap: spacing.xs,
      backgroundColor: colors.backgroundSecondary,
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
      fontWeight: typography.weights.semibold as any,
      color: colors.textSecondary,
    },
    typeButtonTextActive: {
      color: '#fff',
    },
    amountContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.lg,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      backgroundColor: colors.backgroundSecondary,
      borderRadius: br.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    currency: {
      fontSize: typography.sizes.xl,
      fontWeight: typography.weights.bold as any,
      color: colors.primary,
      marginRight: spacing.sm,
      minWidth: 40,
    },
    amountInput: {
      flex: 1,
      fontSize: typography.sizes.xl,
      fontWeight: typography.weights.bold as any,
      color: colors.textPrimary,
    },
    label: {
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.semibold as any,
      color: colors.textSecondary,
      marginBottom: spacing.sm,
      marginTop: spacing.md,
    },
    categorySelector: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      backgroundColor: colors.backgroundSecondary,
      borderRadius: br.md,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: spacing.md,
    },
    selectedCategory: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      flex: 1,
    },
    categoryIconContainer: {
      width: 44,
      height: 44,
      borderRadius: br.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.backgroundSecondary,
    },
    categoryName: {
      fontSize: typography.sizes.base,
      fontWeight: typography.weights.semibold as any,
      color: colors.textPrimary,
    },
    categoryPlaceholder: {
      fontSize: typography.sizes.base,
      color: colors.textTertiary,
    },
    input: {
      backgroundColor: colors.backgroundSecondary,
      borderRadius: br.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      fontSize: typography.sizes.base,
      color: colors.textPrimary,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: spacing.md,
    },
    frequencyGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    frequencyButton: {
      flex: 1,
      minWidth: '30%',
      backgroundColor: colors.backgroundSecondary,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.sm,
      borderRadius: br.md,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    frequencyButtonText: {
      fontSize: typography.sizes.xs,
      fontWeight: typography.weights.semibold as any,
      color: colors.textPrimary,
    },
    dateSelector: {
      marginBottom: spacing.md,
    },
    toggleSection: {
      marginBottom: spacing.md,
    },
    toggleHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
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
      marginTop: spacing.xs,
    },
    modalFooter: {
      gap: spacing.sm,
      marginTop: spacing.lg,
      paddingBottom: spacing.xl,
    },
    button: {
      paddingVertical: spacing.md,
      borderRadius: br.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    saveButton: {
      backgroundColor: colors.primary,
    },
    saveButtonText: {
      fontSize: typography.sizes.base,
      fontWeight: typography.weights.bold as any,
      color: '#fff',
    },
    deleteButton: {
      backgroundColor: colors.error,
    },
    deleteButtonText: {
      fontSize: typography.sizes.base,
      fontWeight: typography.weights.bold as any,
      color: '#fff',
    },
    cancelButton: {
      backgroundColor: colors.backgroundSecondary,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cancelButtonText: {
      fontSize: typography.sizes.base,
      fontWeight: typography.weights.bold as any,
      color: colors.textPrimary,
    },
    categoryModalOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    categoryModal: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: br.lg,
      borderTopRightRadius: br.lg,
      maxHeight: '80%',
      paddingBottom: insets.bottom,
    },
    categoryModalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    categoryModalTitle: {
      fontSize: typography.sizes.lg,
      fontWeight: typography.weights.bold as any,
      color: colors.textPrimary,
    },
    categoryModalContent: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
    },
    categoryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    categoryGridItem: {
      width: '31%',
      backgroundColor: colors.backgroundSecondary,
      borderRadius: br.md,
      padding: spacing.md,
      alignItems: 'center',
      gap: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    categoryGridItemName: {
      fontSize: typography.sizes.xs,
      fontWeight: typography.weights.semibold as any,
      color: colors.textPrimary,
      textAlign: 'center',
    },
  });
