import { useState, useEffect, useCallback } from 'react';

export interface RecurringPurchase {
  id: string;
  crypto: string;
  fiatAmount: number;
  fiatCurrency: string;
  provider: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  hour: number; // 0-23
  walletAddress: string;
  isActive: boolean;
  nextExecution: string;
  createdAt: string;
  lastExecuted?: string;
  totalExecutions: number;
  totalSpent: number;
}

const STORAGE_KEY = 'pm_recurring_purchases';

export const useRecurringPurchases = () => {
  const [recurringPurchases, setRecurringPurchases] = useState<RecurringPurchase[]>([]);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setRecurringPurchases(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse recurring purchases:', e);
      }
    }
  }, []);

  // Save to localStorage
  const saveToStorage = (purchases: RecurringPurchase[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(purchases));
    setRecurringPurchases(purchases);
  };

  // Calculate next execution date
  const calculateNextExecution = (frequency: 'daily' | 'weekly' | 'monthly', hour: number, dayOfWeek?: number, dayOfMonth?: number): Date => {
    const now = new Date();
    const next = new Date();
    next.setHours(hour, 0, 0, 0);

    switch (frequency) {
      case 'daily':
        if (next <= now) {
          next.setDate(next.getDate() + 1);
        }
        break;
      case 'weekly':
        const targetDay = dayOfWeek ?? 1; // Default Monday
        let daysUntil = targetDay - now.getDay();
        if (daysUntil < 0 || (daysUntil === 0 && next <= now)) {
          daysUntil += 7;
        }
        next.setDate(next.getDate() + daysUntil);
        break;
      case 'monthly':
        const targetDate = dayOfMonth ?? 1;
        next.setDate(targetDate);
        if (next <= now) {
          next.setMonth(next.getMonth() + 1);
        }
        break;
    }

    return next;
  };

  // Add recurring purchase
  const addRecurringPurchase = useCallback((purchase: Omit<RecurringPurchase, 'id' | 'nextExecution' | 'createdAt' | 'totalExecutions' | 'totalSpent'>) => {
    const nextExecution = calculateNextExecution(
      purchase.frequency,
      purchase.hour,
      purchase.dayOfWeek,
      purchase.dayOfMonth
    );

    const newPurchase: RecurringPurchase = {
      ...purchase,
      id: `rp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      nextExecution: nextExecution.toISOString(),
      createdAt: new Date().toISOString(),
      totalExecutions: 0,
      totalSpent: 0,
    };

    const updated = [...recurringPurchases, newPurchase];
    saveToStorage(updated);
    return newPurchase;
  }, [recurringPurchases]);

  // Toggle active status
  const toggleRecurringPurchase = useCallback((id: string) => {
    const updated = recurringPurchases.map(p => {
      if (p.id === id) {
        const isActive = !p.isActive;
        let nextExecution = p.nextExecution;
        
        if (isActive) {
          // Recalculate next execution when reactivating
          nextExecution = calculateNextExecution(
            p.frequency,
            p.hour,
            p.dayOfWeek,
            p.dayOfMonth
          ).toISOString();
        }
        
        return { ...p, isActive, nextExecution };
      }
      return p;
    });
    saveToStorage(updated);
  }, [recurringPurchases]);

  // Remove recurring purchase
  const removeRecurringPurchase = useCallback((id: string) => {
    const updated = recurringPurchases.filter(p => p.id !== id);
    saveToStorage(updated);
  }, [recurringPurchases]);

  // Update recurring purchase
  const updateRecurringPurchase = useCallback((id: string, updates: Partial<RecurringPurchase>) => {
    const updated = recurringPurchases.map(p => {
      if (p.id === id) {
        const updatedPurchase = { ...p, ...updates };
        
        // Recalculate next execution if frequency changed
        if (updates.frequency || updates.hour !== undefined || updates.dayOfWeek !== undefined || updates.dayOfMonth !== undefined) {
          updatedPurchase.nextExecution = calculateNextExecution(
            updatedPurchase.frequency,
            updatedPurchase.hour,
            updatedPurchase.dayOfWeek,
            updatedPurchase.dayOfMonth
          ).toISOString();
        }
        
        return updatedPurchase;
      }
      return p;
    });
    saveToStorage(updated);
  }, [recurringPurchases]);

  // Mark as executed (for simulation/tracking)
  const markAsExecuted = useCallback((id: string, fiatAmount: number) => {
    const updated = recurringPurchases.map(p => {
      if (p.id === id) {
        const nextExecution = calculateNextExecution(
          p.frequency,
          p.hour,
          p.dayOfWeek,
          p.dayOfMonth
        );
        
        return {
          ...p,
          lastExecuted: new Date().toISOString(),
          nextExecution: nextExecution.toISOString(),
          totalExecutions: p.totalExecutions + 1,
          totalSpent: p.totalSpent + fiatAmount,
        };
      }
      return p;
    });
    saveToStorage(updated);
  }, [recurringPurchases]);

  // Get active purchases
  const activePurchases = recurringPurchases.filter(p => p.isActive);
  
  // Get due purchases (for notification/execution)
  const duePurchases = recurringPurchases.filter(p => {
    if (!p.isActive) return false;
    const nextExecution = new Date(p.nextExecution);
    return nextExecution <= new Date();
  });

  // Get frequency label
  const getFrequencyLabel = (frequency: 'daily' | 'weekly' | 'monthly', dayOfWeek?: number, dayOfMonth?: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    switch (frequency) {
      case 'daily':
        return 'Every day';
      case 'weekly':
        return `Every ${days[dayOfWeek ?? 1]}`;
      case 'monthly':
        const suffix = dayOfMonth === 1 ? 'st' : dayOfMonth === 2 ? 'nd' : dayOfMonth === 3 ? 'rd' : 'th';
        return `Every ${dayOfMonth}${suffix} of month`;
      default:
        return frequency;
    }
  };

  return {
    recurringPurchases,
    activePurchases,
    duePurchases,
    addRecurringPurchase,
    toggleRecurringPurchase,
    removeRecurringPurchase,
    updateRecurringPurchase,
    markAsExecuted,
    getFrequencyLabel,
  };
};
