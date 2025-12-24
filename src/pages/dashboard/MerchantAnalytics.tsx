import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, BarChart3, TrendingUp, Users, ShoppingCart, Clock, MapPin, Home } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const salesData = [
  { name: "Mon", sales: 4000, customers: 24 },
  { name: "Tue", sales: 3000, customers: 18 },
  { name: "Wed", sales: 5000, customers: 32 },
  { name: "Thu", sales: 2780, customers: 15 },
  { name: "Fri", sales: 6890, customers: 45 },
  { name: "Sat", sales: 8390, customers: 58 },
  { name: "Sun", sales: 4490, customers: 28 },
];

const categoryData = [
  { name: "Electronics", value: 35 },
  { name: "Clothing", value: 25 },
  { name: "Food", value: 20 },
  { name: "Services", value: 20 },
];

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];

const MerchantAnalytics = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState("7d");

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Breadcrumb className="mb-6">
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
            <BreadcrumbPage>Analytics</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <BarChart3 className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Advanced Analytics</h1>
            <p className="text-muted-foreground">Detailed insights on customer behavior and sales trends</p>
          </div>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24h</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-xs text-green-500">+12.5%</span>
              </div>
              <p className="text-2xl font-bold">34,890 PM</p>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="text-xs text-green-500">+8.2%</span>
              </div>
              <p className="text-2xl font-bold">220</p>
              <p className="text-sm text-muted-foreground">Unique Customers</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingCart className="h-4 w-4 text-purple-500" />
                <span className="text-xs text-green-500">+15.3%</span>
              </div>
              <p className="text-2xl font-bold">342</p>
              <p className="text-sm text-muted-foreground">Transactions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-orange-500" />
                <span className="text-xs text-muted-foreground">avg</span>
              </div>
              <p className="text-2xl font-bold">102 PM</p>
              <p className="text-sm text-muted-foreground">Avg Order Value</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Sales Overview</CardTitle>
              <CardDescription>Daily sales performance</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Area type="monotone" dataKey="sales" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer Traffic</CardTitle>
              <CardDescription>Daily unique customers</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="customers" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Sales by Category</CardTitle>
              <CardDescription>Revenue distribution across categories</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" /> Top Locations
              </CardTitle>
              <CardDescription>Where your customers are from</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { city: "Singapore", orders: 89, percentage: 35 },
                { city: "Malaysia", orders: 67, percentage: 26 },
                { city: "Indonesia", orders: 54, percentage: 21 },
                { city: "Thailand", orders: 32, percentage: 13 },
                { city: "Others", orders: 13, percentage: 5 },
              ].map((location) => (
                <div key={location.city} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{location.city}</span>
                      <span className="text-sm text-muted-foreground">{location.orders} orders</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${location.percentage}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MerchantAnalytics;
