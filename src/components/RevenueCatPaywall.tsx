import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography, useTheme } from '@theme';
import { useRevenueCat } from '@hooks/useRevenueCat';
import revenueCatService from '@services/revenueCatService';

interface RevenueCatPaywallProps {
    onPurchaseSuccess?: () => void;
    onClose?: () => void;
    showCloseButton?: boolean;
}

// Mapear IDs de productos a nombres en español
const PRODUCT_NAMES: Record<string, { name: string; description: string }> = {
    '$rc_weekly': { name: 'Semanal', description: 'Renovación semanal' },
    '$rc_monthly': { name: 'Mensual', description: 'Renovación mensual' },
    '$rc_annual': { name: 'Anual', description: 'Mejor valor - Renovación anual' },
    '$rc_lifetime': { name: 'De por vida', description: 'Acceso ilimitado' },
};

/**
 * RevenueCat Paywall Component - Kontto Pro
 * Displays subscription options with clean design
 */
export const RevenueCatPaywall: React.FC<RevenueCatPaywallProps> = ({
    onPurchaseSuccess,
    onClose,
    showCloseButton = true,
}) => {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const styles = React.useMemo(() => createStyles(colors, insets), [colors, insets]);

    const {
        availableProducts,
        isLoading,
        isPurchasing,
        lastPurchaseError,
        purchase,
        restorePurchases,
    } = useRevenueCat();

    const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
    const [restoreLoading, setRestoreLoading] = useState(false);

    /**
     * Get display name for product
     */
    const getProductName = (productId: string) => {
        return PRODUCT_NAMES[productId] || { name: productId, description: '' };
    };

    /**
     * Handle purchase selection
     */
    const handlePurchase = async (productId: string) => {
        try {
            setSelectedProduct(productId);
            const success = await purchase(productId);

            if (success) {
                Alert.alert(
                    'Compra exitosa',
                    'Bienvenido a Kontto Pro. Ahora tienes acceso a todas las funciones premium.',
                    [
                        {
                            text: 'Entendido',
                            onPress: () => {
                                onPurchaseSuccess?.();
                                onClose?.();
                            },
                        },
                    ]
                );
            } else {
                const errorMessage = lastPurchaseError || 'La compra falló. Intenta de nuevo.';
                Alert.alert('Compra fallida', errorMessage);
            }
        } catch (error) {
            console.error('Error during purchase:', error);
            Alert.alert('Error', 'Ocurrió un error inesperado durante la compra.');
        } finally {
            setSelectedProduct(null);
        }
    };

    /**
     * Handle restore purchases
     */
    const handleRestorePurchases = async () => {
        try {
            setRestoreLoading(true);
            const success = await restorePurchases();

            if (success) {
                Alert.alert('Éxito', 'Tus compras han sido restauradas.');
                onPurchaseSuccess?.();
            } else {
                Alert.alert('Restauración fallida', 'No se pudieron restaurar las compras. Intenta de nuevo.');
            }
        } catch (error) {
            console.error('Error restoring purchases:', error);
            Alert.alert('Error', 'Ocurrió un error inesperado.');
        } finally {
            setRestoreLoading(false);
        }
    };

    if (isLoading) {
        return (
            <View style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Cargando opciones premium...</Text>
                </View>
            </View>
        );
    }

    // Product sorting: Weekly, Monthly, Yearly, Lifetime
    const sortedProducts = [...(availableProducts || [])].sort((a, b) => {
        const order = ['$rc_weekly', '$rc_monthly', '$rc_annual', '$rc_lifetime'];
        const aId = a.identifier || a.product?.identifier || '';
        const bId = b.identifier || b.product?.identifier || '';
        return order.indexOf(aId) - order.indexOf(bId);
    });

    const getBillingPeriod = (productId: string): string => {
        if (productId.includes('weekly')) return 'por semana';
        if (productId.includes('monthly')) return 'por mes';
        if (productId.includes('annual') || productId.includes('yearly')) return 'por año';
        if (productId.includes('lifetime')) return 'de por vida';
        return '';
    };

    const getRecommendedBadge = (productId: string): boolean => {
        // Mark yearly/annual as recommended (best value)
        return productId.includes('annual') || productId.includes('yearly');
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Kontto Pro</Text>
                    <Text style={styles.subtitle}>Desbloquea funciones ilimitadas</Text>
                </View>
                {showCloseButton && onClose && (
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Features Section */}
            <View style={styles.featuresSection}>
                <Text style={styles.sectionTitle}>Características incluidas</Text>
                <FeatureItem
                    icon="wallet"
                    title="Cuentas ilimitadas"
                    description="Crea tantas cuentas como necesites"
                    colors={colors}
                />
                <FeatureItem
                    icon="bar-chart"
                    title="Análisis avanzados"
                    description="Información detallada y reportes completos"
                    colors={colors}
                />
                <FeatureItem
                    icon="pie-chart"
                    title="Seguimiento de presupuesto"
                    description="Herramientas avanzadas para gestionar tu presupuesto"
                    colors={colors}
                />
                <FeatureItem
                    icon="refresh"
                    title="Transacciones recurrentes"
                    description="Automatiza tus pagos e ingresos"
                    colors={colors}
                />
                <FeatureItem
                    icon="download"
                    title="Exportar datos"
                    description="Descarga en CSV, PDF o Excel"
                    colors={colors}
                />
                <FeatureItem
                    icon="create"
                    title="Categorías personalizadas"
                    description="Crea tus propias categorías"
                    colors={colors}
                />
                <FeatureItem
                    icon="close-circle"
                    title="Sin publicidades"
                    description="Disfruta la app sin anuncios"
                    colors={colors}
                />
                <FeatureItem
                    icon="headset"
                    title="Soporte prioritario"
                    description="Soporte técnico 24/7"
                    colors={colors}
                />
            </View>

            {/* Products/Pricing Section */}
            <View style={styles.pricingSection}>
                <Text style={styles.sectionTitle}>Elige tu plan:</Text>

                {sortedProducts.length === 0 ? (
                    <View style={styles.noProductsContainer}>
                        <Text style={styles.noProductsText}>
                            Las opciones premium no están disponibles. Intenta de nuevo más tarde.
                        </Text>
                    </View>
                ) : (
                    sortedProducts.map((product) => {
                        const productId = product.identifier || product.product?.identifier || '';
                        const isRecommended = getRecommendedBadge(productId);
                        const isSelected = selectedProduct === productId;
                        const isLoadingThisProduct = isPurchasing && isSelected;

                        return (
                            <TouchableOpacity
                                key={productId}
                                style={[
                                    styles.productCard,
                                    isRecommended && styles.recommendedCard,
                                    isSelected && styles.selectedCard,
                                ]}
                                onPress={() => handlePurchase(productId)}
                                disabled={isPurchasing}
                                activeOpacity={0.7}
                            >
                                {isRecommended && (
                                    <View style={styles.recommendedBadge}>
                                        <Text style={styles.recommendedBadgeText}>MEJOR VALOR</Text>
                                    </View>
                                )}

                                <View style={styles.productContent}>
                                    <View style={styles.productInfo}>
                                        <Text style={styles.productName}>{getProductName(productId).name}</Text>
                                        <Text style={styles.productPrice}>
                                            {product.product?.priceString}
                                            <Text style={styles.productPeriod}> {getBillingPeriod(productId)}</Text>
                                        </Text>
                                    </View>

                                    {isLoadingThisProduct ? (
                                        <ActivityIndicator color={colors.primary} size="small" />
                                    ) : (
                                        <Ionicons
                                            name={isSelected ? 'checkmark-circle' : 'chevron-forward'}
                                            size={24}
                                            color={isSelected ? colors.primary : colors.secondary}
                                        />
                                    )}
                                </View>
                            </TouchableOpacity>
                        );
                    })
                )}
            </View>

            {/* Error Message */}
            {lastPurchaseError && (
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={20} color="#EF4444" />
                    <Text style={styles.errorText}>{lastPurchaseError}</Text>
                </View>
            )}

            {/* Actions */}
            <View style={styles.actionsSection}>
                <TouchableOpacity
                    style={[styles.restoreButton, restoreLoading && styles.buttonDisabled]}
                    onPress={handleRestorePurchases}
                    disabled={restoreLoading}
                >
                    {restoreLoading ? (
                        <ActivityIndicator color={colors.primary} size="small" />
                    ) : (
                        <>
                            <Ionicons name="refresh" size={18} color={colors.primary} />
                            <Text style={styles.restoreButtonText}>Restaurar compras</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            {/* Legal Text */}
            <View style={styles.legalSection}>
                <Text style={styles.legalText}>
                    Subscriptions will renew automatically unless cancelled. Manage your subscription in your device settings.
                </Text>
            </View>

            {/* Bottom spacing */}
            <View style={{ height: 40 }} />
        </ScrollView>
    );
};

/**
 * Feature Item Component
 */
interface FeatureItemProps {
    icon: string;
    title: string;
    description: string;
    colors: any;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ icon, title, description, colors }) => (
    <View style={{ flexDirection: 'row', marginBottom: spacing.md, alignItems: 'flex-start' }}>
        <View
            style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                backgroundColor: colors.surface,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: spacing.md,
            }}
        >
            <Ionicons name={icon as any} size={20} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
            <Text
                style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: colors.textPrimary,
                    marginBottom: 4,
                }}
            >
                {title}
            </Text>
            <Text style={{ fontSize: 14, color: colors.textSecondary }}>{description}</Text>
        </View>
    </View>
);

const createStyles = (colors: any, insets: any) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.lg + insets.top,
            paddingBottom: spacing.lg + insets.bottom,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 300,
        },
        loadingText: {
            marginTop: spacing.md,
            color: colors.textSecondary,
            fontSize: 16,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: spacing.xl,
        },
        title: {
            fontSize: 28,
            fontWeight: '700',
            color: colors.textPrimary,
            marginBottom: spacing.xs,
        },
        subtitle: {
            fontSize: 16,
            color: colors.textSecondary,
        },
        closeButton: {
            padding: spacing.sm,
        },
        featuresSection: {
            marginBottom: spacing.xl,
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: '700',
            color: colors.textPrimary,
            marginBottom: spacing.md,
        },
        pricingSection: {
            marginBottom: spacing.xl,
        },
        productCard: {
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: spacing.md,
            marginBottom: spacing.md,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderWidth: 2,
            borderColor: 'transparent',
        },
        recommendedCard: {
            borderColor: colors.primary,
            backgroundColor: `${colors.primary}10`,
        },
        selectedCard: {
            borderColor: colors.primary,
        },
        recommendedBadge: {
            position: 'absolute',
            top: -8,
            right: 12,
            backgroundColor: colors.primary,
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs,
            borderRadius: 6,
        },
        recommendedBadgeText: {
            color: '#FFF',
            fontSize: 10,
            fontWeight: '700',
        },
        productContent: {
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        productInfo: {
            flex: 1,
        },
        productName: {
            fontSize: 16,
            fontWeight: '700',
            color: colors.textPrimary,
            marginBottom: spacing.xs,
        },
        productPrice: {
            fontSize: 18,
            fontWeight: '700',
            color: colors.primary,
        },
        productPeriod: {
            fontSize: 14,
            fontWeight: '500',
            color: colors.textSecondary,
        },
        noProductsContainer: {
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: spacing.lg,
            alignItems: 'center',
        },
        noProductsText: {
            color: colors.textSecondary,
            fontSize: 16,
            textAlign: 'center',
        },
        errorContainer: {
            flexDirection: 'row',
            backgroundColor: '#EF444415',
            borderRadius: 8,
            padding: spacing.md,
            marginBottom: spacing.md,
            alignItems: 'center',
        },
        errorText: {
            marginLeft: spacing.sm,
            color: '#EF4444',
            flex: 1,
            fontSize: typography.sizes.xs,
            lineHeight: typography.lineHeights.normal,
        },
        actionsSection: {
            marginBottom: spacing.lg,
        },
        restoreButton: {
            flexDirection: 'row',
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: spacing.md,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.primary,
        },
        restoreButtonText: {
            marginLeft: spacing.sm,
            color: colors.primary,
            fontWeight: '600',
            fontSize: 16,
        },
        buttonDisabled: {
            opacity: 0.6,
        },
        legalSection: {
            paddingHorizontal: spacing.sm,
            marginBottom: spacing.md,
        },
        legalText: {
            fontSize: 12,
            color: colors.textSecondary,
            textAlign: 'center',
            lineHeight: 18,
        },
    });

export default RevenueCatPaywall;
