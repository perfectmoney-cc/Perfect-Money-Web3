import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, ArrowUpRight, ExternalLink, Clock, Coins } from "lucide-react";
import { useAccount } from 'wagmi';
import { formatUnits, formatEther } from 'viem';
import { CONTRACT_ADDRESSES } from "@/contracts/addresses";

const PRESALE_ADDRESS = CONTRACT_ADDRESSES[56].PMPresale as `0x${string}`;
const ROUND_NAMES = ["Seed", "Private", "Public"] as const;
const ROUND_COLORS = ["bg-yellow-500/20 text-yellow-400", "bg-blue-500/20 text-blue-400", "bg-green-500/20 text-green-400"];
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://xldptgnlmwpfcvnpvkbx.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsZHB0Z25sbXdwZmN2bnB2a2J4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyNDI4NjMsImV4cCI6MjA2MDgxODg2M30.cUNkPBxNBV1LjNHdaASPjYzGyjjLmvUe3CcDj9RjWbg";

interface PurchaseEvent {
  buyer: string;
  round: number;
  bnbAmount: bigint;
  tokenAmount: bigint;
  transactionHash: string;
  blockNumber: string;
  timestamp: number;
}

interface PresalePurchaseHistoryProps {
  tokenDecimals?: number;
}

export const PresalePurchaseHistory = ({ tokenDecimals = 18 }: PresalePurchaseHistoryProps) => {
  const { address, isConnected } = useAccount();
  const [purchases, setPurchases] = useState<PurchaseEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPurchaseHistory = async () => {
      if (!isConnected || !address) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Call edge function to fetch presale events using Alchemy API
        const response = await fetch(`${SUPABASE_URL}/functions/v1/fetch-presale-events`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({
            address: address,
            contractAddress: PRESALE_ADDRESS
          })
        });

        const data = await response.json();

        if (data?.error) {
          throw new Error(data.error);
        }

        const events = (data?.events || []).map((event: any) => ({
          buyer: event.buyer,
          round: event.round,
          bnbAmount: BigInt(event.bnbAmount),
          tokenAmount: BigInt(event.tokenAmount),
          transactionHash: event.transactionHash,
          blockNumber: event.blockNumber,
          timestamp: event.timestamp
        }));

        setPurchases(events);
      } catch (err: any) {
        console.error("Failed to fetch purchase history:", err);
        setError("Failed to load purchase history");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPurchaseHistory();

    const handleTransactionUpdate = () => {
      fetchPurchaseHistory();
    };

    window.addEventListener('transactionUpdate', handleTransactionUpdate);
    return () => window.removeEventListener('transactionUpdate', handleTransactionUpdate);
  }, [address, isConnected]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const shortenTxHash = (hash: string) => {
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  // Calculate totals by round
  const totalsByRound = purchases.reduce((acc, p) => {
    acc[p.round] = (acc[p.round] || 0n) + p.tokenAmount;
    return acc;
  }, {} as Record<number, bigint>);

  const totalBnbSpent = purchases.reduce((acc, p) => acc + p.bnbAmount, 0n);
  const totalTokens = purchases.reduce((acc, p) => acc + p.tokenAmount, 0n);

  if (!isConnected) {
    return null;
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          Your Purchase History
        </h3>
        {purchases.length > 0 && (
          <Badge variant="secondary">{purchases.length} transactions</Badge>
        )}
      </div>

      {/* Summary Stats */}
      {purchases.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Total Purchased</p>
            <p className="text-sm font-bold text-primary">
              {Number(formatUnits(totalTokens, tokenDecimals)).toLocaleString('en-US', { maximumFractionDigits: 0 })} PM
            </p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Total Spent</p>
            <p className="text-sm font-bold">
              {Number(formatEther(totalBnbSpent)).toFixed(4)} BNB
            </p>
          </div>
          {Object.entries(totalsByRound).map(([round, amount]) => (
            <div key={round} className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">{ROUND_NAMES[Number(round)]}</p>
              <p className="text-sm font-bold">
                {Number(formatUnits(amount, tokenDecimals)).toLocaleString('en-US', { maximumFractionDigits: 0 })} PM
              </p>
            </div>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-3 rounded-lg bg-muted/30">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex items-center justify-between mt-2">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-6 text-muted-foreground">
          <p>{error}</p>
        </div>
      ) : purchases.length === 0 ? (
        <div className="text-center py-8">
          <Coins className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">No purchases yet</p>
          <p className="text-sm text-muted-foreground/70">Your presale purchases will appear here</p>
        </div>
      ) : (
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-3">
            {purchases.map((purchase, index) => (
              <div
                key={`${purchase.transactionHash}-${index}`}
                className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className={ROUND_COLORS[purchase.round]}>
                      {ROUND_NAMES[purchase.round]}
                    </Badge>
                    <span className="text-sm font-bold text-primary">
                      +{Number(formatUnits(purchase.tokenAmount, tokenDecimals)).toLocaleString('en-US', { maximumFractionDigits: 0 })} PM
                    </span>
                  </div>
                  <a
                    href={`https://bscscan.com/tx/${purchase.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    {shortenTxHash(purchase.transactionHash)}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <ArrowUpRight className="h-3 w-3" />
                    <span>Paid: {Number(formatEther(purchase.bnbAmount)).toFixed(4)} BNB</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{purchase.timestamp ? formatDate(purchase.timestamp) : 'Pending...'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </Card>
  );
};
