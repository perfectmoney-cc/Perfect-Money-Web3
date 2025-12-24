import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, CandlestickChart, TrendingUp, TrendingDown, BarChart3, 
  ExternalLink, RefreshCw, Home, Loader2, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { TradingViewTicker } from "@/components/TradingViewTicker";
import { HeroBanner } from "@/components/HeroBanner";
import { Footer } from "@/components/Footer";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import pmTokenLogo from "@/assets/pm-token-logo.png";
import usdtLogo from "@/assets/usdt-logo.png";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { PM_TOKEN_ADDRESS } from "@/contracts/addresses";

interface TokenData {
  priceUsd: string;
  priceChange24h: number;
  volume24h: string;
  liquidity: string;
  marketCap: string;
  holders?: number;
}

const Trade = () => {
  const navigate = useNavigate();
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState("24h");

  // Fetch token data from DexScreener API
  const fetchTokenData = async () => {
    setIsLoading(true);
    try {
      // DexScreener API for BSC token
      const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${PM_TOKEN_ADDRESS}`);
      const data = await response.json();
      
      if (data.pairs && data.pairs.length > 0) {
        // Get the main USDT pair
        const mainPair = data.pairs.find((p: any) => 
          p.quoteToken.symbol === 'USDT' || p.quoteToken.symbol === 'WBNB'
        ) || data.pairs[0];
        
        setTokenData({
          priceUsd: mainPair.priceUsd || "0.0001",
          priceChange24h: parseFloat(mainPair.priceChange?.h24 || "0"),
          volume24h: mainPair.volume?.h24 || "0",
          liquidity: mainPair.liquidity?.usd || "0",
          marketCap: mainPair.fdv || "0",
        });
      } else {
        // Fallback mock data for PM token (pre-listing)
        setTokenData({
          priceUsd: "0.0001",
          priceChange24h: 0,
          volume24h: "0",
          liquidity: "0",
          marketCap: "1000000",
        });
      }
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching token data:", error);
      // Fallback data
      setTokenData({
        priceUsd: "0.0001",
        priceChange24h: 0,
        volume24h: "0",
        liquidity: "0",
        marketCap: "1000000",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTokenData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchTokenData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: string | number) => {
    const n = typeof num === 'string' ? parseFloat(num) : num;
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    if (n >= 1e3) return `$${(n / 1e3).toFixed(2)}K`;
    return `$${n.toFixed(2)}`;
  };

  const dexscreenerUrl = `https://dexscreener.com/bsc/${PM_TOKEN_ADDRESS}`;
  const dextoolsUrl = `https://www.dextools.io/app/en/bnb/pair-explorer/${PM_TOKEN_ADDRESS}`;

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 lg:pb-0">
      <Header />
      <TradingViewTicker />
      <HeroBanner 
        title="Trade PM Token" 
        subtitle="Real-time price chart and market data"
      />
      
      <main className="container mx-auto px-4 pt-6 pb-12 flex-1">
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
              <BreadcrumbPage className="flex items-center gap-1">
                <CandlestickChart className="h-3.5 w-3.5" />
                Trade
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Token Info Header */}
        <Card className="mb-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img src={pmTokenLogo} alt="PM" className="w-12 h-12 rounded-full" />
                  <img src={usdtLogo} alt="USDT" className="w-6 h-6 rounded-full absolute -bottom-1 -right-1 border-2 border-background" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold">PM/USDT</h2>
                    <Badge variant="outline" className="text-xs">BSC</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Perfect Money Token</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <>
                    <div className="text-right">
                      <p className="text-3xl font-bold">${tokenData?.priceUsd || "0.0001"}</p>
                      <div className={`flex items-center gap-1 ${tokenData && tokenData.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {tokenData && tokenData.priceChange24h >= 0 ? (
                          <ArrowUpRight className="h-4 w-4" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4" />
                        )}
                        <span className="font-medium">{Math.abs(tokenData?.priceChange24h || 0).toFixed(2)}%</span>
                        <span className="text-muted-foreground text-sm">24h</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={fetchTokenData}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">24h Volume</p>
              <p className="text-lg font-bold">{formatNumber(tokenData?.volume24h || "0")}</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Liquidity</p>
              <p className="text-lg font-bold">{formatNumber(tokenData?.liquidity || "0")}</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Market Cap</p>
              <p className="text-lg font-bold">{formatNumber(tokenData?.marketCap || "0")}</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Last Updated</p>
              <p className="text-lg font-bold">{lastUpdated?.toLocaleTimeString() || "--"}</p>
            </CardContent>
          </Card>
        </div>

        {/* Chart Embed */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Price Chart
              </CardTitle>
              <Tabs value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <TabsList className="h-8">
                  <TabsTrigger value="5m" className="text-xs px-2">5M</TabsTrigger>
                  <TabsTrigger value="1h" className="text-xs px-2">1H</TabsTrigger>
                  <TabsTrigger value="24h" className="text-xs px-2">24H</TabsTrigger>
                  <TabsTrigger value="7d" className="text-xs px-2">7D</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {/* DexScreener Embed */}
            <div className="w-full h-[400px] md:h-[500px] rounded-lg overflow-hidden bg-muted/30">
              <iframe
                src={`https://dexscreener.com/bsc/${PM_TOKEN_ADDRESS}?embed=1&theme=dark&trades=0&info=0`}
                className="w-full h-full border-0"
                title="PM Token Chart"
                allow="clipboard-write"
              />
            </div>
          </CardContent>
        </Card>

        {/* External Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-colors cursor-pointer">
            <a href={dexscreenerUrl} target="_blank" rel="noopener noreferrer">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-green-500/10">
                    <CandlestickChart className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-bold">DexScreener</h3>
                    <p className="text-sm text-muted-foreground">View advanced charts & analytics</p>
                  </div>
                </div>
                <ExternalLink className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </a>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-colors cursor-pointer">
            <a href={dextoolsUrl} target="_blank" rel="noopener noreferrer">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-blue-500/10">
                    <BarChart3 className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-bold">DexTools</h3>
                    <p className="text-sm text-muted-foreground">Trading tools & pair explorer</p>
                  </div>
                </div>
                <ExternalLink className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </a>
          </Card>
        </div>

        {/* Quick Trade Actions */}
        <Card className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Quick Trade
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="gradient" 
                size="lg" 
                className="w-full"
                onClick={() => navigate('/dashboard/swap')}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Buy PM
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full"
                onClick={() => navigate('/dashboard/swap')}
              >
                <TrendingDown className="h-4 w-4 mr-2" />
                Sell PM
              </Button>
            </div>
            <p className="text-xs text-center text-muted-foreground mt-4">
              Trade PM tokens directly on PancakeSwap via our integrated swap
            </p>
          </CardContent>
        </Card>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default Trade;
