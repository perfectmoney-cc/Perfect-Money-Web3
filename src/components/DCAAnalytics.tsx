import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarClock, TrendingUp, TrendingDown, DollarSign, Target, Coins, BarChart } from 'lucide-react';
import { useRecurringPurchases } from '@/hooks/useRecurringPurchases';
import { usePurchaseHistory } from '@/hooks/usePurchaseHistory';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart as RechartsBar, Bar } from 'recharts';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DCAAnalyticsProps {
  currentPrices: Record<string, number>;
  currency: string;
  currencySymbol: string;
}

const CRYPTO_ICONS: Record<string, string> = {
  BNB: "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png",
  ETH: "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
  BTC: "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png",
  USDT: "https://s2.coinmarketcap.com/static/img/coins/64x64/825.png",
  USDC: "https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png",
  SOL: "https://s2.coinmarketcap.com/static/img/coins/64x64/5426.png",
  MATIC: "https://s2.coinmarketcap.com/static/img/coins/64x64/3890.png",
  AVAX: "https://s2.coinmarketcap.com/static/img/coins/64x64/5805.png",
};

const DCAAnalytics = ({ currentPrices, currency, currencySymbol }: DCAAnalyticsProps) => {
  const { recurringPurchases, activePurchases, getFrequencyLabel } = useRecurringPurchases();
  const { completedPurchases } = usePurchaseHistory();

  // Calculate DCA stats per recurring purchase
  const dcaStats = useMemo(() => {
    return recurringPurchases.map(rp => {
      const relatedPurchases = completedPurchases.filter(
        p => p.crypto === rp.crypto && p.provider === rp.provider
      );
      
      const totalInvested = rp.totalSpent;
      const totalCrypto = relatedPurchases.reduce((sum, p) => sum + p.estimatedCrypto, 0);
      const avgPrice = totalCrypto > 0 ? totalInvested / totalCrypto : 0;
      const currentPrice = currentPrices[rp.crypto] || 0;
      const currentValue = totalCrypto * currentPrice;
      const pnl = currentValue - totalInvested;
      const pnlPercent = totalInvested > 0 ? (pnl / totalInvested) * 100 : 0;

      return {
        ...rp,
        totalCrypto,
        avgPrice,
        currentPrice,
        currentValue,
        pnl,
        pnlPercent,
      };
    });
  }, [recurringPurchases, completedPurchases, currentPrices]);

  // Monthly investment data for chart
  const monthlyData = useMemo(() => {
    const months: Record<string, { month: string; invested: number; value: number }> = {};
    
    completedPurchases.forEach(p => {
      const date = new Date(p.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      
      if (!months[monthKey]) {
        months[monthKey] = { month: monthLabel, invested: 0, value: 0 };
      }
      months[monthKey].invested += p.fiatAmount;
      months[monthKey].value += p.estimatedCrypto * (currentPrices[p.crypto] || 0);
    });

    return Object.values(months).slice(-12);
  }, [completedPurchases, currentPrices]);

  // DCA performance by crypto
  const cryptoPerformance = useMemo(() => {
    const performance: Record<string, { crypto: string; invested: number; value: number; avgPrice: number; amount: number }> = {};
    
    completedPurchases.forEach(p => {
      if (!performance[p.crypto]) {
        performance[p.crypto] = { crypto: p.crypto, invested: 0, value: 0, avgPrice: 0, amount: 0 };
      }
      performance[p.crypto].invested += p.fiatAmount;
      performance[p.crypto].amount += p.estimatedCrypto;
    });

    return Object.values(performance).map(p => ({
      ...p,
      value: p.amount * (currentPrices[p.crypto] || 0),
      avgPrice: p.invested / p.amount,
      pnl: (p.amount * (currentPrices[p.crypto] || 0)) - p.invested,
    })).sort((a, b) => b.invested - a.invested);
  }, [completedPurchases, currentPrices]);

  const totalInvested = dcaStats.reduce((sum, s) => sum + s.totalSpent, 0);
  const totalValue = dcaStats.reduce((sum, s) => sum + s.currentValue, 0);
  const totalPnl = totalValue - totalInvested;

  if (recurringPurchases.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="py-12 text-center">
          <CalendarClock className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="font-medium text-muted-foreground">No recurring purchases set up</p>
          <p className="text-sm text-muted-foreground mt-1">
            Set up auto-buy to start building your DCA strategy
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* DCA Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Target className="h-3 w-3" />
              Active Strategies
            </div>
            <p className="text-2xl font-bold text-primary">{activePurchases.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <DollarSign className="h-3 w-3" />
              Total Invested
            </div>
            <p className="text-2xl font-bold">{currencySymbol}{totalInvested.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Coins className="h-3 w-3" />
              Current Value
            </div>
            <p className="text-2xl font-bold">{currencySymbol}{totalValue.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              {totalPnl >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              Total P&L
            </div>
            <p className={`text-2xl font-bold ${totalPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {totalPnl >= 0 ? '+' : ''}{currencySymbol}{totalPnl.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Investment vs Value Chart */}
      {monthlyData.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart className="h-5 w-5 text-primary" />
              DCA Performance Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBar data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 20%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(0, 0%, 50%)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(0, 0%, 50%)" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(0, 0%, 10%)', 
                      border: '1px solid hsl(0, 0%, 20%)',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`${currencySymbol}${value.toFixed(2)}`, '']}
                  />
                  <Bar dataKey="invested" name="Invested" fill="hsl(0, 0%, 40%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="value" name="Value" fill="hsl(0, 85%, 50%)" radius={[4, 4, 0, 0]} />
                </RechartsBar>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded bg-muted" />
                <span className="text-muted-foreground">Invested</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded bg-primary" />
                <span className="text-muted-foreground">Current Value</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active DCA Strategies */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-primary" />
            DCA Strategies Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-3">
              {dcaStats.map((strategy) => (
                <div 
                  key={strategy.id}
                  className="p-4 border border-border rounded-lg hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <img 
                        src={CRYPTO_ICONS[strategy.crypto]} 
                        alt={strategy.crypto}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <p className="font-medium">{strategy.crypto}</p>
                        <p className="text-xs text-muted-foreground">
                          {getFrequencyLabel(strategy.frequency, strategy.dayOfWeek, strategy.dayOfMonth)}
                        </p>
                      </div>
                    </div>
                    <Badge variant={strategy.isActive ? "default" : "secondary"}>
                      {strategy.isActive ? "Active" : "Paused"}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Invested</p>
                      <p className="font-medium">{currencySymbol}{strategy.totalSpent.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Avg Price</p>
                      <p className="font-medium">{currencySymbol}{strategy.avgPrice.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Holdings</p>
                      <p className="font-medium">{strategy.totalCrypto.toFixed(6)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">P&L</p>
                      <p className={`font-medium ${strategy.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {strategy.pnl >= 0 ? '+' : ''}{strategy.pnlPercent.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                    <span>{strategy.totalExecutions} executions</span>
                    <span>Next: {new Date(strategy.nextExecution).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default DCAAnalytics;
