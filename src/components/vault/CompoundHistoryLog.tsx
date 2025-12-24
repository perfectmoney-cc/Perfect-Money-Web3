import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Zap, Clock, History } from "lucide-react";
import { formatUnits } from "viem";

interface CompoundEntry {
  stakeIndex: number;
  amount: number;
  timestamp: number;
  isAutoCompound: boolean;
}

interface CompoundHistoryLogProps {
  compoundHistory: CompoundEntry[];
  stakingPlans: Array<{ id: number; name: string }>;
  userStakes: Array<{ planId: number; token: string }>;
}

export const CompoundHistoryLog = ({ 
  compoundHistory, 
  stakingPlans,
  userStakes 
}: CompoundHistoryLogProps) => {
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRelativeTime = (timestamp: number) => {
    const now = Date.now() / 1000;
    const diff = now - timestamp;
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return formatTimestamp(timestamp);
  };

  const getPlanName = (stakeIndex: number) => {
    const stake = userStakes[stakeIndex];
    if (!stake) return 'Unknown';
    const plan = stakingPlans.find(p => p.id === stake.planId);
    return plan?.name || 'Unknown';
  };

  const getToken = (stakeIndex: number) => {
    const stake = userStakes[stakeIndex];
    return stake?.token || 'USDT';
  };

  // Sort by timestamp descending (newest first)
  const sortedHistory = [...compoundHistory].sort((a, b) => b.timestamp - a.timestamp);

  if (sortedHistory.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          Compound History
        </h3>
        <div className="text-center py-12 text-muted-foreground">
          <RefreshCw className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No compound history yet</p>
          <p className="text-sm">Compound your rewards to see history</p>
        </div>
      </Card>
    );
  }

  // Calculate totals
  const totalManualCompounds = sortedHistory.filter(e => !e.isAutoCompound).length;
  const totalAutoCompounds = sortedHistory.filter(e => e.isAutoCompound).length;
  const totalAmountCompounded = sortedHistory.reduce((sum, e) => sum + e.amount, 0);

  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <History className="h-5 w-5 text-primary" />
        Compound History
        <Badge variant="secondary" className="ml-auto">
          {sortedHistory.length} entries
        </Badge>
      </h3>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="p-3 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
          <p className="text-xs text-muted-foreground">Total Compounded</p>
          <p className="text-lg font-bold text-primary">${totalAmountCompounded.toFixed(2)}</p>
        </div>
        <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
          <p className="text-xs text-muted-foreground">Manual</p>
          <p className="text-lg font-bold text-blue-500">{totalManualCompounds}</p>
        </div>
        <div className="p-3 rounded-lg bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20">
          <p className="text-xs text-muted-foreground">Auto</p>
          <p className="text-lg font-bold text-green-500">{totalAutoCompounds}</p>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {sortedHistory.map((entry, index) => (
          <div 
            key={`${entry.timestamp}-${index}`} 
            className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                entry.isAutoCompound 
                  ? "bg-green-500/20" 
                  : "bg-blue-500/20"
              }`}>
                {entry.isAutoCompound ? (
                  <Zap className="h-4 w-4 text-green-500" />
                ) : (
                  <RefreshCw className="h-4 w-4 text-blue-500" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">
                    {entry.isAutoCompound ? 'Auto-Compound' : 'Manual Compound'}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {getPlanName(entry.stakeIndex)}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{getRelativeTime(entry.timestamp)}</span>
                  <span className="opacity-50">•</span>
                  <span>{formatTimestamp(entry.timestamp)}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-green-500">
                +${entry.amount.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">
                {getToken(entry.stakeIndex)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
