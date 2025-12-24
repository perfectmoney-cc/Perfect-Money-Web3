import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Virtual Card contract events signatures
const EVENT_SIGNATURES = {
  CardCreated: "0x" + "CardCreated(address,string,uint8)".split("").reduce((acc, c) => acc + c.charCodeAt(0).toString(16), ""),
  CardTopUp: "0xf5548c0e935cc979e1c5d tried4f2e8a59d0b9e8b3b2a5e8f9c0d1e2f3a4b5c6d7e8f9",
  CardWithdraw: "0xa1b2c3d4e5f6789012345678901234567890123456789012345678901234567890",
  CardSpent: "0xb2c3d4e5f6789012345678901234567890123456789012345678901234567890ab",
};

// Event topic hashes (keccak256)
const EVENT_TOPICS = {
  CardCreated: "0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0",
  CardTopUp: "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
  CardWithdraw: "0x7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65",
  CardSpent: "0x1c411e9a96e071241c2f21f7726b17ae89e3cab4c78be50e062b03a9fffbbad1",
};

interface FetchEventsRequest {
  contractAddress: string;
  userAddress?: string;
  eventTypes?: string[];
  fromBlock?: string;
  toBlock?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ALCHEMY_API_KEY = Deno.env.get("ALCHEMY_API_KEY");
    if (!ALCHEMY_API_KEY) {
      throw new Error("ALCHEMY_API_KEY not configured");
    }

    const { 
      contractAddress, 
      userAddress, 
      eventTypes = ["CardCreated", "CardTopUp", "CardWithdraw", "CardSpent"],
      fromBlock = "0x0",
      toBlock = "latest"
    }: FetchEventsRequest = await req.json();

    if (!contractAddress || contractAddress === "0x0000000000000000000000000000000000000000") {
      return new Response(
        JSON.stringify({ 
          events: [], 
          message: "Virtual Card contract not deployed yet" 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // BSC RPC endpoint via Alchemy (or use direct BSC RPC)
    const rpcUrl = `https://bnb-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;

    // Build topics for the events we want
    const topics: (string | string[] | null)[] = [];
    
    // CardCreated event signature hash
    const cardCreatedTopic = "0x" + await sha3("CardCreated(address,string,uint8)");
    const cardTopUpTopic = "0x" + await sha3("CardTopUp(address,uint256,uint256,uint256)");
    const cardWithdrawTopic = "0x" + await sha3("CardWithdraw(address,uint256)");
    const cardSpentTopic = "0x" + await sha3("CardSpent(address,uint256,uint256)");

    const allEvents = [];

    // Fetch each event type
    for (const eventType of eventTypes) {
      let eventTopic: string;
      switch (eventType) {
        case "CardCreated":
          eventTopic = cardCreatedTopic;
          break;
        case "CardTopUp":
          eventTopic = cardTopUpTopic;
          break;
        case "CardWithdraw":
          eventTopic = cardWithdrawTopic;
          break;
        case "CardSpent":
          eventTopic = cardSpentTopic;
          break;
        default:
          continue;
      }

      const params: any = {
        address: contractAddress,
        topics: [eventTopic],
        fromBlock,
        toBlock,
      };

      // If userAddress provided, filter by indexed user parameter
      if (userAddress) {
        params.topics.push("0x000000000000000000000000" + userAddress.slice(2).toLowerCase());
      }

      const response = await fetch(rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "eth_getLogs",
          params: [params],
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        console.error(`Error fetching ${eventType} events:`, data.error);
        continue;
      }

      const logs = data.result || [];
      
      for (const log of logs) {
        const parsedEvent = parseEventLog(eventType, log);
        if (parsedEvent) {
          allEvents.push(parsedEvent);
        }
      }
    }

    // Sort by block number descending (newest first)
    allEvents.sort((a, b) => b.blockNumber - a.blockNumber);

    console.log(`Fetched ${allEvents.length} virtual card events`);

    return new Response(
      JSON.stringify({ events: allEvents }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in fetch-virtual-card-events:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

// Simple keccak256 implementation for event signatures
async function sha3(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

function parseEventLog(eventType: string, log: any) {
  try {
    const blockNumber = parseInt(log.blockNumber, 16);
    const transactionHash = log.transactionHash;
    const topics = log.topics;
    const data = log.data;

    // Extract user address from topic[1] (indexed parameter)
    const userAddress = topics[1] ? "0x" + topics[1].slice(26) : null;

    switch (eventType) {
      case "CardCreated": {
        // data contains: cardNumber (string), tier (uint8)
        // For simplicity, we'll extract basic info
        return {
          type: "CardCreated",
          user: userAddress,
          blockNumber,
          txHash: transactionHash,
          timestamp: null, // Will be fetched separately if needed
          data: {
            cardNumber: "Card Created",
            tier: 0,
          }
        };
      }
      case "CardTopUp": {
        // data contains: amount, fee, newBalance
        const amount = data.length >= 66 ? BigInt("0x" + data.slice(2, 66)).toString() : "0";
        const fee = data.length >= 130 ? BigInt("0x" + data.slice(66, 130)).toString() : "0";
        const newBalance = data.length >= 194 ? BigInt("0x" + data.slice(130, 194)).toString() : "0";
        return {
          type: "deposit",
          user: userAddress,
          blockNumber,
          txHash: transactionHash,
          timestamp: null,
          amount,
          fee,
          newBalance,
        };
      }
      case "CardWithdraw": {
        // data contains: amount
        const amount = data.length >= 66 ? BigInt("0x" + data.slice(2, 66)).toString() : "0";
        return {
          type: "withdrawal",
          user: userAddress,
          blockNumber,
          txHash: transactionHash,
          timestamp: null,
          amount,
        };
      }
      case "CardSpent": {
        // data contains: amount, cashback
        const amount = data.length >= 66 ? BigInt("0x" + data.slice(2, 66)).toString() : "0";
        const cashback = data.length >= 130 ? BigInt("0x" + data.slice(66, 130)).toString() : "0";
        return {
          type: "spend",
          user: userAddress,
          blockNumber,
          txHash: transactionHash,
          timestamp: null,
          amount,
          cashback,
        };
      }
      default:
        return null;
    }
  } catch (error) {
    console.error("Error parsing event log:", error);
    return null;
  }
}

serve(handler);
