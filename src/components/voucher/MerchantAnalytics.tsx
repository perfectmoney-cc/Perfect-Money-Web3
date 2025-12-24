import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, TrendingUp, Ticket, Users, CheckCircle, 
  XCircle, Clock, PieChart as PieChartIcon, Calendar 
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";

interface AnalyticsData {
  totalVouchers: number;
  activeVouchers: number;
  redeemedVouchers: number;
  expiredVouchers: number;
  redemptionRate: number;
  totalValue: number;
  avgRedemptionTime: number;
}

const MOCK_ANALYTICS: AnalyticsData = {
  totalVouchers: 245,
  activeVouchers: 89,
  redeemedVouchers: 134,
  expiredVouchers: 22,
  redemptionRate: 54.7,
  totalValue: 12500,
  avgRedemptionTime: 3.2,
};

const DAILY_DATA = [
  { date: "Mon", created: 12, redeemed: 8 },
  { date: "Tue", created: 8, redeemed: 15 },
  { date: "Wed", created: 15, redeemed: 12 },
  { date: "Thu", created: 20, redeemed: 18 },
  { date: "Fri", created: 25, redeemed: 22 },
  { date: "Sat", created: 18, redeemed: 14 },
  { date: "Sun", created: 10, redeemed: 9 },
];

const TYPE_DISTRIBUTION = [
  { name: "Gift", value: 45, color: "#8b5cf6" },
  { name: "Discount", value: 35, color: "#3b82f6" },
  { name: "Reward", value: 20, color: "#22c55e" },
];

const REDEMPTION_BY_DAY = [
  { day: "Mon", rate: 48 },
  { day: "Tue", rate: 62 },
  { day: "Wed", rate: 55 },
  { day: "Thu", rate: 71 },
  { day: "Fri", rate: 68 },
  { day: "Sat", rate: 45 },
  { day: "Sun", rate: 38 },
];

export const MerchantAnalytics = () => {
  const [analytics] = useState<AnalyticsData>(MOCK_ANALYTICS);
  const [timeframe, setTimeframe] = useState("7d");

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Ticket className="h-4 w-4 text-blue-500" />
            <span className="text-xs text-muted-foreground">Total Vouchers</span>
          </div>
          <p className="text-2xl font-bold">{analytics.totalVouchers}</p>
          <p className="text-xs text-green-500 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> +12% this week
          </p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/30">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-xs text-muted-foreground">Redeemed</span>
          </div>
          <p className="text-2xl font-bold text-green-500">{analytics.redeemedVouchers}</p>
          <p className="text-xs text-muted-foreground">{analytics.redemptionRate}% rate</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border-yellow-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-yellow-500" />
            <span className="text-xs text-muted-foreground">Active</span>
          </div>
          <p className="text-2xl font-bold text-yellow-500">{analytics.activeVouchers}</p>
          <p className="text-xs text-muted-foreground">Pending redemption</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-purple-500" />
            <span className="text-xs text-muted-foreground">Total Value</span>
          </div>
          <p className="text-2xl font-bold text-purple-500">{analytics.totalValue.toLocaleString()} PM</p>
          <p className="text-xs text-muted-foreground">Distributed</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Weekly Activity
            </h3>
            <div className="flex gap-2">
              {["7d", "30d", "90d"].map((t) => (
                <Badge 
                  key={t}
                  variant={timeframe === t ? "default" : "outline"} 
                  className="cursor-pointer"
                  onClick={() => setTimeframe(t)}
                >
                  {t}
                </Badge>
              ))}
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DAILY_DATA}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }} 
                />
                <Bar dataKey="created" name="Created" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="redeemed" name="Redeemed" fill="hsl(142 76% 36%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Type Distribution */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-primary" />
            Voucher Type Distribution
          </h3>
          <div className="h-64 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={TYPE_DISTRIBUTION}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {TYPE_DISTRIBUTION.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Redemption Rate by Day */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Redemption Rate by Day of Week
        </h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={REDEMPTION_BY_DAY}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="day" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} unit="%" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [`${value}%`, 'Redemption Rate']}
              />
              <Area 
                type="monotone" 
                dataKey="rate" 
                stroke="hsl(var(--primary))" 
                fill="hsl(var(--primary) / 0.2)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-center text-muted-foreground mt-4">
          Best performance on Thursdays with 71% redemption rate
        </p>
      </Card>

      {/* Insights */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5">
        <h3 className="font-semibold mb-4">Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 rounded-lg bg-background/50">
            <p className="text-sm text-muted-foreground">Avg. Redemption Time</p>
            <p className="text-xl font-bold">{analytics.avgRedemptionTime} days</p>
          </div>
          <div className="p-3 rounded-lg bg-background/50">
            <p className="text-sm text-muted-foreground">Expiration Rate</p>
            <p className="text-xl font-bold text-red-500">{((analytics.expiredVouchers / analytics.totalVouchers) * 100).toFixed(1)}%</p>
          </div>
          <div className="p-3 rounded-lg bg-background/50">
            <p className="text-sm text-muted-foreground">Most Popular Type</p>
            <p className="text-xl font-bold">Gift Vouchers</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
