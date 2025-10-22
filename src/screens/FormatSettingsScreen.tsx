import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography, useTheme } from '../theme';
import { useAppStore } from '../store/useAppStore';
import { CURRENCIES } from '../components/CurrencySelector';

const DECIMAL_OPTIONS = ['0', '2', '3', '4'];
const DATE_FORMATS = [
    { key: 'dd/mm/yyyy', label: 'día | mes | año', example: '21/10/2025' },
    { key: 'mm/dd/yyyy', label: 'mes | día | año', example: '10/21/2025' },
    { key: 'yyyy/mm/dd', label: 'año | mes | día', example: '2025/10/21' },
];
const MONTH_START_OPTIONS = Array.from({ length: 28 }, (_, i) => i + 1);

export const FormatSettingsScreen = ({ navigation }: any) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    // Get values from Zustand store
    const {
        preferredCurrency,
        setPreferredCurrency,
        conversionCurrency,
        setConversionCurrency,
        decimalPlaces,
        setDecimalPlaces,
        dateFormat,
        setDateFormat,
        monthStart,
        setMonthStart,
    } = useAppStore();

    // Modal states
    const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
    const [conversionCurrencyModalVisible, setConversionCurrencyModalVisible] = useState(false);
    const [decimalModalVisible, setDecimalModalVisible] = useState(false);
    const [dateFormatModalVisible, setDateFormatModalVisible] = useState(false);
    const [monthStartModalVisible, setMonthStartModalVisible] = useState(false);

    // Format examples
    const formatExample = (currency: string, decimals: number) => {
        const currencyCode = CURRENCIES.find(c => c.code === currency)?.code || 'HNL';
        const amount = -1234567.89;
        if (decimals === 0) return `${amount.toFixed(0)} ${currencyCode}`;
        return `-1,234,567.${String(decimals).padEnd(decimals, '8')} ${currencyCode}`;
    };

    const getDateFormatLabel = () => {
        return DATE_FORMATS.find(f => f.key === dateFormat)?.label || 'día | mes | año';
    };

    const renderOptionCard = (
        title: string,
        value: string,
        icon: string,
        onPress: () => void
    ) => (
        <TouchableOpacity
            style={styles.optionCard}
            activeOpacity={0.7}
            onPress={onPress}
        >
            <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}15` }]}>
                <Ionicons name={icon as any} size={20} color={colors.primary} />
            </View>
            <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>{title}</Text>
                <Text style={styles.optionValue}>{value}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Sección Monedas */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Monedas</Text>
                    {renderOptionCard(
                        'Moneda principal',
                        CURRENCIES.find(c => c.code === preferredCurrency)?.name || 'Lempira Hondureño',
                        'cash',
                        () => setCurrencyModalVisible(true)
                    )}
                    <View style={styles.spacer} />
                    {renderOptionCard(
                        'Moneda de conversión',
                        CURRENCIES.find(c => c.code === conversionCurrency)?.name || 'Dólar Americano',
                        'swap-horizontal',
                        () => setConversionCurrencyModalVisible(true)
                    )}
                </View>

                {/* Sección Formato */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Formato</Text>
                    {renderOptionCard(
                        'Formato de moneda',
                        formatExample(preferredCurrency, decimalPlaces),
                        'calculator',
                        () => setDecimalModalVisible(true)
                    )}
                    <View style={styles.spacer} />
                    {renderOptionCard(
                        'Formato de fecha',
                        getDateFormatLabel(),
                        'calendar',
                        () => setDateFormatModalVisible(true)
                    )}
                </View>

                {/* Sección Período */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Período</Text>
                    {renderOptionCard(
                        'Inicio de mes',
                        `Día ${monthStart}`,
                        'today',
                        () => setMonthStartModalVisible(true)
                    )}
                </View>

                <View style={{ height: 60 }} />
            </ScrollView>

            {/* Currency Modal */}
            <Modal
                visible={currencyModalVisible}
                onRequestClose={() => setCurrencyModalVisible(false)}
                transparent
                animationType="slide"
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.backgroundSecondary }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Moneda principal</Text>
                            <TouchableOpacity onPress={() => setCurrencyModalVisible(false)}>
                                <Ionicons name="close" size={28} color={colors.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalList}>
                            {CURRENCIES.map((currency) => (
                                <TouchableOpacity
                                    key={currency.code}
                                    style={styles.modalItem}
                                    onPress={() => {
                                        setPreferredCurrency(currency.code);
                                        setCurrencyModalVisible(false);
                                    }}
                                >
                                    <View style={{ flex: 1 }}>
                                        <Text
                                            style={[
                                                styles.modalItemText,
                                                currency.code === preferredCurrency && styles.modalItemTextSelected,
                                            ]}
                                        >
                                            {currency.name}
                                        </Text>
                                        <Text style={[styles.modalItemSubtext, { marginTop: 4 }]}>
                                            {currency.code} · {currency.symbol}
                                        </Text>
                                    </View>
                                    {currency.code === preferredCurrency && (
                                        <Ionicons
                                            name="checkmark-circle"
                                            size={24}
                                            color={colors.primary}
                                        />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Conversion Currency Modal */}
            <Modal
                visible={conversionCurrencyModalVisible}
                onRequestClose={() => setConversionCurrencyModalVisible(false)}
                transparent
                animationType="slide"
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.backgroundSecondary }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Moneda de conversión</Text>
                            <TouchableOpacity onPress={() => setConversionCurrencyModalVisible(false)}>
                                <Ionicons name="close" size={28} color={colors.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalList}>
                            {CURRENCIES.map((currency) => (
                                <TouchableOpacity
                                    key={currency.code}
                                    style={styles.modalItem}
                                    onPress={() => {
                                        setConversionCurrency(currency.code);
                                        setConversionCurrencyModalVisible(false);
                                    }}
                                >
                                    <View style={{ flex: 1 }}>
                                        <Text
                                            style={[
                                                styles.modalItemText,
                                                currency.code === conversionCurrency && styles.modalItemTextSelected,
                                            ]}
                                        >
                                            {currency.name}
                                        </Text>
                                        <Text style={[styles.modalItemSubtext, { marginTop: 4 }]}>
                                            {currency.code} · {currency.symbol}
                                        </Text>
                                    </View>
                                    {currency.code === conversionCurrency && (
                                        <Ionicons
                                            name="checkmark-circle"
                                            size={24}
                                            color={colors.primary}
                                        />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Decimal Places Modal */}
            <Modal
                visible={decimalModalVisible}
                onRequestClose={() => setDecimalModalVisible(false)}
                transparent
                animationType="slide"
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.backgroundSecondary }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Decimales</Text>
                            <TouchableOpacity onPress={() => setDecimalModalVisible(false)}>
                                <Ionicons name="close" size={28} color={colors.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalList}>
                            {DECIMAL_OPTIONS.map((decimal) => (
                                <TouchableOpacity
                                    key={decimal}
                                    style={styles.modalItem}
                                    onPress={() => {
                                        setDecimalPlaces(parseInt(decimal, 10));
                                        setDecimalModalVisible(false);
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.modalItemText,
                                            parseInt(decimal, 10) === decimalPlaces && styles.modalItemTextSelected,
                                        ]}
                                    >
                                        {decimal} decimales
                                    </Text>
                                    {parseInt(decimal, 10) === decimalPlaces && (
                                        <Ionicons
                                            name="checkmark-circle"
                                            size={24}
                                            color={colors.primary}
                                        />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Date Format Modal */}
            <Modal
                visible={dateFormatModalVisible}
                onRequestClose={() => setDateFormatModalVisible(false)}
                transparent
                animationType="slide"
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.backgroundSecondary }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Formato de fecha</Text>
                            <TouchableOpacity onPress={() => setDateFormatModalVisible(false)}>
                                <Ionicons name="close" size={28} color={colors.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalList}>
                            {DATE_FORMATS.map((fmt) => (
                                <TouchableOpacity
                                    key={fmt.key}
                                    style={styles.modalItem}
                                    onPress={() => {
                                        setDateFormat(fmt.key);
                                        setDateFormatModalVisible(false);
                                    }}
                                >
                                    <View style={{ flex: 1 }}>
                                        <Text
                                            style={[
                                                styles.modalItemText,
                                                fmt.key === dateFormat && styles.modalItemTextSelected,
                                            ]}
                                        >
                                            {fmt.label}
                                        </Text>
                                        <Text style={[styles.modalItemSubtext, { marginTop: 4 }]}>
                                            {fmt.example}
                                        </Text>
                                    </View>
                                    {fmt.key === dateFormat && (
                                        <Ionicons
                                            name="checkmark-circle"
                                            size={24}
                                            color={colors.primary}
                                        />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Month Start Modal */}
            <Modal
                visible={monthStartModalVisible}
                onRequestClose={() => setMonthStartModalVisible(false)}
                transparent
                animationType="slide"
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.backgroundSecondary }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Inicio de mes</Text>
                            <TouchableOpacity onPress={() => setMonthStartModalVisible(false)}>
                                <Ionicons name="close" size={28} color={colors.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalList}>
                            {MONTH_START_OPTIONS.map((day) => (
                                <TouchableOpacity
                                    key={day}
                                    style={styles.modalItem}
                                    onPress={() => {
                                        setMonthStart(day);
                                        setMonthStartModalVisible(false);
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.modalItemText,
                                            day === monthStart && styles.modalItemTextSelected,
                                        ]}
                                    >
                                        Día {day}
                                    </Text>
                                    {day === monthStart && (
                                        <Ionicons
                                            name="checkmark-circle"
                                            size={24}
                                            color={colors.primary}
                                        />
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

const createStyles = (colors: any) =>
    StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        content: { flex: 1 },
        section: {
            marginTop: spacing.lg,
            paddingHorizontal: spacing.md,
        },

        // Section and card styles
        sectionTitle: {
            fontSize: typography.sizes.lg,
            fontWeight: typography.weights.bold as any,
            color: colors.textPrimary,
            marginBottom: spacing.md,
        },
        optionCard: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.md,
            paddingVertical: spacing.lg,
            paddingHorizontal: spacing.md,
            backgroundColor: colors.backgroundSecondary,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
        },
        iconContainer: {
            width: 44,
            height: 44,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
        },
        optionContent: {
            flex: 1,
        },
        optionTitle: {
            fontSize: typography.sizes.base,
            fontWeight: typography.weights.semibold as any,
            color: colors.textPrimary,
            marginBottom: 4,
        },
        optionValue: {
            fontSize: typography.sizes.sm,
            fontWeight: typography.weights.medium as any,
            color: colors.primary,
        },
        spacer: {
            height: spacing.md,
        },

        // Modal styles
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
        },
        modalContent: {
            maxHeight: '75%',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            paddingBottom: spacing.xl,
        },
        modalHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.lg,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        modalTitle: {
            fontSize: typography.sizes.lg,
            fontWeight: typography.weights.bold as any,
            color: colors.textPrimary,
        },
        modalList: {
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.md,
        },
        modalItem: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.md,
            marginVertical: spacing.xs,
            backgroundColor: colors.background,
            borderRadius: 8,
        },
        modalItemText: {
            fontSize: typography.sizes.base,
            fontWeight: typography.weights.semibold as any,
            color: colors.textSecondary,
        },
        modalItemTextSelected: {
            color: colors.primary,
        },
        modalItemSubtext: {
            fontSize: typography.sizes.sm,
            color: colors.textSecondary,
        },
    });
