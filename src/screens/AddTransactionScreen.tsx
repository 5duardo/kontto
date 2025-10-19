import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { spacing, typography, borderRadius, useTheme } from '../theme';
import { Card, Button, Input } from '../components/common';
import { TransactionType } from '../types';
import DateTimePicker from '@react-native-community/datetimepicker';

export const AddTransactionScreen = ({ navigation, route }: any) => {
  const { colors } = useTheme();
  const { type: initialType, accountId: initialAccountId } = route.params || {};
  const { addTransaction, categories, accounts } = useAppStore();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors, borderRadius), [colors]);

  const [type, setType] = useState<TransactionType>(initialType || 'expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState(initialAccountId || '');
  
  // Store the full Date object with time
  const [transactionDate, setTransactionDate] = useState<Date>(new Date());
  
  // Format date using local timezone to avoid UTC offset issues (toISOString can shift date)
  const formatDateLocal = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`; // internal storage YYYY-MM-DD
  };

  // User-facing display format: DD/MM/YYYY
  const formatDateDisplay = (d: Date) => {
    const day = String(d.getDate()).padStart(2, '0');
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const y = d.getFullYear();
    return `${day}/${m}/${y}`;
  };

  const [displayDate, setDisplayDate] = useState(formatDateDisplay(new Date()));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);

  const filteredCategories = useMemo(() => {
    return categories.filter((c) => c.type === type);
  }, [categories, type]);

  const selectedCategory = useMemo(() => {
    return categories.find((c) => c.id === selectedCategoryId);
  }, [categories, selectedCategoryId]);

  const selectedAccount = useMemo(() => {
    return accounts.find((a) => a.id === selectedAccountId);
  }, [accounts, selectedAccountId]);

  const handleSubmit = () => {
    if (!amount || !selectedCategoryId || !selectedAccountId) {
      alert('Por favor completa todos los campos (monto, categoría y cuenta)');
      return;
    }

    addTransaction({
      type,
      amount: parseFloat(amount),
      categoryId: selectedCategoryId,
      accountId: selectedAccountId,
      description: description || selectedCategory?.name || '',
      date: transactionDate.toISOString(), // Guardar fecha y hora completa en formato ISO
    });

    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Type Selector */}
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
          <Text style={styles.currency}>L</Text>
          <TextInput
            style={styles.amountInput}
            placeholder="0.00"
            placeholderTextColor={colors.textTertiary}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />
        </View>

        {/* Category Selection */}
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

        {/* Account Selector */}
        <Text style={styles.label}>Cuenta (Requerida)</Text>
        <TouchableOpacity
          style={styles.categorySelector}
          onPress={() => setShowAccountModal(true)}
        >
          {selectedAccount ? (
            <View style={styles.selectedCategory}>
              <View
                style={[
                  styles.categoryIconContainer,
                  { backgroundColor: `${selectedAccount.color}20` },
                ]}
              >
                <Ionicons
                  name={selectedAccount.icon as any}
                  size={24}
                  color={selectedAccount.color}
                />
              </View>
              <Text style={styles.categoryName}>{selectedAccount.title}</Text>
            </View>
          ) : (
            <View style={styles.selectedCategory}>
              <View style={styles.categoryIconContainer}>
                <Ionicons name="wallet" size={24} color={colors.textSecondary} />
              </View>
              <Text style={styles.categoryPlaceholder}>Seleccionar cuenta</Text>
            </View>
          )}
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* Description Input */}
        <Input
          label="Descripción (opcional)"
          placeholder="Ej: Compra de supermercado"
          value={description}
          onChangeText={setDescription}
          containerStyle={styles.input}
        />

        {/* Date Input */}
        <TouchableOpacity
          style={[styles.categorySelector, styles.dateSelector]}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.categoryName}>{displayDate}</Text>
          <Ionicons name="calendar" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={transactionDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event: any, selectedDate?: Date) => {
              // selectedDate can be undefined if user cancels on Android
              if (selectedDate) {
                // Mantener la hora actual del dispositivo, solo cambiar la fecha
                const currentTime = new Date();
                const updatedDate = new Date(
                  selectedDate.getFullYear(),
                  selectedDate.getMonth(),
                  selectedDate.getDate(),
                  currentTime.getHours(),
                  currentTime.getMinutes(),
                  currentTime.getSeconds(),
                  currentTime.getMilliseconds()
                );
                
                // On Android the picker closes after selection; on iOS keep it open if needed
                setShowDatePicker(Platform.OS === 'ios');
                setTransactionDate(updatedDate);
                setDisplayDate(formatDateDisplay(selectedDate));
              } else {
                // user dismissed/cancelled on Android
                setShowDatePicker(false);
              }
            }}
            maximumDate={new Date(2100, 12, 31)}
          />
        )}
        {/* Submit Button (moved inside content so it's not sticky) */}
        <View style={styles.contentButtonContainer}>
          <Button
            title="Guardar Transacción"
            onPress={handleSubmit}
            fullWidth
            variant="solidPrimary"
          />
        </View>
      </ScrollView>

      {/* Category Modal */}
      <Modal
        visible={showCategoryModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Categoría</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Ionicons name="close" size={28} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.categoriesList}>
              {filteredCategories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryItem,
                    selectedCategoryId === category.id && styles.categoryItemActive,
                  ]}
                  onPress={() => {
                    setSelectedCategoryId(category.id);
                    setShowCategoryModal(false);
                  }}
                >
                  <View
                    style={[
                      styles.categoryIconContainer,
                      { backgroundColor: `${category.color}20` },
                    ]}
                  >
                    <Ionicons
                      name={category.icon as any}
                      size={24}
                      color={category.color}
                    />
                  </View>
                  <Text style={styles.categoryItemText}>{category.name}</Text>
                  {selectedCategoryId === category.id && (
                    <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Account Modal (match Category Modal UI) */}
      <Modal
        visible={showAccountModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAccountModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Cuenta</Text>
              <TouchableOpacity onPress={() => setShowAccountModal(false)}>
                <Ionicons name="close" size={28} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.categoriesList}>
              {accounts.map((account) => (
                <TouchableOpacity
                  key={account.id}
                  style={[
                    styles.categoryItem,
                    selectedAccountId === account.id && styles.categoryItemActive,
                  ]}
                  onPress={() => {
                    setSelectedAccountId(account.id);
                    setShowAccountModal(false);
                  }}
                >
                  <View
                    style={[
                      styles.categoryIconContainer,
                      { backgroundColor: `${account.color}20` },
                    ]}
                  >
                    <Ionicons
                      name={account.icon as any}
                      size={24}
                      color={account.color}
                    />
                  </View>
                  <Text style={styles.categoryItemText}>{account.title}</Text>
                  {selectedAccountId === account.id && (
                    <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
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
  content: {
    flex: 1,
    padding: spacing.lg,
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
    borderRadius: br.md,
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
  amountInput: {
    fontSize: typography.sizes['5xl'],
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    minWidth: 150,
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
  categorySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: br.md,
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
    borderRadius: br.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundTertiary,
  },
  categoryName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  categoryPlaceholder: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
  },
  input: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.backgroundSecondary,
  },
  contentButtonContainer: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  dateSelector: {
    justifyContent: 'space-between',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.backgroundSecondary,
    borderTopLeftRadius: br.xl,
    borderTopRightRadius: br.xl,
    maxHeight: '80%',
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
  categoriesList: {
    padding: spacing.md,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: br.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryItemActive: {
    borderColor: colors.primary,
  },
  categoryItemText: {
    flex: 1,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
});
