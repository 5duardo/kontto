import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing, typography, useTheme } from '../theme';
import { useAppStore } from '../store/useAppStore';
import { Account } from '../types';

export const TransferScreen = ({ navigation, route }: any) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  
  const { accounts, transferMoney } = useAppStore();
  const sourceAccountId: string = route.params?.accountId;
  const sourceAccount = accounts.find(a => a.id === sourceAccountId);
  
  const [destinationAccountId, setDestinationAccountId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  
  const destinationAccount = destinationAccountId 
    ? accounts.find(a => a.id === destinationAccountId)
    : null;
  
  // Cuentas disponibles como destino (todas excepto la origen)
  const availableDestinations = accounts.filter(
    a => a.id !== sourceAccountId && !a.isArchived
  );

  const handleTransfer = () => {
    if (!sourceAccount) {
      Alert.alert('Error', 'Cuenta origen no encontrada');
      return;
    }

    if (!destinationAccountId) {
      Alert.alert('Error', 'Por favor selecciona una cuenta destino');
      return;
    }

    if (!destinationAccount) {
      Alert.alert('Error', 'Cuenta destino no encontrada');
      return;
    }

    const transferAmount = parseFloat(amount);
    if (!transferAmount || transferAmount <= 0) {
      Alert.alert('Error', 'Por favor ingresa un monto válido');
      return;
    }

    if (sourceAccount.balance < transferAmount) {
      Alert.alert('Error', 'Saldo insuficiente en la cuenta origen');
      return;
    }

    transferMoney({
      sourceAccountId,
      destinationAccountId,
      amount: transferAmount,
      description: description.trim() || 'Transferencia',
    });

    Alert.alert('Éxito', 'Transferencia realizada correctamente', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  if (!sourceAccount) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.label}>Cuenta no encontrada</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transferencia entre cuentas</Text>
        </View>

        {/* Cuenta Origen */}
        <View style={styles.section}>
          <Text style={styles.label}>Desde</Text>
          <View style={styles.accountBox}>
            <View style={[styles.accountIcon, { backgroundColor: `${sourceAccount.color}33` }]}>
              <Ionicons name={sourceAccount.icon as any} size={24} color={sourceAccount.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.accountName}>{sourceAccount.title}</Text>
              <Text style={styles.accountBalance}>
                {sourceAccount.balance.toLocaleString('es-HN', {
                  minimumFractionDigits: sourceAccount.currency === 'HNL' ? 0 : 2,
                  maximumFractionDigits: sourceAccount.currency === 'HNL' ? 0 : 2,
                })} {sourceAccount.currency}
              </Text>
            </View>
          </View>
        </View>

        {/* Cuenta Destino */}
        <View style={styles.section}>
          <Text style={styles.label}>Hacia</Text>
          {availableDestinations.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No hay cuentas disponibles para transferencia</Text>
            </View>
          ) : (
            <View style={styles.dropdown}>
              {availableDestinations.map((account) => (
                <TouchableOpacity
                  key={account.id}
                  style={[
                    styles.dropdownOption,
                    destinationAccountId === account.id && styles.dropdownOptionSelected,
                  ]}
                  onPress={() => setDestinationAccountId(account.id)}
                >
                  <View style={[styles.accountIcon, { backgroundColor: `${account.color}33` }]}>
                    <Ionicons name={account.icon as any} size={20} color={account.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.accountName}>{account.title}</Text>
                    <Text style={styles.accountBalance}>
                      {account.balance.toLocaleString('es-HN', {
                        minimumFractionDigits: account.currency === 'HNL' ? 0 : 2,
                        maximumFractionDigits: account.currency === 'HNL' ? 0 : 2,
                      })} {account.currency}
                    </Text>
                  </View>
                  {destinationAccountId === account.id && (
                    <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Monto */}
        <View style={styles.section}>
          <Text style={styles.label}>Monto</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor={colors.textSecondary}
            keyboardType="decimal-pad"
          />
          <Text style={styles.helperText}>
            Disponible: {sourceAccount.balance.toLocaleString('es-HN', {
              minimumFractionDigits: sourceAccount.currency === 'HNL' ? 0 : 2,
              maximumFractionDigits: sourceAccount.currency === 'HNL' ? 0 : 2,
            })} {sourceAccount.currency}
          </Text>
        </View>

        {/* Descripción */}
        <View style={styles.section}>
          <Text style={styles.label}>Descripción (opcional)</Text>
          <TextInput
            style={[styles.input, { height: 80 }]}
            value={description}
            onChangeText={setDescription}
            placeholder="Ingresa una descripción"
            placeholderTextColor={colors.textSecondary}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Botones */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={[styles.button, styles.buttonPrimary]}
            onPress={handleTransfer}
            disabled={!destinationAccountId || !amount}
          >
            <Ionicons name="swap-horizontal" size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>Realizar Transferencia</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.buttonSecondary]}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.buttonText, { color: colors.primary }]}>Cancelar</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  section: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold as any,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold as any,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  accountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
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
    fontWeight: typography.weights.semibold as any,
    color: colors.textPrimary,
  },
  accountBalance: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  dropdown: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  dropdownOptionSelected: {
    backgroundColor: `${colors.primary}15`,
  },
  emptyState: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  helperText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  buttonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold as any,
    color: '#FFFFFF',
  },
});
