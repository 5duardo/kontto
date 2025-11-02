import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing, typography, useTheme } from '../theme';
import { Account } from '../types';

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

interface AccountDetailModalProps {
  visible: boolean;
  account: Account | null;
  onClose: () => void;
  onEdit?: () => void;
  onArchive: () => void;
  onTransactions: () => void;
  onIncome: () => void;
  onTransfer: () => void;
  onExpense: () => void;
}

export const AccountDetailModal: React.FC<AccountDetailModalProps> = ({
  visible,
  account,
  onClose,
  onEdit,
  onArchive,
  onTransactions,
  onIncome,
  onTransfer,
  onExpense,
}) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (!account) return null;

  const formatCurrency = (amount: number, currency: string) => {
    const symbol = CURRENCY_SYMBOLS[currency] || currency;
    const decimals = 2;
    const formattedAmount = amount.toLocaleString('es-HN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    return `${symbol} ${formattedAmount}`;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.modalContent, { paddingBottom: Math.max(spacing.xl, insets.bottom + spacing.md) }]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: `${account.color}33` }]}>
              <Ionicons name={account.icon as any} size={32} color={account.color} />
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.accountTitle}>{account.title}</Text>
            </View>
          </View>

          {/* Balance */}
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Saldo actual</Text>
            <Text style={styles.balanceAmount}>{formatCurrency(account.balance, account.currency)}</Text>
          </View>

          {/* Primary Actions */}
          <View style={styles.primaryActions}>
            <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
              <View style={[styles.actionIcon, { backgroundColor: '#8B5CF620' }]}>
                <Ionicons name="pencil" size={24} color="#8B5CF6" />
              </View>
              <Text style={styles.actionLabel}>Editar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={onArchive}>
              <View style={[styles.actionIcon, { backgroundColor: account.isArchived ? '#10B98120' : '#6B728020' }]}>
                <Ionicons
                  name={account.isArchived ? "arrow-undo" : "download"}
                  size={24}
                  color={account.isArchived ? "#10B981" : "#6B7280"}
                />
              </View>
              <Text style={styles.actionLabel}>{account.isArchived ? 'Restaurar' : 'Mover al archivo'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={onTransactions}>
              <View style={[styles.actionIcon, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="receipt" size={24} color={colors.primary} />
              </View>
              <Text style={styles.actionLabel}>Transacciones</Text>
            </TouchableOpacity>
          </View>

          {/* Transaction Actions */}
          <View style={styles.transactionActions}>
            <TouchableOpacity style={styles.transactionButton} onPress={onIncome}>
              <View style={[styles.transactionIcon, { backgroundColor: '#10B98120' }]}>
                <Ionicons name="arrow-down" size={24} color="#10B981" />
              </View>
              <Text style={styles.transactionLabel}>Ingresar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.transactionButton} onPress={onTransfer}>
              <View style={[styles.transactionIcon, { backgroundColor: '#F59E0B20' }]}>
                <Ionicons name="arrow-forward" size={24} color="#F59E0B" />
              </View>
              <Text style={styles.transactionLabel}>Transferencia</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.transactionButton} onPress={onExpense}>
              <View style={[styles.transactionIcon, { backgroundColor: '#EF444420' }]}>
                <Ionicons name="arrow-up" size={24} color="#EF4444" />
              </View>
              <Text style={styles.transactionLabel}>Cargar</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.backgroundSecondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accountTitle: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  favoriteButton: {
    padding: spacing.sm,
  },
  balanceContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    marginBottom: spacing.lg,
  },
  balanceLabel: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  balanceAmount: {
    fontSize: typography.sizes['4xl'],
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  primaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  actionLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  transactionActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: spacing.sm,
  },
  transactionButton: {
    flex: 1,
    alignItems: 'center',
  },
  transactionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  transactionLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textPrimary,
    textAlign: 'center',
  },
});

