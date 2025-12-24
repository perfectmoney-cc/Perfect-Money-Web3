import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowUpRight, ArrowDownLeft, ArrowDownUp, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Transaction } from "@/hooks/useTransactionHistory";
import { formatDistanceToNow } from "date-fns";

interface TransactionHistoryProps {
  transactions: Transaction[];
}

export const TransactionHistory = ({ transactions }: TransactionHistoryProps) => {
  const getIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'send':
        return <ArrowUpRight className="h-4 w-4 text-red-400" />;
      case 'receive':
        return <ArrowDownLeft className="h-4 w-4 text-green-400" />;
      case 'swap':
        return <ArrowDownUp className="h-4 w-4 text-blue-400" />;
    }
  };

  const getStatusIcon = (status: Transaction['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-3.5 w-3.5 text-yellow-400 animate-pulse" />;
      case 'completed':
        return <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />;
      case 'failed':
        return <XCircle className="h-3.5 w-3.5 text-red-400" />;
    }
  };

  const getStatusBadge = (status: Transaction['status']) => {
    const variants = {
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      completed: 'bg-green-500/20 text-green-400 border-green-500/30',
      failed: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return variants[status];
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (transactions.length === 0) {
    return (
      <Card className="p-6 bg-card border-border">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Transaction History
        </h3>
        <div className="text-center py-8 text-muted-foreground">
          <p>No transactions yet</p>
          <p className="text-sm mt-1">Your transactions will appear here</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 md:p-6 bg-card border-border">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <Clock className="h-5 w-5 text-primary" />
        Transaction History
      </h3>
      <ScrollArea className="h-[300px] pr-4">
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-background">
                  {getIcon(tx.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium capitalize">{tx.type}</span>
                    <Badge variant="outline" className={`text-[10px] ${getStatusBadge(tx.status)}`}>
                      {getStatusIcon(tx.status)}
                      <span className="ml-1">{tx.status}</span>
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {tx.type === 'send' ? 'To: ' : tx.type === 'receive' ? 'From: ' : ''}
                    {truncateAddress(tx.address)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${tx.type === 'receive' ? 'text-green-400' : tx.type === 'send' ? 'text-red-400' : 'text-foreground'}`}>
                  {tx.type === 'receive' ? '+' : tx.type === 'send' ? '-' : ''}{tx.amount} {tx.token}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(tx.timestamp, { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};
