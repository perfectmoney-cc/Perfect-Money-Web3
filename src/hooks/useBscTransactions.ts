import { useState, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { PM_TOKEN_ADDRESS } from '@/contracts/addresses';
import { toast } from '@/hooks/use-toast';

export interface BscTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  tokenSymbol?: string;
  tokenName?: string;
  tokenDecimal?: string;
  timeStamp: string;
  type: 'send' | 'receive' | 'contract';
  status: 'completed' | 'pending' | 'failed';
  gasUsed?: string;
  gasPrice?: string;
  blockNumber: string;
}

const ALCHEMY_API_KEY = 'fDR2HBelUaleC1NKjLQlv';

export const useBscTransactions = () => {
  const { address, isConnected } = useAccount();
  const [transactions, setTransactions] = useState<BscTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previousTxHashesRef = useRef<Set<string>>(new Set());
  const isFirstFetchRef = useRef(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!isConnected || !address) {
        setTransactions([]);
        previousTxHashesRef.current = new Set();
        isFirstFetchRef.current = true;
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const alchemyUrl = `https://bnb-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;

        // Fetch outgoing transfers (external + erc20 + internal)
        const fromResponse = await fetch(alchemyUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'alchemy_getAssetTransfers',
            params: [{
              fromAddress: address,
              category: ['external', 'erc20', 'internal'],
              maxCount: '0x1E',
              order: 'desc',
            }]
          })
        });

        // Fetch incoming transfers (external + erc20 + internal)
        const toResponse = await fetch(alchemyUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 2,
            method: 'alchemy_getAssetTransfers',
            params: [{
              toAddress: address,
              category: ['external', 'erc20', 'internal'],
              maxCount: '0x1E',
              order: 'desc',
            }]
          })
        });

        // Fetch PM token contract transactions specifically
        const pmTokenResponse = await fetch(alchemyUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 3,
            method: 'alchemy_getAssetTransfers',
            params: [{
              contractAddresses: [PM_TOKEN_ADDRESS],
              category: ['erc20'],
              maxCount: '0x32',
              order: 'desc',
            }]
          })
        });

        const fromData = await fromResponse.json();
        const toData = await toResponse.json();
        const pmTokenData = await pmTokenResponse.json();

        const allTransfers = [
          ...(fromData.result?.transfers || []),
          ...(toData.result?.transfers || []),
          ...(pmTokenData.result?.transfers || [])
        ];

        // Sort by block number descending
        allTransfers.sort((a, b) => {
          const blockA = parseInt(a.blockNum, 16);
          const blockB = parseInt(b.blockNum, 16);
          return blockB - blockA;
        });

        // Remove duplicates
        const uniqueTransfers = allTransfers.filter((transfer, index, self) =>
          index === self.findIndex(t => t.hash === transfer.hash)
        );

        const formattedTransactions: BscTransaction[] = uniqueTransfers.map((tx: any) => {
          const isSend = tx.from?.toLowerCase() === address.toLowerCase();
          const isReceive = tx.to?.toLowerCase() === address.toLowerCase();
          
          return {
            hash: tx.hash || tx.uniqueId,
            from: tx.from || '',
            to: tx.to || '',
            value: tx.value ? parseFloat(tx.value).toFixed(6) : '0',
            tokenSymbol: tx.asset || 'BNB',
            tokenName: tx.asset,
            timeStamp: tx.metadata?.blockTimestamp 
              ? String(Math.floor(new Date(tx.metadata.blockTimestamp).getTime() / 1000)) 
              : String(Math.floor(Date.now() / 1000)),
            type: isSend ? 'send' : isReceive ? 'receive' : 'contract',
            status: 'completed',
            blockNumber: tx.blockNum || '0',
          };
        });

        const finalTransactions = formattedTransactions.slice(0, 50);

        // Check for new transactions and show toast notifications
        if (!isFirstFetchRef.current && previousTxHashesRef.current.size > 0) {
          const newTxs = finalTransactions.filter(tx => !previousTxHashesRef.current.has(tx.hash));
          
          newTxs.forEach(tx => {
            const isReceive = tx.type === 'receive';
            toast({
              title: isReceive ? '💰 New Transaction Received!' : '📤 Transaction Sent',
              description: `${isReceive ? '+' : '-'}${tx.value} ${tx.tokenSymbol}`,
              variant: isReceive ? 'default' : 'default',
            });
          });
        }

        // Update the previous tx hashes
        previousTxHashesRef.current = new Set(finalTransactions.map(tx => tx.hash));
        isFirstFetchRef.current = false;

        setTransactions(finalTransactions);
      } catch (err) {
        console.error('Error fetching BSC transactions:', err);
        setError('Failed to fetch transactions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
    
    const interval = setInterval(fetchTransactions, 30000);
    return () => clearInterval(interval);
  }, [address, isConnected]);

  return { transactions, isLoading, error };
};
