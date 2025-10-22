import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction, Category, Budget, Goal, RecurringPayment, Account, User } from '../types';

interface AppState {
  // Transactions
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  getTransactionsByDateRange: (startDate: string, endDate: string) => Transaction[];

  // Categories
  categories: Category[];
  addCategory: (category: Omit<Category, 'id' | 'createdAt'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Budgets
  budgets: Budget[];
  addBudget: (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt' | 'spent'>) => void;
  updateBudget: (id: string, budget: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  recalculateBudgetsSpent: () => void;

  // Goals
  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateGoal: (id: string, goal: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  addToGoal: (id: string, amount: number) => void;

  // Recurring Payments
  recurringPayments: RecurringPayment[];
  addRecurringPayment: (payment: Omit<RecurringPayment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRecurringPayment: (id: string, payment: Partial<RecurringPayment>) => void;
  deleteRecurringPayment: (id: string) => void;

  // Accounts
  accounts: Account[];
  addAccount: (account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateAccount: (id: string, account: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  transferMoney: (params: {
    sourceAccountId: string;
    destinationAccountId: string;
    amount: number;
    description: string;
  }) => void;

  // Settings
  preferredCurrency: string;
  setPreferredCurrency: (currency: string) => void;
  conversionCurrency: string; // Secondary currency for conversions/comparisons
  setConversionCurrency: (currency: string) => void;
  decimalPlaces: number;
  setDecimalPlaces: (places: number) => void;
  dateFormat: string; // 'dd/mm/yyyy' | 'mm/dd/yyyy' | 'yyyy/mm/dd'
  setDateFormat: (format: string) => void;
  monthStart: number; // 1-28 (day of month when budget period starts)
  setMonthStart: (day: number) => void;

  // Favorite exchange rate (for quick display)
  favoriteExchangeRate: string; // 'HNL' | 'USD' | 'EUR'
  setFavoriteExchangeRate: (rate: string) => void;

  // Theme
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  accentColor: string; // 'blue' | 'purple' | 'pink' | 'green' | 'orange' | 'red'
  setAccentColor: (color: string) => void;

  // Onboarding
  hasCompletedOnboarding: boolean;
  completeOnboarding: () => void;

  // User Authentication
  user: User | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  register: (fullName: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  updateUserProfile: (user: Partial<User>) => void;

  // Security
  biometricEnabled: boolean;
  pinEnabled: boolean;
  pin: string;
  setBiometricEnabled: (enabled: boolean) => void;
  setPinEnabled: (enabled: boolean) => void;
  setPin: (pin: string) => void;
  validatePin: (pin: string) => boolean;

  // Initialization
  initializeDefaultData: () => void;
  isInitialized: boolean;
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const defaultCategories: Omit<Category, 'id' | 'createdAt'>[] = [
  // Income categories
  { name: 'Salario', icon: 'briefcase', color: '#10B981', type: 'income', isDefault: true },
  { name: 'Freelance', icon: 'laptop', color: '#3B82F6', type: 'income', isDefault: true },
  { name: 'Inversiones', icon: 'trending-up', color: '#8B5CF6', type: 'income', isDefault: true },
  { name: 'Otros Ingresos', icon: 'cash', color: '#06B6D4', type: 'income', isDefault: true },

  // Expense categories
  { name: 'Alimentación', icon: 'restaurant', color: '#EF4444', type: 'expense', isDefault: true },
  { name: 'Transporte', icon: 'car', color: '#F59E0B', type: 'expense', isDefault: true },
  { name: 'Vivienda', icon: 'home', color: '#8B5CF6', type: 'expense', isDefault: true },
  { name: 'Entretenimiento', icon: 'game-controller', color: '#EC4899', type: 'expense', isDefault: true },
  { name: 'Salud', icon: 'medkit', color: '#10B981', type: 'expense', isDefault: true },
  { name: 'Educación', icon: 'school', color: '#3B82F6', type: 'expense', isDefault: true },
  { name: 'Compras', icon: 'cart', color: '#06B6D4', type: 'expense', isDefault: true },
  { name: 'Servicios', icon: 'flash', color: '#6B7280', type: 'expense', isDefault: true },
  { name: 'Otros Gastos', icon: 'close-circle', color: '#94A3B8', type: 'expense', isDefault: true },
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      transactions: [],
      categories: [],
      budgets: [],
      goals: [],
      recurringPayments: [],
      accounts: [],
      preferredCurrency: 'HNL',
      conversionCurrency: 'USD',
      decimalPlaces: 2,
      dateFormat: 'dd/mm/yyyy',
      monthStart: 1,
      favoriteExchangeRate: 'USD',
      theme: 'dark',
      accentColor: 'blue',
      isInitialized: false,
      hasCompletedOnboarding: false,
      user: null,
      isLoggedIn: false,
      biometricEnabled: false,
      pinEnabled: false,
      pin: '',

      // Transaction actions
      addTransaction: (transaction) => {
        const now = new Date().toISOString();
        const newTransaction: Transaction = {
          ...transaction,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };

        // Calculate updates needed
        let accountUpdates: any = null;
        let budgetUpdates: Array<{ id: string; spent: number }> = [];

        // Prepare account balance update if accountId is provided
        if (transaction.accountId) {
          const account = get().accounts.find(a => a.id === transaction.accountId);
          if (account) {
            const newBalance = transaction.type === 'income'
              ? account.balance + transaction.amount
              : account.balance - transaction.amount;

            accountUpdates = {
              id: account.id,
              balance: newBalance,
            };
          }
        }

        // Prepare budget spent updates if applicable
        if (transaction.type === 'expense') {
          budgetUpdates = get().budgets
            .filter(b => b.categoryIds.includes(transaction.categoryId))
            .map(budget => ({
              id: budget.id,
              spent: budget.spent + transaction.amount,
            }));
        }

        // Apply all updates in a single state update
        set((state) => {
          const newState: any = {
            transactions: [newTransaction, ...state.transactions],
            accounts: state.accounts,
            budgets: state.budgets,
          };

          // Update account if needed
          if (accountUpdates) {
            newState.accounts = state.accounts.map(a =>
              a.id === accountUpdates.id
                ? { ...a, ...accountUpdates, updatedAt: now }
                : a
            );
          }

          // Update budgets if needed
          if (budgetUpdates.length > 0) {
            newState.budgets = state.budgets.map(b => {
              const update = budgetUpdates.find(u => u.id === b.id);
              return update
                ? { ...b, spent: update.spent, updatedAt: now }
                : b;
            });
          }

          return newState;
        });
      },

      updateTransaction: (id, transaction) => {
        const oldTransaction = get().transactions.find(t => t.id === id);

        // Handle account balance adjustments if amount or type changed
        if (oldTransaction && (transaction.amount !== undefined || transaction.type !== undefined)) {
          const amount = transaction.amount ?? oldTransaction.amount;
          const type = transaction.type ?? oldTransaction.type;
          const accountId = transaction.accountId ?? oldTransaction.accountId;

          // If account changed or amount/type changed, we need to update account balances
          if (oldTransaction.accountId && oldTransaction.accountId !== accountId) {
            // Reverse effect on old account
            const oldAccount = get().accounts.find(a => a.id === oldTransaction.accountId);
            if (oldAccount) {
              const newBalance = oldTransaction.type === 'income'
                ? oldAccount.balance - oldTransaction.amount
                : oldAccount.balance + oldTransaction.amount;
              get().updateAccount(oldAccount.id, { balance: newBalance });
            }
          } else if (oldTransaction.amount !== amount || oldTransaction.type !== type) {
            // Same account, but amount or type changed
            const account = get().accounts.find(a => a.id === oldTransaction.accountId);
            if (account) {
              // First reverse the old transaction
              let newBalance = oldTransaction.type === 'income'
                ? account.balance - oldTransaction.amount
                : account.balance + oldTransaction.amount;

              // Then apply the new transaction
              newBalance = type === 'income'
                ? newBalance + amount
                : newBalance - amount;

              get().updateAccount(account.id, { balance: newBalance });
            }
          }

          // Apply new transaction if account is being set
          if (accountId && !oldTransaction.accountId) {
            const account = get().accounts.find(a => a.id === accountId);
            if (account) {
              const newBalance = type === 'income'
                ? account.balance + amount
                : account.balance - amount;
              get().updateAccount(account.id, { balance: newBalance });
            }
          }

          // Handle budget spent adjustments if amount, type, or category changed
          const categoryId = transaction.categoryId ?? oldTransaction.categoryId;
          const newType = transaction.type ?? oldTransaction.type;
          const newAmount = transaction.amount ?? oldTransaction.amount;

          // If category or amount or type changed
          if (oldTransaction.categoryId !== categoryId || oldTransaction.amount !== newAmount || oldTransaction.type !== newType) {
            // If it was an expense before, reverse the old amount from old category budgets
            if (oldTransaction.type === 'expense') {
              get().budgets
                .filter(b => b.categoryIds.includes(oldTransaction.categoryId))
                .forEach(budget => {
                  get().updateBudget(budget.id, {
                    spent: Math.max(0, budget.spent - oldTransaction.amount),
                  });
                });
            }

            // If it's an expense now, add the new amount to new category budgets
            if (newType === 'expense') {
              get().budgets
                .filter(b => b.categoryIds.includes(categoryId))
                .forEach(budget => {
                  get().updateBudget(budget.id, {
                    spent: budget.spent + newAmount,
                  });
                });
            }
          }
        }

        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id
              ? { ...t, ...transaction, updatedAt: new Date().toISOString() }
              : t
          ),
        }));
      },

      deleteTransaction: (id) => {
        const transaction = get().transactions.find(t => t.id === id);

        if (transaction && transaction.accountId) {
          // Reverse the transaction effect on the account
          const account = get().accounts.find(a => a.id === transaction.accountId);
          if (account) {
            const newBalance = transaction.type === 'income'
              ? account.balance - transaction.amount
              : account.balance + transaction.amount;

            get().updateAccount(account.id, {
              balance: newBalance,
            });
          }
        }

        // Reverse budget spent if applicable
        if (transaction?.categoryId && transaction.type === 'expense') {
          get().budgets
            .filter(b => b.categoryIds.includes(transaction.categoryId))
            .forEach(budget => {
              get().updateBudget(budget.id, {
                spent: Math.max(0, budget.spent - transaction.amount),
              });
            });
        }

        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        }));
      },

      getTransactionsByDateRange: (startDate, endDate) => {
        return get().transactions.filter(
          (t) => t.date >= startDate && t.date <= endDate
        );
      },

      // Category actions
      addCategory: (category) => {
        const newCategory: Category = {
          ...category,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          categories: [...state.categories, newCategory],
        }));
      },

      updateCategory: (id, category) => {
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, ...category } : c
          ),
        }));
      },

      deleteCategory: (id) => {
        const category = get().categories.find(c => c.id === id);
        if (category?.isDefault) return; // No permitir eliminar categorías por defecto

        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        }));
      },

      // Budget actions
      addBudget: (budget) => {
        const now = new Date().toISOString();
        const newBudget: Budget = {
          ...budget,
          id: generateId(),
          spent: 0,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          budgets: [...state.budgets, newBudget],
        }));
      },

      updateBudget: (id, budget) => {
        set((state) => {
          const budgets = state.budgets.map((b) => {
            if (b.id === id) {
              const updatedBudget = { ...b, ...budget, updatedAt: new Date().toISOString() };

              // Si se actualizan las fechas o categorías, recalcular el spent
              if (budget.startDate || budget.endDate || budget.categoryIds) {
                const startDate = new Date(budget.startDate || b.startDate);
                const endDate = new Date(budget.endDate || b.endDate);
                const categoryIds = budget.categoryIds || b.categoryIds;

                // Recalcular spent basado en transacciones en el nuevo período
                const spent = state.transactions
                  .filter(t => {
                    const transactionDate = new Date(t.date);
                    return (
                      t.type === 'expense' &&
                      categoryIds.includes(t.categoryId) &&
                      transactionDate >= startDate &&
                      transactionDate <= endDate
                    );
                  })
                  .reduce((sum, t) => sum + t.amount, 0);

                updatedBudget.spent = spent;
              }

              return updatedBudget;
            }
            return b;
          });

          return { budgets };
        });
      },

      deleteBudget: (id) => {
        set((state) => ({
          budgets: state.budgets.filter((b) => b.id !== id),
        }));
      },

      recalculateBudgetsSpent: () => {
        set((state) => {
          const budgets = state.budgets.map((budget) => {
            const startDate = new Date(budget.startDate);
            const endDate = new Date(budget.endDate);

            // Recalcular spent basado en transacciones en el período
            const spent = state.transactions
              .filter(t => {
                const transactionDate = new Date(t.date);
                return (
                  t.type === 'expense' &&
                  budget.categoryIds.includes(t.categoryId) &&
                  transactionDate >= startDate &&
                  transactionDate <= endDate
                );
              })
              .reduce((sum, t) => sum + t.amount, 0);

            return { ...budget, spent };
          });

          return { budgets };
        });
      },

      // Goal actions
      addGoal: (goal) => {
        const now = new Date().toISOString();
        const newGoal: Goal = {
          ...goal,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          goals: [...state.goals, newGoal],
        }));
      },

      updateGoal: (id, goal) => {
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === id
              ? { ...g, ...goal, updatedAt: new Date().toISOString() }
              : g
          ),
        }));
      },

      deleteGoal: (id) => {
        set((state) => ({
          goals: state.goals.filter((g) => g.id !== id),
        }));
      },

      addToGoal: (id, amount) => {
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === id
              ? {
                ...g,
                currentAmount: g.currentAmount + amount,
                updatedAt: new Date().toISOString(),
              }
              : g
          ),
        }));
      },

      // Recurring Payment actions
      addRecurringPayment: (payment) => {
        const now = new Date().toISOString();
        const newPayment: RecurringPayment = {
          ...payment,
          paid: false,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          recurringPayments: [...state.recurringPayments, newPayment],
        }));
      },

      updateRecurringPayment: (id, payment) => {
        set((state) => ({
          recurringPayments: state.recurringPayments.map((p) =>
            p.id === id
              ? { ...p, ...payment, updatedAt: new Date().toISOString() }
              : p
          ),
        }));
      },

      deleteRecurringPayment: (id) => {
        set((state) => ({
          recurringPayments: state.recurringPayments.filter((p) => p.id !== id),
        }));
      },

      // Account actions
      addAccount: (account) => {
        const now = new Date().toISOString();
        const newAccount: Account = {
          ...account,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          accounts: [...state.accounts, newAccount],
        }));
      },

      updateAccount: (id, account) => {
        set((state) => ({
          accounts: state.accounts.map((a) =>
            a.id === id
              ? { ...a, ...account, updatedAt: new Date().toISOString() }
              : a
          ),
        }));
      },

      deleteAccount: (id) => {
        set((state) => ({
          accounts: state.accounts.filter((a) => a.id !== id),
        }));
      },

      transferMoney: ({ sourceAccountId, destinationAccountId, amount, description }) => {
        const sourceAccount = get().accounts.find(a => a.id === sourceAccountId);
        const destinationAccount = get().accounts.find(a => a.id === destinationAccountId);

        if (!sourceAccount || !destinationAccount || amount <= 0) {
          return;
        }

        // Usar la fecha y hora actual del dispositivo
        const transferDate = new Date().toISOString();

        // Create transaction for source account (expense)
        const expenseTransaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> = {
          type: 'expense',
          amount,
          categoryId: 'transfer', // Special category for transfers
          accountId: sourceAccountId,
          description: `Transferencia a ${destinationAccount.title}`,
          date: transferDate,
        };

        // Create transaction for destination account (income)
        const incomeTransaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> = {
          type: 'income',
          amount,
          categoryId: 'transfer', // Special category for transfers
          accountId: destinationAccountId,
          description: `Transferencia desde ${sourceAccount.title}`,
          date: transferDate,
        };

        // Update account balances
        get().updateAccount(sourceAccountId, {
          balance: sourceAccount.balance - amount,
        });

        get().updateAccount(destinationAccountId, {
          balance: destinationAccount.balance + amount,
        });

        // Create transactions
        const now = new Date().toISOString();
        const expenseId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const incomeId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        set((state) => ({
          transactions: [
            {
              ...expenseTransaction,
              id: expenseId,
              createdAt: now,
              updatedAt: now,
            },
            {
              ...incomeTransaction,
              id: incomeId,
              createdAt: now,
              updatedAt: now,
            },
            ...state.transactions,
          ],
        }));
      },
      setPreferredCurrency: (currency) => {
        set({ preferredCurrency: currency });
      },

      setConversionCurrency: (currency) => {
        set({ conversionCurrency: currency });
      },

      setDecimalPlaces: (places) => {
        set({ decimalPlaces: places });
      },

      setDateFormat: (format) => {
        set({ dateFormat: format });
      },

      setMonthStart: (day) => {
        set({ monthStart: day });
      },

      setFavoriteExchangeRate: (rate) => {
        set({ favoriteExchangeRate: rate });
      },

      setTheme: (theme) => {
        set({ theme });
      },

      setAccentColor: (color) => {
        set({ accentColor: color });
      },

      completeOnboarding: () => {
        set({ hasCompletedOnboarding: true });
      },

      // Authentication
      login: async (email: string, password: string) => {
        // Simple local authentication (simulated - in real app would connect to backend)
        if (!email || !password) {
          return { success: false, error: 'Por favor completa todos los campos' };
        }

        if (password.length < 6) {
          return { success: false, error: 'La contraseña debe tener al menos 6 caracteres' };
        }

        // Simulated successful login
        const user: User = {
          id: generateId(),
          fullName: email.split('@')[0],
          email,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set({ user, isLoggedIn: true });
        return { success: true };
      },

      logout: () => {
        set({ user: null, isLoggedIn: false });
      },

      register: async (fullName: string, email: string, password: string) => {
        // Simple local registration (simulated - in real app would connect to backend)
        if (!fullName || !email || !password) {
          return { success: false, error: 'Por favor completa todos los campos' };
        }

        if (password.length < 6) {
          return { success: false, error: 'La contraseña debe tener al menos 6 caracteres' };
        }

        // Simple email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return { success: false, error: 'Por favor ingresa un correo válido' };
        }

        // Simulated successful registration
        const user: User = {
          id: generateId(),
          fullName,
          email,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set({ user, isLoggedIn: true });
        return { success: true };
      },

      updateUserProfile: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser: User = {
            ...currentUser,
            ...userData,
            updatedAt: new Date().toISOString(),
          };
          set({ user: updatedUser });
        }
      },

      // Security
      setBiometricEnabled: (enabled) => {
        set({ biometricEnabled: enabled });
      },

      setPinEnabled: (enabled) => {
        set({ pinEnabled: enabled });
      },

      setPin: (pin) => {
        set({ pin });
      },

      validatePin: (pin) => {
        return get().pin === pin;
      },

      // Initialize default data
      initializeDefaultData: () => {
        if (get().isInitialized) return;

        const categories = defaultCategories.map((cat) => ({
          ...cat,
          id: generateId(),
          createdAt: new Date().toISOString(),
        }));

        set({
          categories,
          isInitialized: true,
        });
      },
    }),
    {
      name: 'kontto-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
