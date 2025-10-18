import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography, useTheme } from '../theme';

export const AboutScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleOpenLink = (url: string) => {
    Linking.openURL(url).catch((err) => console.error('Error opening link:', err));
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Logo y nombre */}
        <View style={styles.headerSection}>
          <View style={styles.logoContainer}>
            <Ionicons name="wallet" size={64} color={colors.primary} />
          </View>
          <Text style={styles.appName}>Kontto</Text>
          <Text style={styles.version}>Versión 1.0.0</Text>
        </View>

        {/* Descripción */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acerca de Kontto</Text>
          <Text style={styles.description}>
            Kontto es una aplicación móvil diseñada para ayudarte a gestionar tus finanzas personales de forma sencilla y eficiente.
          </Text>
        </View>

        {/* Características */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Características</Text>
          
          <View style={styles.featureItem}>
            <Ionicons name="wallet-outline" size={24} color={colors.primary} />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Gestión de Cuentas</Text>
              <Text style={styles.featureDescription}>
                Administra múltiples cuentas financieras en un solo lugar
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="swap-horizontal" size={24} color={colors.primary} />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Conversión de Monedas</Text>
              <Text style={styles.featureDescription}>
                Conversión automática de tasas de cambio en tiempo real
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="stats-chart" size={24} color={colors.primary} />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Análisis Detallado</Text>
              <Text style={styles.featureDescription}>
                Visualiza tus gastos e ingresos con gráficos detallados
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="star" size={24} color={colors.primary} />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Metas de Ahorro</Text>
              <Text style={styles.featureDescription}>
                Establece y monitorea tus metas financieras personales
              </Text>
            </View>
          </View>
        </View>

        {/* Información del desarrollador */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Desarrollador</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Desarrollado con ❤️</Text>
            <Text style={styles.infoText}>
              Kontto fue creada para simplificar la gestión de tus finanzas personales.
            </Text>
          </View>
        </View>

        {/* Enlaces útiles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Enlaces</Text>
          
          <TouchableOpacity 
            style={styles.linkButton}
            onPress={() => handleOpenLink('https://www.example.com/privacy')}
          >
            <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />
            <Text style={styles.linkText}>Política de Privacidad</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.linkButton}
            onPress={() => handleOpenLink('https://www.example.com/terms')}
          >
            <Ionicons name="document-text-outline" size={20} color={colors.primary} />
            <Text style={styles.linkText}>Términos de Servicio</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.linkButton}
            onPress={() => handleOpenLink('https://www.example.com/support')}
          >
            <Ionicons name="help-circle-outline" size={20} color={colors.primary} />
            <Text style={styles.linkText}>Soporte</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Créditos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Créditos</Text>
          <View style={styles.creditsCard}>
            <Text style={styles.creditsText}>
              • Iconos: Expo Icons{'\n'}
              • Framework: React Native{'\n'}
              • Tasas de Cambio: ExchangeRate API{'\n'}
            </Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
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
  headerSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  appName: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold as any,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  version: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
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
  description: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    alignItems: 'flex-start',
  },
  featureText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  featureTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold as any,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  featureDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  infoLabel: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold as any,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  infoText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginVertical: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: 12,
    gap: spacing.md,
  },
  linkText: {
    flex: 1,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium as any,
    color: colors.textPrimary,
  },
  creditsCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
  },
  creditsText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});
