import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SearchBar from './common/SearchBar';
import { spacing, typography, useTheme } from '../theme';

export const CURRENCIES = [
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
  { code: 'HKD', name: 'Dólar de Hong Kong', symbol: 'HK$' },
  { code: 'AUD', name: 'Dólar Australiano', symbol: 'A$' },
  { code: 'NZD', name: 'Dólar Neozelandés', symbol: 'NZ$' },
  { code: 'ZAR', name: 'Rand Sudafricano', symbol: 'R' },
  { code: 'PHP', name: 'Peso Filipino', symbol: '₱' },
  { code: 'VND', name: 'Dong Vietnamita', symbol: '₫' },
  { code: 'PKR', name: 'Rupia Pakistaní', symbol: '₨' },
  { code: 'BDT', name: 'Taka Bangladesí', symbol: '৳' },
  { code: 'LKR', name: 'Rupia de Sri Lanka', symbol: 'Rs' },
  { code: 'MMK', name: 'Kyat Birmano', symbol: 'K' },
  { code: 'KHR', name: 'Riel Camboyano', symbol: '៛' },
  { code: 'LAK', name: 'Kip Laosiano', symbol: '₭' },
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
  { code: 'FJD', name: 'Dólar Fiyiano', symbol: 'FJ$' },

  // Otras
  { code: 'BTC', name: 'Bitcoin', symbol: '₿' },
  { code: 'ETH', name: 'Ethereum', symbol: 'Ξ' },
];

interface CurrencySelectorProps {
  /**
   * Moneda seleccionada (código, ej: 'USD')
   */
  selectedCurrency: string;

  /**
   * Callback cuando se selecciona una moneda
   */
  onCurrencyChange: (currencyCode: string) => void;

  /**
   * Título del modal (ej: "Seleccionar moneda")
   */
  modalTitle?: string;

  /**
   * Etiqueta del botón (ej: "Moneda")
   */
  label?: string;

  /**
   * Mostrar solo nombre + símbolo en el botón (sin código)
   */
  showFullName?: boolean;

  /**
   * Estilos personalizados para el botón
   */
  buttonStyle?: ViewStyle;

  /**
   * Estilos personalizados para el texto del botón
   */
  buttonTextStyle?: TextStyle;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  selectedCurrency,
  onCurrencyChange,
  modalTitle = 'Seleccionar moneda',
  label,
  showFullName = false,
  buttonStyle,
  buttonTextStyle,
}) => {
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const styles = useMemo(() => createStyles(colors), [colors]);

  const selectedCurrencyData = CURRENCIES.find((c) => c.code === selectedCurrency);

  const handleSelectCurrency = (currencyCode: string) => {
    onCurrencyChange(currencyCode);
    setModalVisible(false);
  };

  const getButtonText = () => {
    if (!selectedCurrencyData) return 'Seleccionar';
    if (showFullName) {
      return `${selectedCurrencyData.name} (${selectedCurrencyData.symbol})`;
    }
    return `${selectedCurrencyData.symbol} ${selectedCurrencyData.code}`;
  };

  return (
    <>
      {/* Button */}
      <TouchableOpacity
        style={[styles.currencyButton, buttonStyle]}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.currencyButtonContent}>
          {label && <Text style={styles.currencyButtonLabel}>{label}</Text>}
          <Text style={[styles.currencyButtonText, buttonTextStyle]}>{getButtonText()}</Text>
        </View>
        <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color={colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{modalTitle}</Text>
              <View style={{ width: 28 }} />
            </View>

            <View style={styles.searchWrapper}>
              <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Buscar moneda..." />
            </View>

            <ScrollView style={styles.currencyList}>
              {CURRENCIES.filter((c) => {
                const term = searchTerm.trim().toLowerCase();
                if (!term) return true;
                return (`${c.code} ${c.name} ${c.symbol}`).toLowerCase().includes(term);
              }).map((currency) => (
                <TouchableOpacity
                  key={currency.code}
                  style={[
                    styles.currencyListItem,
                    selectedCurrency === currency.code && styles.currencyListItemSelected,
                  ]}
                  onPress={() => handleSelectCurrency(currency.code)}
                >
                  <View style={styles.currencyListItemContent}>
                    <Text style={styles.currencyCode}>{currency.code}</Text>
                    <Text style={styles.currencyName}>{currency.name}</Text>
                  </View>
                  <View style={styles.currencyListItemRight}>
                    <Text style={styles.currencySymbol}>{currency.symbol}</Text>
                    {selectedCurrency === currency.code && (
                      <Ionicons name="checkmark" size={24} color={colors.primary} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  currencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  currencyButtonContent: {
    flex: 1,
    justifyContent: 'center',
  },
  currencyButtonLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textTertiary,
    marginBottom: 4,
  },
  currencyButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium as any,
    color: colors.textPrimary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '90%',
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
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold as any,
    color: colors.textPrimary,
  },
  searchWrapper: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  currencyList: {
    paddingHorizontal: spacing.md,
  },
  currencyListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: 0,
    borderRadius: 8,
    marginBottom: spacing.xs,
  },
  currencyListItemSelected: {
    backgroundColor: `${colors.primary}10`,
  },
  currencyListItemContent: {
    flex: 1,
  },
  currencyListItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
  currencySymbol: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold as any,
    color: colors.textSecondary,
  },
});
