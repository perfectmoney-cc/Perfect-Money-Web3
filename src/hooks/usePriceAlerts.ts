import { useState, useEffect, useCallback } from 'react';

export interface PriceAlert {
  id: string;
  crypto: string;
  targetPrice: number;
  condition: 'above' | 'below';
  currency: string;
  createdAt: Date;
  isTriggered: boolean;
  triggeredAt?: Date;
}

const STORAGE_KEY = 'crypto_price_alerts';

export const usePriceAlerts = () => {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setAlerts(parsed.map((alert: any) => ({
        ...alert,
        createdAt: new Date(alert.createdAt),
        triggeredAt: alert.triggeredAt ? new Date(alert.triggeredAt) : undefined
      })));
    }
  }, []);

  const saveAlerts = (newAlerts: PriceAlert[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newAlerts));
    setAlerts(newAlerts);
  };

  const addAlert = useCallback((alert: Omit<PriceAlert, 'id' | 'createdAt' | 'isTriggered'>) => {
    const newAlert: PriceAlert = {
      ...alert,
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      isTriggered: false,
    };
    
    const updated = [newAlert, ...alerts].slice(0, 50);
    saveAlerts(updated);
    return newAlert;
  }, [alerts]);

  const removeAlert = useCallback((alertId: string) => {
    const updated = alerts.filter(a => a.id !== alertId);
    saveAlerts(updated);
  }, [alerts]);

  const checkAlerts = useCallback((prices: Record<string, number>) => {
    const triggered: PriceAlert[] = [];
    
    const updated = alerts.map(alert => {
      if (alert.isTriggered) return alert;
      
      const currentPrice = prices[alert.crypto];
      if (!currentPrice) return alert;
      
      const shouldTrigger = 
        (alert.condition === 'above' && currentPrice >= alert.targetPrice) ||
        (alert.condition === 'below' && currentPrice <= alert.targetPrice);
      
      if (shouldTrigger) {
        triggered.push(alert);
        return { ...alert, isTriggered: true, triggeredAt: new Date() };
      }
      
      return alert;
    });
    
    if (triggered.length > 0) {
      saveAlerts(updated);
    }
    
    return triggered;
  }, [alerts]);

  const clearTriggeredAlerts = useCallback(() => {
    const updated = alerts.filter(a => !a.isTriggered);
    saveAlerts(updated);
  }, [alerts]);

  return {
    alerts,
    addAlert,
    removeAlert,
    checkAlerts,
    clearTriggeredAlerts,
    activeAlerts: alerts.filter(a => !a.isTriggered),
    triggeredAlerts: alerts.filter(a => a.isTriggered),
  };
};
