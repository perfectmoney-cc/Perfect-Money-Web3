import { useState, useEffect, useCallback } from 'react';

export interface PortfolioSnapshot {
  date: string;
  timestamp: number;
  totalValue: number;
  totalCost: number;
  holdings: Record<string, { amount: number; value: number; price: number }>;
}

const STORAGE_KEY = 'pm_portfolio_history';
const MAX_HISTORY_DAYS = 90; // Keep 90 days of history

export const usePortfolioHistory = () => {
  const [history, setHistory] = useState<PortfolioSnapshot[]>([]);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setHistory(parsed);
      } catch (e) {
        console.error('Failed to parse portfolio history:', e);
      }
    }
  }, []);

  // Save snapshot
  const saveSnapshot = useCallback((
    totalValue: number, 
    totalCost: number, 
    holdings: Record<string, { amount: number; value: number; price: number }>
  ) => {
    const today = new Date().toISOString().split('T')[0];
    
    setHistory(prev => {
      // Check if we already have a snapshot for today
      const existingIndex = prev.findIndex(s => s.date === today);
      
      const newSnapshot: PortfolioSnapshot = {
        date: today,
        timestamp: Date.now(),
        totalValue,
        totalCost,
        holdings,
      };

      let updated: PortfolioSnapshot[];
      
      if (existingIndex >= 0) {
        // Update today's snapshot
        updated = [...prev];
        updated[existingIndex] = newSnapshot;
      } else {
        // Add new snapshot
        updated = [...prev, newSnapshot];
      }

      // Keep only last MAX_HISTORY_DAYS days
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - MAX_HISTORY_DAYS);
      updated = updated.filter(s => new Date(s.date) >= cutoffDate);

      // Sort by date
      updated.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Get history for a specific time range
  const getHistory = useCallback((days: number): PortfolioSnapshot[] => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return history.filter(s => new Date(s.date) >= cutoffDate);
  }, [history]);

  // Get chart data for recharts
  const getChartData = useCallback((days: number = 30): Array<{ date: string; value: number; cost: number; pnl: number }> => {
    const filtered = getHistory(days);
    return filtered.map(s => ({
      date: new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: s.totalValue,
      cost: s.totalCost,
      pnl: s.totalValue - s.totalCost,
    }));
  }, [getHistory]);

  // Calculate returns over time period
  const getReturns = useCallback((days: number): { absoluteReturn: number; percentReturn: number; startValue: number; endValue: number } => {
    const filtered = getHistory(days);
    if (filtered.length < 2) {
      return { absoluteReturn: 0, percentReturn: 0, startValue: 0, endValue: 0 };
    }

    const startValue = filtered[0].totalValue;
    const endValue = filtered[filtered.length - 1].totalValue;
    const absoluteReturn = endValue - startValue;
    const percentReturn = startValue > 0 ? (absoluteReturn / startValue) * 100 : 0;

    return { absoluteReturn, percentReturn, startValue, endValue };
  }, [getHistory]);

  // Clear history
  const clearHistory = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setHistory([]);
  }, []);

  return {
    history,
    saveSnapshot,
    getHistory,
    getChartData,
    getReturns,
    clearHistory,
    hasHistory: history.length > 0,
  };
};
