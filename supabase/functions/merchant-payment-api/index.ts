import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

interface PaymentLinkRequest {
  amount: number;
  currency: 'PM' | 'USDT' | 'USDC' | 'BNB' | 'PYUSD';
  description?: string;
  orderId?: string;
  expiresIn?: number; // seconds
  webhookUrl?: string;
  redirectUrl?: string;
  metadata?: Record<string, unknown>;
}

interface PaymentLink {
  id: string;
  merchantId: string;
  amount: number;
  currency: string;
  description: string;
  orderId: string;
  status: 'pending' | 'paid' | 'expired' | 'cancelled';
  paymentUrl: string;
  qrCode: string;
  expiresAt: string;
  webhookUrl?: string;
  redirectUrl?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  paidAt?: string;
  transactionHash?: string;
}

interface WebhookPayload {
  event: 'payment.completed' | 'payment.expired' | 'payment.cancelled';
  paymentLinkId: string;
  merchantId: string;
  amount: number;
  currency: string;
  orderId?: string;
  transactionHash?: string;
  paidAt?: string;
  metadata?: Record<string, unknown>;
  signature: string;
}

// In-memory storage for demo (in production, use database)
const paymentLinks = new Map<string, PaymentLink>();
const merchantApiKeys = new Map<string, string>();

// Generate unique ID
const generateId = () => crypto.randomUUID();

// Generate HMAC signature for webhook
const generateSignature = async (payload: string, secret: string): Promise<string> => {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

// Send webhook notification
const sendWebhook = async (url: string, payload: WebhookPayload) => {
  try {
    console.log(`Sending webhook to ${url}:`, payload);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-PM-Signature': payload.signature,
        'X-PM-Event': payload.event,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`Webhook delivery failed: ${response.status} ${response.statusText}`);
      // Queue for retry (in production, implement retry logic)
    } else {
      console.log(`Webhook delivered successfully to ${url}`);
    }
  } catch (error) {
    console.error('Webhook delivery error:', error);
    // Queue for retry
  }
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname.replace('/merchant-payment-api', '');
  
  try {
    // API Key authentication
    const apiKey = req.headers.get('x-api-key');
    
    // Routes that don't require API key
    const publicRoutes = ['/generate-api-key', '/verify-payment', '/payment'];
    const isPublicRoute = publicRoutes.some(route => path.startsWith(route));
    
    let merchantId = '';
    
    if (!isPublicRoute) {
      if (!apiKey) {
        return new Response(
          JSON.stringify({ error: 'API key required', code: 'UNAUTHORIZED' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Validate API key
      const storedMerchantId = merchantApiKeys.get(apiKey);
      if (!storedMerchantId) {
        return new Response(
          JSON.stringify({ error: 'Invalid API key', code: 'INVALID_API_KEY' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      merchantId = storedMerchantId;
    }

    // Route: Generate API Key
    if (path === '/generate-api-key' && req.method === 'POST') {
      const { walletAddress, merchantName } = await req.json();
      
      if (!walletAddress || !merchantName) {
        return new Response(
          JSON.stringify({ error: 'walletAddress and merchantName required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const newApiKey = `pm_live_${generateId().replace(/-/g, '')}`;
      const newMerchantId = generateId();
      
      merchantApiKeys.set(newApiKey, newMerchantId);
      
      console.log(`Generated API key for merchant ${merchantName} (${walletAddress})`);

      return new Response(
        JSON.stringify({
          success: true,
          apiKey: newApiKey,
          merchantId: newMerchantId,
          message: 'Store this API key securely. It will only be shown once.',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Route: Create Payment Link
    if (path === '/create-payment-link' && req.method === 'POST') {
      const body: PaymentLinkRequest = await req.json();
      
      if (!body.amount || body.amount <= 0) {
        return new Response(
          JSON.stringify({ error: 'Valid amount is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const validCurrencies = ['PM', 'USDT', 'USDC', 'BNB', 'PYUSD'];
      if (!validCurrencies.includes(body.currency)) {
        return new Response(
          JSON.stringify({ error: `Invalid currency. Valid options: ${validCurrencies.join(', ')}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const paymentLinkId = generateId();
      const expiresIn = body.expiresIn || 3600; // Default 1 hour
      const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();
      
      const baseUrl = Deno.env.get('SITE_URL') || 'https://perfectmoney-pay.lovable.app';
      const paymentUrl = `${baseUrl}/pay/${paymentLinkId}`;
      const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(paymentUrl)}`;

      const paymentLink: PaymentLink = {
        id: paymentLinkId,
        merchantId,
        amount: body.amount,
        currency: body.currency,
        description: body.description || '',
        orderId: body.orderId || generateId(),
        status: 'pending',
        paymentUrl,
        qrCode,
        expiresAt,
        webhookUrl: body.webhookUrl,
        redirectUrl: body.redirectUrl,
        metadata: body.metadata,
        createdAt: new Date().toISOString(),
      };

      paymentLinks.set(paymentLinkId, paymentLink);
      
      console.log(`Created payment link ${paymentLinkId} for ${body.amount} ${body.currency}`);

      return new Response(
        JSON.stringify({
          success: true,
          paymentLink: {
            id: paymentLink.id,
            paymentUrl: paymentLink.paymentUrl,
            qrCode: paymentLink.qrCode,
            amount: paymentLink.amount,
            currency: paymentLink.currency,
            expiresAt: paymentLink.expiresAt,
            orderId: paymentLink.orderId,
          },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Route: Get Payment Link Status
    if (path.startsWith('/payment/') && req.method === 'GET') {
      const paymentLinkId = path.replace('/payment/', '');
      const paymentLink = paymentLinks.get(paymentLinkId);
      
      if (!paymentLink) {
        return new Response(
          JSON.stringify({ error: 'Payment link not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if expired
      if (paymentLink.status === 'pending' && new Date(paymentLink.expiresAt) < new Date()) {
        paymentLink.status = 'expired';
        paymentLinks.set(paymentLinkId, paymentLink);
        
        // Send webhook for expiration
        if (paymentLink.webhookUrl) {
          const webhookPayload: WebhookPayload = {
            event: 'payment.expired',
            paymentLinkId: paymentLink.id,
            merchantId: paymentLink.merchantId,
            amount: paymentLink.amount,
            currency: paymentLink.currency,
            orderId: paymentLink.orderId,
            metadata: paymentLink.metadata,
            signature: await generateSignature(JSON.stringify({ id: paymentLink.id, event: 'payment.expired' }), 'webhook_secret'),
          };
          sendWebhook(paymentLink.webhookUrl, webhookPayload);
        }
      }

      return new Response(
        JSON.stringify({
          id: paymentLink.id,
          status: paymentLink.status,
          amount: paymentLink.amount,
          currency: paymentLink.currency,
          description: paymentLink.description,
          expiresAt: paymentLink.expiresAt,
          paidAt: paymentLink.paidAt,
          transactionHash: paymentLink.transactionHash,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Route: Verify/Confirm Payment (called when payment is detected on-chain)
    if (path === '/verify-payment' && req.method === 'POST') {
      const { paymentLinkId, transactionHash, paidAmount, paidCurrency } = await req.json();
      
      const paymentLink = paymentLinks.get(paymentLinkId);
      
      if (!paymentLink) {
        return new Response(
          JSON.stringify({ error: 'Payment link not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (paymentLink.status !== 'pending') {
        return new Response(
          JSON.stringify({ error: `Payment already ${paymentLink.status}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verify amount matches
      if (paidAmount < paymentLink.amount) {
        return new Response(
          JSON.stringify({ error: 'Insufficient payment amount' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update payment status
      paymentLink.status = 'paid';
      paymentLink.paidAt = new Date().toISOString();
      paymentLink.transactionHash = transactionHash;
      paymentLinks.set(paymentLinkId, paymentLink);
      
      console.log(`Payment ${paymentLinkId} confirmed with tx ${transactionHash}`);

      // Send webhook notification
      if (paymentLink.webhookUrl) {
        const webhookPayload: WebhookPayload = {
          event: 'payment.completed',
          paymentLinkId: paymentLink.id,
          merchantId: paymentLink.merchantId,
          amount: paymentLink.amount,
          currency: paymentLink.currency,
          orderId: paymentLink.orderId,
          transactionHash,
          paidAt: paymentLink.paidAt,
          metadata: paymentLink.metadata,
          signature: await generateSignature(
            JSON.stringify({ id: paymentLink.id, event: 'payment.completed', transactionHash }),
            'webhook_secret'
          ),
        };
        
        // Fire and forget webhook
        sendWebhook(paymentLink.webhookUrl, webhookPayload);
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Payment verified successfully',
          paymentLink: {
            id: paymentLink.id,
            status: paymentLink.status,
            paidAt: paymentLink.paidAt,
            transactionHash: paymentLink.transactionHash,
            redirectUrl: paymentLink.redirectUrl,
          },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Route: List Merchant Payment Links
    if (path === '/payment-links' && req.method === 'GET') {
      const status = url.searchParams.get('status');
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const offset = parseInt(url.searchParams.get('offset') || '0');
      
      let merchantPayments = Array.from(paymentLinks.values())
        .filter(p => p.merchantId === merchantId);
      
      if (status) {
        merchantPayments = merchantPayments.filter(p => p.status === status);
      }
      
      const total = merchantPayments.length;
      merchantPayments = merchantPayments
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(offset, offset + limit);

      return new Response(
        JSON.stringify({
          data: merchantPayments.map(p => ({
            id: p.id,
            amount: p.amount,
            currency: p.currency,
            status: p.status,
            orderId: p.orderId,
            createdAt: p.createdAt,
            paidAt: p.paidAt,
          })),
          pagination: { total, limit, offset },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Route: Cancel Payment Link
    if (path.startsWith('/cancel/') && req.method === 'POST') {
      const paymentLinkId = path.replace('/cancel/', '');
      const paymentLink = paymentLinks.get(paymentLinkId);
      
      if (!paymentLink) {
        return new Response(
          JSON.stringify({ error: 'Payment link not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (paymentLink.merchantId !== merchantId) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (paymentLink.status !== 'pending') {
        return new Response(
          JSON.stringify({ error: `Cannot cancel ${paymentLink.status} payment` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      paymentLink.status = 'cancelled';
      paymentLinks.set(paymentLinkId, paymentLink);

      // Send webhook
      if (paymentLink.webhookUrl) {
        const webhookPayload: WebhookPayload = {
          event: 'payment.cancelled',
          paymentLinkId: paymentLink.id,
          merchantId: paymentLink.merchantId,
          amount: paymentLink.amount,
          currency: paymentLink.currency,
          orderId: paymentLink.orderId,
          metadata: paymentLink.metadata,
          signature: await generateSignature(JSON.stringify({ id: paymentLink.id, event: 'payment.cancelled' }), 'webhook_secret'),
        };
        sendWebhook(paymentLink.webhookUrl, webhookPayload);
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Payment link cancelled' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Route: API Documentation
    if (path === '/docs' && req.method === 'GET') {
      const docs = {
        name: 'PM Merchant Payment API',
        version: '1.0.0',
        description: 'API for creating and managing payment links with webhook notifications',
        baseUrl: `${url.origin}/merchant-payment-api`,
        authentication: {
          type: 'API Key',
          header: 'x-api-key',
          description: 'Include your API key in the x-api-key header',
        },
        endpoints: [
          {
            method: 'POST',
            path: '/generate-api-key',
            description: 'Generate a new API key for your merchant account',
            body: { walletAddress: 'string', merchantName: 'string' },
            authentication: false,
          },
          {
            method: 'POST',
            path: '/create-payment-link',
            description: 'Create a new payment link',
            body: {
              amount: 'number (required)',
              currency: 'PM | USDT | USDC | BNB | PYUSD (required)',
              description: 'string (optional)',
              orderId: 'string (optional)',
              expiresIn: 'number - seconds (optional, default: 3600)',
              webhookUrl: 'string - URL for payment notifications (optional)',
              redirectUrl: 'string - URL to redirect after payment (optional)',
              metadata: 'object (optional)',
            },
          },
          {
            method: 'GET',
            path: '/payment/:id',
            description: 'Get payment link status',
            authentication: false,
          },
          {
            method: 'GET',
            path: '/payment-links',
            description: 'List all payment links',
            queryParams: { status: 'pending | paid | expired | cancelled', limit: 'number', offset: 'number' },
          },
          {
            method: 'POST',
            path: '/cancel/:id',
            description: 'Cancel a pending payment link',
          },
        ],
        webhookEvents: [
          { event: 'payment.completed', description: 'Sent when payment is confirmed on-chain' },
          { event: 'payment.expired', description: 'Sent when payment link expires' },
          { event: 'payment.cancelled', description: 'Sent when payment is cancelled' },
        ],
        webhookPayload: {
          event: 'string',
          paymentLinkId: 'string',
          merchantId: 'string',
          amount: 'number',
          currency: 'string',
          orderId: 'string | undefined',
          transactionHash: 'string | undefined',
          paidAt: 'string | undefined',
          metadata: 'object | undefined',
          signature: 'string - HMAC-SHA256 signature',
        },
      };

      return new Response(JSON.stringify(docs, null, 2), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 404 for unknown routes
    return new Response(
      JSON.stringify({ error: 'Not found', availableEndpoints: ['/docs', '/create-payment-link', '/payment/:id', '/payment-links'] }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
