export type MemberRole = 'admin' | 'adult' | 'limited';

export interface HouseholdMember {
  id: string;
  name: string;
  role: MemberRole;
  avatar: string;
  color: string;
  relationship: string;
  phone?: string;
}

export interface Household {
  id: string;
  name: string;
  city: string;
  neighborhood: string;
  currency: string; // 'AOA'
  createdAt: string;
}

export type WalletType = 'cash' | 'multicaixa' | 'unitel_money' | 'afrimoney' | 'bank';

export interface Wallet {
  id: string;
  name: string;
  type: WalletType;
  balance: number;
  accountNumber?: string;
  color: string;
  isDefault?: boolean;
}

export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  walletId: string;
  toWalletId?: string; // used if transfer
  date: string;
  description: string;
  memberId: string;
  receiptNote?: string;
  paymentMethod?: string;
  isRecurring?: boolean;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  budgetLimit?: number; // Monthly budget limit in Kz
}

export type StoreType = 'praca' | 'cantina' | 'supermercado' | 'loja_bairro' | 'outro';

export interface ShoppingItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string; // 'kg' | 'g' | 'litros' | 'unidades' | 'saco' | 'lata' | 'pacote'
  estimatedPrice: number;
  actualPrice?: number;
  storeType: StoreType;
  storeName?: string;
  isPurchased: boolean;
  priority: 'alta' | 'media' | 'baixa';
  notes?: string;
  addedToPantry?: boolean;
}

export interface ShoppingList {
  id: string;
  name: string;
  targetDate?: string;
  storeType?: StoreType;
  items: ShoppingItem[];
  isCompleted: boolean;
}

export interface PantryItem {
  id: string;
  name: string;
  category: string;
  currentQty: number;
  minQty: number;
  unit: string;
  storageLocation: 'despensa' | 'geleira' | 'congelador' | 'quintal' | 'lavandaria';
  purchaseDate?: string;
  expiryDate?: string;
  lastRestockedPrice?: number;
}

export type BillCategory =
  | 'ende_luz'
  | 'epal_agua'
  | 'gas_carvao'
  | 'renda'
  | 'condominio'
  | 'telecom'
  | 'escola_propinas'
  | 'servicos'
  | 'outro';

export interface Bill {
  id: string;
  title: string;
  category: BillCategory;
  estimatedAmount: number;
  dueDate: string;
  frequency: 'mensal' | 'quinzenal' | 'semanal' | 'pontual';
  status: 'pendente' | 'pago' | 'atrasado';
  meterNumber?: string; // e.g. Número de contador pré-pago ENDE
  contractNumber?: string;
  notes?: string;
  paidAmount?: number;
  paidAt?: string;
  paidFromWalletId?: string;
}

export interface HouseholdTask {
  id: string;
  title: string;
  description?: string;
  assignedMemberId: string;
  dueDate: string;
  priority: 'alta' | 'media' | 'baixa';
  status: 'pendente' | 'em_progresso' | 'concluido';
  recurrence: 'nenhuma' | 'diaria' | 'semanal' | 'mensal';
  room: 'sala' | 'cozinha' | 'quarto' | 'casa_banho' | 'quintal' | 'geral';
  completedAt?: string;
}

export interface RecipeIngredient {
  name: string;
  quantity: number;
  unit: string;
  estimatedCostKz: number;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  category: 'almoco' | 'jantar' | 'pequeno_almoco' | 'lanche';
  prepTimeMinutes: number;
  servings: number;
  ingredients: RecipeIngredient[];
  instructions: string[];
  isTypicalAngolan: boolean;
}

export interface MealPlanDay {
  date: string;
  dayOfWeek: string;
  breakfast?: string;
  lunch?: string;
  dinner?: string;
  notes?: string;
}

export interface DebtPayment {
  id: string;
  date: string;
  amount: number;
  note?: string;
}

export interface Debt {
  id: string;
  type: 'a_receber' | 'a_pagar'; // Emprestado a alguém ou devido a alguém
  personName: string;
  phone?: string;
  totalAmount: number;
  remainingAmount: number;
  dueDate?: string;
  notes?: string;
  payments: DebtPayment[];
  status: 'ativo' | 'liquidado';
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  category: 'emergencia' | 'renda' | 'propinas' | 'kixikila' | 'obras' | 'outro';
  monthlyTargetKz?: number;
  color: string;
}

export interface Asset {
  id: string;
  name: string;
  category: 'gerador' | 'eletrodomestico' | 'climatizacao' | 'bomba_agua' | 'mobiliario' | 'outro';
  brand?: string;
  model?: string;
  serialNumber?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  warrantyUntil?: string;
  room: string;
  status: 'bom' | 'precisa_manutencao' | 'avariado';
  notes?: string;
}

export interface MaintenanceRecord {
  id: string;
  assetId?: string;
  title: string;
  date: string;
  cost: number;
  technicianName?: string;
  technicianPhone?: string;
  serviceType: 'preventiva' | 'corretiva' | 'instalacao' | 'limpeza';
  description: string;
}

export interface DocumentRecord {
  id: string;
  title: string;
  category: 'contrato' | 'recibo_renda' | 'garantia' | 'fatura' | 'identificacao' | 'outro';
  referenceNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  notes?: string;
  storagePlace?: string; // e.g. "Pasta azul na gaveta do quarto"
}

export interface EmergencyContact {
  id: string;
  name: string;
  role: string;
  phone: string;
  phoneAlt?: string;
  category: 'emergencia' | 'servico_publico' | 'tecnico' | 'saude' | 'vizinho';
  notes?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'aviso' | 'urgente' | 'info' | 'sucesso';
  date: string;
  read: boolean;
  linkTab?: string;
}
