import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/Header";
import { TradingViewTicker } from "@/components/TradingViewTicker";
import { HeroBanner } from "@/components/HeroBanner";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Footer } from "@/components/Footer";
import { ArrowLeft, Copy, Code, Globe, Key, Webhook, CheckCircle, Shield, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const MerchantAPIDocs = () => {
  const [activeLanguage, setActiveLanguage] = useState("javascript");

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard!");
  };

  const codeExamples = {
    javascript: {
      createPaymentLink: `const response = await fetch('https://ihuqvxvcqnrdxphqxpqr.supabase.co/functions/v1/merchant-payment-api/create-payment-link', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'pm_live_your_api_key_here'
  },
  body: JSON.stringify({
    amount: 100,
    currency: 'PM',
    description: 'Order #12345',
    orderId: 'order_12345',
    webhookUrl: 'https://yoursite.com/webhook',
    redirectUrl: 'https://yoursite.com/thank-you',
    expiresIn: 3600, // 1 hour
    metadata: {
      customerId: 'cust_123',
      productId: 'prod_456'
    }
  })
});

const data = await response.json();
console.log(data.paymentLink.paymentUrl);`,
      verifyWebhook: `const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// Express.js webhook handler
app.post('/webhook', express.json(), (req, res) => {
  const signature = req.headers['x-pm-signature'];
  const event = req.headers['x-pm-event'];
  
  if (!verifyWebhookSignature(req.body, signature, 'your_webhook_secret')) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  switch (event) {
    case 'payment.completed':
      // Handle successful payment
      console.log('Payment completed:', req.body.transactionHash);
      break;
    case 'payment.expired':
      // Handle expired payment
      break;
    case 'payment.cancelled':
      // Handle cancelled payment
      break;
  }
  
  res.status(200).json({ received: true });
});`,
    },
    python: {
      createPaymentLink: `import requests

response = requests.post(
    'https://ihuqvxvcqnrdxphqxpqr.supabase.co/functions/v1/merchant-payment-api/create-payment-link',
    headers={
        'Content-Type': 'application/json',
        'x-api-key': 'pm_live_your_api_key_here'
    },
    json={
        'amount': 100,
        'currency': 'PM',
        'description': 'Order #12345',
        'orderId': 'order_12345',
        'webhookUrl': 'https://yoursite.com/webhook',
        'redirectUrl': 'https://yoursite.com/thank-you',
        'expiresIn': 3600,
        'metadata': {
            'customerId': 'cust_123',
            'productId': 'prod_456'
        }
    }
)

data = response.json()
print(data['paymentLink']['paymentUrl'])`,
      verifyWebhook: `import hmac
import hashlib
from flask import Flask, request, jsonify

app = Flask(__name__)

def verify_webhook_signature(payload, signature, secret):
    expected = hmac.new(
        secret.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(signature, expected)

@app.route('/webhook', methods=['POST'])
def webhook():
    signature = request.headers.get('X-PM-Signature')
    event = request.headers.get('X-PM-Event')
    
    if not verify_webhook_signature(
        request.get_data(as_text=True),
        signature,
        'your_webhook_secret'
    ):
        return jsonify({'error': 'Invalid signature'}), 401
    
    data = request.json
    
    if event == 'payment.completed':
        print(f"Payment completed: {data['transactionHash']}")
    elif event == 'payment.expired':
        print("Payment expired")
    elif event == 'payment.cancelled':
        print("Payment cancelled")
    
    return jsonify({'received': True}), 200`,
    },
    php: {
      createPaymentLink: `<?php

$apiKey = 'pm_live_your_api_key_here';
$url = 'https://ihuqvxvcqnrdxphqxpqr.supabase.co/functions/v1/merchant-payment-api/create-payment-link';

$data = [
    'amount' => 100,
    'currency' => 'PM',
    'description' => 'Order #12345',
    'orderId' => 'order_12345',
    'webhookUrl' => 'https://yoursite.com/webhook',
    'redirectUrl' => 'https://yoursite.com/thank-you',
    'expiresIn' => 3600,
    'metadata' => [
        'customerId' => 'cust_123',
        'productId' => 'prod_456'
    ]
];

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'x-api-key: ' . $apiKey
    ],
    CURLOPT_POSTFIELDS => json_encode($data)
]);

$response = curl_exec($ch);
$result = json_decode($response, true);

echo $result['paymentLink']['paymentUrl'];`,
      verifyWebhook: `<?php

function verifyWebhookSignature($payload, $signature, $secret) {
    $expectedSignature = hash_hmac('sha256', $payload, $secret);
    return hash_equals($expectedSignature, $signature);
}

// Webhook handler
$payload = file_get_contents('php://input');
$signature = $_SERVER['HTTP_X_PM_SIGNATURE'] ?? '';
$event = $_SERVER['HTTP_X_PM_EVENT'] ?? '';
$secret = 'your_webhook_secret';

if (!verifyWebhookSignature($payload, $signature, $secret)) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid signature']);
    exit;
}

$data = json_decode($payload, true);

switch ($event) {
    case 'payment.completed':
        // Handle successful payment
        error_log('Payment completed: ' . $data['transactionHash']);
        break;
    case 'payment.expired':
        // Handle expired payment
        break;
    case 'payment.cancelled':
        // Handle cancelled payment
        break;
}

http_response_code(200);
echo json_encode(['received' => true]);`,
    },
    curl: {
      createPaymentLink: `curl -X POST 'https://ihuqvxvcqnrdxphqxpqr.supabase.co/functions/v1/merchant-payment-api/create-payment-link' \\
  -H 'Content-Type: application/json' \\
  -H 'x-api-key: pm_live_your_api_key_here' \\
  -d '{
    "amount": 100,
    "currency": "PM",
    "description": "Order #12345",
    "orderId": "order_12345",
    "webhookUrl": "https://yoursite.com/webhook",
    "redirectUrl": "https://yoursite.com/thank-you",
    "expiresIn": 3600
  }'`,
      verifyWebhook: `# Test webhook endpoint
curl -X POST 'https://yoursite.com/webhook' \\
  -H 'Content-Type: application/json' \\
  -H 'X-PM-Signature: your_signature_here' \\
  -H 'X-PM-Event: payment.completed' \\
  -d '{
    "event": "payment.completed",
    "paymentLinkId": "abc123",
    "amount": 100,
    "currency": "PM",
    "transactionHash": "0x..."
  }'`,
    },
  };

  const endpoints = [
    { method: "POST", path: "/generate-api-key", description: "Generate a new API key", auth: false },
    { method: "POST", path: "/create-payment-link", description: "Create a new payment link", auth: true },
    { method: "GET", path: "/payment/:id", description: "Get payment link status", auth: false },
    { method: "GET", path: "/payment-links", description: "List all payment links", auth: true },
    { method: "POST", path: "/cancel/:id", description: "Cancel a pending payment", auth: true },
    { method: "POST", path: "/verify-payment", description: "Verify payment completion", auth: false },
  ];

  const webhookEvents = [
    { event: "payment.completed", description: "Sent when payment is confirmed on-chain", payload: { transactionHash: "0x...", paidAt: "ISO timestamp" } },
    { event: "payment.expired", description: "Sent when payment link expires", payload: {} },
    { event: "payment.cancelled", description: "Sent when payment is cancelled", payload: {} },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 lg:pb-0">
      <Header />
      <TradingViewTicker />
      <HeroBanner 
        title="API Documentation" 
        subtitle="Integrate PM payments into your application"
      />
      
      <main className="container mx-auto px-4 pt-12 pb-12 flex-1">
        <Link to="/dashboard/merchant" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 text-sm">
          <ArrowLeft className="h-4 w-4" />
          Back to Merchant Dashboard
        </Link>

        <div className="max-w-5xl mx-auto space-y-8">
          {/* Quick Start */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Quick Start</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-muted/50 border">
                <div className="flex items-center gap-2 mb-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">1</span>
                  <h3 className="font-semibold">Get API Key</h3>
                </div>
                <p className="text-sm text-muted-foreground">Generate your API key from the merchant dashboard</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 border">
                <div className="flex items-center gap-2 mb-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">2</span>
                  <h3 className="font-semibold">Create Payment Link</h3>
                </div>
                <p className="text-sm text-muted-foreground">Call the API to create payment links for your customers</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 border">
                <div className="flex items-center gap-2 mb-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">3</span>
                  <h3 className="font-semibold">Handle Webhooks</h3>
                </div>
                <p className="text-sm text-muted-foreground">Receive real-time notifications when payments complete</p>
              </div>
            </div>
          </Card>

          {/* Authentication */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Key className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-bold">Authentication</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              Include your API key in the <code className="px-2 py-1 bg-muted rounded text-sm">x-api-key</code> header for all authenticated requests.
            </p>
            <div className="p-4 bg-muted/50 rounded-lg font-mono text-sm">
              <span className="text-muted-foreground">Header: </span>
              <span className="text-primary">x-api-key: pm_live_your_api_key_here</span>
            </div>
          </Card>

          {/* Endpoints */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-bold">API Endpoints</h2>
            </div>
            <div className="space-y-3">
              {endpoints.map((endpoint, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 border">
                  <Badge variant={endpoint.method === 'GET' ? 'secondary' : 'default'} className="w-16 justify-center">
                    {endpoint.method}
                  </Badge>
                  <code className="font-mono text-sm flex-1">{endpoint.path}</code>
                  <span className="text-sm text-muted-foreground">{endpoint.description}</span>
                  {endpoint.auth && (
                    <Badge variant="outline" className="text-xs">
                      <Key className="h-3 w-3 mr-1" />
                      Auth
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Code Examples */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Code className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-bold">Code Examples</h2>
            </div>

            <Tabs defaultValue="javascript" onValueChange={setActiveLanguage}>
              <TabsList className="mb-4">
                <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                <TabsTrigger value="python">Python</TabsTrigger>
                <TabsTrigger value="php">PHP</TabsTrigger>
                <TabsTrigger value="curl">cURL</TabsTrigger>
              </TabsList>

              {Object.entries(codeExamples).map(([lang, examples]) => (
                <TabsContent key={lang} value={lang} className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">Create Payment Link</h3>
                      <Button variant="ghost" size="sm" onClick={() => copyCode(examples.createPaymentLink)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <pre className="p-4 bg-muted/50 rounded-lg overflow-x-auto text-sm">
                      <code>{examples.createPaymentLink}</code>
                    </pre>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">Verify Webhook Signature</h3>
                      <Button variant="ghost" size="sm" onClick={() => copyCode(examples.verifyWebhook)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <pre className="p-4 bg-muted/50 rounded-lg overflow-x-auto text-sm">
                      <code>{examples.verifyWebhook}</code>
                    </pre>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </Card>

          {/* Webhook Events */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Webhook className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-bold">Webhook Events</h2>
            </div>
            <div className="space-y-4">
              {webhookEvents.map((event, i) => (
                <div key={i} className="p-4 rounded-lg bg-muted/50 border">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{event.event}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
                  <div className="text-xs font-mono bg-background p-2 rounded">
                    Additional payload: {JSON.stringify(event.payload)}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Webhook Security</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Always verify the <code className="px-1 py-0.5 bg-muted rounded">X-PM-Signature</code> header 
                using HMAC-SHA256 to ensure webhooks are from PM and haven't been tampered with.
              </p>
            </div>
          </Card>

          {/* Supported Currencies */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Supported Currencies</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {['PM', 'USDT', 'USDC', 'BNB', 'PYUSD'].map(currency => (
                <div key={currency} className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="font-medium">{currency}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default MerchantAPIDocs;
