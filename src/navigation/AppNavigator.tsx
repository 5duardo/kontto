import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TouchableOpacity, View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppState, type AppStateStatus } from 'react-native';
import { typography, useTheme } from '@theme';

// Screens
import {
  DashboardScreen,
  AddTransactionScreen,
  AddAccountScreen,
  EditAccountScreen,
  CategoriesScreen,
  TransactionsScreen,
  BudgetsScreen,
  GoalsScreen,
  AddGoalScreen,
  EditGoalScreen,
  StatsScreen,
  TransferScreen,
  MoreScreen,
  ProfileScreen,
  GetProScreen,
  ScheduledPaymentsScreen,
  AddPaymentScreen,
  EditPaymentScreen,
  SettingsScreen,
  AboutScreen,
  DataScreen,
  FormatSettingsScreen,
  StylesSettingsScreen,
  SyncSettingsScreen,
  NotificationsSettingsScreen,
  SecuritySettingsScreen,
  LocalBackupsScreen,
  AuthenticationScreen,
} from '@screens';
import { useAppStore } from '@store/useAppStore';
import type { Account, Goal, RecurringPayment } from '@types';

// Navigation types
export type RootTabParamList = {
  Accounts: undefined;
  Transactions: undefined;
  AddTransactionFAB: undefined;
  Stats: undefined;
  More: undefined;
};

export type RootStackParamList = {
  Main: undefined;
  Categories: undefined;
  AddTransaction: { transactionId?: string; type?: 'income' | 'expense'; accountId?: string } | undefined;
  AddAccount: undefined;
  EditAccount: { account: Account } | undefined;
  Transfer: { accountId?: string } | undefined;
  AddGoal: undefined;
  EditGoal: { goal: Goal } | undefined;
  Budgets: undefined;
  Settings: undefined;
  Profile: undefined;
  GetPro: undefined;
  ScheduledPayments: undefined;
  AddPayment: undefined;
  EditPayment: { payment: RecurringPayment } | undefined;
  About: undefined;
  Data: undefined;
  LocalBackups: undefined;
  FormatSettings: undefined;
  StylesSettings: undefined;
  SyncSettings: undefined;
  NotificationsSettings: undefined;
  SecuritySettings: undefined;
  Transactions: undefined;
  Authentication: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();

// Componente para el botón FAB
const FABButton = ({ size }: { size: number }) => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('AddTransaction')}
      style={{
        width: size * 2,
        height: size * 2,
        borderRadius: size,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 0,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 4.65,
      }}
    >
      <Ionicons name="add" size={size} color="white" />
    </TouchableOpacity>
  );
};

const TabNavigator = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }: any) => ({
        tabBarShowLabel: true,
        tabBarIcon: ({ focused, color, size }: any) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Accounts') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else if (route.name === 'Transactions') {
            iconName = focused ? 'receipt' : 'receipt-outline';
          } else if (route.name === 'AddTransactionFAB') {
            return <FABButton size={size} />;
          } else if (route.name === 'Stats') {
            iconName = focused ? 'bar-chart' : 'bar-chart-outline';
          } else if (route.name === 'More') {
            iconName = focused ? 'ellipsis-horizontal' : 'ellipsis-horizontal-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarLabel: ({ focused, color }: any) => {
          let label = '';

          if (route.name === 'Accounts') {
            label = 'Inicio';
          } else if (route.name === 'Transactions') {
            label = 'Transacciones';
          } else if (route.name === 'AddTransactionFAB') {
            return null;
          } else if (route.name === 'Stats') {
            label = 'Estadísticas';
          } else if (route.name === 'More') {
            label = 'Más';
          }

          return (
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{
                fontSize: 10,
                lineHeight: 12,
                fontWeight: typography.weights.medium,
                color,
                maxWidth: 80,
                textAlign: 'center',
              }}
            >
              {label}
            </Text>
          );
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.backgroundSecondary,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 6,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: typography.weights.medium,
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        tabBarIconStyle: {
          marginBottom: 2,
        },
        headerStyle: {
          backgroundColor: colors.background,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: {
          fontWeight: typography.weights.bold,
          fontSize: typography.sizes.xl,
        },
      })}
    >
      {/* @ts-ignore */}
      <Tab.Screen
        name="Accounts"
        component={DashboardScreen}
        options={{ title: 'Panel de Control', headerShown: false }}
      />
      {/* @ts-ignore */}
      <Tab.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{ title: 'Transacciones' }}
      />
      {/* Central Floating Action Button */}
      {/* @ts-ignore */}
      <Tab.Screen
        name="AddTransactionFAB"
        component={View}
        listeners={({ navigation }: any) => ({
          tabPress: (e: any) => {
            e.preventDefault();
          },
        })}
        options={{
          title: '',
          tabBarShowLabel: false,
        }}
      />
      {/* @ts-ignore */}
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{ title: 'Análisis Financiero' }}
      />
      {/* @ts-ignore */}
      <Tab.Screen
        name="More"
        component={MoreScreen}
        options={{ title: 'Más Opciones' }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  const { colors } = useTheme();
  const { pinEnabled } = useAppStore();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [appState, setAppState] = useState<AppStateStatus>('active');

  // Monitorear cambios de estado de la aplicación
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [isAuthenticated]);

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    // Si la app entra en background y tiene PIN habilitado, requiere autenticación al regresar
    if (appState.match(/inactive|background/) && nextAppState === 'active') {
      if (pinEnabled && isAuthenticated) {
        setIsAuthenticated(false);
      }
    }
    setAppState(nextAppState);
  };

  const handleAuthenticationSuccess = () => {
    setIsAuthenticated(true);
  };

  // Si PIN está habilitado y no está autenticado, mostrar pantalla de autenticación
  if (pinEnabled && !isAuthenticated) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen
            name="Authentication"
            options={{
              gestureEnabled: false,
            }}
          >
            {() => <AuthenticationScreen onAuthenticationSuccess={handleAuthenticationSuccess} />}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.textPrimary,
          headerTitleStyle: {
            fontWeight: typography.weights.bold,
            fontSize: typography.sizes.xl,
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: colors.background,
          },
          headerBackTitle: '',
        }}
      >
        <Stack.Screen
          name="Main"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AddTransaction"
          component={AddTransactionScreen}
          options={{
            title: 'Nueva Transacción',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="AddAccount"
          component={AddAccountScreen}
          options={{
            title: 'Nueva cuenta',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="Transfer"
          component={TransferScreen}
          options={{
            title: 'Transferencia',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="AddGoal"
          component={AddGoalScreen}
          options={{
            title: 'Nueva meta',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="EditGoal"
          component={EditGoalScreen}
          options={({ navigation }: any) => ({
            title: 'Editar meta',
            headerLeft: () => (
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
          name="EditAccount"
          component={EditAccountScreen}
          options={({ navigation }: any) => ({
            title: 'Editar cuenta',
            headerLeft: () => (
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
          name="Budgets"
          component={BudgetsScreen}
          options={({ navigation }: any) => ({
            title: 'Presupuestos',
            headerLeft: () => (
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={({ navigation }: any) => ({
            title: 'Ajustes',
            headerLeft: () => (
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={({ navigation }: any) => ({
            title: 'Perfil',
            headerLeft: () => (
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
          name="GetPro"
          component={GetProScreen}
          options={({ navigation }: any) => ({
            title: 'Obtener Pro',
            headerLeft: () => (
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
          name="ScheduledPayments"
          component={ScheduledPaymentsScreen}
          options={({ navigation }: any) => ({
            title: 'Pagos Programados',
            headerLeft: () => (
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
          name="AddPayment"
          component={AddPaymentScreen}
          options={({ navigation }: any) => ({
            title: 'Nuevo Pago',
            headerLeft: () => (
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
          name="EditPayment"
          component={EditPaymentScreen}
          options={({ navigation }: any) => ({
            title: 'Editar Pago',
            headerLeft: () => (
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
          name="About"
          component={AboutScreen}
          options={({ navigation }: any) => ({
            title: 'Acerca de',
            headerLeft: () => (
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
          name="Data"
          component={DataScreen}
          options={({ navigation }: any) => ({
            title: 'Datos',
            headerLeft: () => (
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
          name="LocalBackups"
          component={LocalBackupsScreen}
          options={({ navigation }: any) => ({
            title: 'Copias de Seguridad',
            headerLeft: () => (
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
          name="FormatSettings"
          component={FormatSettingsScreen}
          options={({ navigation }: any) => ({
            title: 'Formato',
            headerLeft: () => (
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
          name="StylesSettings"
          component={StylesSettingsScreen}
          options={({ navigation }: any) => ({
            title: 'Estilos y elementos',
            headerLeft: () => (
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
          name="SyncSettings"
          component={SyncSettingsScreen}
          options={({ navigation }: any) => ({
            title: 'Sincronización',
            headerLeft: () => (
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
          name="NotificationsSettings"
          component={NotificationsSettingsScreen}
          options={({ navigation }: any) => ({
            title: 'Notificaciones',
            headerLeft: () => (
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
          name="SecuritySettings"
          component={SecuritySettingsScreen}
          options={({ navigation }: any) => ({
            title: 'Seguridad',
            headerLeft: () => (
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
          name="Transactions"
          component={TransactionsScreen}
          options={({ navigation }: any) => ({
            title: 'Transacciones',
            headerLeft: () => (
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
          name="Categories"
          component={CategoriesScreen}
          options={({ navigation }: any) => ({
            title: 'Categorías',
            headerLeft: () => (
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            ),
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

