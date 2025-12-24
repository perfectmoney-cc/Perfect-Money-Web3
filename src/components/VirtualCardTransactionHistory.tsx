import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowDownToLine, ArrowUpFromLine, ShoppingCart, RefreshCw, ExternalLink, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatEther } from "viem";
import { Skeleton } from "@/components/ui/skeleton";
import { useVirtualCardTransactions, VirtualCardTransaction } from "@/hooks/useVirtualCardTransactions";

interface VirtualCardTransactionHistoryProps {
  externalTransactions?: VirtualCardTransaction[];
  externalLoading?: boolean;
  onRefresh?: () => void;
}

const VirtualCardTransactionHistory = ({
  externalTransactions,
  externalLoading,
  onRefresh
}: VirtualCardTransactionHistoryProps) => {
  const [filter, setFilter] = useState<"all" | "deposit" | "withdrawal" | "spend">("all");
  const { transactions: hookTransactions, isLoading: hookLoading, error, refetch } = useVirtualCardTransactions();

  const transactions = externalTransactions || hookTransactions;
  const isLoading = externalLoading !== undefined ? externalLoading : hookLoading;

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      refetch();
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowDownToLine className="h-4 w-4 text-green-500" />;
      case "withdrawal":
        return <ArrowUpFromLine className="h-4 w-4 text-yellow-500" />;
      case "spend":
        return <ShoppingCart className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "deposit":
        return "text-green-500";
      case "withdrawal":
        return "text-yellow-500";
      case "spend":
        return "text-red-500";
      default:
        return "";
    }
  };

  const filteredTransactions = filter === "all" 
    ? transactions 
    : transactions.filter(tx => tx.type === filter);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const truncateHash = (hash: string) => {
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  const formatAmount = (amount: string) => {
    try {
      return Number(formatEther(BigInt(amount))).toLocaleString();
    } catch {
      return "0";
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-primary" />
            Transaction History
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)} className="space-y-4">
          <TabsList className="w-full bg-muted/50">
            <TabsTrigger value="all" className="flex-1 text-xs">All</TabsTrigger>
            <TabsTrigger value="deposit" className="flex-1 text-xs">Deposits</TabsTrigger>
            <TabsTrigger value="withdrawal" className="flex-1 text-xs">Withdrawals</TabsTrigger>
            <TabsTrigger value="spend" className="flex-1 text-xs">Spending</TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="space-y-3 mt-0">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded-lg" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-destructive opacity-50" />
                <p className="text-sm text-destructive">{error}</p>
                <Button variant="ghost" size="sm" onClick={handleRefresh} className="mt-2">
                  Try Again
                </Button>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No transactions found</p>
                <p className="text-xs mt-1">Your transaction history will appear here</p>
              </div>
            ) : (
              filteredTransactions.map((tx, index) => (
                <div
                  key={`${tx.txHash}-${index}`}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-background rounded-lg">
                      {getIcon(tx.type)}
                    </div>
                    <div>
                      <p className="font-medium text-sm capitalize">{tx.type}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(tx.timestamp)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-sm ${getTypeColor(tx.type)}`}>
                      {tx.type === "deposit" ? "+" : "-"}
                      {formatAmount(tx.amount)} PM
                    </p>
                    {tx.fee && (
                      <p className="text-xs text-muted-foreground">
                        Fee: {formatAmount(tx.fee)} PM
                      </p>
                    )}
                    {tx.cashback && (
                      <p className="text-xs text-green-500">
                        +{formatAmount(tx.cashback)} cashback
                      </p>
                    )}
                    <a
                      href={`https://bscscan.com/tx/${tx.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                    >
                      {truncateHash(tx.txHash)}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default VirtualCardTransactionHistory;
