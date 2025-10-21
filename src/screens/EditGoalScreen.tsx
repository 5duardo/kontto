import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography, borderRadius, useTheme } from '../theme';
import { useAppStore } from '../store/useAppStore';
import { Goal } from '../types';

const GOAL_ICONS = [
  'star',
  'home',
  'airplane',
  'car',
  'heart',
  'camera',
  'gift',
  'bicycle',
  'book',
  'briefcase',
  'cart',
  'watch',
  'call',
  'laptop',
  'shield',
  'trophy',
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

const CURRENCIES = [
  { code: 'HNL', name: 'Lempira hondureño', symbol: 'L' },
  { code: 'USD', name: 'Dólar estadounidense', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
];

export const EditGoalScreen = ({ navigation, route }: any) => {
  const { colors } = useTheme();
  const { goal } = route?.params || {};
  const updateGoal = useAppStore((state) => state.updateGoal);
  const deleteGoal = useAppStore((state) => state.deleteGoal);
  const styles = useMemo(() => createStyles(colors, borderRadius), [colors]);

  const [name, setName] = useState(goal?.name || '');
  const [description, setDescription] = useState(goal?.description || '');
  const [icon, setIcon] = useState(goal?.icon || 'star');
  const [iconColor, setIconColor] = useState(goal?.color || '#3B82F6');
  const [currency, setCurrency] = useState(goal?.currency || 'HNL');
  const [currentAmount, setCurrentAmount] = useState(String(goal?.currentAmount || 0));
  const [targetAmount, setTargetAmount] = useState(String(goal?.targetAmount || 0));
  const [targetDate, setTargetDate] = useState(goal?.targetDate || new Date().toISOString().split('T')[0]);
  const [includeInTotal, setIncludeInTotal] = useState(goal?.includeInTotal || false);

  const handleUpdate = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Por favor ingresa un nombre para la meta');
      return;
    }

    const numCurrent = parseFloat(currentAmount) || 0;
    const numTarget = parseFloat(targetAmount) || 0;

    if (numTarget <= 0) {
      Alert.alert('Error', 'El objetivo debe ser mayor a 0');
      return;
    }

    if (numCurrent > numTarget) {
      Alert.alert('Error', 'El saldo actual no puede ser mayor al objetivo');
      return;
    }

    updateGoal(goal.id, {
      name: name.trim(),
      description: description.trim() || undefined,
      icon,
      color: iconColor,
      currency,
      currentAmount: numCurrent,
      targetAmount: numTarget,
      targetDate,
      includeInTotal,
    });

    Alert.alert('Éxito', 'Meta actualizada correctamente', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  const handleDelete = () => {
    Alert.alert(
      'Eliminar Meta',
      '¿Estás seguro que deseas eliminar esta meta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            deleteGoal(goal.id);
            Alert.alert('Éxito', 'Meta eliminada correctamente', [
              { text: 'OK', onPress: () => navigation.goBack() },
            ]);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Nombre */}
        <View style={styles.section}>
          <Text style={styles.label}>Nombre de la meta</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Ej: Viaje a Hawái"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        {/* Icono */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.label}>Ícono</Text>
            <Ionicons name={icon as any} size={24} color={colors.primary} />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.iconGrid}>
              {GOAL_ICONS.map((iconName) => (
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
            <Text style={styles.label}>Color del ícono</Text>
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

        {/* Moneda */}
        <View style={styles.section}>
          <Text style={styles.label}>Moneda</Text>
          {CURRENCIES.map((curr) => (
            <TouchableOpacity
              key={curr.code}
              style={styles.currencyOption}
              onPress={() => setCurrency(curr.code)}
            >
              <View style={styles.currencyLeft}>
                <View
                  style={[
                    styles.radioButton,
                    currency === curr.code && styles.radioButtonSelected,
                  ]}
                >
                  {currency === curr.code && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
                <View>
                  <Text style={styles.currencyText}>{curr.code}</Text>
                  <Text style={styles.currencySubtext}>{curr.name}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Saldo Actual */}
        <View style={styles.section}>
          <Text style={styles.label}>Saldo Actual</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.currencyLabel}>
              {CURRENCIES.find(c => c.code === currency)?.symbol}
            </Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0"
              value={currentAmount}
              onChangeText={setCurrentAmount}
              keyboardType="decimal-pad"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        </View>

        {/* Objetivo */}
        <View style={styles.section}>
          <Text style={styles.label}>Objetivo</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.currencyLabel}>
              {CURRENCIES.find(c => c.code === currency)?.symbol}
            </Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0"
              value={targetAmount}
              onChangeText={setTargetAmount}
              keyboardType="decimal-pad"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        </View>

        {/* Fecha Objetivo */}
        <View style={styles.section}>
          <Text style={styles.label}>Fecha Objetivo</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            value={targetDate}
            onChangeText={(text) => text.length <= 10 && setTargetDate(text)}
            placeholderTextColor={colors.textSecondary}
          />
          <Text style={styles.helperText}>Formato: YYYY-MM-DD (Ej: 2025-12-31)</Text>
        </View>

        {/* Incluir en Balance General */}
        <View style={styles.section}>
          <View style={styles.switchContainer}>
            <View style={styles.switchTextContainer}>
              <Text style={styles.label}>Incluir en Balance General</Text>
              <Text style={styles.switchDescription}>
                El saldo se sumará al total de cuentas
              </Text>
            </View>
            <Switch
              value={includeInTotal}
              onValueChange={setIncludeInTotal}
              trackColor={{ false: colors.border, true: colors.primary + '80' }}
              thumbColor={includeInTotal ? colors.primary : colors.textSecondary}
            />
          </View>
        </View>

        {/* Botón Eliminar */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
          >
            <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
            <Text style={styles.deleteButtonText}>Eliminar Meta</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Footer con botón */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.updateButton}
          onPress={handleUpdate}
        >
          <Text style={styles.updateButtonText}>Guardar Cambios</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const createStyles = (colors: any, br: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
    paddingBottom: spacing.md,
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
  currencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  currencyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.textSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  currencyText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  currencySubtext: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
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
  helperText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.sm,
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
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    backgroundColor: colors.expense,
    borderRadius: 12,
    padding: spacing.md,
  },
  deleteButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: '#FFFFFF',
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
  updateButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
  },
  updateButtonText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: '#FFFFFF',
  },
});
