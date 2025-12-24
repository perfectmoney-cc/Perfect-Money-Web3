import { useState, useEffect, useCallback } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { parseAbiItem, formatEther } from 'viem';
import { useMerchant } from './useMerchant';

export interface MerchantTransaction {
  id: string;
  txHash: string;
  customer: string;
  amount: string;
  amountRaw: bigint;
  timestamp: Date;
  blockNumber: bigint;
  status: 'completed' | 'pending' | 'failed';
}

export interface TransactionFilters {
  dateFrom?: Date;
  dateTo?: Date;
  minAmount?: string;
  maxAmount?: string;
  status?: string;
  searchQuery?: string;
}

export const useMerchantTransactions = () => {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { getMerchantAddress } = useMerchant();
  
  const [transactions, setTransactions] = useState<MerchantTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    if (!address || !publicClient) return;

    const merchantAddress = getMerchantAddress();
    if (!merchantAddress || merchantAddress === "0x0000000000000000000000000000000000000000") {
      // Fallback to localStorage for demo purposes
      const stored = localStorage.getItem("merchantTransactions");
      if (stored) {
        const parsed = JSON.parse(stored);
        const mapped: MerchantTransaction[] = parsed.map((tx: any, index: number) => ({
          id: tx.id?.toString() || `tx_${index}`,
          txHash: tx.txHash || `0x${Math.random().toString(16).slice(2)}`,
          customer: tx.sender || `0x${Math.random().toString(16).slice(2, 42)}`,
          amount: tx.amount?.toString() || '0',
          amountRaw: BigInt(Math.floor((parseFloat(tx.amount) || 0) * 1e18)),
          timestamp: tx.timestamp ? new Date(tx.timestamp) : new Date(),
          blockNumber: BigInt(0),
          status: 'completed' as const,
        }));
        setTransactions(mapped);
      }
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch PaymentReceived events from the contract
      const paymentEvent = parseAbiItem('event PaymentReceived(address indexed merchant, address indexed customer, uint256 amount)');
      
      const currentBlock = await publicClient.getBlockNumber();
      const fromBlock = currentBlock > 10000n ? currentBlock - 10000n : 0n;

      const logs = await publicClient.getLogs({
        address: merchantAddress as `0x${string}`,
        event: paymentEvent,
        args: {
          merchant: address,
        },
        fromBlock,
        toBlock: 'latest',
      });

      // Get block timestamps for each transaction
      const txPromises = logs.map(async (log, index) => {
        const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
        
        return {
          id: `${log.transactionHash}_${index}`,
          txHash: log.transactionHash,
          customer: log.args.customer || '0x0',
          amount: formatEther(log.args.amount || 0n),
          amountRaw: log.args.amount || 0n,
          timestamp: new Date(Number(block.timestamp) * 1000),
          blockNumber: log.blockNumber,
          status: 'completed' as const,
        };
      });

      const txs = await Promise.all(txPromises);
      
      // Sort by timestamp descending (newest first)
      txs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      setTransactions(txs);
    } catch (err: any) {
      console.error('Error fetching merchant transactions:', err);
      setError(err.message || 'Failed to fetch transactions');
      
      // Fallback to localStorage
      const stored = localStorage.getItem("merchantTransactions");
      if (stored) {
        const parsed = JSON.parse(stored);
        const mapped: MerchantTransaction[] = parsed.map((tx: any, index: number) => ({
          id: tx.id?.toString() || `tx_${index}`,
          txHash: tx.txHash || `0x${Math.random().toString(16).slice(2)}`,
          customer: tx.sender || `0x${Math.random().toString(16).slice(2, 42)}`,
          amount: tx.amount?.toString() || '0',
          amountRaw: BigInt(Math.floor((parseFloat(tx.amount) || 0) * 1e18)),
          timestamp: tx.timestamp ? new Date(tx.timestamp) : new Date(),
          blockNumber: BigInt(0),
          status: 'completed' as const,
        }));
        setTransactions(mapped);
      }
    } finally {
      setIsLoading(false);
    }
  }, [address, publicClient, getMerchantAddress]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Listen for localStorage updates (for demo mode)
  useEffect(() => {
    const handleUpdate = () => {
      fetchTransactions();
    };
    window.addEventListener("merchantTransactionUpdate", handleUpdate);
    return () => window.removeEventListener("merchantTransactionUpdate", handleUpdate);
  }, [fetchTransactions]);

  const filterTransactions = useCallback((filters: TransactionFilters) => {
    return transactions.filter(tx => {
      // Date filters
      if (filters.dateFrom && tx.timestamp < filters.dateFrom) return false;
      if (filters.dateTo && tx.timestamp > filters.dateTo) return false;
      
      // Amount filters
      const amount = parseFloat(tx.amount);
      if (filters.minAmount && amount < parseFloat(filters.minAmount)) return false;
      if (filters.maxAmount && amount > parseFloat(filters.maxAmount)) return false;
      
      // Status filter
      if (filters.status && filters.status !== 'all' && tx.status !== filters.status) return false;
      
      // Search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        return (
          tx.id.toLowerCase().includes(query) ||
          tx.txHash.toLowerCase().includes(query) ||
          tx.customer.toLowerCase().includes(query) ||
          tx.amount.includes(query)
        );
      }
      
      return true;
    });
  }, [transactions]);

  const getStats = useCallback(() => {
    const totalAmount = transactions.reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
    const completedCount = transactions.filter(tx => tx.status === 'completed').length;
    
    return {
      totalTransactions: transactions.length,
      totalVolume: totalAmount.toFixed(2),
      completedTransactions: completedCount,
      averageAmount: transactions.length > 0 ? (totalAmount / transactions.length).toFixed(2) : '0',
    };
  }, [transactions]);

  return {
    transactions,
    isLoading,
    error,
    refetch: fetchTransactions,
    filterTransactions,
    getStats,
  };
};
