import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    Alert,
    TextInput,
    FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography, useTheme } from '../theme';

interface ExchangeRate {
    id: string;
    from: string;
    to: string;
    rate: number;
    lastUpdated: string;
}

export const ExchangeRatesSettingsScreen = ({ navigation }: any) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const [autoUpdate, setAutoUpdate] = useState(true);
    const [updateFrequency, setUpdateFrequency] = useState('daily');
    const [showAddRate, setShowAddRate] = useState(false);
    const [newFromCurrency, setNewFromCurrency] = useState('');
    const [newToCurrency, setNewToCurrency] = useState('');
    const [newRate, setNewRate] = useState('');

    const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([
        {
            id: '1',
            from: 'USD',
            to: 'EUR',
            rate: 0.92,
            lastUpdated: 'Hoy a las 10:30',
        },
        {
            id: '2',
            from: 'USD',
            to: 'MXN',
            rate: 17.05,
            lastUpdated: 'Hoy a las 10:30',
        },
        {
            id: '3',
            from: 'USD',
            to: 'ARS',
            rate: 850.5,
            lastUpdated: 'Hoy a las 10:30',
        },
    ]);

    const handleAddRate = () => {
        if (!newFromCurrency || !newToCurrency || !newRate) {
            Alert.alert('Error', 'Completa todos los campos');
            return;
        }

        const newRateObj: ExchangeRate = {
            id: String(exchangeRates.length + 1),
            from: newFromCurrency.toUpperCase(),
            to: newToCurrency.toUpperCase(),
            rate: parseFloat(newRate),
            lastUpdated: 'Justo ahora',
        };

        setExchangeRates([...exchangeRates, newRateObj]);
        setNewFromCurrency('');
        setNewToCurrency('');
        setNewRate('');
        setShowAddRate(false);
        Alert.alert('Éxito', 'Tipo de cambio agregado');
    };

    const handleDeleteRate = (id: string) => {
        Alert.alert(
            'Eliminar tipo de cambio',
            '¿Estás seguro?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: () => {
                        setExchangeRates(exchangeRates.filter((rate) => rate.id !== id));
                        Alert.alert('Éxito', 'Tipo de cambio eliminado');
                    },
                },
            ]
        );
    };

    const handleUpdateAllRates = () => {
        Alert.alert('Actualizando...', 'Se están actualizando todos los tipos de cambio');
        setTimeout(() => {
            Alert.alert('Éxito', 'Tipos de cambio actualizados');
        }, 1500);
    };

    const frequencies = [
        { id: 'hourly', label: 'Cada hora' },
        { id: 'daily', label: 'Diariamente' },
        { id: 'weekly', label: 'Semanalmente' },
    ];

    const renderRateItem = (item: ExchangeRate) => (
        <View style={styles.rateItem}>
            <View style={styles.rateInfo}>
                <View style={styles.rateHeader}>
                    <Text style={styles.rateTitle}>
                        {item.from} → {item.to}
                    </Text>
                    <Text style={styles.rateValue}>{item.rate.toFixed(2)}</Text>
                </View>
                <Text style={styles.rateUpdated}>{item.lastUpdated}</Text>
            </View>
            <TouchableOpacity onPress={() => handleDeleteRate(item.id)}>
                <Ionicons name="trash" size={20} color="#EF4444" />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Actualización Automática */}
                <View style={styles.section}>
                    <View style={styles.settingRow}>
                        <View>
                            <Text style={styles.settingTitle}>Actualización Automática</Text>
                            <Text style={styles.settingSubtitle}>Actualizar tipos de cambio automáticamente</Text>
                        </View>
                        <Switch
                            value={autoUpdate}
                            onValueChange={setAutoUpdate}
                            trackColor={{ false: colors.border, true: `${colors.primary}50` }}
                            thumbColor={autoUpdate ? colors.primary : colors.textSecondary}
                        />
                    </View>
                </View>

                {/* Frecuencia de Actualización */}
                {autoUpdate && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Frecuencia</Text>
                        {frequencies.map((freq) => (
                            <TouchableOpacity
                                key={freq.id}
                                style={[
                                    styles.frequencyOption,
                                    updateFrequency === freq.id && styles.frequencyOptionSelected,
                                ]}
                                onPress={() => setUpdateFrequency(freq.id)}
                            >
                                <Text
                                    style={[
                                        styles.frequencyOptionText,
                                        updateFrequency === freq.id && styles.frequencyOptionTextSelected,
                                    ]}
                                >
                                    {freq.label}
                                </Text>
                                {updateFrequency === freq.id && (
                                    <Ionicons
                                        name="checkmark-circle"
                                        size={20}
                                        color={colors.primary}
                                    />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Actualizar Ahora */}
                <View style={styles.section}>
                    <TouchableOpacity style={styles.updateButton} onPress={handleUpdateAllRates}>
                        <Ionicons name="refresh" size={20} color="white" />
                        <Text style={styles.updateButtonText}>Actualizar Todos Ahora</Text>
                    </TouchableOpacity>
                </View>

                {/* Tipos de Cambio Configurados */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Tipos de Cambio</Text>
                    {exchangeRates.length > 0 ? (
                        <FlatList
                            data={exchangeRates}
                            renderItem={({ item }) => renderRateItem(item)}
                            keyExtractor={(item) => item.id}
                            scrollEnabled={false}
                            ItemSeparatorComponent={() => <View style={styles.separator} />}
                        />
                    ) : (
                        <Text style={styles.emptyText}>No hay tipos de cambio configurados</Text>
                    )}
                </View>

                {/* Agregar Nuevo Tipo de Cambio */}
                <View style={styles.section}>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => setShowAddRate(!showAddRate)}
                    >
                        <Ionicons name={showAddRate ? 'chevron-up' : 'add-circle'} size={20} color={colors.primary} />
                        <Text style={styles.addButtonText}>
                            {showAddRate ? 'Cancelar' : 'Agregar Tipo de Cambio'}
                        </Text>
                    </TouchableOpacity>

                    {showAddRate && (
                        <View style={styles.addRateCard}>
                            <TextInput
                                style={styles.input}
                                placeholder="De (USD)"
                                placeholderTextColor={colors.textSecondary}
                                maxLength={3}
                                value={newFromCurrency}
                                onChangeText={setNewFromCurrency}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Para (EUR)"
                                placeholderTextColor={colors.textSecondary}
                                maxLength={3}
                                value={newToCurrency}
                                onChangeText={setNewToCurrency}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Tipo de cambio"
                                placeholderTextColor={colors.textSecondary}
                                keyboardType="decimal-pad"
                                value={newRate}
                                onChangeText={setNewRate}
                            />
                            <View style={styles.addRateButtons}>
                                <TouchableOpacity
                                    style={[styles.addRateButton, { backgroundColor: colors.border }]}
                                    onPress={() => {
                                        setShowAddRate(false);
                                        setNewFromCurrency('');
                                        setNewToCurrency('');
                                        setNewRate('');
                                    }}
                                >
                                    <Text style={[styles.addRateButtonText, { color: colors.textPrimary }]}>
                                        Cancelar
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.addRateButton, { backgroundColor: colors.primary }]}
                                    onPress={handleAddRate}
                                >
                                    <Text style={[styles.addRateButtonText, { color: 'white' }]}>
                                        Agregar
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>

                <View style={{ height: 60 }} />
            </ScrollView>
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
        sectionTitle: {
            fontSize: typography.sizes.lg,
            fontWeight: typography.weights.bold as any,
            color: colors.textPrimary,
            marginBottom: spacing.md,
        },
        settingRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.md,
            backgroundColor: colors.backgroundSecondary,
            borderRadius: 12,
        },
        settingTitle: {
            fontSize: typography.sizes.base,
            fontWeight: typography.weights.semibold as any,
            color: colors.textPrimary,
            marginBottom: spacing.xs,
        },
        settingSubtitle: {
            fontSize: typography.sizes.sm,
            color: colors.textSecondary,
        },
        frequencyOption: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.md,
            backgroundColor: colors.backgroundSecondary,
            borderRadius: 12,
            marginBottom: spacing.md,
            borderWidth: 2,
            borderColor: colors.border,
        },
        frequencyOptionSelected: {
            borderColor: colors.primary,
            backgroundColor: `${colors.primary}10`,
        },
        frequencyOptionText: {
            fontSize: typography.sizes.base,
            fontWeight: typography.weights.semibold as any,
            color: colors.textSecondary,
        },
        frequencyOptionTextSelected: {
            color: colors.primary,
        },
        updateButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.md,
            backgroundColor: colors.primary,
            borderRadius: 12,
            gap: spacing.md,
        },
        updateButtonText: {
            fontSize: typography.sizes.base,
            fontWeight: typography.weights.semibold as any,
            color: 'white',
        },
        rateItem: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.md,
            backgroundColor: colors.backgroundSecondary,
            borderRadius: 12,
        },
        rateInfo: { flex: 1 },
        rateHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: spacing.xs,
        },
        rateTitle: {
            fontSize: typography.sizes.base,
            fontWeight: typography.weights.semibold as any,
            color: colors.textPrimary,
        },
        rateValue: {
            fontSize: typography.sizes.base,
            fontWeight: typography.weights.bold as any,
            color: colors.primary,
        },
        rateUpdated: {
            fontSize: typography.sizes.sm,
            color: colors.textSecondary,
        },
        separator: {
            height: spacing.md,
        },
        emptyText: {
            fontSize: typography.sizes.base,
            color: colors.textSecondary,
            textAlign: 'center',
            paddingVertical: spacing.lg,
        },
        addButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.md,
            backgroundColor: colors.backgroundSecondary,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: colors.primary,
            gap: spacing.md,
        },
        addButtonText: {
            fontSize: typography.sizes.base,
            fontWeight: typography.weights.semibold as any,
            color: colors.primary,
        },
        addRateCard: {
            paddingVertical: spacing.lg,
            paddingHorizontal: spacing.md,
            backgroundColor: colors.backgroundSecondary,
            borderRadius: 12,
            marginTop: spacing.md,
            borderWidth: 2,
            borderColor: colors.primary,
        },
        input: {
            fontSize: typography.sizes.base,
            color: colors.textPrimary,
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.md,
            backgroundColor: colors.background,
            borderRadius: 8,
            marginBottom: spacing.md,
            borderWidth: 1,
            borderColor: colors.border,
        },
        addRateButtons: {
            flexDirection: 'row',
            gap: spacing.md,
        },
        addRateButton: {
            flex: 1,
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.md,
            borderRadius: 8,
            alignItems: 'center',
        },
        addRateButtonText: {
            fontSize: typography.sizes.base,
            fontWeight: typography.weights.semibold as any,
        },
    });
