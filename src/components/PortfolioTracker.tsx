import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Wallet, PieChart, BarChart3, RefreshCw, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePurchaseHistory, Purchase } from '@/hooks/usePurchaseHistory';
import { usePortfolioHistory } from '@/hooks/usePortfolioHistory';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PortfolioAsset {
  crypto: string;
  amount: number;
  avgCost: number;
  currentPrice: number;
  totalCost: number;
  currentValue: number;
  pnl: number;
  pnlPercent: number;
}

interface PortfolioTrackerProps {
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

const COLORS = ['hsl(0, 85%, 50%)', 'hsl(45, 85%, 50%)', 'hsl(120, 85%, 40%)', 'hsl(200, 85%, 50%)', 'hsl(270, 85%, 50%)', 'hsl(320, 85%, 50%)'];

const PortfolioTracker = ({ currentPrices, currency, currencySymbol }: PortfolioTrackerProps) => {
  const { completedPurchases } = usePurchaseHistory();
  const { saveSnapshot, getChartData, getReturns, hasHistory } = usePortfolioHistory();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [chartRange, setChartRange] = useState<'7' | '30' | '90'>('30');

  // Calculate portfolio from completed purchases
  const portfolio = useMemo((): PortfolioAsset[] => {
    const holdings: Record<string, { totalAmount: number; totalCost: number; purchases: Purchase[] }> = {};
    
    completedPurchases.forEach(purchase => {
      if (!holdings[purchase.crypto]) {
        holdings[purchase.crypto] = { totalAmount: 0, totalCost: 0, purchases: [] };
      }
      holdings[purchase.crypto].totalAmount += purchase.estimatedCrypto;
      holdings[purchase.crypto].totalCost += purchase.fiatAmount;
      holdings[purchase.crypto].purchases.push(purchase);
    });

    return Object.entries(holdings).map(([crypto, data]) => {
      const currentPrice = currentPrices[crypto] || 0;
      const avgCost = data.totalCost / data.totalAmount;
      const currentValue = data.totalAmount * currentPrice;
      const pnl = currentValue - data.totalCost;
      const pnlPercent = data.totalCost > 0 ? (pnl / data.totalCost) * 100 : 0;

      return {
        crypto,
        amount: data.totalAmount,
        avgCost,
        currentPrice,
        totalCost: data.totalCost,
        currentValue,
        pnl,
        pnlPercent,
      };
    }).sort((a, b) => b.currentValue - a.currentValue);
  }, [completedPurchases, currentPrices]);

  const totalValue = portfolio.reduce((sum, asset) => sum + asset.currentValue, 0);
  const totalCost = portfolio.reduce((sum, asset) => sum + asset.totalCost, 0);
  const totalPnl = totalValue - totalCost;
  const totalPnlPercent = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

  // Pie chart data
  const pieData = portfolio.map((asset, index) => ({
    name: asset.crypto,
    value: asset.currentValue,
    color: COLORS[index % COLORS.length],
  }));

  // Save portfolio snapshot when values change
  useEffect(() => {
    if (totalValue > 0 && portfolio.length > 0) {
      const holdings: Record<string, { amount: number; value: number; price: number }> = {};
      portfolio.forEach(asset => {
        holdings[asset.crypto] = {
          amount: asset.amount,
          value: asset.currentValue,
          price: asset.currentPrice,
        };
      });
      saveSnapshot(totalValue, totalCost, holdings);
    }
  }, [totalValue, totalCost, portfolio, saveSnapshot]);

  // Get historical chart data
  const historyData = useMemo(() => {
    const days = parseInt(chartRange);
    const chartData = getChartData(days);
    
    // If we have history, use it
    if (chartData.length > 0) {
      return chartData;
    }
    
    // Otherwise generate placeholder data based on current value
    const now = new Date();
    return Array.from({ length: days }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (days - 1 - i));
      const variation = 1 + (Math.random() - 0.5) * 0.05;
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: totalValue * variation * (0.9 + i * (0.1 / days)),
        cost: totalCost,
        pnl: 0,
      };
    });
  }, [chartRange, getChartData, totalValue, totalCost]);

  // Calculate period returns
  const periodReturns = useMemo(() => getReturns(parseInt(chartRange)), [chartRange, getReturns]);

  if (completedPurchases.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="py-12 text-center">
          <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="font-medium text-muted-foreground">No completed purchases yet</p>
          <p className="text-sm text-muted-foreground mt-1">Your portfolio will appear here after your first crypto purchase</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <Card className="bg-gradient-to-br from-card to-primary/5 border-primary/20">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              Portfolio Value
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={chartRange} onValueChange={(v: '7' | '30' | '90') => setChartRange(v)}>
                <SelectTrigger className="w-[80px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7D</SelectItem>
                  <SelectItem value="30">30D</SelectItem>
                  <SelectItem value="90">90D</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsRefreshing(true)}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="text-3xl font-bold">
                {currencySymbol}{totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <div className={`flex items-center gap-1 text-sm ${totalPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {totalPnl >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                <span className="font-medium">
                  {totalPnl >= 0 ? '+' : ''}{currencySymbol}{totalPnl.toFixed(2)} ({totalPnlPercent.toFixed(2)}%)
                </span>
              </div>
              {hasHistory && periodReturns.startValue > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {chartRange}D: {periodReturns.percentReturn >= 0 ? '+' : ''}{periodReturns.percentReturn.toFixed(2)}%
                </p>
              )}
            </div>
            <Badge variant="outline" className="text-xs">
              {portfolio.length} asset{portfolio.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          {/* Mini Chart */}
          <div className="h-24">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData}>
                <defs>
                  <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(0, 85%, 50%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(0, 85%, 50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" hide />
                <YAxis hide domain={['dataMin', 'dataMax']} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(0, 0%, 10%)', 
                    border: '1px solid hsl(0, 0%, 20%)',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  formatter={(value: number) => [`${currencySymbol}${value.toFixed(2)}`, 'Value']}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(0, 85%, 50%)"
                  strokeWidth={2}
                  fill="url(#portfolioGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="assets" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="assets" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Assets
          </TabsTrigger>
          <TabsTrigger value="allocation" className="gap-2">
            <PieChart className="h-4 w-4" />
            Allocation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assets">
          <Card className="bg-card border-border">
            <CardContent className="pt-4">
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {portfolio.map((asset) => (
                    <div 
                      key={asset.crypto}
                      className="flex items-center justify-between p-3 border border-border rounded-lg hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img 
                          src={CRYPTO_ICONS[asset.crypto]} 
                          alt={asset.crypto}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <p className="font-medium">{asset.crypto}</p>
                          <p className="text-xs text-muted-foreground">
                            {asset.amount.toFixed(6)} @ {currencySymbol}{asset.avgCost.toFixed(2)} avg
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {currencySymbol}{asset.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <div className={`flex items-center justify-end gap-1 text-xs ${asset.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {asset.pnl >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          <span>{asset.pnl >= 0 ? '+' : ''}{asset.pnlPercent.toFixed(2)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allocation">
          <Card className="bg-card border-border">
            <CardContent className="pt-4">
              <div className="h-[200px] mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`${currencySymbol}${value.toFixed(2)}`, 'Value']}
                    />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {pieData.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-2 text-sm">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-muted-foreground">{item.name}</span>
                    <span className="font-medium ml-auto">
                      {((item.value / totalValue) * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PortfolioTracker;
