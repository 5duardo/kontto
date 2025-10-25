import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography, useTheme } from '../theme';
import { useAppStore } from '../store/useAppStore';
import { AccountType } from '../types';
import { CurrencySelector } from '../components/CurrencySelector';

const ACCOUNT_TYPES = [
  { id: 'normal' as AccountType, name: 'Normal', icon: 'wallet' },
  { id: 'savings' as AccountType, name: 'Ahorros', icon: 'star' },
  { id: 'credit' as AccountType, name: 'Crédito', icon: 'card' },
];

const ACCOUNT_ICONS = [
  'wallet',
  'card',
  'cash',
  'briefcase',
  'home',
  'car',
  'trending-up',
  'gift',
  'star',
  'heart',
  'airplane',
  'bicycle',
];

const ICON_COLORS = [
  '#3B82F6', // Azul
  '#10B981', // Verde
  '#F59E0B', // Naranja
  '#EF4444', // Rojo
  '#8B5CF6', // Púrpura
  '#EC4899', // Rosa
  '#06B6D4', // Cyan
  '#6366F1', // Indigo
  '#FFFFFF', // Blanco
  '#F3F4F6', // Gris claro
  '#9CA3AF', // Gris medio
  '#4B5563', // Gris oscuro
  '#000000', // Negro
  '#F97316', // Ámbar
  '#84CC16', // Lima
  '#14B8A6', // Teal
];

export const AddAccountScreen = ({ navigation, route }: any) => {
  const { addAccount, addTransaction, categories, addCategory } = useAppStore();
  const { colors } = useTheme();
  const params = route?.params || {};

  const [title, setTitle] = useState('');
  const [icon, setIcon] = useState(params.accountType === 'savings' ? 'star' : 'wallet');
  const [iconColor, setIconColor] = useState('#3B82F6');
  const [description, setDescription] = useState('');
  const [accountType, setAccountType] = useState<AccountType>(params.accountType || 'normal');
  const [currency, setCurrency] = useState('HNL');
  const [balance, setBalance] = useState('0');
  const [creditLimit, setCreditLimit] = useState('0');
  const [includeInTotal, setIncludeInTotal] = useState(true);

  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleCreate = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Por favor ingresa un título para la cuenta');
      return;
    }

    const numBalance = parseFloat(balance) || 0;
    const numCreditLimit = accountType === 'credit' ? parseFloat(creditLimit) || 0 : undefined;

    // Usar generateId del store o crear uno manualmente
    const accountId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    addAccount({
      title: title.trim(),
      icon,
      color: iconColor,
      description: description.trim() || undefined,
      type: accountType,
      currency,
      balance: numBalance,
      creditLimit: numCreditLimit,
      includeInTotal,
      isArchived: false,
    });

    // Si hay balance inicial mayor a 0, crear transacción de ingreso (sin accountId para no duplicar)
    if (numBalance > 0) {
      let otrosIngresosCategory = categories.find((c: any) => c.name === 'Otros Ingresos' && c.type === 'income');

      // Si la categoría no existe, crearla
      if (!otrosIngresosCategory) {
        addCategory({
          name: 'Otros Ingresos',
          icon: 'cash',
          color: '#06B6D4',
          type: 'income',
          isDefault: true,
        });
        // Esperar un poco para que se actualice el estado y buscar nuevamente
        setTimeout(() => {
          const updatedStore = useAppStore.getState();
          otrosIngresosCategory = updatedStore.categories.find((c: any) => c.name === 'Otros Ingresos' && c.type === 'income');
          if (otrosIngresosCategory) {
            addTransaction({
              type: 'income',
              amount: numBalance,
              categoryId: otrosIngresosCategory.id,
              accountId,
              description: `Saldo inicial de ${title.trim()}`,
              date: new Date().toISOString(),
            });
          }
        }, 100);
      } else if (otrosIngresosCategory) {
        addTransaction({
          type: 'income',
          amount: numBalance,
          categoryId: otrosIngresosCategory.id,
          accountId,
          description: `Saldo inicial de ${title.trim()}`,
          date: new Date().toISOString(),
        });
      }
    }

    Alert.alert('Éxito', 'Cuenta creada correctamente', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Título */}
        <View style={styles.section}>
          <Text style={styles.label}>Título</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Escriba el título"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        {/* Moneda */}
        <View style={styles.section}>
          <CurrencySelector
            selectedCurrency={currency}
            onCurrencyChange={setCurrency}
            modalTitle="Seleccionar moneda"
            label="Moneda de la cuenta"
            showFullName={true}
          />
        </View>

        {/* Saldo actual */}
        <View style={styles.section}>
          <Text style={styles.label}>Saldo actual</Text>
          <View style={styles.amountContainer}>
            <TextInput
              style={styles.amountInput}
              value={balance}
              onChangeText={setBalance}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={colors.textSecondary}
            />
            <Text style={styles.currencyLabel}>{currency}</Text>
          </View>
        </View>

        {/* Icono */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.label}>Icono</Text>
            <Ionicons name={icon as any} size={24} color={colors.primary} />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.iconGrid}>
              {ACCOUNT_ICONS.map((iconName) => (
                <TouchableOpacity
                  key={iconName}
                  style={[
                    styles.iconButton,
                    icon === iconName && styles.iconButtonSelected,
                  ]}
                  onPress={() => setIcon(iconName)}
                >
                  <Ionicons
                    name={iconName as any}
                    size={24}
                    color={icon === iconName ? colors.primary : colors.textSecondary}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Color del icono */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.label}>Color del icono</Text>
            <View style={[styles.colorPreview, { backgroundColor: iconColor }]} />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.colorRow}>
              {ICON_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorButton,
                    { backgroundColor: color },
                    iconColor === color && styles.colorButtonSelected,
                  ]}
                  onPress={() => setIconColor(color)}
                >
                  {iconColor === color && (
                    <Ionicons name="checkmark" size={20} color="#fff" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Descripción */}
        <View style={styles.section}>
          <Text style={styles.label}>Descripción</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Descripción (opcional)"
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Tipo de cuenta */}
        <View style={styles.section}>
          <Text style={styles.label}>Tipo de cuenta</Text>
          {ACCOUNT_TYPES.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={styles.typeOption}
              onPress={() => setAccountType(type.id)}
            >
              <View style={styles.typeLeft}>
                <Ionicons
                  name={type.icon as any}
                  size={24}
                  color={colors.primary}
                />
                <Text style={styles.typeName}>{type.name}</Text>
              </View>
              {accountType === type.id && (
                <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Límite de crédito (solo para cuentas de crédito) */}
        {accountType === 'credit' && (
          <View style={styles.section}>
            <Text style={styles.label}>Límite de crédito</Text>
            <View style={styles.amountContainer}>
              <TextInput
                style={styles.amountInput}
                value={creditLimit}
                onChangeText={setCreditLimit}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
              />
              <Text style={styles.currencyLabel}>{currency}</Text>
            </View>
          </View>
        )}

        {/* Incluir en balance general */}
        <View style={styles.section}>
          <View style={styles.switchContainer}>
            <View style={styles.switchTextContainer}>
              <Text style={styles.label}>Incluir en el balance general</Text>
              <Text style={styles.switchDescription}>
                Incluya el valor de la cuenta en el total en la parte superior de la solicitud.
              </Text>
            </View>
            <Switch
              value={includeInTotal}
              onValueChange={setIncludeInTotal}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.backgroundSecondary}
            />
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Botón Crear */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
          <Text style={styles.createButtonText}>Crear</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
  section: {
    backgroundColor: colors.backgroundSecondary,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  iconGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconButton: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}15`,
  },
  colorPreview: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
  },
  colorRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  colorButton: {
    width: 56,
    height: 56,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorButtonSelected: {
    borderColor: '#ffffff',
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  typeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  typeName: {
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
  },
  currencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  currencyText: {
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
  },
  currencyButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  currencyButtonText: {
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
    fontWeight: typography.weights.semibold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '90%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  currencyList: {
    paddingVertical: spacing.sm,
  },
  currencyListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  currencyListItemSelected: {
    backgroundColor: `${colors.primary}10`,
  },
  currencyListItemContent: {
    flex: 1,
  },
  currencyCode: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  currencyName: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  currencyListItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  currencySymbol: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
  },
  amountInput: {
    flex: 1,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.success,
    paddingVertical: spacing.md,
  },
  currencyLabel: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.success,
    marginLeft: spacing.sm,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchTextContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  switchDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  bottomSpacing: {
    height: spacing.xl,
  },
  footer: {
    padding: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  createButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: '#FFFFFF',
  },
});
