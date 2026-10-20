import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Household,
  HouseholdMember,
  Wallet,
  Category,
  Transaction,
  ShoppingList,
  ShoppingItem,
  PantryItem,
  Bill,
  HouseholdTask,
  Recipe,
  MealPlanDay,
  Debt,
  SavingsGoal,
  Asset,
  MaintenanceRecord,
  DocumentRecord,
  EmergencyContact,
  AppNotification,
  MemberRole
} from '../types';
import {
  initialHousehold,
  initialMembers,
  initialWallets,
  initialCategories,
  initialTransactions,
  initialShoppingLists,
  initialPantryItems,
  initialBills,
  initialTasks,
  initialRecipes,
  initialMealPlan,
  initialDebts,
  initialSavingsGoals,
  initialAssets,
  initialMaintenanceRecords,
  initialDocuments,
  initialEmergencyContacts,
  initialNotifications,
} from '../data/initialData';
import { generateId } from '../utils/formatters';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error' | 'warning';
}

interface AppContextType {
  // Household & Member
  household: Household;
  updateHousehold: (updated: Partial<Household>) => void;
  members: HouseholdMember[];
  currentMember: HouseholdMember;
  setCurrentMemberId: (id: string) => void;
  addMember: (member: Omit<HouseholdMember, 'id'>) => void;
  deleteMember: (id: string) => void;

  // Wallets & Transactions
  wallets: Wallet[];
  addWallet: (wallet: Omit<Wallet, 'id'>) => void;
  updateWallet: (id: string, updated: Partial<Wallet>) => void;
  deleteWallet: (id: string) => void;
  categories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategoryBudget: (categoryId: string, budgetLimit: number) => void;
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;

  // Shopping
  shoppingLists: ShoppingList[];
  addShoppingList: (name: string, storeType?: ShoppingList['storeType']) => void;
  deleteShoppingList: (listId: string) => void;
  addShoppingItem: (listId: string, item: Omit<ShoppingItem, 'id'>) => void;
  toggleItemPurchased: (listId: string, itemId: string, actualPrice?: number) => void;
  deleteShoppingItem: (listId: string, itemId: string) => void;
  transferPurchasedToPantry: (listId: string) => void;

  // Pantry
  pantryItems: PantryItem[];
  addPantryItem: (item: Omit<PantryItem, 'id'>) => void;
  updatePantryQty: (id: string, delta: number) => void;
  deletePantryItem: (id: string) => void;
  sendPantryItemToShoppingList: (item: PantryItem, listId?: string) => void;

  // Bills
  bills: Bill[];
  addBill: (bill: Omit<Bill, 'id'>) => void;
  payBill: (billId: string, walletId: string, amount: number) => void;
  deleteBill: (id: string) => void;

  // Tasks
  tasks: HouseholdTask[];
  addTask: (task: Omit<HouseholdTask, 'id'>) => void;
  toggleTaskStatus: (id: string) => void;
  deleteTask: (id: string) => void;

  // Meals & Recipes
  recipes: Recipe[];
  addRecipe: (recipe: Omit<Recipe, 'id'>) => void;
  mealPlan: MealPlanDay[];
  updateMealPlanDay: (date: string, field: 'breakfast' | 'lunch' | 'dinner' | 'notes', value: string) => void;

  // Debts & Savings
  debts: Debt[];
  addDebt: (debt: Omit<Debt, 'id' | 'remainingAmount' | 'payments' | 'status'>) => void;
  recordDebtPayment: (debtId: string, amount: number, note?: string) => void;
  savingsGoals: SavingsGoal[];
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => void;
  contributeToSavings: (goalId: string, amount: number, fromWalletId?: string) => void;

  // Assets & Maintenance
  assets: Asset[];
  addAsset: (asset: Omit<Asset, 'id'>) => void;
  deleteAsset: (id: string) => void;
  maintenanceRecords: MaintenanceRecord[];
  addMaintenanceRecord: (rec: Omit<MaintenanceRecord, 'id'>, payFromWalletId?: string) => void;

  // Docs & Contacts
  documents: DocumentRecord[];
  addDocument: (doc: Omit<DocumentRecord, 'id'>) => void;
  deleteDocument: (id: string) => void;
  emergencyContacts: EmergencyContact[];
  addEmergencyContact: (contact: Omit<EmergencyContact, 'id'>) => void;

  // Notifications
  notifications: AppNotification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // System & Export
  toasts: Toast[];
  showToast: (message: string, type?: Toast['type']) => void;
  exportBackupJSON: () => void;
  importBackupJSON: (jsonStr: string) => boolean;
  exportTransactionsCSV: () => void;
  resetAllDataToDefault: () => void;

  // Permissions helper
  canAccessFinances: () => boolean;
  canEditHousehold: () => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'minha_casa_ao_db_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Try loading from localStorage
  const loadSaved = <T,>(key: string, fallback: T): T => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_${key}`);
      return saved ? JSON.parse(saved) : fallback;
    } catch {
      return fallback;
    }
  };

  const [household, setHousehold] = useState<Household>(() => loadSaved('household', initialHousehold));
  const [members, setMembers] = useState<HouseholdMember[]>(() => loadSaved('members', initialMembers));
  const [currentMemberId, setCurrentMemberId] = useState<string>(() => members[0]?.id || 'mem_1');

  const [wallets, setWallets] = useState<Wallet[]>(() => loadSaved('wallets', initialWallets));
  const [categories, setCategories] = useState<Category[]>(() => loadSaved('categories', initialCategories));
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadSaved('transactions', initialTransactions));
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>(() => loadSaved('shoppingLists', initialShoppingLists));
  const [pantryItems, setPantryItems] = useState<PantryItem[]>(() => loadSaved('pantry', initialPantryItems));
  const [bills, setBills] = useState<Bill[]>(() => loadSaved('bills', initialBills));
  const [tasks, setTasks] = useState<HouseholdTask[]>(() => loadSaved('tasks', initialTasks));
  const [recipes, setRecipes] = useState<Recipe[]>(() => loadSaved('recipes', initialRecipes));
  const [mealPlan, setMealPlan] = useState<MealPlanDay[]>(() => loadSaved('mealPlan', initialMealPlan));
  const [debts, setDebts] = useState<Debt[]>(() => loadSaved('debts', initialDebts));
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => loadSaved('savingsGoals', initialSavingsGoals));
  const [assets, setAssets] = useState<Asset[]>(() => loadSaved('assets', initialAssets));
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>(() => loadSaved('maintenance', initialMaintenanceRecords));
  const [documents, setDocuments] = useState<DocumentRecord[]>(() => loadSaved('documents', initialDocuments));
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>(() => loadSaved('contacts', initialEmergencyContacts));
  const [notifications, setNotifications] = useState<AppNotification[]>(() => loadSaved('notifications', initialNotifications));

  const [toasts, setToasts] = useState<Toast[]>([]);

  // Show Toast
  const showToast = (message: string, type: Toast['type'] = 'success') => {
    const id = generateId('toast');
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_household`, JSON.stringify(household));
      localStorage.setItem(`${STORAGE_KEY}_members`, JSON.stringify(members));
      localStorage.setItem(`${STORAGE_KEY}_wallets`, JSON.stringify(wallets));
      localStorage.setItem(`${STORAGE_KEY}_categories`, JSON.stringify(categories));
      localStorage.setItem(`${STORAGE_KEY}_transactions`, JSON.stringify(transactions));
      localStorage.setItem(`${STORAGE_KEY}_shoppingLists`, JSON.stringify(shoppingLists));
      localStorage.setItem(`${STORAGE_KEY}_pantry`, JSON.stringify(pantryItems));
      localStorage.setItem(`${STORAGE_KEY}_bills`, JSON.stringify(bills));
      localStorage.setItem(`${STORAGE_KEY}_tasks`, JSON.stringify(tasks));
      localStorage.setItem(`${STORAGE_KEY}_recipes`, JSON.stringify(recipes));
      localStorage.setItem(`${STORAGE_KEY}_mealPlan`, JSON.stringify(mealPlan));
      localStorage.setItem(`${STORAGE_KEY}_debts`, JSON.stringify(debts));
      localStorage.setItem(`${STORAGE_KEY}_savingsGoals`, JSON.stringify(savingsGoals));
      localStorage.setItem(`${STORAGE_KEY}_assets`, JSON.stringify(assets));
      localStorage.setItem(`${STORAGE_KEY}_maintenance`, JSON.stringify(maintenanceRecords));
      localStorage.setItem(`${STORAGE_KEY}_documents`, JSON.stringify(documents));
      localStorage.setItem(`${STORAGE_KEY}_contacts`, JSON.stringify(emergencyContacts));
      localStorage.setItem(`${STORAGE_KEY}_notifications`, JSON.stringify(notifications));
    } catch {
      // Ignore quota errors
    }
  }, [
    household,
    members,
    wallets,
    categories,
    transactions,
    shoppingLists,
    pantryItems,
    bills,
    tasks,
    recipes,
    mealPlan,
    debts,
    savingsGoals,
    assets,
    maintenanceRecords,
    documents,
    emergencyContacts,
    notifications,
  ]);

  const currentMember = members.find((m) => m.id === currentMemberId) || members[0] || initialMembers[0];

  const canAccessFinances = () => {
    return currentMember.role === 'admin' || currentMember.role === 'adult';
  };

  const canEditHousehold = () => {
    return currentMember.role === 'admin';
  };

  // Actions
  const updateHousehold = (updated: Partial<Household>) => {
    setHousehold((prev) => ({ ...prev, ...updated }));
    showToast('Dados da residência atualizados');
  };

  const addMember = (m: Omit<HouseholdMember, 'id'>) => {
    const newMember: HouseholdMember = { ...m, id: generateId('mem') };
    setMembers((prev) => [...prev, newMember]);
    showToast(`Membro ${newMember.name} adicionado`);
  };

  const deleteMember = (id: string) => {
    if (members.length <= 1) {
      showToast('A casa precisa ter pelo menos um membro', 'error');
      return;
    }
    setMembers((prev) => prev.filter((m) => m.id !== id));
    if (currentMemberId === id) {
      const remaining = members.filter((m) => m.id !== id);
      setCurrentMemberId(remaining[0].id);
    }
    showToast('Membro removido');
  };

  // Wallets & Transactions
  const addWallet = (w: Omit<Wallet, 'id'>) => {
    const newWallet: Wallet = { ...w, id: generateId('wal') };
    setWallets((prev) => [...prev, newWallet]);
    showToast(`Carteira ${newWallet.name} criada com sucesso`);
  };

  const updateWallet = (id: string, updated: Partial<Wallet>) => {
    setWallets((prev) => prev.map((w) => (w.id === id ? { ...w, ...updated } : w)));
    showToast('Carteira atualizada');
  };

  const deleteWallet = (id: string) => {
    if (wallets.length <= 1) {
      showToast('Mantenha pelo menos uma carteira ativa', 'error');
      return;
    }
    setWallets((prev) => prev.filter((w) => w.id !== id));
    showToast('Carteira removida');
  };

  const addCategory = (c: Omit<Category, 'id'>) => {
    const newCat: Category = { ...c, id: generateId('cat') };
    setCategories((prev) => [...prev, newCat]);
    showToast(`Categoria ${newCat.name} criada`);
  };

  const updateCategoryBudget = (categoryId: string, budgetLimit: number) => {
    setCategories((prev) => prev.map((c) => (c.id === categoryId ? { ...c, budgetLimit } : c)));
    showToast('Limite de orçamento ajustado');
  };

  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = { ...tx, id: generateId('tx') };

    // Update wallet balances accurately
    setWallets((prev) =>
      prev.map((w) => {
        if (newTx.type === 'income' && w.id === newTx.walletId) {
          return { ...w, balance: w.balance + newTx.amount };
        }
        if (newTx.type === 'expense' && w.id === newTx.walletId) {
          return { ...w, balance: w.balance - newTx.amount };
        }
        if (newTx.type === 'transfer') {
          if (w.id === newTx.walletId) {
            return { ...w, balance: w.balance - newTx.amount };
          }
          if (w.id === newTx.toWalletId) {
            return { ...w, balance: w.balance + newTx.amount };
          }
        }
        return w;
      })
    );

    setTransactions((prev) => [newTx, ...prev]);
    showToast(
      newTx.type === 'income'
        ? 'Receita registada com sucesso!'
        : newTx.type === 'expense'
        ? 'Despesa registada com sucesso!'
        : 'Transferência entre carteiras realizada!'
    );
  };

  const deleteTransaction = (id: string) => {
    const tx = transactions.find((t) => t.id === id);
    if (!tx) return;

    // Reverse wallet changes
    setWallets((prev) =>
      prev.map((w) => {
        if (tx.type === 'income' && w.id === tx.walletId) {
          return { ...w, balance: w.balance - tx.amount };
        }
        if (tx.type === 'expense' && w.id === tx.walletId) {
          return { ...w, balance: w.balance + tx.amount };
        }
        if (tx.type === 'transfer') {
          if (w.id === tx.walletId) {
            return { ...w, balance: w.balance + tx.amount };
          }
          if (w.id === tx.toWalletId) {
            return { ...w, balance: w.balance - tx.amount };
          }
        }
        return w;
      })
    );

    setTransactions((prev) => prev.filter((t) => t.id !== id));
    showToast('Transação eliminada e saldo reposto');
  };

  // Shopping
  const addShoppingList = (name: string, storeType?: ShoppingList['storeType']) => {
    const newList: ShoppingList = {
      id: generateId('list'),
      name,
      storeType,
      isCompleted: false,
      items: [],
    };
    setShoppingLists((prev) => [...prev, newList]);
    showToast(`Lista "${name}" criada`);
  };

  const deleteShoppingList = (listId: string) => {
    setShoppingLists((prev) => prev.filter((l) => l.id !== listId));
    showToast('Lista de compras eliminada');
  };

  const addShoppingItem = (listId: string, item: Omit<ShoppingItem, 'id'>) => {
    const newItem: ShoppingItem = { ...item, id: generateId('item') };
    setShoppingLists((prev) =>
      prev.map((l) => (l.id === listId ? { ...l, items: [...l.items, newItem] } : l))
    );
    showToast(`Item "${newItem.name}" adicionado à lista`);
  };

  const toggleItemPurchased = (listId: string, itemId: string, actualPrice?: number) => {
    setShoppingLists((prev) =>
      prev.map((l) => {
        if (l.id !== listId) return l;
        const updatedItems = l.items.map((it) => {
          if (it.id !== itemId) return it;
          const nextState = !it.isPurchased;
          return {
            ...it,
            isPurchased: nextState,
            actualPrice: nextState ? (actualPrice !== undefined ? actualPrice : it.estimatedPrice) : it.actualPrice,
          };
        });
        return { ...l, items: updatedItems };
      })
    );
  };

  const deleteShoppingItem = (listId: string, itemId: string) => {
    setShoppingLists((prev) =>
      prev.map((l) => (l.id === listId ? { ...l, items: l.items.filter((it) => it.id !== itemId) } : l))
    );
  };

  const transferPurchasedToPantry = (listId: string) => {
    const list = shoppingLists.find((l) => l.id === listId);
    if (!list) return;

    const purchased = list.items.filter((it) => it.isPurchased && !it.addedToPantry);
    if (purchased.length === 0) {
      showToast('Nenhum item comprado disponível para transferir', 'info');
      return;
    }

    // Add or increment in pantry
    setPantryItems((prev) => {
      const updated = [...prev];
      purchased.forEach((item) => {
        const existing = updated.find((p) => p.name.toLowerCase().trim() === item.name.toLowerCase().trim());
        if (existing) {
          existing.currentQty += item.quantity;
          existing.purchaseDate = new Date().toISOString().split('T')[0];
          if (item.actualPrice) existing.lastRestockedPrice = item.actualPrice;
        } else {
          updated.push({
            id: generateId('pan'),
            name: item.name,
            category: item.category,
            currentQty: item.quantity,
            minQty: 2,
            unit: item.unit,
            storageLocation: 'despensa',
            purchaseDate: new Date().toISOString().split('T')[0],
            lastRestockedPrice: item.actualPrice || item.estimatedPrice,
          });
        }
      });
      return updated;
    });

    // Mark as addedToPantry in list
    setShoppingLists((prev) =>
      prev.map((l) => {
        if (l.id !== listId) return l;
        return {
          ...l,
          items: l.items.map((it) => (it.isPurchased ? { ...it, addedToPantry: true } : it)),
        };
      })
    );

    showToast(`${purchased.length} produtos transferidos para o stock da despensa!`, 'success');
  };

  // Pantry
  const addPantryItem = (item: Omit<PantryItem, 'id'>) => {
    const newItem: PantryItem = { ...item, id: generateId('pan') };
    setPantryItems((prev) => [...prev, newItem]);
    showToast(`Produto "${newItem.name}" adicionado à despensa`);
  };

  const updatePantryQty = (id: string, delta: number) => {
    setPantryItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const newQty = Math.max(0, parseFloat((item.currentQty + delta).toFixed(2)));
        return { ...item, currentQty: newQty };
      })
    );
  };

  const deletePantryItem = (id: string) => {
    setPantryItems((prev) => prev.filter((p) => p.id !== id));
    showToast('Item retirado da despensa');
  };

  const sendPantryItemToShoppingList = (item: PantryItem, listId?: string) => {
    const targetList = listId
      ? shoppingLists.find((l) => l.id === listId)
      : shoppingLists[0];

    if (!targetList) {
      showToast('Crie primeiro uma lista de compras', 'error');
      return;
    }

    const deficit = Math.max(1, item.minQty - item.currentQty);
    const newItem: ShoppingItem = {
      id: generateId('item'),
      name: item.name,
      category: item.category,
      quantity: deficit,
      unit: item.unit,
      estimatedPrice: item.lastRestockedPrice || 2500,
      storeType: 'praca',
      isPurchased: false,
      priority: 'alta',
      notes: `Reposição de stock (atual: ${item.currentQty} ${item.unit})`,
    };

    setShoppingLists((prev) =>
      prev.map((l) => (l.id === targetList.id ? { ...l, items: [...l.items, newItem] } : l))
    );
    showToast(`"${item.name}" adicionado à lista "${targetList.name}"!`);
  };

  // Bills
  const addBill = (b: Omit<Bill, 'id'>) => {
    const newBill: Bill = { ...b, id: generateId('bill') };
    setBills((prev) => [...prev, newBill]);
    showToast(`Conta "${newBill.title}" registada`);
  };

  const payBill = (billId: string, walletId: string, amount: number) => {
    const bill = bills.find((b) => b.id === billId);
    if (!bill) return;

    const wallet = wallets.find((w) => w.id === walletId);
    if (!wallet) {
      showToast('Selecione uma carteira válida para o pagamento', 'error');
      return;
    }

    // Automatically create transaction for tracking
    const newTx: Transaction = {
      id: generateId('tx'),
      type: 'expense',
      amount,
      categoryId: bill.category.startsWith('ende') || bill.category.startsWith('epal') ? 'cat_luz_agua' : 'cat_renda',
      walletId,
      date: new Date().toISOString().split('T')[0],
      description: `Pagamento de conta: ${bill.title}${bill.meterNumber ? ` (Contador: ${bill.meterNumber})` : ''}`,
      memberId: currentMember.id,
      paymentMethod: wallet.name,
    };

    setWallets((prev) =>
      prev.map((w) => (w.id === walletId ? { ...w, balance: w.balance - amount } : w))
    );
    setTransactions((prev) => [newTx, ...prev]);

    setBills((prev) =>
      prev.map((b) =>
        b.id === billId
          ? {
              ...b,
              status: 'pago',
              paidAmount: amount,
              paidAt: new Date().toISOString().split('T')[0],
              paidFromWalletId: walletId,
            }
          : b
      )
    );

    showToast(`Conta "${bill.title}" liquidada com sucesso!`);
  };

  const deleteBill = (id: string) => {
    setBills((prev) => prev.filter((b) => b.id !== id));
    showToast('Conta eliminada');
  };

  // Tasks
  const addTask = (t: Omit<HouseholdTask, 'id'>) => {
    const newTask: HouseholdTask = { ...t, id: generateId('task') };
    setTasks((prev) => [newTask, ...prev]);
    showToast(`Tarefa "${newTask.title}" adicionada`);
  };

  const toggleTaskStatus = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const nextStatus = t.status === 'concluido' ? 'pendente' : 'concluido';
        if (nextStatus === 'concluido') {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.8 },
          });
        }
        return {
          ...t,
          status: nextStatus,
          completedAt: nextStatus === 'concluido' ? new Date().toISOString().split('T')[0] : undefined,
        };
      })
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    showToast('Tarefa eliminada');
  };

  // Meals & Recipes
  const addRecipe = (r: Omit<Recipe, 'id'>) => {
    const newRecipe: Recipe = { ...r, id: generateId('rec') };
    setRecipes((prev) => [...prev, newRecipe]);
    showToast(`Receita "${newRecipe.name}" guardada`);
  };

  const updateMealPlanDay = (date: string, field: 'breakfast' | 'lunch' | 'dinner' | 'notes', value: string) => {
    setMealPlan((prev) =>
      prev.map((day) => (day.date === date ? { ...day, [field]: value } : day))
    );
  };

  // Debts & Savings
  const addDebt = (d: Omit<Debt, 'id' | 'remainingAmount' | 'payments' | 'status'>) => {
    const newDebt: Debt = {
      ...d,
      id: generateId('debt'),
      remainingAmount: d.totalAmount,
      payments: [],
      status: 'ativo',
    };
    setDebts((prev) => [...prev, newDebt]);
    showToast(
      newDebt.type === 'a_receber'
        ? `Valor a receber de ${newDebt.personName} registado`
        : `Dívida a pagar a ${newDebt.personName} registada`
    );
  };

  const recordDebtPayment = (debtId: string, amount: number, note?: string) => {
    setDebts((prev) =>
      prev.map((d) => {
        if (d.id !== debtId) return d;
        const newRemaining = Math.max(0, d.remainingAmount - amount);
        const newPayment = {
          id: generateId('pay'),
          date: new Date().toISOString().split('T')[0],
          amount,
          note: note || 'Amortização parcial',
        };
        const nextStatus = newRemaining === 0 ? 'liquidado' : 'ativo';
        if (nextStatus === 'liquidado') {
          confetti({ particleCount: 60, spread: 70 });
        }
        return {
          ...d,
          remainingAmount: newRemaining,
          status: nextStatus,
          payments: [newPayment, ...d.payments],
        };
      })
    );
    showToast('Amortização de dívida registada com sucesso');
  };

  const addSavingsGoal = (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => {
    const newGoal: SavingsGoal = {
      ...goal,
      id: generateId('sav'),
      currentAmount: 0,
    };
    setSavingsGoals((prev) => [...prev, newGoal]);
    showToast(`Objetivo "${newGoal.title}" criado`);
  };

  const contributeToSavings = (goalId: string, amount: number, fromWalletId?: string) => {
    if (fromWalletId) {
      const wallet = wallets.find((w) => w.id === fromWalletId);
      if (wallet) {
        setWallets((prev) =>
          prev.map((w) => (w.id === fromWalletId ? { ...w, balance: w.balance - amount } : w))
        );
      }
    }

    setSavingsGoals((prev) =>
      prev.map((g) => {
        if (g.id !== goalId) return g;
        const updated = g.currentAmount + amount;
        if (updated >= g.targetAmount) {
          confetti({ particleCount: 100, spread: 80, origin: { y: 0.7 } });
        }
        return { ...g, currentAmount: updated };
      })
    );
    showToast('Depósito no objetivo de poupança registado!');
  };

  // Assets & Maintenance
  const addAsset = (ast: Omit<Asset, 'id'>) => {
    const newAsset: Asset = { ...ast, id: generateId('ast') };
    setAssets((prev) => [...prev, newAsset]);
    showToast(`Equipamento "${newAsset.name}" registado`);
  };

  const deleteAsset = (id: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
    showToast('Equipamento removido');
  };

  const addMaintenanceRecord = (rec: Omit<MaintenanceRecord, 'id'>, payFromWalletId?: string) => {
    const newRec: MaintenanceRecord = { ...rec, id: generateId('maint') };
    setMaintenanceRecords((prev) => [newRec, ...prev]);

    if (payFromWalletId && rec.cost > 0) {
      setWallets((prev) =>
        prev.map((w) => (w.id === payFromWalletId ? { ...w, balance: w.balance - rec.cost } : w))
      );
      setTransactions((prev) => [
        {
          id: generateId('tx'),
          type: 'expense',
          amount: rec.cost,
          categoryId: 'cat_manutencao',
          walletId: payFromWalletId,
          date: rec.date,
          description: `Manutenção: ${rec.title} (${rec.technicianName || 'Técnico'})`,
          memberId: currentMember.id,
        },
        ...prev,
      ]);
    }

    showToast('Intervenção de manutenção registada');
  };

  // Docs & Contacts
  const addDocument = (doc: Omit<DocumentRecord, 'id'>) => {
    const newDoc: DocumentRecord = { ...doc, id: generateId('doc') };
    setDocuments((prev) => [...prev, newDoc]);
    showToast(`Documento "${newDoc.title}" arquivado`);
  };

  const deleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    showToast('Documento removido');
  };

  const addEmergencyContact = (contact: Omit<EmergencyContact, 'id'>) => {
    const newContact: EmergencyContact = { ...contact, id: generateId('ct') };
    setEmergencyContacts((prev) => [...prev, newContact]);
    showToast(`Contacto "${newContact.name}" adicionado`);
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('Todas as notificações marcadas como lidas');
  };

  // Export JSON Backup
  const exportBackupJSON = () => {
    const data = {
      household,
      members,
      wallets,
      categories,
      transactions,
      shoppingLists,
      pantryItems,
      bills,
      tasks,
      recipes,
      mealPlan,
      debts,
      savingsGoals,
      assets,
      maintenanceRecords,
      documents,
      emergencyContacts,
      exportedAt: new Date().toISOString(),
      app: 'Minha Casa AO',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `minha_casa_ao_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Cópia de segurança descarregada com sucesso');
  };

  // Import JSON Backup
  const importBackupJSON = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed.household || !parsed.wallets) {
        showToast('Ficheiro de cópia de segurança inválido', 'error');
        return false;
      }
      if (parsed.household) setHousehold(parsed.household);
      if (parsed.members) setMembers(parsed.members);
      if (parsed.wallets) setWallets(parsed.wallets);
      if (parsed.categories) setCategories(parsed.categories);
      if (parsed.transactions) setTransactions(parsed.transactions);
      if (parsed.shoppingLists) setShoppingLists(parsed.shoppingLists);
      if (parsed.pantryItems) setPantryItems(parsed.pantryItems);
      if (parsed.bills) setBills(parsed.bills);
      if (parsed.tasks) setTasks(parsed.tasks);
      if (parsed.recipes) setRecipes(parsed.recipes);
      if (parsed.mealPlan) setMealPlan(parsed.mealPlan);
      if (parsed.debts) setDebts(parsed.debts);
      if (parsed.savingsGoals) setSavingsGoals(parsed.savingsGoals);
      if (parsed.assets) setAssets(parsed.assets);
      if (parsed.maintenanceRecords) setMaintenanceRecords(parsed.maintenanceRecords);
      if (parsed.documents) setDocuments(parsed.documents);
      if (parsed.emergencyContacts) setEmergencyContacts(parsed.emergencyContacts);
      showToast('Dados restaurados com sucesso!', 'success');
      return true;
    } catch {
      showToast('Erro ao importar ficheiro', 'error');
      return false;
    }
  };

  // Export Transactions CSV
  const exportTransactionsCSV = () => {
    const header = ['Data', 'Tipo', 'Descrição', 'Valor (Kz)', 'Carteira', 'Membro'];
    const rows = transactions.map((t) => {
      const wName = wallets.find((w) => w.id === t.walletId)?.name || '';
      const mName = members.find((m) => m.id === t.memberId)?.name || '';
      return [
        t.date,
        t.type === 'income' ? 'Receita' : t.type === 'expense' ? 'Despesa' : 'Transferência',
        `"${t.description.replace(/"/g, '""')}"`,
        t.amount,
        `"${wName}"`,
        `"${mName}"`,
      ];
    });

    const csvContent = [header.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `extrato_financeiro_minha_casa_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Ficheiro CSV exportado com sucesso');
  };

  // Reset Data to Seed
  const resetAllDataToDefault = () => {
    setHousehold(initialHousehold);
    setMembers(initialMembers);
    setCurrentMemberId('mem_1');
    setWallets(initialWallets);
    setCategories(initialCategories);
    setTransactions(initialTransactions);
    setShoppingLists(initialShoppingLists);
    setPantryItems(initialPantryItems);
    setBills(initialBills);
    setTasks(initialTasks);
    setRecipes(initialRecipes);
    setMealPlan(initialMealPlan);
    setDebts(initialDebts);
    setSavingsGoals(initialSavingsGoals);
    setAssets(initialAssets);
    setMaintenanceRecords(initialMaintenanceRecords);
    setDocuments(initialDocuments);
    setEmergencyContacts(initialEmergencyContacts);
    setNotifications(initialNotifications);
    showToast('Dados reiniciados com o modelo padrão de Angola');
  };

  return (
    <AppContext.Provider
      value={{
        household,
        updateHousehold,
        members,
        currentMember,
        setCurrentMemberId,
        addMember,
        deleteMember,
        wallets,
        addWallet,
        updateWallet,
        deleteWallet,
        categories,
        addCategory,
        updateCategoryBudget,
        transactions,
        addTransaction,
        deleteTransaction,
        shoppingLists,
        addShoppingList,
        deleteShoppingList,
        addShoppingItem,
        toggleItemPurchased,
        deleteShoppingItem,
        transferPurchasedToPantry,
        pantryItems,
        addPantryItem,
        updatePantryQty,
        deletePantryItem,
        sendPantryItemToShoppingList,
        bills,
        addBill,
        payBill,
        deleteBill,
        tasks,
        addTask,
        toggleTaskStatus,
        deleteTask,
        recipes,
        addRecipe,
        mealPlan,
        updateMealPlanDay,
        debts,
        addDebt,
        recordDebtPayment,
        savingsGoals,
        addSavingsGoal,
        contributeToSavings,
        assets,
        addAsset,
        deleteAsset,
        maintenanceRecords,
        addMaintenanceRecord,
        documents,
        addDocument,
        deleteDocument,
        emergencyContacts,
        addEmergencyContact,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        toasts,
        showToast,
        exportBackupJSON,
        importBackupJSON,
        exportTransactionsCSV,
        resetAllDataToDefault,
        canAccessFinances,
        canEditHousehold,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
