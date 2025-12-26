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
    
    if (!alchemyApiKey) {
      throw new Error("ALCHEMY_API_KEY not configured");
    }

    // Fetch BNB price from Alchemy using their price API
    // Using BSC mainnet endpoint
    const response = await fetch(
      `https://bnb-mainnet.g.alchemy.com/v2/${alchemyApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "alchemy_getTokenMetadata",
          params: ["0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"] // WBNB
        }),
      }
    );

    // Also get ETH price from CoinGecko as fallback for accurate pricing
    const priceResponse = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=binancecoin,ethereum,bitcoin,tether,usd-coin&vs_currencies=usd",
      { headers: { "Accept": "application/json" } }
    );

    const priceData = await priceResponse.json();

    const prices = {
      BNB: priceData.binancecoin?.usd || 620,
      ETH: priceData.ethereum?.usd || 3400,
      BTC: priceData.bitcoin?.usd || 95000,
      USDT: priceData.tether?.usd || 1,
      USDC: priceData["usd-coin"]?.usd || 1,
    };

    return new Response(JSON.stringify({ prices, timestamp: Date.now() }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error fetching crypto prices:", error);
    
    // Return fallback prices if API fails
    const fallbackPrices = {
      BNB: 620,
      ETH: 3400,
      BTC: 95000,
      USDT: 1,
      USDC: 1,
    };

    return new Response(
      JSON.stringify({ prices: fallbackPrices, timestamp: Date.now(), fallback: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
