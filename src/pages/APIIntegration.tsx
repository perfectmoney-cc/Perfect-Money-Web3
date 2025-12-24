import { Header } from "@/components/Header";
import { TradingViewTicker } from "@/components/TradingViewTicker";
import { HeroBanner } from "@/components/HeroBanner";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Code, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const APIIntegration = () => {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const copyToClipboard = (text: string, endpoint: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(endpoint);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const endpoints = [
    {
      name: "Create Payment",
      method: "POST",
      endpoint: "/api/v1/payment/create",
      description: "Create a new payment request for your customer",
      request: {
        merchant_id: "your_merchant_id",
        amount: "100.00",
        currency: "PM",
        order_id: "ORDER-12345",
        callback_url: "https://yoursite.com/callback",
        return_url: "https://yoursite.com/success"
      },
      response: {
        status: "success",
        payment_id: "PMT-abc123xyz",
        payment_url: "https://perfectmoney.cc/pay/PMT-abc123xyz",
        expires_at: "2024-01-15T12:00:00Z"
      }
    },
    {
      name: "Check Payment Status",
      method: "GET",
      endpoint: "/api/v1/payment/status/:payment_id",
      description: "Check the status of an existing payment",
      request: {
        payment_id: "PMT-abc123xyz"
      },
      response: {
        status: "completed",
        payment_id: "PMT-abc123xyz",
        amount: "100.00",
        currency: "PM",
        transaction_hash: "0x1234567890abcdef",
        completed_at: "2024-01-15T11:45:00Z"
      }
    },
    {
      name: "Verify Callback",
      method: "POST",
      endpoint: "/api/v1/payment/verify",
      description: "Verify the authenticity of a payment callback",
      request: {
        payment_id: "PMT-abc123xyz",
        signature: "sha256_signature_here",
        timestamp: "2024-01-15T11:45:00Z"
      },
      response: {
        valid: true,
        payment_id: "PMT-abc123xyz",
        status: "completed"
      }
    },
    {
      name: "Get Balance",
      method: "GET",
      endpoint: "/api/v1/merchant/balance",
      description: "Get your merchant account balance",
      request: {
        merchant_id: "your_merchant_id"
      },
      response: {
        balance: "1500.50",
        currency: "PM",
        pending: "250.00",
        available: "1250.50"
      }
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <TradingViewTicker />
      <HeroBanner 
        title="API Integration" 
        subtitle="Complete merchant payment API documentation for PerfectMoney integration"
      />
      
      <main className="container mx-auto px-4 pt-12 pb-12">
        <div className="max-w-6xl mx-auto">
          {/* Getting Started */}
          <Card className="p-8 mb-12 bg-card/50 backdrop-blur-sm border-primary/20">
            <h2 className="text-3xl font-bold mb-6 text-primary">Getting Started</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                The PerfectMoney Merchant API allows you to integrate cryptocurrency payments into your website or application. 
                Accept PM tokens seamlessly with our RESTful API.
              </p>
              <div className="bg-background/50 p-6 rounded-lg border border-primary/20">
                <h3 className="text-xl font-bold text-foreground mb-3">Base URL</h3>
                <div className="flex items-center justify-between gap-4">
                  <code className="text-primary">https://api.perfectmoney.cc/v1</code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard("https://api.perfectmoney.cc/v1", "base-url")}
                  >
                    {copiedEndpoint === "base-url" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="bg-background/50 p-6 rounded-lg border border-primary/20">
                <h3 className="text-xl font-bold text-foreground mb-3">Authentication</h3>
                <p className="mb-3">All API requests require authentication using your API key in the header:</p>
                <code className="block bg-black/50 p-4 rounded text-sm text-primary">
                  Authorization: Bearer YOUR_API_KEY
                </code>
              </div>
            </div>
          </Card>

          {/* API Endpoints */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-center mb-8">API Endpoints</h2>
            {endpoints.map((endpoint, index) => (
              <Card key={index} className="p-8 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded text-sm font-bold ${
                        endpoint.method === "POST" ? "bg-green-500/20 text-green-500" : "bg-blue-500/20 text-blue-500"
                      }`}>
                        {endpoint.method}
                      </span>
                      <h3 className="text-2xl font-bold">{endpoint.name}</h3>
                    </div>
                    <p className="text-muted-foreground">{endpoint.description}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(endpoint.endpoint, endpoint.endpoint)}
                  >
                    {copiedEndpoint === endpoint.endpoint ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Code className="h-4 w-4 text-primary" />
                      <span className="font-bold">Endpoint</span>
                    </div>
                    <code className="block bg-black/50 p-4 rounded text-sm text-primary">
                      {endpoint.endpoint}
                    </code>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-bold mb-2">Request Example</h4>
                      <pre className="bg-black/50 p-4 rounded text-sm text-green-400 overflow-x-auto">
                        {JSON.stringify(endpoint.request, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <h4 className="font-bold mb-2">Response Example</h4>
                      <pre className="bg-black/50 p-4 rounded text-sm text-blue-400 overflow-x-auto">
                        {JSON.stringify(endpoint.response, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Webhooks */}
          <Card className="mt-12 p-8 bg-gradient-to-r from-primary/10 via-black/50 to-primary/10 border-primary/30">
            <h2 className="text-3xl font-bold mb-6 text-primary">Webhooks</h2>
            <p className="text-muted-foreground mb-4">
              PerfectMoney will send POST requests to your callback URL when payment status changes. 
              Make sure to verify the signature to ensure the request is authentic.
            </p>
            <div className="bg-black/50 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-3">Webhook Payload Example</h3>
              <pre className="text-sm text-primary overflow-x-auto">
{`{
  "event": "payment.completed",
  "payment_id": "PMT-abc123xyz",
  "amount": "100.00",
  "currency": "PM",
  "order_id": "ORDER-12345",
  "transaction_hash": "0x1234567890abcdef",
  "timestamp": "2024-01-15T11:45:00Z",
  "signature": "sha256_signature_here"
}`}
              </pre>
            </div>
          </Card>

          {/* Support */}
          <Card className="mt-12 p-8 bg-card/50 backdrop-blur-sm text-center">
            <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
            <p className="text-muted-foreground mb-6">
              Our technical support team is ready to assist you with API integration
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="default" asChild>
                <a href="mailto:info@perfectmoney.cc">Contact Support</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="https://perfectmoney.cc" target="_blank" rel="noopener noreferrer">
                  Visit Website
                </a>
              </Button>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default APIIntegration;
