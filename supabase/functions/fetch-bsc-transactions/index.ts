import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { address } = await req.json();
    
    if (!address) {
      console.error('No address provided');
      return new Response(
        JSON.stringify({ error: 'Address is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const ALCHEMY_API_KEY = Deno.env.get('ALCHEMY_API_KEY');
    
    if (!ALCHEMY_API_KEY) {
      console.error('ALCHEMY_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching transactions for address: ${address}`);

    // Alchemy API endpoint for BSC mainnet
    const alchemyUrl = `https://bnb-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;

    // Fetch asset transfers using Alchemy's getAssetTransfers
    const response = await fetch(alchemyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'alchemy_getAssetTransfers',
        params: [
          {
            fromAddress: address,
            category: ['external', 'erc20'],
            maxCount: '0x14', // 20 transactions
            order: 'desc',
          }
        ]
      })
    });

    const fromData = await response.json();
    console.log('From transactions fetched:', fromData.result?.transfers?.length || 0);

    // Fetch incoming transfers
    const toResponse = await fetch(alchemyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'alchemy_getAssetTransfers',
        params: [
          {
            toAddress: address,
            category: ['external', 'erc20'],
            maxCount: '0x14', // 20 transactions
            order: 'desc',
          }
        ]
      })
    });

    const toData = await toResponse.json();
    console.log('To transactions fetched:', toData.result?.transfers?.length || 0);

    // Combine and sort transfers
    const allTransfers = [
      ...(fromData.result?.transfers || []),
      ...(toData.result?.transfers || [])
    ];

    // Sort by block number descending
    allTransfers.sort((a, b) => {
      const blockA = parseInt(a.blockNum, 16);
      const blockB = parseInt(b.blockNum, 16);
      return blockB - blockA;
    });

    // Remove duplicates based on hash
    const uniqueTransfers = allTransfers.filter((transfer, index, self) =>
      index === self.findIndex(t => t.hash === transfer.hash)
    );

    console.log(`Total unique transactions: ${uniqueTransfers.length}`);

    return new Response(
      JSON.stringify({ transfers: uniqueTransfers.slice(0, 30) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error fetching transactions:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Failed to fetch transactions', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
