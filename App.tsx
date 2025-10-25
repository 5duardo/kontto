import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from '@navigation/AppNavigator';
import { ThemeProvider, useTheme } from '@theme';
import { LoadingScreen } from '@components';
import { OnboardingScreen } from '@screens';
import { useAppLoading, useOnboarding } from '@hooks';
import { useAppStore } from '@store/useAppStore';

function AppContent() {
  const { theme } = useTheme();
  const { isLoading, finishLoading } = useAppLoading();
  const { hasCompletedOnboarding, completeOnboarding } = useOnboarding();
  const { migrateData } = useAppStore();

  useEffect(() => {
    // Migrate data to ensure all transactions have accountId
    migrateData();
  }, [migrateData]);

  // Mostrar loader mientras carga
  if (isLoading) {
    return <LoadingScreen duration={300} onComplete={finishLoading} />;
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
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
