import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, CreditCard, Wallet, Shield, ExternalLink, Check, AlertCircle, Loader2, QrCode, Copy, Share2, Bell, BellRing, History, TrendingUp, TrendingDown, Trash2, Clock, RefreshCw, CalendarClock, Play, Pause, Calendar, PieChart, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAccount } from "wagmi";
import { toast } from "sonner";
import QRCode from "qrcode";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePriceAlerts } from "@/hooks/usePriceAlerts";
import { usePurchaseHistory } from "@/hooks/usePurchaseHistory";
import { useRecurringPurchases } from "@/hooks/useRecurringPurchases";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import CryptoPriceChart from "@/components/CryptoPriceChart";
import PortfolioTracker from "@/components/PortfolioTracker";
import DCAAnalytics from "@/components/DCAAnalytics";
import NotificationSettings from "@/components/NotificationSettings";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://xldptgnlmwpfcvnpvkbx.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsZHB0Z25sbXdwZmN2bnB2a2J4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyNDI4NjMsImV4cCI6MjA2MDgxODg2M30.cUNkPBxNBV1LjNHdaASPjYzGyjjLmvUe3CcDj9RjWbg";

// Currency symbols mapping
const currencySymbols: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  AED: "د.إ",
  PHP: "₱",
  ZAR: "R",
  CAD: "C$",
  AUD: "A$",
  JPY: "¥",
  INR: "₹",
};

// Real provider logos from official sources
const providerLogos = {
  moonpay: "https://www.moonpay.com/assets/logo-full-white.svg",
  transak: "https://assets.transak.com/images/website/transak-logo-white.svg",
  ramp: "https://ramp.network/assets/images/Logo.svg",
  simplex: "https://www.simplex.com/wp-content/uploads/2021/07/simplex-logo.svg",
};

const BuyCrypto = () => {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState("100");
  const [currency, setCurrency] = useState("USD");
  const [crypto, setCrypto] = useState("BNB");
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cryptoPrices, setCryptoPrices] = useState<Record<string, number>>({
    BNB: 620, ETH: 3400, BTC: 95000, USDT: 1, USDC: 1, SOL: 180, MATIC: 0.55, AVAX: 35,
  });
  const [priceChanges, setPriceChanges] = useState<Record<string, number>>({});
  const [priceSource, setPriceSource] = useState<string>("loading");
  const [showQRModal, setShowQRModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<typeof onRampProviders[0] | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [alertPrice, setAlertPrice] = useState("");
  const [alertCondition, setAlertCondition] = useState<"above" | "below">("above");
  const [alertCrypto, setAlertCrypto] = useState("BNB");
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  
  // Recurring purchase form state
  const [recurringCrypto, setRecurringCrypto] = useState("BNB");
  const [recurringAmount, setRecurringAmount] = useState("100");
  const [recurringFrequency, setRecurringFrequency] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [recurringDayOfWeek, setRecurringDayOfWeek] = useState(1); // Monday
  const [recurringDayOfMonth, setRecurringDayOfMonth] = useState(1);
  const [recurringHour, setRecurringHour] = useState(9);
  const [recurringProvider, setRecurringProvider] = useState("MoonPay");
  
  const { alerts, addAlert, removeAlert, checkAlerts, activeAlerts, triggeredAlerts, clearTriggeredAlerts } = usePriceAlerts();
  const { purchases, addPurchase } = usePurchaseHistory();
  const { 
    recurringPurchases, 
    activePurchases, 
    addRecurringPurchase, 
    toggleRecurringPurchase, 
    removeRecurringPurchase,
    getFrequencyLabel 
  } = useRecurringPurchases();

  const currencySymbol = currencySymbols[currency] || "$";

  // Fetch live prices on mount and when currency changes
  const fetchPrices = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setIsRefreshing(true);
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/get-crypto-prices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ currency }),
      });
      const data = await response.json();
      if (data?.prices) {
        setCryptoPrices(data.prices);
        if (data.changes) {
          setPriceChanges(data.changes);
        }
        setPriceSource(data.source || "api");
        setLastUpdate(new Date());
        
        // Check for triggered alerts
        const triggered = checkAlerts(data.prices);
        triggered.forEach(alert => {
          toast.info(
            `🔔 Price Alert: ${alert.crypto} is now ${alert.condition} ${currencySymbols[alert.currency]}${alert.targetPrice.toLocaleString()}`,
            { duration: 10000 }
          );
        });
      }
    } catch (error) {
      console.error("Failed to fetch prices:", error);
    } finally {
      if (showRefreshIndicator) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    // Refresh every 30 seconds
    const interval = setInterval(() => fetchPrices(), 30000);
    return () => clearInterval(interval);
  }, [currency, checkAlerts]);

  // CoinMarketCap logo URLs (official static assets)
  const cryptoOptions = [
    { symbol: "BNB", name: "BNB", icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png" },
    { symbol: "ETH", name: "Ethereum", icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png" },
    { symbol: "BTC", name: "Bitcoin", icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png" },
    { symbol: "USDT", name: "Tether", icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/825.png" },
    { symbol: "USDC", name: "USD Coin", icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png" },
    { symbol: "SOL", name: "Solana", icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/5426.png" },
    { symbol: "MATIC", name: "Polygon", icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/3890.png" },
    { symbol: "AVAX", name: "Avalanche", icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/5805.png" },
  ];

  const onRampProviders = [
    { 
      name: "MoonPay", 
      logo: "https://images.seeklogo.com/logo-png/52/1/moonpay-logo-png_seeklogo-525606.png",
      fees: "3.5%",
      methods: ["Card", "Bank", "Apple Pay"],
      url: "https://www.moonpay.com/buy",
      color: "#7D00FF"
    },
    { 
      name: "Transak", 
      logo: "https://assets.transak.com/images/website/transak-logo-symbol.svg",
      fees: "1.5%",
      methods: ["Card", "Bank", "UPI"],
      url: "https://global.transak.com",
      color: "#0052FF"
    },
    { 
      name: "Ramp", 
      logo: "https://ramp.network/assets/images/Logo.svg",
      fees: "2.9%",
      methods: ["Card", "Bank", "PIX"],
      url: "https://ramp.network/buy",
      color: "#21BF73"
    },
    { 
      name: "Simplex", 
      logo: "/lovable-uploads/cf98e305-dcf8-4399-b94b-276114c91207.png",
      fees: "3.5%",
      methods: ["Card", "Apple Pay"],
      url: "https://www.simplex.com",
      color: "#FF6B00"
    },
  ];

  const selectedCrypto = cryptoOptions.find(c => c.symbol === crypto);
  const currentRate = cryptoPrices[crypto] || 1;
  const estimatedCrypto = parseFloat(amount) / currentRate;
  const currentChange = priceChanges[crypto] || 0;

  const buildOnRampUrl = (provider: typeof onRampProviders[0]) => {
    if (!address) return "";
    
    const params = new URLSearchParams({
      walletAddress: address,
      cryptoCurrency: crypto,
      fiatCurrency: currency,
      fiatValue: amount,
    });

    return `${provider.url}?${params.toString()}`;
  };

  const handleBuy = (provider: typeof onRampProviders[0]) => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet first");
      return;
    }

    // Track the purchase
    addPurchase({
      provider: provider.name,
      crypto,
      fiatAmount: parseFloat(amount),
      fiatCurrency: currency,
      estimatedCrypto,
      walletAddress: address,
    });

    const url = buildOnRampUrl(provider);
    window.open(url, "_blank");
    toast.success(`Redirecting to ${provider.name}...`);
  };

  const handleShowQR = async (provider: typeof onRampProviders[0]) => {
    if (!address) {
      toast.error("Please connect your wallet first");
      return;
    }

    setSelectedProvider(provider);
    const url = buildOnRampUrl(provider);
    
    try {
      const qr = await QRCode.toDataURL(url, {
        width: 256,
        margin: 2,
        color: { dark: "#000000", light: "#FFFFFF" }
      });
      setQrCodeUrl(qr);
      setShowQRModal(true);
    } catch (error) {
      toast.error("Failed to generate QR code");
    }
  };

  const copyLink = () => {
    if (!selectedProvider) return;
    const url = buildOnRampUrl(selectedProvider);
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  const shareLink = async () => {
    if (!selectedProvider) return;
    const url = buildOnRampUrl(selectedProvider);
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Buy ${crypto} with ${selectedProvider.name}`,
          text: `Buy ${crypto} directly to wallet ${address?.slice(0, 8)}...${address?.slice(-4)}`,
          url: url,
        });
      } catch (error) {
        copyLink();
      }
    } else {
      copyLink();
    }
  };

  const handleAddAlert = () => {
    if (!alertPrice || parseFloat(alertPrice) <= 0) {
      toast.error("Please enter a valid target price");
      return;
    }

    addAlert({
      crypto: alertCrypto,
      targetPrice: parseFloat(alertPrice),
      condition: alertCondition,
      currency,
    });

    toast.success(`Alert set for ${alertCrypto} ${alertCondition} ${currencySymbol}${parseFloat(alertPrice).toLocaleString()}`);
    setAlertPrice("");
    setShowAlertModal(false);
  };

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-500 bg-green-500/10';
      case 'pending': return 'text-yellow-500 bg-yellow-500/10';
      case 'processing': return 'text-blue-500 bg-blue-500/10';
      case 'failed': return 'text-red-500 bg-red-500/10';
      case 'cancelled': return 'text-muted-foreground bg-muted';
      default: return 'text-muted-foreground bg-muted';
    }
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
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
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
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => fetchPrices(true)}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => setShowRecurringModal(true)}
            >
              <CalendarClock className="h-4 w-4" />
              {activePurchases.length > 0 && (
                <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {activePurchases.length}
                </Badge>
              )}
              Auto-Buy
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => setShowAlertModal(true)}
            >
              <Bell className="h-4 w-4" />
              {activeAlerts.length > 0 && (
                <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {activeAlerts.length}
                </Badge>
              )}
              Alerts
            </Button>
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
              <div className="flex items-center gap-3">
                <div className="text-right text-xs text-muted-foreground">
                  <p>Source: {priceSource}</p>
                  <p>Updated: {lastUpdate.toLocaleTimeString()}</p>
                </div>
                <Badge variant="outline" className="text-green-500 border-green-500/30">
                  <Check className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="buy" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="buy" className="gap-2">
              <CreditCard className="h-4 w-4" />
              Buy
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="gap-2">
              <PieChart className="h-4 w-4" />
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              DCA
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              History
              {purchases.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {purchases.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="buy" className="space-y-6">
            {/* Price Chart */}
            <CryptoPriceChart 
              crypto={crypto}
              currency={currency}
              currencySymbol={currencySymbol}
              currentPrice={currentRate}
              priceChange={currentChange}
            />

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
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                          {currencySymbol}
                        </span>
                        <Input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="pl-8 text-lg"
                          min="10"
                        />
                      </div>
                      <Select value={currency} onValueChange={setCurrency}>
                        <SelectTrigger className="w-[100px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(currencySymbols).map((cur) => (
                            <SelectItem key={cur} value={cur}>{cur}</SelectItem>
                          ))}
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
                        {currencySymbol}{val}
                      </Button>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <Label>You Receive</Label>
                    <div className="flex gap-2">
                      <div className="flex-1 p-3 bg-primary/10 rounded-lg text-lg font-medium text-primary">
                        ~{estimatedCrypto.toFixed(6)}
                      </div>
                      <Select value={crypto} onValueChange={setCrypto}>
                        <SelectTrigger className="w-[140px]">
                          <div className="flex items-center gap-2">
                            <img 
                              src={selectedCrypto?.icon} 
                              alt={crypto} 
                              className="w-5 h-5 rounded-full" 
                            />
                            <span>{crypto}</span>
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {cryptoOptions.map((c) => (
                            <SelectItem key={c.symbol} value={c.symbol}>
                              <span className="flex items-center gap-2">
                                <img src={c.icon} alt={c.symbol} className="w-5 h-5 rounded-full" />
                                <span>{c.symbol}</span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="p-3 bg-muted/50 rounded-lg text-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <AlertCircle className="h-4 w-4" />
                        <span>Live rate (30s refresh)</span>
                      </div>
                      <Badge variant="outline" className="text-xs animate-pulse">Live</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="font-medium">
                        1 {crypto} = {currencySymbol}{formatPrice(currentRate)}
                      </p>
                      <div className={`flex items-center gap-1 text-sm ${currentChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {currentChange >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        {currentChange >= 0 ? '+' : ''}{currentChange.toFixed(2)}%
                      </div>
                    </div>
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
                      className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden"
                            style={{ backgroundColor: provider.color }}
                          >
                            <img 
                              src={provider.logo} 
                              alt={provider.name}
                              className="w-8 h-8 object-contain"
                              onError={(e) => {
                                // Fallback to text if image fails
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement!.innerHTML = `<span class="text-white font-bold text-sm">${provider.name[0]}</span>`;
                              }}
                            />
                          </div>
                          <div>
                            <p className="font-semibold">{provider.name}</p>
                            <p className="text-xs text-muted-foreground">Fees: {provider.fees}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleShowQR(provider)}
                            title="Show QR Code"
                          >
                            <QrCode className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-1"
                            onClick={() => handleBuy(provider)}
                          >
                            Buy
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
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
            <Card className="bg-green-500/5 border-green-500/20">
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
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-6">
            <PortfolioTracker 
              currentPrices={cryptoPrices}
              currency={currency}
              currencySymbol={currencySymbol}
            />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <DCAAnalytics 
              currentPrices={cryptoPrices}
              currency={currency}
              currencySymbol={currencySymbol}
            />
            
            {/* Notification Settings */}
            <NotificationSettings />
          </TabsContent>

          <TabsContent value="history">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Purchase History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {purchases.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="font-medium">No purchases yet</p>
                    <p className="text-sm">Your purchase history will appear here</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {purchases.map((purchase) => (
                        <div 
                          key={purchase.id}
                          className="p-4 border border-border rounded-lg"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <img 
                                src={cryptoOptions.find(c => c.symbol === purchase.crypto)?.icon} 
                                alt={purchase.crypto}
                                className="w-8 h-8 rounded-full"
                              />
                              <div>
                                <p className="font-medium">
                                  {currencySymbols[purchase.fiatCurrency]}{purchase.fiatAmount.toLocaleString()} → {purchase.estimatedCrypto.toFixed(6)} {purchase.crypto}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  via {purchase.provider} • {new Date(purchase.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <Badge className={getStatusColor(purchase.status)}>
                              {purchase.status}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="font-mono">{purchase.walletAddress.slice(0, 10)}...{purchase.walletAddress.slice(-6)}</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(purchase.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                          {purchase.txHash && (
                            <div className="mt-2 text-xs">
                              <a 
                                href={`https://bscscan.com/tx/${purchase.txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline flex items-center gap-1"
                              >
                                View Transaction <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* QR Code Modal */}
      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Share Purchase Link
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            {qrCodeUrl && (
              <div className="bg-white p-4 rounded-lg">
                <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
              </div>
            )}
            <div className="text-center">
              <p className="font-semibold">{selectedProvider?.name}</p>
              <p className="text-sm text-muted-foreground">
                Buy {currencySymbol}{amount} worth of {crypto}
              </p>
              <p className="text-xs text-muted-foreground mt-1 font-mono">
                To: {address?.slice(0, 10)}...{address?.slice(-8)}
              </p>
            </div>
            <div className="flex gap-2 w-full">
              <Button variant="outline" className="flex-1 gap-2" onClick={copyLink}>
                <Copy className="h-4 w-4" />
                Copy Link
              </Button>
              <Button className="flex-1 gap-2" onClick={shareLink}>
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Price Alert Modal */}
      <Dialog open={showAlertModal} onOpenChange={setShowAlertModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BellRing className="h-5 w-5" />
              Price Alerts
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Create New Alert */}
            <div className="p-4 border border-border rounded-lg space-y-3">
              <p className="font-medium text-sm">Create New Alert</p>
              <div className="grid grid-cols-2 gap-2">
                <Select value={alertCrypto} onValueChange={setAlertCrypto}>
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <img 
                        src={cryptoOptions.find(c => c.symbol === alertCrypto)?.icon} 
                        alt={alertCrypto} 
                        className="w-4 h-4 rounded-full" 
                      />
                      <span>{alertCrypto}</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {cryptoOptions.map((c) => (
                      <SelectItem key={c.symbol} value={c.symbol}>
                        <span className="flex items-center gap-2">
                          <img src={c.icon} alt={c.symbol} className="w-4 h-4 rounded-full" />
                          <span>{c.symbol}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={alertCondition} onValueChange={(v: "above" | "below") => setAlertCondition(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="above">
                      <span className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        Goes above
                      </span>
                    </SelectItem>
                    <SelectItem value="below">
                      <span className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-red-500" />
                        Goes below
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                  {currencySymbol}
                </span>
                <Input
                  type="number"
                  placeholder="Target price"
                  value={alertPrice}
                  onChange={(e) => setAlertPrice(e.target.value)}
                  className="pl-8"
                />
              </div>
              <div className="text-xs text-muted-foreground">
                Current price: {currencySymbol}{formatPrice(cryptoPrices[alertCrypto] || 0)}
              </div>
              <Button className="w-full gap-2" onClick={handleAddAlert}>
                <Bell className="h-4 w-4" />
                Set Alert
              </Button>
            </div>

            {/* Active Alerts */}
            {activeAlerts.length > 0 && (
              <div className="space-y-2">
                <p className="font-medium text-sm flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Active Alerts ({activeAlerts.length})
                </p>
                <ScrollArea className="h-[150px]">
                  <div className="space-y-2">
                    {activeAlerts.map((alert) => (
                      <div 
                        key={alert.id}
                        className="flex items-center justify-between p-3 border border-border rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <img 
                            src={cryptoOptions.find(c => c.symbol === alert.crypto)?.icon} 
                            alt={alert.crypto}
                            className="w-5 h-5 rounded-full"
                          />
                          <div>
                            <p className="text-sm font-medium">
                              {alert.crypto} {alert.condition} {currencySymbols[alert.currency]}{alert.targetPrice.toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(alert.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600"
                          onClick={() => removeAlert(alert.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Triggered Alerts */}
            {triggeredAlerts.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm flex items-center gap-2">
                    <BellRing className="h-4 w-4 text-green-500" />
                    Triggered ({triggeredAlerts.length})
                  </p>
                  <Button variant="ghost" size="sm" onClick={clearTriggeredAlerts}>
                    Clear all
                  </Button>
                </div>
                <ScrollArea className="h-[100px]">
                  <div className="space-y-2">
                    {triggeredAlerts.map((alert) => (
                      <div 
                        key={alert.id}
                        className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg"
                      >
                        <Check className="h-4 w-4 text-green-500" />
                        <div>
                          <p className="text-sm font-medium">
                            {alert.crypto} reached {currencySymbols[alert.currency]}{alert.targetPrice.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {alert.triggeredAt && new Date(alert.triggeredAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Recurring Purchase Modal */}
      <Dialog open={showRecurringModal} onOpenChange={setShowRecurringModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5" />
              Recurring Purchases
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Create New Recurring Purchase */}
            <div className="p-4 border border-border rounded-lg space-y-3">
              <p className="font-medium text-sm">Schedule Auto-Buy</p>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Crypto</Label>
                  <Select value={recurringCrypto} onValueChange={setRecurringCrypto}>
                    <SelectTrigger>
                      <div className="flex items-center gap-2">
                        <img 
                          src={cryptoOptions.find(c => c.symbol === recurringCrypto)?.icon} 
                          alt={recurringCrypto} 
                          className="w-4 h-4 rounded-full" 
                        />
                        <span>{recurringCrypto}</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {cryptoOptions.map((c) => (
                        <SelectItem key={c.symbol} value={c.symbol}>
                          <span className="flex items-center gap-2">
                            <img src={c.icon} alt={c.symbol} className="w-4 h-4 rounded-full" />
                            <span>{c.symbol}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs">Amount ({currency})</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      {currencySymbol}
                    </span>
                    <Input
                      type="number"
                      value={recurringAmount}
                      onChange={(e) => setRecurringAmount(e.target.value)}
                      className="pl-7"
                      min="10"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Frequency</Label>
                  <Select value={recurringFrequency} onValueChange={(v: "daily" | "weekly" | "monthly") => setRecurringFrequency(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {recurringFrequency === 'weekly' && (
                  <div className="space-y-1">
                    <Label className="text-xs">Day of Week</Label>
                    <Select value={recurringDayOfWeek.toString()} onValueChange={(v) => setRecurringDayOfWeek(parseInt(v))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Sunday</SelectItem>
                        <SelectItem value="1">Monday</SelectItem>
                        <SelectItem value="2">Tuesday</SelectItem>
                        <SelectItem value="3">Wednesday</SelectItem>
                        <SelectItem value="4">Thursday</SelectItem>
                        <SelectItem value="5">Friday</SelectItem>
                        <SelectItem value="6">Saturday</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {recurringFrequency === 'monthly' && (
                  <div className="space-y-1">
                    <Label className="text-xs">Day of Month</Label>
                    <Select value={recurringDayOfMonth.toString()} onValueChange={(v) => setRecurringDayOfMonth(parseInt(v))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                          <SelectItem key={day} value={day.toString()}>{day}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {recurringFrequency === 'daily' && (
                  <div className="space-y-1">
                    <Label className="text-xs">Time</Label>
                    <Select value={recurringHour.toString()} onValueChange={(v) => setRecurringHour(parseInt(v))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                          <SelectItem key={hour} value={hour.toString()}>
                            {hour.toString().padStart(2, '0')}:00
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {(recurringFrequency === 'weekly' || recurringFrequency === 'monthly') && (
                <div className="space-y-1">
                  <Label className="text-xs">Time</Label>
                  <Select value={recurringHour.toString()} onValueChange={(v) => setRecurringHour(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                        <SelectItem key={hour} value={hour.toString()}>
                          {hour.toString().padStart(2, '0')}:00
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-1">
                <Label className="text-xs">Provider</Label>
                <Select value={recurringProvider} onValueChange={setRecurringProvider}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {onRampProviders.map((p) => (
                      <SelectItem key={p.name} value={p.name}>
                        <span className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded flex items-center justify-center"
                            style={{ backgroundColor: p.color }}
                          >
                            <span className="text-white text-[8px] font-bold">{p.name[0]}</span>
                          </div>
                          {p.name} ({p.fees})
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                className="w-full gap-2" 
                onClick={() => {
                  if (!address) {
                    toast.error("Please connect your wallet first");
                    return;
                  }
                  
                  addRecurringPurchase({
                    crypto: recurringCrypto,
                    fiatAmount: parseFloat(recurringAmount),
                    fiatCurrency: currency,
                    provider: recurringProvider,
                    frequency: recurringFrequency,
                    dayOfWeek: recurringFrequency === 'weekly' ? recurringDayOfWeek : undefined,
                    dayOfMonth: recurringFrequency === 'monthly' ? recurringDayOfMonth : undefined,
                    hour: recurringHour,
                    walletAddress: address,
                    isActive: true,
                  });
                  
                  toast.success(`Auto-buy scheduled: ${currencySymbol}${recurringAmount} ${recurringCrypto} ${recurringFrequency}`);
                  setShowRecurringModal(false);
                }}
              >
                <CalendarClock className="h-4 w-4" />
                Schedule Auto-Buy
              </Button>
            </div>

            {/* Active Recurring Purchases */}
            {recurringPurchases.length > 0 && (
              <div className="space-y-2">
                <p className="font-medium text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Scheduled Purchases ({recurringPurchases.length})
                </p>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {recurringPurchases.map((rp) => (
                      <div 
                        key={rp.id}
                        className={`p-3 border rounded-lg ${rp.isActive ? 'border-primary/30 bg-primary/5' : 'border-border bg-muted/30'}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <img 
                              src={cryptoOptions.find(c => c.symbol === rp.crypto)?.icon} 
                              alt={rp.crypto}
                              className="w-6 h-6 rounded-full"
                            />
                            <div>
                              <p className="text-sm font-medium">
                                {currencySymbols[rp.fiatCurrency]}{rp.fiatAmount} → {rp.crypto}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {getFrequencyLabel(rp.frequency, rp.dayOfWeek, rp.dayOfMonth)} at {rp.hour.toString().padStart(2, '0')}:00
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={rp.isActive}
                              onCheckedChange={() => toggleRecurringPurchase(rp.id)}
                            />
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-7 w-7 text-red-500 hover:text-red-600"
                              onClick={() => removeRecurringPurchase(rp.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            via {rp.provider}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Next: {new Date(rp.nextExecution).toLocaleDateString()}
                          </span>
                        </div>
                        {rp.totalExecutions > 0 && (
                          <div className="mt-2 pt-2 border-t border-border/50 flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                              Executed: {rp.totalExecutions}x
                            </span>
                            <span className="text-primary font-medium">
                              Total: {currencySymbols[rp.fiatCurrency]}{rp.totalSpent.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            <div className="p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
              <p className="flex items-center gap-1 mb-1">
                <AlertCircle className="h-3 w-3" />
                How it works
              </p>
              <p>
                Scheduled purchases will open the provider page automatically at the set time when you have the app open. 
                For fully automated purchases, enable browser notifications.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BuyCrypto;
