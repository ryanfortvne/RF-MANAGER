// Core data types for RF Manager

export type TransactionType =
  | 'funded_profit'
  | 'pepperstone_profit'
  | 'pepperstone_loss'
  | 'pepperstone_deposit'
  | 'pepperstone_withdrawal'
  | 'tradify_profit'
  | 'tradify_loss'
  | 'tradify_deposit'
  | 'tradify_withdrawal';

export interface Transaction {
  id: string;
  source: 'funded' | 'pepperstone' | 'tradify';
  type: TransactionType;
  date: Date;
  amountUSD: number;
  notes?: string;
  exchangeRate: number; // KES per USD at time of entry
  allocations?: AllocationDistribution; // For funded profits
}

export interface AllocationDistribution {
  pepperstoneAllocation: number;
  tradifyAllocation?: number;
  bybitAutosave: number;
  cashInHand: number;
  shortTerm: number;
  grooming: number;
  longTerm: number;
  customKenyan: number;
  emergencyFund: number;
  travel: number;
}

export interface TradifyWithdrawalDistribution {
  travel: number;
  longTerm: number;
  bybitCard: number;
  ryanGlobalIndex: number;
  politicianStockTracking: number;
  customKenyan: number;
  dvye: number;
  bybitAutosave: number;
  accountGrowth: number; // 30% stays in Tradify
}

export interface AllocationTotals {
  pepperstoneAllocation: number;
  tradify: number;
  bybitAutosave: number;
  cashInHand: number;
  shortTerm: number;
  longTerm: number;
  grooming: number;
  customKenyan: number;
  emergencyFund: number;
  travel: number;
  bybitCard: number;
  ryanGlobalIndex: number;
  politicianStockTracking: number;
  dvye: number;
}

export interface PepperstoneState {
  balance: number;
  mode: 'goal' | 'growth';
  hasReached5K: boolean;
  transferDate?: Date;
  goalCycleData: PepperstoneGraphPoint[];
  growthModeData: PepperstoneGraphPoint[];
}

export interface PepperstoneGraphPoint {
  date: Date;
  balance: number;
  type: 'profit' | 'loss' | 'deposit' | 'withdrawal' | 'funded_allocation';
}

export interface TradifyState {
  balance: number;
  graphData: TradifyGraphPoint[];
}

export interface TradifyGraphPoint {
  date: Date;
  balance: number;
  type: 'profit' | 'loss' | 'deposit' | 'withdrawal' | 'funded_allocation' | 'pepperstone_transfer';
}

export interface ShortTermGoal {
  id: string;
  label: string;
  target: number;
  priority: 1 | 2 | 3;
  progress: number;
  achieved: boolean;
  archivedDate?: Date;
  source: string; // Source of allocation
}

export interface LongTermGoal {
  id: string;
  label: string;
  target: number;
  progress: number;
  achieved: boolean;
  archivedDate?: Date;
  source: string; // Source of allocation
}

export interface TaxRecord {
  month: string; // YYYY-MM format
  taxableIncomeKES: number;
  taxOwedKES: number;
}

export interface Settings {
  kesUsdRate: number;
  customTaxBrackets?: {
    min: number;
    max: number;
    rate: number;
  }[];
}

export interface AppState {
  transactions: Transaction[];
  pepperstoneState: PepperstoneState;
  tradifyState: TradifyState;
  allocationTotals: AllocationTotals;
  shortTermGoals: ShortTermGoal[];
  longTermGoals: LongTermGoal[];
  archivedGoals: (ShortTermGoal | LongTermGoal)[];
  taxRecords: TaxRecord[];
  currentYear: number;
  settings: Settings;
}

export interface UndoAction {
  id: string;
  description: string;
  restore: () => void;
}