import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Activity, Clock, Zap, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, BarChart3, LineChart, PieChart, Calendar, Download, RefreshCw, Radio, Shield, Home } from "lucide-react";
import { RealtimeEventStream } from "@/components/webhook/RealtimeEventStream";
import { SignatureVerifier } from "@/components/webhook/SignatureVerifier";
import { EndpointHealthMonitor } from "@/components/webhook/EndpointHealthMonitor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { TradingViewTicker } from "@/components/TradingViewTicker";
import { HeroBanner } from "@/components/HeroBanner";
import { Footer } from "@/components/Footer";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { useAccount } from "wagmi";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area, BarChart, Bar, Tooltip, Legend, PieChart as RechartsPieChart, Pie, Cell } from "recharts";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Generate mock historical data
const generateHistoricalData = (days: number) => {
  const data = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Generate realistic uptime (mostly high with occasional dips)
    const baseUptime = 95 + Math.random() * 4.5;
    const hasIncident = Math.random() > 0.9;
    const uptime = hasIncident ? 75 + Math.random() * 15 : baseUptime;
    
    // Generate response times (with some variance)
    const baseResponseTime = 150 + Math.random() * 100;
    const responseTime = hasIncident ? baseResponseTime * 2 : baseResponseTime;
    
    data.push({
      date: date.toISOString().split('T')[0],
      displayDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      uptime: parseFloat(uptime.toFixed(2)),
      responseTime: Math.round(responseTime),
      requests: Math.floor(100 + Math.random() * 500),
      successfulDeliveries: Math.floor(90 + Math.random() * 10),
      failedDeliveries: hasIncident ? Math.floor(5 + Math.random() * 20) : Math.floor(Math.random() * 5),
    });
  }
  
  return data;
};

// Generate hourly data for today
const generateHourlyData = () => {
  const data = [];
  const now = new Date();
  
  for (let i = 23; i >= 0; i--) {
    const hour = new Date(now);
    hour.setHours(hour.getHours() - i);
    
    const responseTime = 100 + Math.random() * 200;
    const isHealthy = Math.random() > 0.1;
    
    data.push({
      hour: hour.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      responseTime: Math.round(responseTime),
      status: isHealthy ? 'healthy' : 'unhealthy',
      requests: Math.floor(10 + Math.random() * 50),
    });
  }
  
  return data;
};

const WebhookAnalytics = () => {
  const navigate = useNavigate();
  const { isConnected } = useAccount();
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");
  const [historicalData, setHistoricalData] = useState(generateHistoricalData(30));
  const [hourlyData, setHourlyData] = useState(generateHourlyData());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Update data when time range changes
  useEffect(() => {
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    setHistoricalData(generateHistoricalData(days));
  }, [timeRange]);

  const refreshData = () => {
    setIsRefreshing(true);
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    setTimeout(() => {
      setHistoricalData(generateHistoricalData(days));
      setHourlyData(generateHourlyData());
      setIsRefreshing(false);
      toast.success("Analytics data refreshed");
    }, 1000);
  };

  // Calculate statistics
  const averageUptime = historicalData.reduce((acc, d) => acc + d.uptime, 0) / historicalData.length;
  const averageResponseTime = historicalData.reduce((acc, d) => acc + d.responseTime, 0) / historicalData.length;
  const totalRequests = historicalData.reduce((acc, d) => acc + d.requests, 0);
  const totalSuccessful = historicalData.reduce((acc, d) => acc + d.successfulDeliveries, 0);
  const totalFailed = historicalData.reduce((acc, d) => acc + d.failedDeliveries, 0);
  const successRate = (totalSuccessful / (totalSuccessful + totalFailed)) * 100;

  // Find incidents (days with uptime < 95%)
  const incidents = historicalData.filter(d => d.uptime < 95);

  // Status distribution for pie chart
  const statusDistribution = [
    { name: 'Successful', value: totalSuccessful, color: '#22c55e' },
    { name: 'Failed', value: totalFailed, color: '#ef4444' },
  ];

  const exportData = () => {
    const csvContent = [
      ['Date', 'Uptime %', 'Response Time (ms)', 'Requests', 'Successful', 'Failed'],
      ...historicalData.map(d => [
        d.date,
        d.uptime,
        d.responseTime,
        d.requests,
        d.successfulDeliveries,
        d.failedDeliveries
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `webhook-analytics-${timeRange}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Analytics exported to CSV");
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex flex-col pb-20 lg:pb-0">
        <Header />
        <TradingViewTicker />
        <HeroBanner title="Webhook Analytics" subtitle="Connect your wallet to view analytics" />
        <main className="container mx-auto px-4 py-12 flex-1">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Please connect your wallet to access webhook analytics</p>
            </CardContent>
          </Card>
        </main>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 lg:pb-0">
      <Header />
      <TradingViewTicker />
      <HeroBanner 
        title="Webhook Analytics Dashboard" 
        subtitle="Historical uptime trends and response time analysis"
      />
      
      <main className="container mx-auto px-4 py-6 space-y-6 flex-1">
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/dashboard" className="flex items-center gap-1">
                  <Home className="h-3.5 w-3.5" />
                  Dashboard
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/dashboard/merchant">Merchant</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/dashboard/merchant/api">API</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Webhook Analytics</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <div className="flex flex-wrap items-center justify-end gap-4">
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportData}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshData}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Time Range:</span>
          <div className="flex gap-1">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange(range)}
                className={timeRange === range ? "bg-primary" : ""}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </Button>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-green-500/30 bg-gradient-to-br from-green-500/5 to-emerald-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average Uptime</p>
                  <p className={`text-2xl font-bold ${averageUptime >= 99 ? 'text-green-500' : averageUptime >= 95 ? 'text-yellow-500' : 'text-red-500'}`}>
                    {averageUptime.toFixed(2)}%
                  </p>
                </div>
                <div className={`p-3 rounded-full ${averageUptime >= 99 ? 'bg-green-500/20' : 'bg-yellow-500/20'}`}>
                  {averageUptime >= 99 ? (
                    <TrendingUp className="h-6 w-6 text-green-500" />
                  ) : (
                    <TrendingDown className="h-6 w-6 text-yellow-500" />
                  )}
                </div>
              </div>
              <Progress value={averageUptime} className="mt-3 h-2" />
            </CardContent>
          </Card>

          <Card className="border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-cyan-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Response Time</p>
                  <p className={`text-2xl font-bold ${averageResponseTime < 200 ? 'text-green-500' : averageResponseTime < 500 ? 'text-yellow-500' : 'text-red-500'}`}>
                    {Math.round(averageResponseTime)}ms
                  </p>
                </div>
                <div className="p-3 rounded-full bg-blue-500/20">
                  <Zap className="h-6 w-6 text-blue-500" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {averageResponseTime < 200 ? 'Excellent' : averageResponseTime < 500 ? 'Good' : 'Needs improvement'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold text-purple-500">{successRate.toFixed(1)}%</p>
                </div>
                <div className="p-3 rounded-full bg-purple-500/20">
                  <CheckCircle className="h-6 w-6 text-purple-500" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {totalSuccessful.toLocaleString()} of {(totalSuccessful + totalFailed).toLocaleString()} deliveries
              </p>
            </CardContent>
          </Card>

          <Card className="border-orange-500/30 bg-gradient-to-br from-orange-500/5 to-amber-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Incidents</p>
                  <p className={`text-2xl font-bold ${incidents.length === 0 ? 'text-green-500' : 'text-orange-500'}`}>
                    {incidents.length}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${incidents.length === 0 ? 'bg-green-500/20' : 'bg-orange-500/20'}`}>
                  <AlertTriangle className={`h-6 w-6 ${incidents.length === 0 ? 'text-green-500' : 'text-orange-500'}`} />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Days with uptime below 95%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="uptime" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-lg">
            <TabsTrigger value="uptime">Uptime</TabsTrigger>
            <TabsTrigger value="response">Response</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
          </TabsList>

          <TabsContent value="uptime">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5 text-green-500" />
                  Uptime Trend
                </CardTitle>
                <CardDescription>Historical uptime percentage over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={historicalData}>
                      <defs>
                        <linearGradient id="uptimeGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="displayDate" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis 
                        domain={[80, 100]} 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(value: number) => [`${value}%`, 'Uptime']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="uptime" 
                        stroke="#22c55e" 
                        strokeWidth={2}
                        fill="url(#uptimeGradient)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="response">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-500" />
                  Response Time Trend
                </CardTitle>
                <CardDescription>Average response time in milliseconds</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={historicalData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="displayDate" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickFormatter={(value) => `${value}ms`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(value: number) => [`${value}ms`, 'Response Time']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="responseTime" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                        activeDot={{ r: 6, fill: '#3b82f6' }}
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-500" />
                  Webhook Requests
                </CardTitle>
                <CardDescription>Daily webhook request volume</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={historicalData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="displayDate" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="successfulDeliveries" name="Successful" fill="#22c55e" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="failedDeliveries" name="Failed" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="distribution">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-orange-500" />
                  Delivery Distribution
                </CardTitle>
                <CardDescription>Successful vs failed webhook deliveries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={statusDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      >
                        {statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(value: number) => [value.toLocaleString(), 'Deliveries']}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-4">
                  {statusDistribution.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm">{item.name}: {item.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Hourly Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-cyan-500" />
              Today's Hourly Breakdown
            </CardTitle>
            <CardDescription>Response times and status for the last 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="hour" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={10}
                    interval={3}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(value) => `${value}ms`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number, name: string) => {
                      if (name === 'responseTime') return [`${value}ms`, 'Response Time'];
                      return [value, name];
                    }}
                  />
                  <Bar 
                    dataKey="responseTime" 
                    name="Response Time"
                    radius={[2, 2, 0, 0]}
                  >
                    {hourlyData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.status === 'healthy' ? '#22c55e' : '#ef4444'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Incidents Log */}
        {incidents.length > 0 && (
          <Card className="border-orange-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-500">
                <AlertTriangle className="h-5 w-5" />
                Incident History
              </CardTitle>
              <CardDescription>Days with uptime below 95%</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {incidents.map((incident, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 bg-orange-500/5 border border-orange-500/20 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="border-orange-500 text-orange-500">
                        {incident.date}
                      </Badge>
                      <span className="text-sm">
                        Uptime dropped to <span className="font-semibold text-orange-500">{incident.uptime}%</span>
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {incident.failedDeliveries} failed deliveries
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Real-time Event Stream */}
        <RealtimeEventStream />

        {/* Endpoint Health Monitor */}
        <EndpointHealthMonitor />

        {/* Signature Verification Tool */}
        <SignatureVerifier />
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default WebhookAnalytics;
