import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createHmac } from "https://deno.land/std@0.177.0/node/crypto.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-signature, x-webhook-timestamp",
};

interface PaymentWebhookPayload {
  event: "payment.created" | "payment.completed" | "payment.failed" | "payment.expired" | "payment.refunded";
  payment_id: string;
  merchant_id: string;
  amount: string;
  currency: string;
  order_id?: string;
  customer_email?: string;
  tx_hash?: string;
  status: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

interface WebhookSubscription {
  merchant_id: string;
  callback_url: string;
  secret_key: string;
  events: string[];
  is_active: boolean;
}

// In-memory store for demo (in production, use a database)
const webhookSubscriptions: Map<string, WebhookSubscription> = new Map();
const paymentEvents: Map<string, PaymentWebhookPayload[]> = new Map();

const verifySignature = (payload: string, signature: string, secret: string): boolean => {
  const expectedSignature = createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  return signature === `sha256=${expectedSignature}`;
};

const generateSignature = (payload: string, secret: string): string => {
  const signature = createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  return `sha256=${signature}`;
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Payment webhook function called:", req.method);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname.replace("/payment-webhook", "");

  try {
    // POST /subscribe - Register a webhook subscription
    if (req.method === "POST" && path === "/subscribe") {
      const body = await req.json();
      const { merchant_id, callback_url, events } = body;

      if (!merchant_id || !callback_url) {
        return new Response(
          JSON.stringify({ error: "merchant_id and callback_url are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Generate a secret key for this subscription
      const secret_key = `whsec_${crypto.randomUUID().replace(/-/g, "")}`;

      const subscription: WebhookSubscription = {
        merchant_id,
        callback_url,
        secret_key,
        events: events || ["payment.completed", "payment.failed"],
        is_active: true,
      };

      webhookSubscriptions.set(merchant_id, subscription);

      console.log(`Webhook subscription created for merchant: ${merchant_id}`);

      return new Response(
        JSON.stringify({
          success: true,
          subscription_id: merchant_id,
          secret_key,
          message: "Webhook subscription created. Save your secret key securely!",
        }),
        { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // POST /trigger - Trigger a payment event (simulates payment status update)
    if (req.method === "POST" && path === "/trigger") {
      const body = await req.json();
      const { merchant_id, payment_id, event, amount, currency, order_id, customer_email, tx_hash } = body;

      if (!merchant_id || !payment_id || !event) {
        return new Response(
          JSON.stringify({ error: "merchant_id, payment_id, and event are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const payload: PaymentWebhookPayload = {
        event,
        payment_id,
        merchant_id,
        amount: amount || "0",
        currency: currency || "PM",
        order_id,
        customer_email,
        tx_hash,
        status: event.split(".")[1],
        timestamp: new Date().toISOString(),
      };

      // Store event
      const merchantEvents = paymentEvents.get(merchant_id) || [];
      merchantEvents.push(payload);
      paymentEvents.set(merchant_id, merchantEvents);

      // Send webhook to subscriber if exists
      const subscription = webhookSubscriptions.get(merchant_id);
      let webhookSent = false;

      if (subscription && subscription.is_active && subscription.events.includes(event)) {
        const payloadString = JSON.stringify(payload);
        const signature = generateSignature(payloadString, subscription.secret_key);
        const timestamp = Date.now().toString();

        try {
          const webhookResponse = await fetch(subscription.callback_url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Webhook-Signature": signature,
              "X-Webhook-Timestamp": timestamp,
              "X-Webhook-Event": event,
            },
            body: payloadString,
          });

          webhookSent = webhookResponse.ok;
          console.log(`Webhook sent to ${subscription.callback_url}: ${webhookSent ? "success" : "failed"}`);
        } catch (error) {
          console.error("Failed to send webhook:", error);
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          event_id: `evt_${crypto.randomUUID().slice(0, 8)}`,
          payload,
          webhook_sent: webhookSent,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // GET /events/:merchant_id - Get payment events for a merchant
    if (req.method === "GET" && path.startsWith("/events/")) {
      const merchant_id = path.replace("/events/", "");
      const events = paymentEvents.get(merchant_id) || [];

      return new Response(
        JSON.stringify({
          success: true,
          merchant_id,
          events,
          total: events.length,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // POST /verify - Verify a webhook signature
    if (req.method === "POST" && path === "/verify") {
      const signature = req.headers.get("x-webhook-signature");
      const body = await req.text();
      const { secret } = JSON.parse(new URLSearchParams(url.search).get("data") || "{}");

      if (!signature || !secret) {
        return new Response(
          JSON.stringify({ valid: false, error: "Missing signature or secret" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const isValid = verifySignature(body, signature, secret);

      return new Response(
        JSON.stringify({ valid: isValid }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // GET /status - Health check
    if (req.method === "GET" && (path === "/status" || path === "" || path === "/")) {
      return new Response(
        JSON.stringify({
          status: "healthy",
          version: "1.0.0",
          supported_events: [
            "payment.created",
            "payment.completed",
            "payment.failed",
            "payment.expired",
            "payment.refunded",
          ],
          endpoints: {
            subscribe: "POST /subscribe",
            trigger: "POST /trigger",
            events: "GET /events/:merchant_id",
            verify: "POST /verify",
          },
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fallback - receive webhook from external source
    if (req.method === "POST") {
      const signature = req.headers.get("x-webhook-signature");
      const timestamp = req.headers.get("x-webhook-timestamp");
      const body = await req.json();

      console.log("Received webhook payload:", JSON.stringify(body));
      console.log("Signature:", signature);
      console.log("Timestamp:", timestamp);

      // Process the incoming webhook
      if (body.payment_id && body.event) {
        const merchantEvents = paymentEvents.get(body.merchant_id || "unknown") || [];
        merchantEvents.push({
          ...body,
          timestamp: body.timestamp || new Date().toISOString(),
        });
        paymentEvents.set(body.merchant_id || "unknown", merchantEvents);
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Webhook received and processed",
          received_at: new Date().toISOString(),
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Not found" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
