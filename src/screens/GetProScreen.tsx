import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography, useTheme } from '../theme';
import { useAppStore, FREE_LIMITS } from '../store/useAppStore';
import { useRevenueCat } from '@hooks/useRevenueCat';
import { OfficialRevenueCatPaywall } from '@components/OfficialRevenueCatPaywall';

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

export const GetProScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const [showPaywall, setShowPaywall] = useState(false);

  // Get current counts from store to show comparison
  const accountsCount = useAppStore(state => state.accounts.length);
  const goalsCount = useAppStore(state => state.goals.length);
  const budgetsCount = useAppStore(state => state.budgets.length);
  const recurringCount = useAppStore(state => state.recurringPayments.length);
  const isPro = useAppStore(state => state.isPro);

  // Get RevenueCat subscription status
  const { hasKottoPro, subscriptionRenewalDate, isInitializing } = useRevenueCat();

  // Small reusable simple pricing card to keep all boxes identical and minimal
  const PricingCard = ({
    icon,
    title,
    price,
    period,
    subtitle,
    onPress,
    featured = false,
  }: any) => (
    <View style={[styles.pricingCard, featured && styles.pricingCardFeaturedSimple, { borderColor: colors.border }]}>
      <View style={styles.planHeaderSimple}>
        <Ionicons name={icon} size={20} color={colors.primary} />
        <Text style={styles.planName}>{title}</Text>
      </View>

      <View style={styles.priceContainer}>
        <Text style={[styles.price, featured ? { color: colors.success } : { color: colors.primary }]}>{price}</Text>
        {period ? <Text style={styles.period}>{period}</Text> : null}
      </View>

      {subtitle ? <Text style={styles.subtitleSimple}>{subtitle}</Text> : null}

      <TouchableOpacity
        style={[styles.purchaseButton, { backgroundColor: featured ? colors.success : colors.primary }]}
        onPress={onPress}
      >
        <Text style={[styles.purchaseButtonText, { color: '#fff' }]}>
          {price ? `Comprar ${price}` : 'Obtener'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Show paywall modal when requested
  if (showPaywall) {
    return (
      <Modal
        visible={true}
        animationType="slide"
        onRequestClose={() => setShowPaywall(false)}
      >
        <OfficialRevenueCatPaywall
          onClose={() => setShowPaywall(false)}
          onPurchaseSuccess={() => setShowPaywall(false)}
        />
      </Modal>
    );
  }

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

        {/* Current Status */}
        {isInitializing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ marginTop: spacing.md, color: colors.textSecondary }}>
              Verificando suscripción...
            </Text>
          </View>
        ) : (
          <View
            style={[
              styles.planBadge,
              hasKottoPro || isPro
                ? { backgroundColor: `${colors.success}18`, borderColor: colors.success }
                : { backgroundColor: `${colors.primary}12`, borderColor: colors.primary },
            ]}
          >
            <Ionicons
              name={hasKottoPro || isPro ? 'checkmark-circle' : 'information-circle'}
              size={18}
              color={hasKottoPro || isPro ? colors.success : colors.primary}
              style={styles.planBadgeIcon}
            />
            <View style={styles.planBadgeTextContainer}>
              <Text
                style={[
                  styles.planBadgeText,
                  hasKottoPro || isPro ? { color: colors.success } : { color: colors.primary },
                ]}
              >
                {hasKottoPro || isPro ? 'Pro activo' : 'Plan gratuito activo'}
              </Text>
              <Text
                style={[
                  styles.planBadgeSubText,
                  hasKottoPro || isPro ? { color: colors.success } : { color: colors.textSecondary },
                ]}
              >
                {hasKottoPro || isPro
                  ? subscriptionRenewalDate
                    ? `Renovación: ${subscriptionRenewalDate.toLocaleDateString()}`
                    : 'Tienes acceso a todas las funciones.'
                  : 'Mejora a Pro para disfrutar de funciones avanzadas y recursos ilimitados.'}
              </Text>
            </View>
          </View>
        )}

        {/* Comparison Section: Free vs Pro */}
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
              {
                key: 'recurring',
                label: 'Pagos programados',
                used: recurringCount,
                limit: FREE_LIMITS.recurringPayments,
              },
            ].map((item) => {
              const atLimit = item.used >= item.limit;
              return (
                <View key={item.key} style={styles.tableRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.resourceName}>{item.label}</Text>
                  </View>
                  <View style={[styles.cellCenter, { width: 96 }]}>
                    <Text style={[styles.freeValue, atLimit && { color: colors.error }]}>
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
            {PRO_FEATURES.filter(f => !['unlimited', 'recurring-transactions', 'budget-tracking'].includes(f.id)).map(
              (feature) => (
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
              )
            )}
          </View>
        </View>

        {/* CTA Section */}
        {!isPro && !hasKottoPro && (
          <View style={styles.ctaSection}>
            <TouchableOpacity
              style={[styles.ctaButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowPaywall(true)}
            >
              <Ionicons name="lock-open" size={18} color="#FFF" />
              <Text style={styles.ctaButtonText}>Ver opciones de suscripción</Text>
              <Ionicons name="chevron-forward" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}

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
    marginBottom: spacing.md,
  },
  pricingCardFeatured: {
    borderWidth: 2,
    backgroundColor: `${colors.primary}08`,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  badge: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
    marginLeft: spacing.sm,
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
  savingsText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  discountBanner: {
    backgroundColor: `${colors.success}12`,
    borderRadius: 8,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginVertical: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  discountText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.success,
  },
  savingsCalculation: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  featuresList: {
    marginVertical: spacing.md,
    gap: spacing.sm,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  featureListText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    flex: 1,
  },
  purchaseButton: {
    paddingVertical: spacing.md,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  purchaseButtonFeatured: {
    paddingVertical: spacing.lg,
  },
  purchaseButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
  },
  pricingList: {
    gap: spacing.md,
  },
  planHeaderSimple: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  subtitleSimple: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  pricingCardFeaturedSimple: {
    borderWidth: 2,
    backgroundColor: `${colors.primary}08`,
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
  loadingContainer: {
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    paddingVertical: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaSection: {
    marginHorizontal: spacing.md,
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  ctaButton: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: '#FFF',
    marginHorizontal: spacing.sm,
  },
});

