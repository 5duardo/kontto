import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ThemeProvider, useTheme } from './src/theme';
import { LoadingScreen } from './src/components';
import { OnboardingScreen } from './src/screens';
import { useAppLoading, useOnboarding } from './src/hooks';
import 'react-native-gesture-handler';

function AppContent() {
  const { theme } = useTheme();
  const { isLoading, finishLoading } = useAppLoading();
  const { hasCompletedOnboarding, completeOnboarding } = useOnboarding();

  useEffect(() => {
    // Simular carga de datos iniciales
    const timer = setTimeout(() => {
      finishLoading();
    }, 2500);

    return () => clearTimeout(timer);
  }, [finishLoading]);

  // Mostrar loader mientras carga
  if (isLoading) {
    return <LoadingScreen duration={2500} onComplete={finishLoading} />;
  }

  // Mostrar onboarding si no ha sido completado
  if (!hasCompletedOnboarding) {
    return <OnboardingScreen onComplete={completeOnboarding} />;
  }

  return (
    <>
      <AppNavigator />
      <StatusBar style={theme === 'light' ? 'dark' : 'light'} />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider children={<AppContent />} />
    </SafeAreaProvider>
  );
}
