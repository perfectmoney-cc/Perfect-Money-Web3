import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Target,
  Zap,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
} from "recharts";

// Generate historical transaction data
const generateHistoricalData = () => {
  const data = [];
  const now = new Date();
  
  for (let i = 89; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Simulate seasonal patterns and growth
    const dayOfWeek = date.getDay();
    const weekendFactor = dayOfWeek === 0 || dayOfWeek === 6 ? 0.7 : 1;
    const monthProgress = date.getDate() / 30;
    const seasonalFactor = 1 + Math.sin(monthProgress * Math.PI) * 0.2;
    const growthFactor = 1 + (90 - i) * 0.003;
    
    const baseRevenue = 500 + Math.random() * 300;
    const revenue = baseRevenue * weekendFactor * seasonalFactor * growthFactor;
    
    data.push({
      date: date.toISOString().split('T')[0],
      displayDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: Math.round(revenue),
      transactions: Math.floor(10 + Math.random() * 20),
    });
  }
  
  return data;
};

// Simple linear regression for forecasting
const linearRegression = (data: { x: number; y: number }[]) => {
  const n = data.length;
  const sumX = data.reduce((acc, p) => acc + p.x, 0);
  const sumY = data.reduce((acc, p) => acc + p.y, 0);
  const sumXY = data.reduce((acc, p) => acc + p.x * p.y, 0);
  const sumXX = data.reduce((acc, p) => acc + p.x * p.x, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  return { slope, intercept };
};

// Generate forecast data
const generateForecast = (historicalData: ReturnType<typeof generateHistoricalData>, days: number) => {
  const regressionData = historicalData.map((d, i) => ({ x: i, y: d.revenue }));
  const { slope, intercept } = linearRegression(regressionData);
  
  const forecast = [];
  const lastDate = new Date(historicalData[historicalData.length - 1].date);
  const startIndex = historicalData.length;
  
  for (let i = 1; i <= days; i++) {
    const date = new Date(lastDate);
    date.setDate(date.getDate() + i);
    
    const dayOfWeek = date.getDay();
    const weekendFactor = dayOfWeek === 0 || dayOfWeek === 6 ? 0.85 : 1;
    
    const predictedRevenue = (slope * (startIndex + i) + intercept) * weekendFactor;
    const uncertainty = predictedRevenue * 0.15 * (i / days);
    
    forecast.push({
      date: date.toISOString().split('T')[0],
      displayDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      predicted: Math.round(predictedRevenue),
      upperBound: Math.round(predictedRevenue + uncertainty),
      lowerBound: Math.round(Math.max(0, predictedRevenue - uncertainty)),
      isForecast: true,
    });
  }
  
  return forecast;
};

export const RevenueForecast = () => {
  const [forecastDays, setForecastDays] = useState<7 | 14 | 30>(14);
  
  const historicalData = useMemo(() => generateHistoricalData(), []);
  const forecastData = useMemo(() => generateForecast(historicalData, forecastDays), [historicalData, forecastDays]);
  
  // Combine for chart
  const chartData = useMemo(() => {
    const historical = historicalData.slice(-30).map(d => ({
      ...d,
      predicted: null,
      upperBound: null,
      lowerBound: null,
      isForecast: false,
    }));
    
    return [...historical, ...forecastData];
  }, [historicalData, forecastData]);
  
  // Calculate metrics
  const totalHistorical = historicalData.reduce((acc, d) => acc + d.revenue, 0);
  const avgDaily = totalHistorical / historicalData.length;
  const forecastTotal = forecastData.reduce((acc, d) => acc + d.predicted, 0);
  const forecastAvg = forecastTotal / forecastData.length;
  const growthRate = ((forecastAvg - avgDaily) / avgDaily) * 100;
  
  const last30Days = historicalData.slice(-30).reduce((acc, d) => acc + d.revenue, 0);
  const prev30Days = historicalData.slice(-60, -30).reduce((acc, d) => acc + d.revenue, 0);
  const monthlyGrowth = ((last30Days - prev30Days) / prev30Days) * 100;

  return (
    <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-green-500/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <Target className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <CardTitle className="text-lg">Revenue Forecast</CardTitle>
              <CardDescription>Predictive analytics based on historical data</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
            <Zap className="h-3 w-3 mr-1" />
            AI Powered
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-card border">
            <p className="text-xs text-muted-foreground mb-1">Avg Daily Revenue</p>
            <p className="text-xl font-bold">{avgDaily.toFixed(0)} PM</p>
            <p className="text-xs text-muted-foreground">Last 90 days</p>
          </div>
          
          <div className="p-4 rounded-lg bg-card border">
            <p className="text-xs text-muted-foreground mb-1">Forecast ({forecastDays}d)</p>
            <p className="text-xl font-bold text-emerald-500">{forecastTotal.toLocaleString()} PM</p>
            <div className="flex items-center gap-1 text-xs">
              {growthRate >= 0 ? (
                <ArrowUpRight className="h-3 w-3 text-green-500" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-500" />
              )}
              <span className={growthRate >= 0 ? "text-green-500" : "text-red-500"}>
                {growthRate.toFixed(1)}% vs avg
              </span>
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-card border">
            <p className="text-xs text-muted-foreground mb-1">Monthly Growth</p>
            <div className="flex items-center gap-2">
              {monthlyGrowth >= 0 ? (
                <TrendingUp className="h-5 w-5 text-green-500" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-500" />
              )}
              <p className={`text-xl font-bold ${monthlyGrowth >= 0 ? "text-green-500" : "text-red-500"}`}>
                {monthlyGrowth.toFixed(1)}%
              </p>
            </div>
            <p className="text-xs text-muted-foreground">vs previous month</p>
          </div>
          
          <div className="p-4 rounded-lg bg-card border">
            <p className="text-xs text-muted-foreground mb-1">Projected Annual</p>
            <p className="text-xl font-bold">{(avgDaily * 365).toLocaleString()} PM</p>
            <p className="text-xs text-muted-foreground">Based on current trend</p>
          </div>
        </div>

        {/* Forecast Period Selector */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Forecast Period:</span>
          <div className="flex gap-1">
            {([7, 14, 30] as const).map((days) => (
              <Button
                key={days}
                variant={forecastDays === days ? "default" : "outline"}
                size="sm"
                onClick={() => setForecastDays(days)}
                className={forecastDays === days ? "bg-emerald-600 hover:bg-emerald-700" : ""}
              >
                {days} Days
              </Button>
            ))}
          </div>
        </div>

        {/* Chart */}
        <Tabs defaultValue="forecast" className="space-y-4">
          <TabsList>
            <TabsTrigger value="forecast">Forecast View</TabsTrigger>
            <TabsTrigger value="historical">Historical Trend</TabsTrigger>
          </TabsList>
          
          <TabsContent value="forecast">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="historicalGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="displayDate" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickFormatter={(value) => `${value}`}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number, name: string) => {
                      const label = name === 'revenue' ? 'Actual' : name === 'predicted' ? 'Predicted' : name;
                      return [`${value} PM`, label];
                    }}
                  />
                  <ReferenceLine 
                    x={chartData.find(d => d.isForecast)?.displayDate} 
                    stroke="hsl(var(--muted-foreground))" 
                    strokeDasharray="5 5"
                    label={{ value: 'Forecast', position: 'top', fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    fill="url(#historicalGradient)"
                    connectNulls={false}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="upperBound" 
                    stroke="transparent"
                    fill="#3b82f6"
                    fillOpacity={0.1}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="lowerBound" 
                    stroke="transparent"
                    fill="hsl(var(--background))"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    connectNulls={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-emerald-500" />
                <span>Historical</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-blue-500 border-dashed border-t-2 border-blue-500" />
                <span>Predicted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-2 bg-blue-500/20 rounded" />
                <span>Confidence Range</span>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="historical">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historicalData}>
                  <defs>
                    <linearGradient id="histGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="displayDate" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`${value} PM`, 'Revenue']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    fill="url(#histGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
