import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, CreditCard, Wallet, Shield, ExternalLink, Check, AlertCircle, Loader2, QrCode, Copy, Share2, X } from "lucide-react";
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

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://xldptgnlmwpfcvnpvkbx.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsZHB0Z25sbXdwZmN2bnB2a2J4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyNDI4NjMsImV4cCI6MjA2MDgxODg2M30.cUNkPBxNBV1LjNHdaASPjYzGyjjLmvUe3CcDj9RjWbg";

// Provider logo components (inline SVG for reliability)
const MoonPayLogo = () => (
  <div className="w-10 h-10 rounded-lg bg-[#7D00FF] flex items-center justify-center">
    <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
      <circle cx="12" cy="12" r="8" fill="white"/>
      <circle cx="12" cy="12" r="4" fill="#7D00FF"/>
    </svg>
  </div>
);

const TransakLogo = () => (
  <div className="w-10 h-10 rounded-lg bg-[#0052FF] flex items-center justify-center">
    <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" fill="none"/>
    </svg>
  </div>
);

const RampLogo = () => (
  <div className="w-10 h-10 rounded-lg bg-[#21BF73] flex items-center justify-center">
    <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
      <path d="M4 12l8-8 8 8M4 12l8 8 8-8" stroke="white" strokeWidth="2" fill="none"/>
    </svg>
  </div>
);

const SimplexLogo = () => (
  <div className="w-10 h-10 rounded-lg bg-[#FF6B00] flex items-center justify-center">
    <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
      <rect x="4" y="4" width="16" height="16" rx="2" stroke="white" strokeWidth="2" fill="none"/>
      <path d="M8 12h8M12 8v8" stroke="white" strokeWidth="2"/>
    </svg>
  </div>
);

const BuyCrypto = () => {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState("100");
  const [currency, setCurrency] = useState("USD");
  const [crypto, setCrypto] = useState("BNB");
  const [isLoading, setIsLoading] = useState(false);
  const [cryptoPrices, setCryptoPrices] = useState<Record<string, number>>({
    BNB: 620,
    ETH: 3400,
    BTC: 95000,
    USDT: 1,
    USDC: 1,
  });
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<typeof onRampProviders[0] | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  // Fetch live prices on mount
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/get-crypto-prices`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
          },
        });
        const data = await response.json();
        if (data?.prices) {
          setCryptoPrices(data.prices);
        }
      } catch (error) {
        console.error("Failed to fetch prices:", error);
      }
    };
    fetchPrices();
    // Refresh every 60 seconds
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  // CoinMarketCap logo URLs (official static assets)
  const cryptoOptions = [
    { symbol: "BNB", name: "BNB", icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png" },
    { symbol: "ETH", name: "Ethereum", icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png" },
    { symbol: "BTC", name: "Bitcoin", icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png" },
    { symbol: "USDT", name: "Tether", icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/825.png" },
    { symbol: "USDC", name: "USD Coin", icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png" },
  ];

  const onRampProviders = [
    { 
      name: "MoonPay", 
      Logo: MoonPayLogo,
      fees: "3.5%",
      methods: ["Card", "Bank", "Apple Pay"],
      url: "https://www.moonpay.com/buy",
      color: "#7D00FF"
    },
    { 
      name: "Transak", 
      Logo: TransakLogo,
      fees: "1.5%",
      methods: ["Card", "Bank", "UPI"],
      url: "https://global.transak.com",
      color: "#0052FF"
    },
    { 
      name: "Ramp", 
      Logo: RampLogo,
      fees: "2.9%",
      methods: ["Card", "Bank", "PIX"],
      url: "https://ramp.network/buy",
      color: "#21BF73"
    },
    { 
      name: "Simplex", 
      Logo: SimplexLogo,
      fees: "3.5%",
      methods: ["Card", "Apple Pay"],
      url: "https://www.simplex.com",
      color: "#FF6B00"
    },
  ];

  const selectedCrypto = cryptoOptions.find(c => c.symbol === crypto);
  const currentRate = cryptoPrices[crypto] || 1;
  const estimatedCrypto = parseFloat(amount) / currentRate;

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
        color: {
          dark: "#000000",
          light: "#FFFFFF"
        }
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

              <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>Live rate (updates every minute)</span>
                  </div>
                  <Badge variant="outline" className="text-xs">Live</Badge>
                </div>
                <p className="font-medium">1 {crypto} ≈ ${currentRate.toLocaleString()} {currency}</p>
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
                      <provider.Logo />
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
                Buy {amount} {currency} worth of {crypto}
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
    </div>
  );
};

export default BuyCrypto;
