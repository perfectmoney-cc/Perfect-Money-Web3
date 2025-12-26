import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, CreditCard, Wallet, Shield, ExternalLink, Check, AlertCircle, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAccount } from "wagmi";
import { toast } from "sonner";

const BuyCrypto = () => {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState("100");
  const [currency, setCurrency] = useState("USD");
  const [crypto, setCrypto] = useState("BNB");
  const [isLoading, setIsLoading] = useState(false);

  const cryptoOptions = [
    { symbol: "BNB", name: "BNB", rate: 620, icon: "🔶" },
    { symbol: "ETH", name: "Ethereum", rate: 3400, icon: "💎" },
    { symbol: "BTC", name: "Bitcoin", rate: 95000, icon: "🪙" },
    { symbol: "USDT", name: "Tether", rate: 1, icon: "💵" },
    { symbol: "USDC", name: "USD Coin", rate: 1, icon: "💰" },
  ];

  const onRampProviders = [
    { 
      name: "MoonPay", 
      logo: "🌙",
      fees: "3.5%",
      methods: ["Card", "Bank", "Apple Pay"],
      url: "https://www.moonpay.com/buy"
    },
    { 
      name: "Transak", 
      logo: "🚀",
      fees: "1.5%",
      methods: ["Card", "Bank", "UPI"],
      url: "https://global.transak.com"
    },
    { 
      name: "Ramp", 
      logo: "⚡",
      fees: "2.9%",
      methods: ["Card", "Bank", "PIX"],
      url: "https://ramp.network/buy"
    },
    { 
      name: "Simplex", 
      logo: "🔷",
      fees: "3.5%",
      methods: ["Card", "Apple Pay"],
      url: "https://www.simplex.com"
    },
  ];

  const selectedCrypto = cryptoOptions.find(c => c.symbol === crypto);
  const estimatedCrypto = selectedCrypto ? (parseFloat(amount) / selectedCrypto.rate) : 0;

  const handleBuy = (provider: typeof onRampProviders[0]) => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet first");
      return;
    }

    // Build on-ramp URL with wallet address
    const params = new URLSearchParams({
      walletAddress: address,
      cryptoCurrency: crypto,
      fiatCurrency: currency,
      fiatValue: amount,
    });

    const url = `${provider.url}?${params.toString()}`;
    window.open(url, "_blank");
    toast.success(`Redirecting to ${provider.name}...`);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-bold mb-2">Connect Wallet</h2>
          <p className="text-muted-foreground mb-4">Please connect your wallet to buy crypto</p>
          <p className="text-sm text-muted-foreground">Your purchased crypto will be sent directly to your connected wallet</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <CreditCard className="h-6 w-6 text-primary" />
              Buy Crypto
            </h1>
            <p className="text-muted-foreground text-sm">
              Purchase crypto directly to your wallet
            </p>
          </div>
        </div>

        {/* Wallet Info */}
        <Card className="bg-card/50 border-border mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Wallet className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Receiving Wallet</p>
                  <p className="font-mono text-sm">{address?.slice(0, 8)}...{address?.slice(-6)}</p>
                </div>
              </div>
              <Badge variant="outline" className="text-green-500 border-green-500/30">
                <Check className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Amount Selection */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Select Amount</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>You Pay</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="flex-1 text-lg"
                    min="10"
                  />
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="AED">AED</SelectItem>
                      <SelectItem value="PHP">PHP</SelectItem>
                      <SelectItem value="ZAR">ZAR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Quick amounts */}
              <div className="flex gap-2 flex-wrap">
                {["50", "100", "250", "500", "1000"].map((val) => (
                  <Button
                    key={val}
                    variant={amount === val ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAmount(val)}
                  >
                    ${val}
                  </Button>
                ))}
              </div>

              <div className="space-y-2">
                <Label>You Receive</Label>
                <div className="flex gap-2">
                  <div className="flex-1 p-3 bg-muted rounded-lg text-lg font-medium">
                    ~{estimatedCrypto.toFixed(6)}
                  </div>
                  <Select value={crypto} onValueChange={setCrypto}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {cryptoOptions.map((c) => (
                        <SelectItem key={c.symbol} value={c.symbol}>
                          <span className="flex items-center gap-2">
                            <span>{c.icon}</span>
                            <span>{c.symbol}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>Rate is estimated and may vary</span>
                </div>
                <p>1 {crypto} ≈ ${selectedCrypto?.rate.toLocaleString()} {currency}</p>
              </div>
            </CardContent>
          </Card>

          {/* On-Ramp Providers */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Choose Provider</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {onRampProviders.map((provider) => (
                <div 
                  key={provider.name}
                  className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => handleBuy(provider)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{provider.logo}</span>
                      <div>
                        <p className="font-semibold">{provider.name}</p>
                        <p className="text-xs text-muted-foreground">Fees: {provider.fees}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="gap-1">
                      Buy
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {provider.methods.map((method) => (
                      <Badge key={method} variant="secondary" className="text-xs">
                        {method}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Security Notice */}
        <Card className="bg-green-500/5 border-green-500/20 mt-6">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-semibold text-green-500">Secure Purchase</p>
                <p className="text-sm text-muted-foreground">
                  All on-ramp providers are fully regulated and licensed. Your payment details are processed securely 
                  and crypto is sent directly to your connected wallet address.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BuyCrypto;
