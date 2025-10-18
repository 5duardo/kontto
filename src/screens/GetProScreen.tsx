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

const PRICING_PLANS = [
  {
    id: 'monthly',
    name: 'Mensual',
    price: '$4.99',
    period: '/mes',
    savings: null,
    badge: null,
  },
  {
    id: 'annual',
    name: 'Anual',
    price: '$39.99',
    period: '/año',
    savings: 'Ahorra 33%',
    badge: 'popular',
  },
  {
    id: 'lifetime',
    name: 'De por vida',
    price: '$99.99',
    period: 'pago único',
    savings: 'Mejor valor',
    badge: 'best',
  },
];

export const GetProScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  const handlePurchase = (planId: string) => {
    Alert.alert(
      'Compra de suscripción',
      'Esta función estará disponible pronto. Gracias por tu interés en Kontto Pro.',
      [{ text: 'OK' }]
    );
  };

  const renderFeature = (feature: ProFeature) => (
    <View key={feature.id} style={styles.featureItem}>
      <View style={[styles.featureIconContainer, { backgroundColor: `${colors.primary}20` }]}>
        <Ionicons name={feature.icon as any} size={24} color={colors.primary} />
      </View>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{feature.title}</Text>
        <Text style={styles.featureDescription}>{feature.description}</Text>
      </View>
    </View>
  );

  const renderPricingPlan = (plan: typeof PRICING_PLANS[0]) => (
    <View
      key={plan.id}
      style={[
        styles.pricingCard,
        plan.badge === 'popular' && { borderColor: colors.primary, borderWidth: 2 },
        plan.badge === 'best' && { borderColor: '#10B981', borderWidth: 2 },
      ]}
    >
      {plan.badge === 'popular' && (
        <View style={[styles.badge, { backgroundColor: colors.primary }]}>
          <Text style={styles.badgeText}>MÁS POPULAR</Text>
        </View>
      )}
      {plan.badge === 'best' && (
        <View style={[styles.badge, { backgroundColor: '#10B981' }]}>
          <Text style={styles.badgeText}>MEJOR VALOR</Text>
        </View>
      )}
      <Text style={styles.planName}>{plan.name}</Text>
      <View style={styles.priceContainer}>
        <Text style={styles.price}>{plan.price}</Text>
        <Text style={styles.period}>{plan.period}</Text>
      </View>
      {plan.savings && (
        <Text style={[styles.savings, { color: colors.success || '#10B981' }]}>
          {plan.savings}
        </Text>
      )}
      <TouchableOpacity
        style={[
          styles.purchaseButton,
          {
            backgroundColor:
              plan.badge === 'popular'
                ? colors.primary
                : plan.badge === 'best'
                ? '#10B981'
                : colors.backgroundSecondary,
          },
        ]}
        onPress={() => handlePurchase(plan.id)}
      >
        <Text
          style={[
            styles.purchaseButtonText,
            {
              color:
                plan.badge === 'popular' || plan.badge === 'best'
                  ? '#FFF'
                  : colors.textPrimary,
            },
          ]}
        >
          Comprar ahora
        </Text>
      </TouchableOpacity>
    </View>
  );

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

        {/* Current Plan Info */}
        <View style={[styles.currentPlanCard, { backgroundColor: `${colors.primary}20` }]}>
          <View style={styles.currentPlanContent}>
            <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Text style={styles.currentPlanTitle}>Plan Gratuito Activo</Text>
              <Text style={styles.currentPlanDescription}>
                Tienes acceso a todas las funciones básicas
              </Text>
            </View>
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Funciones Premium</Text>
          <View style={styles.featuresContainer}>
            {PRO_FEATURES.map((feature) => renderFeature(feature))}
          </View>
        </View>

        {/* Pricing Section */}
        <View style={styles.pricingSection}>
          <Text style={styles.sectionTitle}>Planes de precios</Text>
          <View style={styles.pricingContainer}>
            {PRICING_PLANS.map((plan) => renderPricingPlan(plan))}
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>Preguntas frecuentes</Text>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>¿Puedo cambiar de plan en cualquier momento?</Text>
            <Text style={styles.faqAnswer}>
              Sí, puedes cambiar o cancelar tu suscripción en cualquier momento desde tu cuenta.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>¿Hay período de prueba?</Text>
            <Text style={styles.faqAnswer}>
              Ofrecemos un período de prueba de 7 días gratis para que pruebes todas las funciones
              premium.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>¿Mi suscripción se renovará automáticamente?</Text>
            <Text style={styles.faqAnswer}>
              Sí, tu suscripción se renovará automáticamente. Siempre puedes cancelarla antes del
              período de renovación.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>¿Qué métodos de pago aceptan?</Text>
            <Text style={styles.faqAnswer}>
              Aceptamos tarjetas de crédito/débito y transferencias bancarias. Próximamente
              agregaremos más opciones.
            </Text>
          </View>
        </View>

        {/* Contact Section */}
        <View style={[styles.contactSection, { backgroundColor: colors.backgroundSecondary }]}>
          <Text style={styles.contactTitle}>¿Tienes preguntas?</Text>
          <Text style={styles.contactDescription}>
            Nuestro equipo está disponible para ayudarte
          </Text>
          <TouchableOpacity style={[styles.contactButton, { backgroundColor: colors.primary }]}>
            <Ionicons name="mail" size={20} color="#FFF" />
            <Text style={styles.contactButtonText}>Contactar soporte</Text>
          </TouchableOpacity>
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
  currentPlanCard: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
  currentPlanContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentPlanTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  currentPlanDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
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
  faqItem: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  faqQuestion: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  faqAnswer: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  contactSection: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    borderRadius: 12,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  contactDescription: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 10,
    gap: spacing.md,
    width: '100%',
    justifyContent: 'center',
  },
  contactButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: '#FFF',
  },
  bottomSpacing: {
    height: spacing.xl,
  },
});
