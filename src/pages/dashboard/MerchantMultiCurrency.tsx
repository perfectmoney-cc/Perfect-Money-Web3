import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Coins, DollarSign, Check, Settings, Home } from "lucide-react";
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

const currencies = [
  { id: "pm", name: "PM Token", symbol: "PM", icon: "/pm-token-icon.png", enabled: true, default: true },
  { id: "bnb", name: "BNB", symbol: "BNB", icon: "/lovable-uploads/38248811-9e71-464c-abbe-8eb3c37fa049.png", enabled: false },
  { id: "usdt", name: "Tether USD", symbol: "USDT", icon: "/lovable-uploads/67e5df-f02c-4357-b617-2d006356db35.png", enabled: false },
  { id: "usdc", name: "USD Coin", symbol: "USDC", icon: "/lovable-uploads/76fd18e4-ce0b-4404-a21e-5acda3bfa9d1.png", enabled: false },
];

const MerchantMultiCurrency = () => {
  const navigate = useNavigate();
  const [enabledCurrencies, setEnabledCurrencies] = useState<Record<string, boolean>>({
    pm: true, bnb: false, usdt: false, usdc: false
  });

  const toggleCurrency = (id: string) => {
    if (id === "pm") {
      toast.error("PM Token is the default currency and cannot be disabled");
      return;
    }
    setEnabledCurrencies(prev => ({ ...prev, [id]: !prev[id] }));
    toast.success(`${currencies.find(c => c.id === id)?.name} ${!enabledCurrencies[id] ? 'enabled' : 'disabled'}`);
  };

  const saveSettings = () => {
    toast.success("Multi-currency settings saved successfully!");
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
            <BreadcrumbPage>Multi-Currency</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 rounded-xl bg-primary/10">
          <Coins className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Multi-Currency Payments</h1>
          <p className="text-muted-foreground">Accept payments in multiple cryptocurrencies</p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" /> Currency Settings
            </CardTitle>
            <CardDescription>Enable or disable currencies for your payment gateway</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {currencies.map((currency) => (
              <div key={currency.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <img src={currency.icon} alt={currency.name} className="w-10 h-10 rounded-full" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{currency.name}</span>
                      <Badge variant="outline">{currency.symbol}</Badge>
                      {currency.default && <Badge className="bg-primary/20 text-primary">Default</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {currency.default ? "Primary payment currency" : "Alternative payment option"}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={enabledCurrencies[currency.id]}
                  onCheckedChange={() => toggleCurrency(currency.id)}
                  disabled={currency.default}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" /> Conversion Settings
            </CardTitle>
            <CardDescription>Configure how payments are converted and settled</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Auto-convert to PM Token</span>
                <Switch defaultChecked />
              </div>
              <p className="text-sm text-muted-foreground">
                Automatically convert all received payments to PM tokens at current market rate
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Hold Original Currency</span>
                <Switch />
              </div>
              <p className="text-sm text-muted-foreground">
                Keep received payments in their original currency until manual conversion
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Check className="h-6 w-6 text-primary mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Benefits of Multi-Currency</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Reach more customers with diverse crypto holdings</li>
                  <li>• Reduce friction in the checkout process</li>
                  <li>• Automatic rate conversion using real-time prices</li>
                  <li>• All settlements in your preferred currency</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button size="lg" className="w-full" onClick={saveSettings}>
          Save Currency Settings
        </Button>
      </div>
    </div>
  );
};

export default MerchantMultiCurrency;
