import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from "@/components/ui/card";
import { format, differenceInDays } from "date-fns";

interface LockedToken {
  id: string;
  tokenName: string;
  amount: string;
  lockDate: Date;
  unlockDate: Date;
  status: "locked" | "unlocked" | "pending";
}

interface VestingChartProps {
  lockedTokens: LockedToken[];
}

export const VestingChart = ({ lockedTokens }: VestingChartProps) => {
  // Generate chart data based on locked tokens
  const generateChartData = () => {
    if (lockedTokens.length === 0) return [];

    const allDates: Date[] = [];
    lockedTokens.forEach(lock => {
      allDates.push(lock.lockDate);
      allDates.push(lock.unlockDate);
    });

    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
    
    const data: { date: string; locked: number; unlocked: number }[] = [];
    const totalDays = differenceInDays(maxDate, minDate) || 30;
    const step = Math.max(1, Math.floor(totalDays / 12));

    for (let i = 0; i <= totalDays; i += step) {
      const currentDate = new Date(minDate.getTime() + i * 24 * 60 * 60 * 1000);
      
      let lockedAmount = 0;
      let unlockedAmount = 0;

      lockedTokens.forEach(lock => {
        const amount = parseFloat(lock.amount);
        if (currentDate >= lock.lockDate && currentDate < lock.unlockDate) {
          lockedAmount += amount;
        } else if (currentDate >= lock.unlockDate) {
          unlockedAmount += amount;
        }
      });

      data.push({
        date: format(currentDate, "MMM d"),
        locked: lockedAmount,
        unlocked: unlockedAmount,
      });
    }

    return data;
  };

  const chartData = generateChartData();

  if (lockedTokens.length === 0) {
    return null;
  }

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm">
      <h3 className="font-bold text-lg mb-4">Vesting Schedule</h3>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="lockedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="unlockedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="date" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={(value) => value >= 1000000 ? `${(value / 1000000).toFixed(1)}M` : value >= 1000 ? `${(value / 1000).toFixed(0)}K` : value}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              formatter={(value: number) => [
                value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
              ]}
            />
            <Area
              type="monotone"
              dataKey="locked"
              stroke="hsl(var(--primary))"
              fill="url(#lockedGradient)"
              strokeWidth={2}
              name="Locked"
            />
            <Area
              type="monotone"
              dataKey="unlocked"
              stroke="#22c55e"
              fill="url(#unlockedGradient)"
              strokeWidth={2}
              name="Unlocked"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-sm text-muted-foreground">Locked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-sm text-muted-foreground">Unlocked</span>
        </div>
      </div>
    </Card>
  );
};
