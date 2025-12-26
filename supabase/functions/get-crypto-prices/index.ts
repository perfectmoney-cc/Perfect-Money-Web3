import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Exchange rates relative to USD
const exchangeRates: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  AED: 3.67,
  PHP: 56.50,
  ZAR: 18.20,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const alchemyApiKey = Deno.env.get("ALCHEMY_API_KEY");
    
    if (!alchemyApiKey) {
      console.warn("ALCHEMY_API_KEY not configured, using CoinGecko fallback");
    }

    // Get currency from request body if provided
    const body = await req.json().catch(() => ({}));
    const currency = body.currency || "USD";
    const exchangeRate = exchangeRates[currency] || 1;

    // Fetch prices from CoinGecko (includes SOL, MATIC, AVAX)
    const priceResponse = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=binancecoin,ethereum,bitcoin,tether,usd-coin,solana,matic-network,avalanche-2&vs_currencies=usd&include_24hr_change=true",
      { headers: { "Accept": "application/json" } }
    );

    if (!priceResponse.ok) {
      throw new Error(`CoinGecko API error: ${priceResponse.status}`);
    }

    const priceData = await priceResponse.json();
    console.log("CoinGecko price data:", priceData);

    // Convert prices to selected currency
    const prices: Record<string, number> = {
      BNB: (priceData.binancecoin?.usd || 620) * exchangeRate,
      ETH: (priceData.ethereum?.usd || 3400) * exchangeRate,
      BTC: (priceData.bitcoin?.usd || 95000) * exchangeRate,
      USDT: (priceData.tether?.usd || 1) * exchangeRate,
      USDC: (priceData["usd-coin"]?.usd || 1) * exchangeRate,
      SOL: (priceData.solana?.usd || 180) * exchangeRate,
      MATIC: (priceData["matic-network"]?.usd || 0.55) * exchangeRate,
      AVAX: (priceData["avalanche-2"]?.usd || 35) * exchangeRate,
    };

    // Get 24h changes
    const changes: Record<string, number> = {
      BNB: priceData.binancecoin?.usd_24h_change || 0,
      ETH: priceData.ethereum?.usd_24h_change || 0,
      BTC: priceData.bitcoin?.usd_24h_change || 0,
      USDT: priceData.tether?.usd_24h_change || 0,
      USDC: priceData["usd-coin"]?.usd_24h_change || 0,
      SOL: priceData.solana?.usd_24h_change || 0,
      MATIC: priceData["matic-network"]?.usd_24h_change || 0,
      AVAX: priceData["avalanche-2"]?.usd_24h_change || 0,
    };

    return new Response(
      JSON.stringify({ 
        prices, 
        changes,
        currency,
        exchangeRate,
        exchangeRates,
        timestamp: Date.now() 
      }), 
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error fetching crypto prices:", error);
    
    // Return fallback prices if API fails
    const fallbackPrices = {
      BNB: 620,
      ETH: 3400,
      BTC: 95000,
      USDT: 1,
      USDC: 1,
      SOL: 180,
      MATIC: 0.55,
      AVAX: 35,
    };

    return new Response(
      JSON.stringify({ 
        prices: fallbackPrices, 
        changes: {},
        currency: "USD",
        exchangeRate: 1,
        exchangeRates: { USD: 1, EUR: 0.92, GBP: 0.79, AED: 3.67, PHP: 56.50, ZAR: 18.20 },
        timestamp: Date.now(), 
        fallback: true 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
