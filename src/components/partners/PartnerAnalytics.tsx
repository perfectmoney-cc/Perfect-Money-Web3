import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from "recharts";
import { TrendingUp, Globe, DollarSign, Users, Calendar } from "lucide-react";

interface Partner {
  id: number;
  name: string;
  country: string;
  tier: number;
  status: number;
  totalRevenue: string;
  joinedAt: string;
}

interface PartnerAnalyticsProps {
  partners: Partner[];
}

const tierNames = ["Bronze", "Silver", "Gold", "Platinum"];

export const PartnerAnalytics = ({ partners }: PartnerAnalyticsProps) => {
  // Calculate monthly growth data
  const growthData = [
    { month: "Jul", partners: 5, revenue: 45000 },
    { month: "Aug", partners: 8, revenue: 78000 },
    { month: "Sep", partners: 10, revenue: 95000 },
    { month: "Oct", partners: 12, revenue: 125000 },
    { month: "Nov", partners: 14, revenue: 168000 },
    { month: "Dec", partners: partners.length, revenue: partners.reduce((sum, p) => sum + parseFloat(p.totalRevenue), 0) },
  ];

  // Geographic distribution
  const countryData = partners.reduce((acc, partner) => {
    const existing = acc.find(c => c.country === partner.country);
    if (existing) {
      existing.count++;
      existing.revenue += parseFloat(partner.totalRevenue);
    } else {
      acc.push({ 
        country: partner.country, 
        count: 1, 
        revenue: parseFloat(partner.totalRevenue) 
      });
    }
    return acc;
  }, [] as { country: string; count: number; revenue: number }[]).sort((a, b) => b.count - a.count);

  // Tier distribution
  const tierData = tierNames.map((name, index) => ({
    name,
    count: partners.filter(p => p.tier === index).length,
    fill: index === 0 ? "hsl(24, 95%, 53%)" : 
          index === 1 ? "hsl(0, 0%, 70%)" : 
          index === 2 ? "hsl(45, 95%, 50%)" : 
          "hsl(280, 70%, 60%)"
  }));

  // Revenue by tier
  const revenueByTier = tierNames.map((name, index) => ({
    tier: name,
    revenue: partners.filter(p => p.tier === index).reduce((sum, p) => sum + parseFloat(p.totalRevenue), 0)
  }));

  // Status distribution
  const statusData = [
    { name: "Active", value: partners.filter(p => p.status === 0).length, fill: "hsl(142, 70%, 45%)" },
    { name: "Pending", value: partners.filter(p => p.status === 1).length, fill: "hsl(45, 95%, 50%)" },
    { name: "Inactive", value: partners.filter(p => p.status === 2).length, fill: "hsl(0, 70%, 50%)" },
  ];

  // Total stats
  const totalRevenue = partners.reduce((sum, p) => sum + parseFloat(p.totalRevenue), 0);
  const avgRevenuePerPartner = totalRevenue / partners.length || 0;

  const COLORS = ["hsl(142, 70%, 45%)", "hsl(45, 95%, 50%)", "hsl(0, 70%, 50%)"];

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Monthly Growth</p>
                <p className="text-xl font-bold text-green-500">+16.7%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Total Revenue</p>
                <p className="text-xl font-bold">{totalRevenue.toLocaleString()} PM</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Avg Revenue/Partner</p>
                <p className="text-xl font-bold">{avgRevenuePerPartner.toLocaleString(undefined, { maximumFractionDigits: 0 })} PM</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Globe className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Countries</p>
                <p className="text-xl font-bold">{countryData.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Partner Growth Chart */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Partner Growth Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData}>
                  <defs>
                    <linearGradient id="colorPartners" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="partners" 
                    stroke="hsl(var(--primary))" 
                    fillOpacity={1} 
                    fill="url(#colorPartners)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Trend Chart */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(value) => `${(value/1000).toFixed(0)}k`} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                    formatter={(value: number) => [`${value.toLocaleString()} PM`, "Revenue"]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(142, 70%, 45%)" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(142, 70%, 45%)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Geographic Distribution */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-500" />
              Geographic Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={countryData.slice(0, 6)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis dataKey="country" type="category" stroke="hsl(var(--muted-foreground))" fontSize={11} width={80} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Tier Distribution */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Partner Tiers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tierData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="count"
                    label={({ name, count }) => `${name}: ${count}`}
                    labelLine={false}
                  >
                    {tierData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Partner Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue by Tier */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            Revenue by Partner Tier
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByTier}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="tier" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(value) => `${(value/1000).toFixed(0)}k`} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                  formatter={(value: number) => [`${value.toLocaleString()} PM`, "Revenue"]}
                />
                <Bar dataKey="revenue" fill="hsl(142, 70%, 45%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Partners Table */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Top Revenue Partners</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {partners
              .sort((a, b) => parseFloat(b.totalRevenue) - parseFloat(a.totalRevenue))
              .slice(0, 5)
              .map((partner, index) => (
                <div key={partner.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{partner.name}</p>
                      <p className="text-xs text-muted-foreground">{partner.country}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-500">{parseFloat(partner.totalRevenue).toLocaleString()} PM</p>
                    <Badge className={
                      partner.tier === 3 ? "bg-purple-500/20 text-purple-400" :
                      partner.tier === 2 ? "bg-yellow-500/20 text-yellow-400" :
                      partner.tier === 1 ? "bg-gray-400/20 text-gray-300" :
                      "bg-orange-500/20 text-orange-400"
                    }>
                      {tierNames[partner.tier]}
                    </Badge>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
