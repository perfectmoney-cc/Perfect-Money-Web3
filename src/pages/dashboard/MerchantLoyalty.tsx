import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Gift, Users, TrendingUp, Star, Percent, Trophy, Home } from "lucide-react";
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

const tiers = [
  { name: "Bronze", minSpend: 0, cashback: 1, color: "bg-amber-600" },
  { name: "Silver", minSpend: 1000, cashback: 2, color: "bg-gray-400" },
  { name: "Gold", minSpend: 5000, cashback: 3, color: "bg-yellow-500" },
  { name: "Platinum", minSpend: 10000, cashback: 5, color: "bg-purple-500" },
];

const MerchantLoyalty = () => {
  const navigate = useNavigate();
  const [programEnabled, setProgramEnabled] = useState(true);
  const [cashbackRate, setCashbackRate] = useState("2");

  const saveProgram = () => {
    toast.success("Loyalty program settings saved!");
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
            <BreadcrumbPage>Loyalty Program</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 rounded-xl bg-primary/10">
          <Gift className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Loyalty Program</h1>
          <p className="text-muted-foreground">Reward repeat customers with PM token cashback</p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Program Status</CardTitle>
                <CardDescription>Enable or disable your loyalty program</CardDescription>
              </div>
              <Switch checked={programEnabled} onCheckedChange={setProgramEnabled} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-muted/50 rounded-lg">
                <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">1,247</p>
                <p className="text-sm text-muted-foreground">Members</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold">24,500 PM</p>
                <p className="text-sm text-muted-foreground">Rewards Given</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <Percent className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold">+18%</p>
                <p className="text-sm text-muted-foreground">Return Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" /> Cashback Settings
            </CardTitle>
            <CardDescription>Configure your base cashback rate</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Base Cashback Rate (%)</Label>
              <Input
                type="number"
                value={cashbackRate}
                onChange={(e) => setCashbackRate(e.target.value)}
                min="0.5"
                max="10"
                step="0.5"
              />
              <p className="text-sm text-muted-foreground">
                Customers earn {cashbackRate}% of their purchase value in PM tokens
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" /> Loyalty Tiers
            </CardTitle>
            <CardDescription>Reward your best customers with higher cashback rates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {tiers.map((tier, index) => (
              <div key={tier.name} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className={`w-3 h-3 rounded-full ${tier.color}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{tier.name}</span>
                    <Badge variant="outline">{tier.cashback}% Cashback</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {tier.minSpend === 0 ? "Starting tier" : `Spend ${tier.minSpend.toLocaleString()} PM to unlock`}
                  </p>
                </div>
                {index < tiers.length - 1 && (
                  <Progress value={((index + 1) / tiers.length) * 100} className="w-24" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-3">Program Benefits</h3>
            <div className="grid md:grid-cols-2 gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                Increase customer retention by 40%
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                Boost average order value
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                Automatic PM token distribution
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                Real-time reward tracking
              </div>
            </div>
          </CardContent>
        </Card>

        <Button size="lg" className="w-full" onClick={saveProgram}>
          Save Loyalty Program
        </Button>
      </div>
    </div>
  );
};

export default MerchantLoyalty;
