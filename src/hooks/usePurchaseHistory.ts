import { useState, useEffect, useCallback } from 'react';

export interface Purchase {
  id: string;
  provider: string;
  crypto: string;
  fiatAmount: number;
  fiatCurrency: string;
  estimatedCrypto: number;
  walletAddress: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  txHash?: string;
}

const STORAGE_KEY = 'crypto_purchase_history';

export const usePurchaseHistory = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setPurchases(parsed.map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt)
      })));
    }
  }, []);

  const savePurchases = (newPurchases: Purchase[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPurchases));
    setPurchases(newPurchases);
  };

  const addPurchase = useCallback((purchase: Omit<Purchase, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    const newPurchase: Purchase = {
      ...purchase,
      id: `purchase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setPurchases(prev => {
      const updated = [newPurchase, ...prev].slice(0, 100);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
    
    return newPurchase;
  }, []);

  const updatePurchaseStatus = useCallback((purchaseId: string, status: Purchase['status'], txHash?: string) => {
    setPurchases(prev => {
      const updated = prev.map(p => 
        p.id === purchaseId 
          ? { ...p, status, txHash: txHash || p.txHash, updatedAt: new Date() } 
          : p
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const getPurchaseById = useCallback((purchaseId: string) => {
    return purchases.find(p => p.id === purchaseId);
  }, [purchases]);

  const clearHistory = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setPurchases([]);
  }, []);

  return {
    purchases,
    addPurchase,
    updatePurchaseStatus,
    getPurchaseById,
    clearHistory,
    pendingPurchases: purchases.filter(p => p.status === 'pending' || p.status === 'processing'),
    completedPurchases: purchases.filter(p => p.status === 'completed'),
  };
};
