import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography, useTheme } from '../theme';

interface SettingItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  onPress: () => void;
}

export const SettingsScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const SETTINGS_ITEMS: SettingItem[] = [
    {
      id: 'format',
      title: 'Formato',
      subtitle: 'Moneda principal, formato de moneda',
      icon: 'text',
      color: '#3B82F6',
      onPress: () => navigation.navigate('FormatSettings'),
    },
    {
      id: 'styles',
      title: 'Estilos y elementos',
      subtitle: 'Color, decoraciones y temas',
      icon: 'color-palette',
      color: '#8B5CF6',
      onPress: () => navigation.navigate('StylesSettings'),
    },
    {
      id: 'notifications',
      title: 'Notificaciones',
      subtitle: 'Estado, programa',
      icon: 'notifications',
      color: '#EC4899',
      onPress: () => navigation.navigate('NotificationsSettings'),
    },
    {
      id: 'security',
      title: 'Seguridad',
      subtitle: 'Protección de la aplicación contra extraños',
      icon: 'lock-closed',
      color: '#10B981',
      onPress: () => navigation.navigate('SecuritySettings'),
    },
    {
      id: 'rates',
      title: 'Tipos de cambio',
      subtitle: 'Actualizar y editar',
      icon: 'swap-horizontal',
      color: '#F59E0B',
      onPress: () => navigation.navigate('ExchangeRatesSettings'),
    },
    {
      id: 'data',
      title: 'Datos',
      subtitle: 'Importar, exportar y respaldar datos',
      icon: 'cloud-download',
      color: '#10B981',
      onPress: () => navigation.navigate('Data'),
    },
  ];

  const renderSettingItem = (item: SettingItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.settingItem}
      onPress={item.onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}>
        <Ionicons name={item.icon as any} size={24} color={item.color} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{item.title}</Text>
        <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          {SETTINGS_ITEMS.map((item, index) => (
            <View key={item.id}>
              {renderSettingItem(item)}
              {index < SETTINGS_ITEMS.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
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
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 12,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.md,
    },
    settingContent: { flex: 1 },
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
    divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  });

