import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography, useTheme } from '../theme';

interface MenuItem {
  id: string;
  title: string;
  icon: string;
  color: string;
  screen?: string;
  action?: () => void;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const MENU_SECTIONS: MenuSection[] = [
  {
    title: 'Mi Cuenta',
    items: [
      {
        id: 'profile',
        title: 'Perfil',
        icon: 'person-circle',
        color: '#3B82F6',
        screen: 'Profile',
      },
      {
        id: 'premium',
        title: 'Obtener Pro',
        icon: 'star',
        color: '#F59E0B',
        screen: 'GetPro',
      },
    ],
  },
  {
    title: 'Funcionalidades',
    items: [
      {
        id: 'scheduled',
        title: 'Pagos programados',
        icon: 'calendar',
        color: '#8B5CF6',
        screen: 'ScheduledPayments',
      },
      {
        id: 'budgets',
        title: 'Presupuestos',
        icon: 'wallet',
        color: '#06B6D4',
        screen: 'Budgets',
      },
    ],
  },
  {
    title: 'Información y Ayuda',
    items: [
      {
        id: 'settings',
        title: 'Ajustes',
        icon: 'settings',
        color: '#6B7280',
        screen: 'Settings',
      },
      {
        id: 'data',
        title: 'Datos',
        icon: 'cloud-download',
        color: '#10B981',
        screen: 'Data',
      },
      {
        id: 'support',
        title: 'Asistencia',
        icon: 'help-circle',
        color: '#F97316',
        action: () => {
          const email = 'info@hyped.center';
          const subject = encodeURIComponent('Asistencia - Kontto');
          const mailto = `mailto:${email}?subject=${subject}`;
          Linking.openURL(mailto).catch(() => {
            Alert.alert('Error', 'No se pudo abrir la aplicación de correo');
          });
        },
      },
      {
        id: 'team',
        title: 'Acerca de nuestro equipo',
        icon: 'people',
        color: '#EC4899',
        screen: 'About',
      },
      {
        id: 'privacy',
        title: 'Política de privacidad',
        icon: 'shield-checkmark',
        color: '#3B82F6',
        action: () => {
          Alert.alert('Privacidad', 'Lee nuestra política de privacidad');
        },
      },
      {
        id: 'terms',
        title: 'Condiciones de uso',
        icon: 'document-text',
        color: '#8B5CF6',
        action: () => {
          Alert.alert('Términos', 'Lee nuestras condiciones de uso');
        },
      },
    ],
  },
];

export const MoreScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  const handlePress = (item: MenuItem) => {
    if (item.screen) {
      navigation.navigate(item.screen);
    } else if (item.action) {
      item.action();
    }
  };

  const renderMenuItem = (item: MenuItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.menuItem}
      onPress={() => handlePress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.menuLeft}>
        <View style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}>
          <Ionicons name={item.icon as any} size={22} color={item.color} />
        </View>
        <View style={styles.menuContent}>
          <Text style={styles.menuTitle}>{item.title}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* Menu Sections */}
        {MENU_SECTIONS.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) => (
                <View key={item.id}>
                  {renderMenuItem(item)}
                  {itemIndex < section.items.length - 1 && (
                    <View style={styles.divider} />
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.bottomSpacing} />
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
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    paddingTop: spacing.xl,
  },
  headerTitle: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
  },
  section: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: spacing.xl + spacing.md,
  },
  bottomSpacing: {
    height: spacing.xl,
  },
});
