import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useAccount, useBalance } from 'wagmi';
import bnbLogo from "@/assets/bnb-logo.png";
import usdtLogo from "@/assets/usdt-logo.png";
import usdcLogo from "@/assets/usdc-logo.png";
import pyusdLogo from "@/assets/pyusd-logo.png";

// BSC Mainnet token addresses
const TOKEN_ADDRESSES = {
  USDT: "0x55d398326f99059fF775485246999027B3197955" as `0x${string}`,
  USDC: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d" as `0x${string}`,
  PYUSD: "0x09c4aE5B01d7D7Ed2b5107F9b6889B9A17b3a6E0" as `0x${string}`
};
interface PriceData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  balance: string;
  logo: string;
  isLoading: boolean;
}
export const PriceChart = () => {
  const {
    address,
    isConnected
  } = useAccount();

  // Fetch real-time balances from connected wallet
  const {
    data: bnbBalance
  } = useBalance({
    address: address
  });
  const {
    data: usdtBalance
  } = useBalance({
    address: address,
    token: TOKEN_ADDRESSES.USDT
  });
  const {
    data: usdcBalance
  } = useBalance({
    address: address,
    token: TOKEN_ADDRESSES.USDC
  });
  const {
    data: pyusdBalance
  } = useBalance({
    address: address,
    token: TOKEN_ADDRESSES.PYUSD
  });
  const [priceData, setPriceData] = useState<PriceData[]>([{
    symbol: "BNB",
    name: "BNB",
    price: 0,
    change24h: 0,
    balance: "0",
    logo: bnbLogo,
    isLoading: true
  }, {
    symbol: "USDT",
    name: "Tether",
    price: 0,
    change24h: 0,
    balance: "0",
    logo: usdtLogo,
    isLoading: true
  }, {
    symbol: "USDC",
    name: "USD Coin",
    price: 0,
    change24h: 0,
    balance: "0",
    logo: usdcLogo,
    isLoading: true
  }, {
    symbol: "PYUSD",
    name: "PayPal USD",
    price: 0,
    change24h: 0,
    balance: "0",
    logo: pyusdLogo,
    isLoading: true
  }]);

  // Update balances when wallet data changes
  useEffect(() => {
    setPriceData(prev => prev.map(item => {
      let newBalance = "0";
      if (isConnected) {
        switch (item.symbol) {
          case "BNB":
            newBalance = bnbBalance?.formatted || "0";
            break;
          case "USDT":
            newBalance = usdtBalance?.formatted || "0";
            break;
          case "USDC":
            newBalance = usdcBalance?.formatted || "0";
            break;
          case "PYUSD":
            newBalance = pyusdBalance?.formatted || "0";
            break;
        }
      }
      return {
        ...item,
        balance: newBalance
      };
    }));
  }, [isConnected, bnbBalance, usdtBalance, usdcBalance, pyusdBalance]);
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const coingeckoResponse = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=binancecoin,tether,usd-coin,paypal-usd&vs_currencies=usd&include_24hr_change=true");
        const coingeckoData = await coingeckoResponse.json();
        if (coingeckoData) {
          setPriceData(prev => [{
            ...prev[0],
            price: coingeckoData.binancecoin?.usd || 0,
            change24h: coingeckoData.binancecoin?.usd_24h_change || 0,
            isLoading: false
          }, {
            ...prev[1],
            price: coingeckoData.tether?.usd || 0,
            change24h: coingeckoData.tether?.usd_24h_change || 0,
            isLoading: false
          }, {
            ...prev[2],
            price: coingeckoData["usd-coin"]?.usd || 0,
            change24h: coingeckoData["usd-coin"]?.usd_24h_change || 0,
            isLoading: false
          }, {
            ...prev[3],
            price: coingeckoData["paypal-usd"]?.usd || 1.00,
            change24h: coingeckoData["paypal-usd"]?.usd_24h_change || 0,
            isLoading: false
          }]);
        }
      } catch (error) {
        console.error("Error fetching price data:", error);
        setPriceData(prev => prev.map(item => ({
          ...item,
          isLoading: false
        })));
      }
    };
    fetchPrices();
    const interval = setInterval(fetchPrices, 60000);
    return () => {
      clearInterval(interval);
    };
  }, []);
  const formatBalance = (balance: string, symbol: string) => {
    const num = parseFloat(balance);
    if (symbol === "BNB") {
      return num.toLocaleString('en-US', {
        minimumFractionDigits: 4,
        maximumFractionDigits: 4
      });
    }
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {priceData.map((token) => (
        <Card key={token.symbol} className="p-4 bg-card/50 backdrop-blur-sm border-border">
          <div className="flex items-center gap-3 mb-3">
            <img src={token.logo} alt={token.symbol} className="h-8 w-8" />
            <div>
              <p className="font-semibold">{token.symbol}</p>
              <p className="text-xs text-muted-foreground">{token.name}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Price</span>
              <span className="font-medium">
                {token.isLoading ? "..." : `$${token.price.toFixed(2)}`}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">24h</span>
              <span className={`flex items-center gap-1 text-sm ${token.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {token.change24h >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {token.isLoading ? "..." : `${token.change24h.toFixed(2)}%`}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="text-sm text-muted-foreground">Balance</span>
              <span className="font-medium">
                {formatBalance(token.balance, token.symbol)} {token.symbol}
              </span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};