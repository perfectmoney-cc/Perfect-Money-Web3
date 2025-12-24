import { useState, useEffect } from 'react';

export interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'swap';
  amount: string;
  token: string;
  address: string;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
  txHash?: string;
}

export const useTransactionHistory = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    // Load transactions from localStorage
    const saved = localStorage.getItem('pmTransactions');
    if (saved) {
      const parsed = JSON.parse(saved);
      setTransactions(parsed.map((tx: any) => ({
        ...tx,
        timestamp: new Date(tx.timestamp)
      })));
    }
  }, []);

  const addTransaction = (tx: Omit<Transaction, 'id' | 'timestamp'>) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };
    
    setTransactions(prev => {
      const updated = [newTx, ...prev].slice(0, 50); // Keep last 50 transactions
      localStorage.setItem('pmTransactions', JSON.stringify(updated));
      return updated;
    });
    
    return newTx;
  };

  const updateTransactionStatus = (id: string, status: Transaction['status'], txHash?: string) => {
    setTransactions(prev => {
      const updated = prev.map(tx => 
        tx.id === id ? { ...tx, status, txHash: txHash || tx.txHash } : tx
      );
      localStorage.setItem('pmTransactions', JSON.stringify(updated));
      return updated;
    });
  };

  const clearHistory = () => {
    setTransactions([]);
    localStorage.removeItem('pmTransactions');
  };

  return {
    transactions,
    addTransaction,
    updateTransactionStatus,
    clearHistory
  };
};
