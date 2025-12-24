import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import pmLogo from "@/assets/pm-logo-new.png";

const dailyData = [
  { name: "Mon", revenue: 1200 },
  { name: "Tue", revenue: 1800 },
  { name: "Wed", revenue: 1400 },
  { name: "Thu", revenue: 2200 },
  { name: "Fri", revenue: 1900 },
  { name: "Sat", revenue: 2800 },
  { name: "Sun", revenue: 2100 },
];

const weeklyData = [
  { name: "Week 1", revenue: 8500 },
  { name: "Week 2", revenue: 9200 },
  { name: "Week 3", revenue: 7800 },
  { name: "Week 4", revenue: 11200 },
];

const monthlyData = [
  { name: "Jan", revenue: 28000 },
  { name: "Feb", revenue: 32000 },
  { name: "Mar", revenue: 29000 },
  { name: "Apr", revenue: 35000 },
  { name: "May", revenue: 42000 },
  { name: "Jun", revenue: 38000 },
];

const annualData = [
  { name: "2021", revenue: 120000 },
  { name: "2022", revenue: 185000 },
  { name: "2023", revenue: 245000 },
  { name: "2024", revenue: 312000 },
];

type Period = "daily" | "weekly" | "monthly" | "annually";

export const RevenueChart = () => {
  const [period, setPeriod] = useState<Period>("daily");

  const getData = () => {
    switch (period) {
      case "daily": return dailyData;
      case "weekly": return weeklyData;
      case "monthly": return monthlyData;
      case "annually": return annualData;
    }
  };

  const getTotal = () => {
    return getData().reduce((sum, item) => sum + item.revenue, 0);
  };

  return (
    <Card className="p-4 lg:p-6 bg-card/50 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="font-bold text-lg">Revenue Overview</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-bold">{getTotal().toLocaleString()}</span>
            <img src={pmLogo} alt="PM" className="h-5 w-5" />
            <span className="font-semibold">PM</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          {(["daily", "weekly", "monthly", "annually"] as Period[]).map((p) => (
            <Button
              key={p}
              variant={period === p ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod(p)}
              className="text-xs px-2 py-1 h-7"
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="h-[200px] lg:h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={getData()}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="name" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
            <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
              formatter={(value: number) => [`${value.toLocaleString()} PM`, 'Revenue']}
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="hsl(var(--primary))" 
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
