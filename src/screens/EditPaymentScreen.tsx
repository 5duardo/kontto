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
    updateRecurringPayment,
    deleteRecurringPayment,
    preferredCurrency,
  } = useAppStore();

  // Form states
  const [type, setType] = useState<'income' | 'expense'>(payment?.type || 'expense');
  const [title, setTitle] = useState(payment?.title || '');
  const [amount, setAmount] = useState(payment?.amount?.toString() || '');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly'>(
    payment?.frequency || 'monthly'
  );
  const [nextDate, setNextDate] = useState<Date>(new Date(payment?.nextDate || new Date()));
  const [displayDate, setDisplayDate] = useState(
    new Date(payment?.nextDate || new Date()).toLocaleDateString('es-HN')
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isActive, setIsActive] = useState(payment?.isActive ?? true);
  const [currency, setCurrency] = useState(payment?.currency || preferredCurrency);
  const [paid, setPaid] = useState(payment?.paid ?? false);
  const [selectedIcon, setSelectedIcon] = useState(payment?.icon || 'wallet');
  const [selectedColor, setSelectedColor] = useState(payment?.color || '#3B82F6');
  const [showIconColorModal, setShowIconColorModal] = useState(false);

  const handleSave = () => {
    if (!amount || !title) {
      Alert.alert('Error', 'Por favor completa los campos requeridos (monto y título)');
      return;
    }

    updateRecurringPayment(payment.id, {
      type,
      amount: parseFloat(amount),
      title,
      frequency,
      nextDate: nextDate.toISOString(),
      isActive,
      currency,
      paid,
      icon: selectedIcon,
      color: selectedColor,
    });

    navigation.goBack();
  };

  const handleFrequencyChange = () => {
    const frequencies = ['daily', 'weekly', 'biweekly', 'monthly', 'yearly'] as const;
    const currentIndex = frequencies.indexOf(frequency);
    const nextIndex = (currentIndex + 1) % frequencies.length;
    setFrequency(frequencies[nextIndex]);
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

        {/* Title Input */}
        <Text style={styles.label}>Título (Requerido)</Text>
        <TextInput
          style={styles.input}
          placeholder="Netflix, Spotify, Renta, etc."
          placeholderTextColor={colors.textTertiary}
          value={title}
          onChangeText={setTitle}
        />

        {/* Currency Selector */}
        <Text style={styles.label}>Moneda</Text>
        <CurrencySelector
          selectedCurrency={currency}
          onCurrencyChange={setCurrency}
          label="Seleccionar moneda"
        />

        {/* Amount Input */}
        <Text style={styles.label}>Monto (Requerido)</Text>
        <TextInput
          style={styles.input}
          placeholder="0.00"
          placeholderTextColor={colors.textTertiary}
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
        />

        {/* Frequency Selection */}
        <Text style={styles.label}>Frecuencia</Text>
        <TouchableOpacity
          style={styles.frequencyButton}
          onPress={handleFrequencyChange}
        >
          <Text style={styles.frequencyButtonText}>
            {frequencyLabels[frequency]}
          </Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

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

        {/* Icon and Color Selection */}
        <Text style={styles.label}>Ícono y Color</Text>
        <TouchableOpacity
          style={styles.categorySelector}
          onPress={() => setShowIconColorModal(true)}
        >
          <View style={styles.selectedCategory}>
            <View
              style={[
                styles.categoryIconContainer,
                { backgroundColor: `${selectedColor}20` },
              ]}
            >
              <Ionicons
                name={selectedIcon as any}
                size={24}
                color={selectedColor}
              />
            </View>
            <Text style={styles.categoryName}>
              {selectedIcon} - {selectedColor}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* Active State Toggle */}
        <View style={styles.toggleSection}>
          <Text style={styles.label}>Estado</Text>
          <View style={styles.stateButtonGroup}>
            <TouchableOpacity
              style={[
                styles.stateButton,
                isActive && { backgroundColor: colors.success },
              ]}
              onPress={() => setIsActive(true)}
            >
              <Text
                style={[
                  styles.stateButtonText,
                  isActive && { color: '#fff', fontWeight: 'bold' },
                ]}
              >
                Activo
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.stateButton,
                !isActive && { backgroundColor: colors.textTertiary },
              ]}
              onPress={() => setIsActive(false)}
            >
              <Text
                style={[
                  styles.stateButtonText,
                  !isActive && { color: '#fff', fontWeight: 'bold' },
                ]}
              >
                Inactivo
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Paid State Toggle */}
        <View style={styles.toggleSection}>
          <Text style={styles.label}>Pagado</Text>
          <View style={styles.stateButtonGroup}>
            <TouchableOpacity
              style={[
                styles.stateButton,
                paid && { backgroundColor: colors.primary },
              ]}
              onPress={() => setPaid(true)}
            >
              <Text
                style={[
                  styles.stateButtonText,
                  paid && { color: '#fff', fontWeight: 'bold' },
                ]}
              >
                Sí
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.stateButton,
                !paid && { backgroundColor: colors.textTertiary },
              ]}
              onPress={() => setPaid(false)}
            >
              <Text
                style={[
                  styles.stateButtonText,
                  !paid && { color: '#fff', fontWeight: 'bold' },
                ]}
              >
                No
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer actions */}
        <View style={styles.modalFooter}>
          <TouchableOpacity
            style={[styles.button, styles.saveButton, { flex: 1 }]}
            onPress={handleSave}
          >
            <Ionicons name="checkmark" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.deleteButton, { flex: 1 }]}
            onPress={handleDelete}
          >
            <Ionicons name="trash" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton, { flex: 1 }]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Icon and Color Modal */}
      {showIconColorModal && (
        <TouchableOpacity
          activeOpacity={1}
          style={styles.categoryModalOverlay}
          onPress={() => setShowIconColorModal(false)}
        >
          <View style={styles.categoryModal}>
            <View style={styles.categoryModalHeader}>
              <Text style={styles.categoryModalTitle}>Ícono y Color</Text>
              <TouchableOpacity onPress={() => setShowIconColorModal(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.categoryModalContent} showsVerticalScrollIndicator={false}>
              {/* Color Selection */}
              <Text style={styles.colorSectionTitle}>Color</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.horizontalScroll}
                contentContainerStyle={styles.horizontalContent}
              >
                {['#3B82F6', '#8B5CF6', '#EC4899', '#EF4444', '#F59E0B', '#10B981', '#06B6D4', '#6B7280'].map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      selectedColor === color && { borderWidth: 3, borderColor: '#fff' },
                    ]}
                    onPress={() => setSelectedColor(color)}
                  />
                ))}
              </ScrollView>

              {/* Icon Selection */}
              <Text style={styles.colorSectionTitle}>Ícono</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.horizontalScroll}
                contentContainerStyle={styles.horizontalContent}
              >
                {['wallet', 'cash', 'card', 'briefcase', 'home', 'car', 'restaurant', 'heart', 'book', 'bag', 'airplane', 'gift', 'star', 'checkmark', 'alert', 'help', 'pizza', 'beer', 'musical-notes', 'game-controller', 'barbell', 'leaf', 'flame', 'water', 'cloud', 'sunny', 'moon', 'earth', 'call', 'camera', 'tv', 'headset'].map((icon) => (
                  <TouchableOpacity
                    key={icon}
                    style={[
                      styles.iconOption,
                      { backgroundColor: selectedIcon === icon ? selectedColor + '20' : colors.backgroundSecondary },
                      selectedIcon === icon && { borderColor: selectedColor, borderWidth: 2 },
                    ]}
                    onPress={() => setSelectedIcon(icon)}
                  >
                    <Ionicons name={icon as any} size={28} color={selectedIcon === icon ? selectedColor : colors.textSecondary} />
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.previewSection}>
                <Text style={styles.colorSectionTitle}>Vista previa</Text>
                <View style={styles.previewContainer}>
                  <View
                    style={[
                      styles.previewIcon,
                      { backgroundColor: `${selectedColor}20` },
                    ]}
                  >
                    <Ionicons name={selectedIcon as any} size={40} color={selectedColor} />
                  </View>
                  <Text style={styles.previewText}>Tu pago programado</Text>
                </View>
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
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.backgroundSecondary,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      borderRadius: br.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    frequencyButtonText: {
      fontSize: typography.sizes.base,
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
    stateButtonGroup: {
      flexDirection: 'row',
      gap: spacing.md,
      marginTop: spacing.sm,
    },
    stateButton: {
      flex: 1,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      borderRadius: br.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.backgroundSecondary,
      borderWidth: 1,
      borderColor: colors.border,
    },
    stateButtonText: {
      fontSize: typography.sizes.base,
      fontWeight: typography.weights.semibold as any,
      color: colors.textSecondary,
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
      flexDirection: 'row',
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
    colorSectionTitle: {
      fontSize: typography.sizes.base,
      fontWeight: typography.weights.semibold as any,
      color: colors.textPrimary,
      marginVertical: spacing.md,
      textAlign: 'center',
    },
    horizontalScroll: {
      marginBottom: spacing.lg,
    },
    horizontalContent: {
      paddingHorizontal: spacing.md,
      gap: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
    },
    colorGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'center',
      gap: spacing.lg,
      paddingHorizontal: spacing.md,
      marginBottom: spacing.lg,
    },
    colorOption: {
      width: 56,
      height: 56,
      borderRadius: br.md,
      borderWidth: 3,
      borderColor: 'transparent',
    },
    iconGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'center',
      gap: spacing.md,
      paddingHorizontal: spacing.md,
      marginBottom: spacing.lg,
    },
    iconOption: {
      width: 60,
      height: 60,
      borderRadius: br.md,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.border,
    },
    previewSection: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.lg,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    previewContainer: {
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.lg,
    },
    previewIcon: {
      width: 80,
      height: 80,
      borderRadius: br.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    previewText: {
      fontSize: typography.sizes.base,
      color: colors.textSecondary,
    },
  });

