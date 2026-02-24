import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import {
  AppState,
  Transaction,
  AllocationDistribution,
  PepperstoneState,
  TradifyState,
  AllocationTotals,
  ShortTermGoal,
  LongTermGoal,
  TaxRecord,
  UndoAction,
} from "../types";
interface AppContextType {
  state: AppState;
  addFundedProfit: (amountUSD: number, allocations: AllocationDistribution) => void;
  addPepperstoneTransaction: (
    type: "profit" | "loss" | "deposit" | "withdrawal",
    amountUSD: number,
    notes?: string
  ) => void;
  addTradifyTransaction: (
    type: "profit" | "loss" | "deposit" | "withdrawal",
    amountUSD: number,
    notes?: string
  ) => void;
  withdrawFromTradify: (amountUSD: number) => void;
  confirmPepperstoneTransfer: () => void;
  updateSettings: (settings: Partial<AppState["settings"]>) => void;
  deleteTransaction: (id: string) => void;
  editTransaction: (id: string, updates: Partial<Transaction>) => void;
  addShortTermGoal: (label: string, target: number, source: string) => void;
  editShortTermGoal: (id: string, updates: Partial<ShortTermGoal>) => void;
  deleteShortTermGoal: (id: string) => void;
  reorderShortTermGoals: (reorderedGoals: ShortTermGoal[]) => void;
  addLongTermGoal: (label: string, target: number, source: string) => void;
  editLongTermGoal: (id: string, updates: Partial<LongTermGoal>) => void;
  deleteLongTermGoal: (id: string) => void;
  reorderLongTermGoals: (reorderedGoals: LongTermGoal[]) => void;
  undoActions: UndoAction[];
  dismissUndo: (id: string) => void;
  exportData: () => void;
  importData: (data: AppState) => void;
}
const AppContext = createContext<AppContextType | undefined>(undefined);
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
};
const generateId = () => crypto.randomUUID?.() || Math.random().toString(36).substr(2, 9);
const getPersistentInitialState = (): AppState => {
  try {
    // Detect ngrok by checking if URL contains ngrok domain
    const isNgrok = window.location.href.includes('ngrok-free.app') ||
                    window.location.href.includes('ngrok.io') ||
                    window.location.href.includes('loca.lt'); // localtunnel too
   
    const key = isNgrok ? "profitManagerState_ngrok" : "profitManagerState";
    const saved = localStorage.getItem(key);
   
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.transactions) {
        parsed.transactions = parsed.transactions.map((txn: any) => ({
          ...txn,
          date: new Date(txn.date),
        }));
      }
      if (parsed.shortTermGoals) {
        parsed.shortTermGoals = parsed.shortTermGoals.map((goal: any) => ({
          ...goal,
          date: new Date(goal.date || Date.now()),
        }));
      }
      if (parsed.longTermGoals) {
        parsed.longTermGoals = parsed.longTermGoals.map((goal: any) => ({
          ...goal,
          date: new Date(goal.date || Date.now()),
        }));
      }
      console.log("✅ Data restored from localStorage");
      return parsed;
    }
  } catch (err) {
    console.error("State restore error:", err);
  }
  return {
    transactions: [],
    pepperstoneState: {
      balance: 0,
      mode: "goal",
      hasReached5K: false,
      goalCycleData: [],
      growthModeData: [],
    },
    tradifyState: {
      balance: 0,
      graphData: [],
    },
    allocationTotals: {
      pepperstoneAllocation: 0,
      tradify: 0,
      bybitAutosave: 0,
      cashInHand: 0,
      shortTerm: 0,
      longTerm: 0,
      grooming: 0,
      customKenyan: 0,
      emergencyFund: 0,
      travel: 0,
      bybitCard: 0,
      ryanGlobalIndex: 0,
      politicianStockTracking: 0,
      dvye: 0,
    },
    shortTermGoals: [],
    longTermGoals: [],
    archivedGoals: [],
    taxRecords: [],
    currentYear: new Date().getFullYear(),
    settings: {
      kesUsdRate: 130,
    },
  };
};
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(getPersistentInitialState());
  const [undoActions, setUndoActions] = useState<UndoAction[]>([]);
  // 🔥 AUTO-SAVE TO LOCALSTORAGE EVERY STATE CHANGE
  useEffect(() => {
    try {
      const serializable = {
        ...state,
        transactions: state.transactions.map((t) => ({
          ...t,
          date: t.date.toISOString(),
        })),
        shortTermGoals: state.shortTermGoals.map((g) => ({
          ...g,
          date: g.date?.toISOString() || null,
        })),
        longTermGoals: state.longTermGoals.map((g) => ({
          ...g,
          date: g.date?.toISOString() || null,
        })),
      };
      localStorage.setItem("profitManagerState_ngrok", JSON.stringify(serializable));
      localStorage.setItem("profitManagerState", JSON.stringify(serializable)); // Keep both
      console.log("💾 State auto-saved");
    } catch (err) {
      console.error("Auto-save failed:", err);
    }
  }, [state]);
  // 🔥 SCRIPT 1's COMPLETE RECALCULATION LOGIC (THE PROPER ONE)
  const recalculateEverything = useCallback(
    (transactions: Transaction[], goals: { short: ShortTermGoal[]; long: LongTermGoal[] }): Partial<AppState> => {
      // Sort transactions chronologically
      const sortedTransactions = [...transactions].sort((a, b) => a.date.getTime() - b.date.getTime());
      let pepperstoneBalance = 0;
      let tradifyBalance = 0;
      let pepperstoneMode: "goal" | "growth" = "goal";
      let hasReached5K = false;
      let transferDate: Date | undefined;
      const pepperstoneGoalData: any[] = [];
      const pepperstoneGrowthData: any[] = [];
      const tradifyGraphData: any[] = [];
      const allocations: AllocationTotals = {
        pepperstoneAllocation: 0,
        tradify: 0,
        bybitAutosave: 0,
        cashInHand: 0,
        shortTerm: 0,
        longTerm: 0,
        grooming: 0,
        customKenyan: 0,
        emergencyFund: 0,
        travel: 0,
        bybitCard: 0,
        ryanGlobalIndex: 0,
        politicianStockTracking: 0,
        dvye: 0,
      };
      let taxableIncomeUSD = 0;
      for (const txn of sortedTransactions) {
        if (txn.source === "funded" && txn.allocations) {
          // Distribute to allocations
          allocations.pepperstoneAllocation += txn.allocations.pepperstoneAllocation;
          if (txn.allocations.tradifyAllocation) {
            allocations.tradify += txn.allocations.tradifyAllocation;
            tradifyBalance += txn.allocations.tradifyAllocation;
            tradifyGraphData.push({
              date: txn.date,
              balance: tradifyBalance,
              type: "funded_allocation",
            });
          }
          allocations.bybitAutosave += txn.allocations.bybitAutosave;
          allocations.cashInHand += txn.allocations.cashInHand;
          allocations.shortTerm += txn.allocations.shortTerm;
          allocations.longTerm += txn.allocations.longTerm;
          allocations.grooming += txn.allocations.grooming;
          allocations.customKenyan += txn.allocations.customKenyan;
          allocations.emergencyFund += txn.allocations.emergencyFund;
          allocations.travel += txn.allocations.travel;
          pepperstoneBalance += txn.allocations.pepperstoneAllocation;
          if (pepperstoneMode === "goal") {
            pepperstoneGoalData.push({
              date: txn.date,
              balance: pepperstoneBalance,
              type: "funded_allocation",
            });
          } else {
            pepperstoneGrowthData.push({
              date: txn.date,
              balance: pepperstoneBalance,
              type: "funded_allocation",
            });
          }
          // Tax: funded profits are taxable
          taxableIncomeUSD += txn.amountUSD;
          // Check 5K trigger
          if (pepperstoneMode === "goal" && pepperstoneBalance >= 5000 && !hasReached5K) {
            hasReached5K = true;
            transferDate = txn.date;
            pepperstoneMode = "growth";
            // Transfer 5K to Tradify
            pepperstoneBalance -= 5000;
            tradifyBalance += 5000;
            allocations.tradify += 5000;
            tradifyGraphData.push({
              date: txn.date,
              balance: tradifyBalance,
              type: "pepperstone_transfer",
            });
            pepperstoneGrowthData.push({
              date: txn.date,
              balance: pepperstoneBalance,
              type: "funded_allocation",
            });
          }
        } else if (txn.source === "pepperstone") {
          const amount = txn.amountUSD;
          if (txn.type === "pepperstone_profit") {
            pepperstoneBalance += amount;
            const dataPoint = { date: txn.date, balance: pepperstoneBalance, type: "profit" as const };
            if (pepperstoneMode === "goal") {
              pepperstoneGoalData.push(dataPoint);
            } else {
              pepperstoneGrowthData.push(dataPoint);
            }
          } else if (txn.type === "pepperstone_loss") {
            pepperstoneBalance -= amount;
            const dataPoint = { date: txn.date, balance: pepperstoneBalance, type: "loss" as const };
            if (pepperstoneMode === "goal") {
              pepperstoneGoalData.push(dataPoint);
            } else {
              pepperstoneGrowthData.push(dataPoint);
            }
          } else if (txn.type === "pepperstone_deposit") {
            pepperstoneBalance += amount;
            const dataPoint = { date: txn.date, balance: pepperstoneBalance, type: "deposit" as const };
            if (pepperstoneMode === "goal") {
              pepperstoneGoalData.push(dataPoint);
            } else {
              pepperstoneGrowthData.push(dataPoint);
            }
          } else if (txn.type === "pepperstone_withdrawal") {
            pepperstoneBalance -= amount;
            const dataPoint = { date: txn.date, balance: pepperstoneBalance, type: "withdrawal" as const };
            if (pepperstoneMode === "goal") {
              pepperstoneGoalData.push(dataPoint);
            } else {
              pepperstoneGrowthData.push(dataPoint);
            }
            // Tax: withdrawals are taxable
            taxableIncomeUSD += amount;
          }
          // Check if 5K trigger is still valid
          if (pepperstoneMode === "goal" && pepperstoneBalance >= 5000 && !hasReached5K) {
            hasReached5K = true;
            transferDate = txn.date;
            pepperstoneMode = "growth";
            pepperstoneBalance -= 5000;
            tradifyBalance += 5000;
            allocations.tradify += 5000;
            tradifyGraphData.push({
              date: txn.date,
              balance: tradifyBalance,
              type: "pepperstone_transfer",
            });
            pepperstoneGrowthData.push({
              date: txn.date,
              balance: pepperstoneBalance,
              type: "withdrawal",
            });
          }
        } else if (txn.source === "tradify") {
          const amount = txn.amountUSD;
          if (txn.type === "tradify_profit") {
            tradifyBalance += amount;
            tradifyGraphData.push({ date: txn.date, balance: tradifyBalance, type: "profit" });
          } else if (txn.type === "tradify_loss") {
            tradifyBalance -= amount;
            tradifyGraphData.push({ date: txn.date, balance: tradifyBalance, type: "loss" });
          } else if (txn.type === "tradify_deposit") {
            tradifyBalance += amount;
            tradifyGraphData.push({ date: txn.date, balance: tradifyBalance, type: "deposit" });
          } else if (txn.type === "tradify_withdrawal") {
            // Withdrawals distribute to other allocations
            const distribution = calculateTradifyWithdrawalDistribution(amount);
            allocations.travel += distribution.travel;
            allocations.longTerm += distribution.longTerm;
            allocations.bybitCard += distribution.bybitCard;
            allocations.ryanGlobalIndex += distribution.ryanGlobalIndex;
            allocations.politicianStockTracking += distribution.politicianStockTracking;
            allocations.customKenyan += distribution.customKenyan;
            allocations.dvye += distribution.dvye;
            allocations.bybitAutosave += distribution.bybitAutosave;
            tradifyBalance -= amount;
            tradifyBalance += distribution.accountGrowth; // 30% stays
            tradifyGraphData.push({ date: txn.date, balance: tradifyBalance, type: "withdrawal" });
            // Tax: withdrawals are taxable
            taxableIncomeUSD += amount - distribution.accountGrowth;
          }
        }
      }
      // Calculate short-term goal progress (SCRIPT 1 LOGIC)
      const updatedShortTermGoals = goals.short.map((goal) => {
        if (goal.achieved) return goal;
        const availableAmount = allocations.shortTerm;
        let progress = 0;
        // Calculate based on priority
        if (goal.priority === 1) {
          progress = Math.min(availableAmount * 0.8, goal.target);
        } else if (goal.priority === 2) {
          const priority1Goal = goals.short.find((g) => g.priority === 1);
          const priority1Allocation = priority1Goal ? Math.min(availableAmount * 0.8, priority1Goal.target) : 0;
          const remaining = availableAmount * 0.8 - priority1Allocation;
          progress = Math.min(remaining + availableAmount * 0.2, goal.target);
        }
        return {
          ...goal,
          progress,
          achieved: progress >= goal.target,
        };
      });
      // Calculate long-term goal progress
      const updatedLongTermGoals = goals.long.map((goal) => {
        if (goal.achieved) return goal;
        const progress = allocations.longTerm;
        return {
          ...goal,
          progress,
          achieved: progress >= goal.target,
        };
      });
      return {
        pepperstoneState: {
          balance: pepperstoneBalance,
          mode: pepperstoneMode,
          hasReached5K,
          transferDate,
          goalCycleData: pepperstoneGoalData,
          growthModeData: pepperstoneGrowthData,
        },
        tradifyState: {
          balance: tradifyBalance,
          graphData: tradifyGraphData,
        },
        allocationTotals: allocations,
        shortTermGoals: updatedShortTermGoals,
        longTermGoals: updatedLongTermGoals,
      };
    },
    []
  );
  const calculateTradifyWithdrawalDistribution = (amount: number) => {
    return {
      travel: amount * 0.2429,
      longTerm: amount * 0.2143,
      bybitCard: amount * 0.1429,
      ryanGlobalIndex: amount * 0.1351,
      politicianStockTracking: amount * 0.0714,
      customKenyan: amount * 0.0714,
      dvye: amount * 0.0657,
      bybitAutosave: amount * 0.0563,
      accountGrowth: amount * 0.3,
    };
  };
  const addUndo = useCallback((description: string, restoreState: AppState) => {
    const undoId = generateId();
    setUndoActions((prev) => [
      ...prev,
      {
        id: undoId,
        description,
        restore: () => {
          setState(restoreState);
          setUndoActions((prev) => prev.filter((a) => a.id !== undoId));
        },
      },
    ]);
    setTimeout(() => {
      setUndoActions((prev) => prev.filter((a) => a.id !== undoId));
    }, 5000);
  }, []);
  // ALL FUNCTIONS USING SCRIPT 1 LOGIC + SCRIPT 2 PERSISTENCE
  const addFundedProfit = useCallback(
    (amountUSD: number, allocations: AllocationDistribution) => {
      const previousState = structuredClone(state);
      const newTransaction: Transaction = {
        id: generateId(),
        source: "funded",
        type: "funded_profit",
        date: new Date(),
        amountUSD,
        notes: "",
        exchangeRate: state.settings.kesUsdRate,
        allocations,
      };
      const newTransactions = [...state.transactions, newTransaction];
      const recalculated = recalculateEverything(newTransactions, {
        short: state.shortTermGoals,
        long: state.longTermGoals,
      });
      setState((prev) => ({
        ...prev,
        transactions: newTransactions,
        ...recalculated,
      }));
      addUndo(`Added funded profit of $${amountUSD.toFixed(2)}`, previousState);
    },
    [state, recalculateEverything, addUndo]
  );
  const addPepperstoneTransaction = useCallback(
    (type: "profit" | "loss" | "deposit" | "withdrawal", amountUSD: number, notes?: string) => {
      const previousState = structuredClone(state);
      const newTransaction: Transaction = {
        id: generateId(),
        source: "pepperstone",
        type: `pepperstone_${type}` as any,
        date: new Date(),
        amountUSD,
        notes,
        exchangeRate: state.settings.kesUsdRate,
      };
      const newTransactions = [...state.transactions, newTransaction];
      const recalculated = recalculateEverything(newTransactions, {
        short: state.shortTermGoals,
        long: state.longTermGoals,
      });
      setState((prev) => ({
        ...prev,
        transactions: newTransactions,
        ...recalculated,
      }));
      addUndo(`Added Pepperstone ${type} of $${amountUSD.toFixed(2)}`, previousState);
    },
    [state, recalculateEverything, addUndo]
  );
  const addTradifyTransaction = useCallback(
    (type: "profit" | "loss" | "deposit" | "withdrawal", amountUSD: number, notes?: string) => {
      const previousState = structuredClone(state);
      const newTransaction: Transaction = {
        id: generateId(),
        source: "tradify",
        type: `tradify_${type}` as any,
        date: new Date(),
        amountUSD,
        notes,
        exchangeRate: state.settings.kesUsdRate,
      };
      const newTransactions = [...state.transactions, newTransaction];
      const recalculated = recalculateEverything(newTransactions, {
        short: state.shortTermGoals,
        long: state.longTermGoals,
      });
      setState((prev) => ({
        ...prev,
        transactions: newTransactions,
        ...recalculated,
      }));
      addUndo(`Added Tradify ${type} of $${amountUSD.toFixed(2)}`, previousState);
    },
    [state, recalculateEverything, addUndo]
  );
  const withdrawFromTradify = useCallback(
    (amountUSD: number) => {
      addTradifyTransaction("withdrawal", amountUSD, "Withdrawal with distribution");
    },
    [addTradifyTransaction]
  );
  const confirmPepperstoneTransfer = useCallback(() => {
    // This is handled automatically in recalculateEverything
  }, []);
  const updateSettings = useCallback((updates: Partial<AppState["settings"]>) => {
    setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...updates,
      },
    }));
  }, []);
  const deleteTransaction = useCallback(
    (id: string) => {
      const previousState = structuredClone(state);
      const newTransactions = state.transactions.filter((t) => t.id !== id);
      const recalculated = recalculateEverything(newTransactions, {
        short: state.shortTermGoals,
        long: state.longTermGoals,
      });
      setState((prev) => ({
        ...prev,
        transactions: newTransactions,
        ...recalculated,
      }));
      addUndo("Deleted transaction", previousState);
    },
    [state, recalculateEverything, addUndo]
  );
  const editTransaction = useCallback(
    (id: string, updates: Partial<Transaction>) => {
      const previousState = structuredClone(state);
      const newTransactions = state.transactions.map((t) => (t.id === id ? { ...t, ...updates } : t));
      const recalculated = recalculateEverything(newTransactions, {
        short: state.shortTermGoals,
        long: state.longTermGoals,
      });
      setState((prev) => ({
        ...prev,
        transactions: newTransactions,
        ...recalculated,
      }));
      addUndo("Edited transaction", previousState);
    },
    [state, recalculateEverything, addUndo]
  );
  const addShortTermGoal = useCallback((label: string, target: number, source: string) => {
    const newGoal: ShortTermGoal = {
      id: generateId(),
      label,
      target,
      priority: 1,
      progress: 0,
      achieved: false,
      source,
    };
    setState((prev) => {
      const activeGoals = prev.shortTermGoals.filter((g) => !g.achieved);
      // Determine priority based on number of active goals (SCRIPT 1 LOGIC)
      newGoal.priority = (activeGoals.length + 1) as 1 | 2 | 3;
      return {
        ...prev,
        shortTermGoals: [...prev.shortTermGoals, newGoal],
      };
    });
  }, []);
  const editShortTermGoal = useCallback((id: string, updates: Partial<ShortTermGoal>) => {
    setState((prev) => ({
      ...prev,
      shortTermGoals: prev.shortTermGoals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    }));
  }, []);
  const deleteShortTermGoal = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      shortTermGoals: prev.shortTermGoals.filter((g) => g.id !== id),
    }));
  }, []);
  const reorderShortTermGoals = useCallback((reorderedGoals: ShortTermGoal[]) => {
    setState((prev) => {
      // Replace the active goals with reordered ones, keep archived goals (SCRIPT 1 LOGIC)
      const archivedGoals = prev.shortTermGoals.filter((g) => g.achieved);
      return {
        ...prev,
        shortTermGoals: [...reorderedGoals, ...archivedGoals],
      };
    });
  }, []);
  const addLongTermGoal = useCallback((label: string, target: number, source: string) => {
    const newGoal: LongTermGoal = {
      id: generateId(),
      label,
      target,
      progress: 0,
      achieved: false,
      source,
    };
    setState((prev) => ({
      ...prev,
      longTermGoals: [...prev.longTermGoals, newGoal],
    }));
  }, []);
  const editLongTermGoal = useCallback((id: string, updates: Partial<LongTermGoal>) => {
    setState((prev) => ({
      ...prev,
      longTermGoals: prev.longTermGoals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    }));
  }, []);
  const deleteLongTermGoal = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      longTermGoals: prev.longTermGoals.filter((g) => g.id !== id),
    }));
  }, []);
  const reorderLongTermGoals = useCallback((reorderedGoals: LongTermGoal[]) => {
    setState((prev) => {
      // Replace the active goals with reordered ones, keep archived goals (SCRIPT 1 LOGIC)
      const archivedGoals = prev.longTermGoals.filter((g) => g.achieved);
      return {
        ...prev,
        longTermGoals: [...reorderedGoals, ...archivedGoals],
      };
    });
  }, []);
  const dismissUndo = useCallback((id: string) => {
    setUndoActions((prev) => prev.filter((a) => a.id !== id));
  }, []);
  const exportData = useCallback(() => {
    const serializable = {
      ...state,
      transactions: state.transactions.map((t) => ({
        ...t,
        date: t.date.toISOString(),
      })),
    };
    const blob = new Blob([JSON.stringify(serializable, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `profit-manager-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [state]);
  const importData = useCallback((data: AppState) => {
    // Fix dates on import
    const fixedData = {
      ...data,
      transactions: data.transactions?.map((t: any) => ({
        ...t,
        date: new Date(t.date),
      })) || [],
    };
    setState(fixedData);
  }, []);
  return (
    <AppContext.Provider
      value={{
        state,
        addFundedProfit,
        addPepperstoneTransaction,
        addTradifyTransaction,
        withdrawFromTradify,
        confirmPepperstoneTransfer,
        updateSettings,
        deleteTransaction,
        editTransaction,
        addShortTermGoal,
        editShortTermGoal,
        deleteShortTermGoal,
        reorderShortTermGoals,
        addLongTermGoal,
        editLongTermGoal,
        deleteLongTermGoal,
        reorderLongTermGoals,
        undoActions,
        dismissUndo,
        exportData,
        importData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};