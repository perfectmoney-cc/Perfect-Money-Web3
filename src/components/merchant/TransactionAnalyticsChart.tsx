import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from "recharts";
import { MerchantTransaction } from "@/hooks/useMerchantTransactions";
import { format, subDays, startOfDay, startOfWeek, startOfMonth, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from "date-fns";
import pmLogo from "@/assets/pm-logo-new.png";

type Period = "daily" | "weekly" | "monthly";

interface TransactionAnalyticsChartProps {
  transactions: MerchantTransaction[];
}

const STATUS_COLORS = {
  completed: "hsl(142, 76%, 36%)",
  pending: "hsl(48, 96%, 53%)",
  failed: "hsl(0, 84%, 60%)",
};

export const TransactionAnalyticsChart = ({ transactions }: TransactionAnalyticsChartProps) => {
  const [period, setPeriod] = useState<Period>("daily");

  const chartData = useMemo(() => {
    const now = new Date();
    
    if (period === "daily") {
      // Last 7 days
      const days = eachDayOfInterval({ start: subDays(now, 6), end: now });
      return days.map(day => {
        const dayStart = startOfDay(day);
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayEnd.getDate() + 1);
        
        const dayTransactions = transactions.filter(tx => 
          tx.timestamp >= dayStart && tx.timestamp < dayEnd
        );
        
        const volume = dayTransactions.reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
        const count = dayTransactions.length;
        
        return {
          name: format(day, "EEE"),
          fullDate: format(day, "MMM d"),
          volume: Math.round(volume * 100) / 100,
          count,
        };
      });
    }
    
    if (period === "weekly") {
      // Last 4 weeks
      const weeks = eachWeekOfInterval({ start: subDays(now, 27), end: now });
      return weeks.slice(-4).map((weekStart, index) => {
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);
        
        const weekTransactions = transactions.filter(tx => 
          tx.timestamp >= weekStart && tx.timestamp < weekEnd
        );
        
        const volume = weekTransactions.reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
        const count = weekTransactions.length;
        
        return {
          name: `Week ${index + 1}`,
          fullDate: format(weekStart, "MMM d"),
          volume: Math.round(volume * 100) / 100,
          count,
        };
      });
    }
    
    // Monthly - last 6 months
    const months = eachMonthOfInterval({ start: subDays(now, 150), end: now });
    return months.slice(-6).map(monthStart => {
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      
      const monthTransactions = transactions.filter(tx => 
        tx.timestamp >= monthStart && tx.timestamp < monthEnd
      );
      
      const volume = monthTransactions.reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
      const count = monthTransactions.length;
      
      return {
        name: format(monthStart, "MMM"),
        fullDate: format(monthStart, "MMM yyyy"),
        volume: Math.round(volume * 100) / 100,
        count,
      };
    });
  }, [transactions, period]);

  const statusData = useMemo(() => {
    const completed = transactions.filter(tx => tx.status === 'completed').length;
    const pending = transactions.filter(tx => tx.status === 'pending').length;
    const failed = transactions.filter(tx => tx.status === 'failed').length;
    
    return [
      { name: 'Completed', value: completed, color: STATUS_COLORS.completed },
      { name: 'Pending', value: pending, color: STATUS_COLORS.pending },
      { name: 'Failed', value: failed, color: STATUS_COLORS.failed },
    ].filter(item => item.value > 0);
  }, [transactions]);

  const totalVolume = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.volume, 0);
  }, [chartData]);

  const totalCount = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.count, 0);
  }, [chartData]);

  return (
    <Card className="p-4 lg:p-6 bg-card/50 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="font-bold text-lg">Transaction Analytics</h3>
          <div className="flex items-center gap-4 mt-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{totalVolume.toLocaleString()}</span>
              <img src={pmLogo} alt="PM" className="h-5 w-5" />
              <span className="font-semibold">PM</span>
            </div>
            <span className="text-muted-foreground">|</span>
            <span className="text-muted-foreground">{totalCount} transactions</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          {(["daily", "weekly", "monthly"] as Period[]).map((p) => (
            <Button
              key={p}
              variant={period === p ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod(p)}
              className="text-xs px-3 py-1 h-7"
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Volume Chart */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">Volume Trend</p>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis 
                  dataKey="name" 
                  className="text-xs" 
                  tick={{ fill: 'hsl(var(--muted-foreground))' }} 
                />
                <YAxis 
                  className="text-xs" 
                  tick={{ fill: 'hsl(var(--muted-foreground))' }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`${value.toLocaleString()} PM`, 'Volume']}
                  labelFormatter={(_, payload) => payload[0]?.payload?.fullDate || ''}
                />
                <Area 
                  type="monotone" 
                  dataKey="volume" 
                  stroke="hsl(var(--primary))" 
                  fillOpacity={1} 
                  fill="url(#colorVolume)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transaction Count Chart */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">Transaction Count</p>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis 
                  dataKey="name" 
                  className="text-xs" 
                  tick={{ fill: 'hsl(var(--muted-foreground))' }} 
                />
                <YAxis 
                  className="text-xs" 
                  tick={{ fill: 'hsl(var(--muted-foreground))' }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`${value} transactions`, 'Count']}
                  labelFormatter={(_, payload) => payload[0]?.payload?.fullDate || ''}
                />
                <Bar 
                  dataKey="count" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Pie Chart */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">Status Distribution</p>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              {statusData.length > 0 ? (
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number, name: string) => [`${value} transactions`, name]}
                  />
                  <Legend 
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => <span className="text-xs text-foreground">{value}</span>}
                  />
                </PieChart>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  No transaction data
                </div>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Card>
  );
};
