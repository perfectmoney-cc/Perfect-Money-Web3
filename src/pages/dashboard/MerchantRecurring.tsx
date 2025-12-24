import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RefreshCw, Plus, Calendar, Users, DollarSign, Trash2, Home } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const subscriptions = [
  { id: 1, name: "Basic Plan", price: 100, interval: "monthly", subscribers: 45, status: "active" },
  { id: 2, name: "Premium Plan", price: 250, interval: "monthly", subscribers: 23, status: "active" },
  { id: 3, name: "Annual VIP", price: 2500, interval: "yearly", subscribers: 12, status: "active" },
];

const MerchantRecurring = () => {
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [planName, setPlanName] = useState("");
  const [planPrice, setPlanPrice] = useState("");
  const [planInterval, setPlanInterval] = useState("monthly");

  const createPlan = () => {
    if (!planName || !planPrice) {
      toast.error("Please fill in all fields");
      return;
    }
    toast.success(`Subscription plan "${planName}" created!`);
    setPlanName("");
    setPlanPrice("");
    setShowCreate(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
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
            <BreadcrumbPage>Recurring Payments</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 rounded-xl bg-primary/10">
          <RefreshCw className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Recurring Payments</h1>
          <p className="text-muted-foreground">Set up subscription billing for your services</p>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">80</p>
              <p className="text-sm text-muted-foreground">Active Subscribers</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold">12,350 PM</p>
              <p className="text-sm text-muted-foreground">Monthly Revenue</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <p className="text-2xl font-bold">3</p>
              <p className="text-sm text-muted-foreground">Active Plans</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Subscription Plans</CardTitle>
                <CardDescription>Manage your recurring payment plans</CardDescription>
              </div>
              <Button onClick={() => setShowCreate(!showCreate)}>
                <Plus className="h-4 w-4 mr-2" /> Create Plan
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {showCreate && (
              <div className="p-4 border rounded-lg bg-muted/50 space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Plan Name</Label>
                    <Input
                      placeholder="e.g., Premium Plan"
                      value={planName}
                      onChange={(e) => setPlanName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Price (PM)</Label>
                    <Input
                      type="number"
                      placeholder="100"
                      value={planPrice}
                      onChange={(e) => setPlanPrice(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Billing Interval</Label>
                    <Select value={planInterval} onValueChange={setPlanInterval}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={createPlan}>Create Plan</Button>
                  <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                </div>
              </div>
            )}

            {subscriptions.map((sub) => (
              <div key={sub.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{sub.name}</span>
                    <Badge variant="outline">{sub.interval}</Badge>
                    <Badge className="bg-green-500/20 text-green-600">{sub.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {sub.price} PM / {sub.interval} • {sub.subscribers} subscribers
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Edit</Button>
                  <Button variant="ghost" size="sm" className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-3">How Recurring Payments Work</h3>
            <ol className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs shrink-0">1</span>
                Create a subscription plan with pricing and billing interval
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs shrink-0">2</span>
                Share the subscription link with your customers
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs shrink-0">3</span>
                Customers approve recurring PM token transfers
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs shrink-0">4</span>
                Payments are automatically collected on schedule
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MerchantRecurring;
