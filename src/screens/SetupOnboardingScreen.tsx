import React, { useState, useMemo, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    Modal,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography, borderRadius, useTheme } from '../theme';
import { useAppStore } from '../store/useAppStore';
import { Button, Card, CategoryIcon } from '../components/common';
import { CurrencySelector, CURRENCIES } from '../components/CurrencySelector';
import SearchBar from '../components/common/SearchBar';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width, height } = Dimensions.get('window');

interface SetupOnboardingScreenProps {
    onComplete: () => void;
}

const ACCOUNT_TYPES = [
    { id: 'normal' as const, name: 'Normal', icon: 'wallet' },
    { id: 'savings' as const, name: 'Ahorros', icon: 'star' },
    { id: 'credit' as const, name: 'Crédito', icon: 'card' },
];

const ACCOUNT_ICONS = [
    'wallet', 'card', 'cash', 'briefcase', 'home', 'car', 'trending-up', 'gift',
    'star', 'heart', 'airplane', 'bicycle',
];

const ICON_COLORS = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899',
    '#06B6D4', '#6366F1', '#FFFFFF', '#F3F4F6', '#9CA3AF', '#4B5563',
    '#000000', '#F97316', '#84CC16', '#14B8A6',
];

const GOAL_ICONS = [
    'star', 'home', 'airplane', 'car', 'heart', 'camera', 'gift', 'bicycle',
    'book', 'briefcase', 'cart', 'watch', 'call', 'laptop', 'shield', 'trophy',
];

type SetupStep = 'mainCurrency' | 'conversionCurrency' | 'firstAccount' | 'firstGoal';

export const SetupOnboardingScreen: React.FC<SetupOnboardingScreenProps> = ({ onComplete }) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const {
        setPreferredCurrency,
        setConversionCurrency,
        addAccount,
        addGoal,
        addRecurringPayment,
        addBudget,
        categories,
        preferredCurrency,
    } = useAppStore();

    const [currentStep, setCurrentStep] = useState<SetupStep>('mainCurrency');
    const scrollViewRef = useRef<ScrollView>(null);

    // Main Currency
    const [mainCurrency, setMainCurrency] = useState(preferredCurrency);
    const [searchMainCurrency, setSearchMainCurrency] = useState('');

    // Conversion Currency
    const [conversionCurrency, setConversionCurrencyState] = useState('HNL');
    const [searchConversionCurrency, setSearchConversionCurrency] = useState('');

    // First Account
    const [accountTitle, setAccountTitle] = useState('Mi Cuenta Principal');
    const [accountType, setAccountType] = useState<'normal' | 'savings' | 'credit'>('normal');
    const [accountIcon, setAccountIcon] = useState('wallet');
    const [accountIconColor, setAccountIconColor] = useState('#3B82F6');
    const [accountBalance, setAccountBalance] = useState('0');

    // First Goal
    const [goalName, setGoalName] = useState('Mi Primera Meta');
    const [goalIcon, setGoalIcon] = useState('star');
    const [goalIconColor, setGoalIconColor] = useState('#3B82F6');
    const [goalTarget, setGoalTarget] = useState('1000');
    const [goalCurrentAmount, setGoalCurrentAmount] = useState('0');
    const [goalTargetDate, setGoalTargetDate] = useState(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString());

    const steps: SetupStep[] = ['mainCurrency', 'conversionCurrency', 'firstAccount', 'firstGoal'];
    const currentStepIndex = steps.indexOf(currentStep);
    const progress = ((currentStepIndex + 1) / steps.length) * 100;

    const handleNext = () => {
        if (currentStepIndex < steps.length - 1) {
            const nextStep = steps[currentStepIndex + 1];
            setCurrentStep(nextStep);
        }
    };

    const handlePrev = () => {
        if (currentStepIndex > 0) {
            const prevStep = steps[currentStepIndex - 1];
            setCurrentStep(prevStep);
        }
    };

    const handleStepComplete = async () => {
        try {
            switch (currentStep) {
                case 'mainCurrency':
                    setPreferredCurrency(mainCurrency);
                    handleNext();
                    break;

                case 'conversionCurrency':
                    setConversionCurrency(conversionCurrency);
                    handleNext();
                    break;

                case 'firstAccount':
                    if (!accountTitle.trim()) {
                        Alert.alert('Error', 'Por favor ingresa un nombre para la cuenta');
                        return;
                    }
                    addAccount({
                        title: accountTitle.trim(),
                        icon: accountIcon,
                        color: accountIconColor,
                        type: accountType,
                        currency: mainCurrency,
                        balance: parseFloat(accountBalance) || 0,
                        includeInTotal: true,
                        isArchived: false,
                    });
                    handleNext();
                    break;

                case 'firstGoal':
                    if (!goalName.trim()) {
                        Alert.alert('Error', 'Por favor ingresa un nombre para la meta');
                        return;
                    }
                    const numTarget = parseFloat(goalTarget) || 0;
                    const numCurrent = parseFloat(goalCurrentAmount) || 0;
                    if (numTarget <= 0) {
                        Alert.alert('Error', 'El objetivo debe ser mayor a 0');
                        return;
                    }
                    if (numCurrent > numTarget) {
                        Alert.alert('Error', 'El saldo actual no puede ser mayor al objetivo');
                        return;
                    }
                    addGoal({
                        name: goalName.trim(),
                        icon: goalIcon,
                        color: goalIconColor,
                        currency: mainCurrency,
                        currentAmount: numCurrent,
                        targetAmount: numTarget,
                        targetDate: new Date(goalTargetDate).toISOString(),
                        includeInTotal: false,
                    });
                    // Este es el último paso, completar el onboarding
                    onComplete();
                    break;
            }
        } catch (error) {
            console.error('Error en SetupOnboarding:', error);
            Alert.alert('Error', 'Ocurrió un error. Por favor intenta de nuevo.');
        }
    };

    const expenseCategories = categories.filter(c => c.type === 'expense');

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Progress Bar */}
            <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${progress}%` }]} />
            </View>

            {/* Step Indicator */}
            <View style={styles.stepIndicator}>
                <Text style={styles.stepText}>
                    Paso {currentStepIndex + 1} de {steps.length}
                </Text>
            </View>

            <ScrollView
                ref={scrollViewRef}
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* Main Currency Step */}
                {currentStep === 'mainCurrency' && (
                    <View style={styles.stepContent}>
                        <View style={styles.stepHeader}>
                            <Ionicons name="cash" size={48} color={colors.primary} />
                            <Text style={styles.stepTitle}>Moneda Principal</Text>
                            <Text style={styles.stepDescription}>
                                Selecciona tu moneda principal para todas tus finanzas
                            </Text>
                        </View>
                        <SearchBar
                            value={searchMainCurrency}
                            onChange={setSearchMainCurrency}
                            placeholder="Buscar moneda..."
                            containerStyle={{ marginBottom: 12 }}
                        />

                        <ScrollView
                            horizontal={false}
                            showsVerticalScrollIndicator={false}
                            style={styles.currencyListContainer}
                        >
                            <View style={styles.currencyListGrid}>
                                {CURRENCIES.filter(c => {
                                    const term = searchMainCurrency.trim().toLowerCase();
                                    if (!term) return true;
                                    return (`${c.code} ${c.name} ${c.symbol}`).toLowerCase().includes(term);
                                }).map(currency => (
                                    <TouchableOpacity
                                        key={currency.code}
                                        style={[
                                            styles.currencyListOption,
                                            mainCurrency === currency.code && styles.currencyListOptionActive,
                                            { borderColor: mainCurrency === currency.code ? colors.primary : colors.border },
                                        ]}
                                        onPress={() => setMainCurrency(currency.code)}
                                    >
                                        <View style={styles.currencyContent}>
                                            <Text style={[
                                                styles.currencyCode,
                                                mainCurrency === currency.code && styles.currencyCodeActive,
                                            ]}>
                                                {currency.code}
                                            </Text>
                                            <Text style={[
                                                styles.currencySymbol,
                                                mainCurrency === currency.code && styles.currencySymbolActive,
                                            ]}>
                                                {currency.symbol}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                    </View>
                )}

                {/* Conversion Currency Step */}
                {currentStep === 'conversionCurrency' && (
                    <View style={styles.stepContent}>
                        <View style={styles.stepHeader}>
                            <Ionicons name="swap-horizontal" size={48} color={colors.primary} />
                            <Text style={styles.stepTitle}>Moneda de Conversión</Text>
                            <Text style={styles.stepDescription}>
                                Selecciona una moneda secundaria para comparar valores (no puede ser la principal)
                            </Text>
                        </View>
                        <SearchBar
                            value={searchConversionCurrency}
                            onChange={setSearchConversionCurrency}
                            placeholder="Buscar moneda..."
                            containerStyle={{ marginBottom: 12 }}
                        />

                        <ScrollView
                            horizontal={false}
                            showsVerticalScrollIndicator={false}
                            style={styles.currencyListContainer}
                        >
                            <View style={styles.currencyListGrid}>
                                {CURRENCIES.filter(c => c.code !== mainCurrency).filter(c => {
                                    const term = searchConversionCurrency.trim().toLowerCase();
                                    if (!term) return true;
                                    return (`${c.code} ${c.name} ${c.symbol}`).toLowerCase().includes(term);
                                }).map(currency => (
                                    <TouchableOpacity
                                        key={currency.code}
                                        style={[
                                            styles.currencyListOption,
                                            conversionCurrency === currency.code && styles.currencyListOptionActive,
                                            { borderColor: conversionCurrency === currency.code ? colors.primary : colors.border },
                                        ]}
                                        onPress={() => setConversionCurrencyState(currency.code)}
                                    >
                                        <View style={styles.currencyContent}>
                                            <Text style={[
                                                styles.currencyCode,
                                                conversionCurrency === currency.code && styles.currencyCodeActive,
                                            ]}>
                                                {currency.code}
                                            </Text>
                                            <Text style={[
                                                styles.currencySymbol,
                                                conversionCurrency === currency.code && styles.currencySymbolActive,
                                            ]}>
                                                {currency.symbol}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                    </View>
                )}

                {/* First Account Step */}
                {currentStep === 'firstAccount' && (
                    <View style={styles.stepContent}>
                        <View style={styles.stepHeader}>
                            <Ionicons name="wallet" size={48} color={colors.primary} />
                            <Text style={styles.stepTitle}>Tu Primera Cuenta</Text>
                            <Text style={styles.stepDescription}>
                                Crea tu primera cuenta bancaria o de efectivo
                            </Text>
                        </View>

                        <Card style={styles.formCard}>
                            <Text style={styles.label}>Nombre de la Cuenta</Text>
                            <TextInput
                                style={[styles.input, { color: colors.textPrimary, borderColor: colors.border }]}
                                placeholder="Mi Cuenta Principal"
                                placeholderTextColor={colors.textTertiary}
                                value={accountTitle}
                                onChangeText={setAccountTitle}
                            />

                            <Text style={styles.label}>Tipo de Cuenta</Text>
                            <View style={styles.typeSelector}>
                                {ACCOUNT_TYPES.map(type => (
                                    <TouchableOpacity
                                        key={type.id}
                                        style={[
                                            styles.typeOption,
                                            accountType === type.id && styles.typeOptionActive,
                                            { borderColor: accountType === type.id ? colors.primary : colors.border },
                                        ]}
                                        onPress={() => setAccountType(type.id)}
                                    >
                                        <Ionicons name={type.icon as any} size={24} color={accountType === type.id ? colors.primary : colors.textSecondary} />
                                        <Text style={[styles.typeOptionText, accountType === type.id && styles.typeOptionTextActive]}>
                                            {type.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.label}>Saldo Inicial</Text>
                            <View style={styles.currencyInput}>
                                <Text style={styles.currencyPrefix}>{mainCurrency}</Text>
                                <TextInput
                                    style={[styles.input, styles.inputFlex, { color: colors.textPrimary, borderColor: colors.border }]}
                                    placeholder="0.00"
                                    placeholderTextColor={colors.textTertiary}
                                    value={accountBalance}
                                    onChangeText={setAccountBalance}
                                    keyboardType="decimal-pad"
                                />
                            </View>

                            <Text style={styles.label}>Icono y Color</Text>
                            <View style={styles.previewContainer}>
                                <View style={[styles.iconPreview, { backgroundColor: accountIconColor }]}>
                                    <Ionicons name={accountIcon as any} size={40} color="#FFFFFF" />
                                </View>
                                <Text style={styles.previewLabel}>Vista previa</Text>
                            </View>

                            <Text style={styles.sectionLabel}>Seleccionar Icono</Text>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={styles.horizontalScroll}
                                contentContainerStyle={styles.horizontalScrollContent}
                            >
                                {ACCOUNT_ICONS.map(icon => (
                                    <TouchableOpacity
                                        key={icon}
                                        style={[
                                            styles.iconOptionBox,
                                            {
                                                backgroundColor: icon === accountIcon ? `${accountIconColor}20` : colors.backgroundSecondary,
                                                borderColor: icon === accountIcon ? accountIconColor : colors.border,
                                                borderWidth: icon === accountIcon ? 3 : 2,
                                            },
                                        ]}
                                        onPress={() => setAccountIcon(icon)}
                                    >
                                        <Ionicons name={icon as any} size={32} color={accountIconColor} />
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <Text style={styles.sectionLabel}>Seleccionar Color</Text>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={styles.horizontalScroll}
                                contentContainerStyle={styles.horizontalScrollContent}
                            >
                                {ICON_COLORS.map(color => (
                                    <TouchableOpacity
                                        key={color}
                                        style={[
                                            styles.colorOptionBox,
                                            {
                                                backgroundColor: color,
                                                borderWidth: accountIconColor === color ? 4 : 2,
                                                borderColor: accountIconColor === color ? colors.textPrimary : colors.border,
                                            },
                                        ]}
                                        onPress={() => setAccountIconColor(color)}
                                    />
                                ))}
                            </ScrollView>
                        </Card>
                    </View>
                )}

                {/* First Goal Step */}
                {currentStep === 'firstGoal' && (
                    <View style={styles.stepContent}>
                        <View style={styles.stepHeader}>
                            <Ionicons name="star" size={48} color={colors.primary} />
                            <Text style={styles.stepTitle}>Tu Primera Meta</Text>
                            <Text style={styles.stepDescription}>
                                Define tu primer objetivo financiero
                            </Text>
                        </View>

                        <Card style={styles.formCard}>
                            <Text style={styles.label}>Nombre de la Meta</Text>
                            <TextInput
                                style={[styles.input, { color: colors.textPrimary, borderColor: colors.border }]}
                                placeholder="Mi Primera Meta"
                                placeholderTextColor={colors.textTertiary}
                                value={goalName}
                                onChangeText={setGoalName}
                            />

                            <Text style={styles.label}>Monto Objetivo</Text>
                            <View style={styles.currencyInput}>
                                <Text style={styles.currencyPrefix}>{mainCurrency}</Text>
                                <TextInput
                                    style={[styles.input, styles.inputFlex, { color: colors.textPrimary, borderColor: colors.border }]}
                                    placeholder="0.00"
                                    placeholderTextColor={colors.textTertiary}
                                    value={goalTarget}
                                    onChangeText={setGoalTarget}
                                    keyboardType="decimal-pad"
                                />
                            </View>

                            <Text style={styles.label}>Monto Actual</Text>
                            <View style={styles.currencyInput}>
                                <Text style={styles.currencyPrefix}>{mainCurrency}</Text>
                                <TextInput
                                    style={[styles.input, styles.inputFlex, { color: colors.textPrimary, borderColor: colors.border }]}
                                    placeholder="0.00"
                                    placeholderTextColor={colors.textTertiary}
                                    value={goalCurrentAmount}
                                    onChangeText={setGoalCurrentAmount}
                                    keyboardType="decimal-pad"
                                />
                            </View>

                            <Text style={styles.label}>Icono y Color</Text>
                            <View style={styles.previewContainer}>
                                <View style={[styles.iconPreview, { backgroundColor: goalIconColor }]}>
                                    <Ionicons name={goalIcon as any} size={40} color="#FFFFFF" />
                                </View>
                                <Text style={styles.previewLabel}>Vista previa</Text>
                            </View>

                            <Text style={styles.sectionLabel}>Seleccionar Icono</Text>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={styles.horizontalScroll}
                                contentContainerStyle={styles.horizontalScrollContent}
                            >
                                {GOAL_ICONS.map(icon => (
                                    <TouchableOpacity
                                        key={icon}
                                        style={[
                                            styles.iconOptionBox,
                                            {
                                                backgroundColor: icon === goalIcon ? `${goalIconColor}20` : colors.backgroundSecondary,
                                                borderColor: icon === goalIcon ? goalIconColor : colors.border,
                                                borderWidth: icon === goalIcon ? 3 : 2,
                                            },
                                        ]}
                                        onPress={() => setGoalIcon(icon)}
                                    >
                                        <Ionicons name={icon as any} size={32} color={goalIconColor} />
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <Text style={styles.sectionLabel}>Seleccionar Color</Text>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={styles.horizontalScroll}
                                contentContainerStyle={styles.horizontalScrollContent}
                            >
                                {ICON_COLORS.map(color => (
                                    <TouchableOpacity
                                        key={color}
                                        style={[
                                            styles.colorOptionBox,
                                            {
                                                backgroundColor: color,
                                                borderWidth: goalIconColor === color ? 4 : 2,
                                                borderColor: goalIconColor === color ? colors.textPrimary : colors.border,
                                            },
                                        ]}
                                        onPress={() => setGoalIconColor(color)}
                                    />
                                ))}
                            </ScrollView>
                        </Card>
                    </View>
                )}
            </ScrollView>

            {/* Navigation Buttons */}
            <View style={[styles.buttonContainer, { backgroundColor: colors.background }]}>
                <View style={styles.buttonWrapper}>
                    <Button
                        title={currentStepIndex === 0 ? 'Omitir' : 'Anterior'}
                        onPress={currentStepIndex === 0 ? onComplete : handlePrev}
                        variant="outline"
                        size="large"
                    />
                </View>

                <View style={styles.buttonWrapper}>
                    <Button
                        title={currentStepIndex === steps.length - 1 ? 'Finalizar' : 'Siguiente'}
                        onPress={handleStepComplete}
                        variant="solidPrimary"
                        size="large"
                    />
                </View>
            </View>
        </SafeAreaView>
    );
};

const createStyles = (colors: any) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        progressBarContainer: {
            height: 4,
            backgroundColor: colors.backgroundSecondary,
            overflow: 'hidden',
        },
        progressBar: {
            height: '100%',
            backgroundColor: colors.primary,
        },
        stepIndicator: {
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.lg,
            alignItems: 'center',
        },
        stepText: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.textSecondary,
        },
        content: {
            flex: 1,
        },
        contentContainer: {
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.lg,
            paddingBottom: spacing.xl,
        },
        stepContent: {
            gap: spacing.lg,
        },
        stepHeader: {
            alignItems: 'center',
            gap: spacing.md,
            marginBottom: spacing.lg,
        },
        stepTitle: {
            fontSize: 24,
            fontWeight: '700',
            color: colors.textPrimary,
            textAlign: 'center',
        },
        stepDescription: {
            fontSize: 16,
            color: colors.textSecondary,
            textAlign: 'center',
            lineHeight: 24,
        },
        formCard: {
            padding: spacing.lg,
            gap: spacing.lg,
        },
        label: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.textPrimary,
            marginBottom: spacing.sm,
        },
        input: {
            borderWidth: 1,
            borderRadius: borderRadius.md,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.md,
            fontSize: 16,
            fontWeight: '500',
        },
        inputFlex: {
            flex: 1,
        },
        currencyInput: {
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: borderRadius.md,
            paddingHorizontal: spacing.md,
            overflow: 'hidden',
        },
        currencyPrefix: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.textSecondary,
            marginRight: spacing.sm,
        },
        currencyGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: spacing.md,
        },
        currencyOption: {
            flex: 1,
            minWidth: '30%',
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.md,
            borderRadius: borderRadius.md,
            borderWidth: 2,
            backgroundColor: colors.backgroundSecondary,
            alignItems: 'center',
            justifyContent: 'center',
        },
        currencyOptionActive: {
            backgroundColor: `${colors.primary}20`,
        },
        currencyOptionText: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.textSecondary,
        },
        currencyOptionTextActive: {
            color: colors.primary,
        },
        typeSelector: {
            flexDirection: 'row',
            gap: spacing.md,
        },
        typeOption: {
            flex: 1,
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.md,
            borderRadius: borderRadius.md,
            borderWidth: 2,
            backgroundColor: colors.backgroundSecondary,
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.sm,
        },
        typeOptionActive: {
            backgroundColor: `${colors.primary}20`,
        },
        typeOptionText: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.textSecondary,
            textAlign: 'center',
        },
        typeOptionTextActive: {
            color: colors.primary,
        },
        iconButton: {
            borderWidth: 1,
            borderRadius: borderRadius.md,
            paddingVertical: spacing.lg,
            paddingHorizontal: spacing.md,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.md,
        },
        iconButtonText: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.textSecondary,
        },
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: spacing.lg,
        },
        iconPickerModal: {
            maxHeight: height * 0.85,
            padding: spacing.lg,
            gap: spacing.lg,
            width: '100%',
            borderRadius: borderRadius.lg,
            maxWidth: 500,
        },
        modalTitle: {
            fontSize: 20,
            fontWeight: '700',
            color: colors.textPrimary,
            textAlign: 'center',
            flex: 1,
        },
        iconGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: spacing.md,
            justifyContent: 'center',
        },
        iconOption: {
            width: '23%',
            aspectRatio: 1,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: borderRadius.md,
            backgroundColor: colors.backgroundSecondary,
            borderWidth: 2,
            borderColor: colors.border,
        },
        colorPicker: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: spacing.md,
            justifyContent: 'space-between',
        },
        colorOption: {
            width: '22%',
            aspectRatio: 1,
            borderRadius: borderRadius.md,
            borderWidth: 3,
        },
        selector: {
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderRadius: borderRadius.md,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.md,
            backgroundColor: colors.backgroundSecondary,
        },
        selectorLabel: {
            fontSize: 16,
            color: colors.textPrimary,
            fontWeight: '500',
        },
        categoryGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: spacing.md,
        },
        categoryItem: {
            flex: 1,
            minWidth: '45%',
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.md,
            borderRadius: borderRadius.md,
            borderWidth: 2,
            backgroundColor: colors.backgroundSecondary,
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.sm,
            aspectRatio: 1,
        },
        categoryItemActive: {
            backgroundColor: `${colors.primary}20`,
        },
        categoryItemText: {
            fontSize: 12,
            fontWeight: '600',
            color: colors.textPrimary,
            textAlign: 'center',
        },
        frequencySelector: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: spacing.md,
        },
        freqOption: {
            flex: 1,
            minWidth: '45%',
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.md,
            borderRadius: borderRadius.md,
            borderWidth: 2,
            backgroundColor: colors.backgroundSecondary,
            alignItems: 'center',
            justifyContent: 'center',
        },
        freqOptionActive: {
            backgroundColor: `${colors.primary}20`,
        },
        freqOptionText: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.textSecondary,
            textAlign: 'center',
        },
        freqOptionTextActive: {
            color: colors.primary,
        },
        buttonContainer: {
            flexDirection: 'row',
            gap: spacing.md,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.lg,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            justifyContent: 'space-between',
        },
        buttonWrapper: {
            flex: 0.48,
        },
        modalHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: spacing.lg,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            marginBottom: spacing.lg,
        },
        closeButton: {
            width: 44,
            height: 44,
            borderRadius: borderRadius.md,
            backgroundColor: colors.backgroundSecondary,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.border,
        },
        iconGridScroll: {
            flex: 1,
            paddingRight: spacing.sm,
        },
        sectionLabel: {
            fontSize: 16,
            fontWeight: '700',
            color: colors.textPrimary,
            marginBottom: spacing.md,
            marginTop: spacing.lg,
        },
        colorPickerGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: spacing.lg,
            marginBottom: spacing.lg,
            justifyContent: 'center',
        },
        colorOptionLarge: {
            width: '20%',
            aspectRatio: 1,
            borderRadius: borderRadius.lg,
            minWidth: 60,
        },
        previewContainer: {
            alignItems: 'center',
            gap: spacing.md,
            paddingVertical: spacing.lg,
            paddingHorizontal: spacing.md,
            borderRadius: borderRadius.md,
            backgroundColor: colors.backgroundSecondary,
            marginBottom: spacing.lg,
        },
        iconPreview: {
            width: 80,
            height: 80,
            borderRadius: borderRadius.md,
            justifyContent: 'center',
            alignItems: 'center',
        },
        previewLabel: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.textSecondary,
        },
        horizontalScroll: {
            marginVertical: spacing.sm,
        },
        horizontalScrollContent: {
            paddingHorizontal: spacing.md,
            gap: spacing.md,
            alignItems: 'center',
            justifyContent: 'center',
        },
        iconOptionBox: {
            width: 64,
            height: 64,
            borderRadius: borderRadius.lg,
            justifyContent: 'center',
            alignItems: 'center',
        },
        colorOptionBox: {
            width: 64,
            height: 64,
            borderRadius: borderRadius.lg,
        },
        currencyListContainer: {
            flex: 1,
        },
        currencyListGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: spacing.md,
            padding: 0,
            justifyContent: 'center',
        },
        currencyListOption: {
            width: '30%',
            minWidth: 100,
            paddingVertical: spacing.lg,
            paddingHorizontal: spacing.md,
            borderRadius: borderRadius.md,
            borderWidth: 2,
            backgroundColor: colors.backgroundSecondary,
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.sm,
        },
        currencyListOptionActive: {
            backgroundColor: `${colors.primary}20`,
        },
        currencyContent: {
            alignItems: 'center',
            gap: spacing.xs,
        },
        currencyCode: {
            fontSize: 16,
            fontWeight: '700',
            color: colors.textSecondary,
        },
        currencyCodeActive: {
            color: colors.primary,
        },
        currencySymbol: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.textTertiary,
        },
        currencySymbolActive: {
            color: colors.primary,
        },
    });

