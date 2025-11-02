import React, { useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography, useTheme } from '../theme';
import { useAppStore } from '../store/useAppStore';

export const StylesSettingsScreen = ({ navigation }: any) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    // Get from store
    const { theme, setTheme, accentColor, setAccentColor } = useAppStore();

    const themes = [
        { id: 'light', label: 'Claro', icon: 'sunny' },
        { id: 'dark', label: 'Oscuro', icon: 'moon' },
    ];

    const accentColors = [
        { id: 'blue', color: '#3B82F6', label: 'Azul' },
        { id: 'purple', color: '#8B5CF6', label: 'Púrpura' },
        { id: 'pink', color: '#EC4899', label: 'Rosa' },
        { id: 'green', color: '#10B981', label: 'Verde' },
        { id: 'orange', color: '#F59E0B', label: 'Naranja' },
        { id: 'red', color: '#EF4444', label: 'Rojo' },
    ];

    return (
        <View style={styles.container}>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Tema */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Tema</Text>
                    <View style={styles.optionsContainer}>
                        {themes.map((t) => (
                            <TouchableOpacity
                                key={t.id}
                                style={[
                                    styles.themeOption,
                                    theme === t.id && styles.themeOptionSelected,
                                ]}
                                onPress={() => setTheme(t.id as 'light' | 'dark')}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name={t.icon as any}
                                    size={28}
                                    color={theme === t.id ? colors.primary : colors.textSecondary}
                                />
                                <Text
                                    style={[
                                        styles.themeOptionText,
                                        theme === t.id && styles.themeOptionTextSelected,
                                    ]}
                                >
                                    {t.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Color Acentuado */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Color Acentuado</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.colorScrollContainer}
                    >
                        {accentColors.map((ac) => (
                            <TouchableOpacity
                                key={ac.id}
                                style={[
                                    styles.colorOptionHorizontal,
                                    { backgroundColor: ac.color },
                                    accentColor === ac.id && styles.colorOptionHorizontalSelected,
                                ]}
                                onPress={() => setAccentColor(ac.id)}
                                activeOpacity={0.8}
                            >
                                {accentColor === ac.id && (
                                    <Ionicons name="checkmark" size={24} color="white" weight="bold" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
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
        optionsContainer: {
            flexDirection: 'row',
            gap: spacing.md,
        },
        themeOption: {
            flex: 1,
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: spacing.lg,
            paddingHorizontal: spacing.md,
            backgroundColor: colors.backgroundSecondary,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: colors.border,
            gap: spacing.sm,
        },
        themeOptionSelected: {
            borderColor: colors.primary,
            backgroundColor: `${colors.primary}10`,
        },
        themeOptionText: {
            fontSize: typography.sizes.sm,
            fontWeight: typography.weights.semibold as any,
            color: colors.textSecondary,
        },
        themeOptionTextSelected: {
            color: colors.primary,
        },
        colorGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: spacing.md,
            marginBottom: spacing.md,
        },
        colorOption: {
            width: '32%',
            aspectRatio: 1,
            borderRadius: 12,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 2,
            borderColor: 'transparent',
        },
        colorOptionSelected: {
            borderColor: colors.textPrimary,
        },
        colorScrollContainer: {
            paddingHorizontal: spacing.md,
            gap: spacing.md,
            paddingBottom: spacing.md,
        },
        colorOptionHorizontal: {
            width: 70,
            height: 70,
            borderRadius: 12,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 3,
            borderColor: 'transparent',
            marginRight: spacing.sm,
        },
        colorOptionHorizontalSelected: {
            borderColor: 'white',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 5,
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
    });

