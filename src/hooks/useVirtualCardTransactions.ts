import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import { VIRTUAL_CARD_CONTRACT_ADDRESS } from "@/contracts/virtualCardABI";

const SUPABASE_URL = "https://ihuqvxvcqnrdxphqxpqr.supabase.co";

export interface VirtualCardTransaction {
  type: "deposit" | "withdrawal" | "spend" | "CardCreated";
  amount: string;
  fee?: string;
  cashback?: string;
  timestamp: number;
  txHash: string;
  user?: string;
  blockNumber?: number;
}

interface CardCreatedEvent {
  user: string;
  cardNumber: string;
  tier: number;
  txHash: string;
  blockNumber: number;
  timestamp?: number;
}

interface UseVirtualCardTransactionsReturn {
  transactions: VirtualCardTransaction[];
  cardEvents: CardCreatedEvent[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useVirtualCardTransactions = (): UseVirtualCardTransactionsReturn => {
  const { address } = useAccount();
  const [transactions, setTransactions] = useState<VirtualCardTransaction[]>([]);
  const [cardEvents, setCardEvents] = useState<CardCreatedEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    if (!address) {
      setTransactions([]);
      return;
    }

    // Check if contract is deployed
    if (VIRTUAL_CARD_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
      setTransactions([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/fetch-virtual-card-events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contractAddress: VIRTUAL_CARD_CONTRACT_ADDRESS,
          userAddress: address,
          eventTypes: ["CardTopUp", "CardWithdraw", "CardSpent"],
          fromBlock: "0x1",
          toBlock: "latest",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.message?.includes("not deployed")) {
          setTransactions([]);
          setError(null);
          return;
        }
        throw new Error(errorData.error || `HTTP error: ${response.status}`);
      }

      const data = await response.json();

      if (data?.message?.includes("not deployed")) {
        setTransactions([]);
        setError(null);
        return;
      }

      if (data?.events) {
        const formattedTransactions: VirtualCardTransaction[] = data.events
          .filter((e: any) => e.type !== "CardCreated")
          .map((event: any) => ({
            type: event.type,
            amount: event.amount || "0",
            fee: event.fee,
            cashback: event.cashback,
            timestamp: event.timestamp || Math.floor(Date.now() / 1000),
            txHash: event.txHash,
            user: event.user,
            blockNumber: event.blockNumber,
          }));

        setTransactions(formattedTransactions);
      }
    } catch (err: any) {
      console.error("Error fetching virtual card transactions:", err);
      // Don't show error for undeployed contracts
      if (err.message?.includes("not deployed") || err.message?.includes("ALCHEMY_API_KEY")) {
        setError(null);
      } else {
        setError(err.message || "Failed to fetch transactions");
      }
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  const fetchAllCardEvents = useCallback(async () => {
    // Check if contract is deployed
    if (VIRTUAL_CARD_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
      setCardEvents([]);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/fetch-virtual-card-events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contractAddress: VIRTUAL_CARD_CONTRACT_ADDRESS,
          eventTypes: ["CardCreated"],
          fromBlock: "0x1",
          toBlock: "latest",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.message?.includes("not deployed")) {
          setCardEvents([]);
          return;
        }
        throw new Error(errorData.error || `HTTP error: ${response.status}`);
      }

      const data = await response.json();

      if (data?.message?.includes("not deployed")) {
        setCardEvents([]);
        return;
      }

      if (data?.events) {
        const formattedEvents: CardCreatedEvent[] = data.events
          .filter((e: any) => e.type === "CardCreated")
          .map((event: any) => ({
            user: event.user,
            cardNumber: event.data?.cardNumber || "Unknown",
            tier: event.data?.tier || 0,
            txHash: event.txHash,
            blockNumber: event.blockNumber,
            timestamp: event.timestamp,
          }));

        setCardEvents(formattedEvents);
      }
    } catch (err: any) {
      console.error("Error fetching card events:", err);
      // Don't set error for undeployed contracts
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
    fetchAllCardEvents();
  }, [fetchTransactions, fetchAllCardEvents]);

  const refetch = async () => {
    await Promise.all([fetchTransactions(), fetchAllCardEvents()]);
  };

  return {
    transactions,
    cardEvents,
    isLoading,
    error,
    refetch,
  };
};

export default useVirtualCardTransactions;
