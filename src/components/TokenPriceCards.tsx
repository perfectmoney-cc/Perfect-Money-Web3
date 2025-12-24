import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, TrendingUp, TrendingDown } from "lucide-react";
import { useAccount, useBalance } from 'wagmi';
import { PM_TOKEN_ADDRESS } from "@/contracts/addresses";
import { cn } from "@/lib/utils";
import bnbLogo from "@/assets/bnb-logo.png";
import usdtLogo from "@/assets/usdt-logo.png";
import usdcLogo from "@/assets/usdc-logo.png";
import pyusdLogo from "@/assets/pyusd-logo.png";

const TOKEN_ADDRESSES = {
  USDT: "0x55d398326f99059fF775485246999027B3197955" as `0x${string}`,
  USDC: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d" as `0x${string}`,
  PYUSD: "0x09c4aE5B01d7D7Ed2b5107F9b6889B9A17b3a6E0" as `0x${string}`
};

interface TokenData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  balance: string;
  balanceUsd: number;
  logo: string;
  color: string;
}

export const TokenPriceCards = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { address, isConnected } = useAccount();
  const [prices, setPrices] = useState({
    bnb: { price: 0, change: 0 },
    usdt: { price: 1, change: 0 },
    usdc: { price: 1, change: 0 },
    pyusd: { price: 1, change: 0 },
  });

  // Fetch balances
  const { data: bnbBalance } = useBalance({ address });
  const { data: usdtBalance } = useBalance({ address, token: TOKEN_ADDRESSES.USDT });
  const { data: usdcBalance } = useBalance({ address, token: TOKEN_ADDRESSES.USDC });
  const { data: pyusdBalance } = useBalance({ address, token: TOKEN_ADDRESSES.PYUSD });

  // Fetch prices
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=binancecoin,tether,usd-coin,paypal-usd&vs_currencies=usd&include_24hr_change=true"
        );
        const data = await response.json();
        if (data) {
          setPrices({
            bnb: { price: data.binancecoin?.usd || 0, change: data.binancecoin?.usd_24h_change || 0 },
            usdt: { price: data.tether?.usd || 1, change: data.tether?.usd_24h_change || 0 },
            usdc: { price: data["usd-coin"]?.usd || 1, change: data["usd-coin"]?.usd_24h_change || 0 },
            pyusd: { price: data["paypal-usd"]?.usd || 1, change: data["paypal-usd"]?.usd_24h_change || 0 },
          });
        }
      } catch (error) {
        console.error("Error fetching prices:", error);
      }
    };
    fetchPrices();
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  const tokens: TokenData[] = [
    {
      symbol: "BNB",
      name: "BNB",
      price: prices.bnb.price,
      change24h: prices.bnb.change,
      balance: parseFloat(bnbBalance?.formatted || "0").toFixed(4),
      balanceUsd: parseFloat(bnbBalance?.formatted || "0") * prices.bnb.price,
      logo: bnbLogo,
      color: "text-yellow-500"
    },
    {
      symbol: "USDT",
      name: "Tether",
      price: prices.usdt.price,
      change24h: prices.usdt.change,
      balance: parseFloat(usdtBalance?.formatted || "0").toFixed(2),
      balanceUsd: parseFloat(usdtBalance?.formatted || "0") * prices.usdt.price,
      logo: usdtLogo,
      color: "text-green-500"
    },
    {
      symbol: "USDC",
      name: "USD Coin",
      price: prices.usdc.price,
      change24h: prices.usdc.change,
      balance: parseFloat(usdcBalance?.formatted || "0").toFixed(2),
      balanceUsd: parseFloat(usdcBalance?.formatted || "0") * prices.usdc.price,
      logo: usdcLogo,
      color: "text-blue-500"
    },
    {
      symbol: "PYUSD",
      name: "PayPal USD",
      price: prices.pyusd.price,
      change24h: prices.pyusd.change,
      balance: parseFloat(pyusdBalance?.formatted || "0").toFixed(2),
      balanceUsd: parseFloat(pyusdBalance?.formatted || "0") * prices.pyusd.price,
      logo: pyusdLogo,
      color: "text-blue-400"
    },
  ];

  const TokenCard = ({ token }: { token: TokenData }) => (
    <Card className="p-4 bg-card border-border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <img src={token.logo} alt={token.symbol} className="w-8 h-8 rounded-full" />
          <span className="font-medium">{token.name}</span>
        </div>
        <div className={cn(
          "flex items-center gap-1 text-xs",
          token.change24h >= 0 ? "text-green-400" : "text-red-400"
        )}>
          {token.change24h >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          <span>{token.change24h >= 0 ? "↑" : "↓"} {Math.abs(token.change24h).toFixed(2)}%</span>
        </div>
      </div>
      <p className={cn("text-xl font-bold mb-3", token.color)}>
        ${token.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
      </p>
      <div className="border-t border-border pt-3">
        <p className="text-xs text-muted-foreground mb-1">Your Balance</p>
        <p className={cn("font-semibold", token.color)}>{token.balance} {token.symbol}</p>
        <p className="text-xs text-muted-foreground">≈ ${token.balanceUsd.toFixed(2)} USD</p>
      </div>
    </Card>
  );

  // Desktop view - always visible
  const DesktopView = () => (
    <div className="hidden md:grid grid-cols-4 gap-4">
      {tokens.map((token) => (
        <TokenCard key={token.symbol} token={token} />
      ))}
    </div>
  );

  // Mobile view - collapsible
  const MobileView = () => (
    <div className="md:hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Card className="p-4 bg-card border-border cursor-pointer">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Token Prices</span>
              <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
            </div>
          </Card>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2 space-y-2">
          {tokens.map((token) => (
            <TokenCard key={token.symbol} token={token} />
          ))}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );

  return (
    <>
      <MobileView />
      <DesktopView />
    </>
  );
};
