import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Webhook, Send, CheckCircle, XCircle, Loader2, Copy, Shield, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface WebhookTest {
  id: string;
  event: string;
  url: string;
  status: 'pending' | 'success' | 'failed';
  responseCode?: number;
  responseTime?: number;
  timestamp: Date;
}

export const WebhookTester = () => {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("payment.completed");
  const [isTesting, setIsTesting] = useState(false);
  const [testHistory, setTestHistory] = useState<WebhookTest[]>([]);

  const webhookEvents = [
    { value: "payment.completed", label: "Payment Completed", description: "Sent when payment is confirmed" },
    { value: "payment.expired", label: "Payment Expired", description: "Sent when payment link expires" },
    { value: "payment.cancelled", label: "Payment Cancelled", description: "Sent when merchant cancels payment" },
  ];

  const generateSignature = async (payload: string, secret: string): Promise<string> => {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret || 'test_secret'),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
    return Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const samplePayloads: Record<string, object> = {
    "payment.completed": {
      event: "payment.completed",
      paymentLinkId: "pay_" + Math.random().toString(36).substr(2, 9),
      merchantId: "merch_" + Math.random().toString(36).substr(2, 9),
      amount: 100,
      currency: "PM",
      orderId: "order_12345",
      transactionHash: "0x" + Math.random().toString(16).substr(2, 64),
      paidAt: new Date().toISOString(),
      metadata: { customerId: "cust_123" },
    },
    "payment.expired": {
      event: "payment.expired",
      paymentLinkId: "pay_" + Math.random().toString(36).substr(2, 9),
      merchantId: "merch_" + Math.random().toString(36).substr(2, 9),
      amount: 100,
      currency: "PM",
      orderId: "order_12345",
    },
    "payment.cancelled": {
      event: "payment.cancelled",
      paymentLinkId: "pay_" + Math.random().toString(36).substr(2, 9),
      merchantId: "merch_" + Math.random().toString(36).substr(2, 9),
      amount: 100,
      currency: "PM",
      orderId: "order_12345",
    },
  };

  const testWebhook = async () => {
    if (!webhookUrl) {
      toast.error("Please enter a webhook URL");
      return;
    }

    setIsTesting(true);
    const testId = Math.random().toString(36).substr(2, 9);
    const payload = samplePayloads[selectedEvent];
    const payloadString = JSON.stringify(payload);
    
    const newTest: WebhookTest = {
      id: testId,
      event: selectedEvent,
      url: webhookUrl,
      status: 'pending',
      timestamp: new Date(),
    };
    
    setTestHistory(prev => [newTest, ...prev.slice(0, 9)]);

    try {
      const signature = await generateSignature(payloadString, webhookSecret);
      const startTime = Date.now();
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-PM-Signature': signature,
          'X-PM-Event': selectedEvent,
        },
        body: payloadString,
        mode: 'no-cors', // For testing external URLs
      });

      const responseTime = Date.now() - startTime;
      
      setTestHistory(prev => prev.map(t => 
        t.id === testId 
          ? { ...t, status: 'success' as const, responseCode: 200, responseTime }
          : t
      ));
      
      toast.success(`Webhook sent successfully (${responseTime}ms)`);
    } catch (error) {
      setTestHistory(prev => prev.map(t => 
        t.id === testId 
          ? { ...t, status: 'failed' as const, responseCode: 0 }
          : t
      ));
      toast.error("Failed to send webhook. Check if the URL is accessible.");
    } finally {
      setIsTesting(false);
    }
  };

  const copyPayload = () => {
    navigator.clipboard.writeText(JSON.stringify(samplePayloads[selectedEvent], null, 2));
    toast.success("Payload copied to clipboard");
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Webhook className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-bold">Webhook Tester</h2>
      </div>

      <Tabs defaultValue="test" className="space-y-6">
        <TabsList>
          <TabsTrigger value="test">Test Webhook</TabsTrigger>
          <TabsTrigger value="verify">Signature Verification</TabsTrigger>
          <TabsTrigger value="history">Test History</TabsTrigger>
        </TabsList>

        <TabsContent value="test" className="space-y-6">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Webhook URL</Label>
              <Input
                placeholder="https://yoursite.com/webhook"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Webhook Secret (optional)</Label>
              <Input
                type="password"
                placeholder="your_webhook_secret"
                value={webhookSecret}
                onChange={(e) => setWebhookSecret(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Used to generate the X-PM-Signature header</p>
            </div>

            <div className="space-y-2">
              <Label>Event Type</Label>
              <div className="grid gap-2">
                {webhookEvents.map((event) => (
                  <div
                    key={event.value}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedEvent === event.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedEvent(event.value)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{event.label}</span>
                      <Badge variant="outline">{event.value}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Sample Payload</Label>
                <Button variant="ghost" size="sm" onClick={copyPayload}>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
              </div>
              <pre className="p-4 bg-muted/50 rounded-lg overflow-x-auto text-xs">
                {JSON.stringify(samplePayloads[selectedEvent], null, 2)}
              </pre>
            </div>
          </div>

          <Button 
            variant="gradient" 
            className="w-full"
            onClick={testWebhook}
            disabled={isTesting}
          >
            {isTesting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Test Webhook
              </>
            )}
          </Button>
        </TabsContent>

        <TabsContent value="verify" className="space-y-6">
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Webhook Signature Verification</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              All webhooks include an <code className="px-1 py-0.5 bg-muted rounded">X-PM-Signature</code> header 
              containing an HMAC-SHA256 signature of the request body using your webhook secret.
            </p>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Verification Steps:</h4>
                <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                  <li>Get the raw request body as a string</li>
                  <li>Compute HMAC-SHA256 using your webhook secret</li>
                  <li>Compare with the X-PM-Signature header</li>
                  <li>Use timing-safe comparison to prevent timing attacks</li>
                </ol>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Headers Included:</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">X-PM-Signature</Badge>
                    <span className="text-muted-foreground">HMAC-SHA256 signature</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">X-PM-Event</Badge>
                    <span className="text-muted-foreground">Event type (payment.completed, etc.)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Example Verification Code (Node.js)</Label>
            <pre className="p-4 bg-muted/50 rounded-lg overflow-x-auto text-xs">
{`const crypto = require('crypto');

function verifySignature(payload, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}`}
            </pre>
          </div>
        </TabsContent>

        <TabsContent value="history">
          {testHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Webhook className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No webhook tests yet</p>
              <p className="text-sm">Send a test webhook to see it here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {testHistory.map((test) => (
                <div key={test.id} className="p-4 rounded-lg bg-muted/50 border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {test.status === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {test.status === 'failed' && <XCircle className="h-4 w-4 text-red-500" />}
                      {test.status === 'pending' && <Loader2 className="h-4 w-4 animate-spin" />}
                      <Badge variant="outline">{test.event}</Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {test.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm font-mono truncate">{test.url}</p>
                  {test.responseTime && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Response time: {test.responseTime}ms
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
};
