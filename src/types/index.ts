export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  accountId?: string;
  description: string;
  date: string;
  isRecurring?: boolean;
  recurringId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
  isDefault: boolean;
  createdAt: string;
}

export interface Budget {
  id: string;
  categoryIds: string[]; // Array de categorías para permitir múltiples categorías en un presupuesto
  amount: number;
  currency: string; // Moneda del presupuesto
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
  spent: number;
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  currency: string;
  currentAmount: number;
  targetAmount: number;
  targetDate: string;
  includeInTotal: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RecurringPayment {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';
  nextDate: string;
  isActive: boolean;
  reminderEnabled: boolean;
  reminderDaysBefore: number;
  createdAt: string;
  updatedAt: string;
}

export type AccountType = 'normal' | 'savings' | 'credit';

export interface Account {
  id: string;
  title: string;
  icon: string;
  color: string;
  description?: string;
  type: AccountType;
  currency: string;
  balance: number;
  creditLimit?: number;
  includeInTotal: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  monthlyBalance: number;
}

export interface CategoryStats {
  categoryId: string;
  categoryName: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface MonthlyData {
  month: string;
  income: number;
  expense: number;
  balance: number;
}
