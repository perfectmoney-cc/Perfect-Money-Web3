import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { TrendingUp, TrendingDown, Wallet, ChevronDown } from "lucide-react";
import { useAccount, useBalance } from 'wagmi';
import { PM_TOKEN_ADDRESS } from "@/contracts/addresses";
import { cn } from "@/lib/utils";
const TOKEN_ADDRESSES = {
  USDT: "0x55d398326f99059fF775485246999027B3197955" as `0x${string}`,
  USDC: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d" as `0x${string}`,
  PYUSD: "0x09c4aE5B01d7D7Ed2b5107F9b6889B9A17b3a6E0" as `0x${string}`
};
interface TokenPrice {
  bnb: number;
  usdt: number;
  usdc: number;
  pyusd: number;
  pm: number;
}
export const PortfolioValue = () => {
  const [isTokensOpen, setIsTokensOpen] = useState(false);
  const {
    address,
    isConnected
  } = useAccount();
  const [totalValue, setTotalValue] = useState(0);
  const [change24h, setChange24h] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [prices, setPrices] = useState<TokenPrice>({
    bnb: 0,
    usdt: 1,
    usdc: 1,
    pyusd: 1,
    pm: 0.001 // Default PM price estimate
  });

  // Fetch balances
  const {
    data: bnbBalance
  } = useBalance({
    address
  });
  const {
    data: pmBalance
  } = useBalance({
    address,
    token: PM_TOKEN_ADDRESS as `0x${string}`
  });
  const {
    data: usdtBalance
  } = useBalance({
    address,
    token: TOKEN_ADDRESSES.USDT
  });
  const {
    data: usdcBalance
  } = useBalance({
    address,
    token: TOKEN_ADDRESSES.USDC
  });
  const {
    data: pyusdBalance
  } = useBalance({
    address,
    token: TOKEN_ADDRESSES.PYUSD
  });

  // Fetch prices from CoinGecko
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=binancecoin,tether,usd-coin,paypal-usd&vs_currencies=usd&include_24hr_change=true");
        const data = await response.json();
        if (data) {
          setPrices({
            bnb: data.binancecoin?.usd || 0,
            usdt: data.tether?.usd || 1,
            usdc: data["usd-coin"]?.usd || 1,
            pyusd: data["paypal-usd"]?.usd || 1,
            pm: 0.001 // PM token price (can be fetched from DEX later)
          });

          // Average 24h change across major holdings
          const avgChange = ((data.binancecoin?.usd_24h_change || 0) + (data.tether?.usd_24h_change || 0)) / 2;
          setChange24h(avgChange);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching prices:", error);
        setIsLoading(false);
      }
    };
    fetchPrices();
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  // Calculate total portfolio value
  useEffect(() => {
    if (!isConnected) {
      setTotalValue(0);
      return;
    }
    const bnbValue = parseFloat(bnbBalance?.formatted || "0") * prices.bnb;
    const pmValue = parseFloat(pmBalance?.formatted || "0") * prices.pm;
    const usdtValue = parseFloat(usdtBalance?.formatted || "0") * prices.usdt;
    const usdcValue = parseFloat(usdcBalance?.formatted || "0") * prices.usdc;
    const pyusdValue = parseFloat(pyusdBalance?.formatted || "0") * prices.pyusd;
    const total = bnbValue + pmValue + usdtValue + usdcValue + pyusdValue;
    setTotalValue(total);
  }, [isConnected, bnbBalance, pmBalance, usdtBalance, usdcBalance, pyusdBalance, prices]);
  return <Card className="p-4 md:p-6 bg-gradient-to-br from-primary/20 via-card to-secondary/20 border-primary/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-full bg-primary/20">
            <Wallet className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Total Assets Value</p>
            <p className="md:text-3xl font-bold text-base">
              {isLoading ? <span className="animate-pulse">Loading...</span> : `$${totalValue.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}`}
            </p>
          </div>
        </div>
        <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full ${change24h >= 0 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
          {change24h >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          <span className="text-sm font-semibold">
            {Math.abs(change24h).toFixed(2)}%
          </span>
        </div>
      </div>
      
      {/* Token breakdown - Collapsible on mobile */}
      <Collapsible open={isTokensOpen} onOpenChange={setIsTokensOpen} className="md:hidden mt-4 pt-4 border-t border-border/50">
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2">
          <span className="text-sm font-medium">Token Breakdown</span>
          <ChevronDown className={cn("h-4 w-4 transition-transform", isTokensOpen && "rotate-180")} />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="text-center p-2 rounded-lg bg-background/50">
              <p className="text-xs text-muted-foreground">PM</p>
              <p className="text-sm font-semibold text-primary">
                ${(parseFloat(pmBalance?.formatted || "0") * prices.pm).toLocaleString('en-US', {
                maximumFractionDigits: 2
              })}
              </p>
            </div>
            <div className="text-center p-2 rounded-lg bg-background/50">
              <p className="text-xs text-muted-foreground">BNB</p>
              <p className="text-sm font-semibold">
                ${(parseFloat(bnbBalance?.formatted || "0") * prices.bnb).toLocaleString('en-US', {
                maximumFractionDigits: 2
              })}
              </p>
            </div>
            <div className="text-center p-2 rounded-lg bg-background/50">
              <p className="text-xs text-muted-foreground">USDT</p>
              <p className="text-sm font-semibold">
                ${(parseFloat(usdtBalance?.formatted || "0") * prices.usdt).toLocaleString('en-US', {
                maximumFractionDigits: 2
              })}
              </p>
            </div>
            <div className="text-center p-2 rounded-lg bg-background/50">
              <p className="text-xs text-muted-foreground">USDC</p>
              <p className="text-sm font-semibold">
                ${(parseFloat(usdcBalance?.formatted || "0") * prices.usdc).toLocaleString('en-US', {
                maximumFractionDigits: 2
              })}
              </p>
            </div>
            <div className="text-center p-2 rounded-lg bg-background/50 col-span-2">
              <p className="text-xs text-muted-foreground">PYUSD</p>
              <p className="text-sm font-semibold">
                ${(parseFloat(pyusdBalance?.formatted || "0") * prices.pyusd).toLocaleString('en-US', {
                maximumFractionDigits: 2
              })}
              </p>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Token breakdown - Always visible on desktop */}
      
    </Card>;
};