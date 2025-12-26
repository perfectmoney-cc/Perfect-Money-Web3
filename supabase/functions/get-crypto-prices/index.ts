import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const alchemyApiKey = Deno.env.get("ALCHEMY_API_KEY");
    
    // Get currency from request body if provided
    const body = await req.json().catch(() => ({}));
    const currency = body.currency || "USD";

    // Step 1: Fetch FX rates from exchangerate-api (free tier)
    let fxRates: Record<string, number> = {
      USD: 1, EUR: 0.92, GBP: 0.79, AED: 3.67, PHP: 56.50, ZAR: 18.20, CAD: 1.36, AUD: 1.53, JPY: 149.50, INR: 83.40
    };
    
    try {
      const fxResponse = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
      if (fxResponse.ok) {
        const fxData = await fxResponse.json();
        fxRates = fxData.rates || fxRates;
        console.log("FX rates fetched successfully");
      }
    } catch (fxError) {
      console.warn("FX API failed, using fallback rates:", fxError);
    }

    const exchangeRate = fxRates[currency] || 1;

    // Step 2: Fetch crypto prices - try Alchemy first, fallback to CoinGecko
    let pricesUSD: Record<string, number> = {};
    let changes: Record<string, number> = {};
    
    // Try Alchemy Prices API if key is available
    if (alchemyApiKey) {
      try {
        const symbols = ["BNB", "ETH", "BTC", "USDT", "USDC", "SOL", "MATIC", "AVAX"];
        const alchemyResponse = await fetch(
          `https://api.g.alchemy.com/prices/v1/${alchemyApiKey}/tokens/by-symbol?symbols=${symbols.join(",")}`,
          { 
            headers: { 
              "Accept": "application/json",
              "Content-Type": "application/json"
            } 
          }
        );
        
        if (alchemyResponse.ok) {
          const alchemyData = await alchemyResponse.json();
          console.log("Alchemy price data received");
          
          // Parse Alchemy response
          if (alchemyData.data) {
            for (const item of alchemyData.data) {
              const symbol = item.symbol?.toUpperCase();
              if (symbol && item.prices?.[0]?.value) {
                pricesUSD[symbol] = parseFloat(item.prices[0].value);
              }
            }
          }
        }
      } catch (alchemyError) {
        console.warn("Alchemy API failed:", alchemyError);
      }
    }
    
    // Fallback to CoinGecko if Alchemy didn't provide all prices
    if (Object.keys(pricesUSD).length < 8) {
      try {
        const priceResponse = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=binancecoin,ethereum,bitcoin,tether,usd-coin,solana,matic-network,avalanche-2&vs_currencies=usd&include_24hr_change=true",
          { headers: { "Accept": "application/json" } }
        );

        if (priceResponse.ok) {
          const priceData = await priceResponse.json();
          console.log("CoinGecko price data:", priceData);

          // Set prices from CoinGecko (only if not already set by Alchemy)
          if (!pricesUSD.BNB) pricesUSD.BNB = priceData.binancecoin?.usd || 620;
          if (!pricesUSD.ETH) pricesUSD.ETH = priceData.ethereum?.usd || 3400;
          if (!pricesUSD.BTC) pricesUSD.BTC = priceData.bitcoin?.usd || 95000;
          if (!pricesUSD.USDT) pricesUSD.USDT = priceData.tether?.usd || 1;
          if (!pricesUSD.USDC) pricesUSD.USDC = priceData["usd-coin"]?.usd || 1;
          if (!pricesUSD.SOL) pricesUSD.SOL = priceData.solana?.usd || 180;
          if (!pricesUSD.MATIC) pricesUSD.MATIC = priceData["matic-network"]?.usd || 0.55;
          if (!pricesUSD.AVAX) pricesUSD.AVAX = priceData["avalanche-2"]?.usd || 35;

          // Get 24h changes
          changes = {
            BNB: priceData.binancecoin?.usd_24h_change || 0,
            ETH: priceData.ethereum?.usd_24h_change || 0,
            BTC: priceData.bitcoin?.usd_24h_change || 0,
            USDT: priceData.tether?.usd_24h_change || 0,
            USDC: priceData["usd-coin"]?.usd_24h_change || 0,
            SOL: priceData.solana?.usd_24h_change || 0,
            MATIC: priceData["matic-network"]?.usd_24h_change || 0,
            AVAX: priceData["avalanche-2"]?.usd_24h_change || 0,
          };
        }
      } catch (cgError) {
        console.warn("CoinGecko API failed:", cgError);
      }
    }

    // Ensure we have fallback prices
    const fallbackPrices = { BNB: 620, ETH: 3400, BTC: 95000, USDT: 1, USDC: 1, SOL: 180, MATIC: 0.55, AVAX: 35 };
    for (const [symbol, fallback] of Object.entries(fallbackPrices)) {
      if (!pricesUSD[symbol]) pricesUSD[symbol] = fallback;
    }

    // Convert to selected currency
    const prices: Record<string, number> = {};
    for (const [symbol, priceUsd] of Object.entries(pricesUSD)) {
      prices[symbol] = priceUsd * exchangeRate;
    }

    // Step 3: Fetch provider quotes (mock structure - real APIs require merchant keys)
    const providerQuotes = {
      moonpay: { available: true, fee: "3.5%", estimatedTime: "5-10 min" },
      transak: { available: true, fee: "1.5%", estimatedTime: "5-15 min" },
      ramp: { available: true, fee: "2.9%", estimatedTime: "instant" },
      simplex: { available: true, fee: "3.5%", estimatedTime: "10-30 min" },
    };

    return new Response(
      JSON.stringify({ 
        prices, 
        pricesUSD,
        changes,
        currency,
        exchangeRate,
        exchangeRates: fxRates,
        providerQuotes,
        source: alchemyApiKey && Object.keys(pricesUSD).length >= 8 ? "alchemy" : "coingecko",
        timestamp: Date.now() 
      }), 
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error fetching crypto prices:", error);
    
    // Return fallback prices if all APIs fail
    const fallbackPrices = {
      BNB: 620, ETH: 3400, BTC: 95000, USDT: 1, USDC: 1, SOL: 180, MATIC: 0.55, AVAX: 35,
    };

    return new Response(
      JSON.stringify({ 
        prices: fallbackPrices, 
        pricesUSD: fallbackPrices,
        changes: {},
        currency: "USD",
        exchangeRate: 1,
        exchangeRates: { USD: 1, EUR: 0.92, GBP: 0.79, AED: 3.67, PHP: 56.50, ZAR: 18.20 },
        providerQuotes: {},
        source: "fallback",
        timestamp: Date.now(), 
        fallback: true 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
