import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { TrendingUp, TrendingDown, Loader2 } from "lucide-react";

interface CryptoPriceChartProps {
  crypto: string;
  currency: string;
  currencySymbol: string;
  currentPrice: number;
  priceChange: number;
}

type TimeRange = "1H" | "24H" | "7D" | "30D";

const CryptoPriceChart = ({ 
  crypto, 
  currency, 
  currencySymbol, 
  currentPrice, 
  priceChange 
}: CryptoPriceChartProps) => {
  const [timeRange, setTimeRange] = useState<TimeRange>("24H");
  const [chartData, setChartData] = useState<Array<{ time: string; price: number }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  // CoinGecko ID mapping
  const coinGeckoIds: Record<string, string> = {
    BNB: "binancecoin",
    ETH: "ethereum",
    BTC: "bitcoin",
    USDT: "tether",
    USDC: "usd-coin",
    SOL: "solana",
    MATIC: "matic-network",
    AVAX: "avalanche-2",
  };

  // Get days for API call
  const getDays = (range: TimeRange): string => {
    switch (range) {
      case "1H": return "1";
      case "24H": return "1";
      case "7D": return "7";
      case "30D": return "30";
      default: return "1";
    }
  };

  useEffect(() => {
    const fetchChartData = async () => {
      setIsLoading(true);
      try {
        const coinId = coinGeckoIds[crypto] || "binancecoin";
        const days = getDays(timeRange);
        
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=${currency.toLowerCase()}&days=${days}`,
          { headers: { "Accept": "application/json" } }
        );
        
        if (!response.ok) throw new Error("Failed to fetch chart data");
        
        const data = await response.json();
        
        // Format data for chart
        const formattedData = data.prices.map((item: [number, number]) => {
          const date = new Date(item[0]);
          let timeLabel: string;
          
          if (timeRange === "1H" || timeRange === "24H") {
            timeLabel = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          } else {
            timeLabel = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
          }
          
          return {
            time: timeLabel,
            price: item[1],
          };
        });

        // For 1H, filter to last hour of data
        if (timeRange === "1H") {
          const oneHourAgo = Date.now() - 60 * 60 * 1000;
          const filteredData = data.prices
            .filter((item: [number, number]) => item[0] >= oneHourAgo)
            .map((item: [number, number]) => ({
              time: new Date(item[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              price: item[1],
            }));
          setChartData(filteredData.length > 0 ? filteredData : formattedData.slice(-12));
        } else {
          // Sample data to prevent overcrowding
          const sampleRate = Math.ceil(formattedData.length / 50);
          const sampledData = formattedData.filter((_: unknown, index: number) => index % sampleRate === 0);
          setChartData(sampledData);
        }
      } catch (error) {
        console.error("Failed to fetch chart data:", error);
        // Generate fallback mock data
        const mockData = generateMockData(timeRange, currentPrice);
        setChartData(mockData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChartData();
  }, [crypto, currency, timeRange, currentPrice]);

  const generateMockData = (range: TimeRange, basePrice: number): Array<{ time: string; price: number }> => {
    const points = range === "1H" ? 12 : range === "24H" ? 24 : range === "7D" ? 7 : 30;
    const volatility = basePrice * 0.02;
    
    return Array.from({ length: points }, (_, i) => {
      const variation = (Math.random() - 0.5) * volatility;
      const date = new Date();
      
      if (range === "1H") {
        date.setMinutes(date.getMinutes() - (points - i) * 5);
        return {
          time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          price: basePrice + variation,
        };
      } else if (range === "24H") {
        date.setHours(date.getHours() - (points - i));
        return {
          time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          price: basePrice + variation,
        };
      } else {
        date.setDate(date.getDate() - (points - i));
        return {
          time: date.toLocaleDateString([], { month: 'short', day: 'numeric' }),
          price: basePrice + variation,
        };
      }
    });
  };

  const formatYAxis = (value: number) => {
    if (value >= 1000) {
      return `${currencySymbol}${(value / 1000).toFixed(1)}k`;
    }
    return `${currencySymbol}${value.toFixed(2)}`;
  };

  const formatTooltip = (value: number) => {
    return `${currencySymbol}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`;
  };

  const chartColor = priceChange >= 0 ? "#22c55e" : "#ef4444";
  const minPrice = Math.min(...chartData.map(d => d.price));
  const maxPrice = Math.max(...chartData.map(d => d.price));

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Price Chart</CardTitle>
          <div className="flex items-center gap-2">
            {(["1H", "24H", "7D", "30D"] as TimeRange[]).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "ghost"}
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setTimeRange(range)}
              >
                {range}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-2xl font-bold">
            {currencySymbol}{currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <Badge 
            variant="outline" 
            className={priceChange >= 0 ? "text-green-500 border-green-500/30" : "text-red-500 border-red-500/30"}
          >
            {priceChange >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
            {priceChange >= 0 ? "+" : ""}{priceChange.toFixed(2)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="h-[200px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={`gradient-${crypto}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chartColor} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="time" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  domain={[minPrice * 0.995, maxPrice * 1.005]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={formatYAxis}
                  width={60}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value: number) => [formatTooltip(value), crypto]}
                  labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={chartColor}
                  strokeWidth={2}
                  fill={`url(#gradient-${crypto})`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CryptoPriceChart;
