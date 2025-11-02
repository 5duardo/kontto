import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { OnboardingSlide } from '../components';
import { Button } from '../components/common/Button';

const { width } = Dimensions.get('window');

export interface OnboardingScreenProps {
  onComplete: () => void;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 12,
  },
  skipButton: {
    alignItems: 'flex-end',
    marginRight: 20,
    marginTop: 8,
    marginBottom: 8,
  },
  carousel: {
    flex: 1,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 16,
    gap: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  buttonContainer: {
    flex: 0.48,
  },
  expensesList: {
    borderRadius: 16,
    padding: 16,
    gap: 12,
    width: 280,
  },
  expenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  expenseLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  expenseAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  imageContainer: {
    borderRadius: 16,
    padding: 20,
    width: 280,
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    width: '100%',
    height: 180,
    gap: 12,
  },
  chartBar: {
    width: 40,
    borderRadius: 8,
  },
  goalStack: {
    width: '100%',
    gap: 12,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  goalText: {
    fontSize: 16,
    fontWeight: '600',
  },
  accountStack: {
    width: '100%',
    gap: 12,
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  accountIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 14,
    fontWeight: '600',
  },
  accountAmount: {
    fontSize: 12,
    fontWeight: '400',
    marginTop: 2,
  },
  welcomeContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  welcomeLogo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 36,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -1,
  },
  welcomeSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
});

// Componente de bienvenida
const WelcomeContent = ({ colors }: any) => (
  <View style={[styles.welcomeContainer, { gap: 32 }]}>
    <View style={[styles.welcomeLogo, { backgroundColor: `${colors.primary}20` }]}>
      <MaterialCommunityIcons name="wallet" size={60} color={colors.primary} />
    </View>
    {/* Title and description are provided by the OnboardingSlide props, so we only render the visual logo here */}
  </View>
);

// Componente de vista de cuentas para "Tus finanzas en un solo lugar"
const AccountsOverview = ({ colors }: any) => (
  <View style={[styles.imageContainer, { backgroundColor: colors.backgroundSecondary }]}>
    <View style={styles.accountStack}>
      <View style={[styles.accountCard, { borderColor: colors.primary, borderLeftWidth: 4 }]}>
        <View style={[styles.accountIcon, { backgroundColor: `${colors.primary}20` }]}>
          <MaterialCommunityIcons name="bank" size={24} color={colors.primary} />
        </View>
        <View style={styles.accountInfo}>
          <Text style={[styles.accountName, { color: colors.textPrimary }]}>Banco Principal</Text>
          <Text style={[styles.accountAmount, { color: colors.textSecondary }]}>$5,234.50</Text>
        </View>
      </View>
      <View style={[styles.accountCard, { borderColor: colors.categoryColors?.[1] ?? colors.warning, borderLeftWidth: 4 }]}>
        <View style={[styles.accountIcon, { backgroundColor: `${colors.categoryColors?.[1] ?? colors.warning}20` }]}>
          <MaterialCommunityIcons name="wallet" size={24} color={colors.categoryColors?.[1] ?? colors.warning} />
        </View>
        <View style={styles.accountInfo}>
          <Text style={[styles.accountName, { color: colors.textPrimary }]}>Efectivo</Text>
          <Text style={[styles.accountAmount, { color: colors.textSecondary }]}>$500.00</Text>
        </View>
      </View>
      <View style={[styles.accountCard, { borderColor: colors.categoryColors?.[2] ?? colors.success, borderLeftWidth: 4 }]}>
        <View style={[styles.accountIcon, { backgroundColor: `${colors.categoryColors?.[2] ?? colors.success}20` }]}>
          <MaterialCommunityIcons name="credit-card" size={24} color={colors.categoryColors?.[2] ?? colors.success} />
        </View>
        <View style={styles.accountInfo}>
          <Text style={[styles.accountName, { color: colors.textPrimary }]}>Tarjeta Crédito</Text>
          <Text style={[styles.accountAmount, { color: colors.textSecondary }]}>$2,150.75</Text>
        </View>
      </View>
    </View>
  </View>
);

// Componente de imagen para "Controla tus gastos"
const ControlExpensesImage = ({ colors }: any) => (
  <View style={[styles.expensesList, { backgroundColor: colors.backgroundSecondary }]}>
    <View style={styles.expenseItem}>
      <MaterialCommunityIcons name="silverware-fork-knife" size={24} color="#EF4444" />
      <Text style={[styles.expenseLabel, { color: colors.textPrimary }]}>Food</Text>
      <Text style={[styles.expenseAmount, { color: '#EF4444' }]}>-100</Text>
    </View>
    <View style={styles.expenseItem}>
      <MaterialCommunityIcons name="home" size={24} color="#F59E0B" />
      <Text style={[styles.expenseLabel, { color: colors.textPrimary }]}>House</Text>
      <Text style={[styles.expenseAmount, { color: '#F59E0B' }]}>-50</Text>
    </View>
    <View style={styles.expenseItem}>
      <MaterialCommunityIcons name="car" size={24} color="#8B5CF6" />
      <Text style={[styles.expenseLabel, { color: colors.textPrimary }]}>Auto</Text>
      <Text style={[styles.expenseAmount, { color: '#8B5CF6' }]}>-30</Text>
    </View>
  </View>
);

// Componente de imagen para "Haz tu presupuesto"
const BudgetImage = ({ colors }: any) => (
  <View style={[styles.imageContainer, { backgroundColor: colors.backgroundSecondary }]}>
    <View style={styles.chartContainer}>
      <View style={[styles.chartBar, { height: '60%', backgroundColor: colors.primary }]} />
      <View style={[styles.chartBar, { height: '75%', backgroundColor: colors.categoryColors?.[1] ?? colors.warning }]} />
      <View style={[styles.chartBar, { height: '45%', backgroundColor: colors.categoryColors?.[2] ?? colors.success }]} />
      <View style={[styles.chartBar, { height: '85%', backgroundColor: colors.categoryColors?.[3] ?? colors.secondary }]} />
    </View>
  </View>
);

// Componente de imagen para "Sigue tu plan y tus sueños"
const GoalsImage = ({ colors }: any) => (
  <View style={[styles.imageContainer, { backgroundColor: colors.backgroundSecondary }]}>
    <View style={styles.goalStack}>
      <View style={[styles.goalCard, { borderColor: colors.primary, borderLeftWidth: 4 }]}>
        <MaterialCommunityIcons name="target" size={32} color={colors.primary} />
        <Text style={[styles.goalText, { color: colors.textPrimary }]}>Meta 1</Text>
      </View>
      <View style={[styles.goalCard, { borderColor: colors.categoryColors?.[1] ?? colors.warning, borderLeftWidth: 4 }]}>
        <MaterialCommunityIcons name="target" size={32} color={colors.categoryColors?.[1] ?? colors.warning} />
        <Text style={[styles.goalText, { color: colors.textPrimary }]}>Meta 2</Text>
      </View>
      <View style={[styles.goalCard, { borderColor: colors.categoryColors?.[2] ?? colors.success, borderLeftWidth: 4 }]}>
        <MaterialCommunityIcons name="target" size={32} color={colors.categoryColors?.[2] ?? colors.success} />
        <Text style={[styles.goalText, { color: colors.textPrimary }]}>Meta 3</Text>
      </View>
    </View>
  </View>
);

// Componente para el dot de paginación
const PaginationDot: React.FC<{ isActive: boolean; colors: any }> = ({ isActive, colors }) => (
  <View
    style={[
      styles.dot,
      {
        backgroundColor: isActive ? colors.primary : colors.border,
        width: isActive ? 32 : 8,
      },
    ]}
  />
);

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const { colors } = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const slides = [
    {
      icon: 'wallet',
      title: 'Bienvenido a Kontto',
      description: 'Tu gestor financiero personal para gestionar tus finanzas de forma simple',
      color: colors.primary,
      content: <WelcomeContent colors={colors} />,
    },
    {
      icon: 'wallet-outline',
      title: 'Tus finanzas en un solo lugar',
      description:
        'Obtén una visión general de todo tu dinero. Conecta tu banco, registra efectivo o importa datos.',
      color: colors.categoryColors?.[0] ?? colors.primary,
      content: <AccountsOverview colors={colors} />,
    },
    {
      icon: 'pencil',
      title: 'Controla tus gastos',
      description:
        'Sigue y analiza los gastos de forma inmediata y automática a través de nuestra conexión bancaria.',
      color: colors.categoryColors?.[1] ?? colors.warning,
      content: <ControlExpensesImage colors={colors} />,
    },
    {
      icon: 'chart-pie',
      title: 'Haz tu presupuesto',
      description: 'Desarrolla hábitos financieros saludables. Controla los gastos innecesarios.',
      color: colors.categoryColors?.[2] ?? colors.success,
      content: <BudgetImage colors={colors} />,
    },
    {
      icon: 'target',
      title: 'Sigue tu plan y tus sueños',
      description:
        'Construye tu vida financiera. Toma las decisiones financieras correctas. Ve solo lo importante para ti.',
      color: colors.categoryColors?.[3] ?? colors.success,
      content: <GoalsImage colors={colors} />,
    },
  ];

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const slide = Math.round(contentOffsetX / width);
    setCurrentSlide(slide);
  };

  const scrollToSlide = (index: number) => {
    scrollViewRef.current?.scrollTo({
      x: width * index,
      animated: true,
    });
    setCurrentSlide(index);
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      scrollToSlide(currentSlide + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      scrollToSlide(currentSlide - 1);
    }
  };

  const isLastSlide = currentSlide === slides.length - 1;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Carousel - Scrollable */}
      <ScrollView
        // @ts-ignore - React Native ref typing issue
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        scrollEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        style={styles.carousel}
      >
        {slides.map((slide, index) => (
          // @ts-ignore - key prop not in type definition
          <OnboardingSlide key={index} slide={slide} />
        ))}
      </ScrollView>

      {/* Bottom Container */}
      <View style={[styles.bottomContainer, { backgroundColor: colors.background }]}>
        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {slides.map((_, index) => {
            const DotComponent: any = PaginationDot;
            return (
              <DotComponent
                key={`dot-${index}`}
                isActive={index === currentSlide}
                colors={colors}
              />
            );
          })}
        </View>

        {/* Start button on last slide */}
        {isLastSlide && (
          <View style={{ marginTop: 8 }}>
            <Button title="Comenzar" onPress={onComplete} variant="solidPrimary" size="large" />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

