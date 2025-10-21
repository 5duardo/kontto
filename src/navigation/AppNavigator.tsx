// @ts-nocheck
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TouchableOpacity } from 'react-native';
import { typography, useTheme } from '../theme';

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
} from '../screens';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  
  return (
    // @ts-ignore
    <Tab.Navigator
      screenOptions={({ route }: any) => ({
        tabBarShowLabel: false,
        tabBarIcon: ({ focused, color, size }: any) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Accounts') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else if (route.name === 'Categories') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Transactions') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Stats') {
            iconName = focused ? 'bar-chart' : 'bar-chart-outline';
          } else if (route.name === 'More') {
            // Use ellipsis to differentiate from 'list' used by Transactions
            iconName = focused ? 'ellipsis-horizontal' : 'ellipsis-horizontal-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.backgroundSecondary,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: typography.sizes.xs,
          fontWeight: typography.weights.medium,
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
        options={{ title: 'Cuentas', headerShown: false }}
      />
      {/* @ts-ignore */}
      <Tab.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{ title: 'Categorías' }}
      />
      {/* @ts-ignore */}
      <Tab.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{ title: 'Transacciones' }}
      />
      {/* @ts-ignore */}
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{ title: 'Estadísticas' }}
      />
      {/* @ts-ignore */}
      <Tab.Screen
        name="More"
        component={MoreScreen}
        options={{ title: 'Más' }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  const { colors } = useTheme();
  
  return (
    // @ts-ignore
    <NavigationContainer>
      {/* @ts-ignore */}
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
        } as any}
      >
        {/* @ts-ignore */}
        <Stack.Screen
          name="Main"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        {/* @ts-ignore */}
        <Stack.Screen
          name="AddTransaction"
          component={AddTransactionScreen}
          options={{
            title: 'Nueva Transacción',
            presentation: 'modal',
          }}
        />
        {/* @ts-ignore */}
        <Stack.Screen
          name="AddAccount"
          component={AddAccountScreen}
          options={{
            title: 'Nueva cuenta',
            presentation: 'modal',
          }}
        />
        {/* @ts-ignore */}
        <Stack.Screen
          name="Transfer"
          component={TransferScreen}
          options={{
            title: 'Transferencia',
            presentation: 'modal',
          }}
        />
        {/* @ts-ignore */}
        <Stack.Screen
          name="AddGoal"
          component={AddGoalScreen}
          options={{
            title: 'Nueva meta',
            presentation: 'modal',
          }}
        />
        {/* @ts-ignore */}
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
        {/* @ts-ignore */}
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
        {/* @ts-ignore */}
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
        {/* @ts-ignore */}
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
        {/* @ts-ignore */}
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
        {/* @ts-ignore */}
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
        {/* @ts-ignore */}
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
        {/* @ts-ignore */}
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
        {/* @ts-ignore */}
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
        {/* @ts-ignore */}
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};
