import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';
import { spacing, typography, useTheme } from '../theme';

const AVAILABLE_CURRENCIES = [
  // América
  { code: 'USD', name: 'Dólar Americano', symbol: '$' },
  { code: 'CAD', name: 'Dólar Canadiense', symbol: 'C$' },
  { code: 'MXN', name: 'Peso Mexicano', symbol: '$' },
  { code: 'BRL', name: 'Real Brasileño', symbol: 'R$' },
  { code: 'ARS', name: 'Peso Argentino', symbol: '$' },
  { code: 'CLP', name: 'Peso Chileno', symbol: '$' },
  { code: 'COP', name: 'Peso Colombiano', symbol: '$' },
  { code: 'PEN', name: 'Sol Peruano', symbol: 'S/' },
  { code: 'HNL', name: 'Lempira Hondureño', symbol: 'L' },
  { code: 'GTQ', name: 'Quetzal Guatemalteco', symbol: 'Q' },
  { code: 'CRC', name: 'Colón Costarricense', symbol: '₡' },
  { code: 'PAB', name: 'Balboa Panameño', symbol: 'B/.' },
  { code: 'NIO', name: 'Córdoba Nicaragüense', symbol: 'C$' },
  { code: 'DOP', name: 'Peso Dominicano', symbol: 'RD$' },
  { code: 'UYU', name: 'Peso Uruguayo', symbol: '$U' },
  { code: 'BOB', name: 'Boliviano', symbol: 'Bs.' },
  { code: 'PYG', name: 'Guaraní Paraguayo', symbol: '₲' },
  { code: 'VES', name: 'Bolívar Venezolano', symbol: 'Bs.' },
  
  // Europa
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'Libra Esterlina', symbol: '£' },
  { code: 'CHF', name: 'Franco Suizo', symbol: 'CHF' },
  { code: 'SEK', name: 'Corona Sueca', symbol: 'kr' },
  { code: 'NOK', name: 'Corona Noruega', symbol: 'kr' },
  { code: 'DKK', name: 'Corona Danesa', symbol: 'kr' },
  { code: 'PLN', name: 'Zloty Polaco', symbol: 'zł' },
  { code: 'CZK', name: 'Corona Checa', symbol: 'Kč' },
  { code: 'HUF', name: 'Forinto Húngaro', symbol: 'Ft' },
  { code: 'RON', name: 'Leu Rumano', symbol: 'lei' },
  { code: 'RUB', name: 'Rublo Ruso', symbol: '₽' },
  { code: 'TRY', name: 'Lira Turca', symbol: '₺' },
  { code: 'UAH', name: 'Grivna Ucraniana', symbol: '₴' },
  
  // Asia
  { code: 'CNY', name: 'Yuan Chino', symbol: '¥' },
  { code: 'JPY', name: 'Yen Japonés', symbol: '¥' },
  { code: 'KRW', name: 'Won Surcoreano', symbol: '₩' },
  { code: 'INR', name: 'Rupia India', symbol: '₹' },
  { code: 'IDR', name: 'Rupia Indonesia', symbol: 'Rp' },
  { code: 'THB', name: 'Baht Tailandés', symbol: '฿' },
  { code: 'MYR', name: 'Ringgit Malayo', symbol: 'RM' },
  { code: 'SGD', name: 'Dólar de Singapur', symbol: 'S$' },
  { code: 'PHP', name: 'Peso Filipino', symbol: '₱' },
  { code: 'VND', name: 'Dong Vietnamita', symbol: '₫' },
  { code: 'PKR', name: 'Rupia Pakistaní', symbol: '₨' },
  { code: 'BDT', name: 'Taka Bangladesí', symbol: '৳' },
  { code: 'LKR', name: 'Rupia de Sri Lanka', symbol: 'Rs' },
  { code: 'MMK', name: 'Kyat Birmano', symbol: 'K' },
  { code: 'KHR', name: 'Riel Camboyano', symbol: '៛' },
  { code: 'LAK', name: 'Kip Laosiano', symbol: '₭' },
  { code: 'HKD', name: 'Dólar de Hong Kong', symbol: 'HK$' },
  { code: 'TWD', name: 'Dólar Taiwanés', symbol: 'NT$' },
  
  // Medio Oriente
  { code: 'AED', name: 'Dirham de EAU', symbol: 'د.إ' },
  { code: 'SAR', name: 'Riyal Saudí', symbol: '﷼' },
  { code: 'QAR', name: 'Riyal Qatarí', symbol: 'QR' },
  { code: 'KWD', name: 'Dinar Kuwaití', symbol: 'د.ك' },
  { code: 'BHD', name: 'Dinar Bahreiní', symbol: 'BD' },
  { code: 'OMR', name: 'Rial Omaní', symbol: 'ر.ع.' },
  { code: 'JOD', name: 'Dinar Jordano', symbol: 'د.ا' },
  { code: 'ILS', name: 'Shekel Israelí', symbol: '₪' },
  { code: 'IQD', name: 'Dinar Iraquí', symbol: 'د.ع' },
  { code: 'IRR', name: 'Rial Iraní', symbol: '﷼' },
  { code: 'LBP', name: 'Libra Libanesa', symbol: 'ل.ل' },
  
  // África
  { code: 'ZAR', name: 'Rand Sudafricano', symbol: 'R' },
  { code: 'EGP', name: 'Libra Egipcia', symbol: 'E£' },
  { code: 'NGN', name: 'Naira Nigeriana', symbol: '₦' },
  { code: 'KES', name: 'Chelín Keniano', symbol: 'KSh' },
  { code: 'GHS', name: 'Cedi Ghanés', symbol: '₵' },
  { code: 'TZS', name: 'Chelín Tanzano', symbol: 'TSh' },
  { code: 'UGX', name: 'Chelín Ugandés', symbol: 'USh' },
  { code: 'MAD', name: 'Dirham Marroquí', symbol: 'د.م.' },
  { code: 'TND', name: 'Dinar Tunecino', symbol: 'د.ت' },
  { code: 'DZD', name: 'Dinar Argelino', symbol: 'د.ج' },
  { code: 'AOA', name: 'Kwanza Angoleño', symbol: 'Kz' },
  { code: 'ETB', name: 'Birr Etíope', symbol: 'Br' },
  
  // Oceanía
  { code: 'AUD', name: 'Dólar Australiano', symbol: 'A$' },
  { code: 'NZD', name: 'Dólar Neozelandés', symbol: 'NZ$' },
  { code: 'FJD', name: 'Dólar Fiyiano', symbol: 'FJ$' },
  
  // Otras
  { code: 'BTC', name: 'Bitcoin', symbol: '₿' },
  { code: 'ETH', name: 'Ethereum', symbol: 'Ξ' },
];

export const SettingsScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const { preferredCurrency, setPreferredCurrency, favoriteExchangeRate, setFavoriteExchangeRate, theme, setTheme } = useAppStore();
  
  // Estados para los modales
  const [showPreferredCurrencyModal, setShowPreferredCurrencyModal] = useState(false);
  const [showFavoriteRateModal, setShowFavoriteRateModal] = useState(false);
  
  // Crear estilos dinámicamente basados en los colores del tema
  const styles = useMemo(() => createStyles(colors), [colors]);

  // Encontrar la moneda seleccionada
  const selectedPreferredCurrency = AVAILABLE_CURRENCIES.find(c => c.code === preferredCurrency);
  const selectedFavoriteRate = AVAILABLE_CURRENCIES.find(c => c.code === favoriteExchangeRate);

  const handleCurrencyChange = (currency: string) => {
    setPreferredCurrency(currency);
    setShowPreferredCurrencyModal(false);
    Alert.alert('Éxito', `Moneda preferida actualizada a ${currency}`);
  };

  const handleFavoriteRateChange = (rate: string) => {
    setFavoriteExchangeRate(rate);
    setShowFavoriteRateModal(false);
    Alert.alert('Éxito', `Tasa de cambio favorita actualizada a ${rate}`);
  };

  const handleThemeChange = (isLight: boolean) => {
    const newTheme = isLight ? 'light' : 'dark';
    setTheme(newTheme);
    Alert.alert('Éxito', `Tema cambiado a ${isLight ? 'claro' : 'oscuro'}`);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Ajustes Generales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuración General</Text>

          {/* Modo Claro */}
          <View style={styles.settingGroup}>
            <View style={styles.settingHeader}>
              <Ionicons name={theme === 'light' ? 'sunny' : 'moon'} size={24} color={colors.primary} />
              <Text style={styles.settingLabel}>Modo Claro</Text>
              <View style={{ marginLeft: 'auto' }}>
                <Switch
                  value={theme === 'light'}
                  onValueChange={handleThemeChange}
                  thumbColor={theme === 'light' ? colors.primary : colors.textSecondary}
                  trackColor={{ false: colors.border, true: `${colors.primary}40` }}
                />
              </View>
            </View>
            <Text style={styles.settingDescription}>
              {theme === 'light' ? 'Usando modo claro' : 'Usando modo oscuro'}
            </Text>
          </View>

          {/* Moneda Preferida */}
          <View style={styles.settingGroup}>
            <View style={styles.settingHeader}>
              <Ionicons name="cash" size={24} color={colors.primary} />
              <Text style={styles.settingLabel}>Moneda Preferida</Text>
            </View>
            <Text style={styles.settingDescription}>
              Selecciona la moneda en la que deseas ver los saldos de tus cuentas
            </Text>

            <TouchableOpacity
              style={styles.currencySelector}
              onPress={() => setShowPreferredCurrencyModal(true)}
            >
              <View style={styles.currencyInfo}>
                <Text style={styles.currencyCode}>
                  {selectedPreferredCurrency?.symbol} {selectedPreferredCurrency?.code}
                </Text>
                <Text style={styles.currencyName}>{selectedPreferredCurrency?.name}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tasa de Cambio Favorita */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tasa de Cambio Favorita</Text>

          <View style={styles.settingGroup}>
            <View style={styles.settingHeader}>
              <Ionicons name="swap-horizontal" size={24} color={colors.primary} />
              <Text style={styles.settingLabel}>Moneda para Conversión Rápida</Text>
            </View>
            <Text style={styles.settingDescription}>
              Selecciona la moneda para el ciclo de conversión rápido en el Dashboard
            </Text>

            <TouchableOpacity
              style={styles.currencySelector}
              onPress={() => setShowFavoriteRateModal(true)}
            >
              <View style={styles.currencyInfo}>
                <Text style={styles.currencyCode}>
                  {selectedFavoriteRate?.symbol} {selectedFavoriteRate?.code}
                </Text>
                <Text style={styles.currencyName}>{selectedFavoriteRate?.name}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Información */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información</Text>

          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color={colors.primary} />
            <View style={{ marginLeft: spacing.md, flex: 1 }}>
              <Text style={styles.infoTitle}>Moneda Preferida</Text>
              <Text style={styles.infoText}>
                Tu moneda preferida es {preferredCurrency}
              </Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="swap-horizontal" size={24} color={colors.primary} />
            <View style={{ marginLeft: spacing.md, flex: 1 }}>
              <Text style={styles.infoTitle}>Tasa Favorita</Text>
              <Text style={styles.infoText}>
                Tu tasa de cambio favorita es {favoriteExchangeRate}
              </Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="refresh" size={24} color={colors.primary} />
            <View style={{ marginLeft: spacing.md, flex: 1 }}>
              <Text style={styles.infoTitle}>Tasas de Cambio</Text>
              <Text style={styles.infoText}>
                Las tasas se actualizan automáticamente cada hora
              </Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="eye" size={24} color={colors.primary} />
            <View style={{ marginLeft: spacing.md, flex: 1 }}>
              <Text style={styles.infoTitle}>Conversión en Dashboard</Text>
              <Text style={styles.infoText}>
                Verás los saldos de cada cuenta convertidos a tu moneda preferida
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modal Moneda Preferida */}
      <Modal
        visible={showPreferredCurrencyModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowPreferredCurrencyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Moneda Preferida</Text>
              <TouchableOpacity onPress={() => setShowPreferredCurrencyModal(false)}>
                <Ionicons name="close" size={28} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalList}>
              {AVAILABLE_CURRENCIES.map((currency) => (
                <TouchableOpacity
                  key={currency.code}
                  style={[
                    styles.modalItem,
                    preferredCurrency === currency.code && styles.modalItemActive,
                  ]}
                  onPress={() => handleCurrencyChange(currency.code)}
                >
                  <View style={styles.currencyInfo}>
                    <Text style={styles.currencyCode}>
                      {currency.symbol} {currency.code}
                    </Text>
                    <Text style={styles.currencyName}>{currency.name}</Text>
                  </View>
                  {preferredCurrency === currency.code && (
                    <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal Tasa de Cambio Favorita */}
      <Modal
        visible={showFavoriteRateModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowFavoriteRateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Moneda para Conversión</Text>
              <TouchableOpacity onPress={() => setShowFavoriteRateModal(false)}>
                <Ionicons name="close" size={28} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalList}>
              {AVAILABLE_CURRENCIES.map((currency) => (
                <TouchableOpacity
                  key={currency.code}
                  style={[
                    styles.modalItem,
                    favoriteExchangeRate === currency.code && styles.modalItemActive,
                  ]}
                  onPress={() => handleFavoriteRateChange(currency.code)}
                >
                  <View style={styles.currencyInfo}>
                    <Text style={styles.currencyCode}>
                      {currency.symbol} {currency.code}
                    </Text>
                    <Text style={styles.currencyName}>{currency.name}</Text>
                  </View>
                  {favoriteExchangeRate === currency.code && (
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

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as any,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  settingGroup: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  settingLabel: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold as any,
    color: colors.textPrimary,
  },
  settingDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  currencyOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginVertical: spacing.xs,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  currencyOptionActive: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  currencyInfo: {
    flex: 1,
  },
  currencyCode: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold as any,
    color: colors.textPrimary,
  },
  currencyName: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginVertical: spacing.sm,
  },
  infoTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold as any,
    color: colors.textPrimary,
  },
  infoText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  currencySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.backgroundSecondary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
    fontWeight: typography.weights.bold as any,
    color: colors.textPrimary,
  },
  modalList: {
    padding: spacing.md,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  modalItemActive: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
});
