import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TouchableOpacity, View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
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
} from '@screens';
import type { Account, Goal, RecurringPayment } from '@types';

// Navigation types
export type RootTabParamList = {
  Accounts: undefined;
  Categories: undefined;
  AddTransactionFAB: undefined;
  Stats: undefined;
  More: undefined;
};

export type RootStackParamList = {
  Main: undefined;
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
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -28,
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
      screenOptions={({ route }) => ({
        tabBarShowLabel: true,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Accounts') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else if (route.name === 'Categories') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'AddTransactionFAB') {
            return <FABButton size={size} />;
          } else if (route.name === 'Stats') {
            iconName = focused ? 'bar-chart' : 'bar-chart-outline';
          } else if (route.name === 'More') {
            iconName = focused ? 'ellipsis-horizontal' : 'ellipsis-horizontal-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarLabel: ({ focused, color }) => {
          let label = '';

          if (route.name === 'Accounts') {
            label = 'Inicio';
          } else if (route.name === 'Categories') {
            label = 'Categorías';
          } else if (route.name === 'AddTransactionFAB') {
            return null;
          } else if (route.name === 'Stats') {
            label = 'Estadísticas';
          } else if (route.name === 'More') {
            label = 'Más';
          }

          return (
            <Text style={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.medium, color }}>
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
          height: 70 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: typography.sizes.xs,
          fontWeight: typography.weights.medium,
          marginTop: 4,
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
        name="Categories"
        component={CategoriesScreen}
        options={{ title: 'Gestionar Categorías' }}
      />
      {/* Central Floating Action Button */}
      {/* @ts-ignore */}
      <Tab.Screen
        name="AddTransactionFAB"
        component={View}
        listeners={({ navigation }) => ({
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
          options={({ navigation }) => ({
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
          options={({ navigation }) => ({
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
          options={({ navigation }) => ({
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
          options={({ navigation }) => ({
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
          options={({ navigation }) => ({
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
          options={({ navigation }) => ({
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
          options={({ navigation }) => ({
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
          options={({ navigation }) => ({
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
          options={({ navigation }) => ({
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
          options={({ navigation }) => ({
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
          options={({ navigation }) => ({
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
          options={({ navigation }) => ({
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
          options={({ navigation }) => ({
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
          options={({ navigation }) => ({
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
          options={({ navigation }) => ({
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
          options={({ navigation }) => ({
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
          options={({ navigation }) => ({
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
          options={({ navigation }) => ({
            title: 'Transacciones',
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
