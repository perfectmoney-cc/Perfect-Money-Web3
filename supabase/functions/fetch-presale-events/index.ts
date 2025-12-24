import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// TokensPurchased event signature: keccak256("TokensPurchased(address,uint8,uint256,uint256)")
const TOKENS_PURCHASED_TOPIC = '0x8fafebcaf532a98a7e6e4e18e6e5f4f8f5e4e3d6c9b8a7f6e5d4c3b2a1908070';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { address, contractAddress } = await req.json();
    
    if (!address || !contractAddress) {
      return new Response(
        JSON.stringify({ error: 'Address and contractAddress are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const ALCHEMY_API_KEY = Deno.env.get('ALCHEMY_API_KEY');
    
    if (!ALCHEMY_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const alchemyUrl = `https://bnb-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;
    
    // Pad the address to 32 bytes for topic filtering
    const paddedAddress = '0x' + address.slice(2).toLowerCase().padStart(64, '0');

    // Fetch logs for TokensPurchased events filtered by buyer address
    const logsResponse = await fetch(alchemyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getLogs',
        params: [{
          address: contractAddress,
          topics: [
            TOKENS_PURCHASED_TOPIC,
            paddedAddress // indexed buyer parameter
          ],
          fromBlock: '0x0',
          toBlock: 'latest'
        }]
      })
    });

    const logsData = await logsResponse.json();
    
    if (logsData.error) {
      console.error('Alchemy error:', logsData.error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch logs', details: logsData.error }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const logs = logsData.result || [];
    
    // Get block timestamps for each log
    const blockNumbers = [...new Set(logs.map((log: any) => log.blockNumber))];
    
    const blockTimestamps: Record<string, number> = {};
    
    // Fetch block timestamps in batches
    for (const blockNum of blockNumbers) {
      const blockResponse = await fetch(alchemyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_getBlockByNumber',
          params: [blockNum, false]
        })
      });
      
      const blockData = await blockResponse.json();
      if (blockData.result) {
        blockTimestamps[blockNum as string] = parseInt(blockData.result.timestamp, 16);
      }
    }

    // Parse the logs
    const events = logs.map((log: any) => {
      // Data contains: round (uint8), bnbAmount (uint256), tokenAmount (uint256)
      const data = log.data.slice(2); // remove 0x
      
      // round is padded to 32 bytes
      const round = parseInt(data.slice(0, 64), 16);
      // bnbAmount is next 32 bytes
      const bnbAmount = '0x' + data.slice(64, 128);
      // tokenAmount is next 32 bytes
      const tokenAmount = '0x' + data.slice(128, 192);
      
      return {
        buyer: address,
        round,
        bnbAmount,
        tokenAmount,
        transactionHash: log.transactionHash,
        blockNumber: log.blockNumber,
        timestamp: blockTimestamps[log.blockNumber] || 0
      };
    });

    // Sort by timestamp descending
    events.sort((a: any, b: any) => b.timestamp - a.timestamp);

    return new Response(
      JSON.stringify({ events }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch events', details: error instanceof Error ? error.message : 'Unknown' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
