import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography, useTheme } from '../theme';
import { useAppStore, FREE_LIMITS } from '../store/useAppStore';

interface ProFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
}

const PRO_FEATURES: ProFeature[] = [
  {
    id: 'unlimited',
    title: 'Cuentas ilimitadas',
    description: 'Crea todas las cuentas que necesites sin restricciones',
    icon: 'wallet',
  },
  {
    id: 'advanced-reports',
    title: 'Reportes avanzados',
    description: 'Acceso a análisis detallados y gráficos personalizados',
    icon: 'bar-chart',
  },
  {
    id: 'budget-tracking',
    title: 'Seguimiento de presupuesto',
    description: 'Herramientas avanzadas para controlar tus presupuestos',
    icon: 'pie-chart',
  },
  {
    id: 'recurring-transactions',
    title: 'Transacciones recurrentes',
    description: 'Automatiza tus pagos y ingresos periódicos',
    icon: 'refresh',
  },
  {
    id: 'data-export',
    title: 'Exportar datos',
    description: 'Descarga tus datos en múltiples formatos (CSV, PDF, Excel)',
    icon: 'download',
  },
  {
    id: 'priority-support',
    title: 'Soporte prioritario',
    description: 'Acceso a soporte técnico prioritario 24/7',
    icon: 'headset',
  },
  {
    id: 'no-ads',
    title: 'Sin anuncios',
    description: 'Disfruta de una experiencia sin interrupciones publicitarias',
    icon: 'close-circle',
  },
  {
    id: 'custom-categories',
    title: 'Categorías personalizadas',
    description: 'Crea tus propias categorías para mejor organización',
    icon: 'create',
  },
];

// Pricing is intentionally removed for demo mode — use the toggle below to enable/disable Pro locally

export const GetProScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  // Get current counts from store to show comparison
  const accountsCount = useAppStore(state => state.accounts.length);
  const goalsCount = useAppStore(state => state.goals.length);
  const budgetsCount = useAppStore(state => state.budgets.length);
  const recurringCount = useAppStore(state => state.recurringPayments.length);
  const isPro = useAppStore(state => state.isPro);

  const setPro = useAppStore(state => state.setPro);
  // Toggle Pro flag locally for demo: this does not perform any native purchase
  const handleSetPro = (value: boolean) => {
    setPro(value);
    Alert.alert(value ? 'Pro habilitado (demo)' : 'Pro deshabilitado');
  };

  // renderFeature removed — features are shown in the comparison table instead

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Ionicons name="star" size={60} color={colors.primary} />
          <Text style={styles.headerTitle}>Kontto Pro</Text>
          <Text style={styles.headerSubtitle}>
            Desbloquea todas las funciones premium y lleva tu gestión financiera al siguiente nivel
          </Text>
        </View>
        {/* Plan actual (badge con subtítulo) */}
        <View style={[
          styles.planBadge,
          isPro
            ? { backgroundColor: `${colors.success}18`, borderColor: colors.success }
            : { backgroundColor: `${colors.primary}12`, borderColor: colors.primary },
        ]}>
          <Ionicons name={isPro ? 'checkmark-circle' : 'information-circle'} size={18} color={isPro ? colors.success : colors.primary} style={styles.planBadgeIcon} />
          <View style={styles.planBadgeTextContainer}>
            <Text style={[styles.planBadgeText, isPro ? { color: colors.success } : { color: colors.primary }]}>
              {isPro ? 'Pro activo' : 'Plan gratuito activo'}
            </Text>
            <Text style={[styles.planBadgeSubText, isPro ? { color: colors.success } : { color: colors.textSecondary }]}>
              {isPro
                ? 'Tienes acceso a todas las funciones.'
                : 'Mejora a Pro para disfrutar de funciones avanzadas y recursos ilimitados.'}
            </Text>
          </View>
        </View>

        {/* Comparison Section: Free vs Pro (resources + premium features) */}
        <View style={styles.comparisonSection}>
          <Text style={styles.sectionTitle}>Comparación: Gratis vs Pro</Text>

          {/* Table header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.columnTitle, { flex: 1 }]}>Recurso / Función</Text>
            <Text style={[styles.columnTitle, { width: 96, textAlign: 'center' }]}>Gratis</Text>
            <Text style={[styles.columnTitle, { width: 96, textAlign: 'center' }]}>Pro</Text>
          </View>

          {/* Resources rows */}
          <View style={styles.comparisonContainer}>
            {[
              { key: 'accounts', label: 'Cuentas', used: accountsCount, limit: FREE_LIMITS.accounts },
              { key: 'goals', label: 'Metas', used: goalsCount, limit: FREE_LIMITS.goals },
              { key: 'budgets', label: 'Presupuestos', used: budgetsCount, limit: FREE_LIMITS.budgets },
              { key: 'recurring', label: 'Pagos programados', used: recurringCount, limit: FREE_LIMITS.recurringPayments },
            ].map((item) => {
              const atLimit = item.used >= item.limit;
              return (
                <View key={item.key} style={styles.tableRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.resourceName}>{item.label}</Text>
                  </View>
                  <View style={[styles.cellCenter, { width: 96 }]}>
                    <Text style={[styles.freeValue, atLimit && { color: colors.error }]}
                    >
                      {item.used}/{item.limit}
                    </Text>
                  </View>
                  <View style={[styles.cellCenter, { width: 96 }]}>
                    <Text style={styles.proValue}>Ilimitado</Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Premium features rows */}
          <View style={[styles.comparisonContainer, { marginTop: spacing.md }]}>
            {PRO_FEATURES
              .filter(f => !['unlimited', 'recurring-transactions', 'budget-tracking'].includes(f.id))
              .map((feature) => (
                <View key={feature.id} style={styles.tableRowFeature}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.featureName}>{feature.title}</Text>
                  </View>

                  <View style={[styles.cellCenter, { width: 96 }]}>
                    <Text style={styles.freeValue}>—</Text>
                  </View>

                  <View style={[styles.cellCenter, { width: 96 }]}>
                    <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                  </View>
                </View>
              ))}
          </View>

          {/* comparisonNote removed to keep table compact */}
        </View>

        {/* Current Plan Info removed (now displayed as badge above) */}

        {/* Features Section removed: premium features are displayed inside the comparison table above */}

        {/* Demo Pro Toggle Section: enable/disable Pro locally (no native purchases) */}
        <View style={styles.pricingSection}>
          <Text style={styles.sectionTitle}>Pro (modo demo)</Text>
          <View style={styles.planStatusSimpleWrap}>
            <Text style={styles.planStatusSimpleText}>Activa o desactiva Pro para demo. Esto no realiza compras reales.</Text>
            <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm }}>
              <TouchableOpacity
                style={[styles.purchaseButton, { flex: 1, backgroundColor: isPro ? colors.error : colors.primary, marginRight: spacing.sm }]}
                onPress={() => handleSetPro(false)}
              >
                <Text style={[styles.purchaseButtonText, { color: '#fff' }]}>Deshabilitar Pro</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.purchaseButton, { flex: 1, backgroundColor: isPro ? colors.primary : `${colors.primary}22`, borderWidth: 1, borderColor: colors.primary }]}
                onPress={() => handleSetPro(true)}
              >
                <Text style={[styles.purchaseButtonText, { color: isPro ? '#fff' : colors.primary }]}>{isPro ? 'Pro activo' : 'Habilitar Pro (demo)'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

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
  headerSection: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  headerSubtitle: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  // currentPlanCard/styles removed; plan status is shown in badge above the comparison table
  featuresSection: {
    paddingHorizontal: spacing.md,
    marginVertical: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  featuresContainer: {
    gap: spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  featureTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  featureDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  pricingSection: {
    paddingHorizontal: spacing.md,
    marginVertical: spacing.lg,
  },
  pricingContainer: {
    gap: spacing.md,
  },
  pricingCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  badgeText: {
    color: '#FFF',
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  planName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: spacing.md,
  },
  price: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  period: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  savings: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.md,
  },
  purchaseButton: {
    paddingVertical: spacing.md,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  purchaseButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
  },
  faqSection: {
    paddingHorizontal: spacing.md,
    marginVertical: spacing.lg,
  },
  // contactSection styles removed
  bottomSpacing: {
    height: spacing.xl,
  },
  comparisonSection: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  comparisonContainer: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  resourceName: {
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
  },
  resourceValues: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  resourceValue: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.textSecondary,
  },
  proValue: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },
  comparisonNote: {
    marginTop: spacing.md,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginTop: spacing.sm,
  },
  columnTitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.weights.semibold,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableRowFeature: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cellCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  freeValue: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
  },
  featureName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  // featureDesc removed to keep comparison table compact
  planStatusCard: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  planStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planStatusTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  planStatusSub: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  planStatusButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planStatusButtonText: {
    color: '#fff',
    fontWeight: typography.weights.semibold,
  },
  planStatusSimpleWrap: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    backgroundColor: 'transparent',
    alignItems: 'flex-start',
  },
  planStatusSimpleText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  planBadge: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  planBadgeIcon: {
    marginRight: spacing.sm,
  },
  planBadgeTextContainer: {
    flexDirection: 'column',
  },
  planBadgeText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
  },
  planBadgeSubText: {
    fontSize: typography.sizes.sm,
    marginTop: spacing.xs,
  },
});
