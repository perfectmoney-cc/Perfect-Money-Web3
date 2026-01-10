import { useState, useEffect, useCallback } from 'react';

export interface CardEvent {
  type: 'CardCreated' | 'CardTopUp' | 'CardSpent' | 'CardWithdraw' | 'TierUpgraded';
  user: string;
  blockNumber: number;
  txHash: string;
  timestamp?: Date;
  data: {
    cardNumber?: string;
    tier?: number;
    amount?: string;
    fee?: string;
    cashback?: string;
    newTier?: number;
    oldTier?: number;
  };
}

export interface CardStats {
  totalCards: number;
  totalTransactions: number;
  totalDeposits: string;
  totalSpending: string;
  totalCashback: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://xldptgnlmwpfcvnpvkbx.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsZHB0Z25sbXdwZmN2bnB2a2J4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyNDI4NjMsImV4cCI6MjA2MDgxODg2M30.cUNkPBxNBV1LjNHdaASPjYzGyjjLmvUe3CcDj9RjWbg";

export const useVirtualCardEvents = () => {
  const [cardEvents, setCardEvents] = useState<CardEvent[]>([]);
  const [cardStats, setCardStats] = useState<CardStats>({
    totalCards: 0,
    totalTransactions: 0,
    totalDeposits: '0',
    totalSpending: '0',
    totalCashback: '0',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/fetch-virtual-card-events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          eventTypes: ['CardCreated', 'CardTopUp', 'CardSpent', 'CardWithdraw', 'TierUpgraded'],
          fromBlock: 'earliest',
          toBlock: 'latest',
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch events: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.events) {
        setCardEvents(data.events);
        
        // Calculate stats from events
        const createdEvents = data.events.filter((e: CardEvent) => e.type === 'CardCreated');
        const topUpEvents = data.events.filter((e: CardEvent) => e.type === 'CardTopUp');
        const spendEvents = data.events.filter((e: CardEvent) => e.type === 'CardSpent');
        
        const totalDeposits = topUpEvents.reduce((sum: number, e: CardEvent) => {
          return sum + (parseFloat(e.data.amount || '0'));
        }, 0);
        
        const totalSpending = spendEvents.reduce((sum: number, e: CardEvent) => {
          return sum + (parseFloat(e.data.amount || '0'));
        }, 0);
        
        const totalCashback = spendEvents.reduce((sum: number, e: CardEvent) => {
          return sum + (parseFloat(e.data.cashback || '0'));
        }, 0);

        setCardStats({
          totalCards: createdEvents.length,
          totalTransactions: data.events.length,
          totalDeposits: totalDeposits.toFixed(4),
          totalSpending: totalSpending.toFixed(4),
          totalCashback: totalCashback.toFixed(4),
        });
      }
    } catch (err) {
      console.error('Error fetching virtual card events:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const getEventsByType = useCallback((type: CardEvent['type']) => {
    return cardEvents.filter(e => e.type === type);
  }, [cardEvents]);

  const getEventsByUser = useCallback((userAddress: string) => {
    return cardEvents.filter(e => e.user.toLowerCase() === userAddress.toLowerCase());
  }, [cardEvents]);

  return {
    cardEvents,
    cardStats,
    isLoading,
    error,
    refetch: fetchEvents,
    getEventsByType,
    getEventsByUser,
    cardCreatedEvents: cardEvents.filter(e => e.type === 'CardCreated'),
    topUpEvents: cardEvents.filter(e => e.type === 'CardTopUp'),
    spendEvents: cardEvents.filter(e => e.type === 'CardSpent'),
    withdrawEvents: cardEvents.filter(e => e.type === 'CardWithdraw'),
    tierUpgradeEvents: cardEvents.filter(e => e.type === 'TierUpgraded'),
  };
};
