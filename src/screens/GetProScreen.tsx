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
import useInAppPurchases from '../hooks/useInAppPurchases';

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

  // Get current counts from store to show comparison
  const accountsCount = useAppStore(state => state.accounts.length);
  const goalsCount = useAppStore(state => state.goals.length);
  const budgetsCount = useAppStore(state => state.budgets.length);
  const recurringCount = useAppStore(state => state.recurringPayments.length);
  const isPro = useAppStore(state => state.isPro);

  const setPro = useAppStore(state => state.setPro);

  // Setup in-app purchases
  const { buy, loading, error, products, DEFAULT_PRODUCT_IDS, isModuleAvailable } = useInAppPurchases();

  // Handle purchase
  const handlePurchase = async (productId: string) => {
    if (!isModuleAvailable) {
      Alert.alert(
        'Módulo no disponible',
        'El módulo nativo de compras in-app no está disponible.\n\nPara usar compras reales, necesitas reconstruir la app:\n\n1. npx expo prebuild --clean\n2. eas build --platform ios --profile preview\n\nO instala desde TestFlight cuando esté lista.',
        [{ text: 'Entendido', onPress: () => { } }]
      );
      return;
    }
    if (loading) {
      Alert.alert('Por favor espera', 'Una compra está en progreso...');
      return;
    }
    if (error) {
      Alert.alert('Error', `Error al procesar compra: ${error}`);
      return;
    }
    try {
      await buy(productId);
      // After successful purchase, enable Pro
      setPro(true);
      Alert.alert('¡Éxito!', '¡Gracias por tu compra! Pro ha sido activado.');
    } catch (err: any) {
      Alert.alert('Error', `Hubo un problema al procesar tu compra: ${err?.message || err}`);
    }
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

        {/* Subscription Plans Section */}
        <View style={styles.pricingSection}>
          <Text style={styles.sectionTitle}>Elige tu plan</Text>

          {/* Weekly Plan */}
          <View style={styles.pricingCard}>
            <Text style={styles.planName}>1 Semana</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>$2.99</Text>
              <Text style={styles.period}>/semana</Text>
            </View>
            <Text style={styles.savingsText}>Prueba Pro sin compromiso</Text>
            <TouchableOpacity
              style={[styles.purchaseButton, { backgroundColor: colors.primary, opacity: loading ? 0.6 : 1 }]}
              onPress={() => handlePurchase(DEFAULT_PRODUCT_IDS.weekly)}
              disabled={loading}
            >
              <Text style={[styles.purchaseButtonText, { color: '#fff' }]}>
                {loading ? 'Procesando...' : 'Comprar suscripción'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Monthly Plan */}
          <View style={styles.pricingCard}>
            <Text style={styles.planName}>1 Mes</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>$9.99</Text>
              <Text style={styles.period}>/mes</Text>
            </View>
            <Text style={styles.savingsText}>Mejor valor mensual</Text>
            <TouchableOpacity
              style={[styles.purchaseButton, { backgroundColor: colors.primary, opacity: loading ? 0.6 : 1 }]}
              onPress={() => handlePurchase(DEFAULT_PRODUCT_IDS.monthly)}
              disabled={loading}
            >
              <Text style={[styles.purchaseButtonText, { color: '#fff' }]}>
                {loading ? 'Procesando...' : 'Comprar suscripción'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Annual Plan */}
          <View style={[styles.pricingCard, { borderColor: colors.primary, borderWidth: 2 }]}>
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <Text style={styles.badgeText}>Mejor precio</Text>
            </View>
            <Text style={styles.planName}>1 Año</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>$79.99</Text>
              <Text style={styles.period}>/año</Text>
            </View>
            <Text style={styles.savingsText}>Ahorra 33% vs mensual</Text>
            <TouchableOpacity
              style={[styles.purchaseButton, { backgroundColor: colors.primary, opacity: loading ? 0.6 : 1 }]}
              onPress={() => handlePurchase(DEFAULT_PRODUCT_IDS.annual)}
              disabled={loading}
            >
              <Text style={[styles.purchaseButtonText, { color: '#fff' }]}>
                {loading ? 'Procesando...' : 'Comprar suscripción'}
              </Text>
            </TouchableOpacity>
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
  savingsText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
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
