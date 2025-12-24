import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Code, Copy, Check, Globe, TestTube, Zap, Key, RefreshCw, ExternalLink, Shield, Lock, Send, Loader2, CheckCircle, XCircle, History, AlertTriangle, Activity, Wifi, WifiOff, Clock, Play, Pause, Trash2, Mail, BarChart3, Bell, Download, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { TradingViewTicker } from "@/components/TradingViewTicker";
import { HeroBanner } from "@/components/HeroBanner";
import { Footer } from "@/components/Footer";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { useAccount } from "wagmi";
import { RateLimitingVisualization } from "@/components/webhook/RateLimitingVisualization";
import { WebhookSimulator } from "@/components/webhook/WebhookSimulator";
import { WebhookPayloadTemplates } from "@/components/webhook/WebhookPayloadTemplates";
import { WebhookRetryQueue } from "@/components/webhook/WebhookRetryQueue";
import { WebhookPayloadValidator } from "@/components/webhook/WebhookPayloadValidator";
import { EmbeddablePaymentWidget } from "@/components/merchant/EmbeddablePaymentWidget";
import NotificationPreferences from "@/components/merchant/NotificationPreferences";
import { useConnect } from "wagmi";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const MerchantAPI = () => {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [environment, setEnvironment] = useState<"sandbox" | "production">("sandbox");
  
  // Generate deterministic API keys based on wallet address and environment
  const generateApiKey = (env: string) => {
    if (!address) return "";
    const baseHash = address.slice(2, 34);
    const envPrefix = env === "sandbox" ? "sb" : "pk";
    return `pm_${envPrefix}_${baseHash}${Date.now().toString(36).slice(-8)}`;
  };
  
  const [sandboxApiKey, setSandboxApiKey] = useState(() => generateApiKey("sandbox"));
  const [productionApiKey, setProductionApiKey] = useState(() => generateApiKey("production"));
  const [sandboxSecretKey, setSandboxSecretKey] = useState(() => `pm_sb_secret_${address?.slice(2, 26) || 'demo'}${Math.random().toString(36).slice(-12)}`);
  const [productionSecretKey, setProductionSecretKey] = useState(() => `pm_pk_secret_${address?.slice(2, 26) || 'demo'}${Math.random().toString(36).slice(-12)}`);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    toast.success(`${label} copied to clipboard!`);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const regenerateKey = (type: "api" | "secret", env: "sandbox" | "production") => {
    const newKey = type === "api" 
      ? `pm_${env === "sandbox" ? "sb" : "pk"}_${address?.slice(2, 34) || 'demo'}${Date.now().toString(36).slice(-8)}`
      : `pm_${env === "sandbox" ? "sb" : "pk"}_secret_${address?.slice(2, 26) || 'demo'}${Math.random().toString(36).slice(-12)}`;
    
    if (type === "api") {
      if (env === "sandbox") setSandboxApiKey(newKey);
      else setProductionApiKey(newKey);
    } else {
      if (env === "sandbox") setSandboxSecretKey(newKey);
      else setProductionSecretKey(newKey);
    }
    
    toast.success(`${env === "sandbox" ? "Sandbox" : "Production"} ${type === "api" ? "API" : "Secret"} key regenerated!`);
  };

  const baseUrls = {
    sandbox: "https://sandbox.api.perfectmoney.cc/v1",
    production: "https://api.perfectmoney.cc/v1"
  };

  const generatePaymentLink = (env: "sandbox" | "production") => {
    const baseUrl = env === "sandbox" ? "https://sandbox.perfectmoney.cc" : "https://pay.perfectmoney.cc";
    const merchantId = address?.slice(0, 10) || "demo";
    return `${baseUrl}/pay/${merchantId}/${Date.now().toString(36)}`;
  };

  const currentApiKey = environment === "sandbox" ? sandboxApiKey : productionApiKey;
  const currentSecretKey = environment === "sandbox" ? sandboxSecretKey : productionSecretKey;
  const currentBaseUrl = baseUrls[environment];

  const endpoints = [
    {
      name: "Create Payment",
      method: "POST",
      path: "/payments/create",
      description: "Create a new payment request",
      requestExample: {
        amount: "100.00",
        currency: "PM",
        order_id: "ORDER-12345",
        callback_url: "https://yoursite.com/webhook",
        success_url: "https://yoursite.com/success",
        cancel_url: "https://yoursite.com/cancel"
      },
      responseExample: {
        success: true,
        payment_id: "pay_abc123xyz",
        payment_url: generatePaymentLink(environment),
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString()
      }
    },
    {
      name: "Get Payment Status",
      method: "GET",
      path: "/payments/:payment_id",
      description: "Retrieve payment details and status",
      requestExample: {
        payment_id: "pay_abc123xyz"
      },
      responseExample: {
        success: true,
        payment_id: "pay_abc123xyz",
        status: "completed",
        amount: "100.00",
        currency: "PM",
        tx_hash: "0x1234...abcd",
        completed_at: new Date().toISOString()
      }
    },
    {
      name: "Refund Payment",
      method: "POST",
      path: "/payments/:payment_id/refund",
      description: "Initiate a refund for a completed payment",
      requestExample: {
        payment_id: "pay_abc123xyz",
        amount: "50.00",
        reason: "Customer request"
      },
      responseExample: {
        success: true,
        refund_id: "ref_xyz789",
        status: "processing",
        amount: "50.00"
      }
    },
    {
      name: "List Payments",
      method: "GET",
      path: "/payments",
      description: "List all payments with optional filters",
      requestExample: {
        limit: 20,
        offset: 0,
        status: "completed",
        from_date: "2024-01-01"
      },
      responseExample: {
        success: true,
        total: 150,
        payments: [
          { payment_id: "pay_abc123", amount: "100.00", status: "completed" },
          { payment_id: "pay_def456", amount: "250.00", status: "completed" }
        ]
      }
    }
  ];

  // Webhook Testing Tool Component
  const WebhookTestingTool = ({ 
    address, 
    environment, 
    currentSecretKey 
  }: { 
    address: string | undefined; 
    environment: "sandbox" | "production"; 
    currentSecretKey: string;
  }) => {
    const navigate = useNavigate();
    const [webhookUrl, setWebhookUrl] = useState("");
    const [selectedEvent, setSelectedEvent] = useState("payment.completed");
    const [customAmount, setCustomAmount] = useState("100.00");
    const [customOrderId, setCustomOrderId] = useState("TEST-ORDER-001");
    const [isSending, setIsSending] = useState(false);
    const [enableRetry, setEnableRetry] = useState(true);
    const [maxRetries, setMaxRetries] = useState(5);
    const [currentRetry, setCurrentRetry] = useState(0);
    const [retryProgress, setRetryProgress] = useState(0);
    const [testResults, setTestResults] = useState<Array<{
      id: string;
      event: string;
      status: "success" | "error" | "pending" | "retrying";
      responseCode?: number;
      responseTime?: number;
      timestamp: Date;
      error?: string;
      retryCount?: number;
      nextRetryIn?: number;
    }>>([]);

    const webhookEvents = [
      { value: "payment.created", label: "Payment Created", description: "Triggered when a new payment is initiated" },
      { value: "payment.completed", label: "Payment Completed", description: "Triggered when payment is successfully processed" },
      { value: "payment.failed", label: "Payment Failed", description: "Triggered when payment processing fails" },
      { value: "payment.expired", label: "Payment Expired", description: "Triggered when payment link expires" },
      { value: "payment.refunded", label: "Payment Refunded", description: "Triggered when a refund is processed" },
    ];

    const generateTestPayload = (event: string) => {
      const paymentId = `pay_test_${Date.now().toString(36)}`;
      const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      
      return {
        event,
        payment_id: paymentId,
        merchant_id: address?.slice(0, 10) || 'test_merchant',
        amount: customAmount,
        currency: "PM",
        order_id: customOrderId,
        tx_hash: event === "payment.completed" ? txHash : undefined,
        status: event.split('.')[1],
        environment,
        timestamp: new Date().toISOString(),
        test_mode: true
      };
    };

    // Calculate exponential backoff delay in milliseconds
    const getRetryDelay = (attempt: number): number => {
      // Base delay of 1 second, doubling each attempt (1s, 2s, 4s, 8s, 16s)
      const baseDelay = 1000;
      const delay = baseDelay * Math.pow(2, attempt);
      // Add jitter (±10%) to prevent thundering herd
      const jitter = delay * 0.1 * (Math.random() * 2 - 1);
      return Math.min(delay + jitter, 30000); // Cap at 30 seconds
    };

    const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

    const attemptWebhookDelivery = async (
      url: string,
      payload: Record<string, unknown>,
      testId: string,
      attempt: number
    ): Promise<{ success: boolean; responseTime: number; error?: string }> => {
      const startTime = Date.now();
      
      try {
        await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': `sha256_test_${Date.now()}`,
            'X-Webhook-Environment': environment,
            'X-Webhook-Test': 'true',
            'X-Webhook-Attempt': String(attempt + 1)
          },
          body: JSON.stringify(payload),
          mode: 'no-cors'
        });

        return { success: true, responseTime: Date.now() - startTime };
      } catch (error) {
        return { 
          success: false, 
          responseTime: Date.now() - startTime,
          error: error instanceof Error ? error.message : "Failed to send"
        };
      }
    };

    const sendTestWebhook = async () => {
      if (!webhookUrl) {
        toast.error("Please enter a webhook URL");
        return;
      }

      try {
        new URL(webhookUrl);
      } catch {
        toast.error("Please enter a valid URL");
        return;
      }

      setIsSending(true);
      setCurrentRetry(0);
      setRetryProgress(0);
      
      const testId = `test_${Date.now()}`;
      const payload = generateTestPayload(selectedEvent);

      setTestResults(prev => [{
        id: testId,
        event: selectedEvent,
        status: "pending",
        timestamp: new Date(),
        retryCount: 0
      }, ...prev.slice(0, 9)]);

      let lastResult = await attemptWebhookDelivery(webhookUrl, payload, testId, 0);
      let attempt = 0;

      // If failed and retry is enabled, attempt retries with exponential backoff
      while (!lastResult.success && enableRetry && attempt < maxRetries - 1) {
        attempt++;
        setCurrentRetry(attempt);
        
        const delay = getRetryDelay(attempt);
        const delaySeconds = Math.ceil(delay / 1000);
        
        // Update status to retrying
        setTestResults(prev => prev.map(r => 
          r.id === testId 
            ? { 
                ...r, 
                status: "retrying" as const, 
                retryCount: attempt,
                nextRetryIn: delaySeconds
              }
            : r
        ));

        // Show countdown progress
        const progressInterval = 100;
        const steps = delay / progressInterval;
        for (let i = 0; i <= steps; i++) {
          await sleep(progressInterval);
          setRetryProgress((i / steps) * 100);
        }

        toast.info(`Retry attempt ${attempt + 1}/${maxRetries}...`);
        lastResult = await attemptWebhookDelivery(webhookUrl, payload, testId, attempt);
      }

      // Update final result
      if (lastResult.success) {
        setTestResults(prev => prev.map(r => 
          r.id === testId 
            ? { 
                ...r, 
                status: "success" as const, 
                responseCode: 200, 
                responseTime: lastResult.responseTime,
                retryCount: attempt
              }
            : r
        ));
        toast.success(`Webhook delivered successfully after ${attempt + 1} attempt(s) (${lastResult.responseTime}ms)`);
      } else {
        setTestResults(prev => prev.map(r => 
          r.id === testId 
            ? { 
                ...r, 
                status: "error" as const, 
                responseTime: lastResult.responseTime, 
                error: lastResult.error,
                retryCount: attempt + 1
              }
            : r
        ));
        toast.error(`Webhook delivery failed after ${attempt + 1} attempt(s)`);
      }

      setIsSending(false);
      setCurrentRetry(0);
      setRetryProgress(0);
    };

    const clearResults = () => {
      setTestResults([]);
      toast.success("Test history cleared");
    };

    return (
      <Card className="border-orange-500/30 bg-gradient-to-r from-orange-500/5 to-amber-500/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TestTube className="h-5 w-5 text-orange-500" />
              <CardTitle>Webhook Testing Tool</CardTitle>
            </div>
            <Badge variant="outline" className="border-orange-500/50 text-orange-500">
              {environment === "sandbox" ? "Sandbox" : "Production"} Mode
            </Badge>
          </div>
          <CardDescription>Send test webhook events to your endpoint</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Webhook URL Input */}
          <div className="space-y-2">
            <Label htmlFor="webhook-url">Your Webhook Endpoint URL</Label>
            <Input
              id="webhook-url"
              placeholder="https://yoursite.com/api/webhook"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Enter the URL where you want to receive test webhook events
            </p>
          </div>

          {/* Event Selection */}
          <div className="space-y-2">
            <Label>Select Event Type</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {webhookEvents.map((event) => (
                <button
                  key={event.value}
                  onClick={() => setSelectedEvent(event.value)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedEvent === event.value
                      ? "border-orange-500 bg-orange-500/10"
                      : "border-border hover:border-orange-500/50 hover:bg-orange-500/5"
                  }`}
                >
                  <div className="font-medium text-sm">{event.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{event.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Payload Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="custom-amount">Test Amount (PM)</Label>
              <Input
                id="custom-amount"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="100.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="custom-order-id">Test Order ID</Label>
              <Input
                id="custom-order-id"
                value={customOrderId}
                onChange={(e) => setCustomOrderId(e.target.value)}
                placeholder="TEST-ORDER-001"
              />
            </div>
          </div>

          {/* Retry Settings */}
          <div className="p-4 bg-background/50 rounded-lg border space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-orange-500" />
                <Label htmlFor="enable-retry" className="font-medium">Enable Retry with Exponential Backoff</Label>
              </div>
              <Switch
                id="enable-retry"
                checked={enableRetry}
                onCheckedChange={setEnableRetry}
              />
            </div>
            
            {enableRetry && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="max-retries">Maximum Retries: {maxRetries}</Label>
                  <Input
                    id="max-retries"
                    type="range"
                    min={1}
                    max={10}
                    value={maxRetries}
                    onChange={(e) => setMaxRetries(parseInt(e.target.value))}
                    className="cursor-pointer"
                  />
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Retry delays with exponential backoff:</p>
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: maxRetries }, (_, i) => (
                      <Badge key={i} variant="outline" className="text-orange-500">
                        #{i + 1}: {i === 0 ? "Immediate" : `${Math.pow(2, i)}s`}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Payload Preview */}
          <div className="space-y-2">
            <Label>Payload Preview</Label>
            <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto text-orange-400 max-h-48">
              {JSON.stringify(generateTestPayload(selectedEvent), null, 2)}
            </pre>
          </div>

          {/* Retry Progress */}
          {isSending && currentRetry > 0 && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-yellow-500 animate-spin" />
                  <span className="text-yellow-500 font-medium">
                    Retry Attempt {currentRetry + 1}/{maxRetries}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  Waiting with exponential backoff...
                </span>
              </div>
              <Progress value={retryProgress} className="h-2" />
            </div>
          )}

          {/* Send Button */}
          <div className="flex gap-3">
            <Button
              onClick={sendTestWebhook}
              disabled={isSending || !webhookUrl}
              className="flex-1 bg-orange-500 hover:bg-orange-600"
            >
              {isSending ? (
                currentRetry > 0 ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Retrying ({currentRetry + 1}/{maxRetries})...
                  </>
                ) : (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                )
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Test Webhook
                </>
              )}
            </Button>
            {testResults.length > 0 && (
              <Button variant="outline" onClick={clearResults}>
                Clear History
              </Button>
            )}
          </div>
          
          {/* View All Logs Link */}
          <Button 
            variant="outline" 
            className="w-full border-orange-500/30 hover:bg-orange-500/10"
            onClick={() => navigate("/dashboard/merchant/webhook-logs")}
          >
            <History className="h-4 w-4 mr-2" />
            View All Webhook Logs
          </Button>

          {/* Test Results */}
          {testResults.length > 0 && (
            <div className="space-y-2">
              <Label>Recent Test Results</Label>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {testResults.map((result) => (
                  <div
                    key={result.id}
                    className={`p-3 rounded-lg border flex items-center justify-between ${
                      result.status === "success"
                        ? "border-green-500/30 bg-green-500/5"
                        : result.status === "error"
                        ? "border-red-500/30 bg-red-500/5"
                        : result.status === "retrying"
                        ? "border-yellow-500/30 bg-yellow-500/5"
                        : "border-blue-500/30 bg-blue-500/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {result.status === "success" ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : result.status === "error" ? (
                        <XCircle className="h-5 w-5 text-red-500" />
                      ) : result.status === "retrying" ? (
                        <RefreshCw className="h-5 w-5 text-yellow-500 animate-spin" />
                      ) : (
                        <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                      )}
                      <div>
                        <div className="font-medium text-sm flex items-center gap-2">
                          {result.event}
                          {result.retryCount !== undefined && result.retryCount > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {result.retryCount} {result.retryCount === 1 ? "retry" : "retries"}
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {result.timestamp.toLocaleTimeString()}
                          {result.status === "retrying" && result.nextRetryIn && (
                            <span className="text-yellow-500"> • Next retry in {result.nextRetryIn}s</span>
                          )}
                          {result.error && <span className="text-red-400"> • {result.error}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {result.responseCode && (
                        <Badge variant="outline" className={
                          result.responseCode === 200 ? "text-green-500" : "text-red-500"
                        }>
                          HTTP {result.responseCode}
                        </Badge>
                      )}
                      {result.responseTime && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {result.responseTime}ms
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium text-sm mb-2">💡 Testing Tips</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Test webhooks are sent with <code className="bg-muted px-1 rounded">X-Webhook-Test: true</code> header</li>
              <li>• Ensure your endpoint returns a 2xx status code to confirm receipt</li>
              <li>• Use tools like <a href="https://webhook.site" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">webhook.site</a> to debug payloads</li>
              <li>• Test all event types before going live</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Webhook Health Check Component
  const WebhookHealthCheck = ({
    environment
  }: {
    environment: "sandbox" | "production";
  }) => {
    const navigate = useNavigate();
    const { connectors, connect } = useConnect();
    const [endpoints, setEndpoints] = useState<Array<{
      id: string;
      url: string;
      name: string;
      status: "healthy" | "degraded" | "unhealthy" | "checking" | "unknown";
      lastChecked: Date | null;
      responseTime: number | null;
      uptime: number;
      consecutiveFailures: number;
      alertSent: boolean;
      recoverySent: boolean;
      wasDown: boolean;
      downtimeStart: Date | null;
      history: Array<{
        timestamp: Date;
        status: "healthy" | "unhealthy";
        responseTime: number;
      }>;
    }>>([]);
    const [newEndpointUrl, setNewEndpointUrl] = useState("");
    const [newEndpointName, setNewEndpointName] = useState("");
    const [isMonitoring, setIsMonitoring] = useState(false);
    const [checkInterval, setCheckInterval] = useState(60); // seconds
    const [isAddingEndpoint, setIsAddingEndpoint] = useState(false);
    
    // Email notification settings
    const [emailAlertEnabled, setEmailAlertEnabled] = useState(false);
    const [alertEmail, setAlertEmail] = useState("");
    const [failureThreshold, setFailureThreshold] = useState(3);
    const [isSendingAlert, setIsSendingAlert] = useState(false);
    const [recoveryAlertsEnabled, setRecoveryAlertsEnabled] = useState(true);

    // Export health history to CSV
    const exportHealthHistoryCSV = () => {
      if (endpoints.length === 0) {
        toast.error("No endpoints to export");
        return;
      }

      const headers = ["Endpoint Name", "URL", "Timestamp", "Status", "Response Time (ms)", "Uptime (%)"];
      const rows: string[][] = [];

      endpoints.forEach(endpoint => {
        endpoint.history.forEach(h => {
          rows.push([
            endpoint.name,
            endpoint.url,
            h.timestamp.toISOString(),
            h.status,
            h.responseTime.toString(),
            endpoint.uptime.toFixed(2)
          ]);
        });
      });

      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `webhook-health-history-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Health history exported to CSV!");
    };

    // Auto-connect wallet on successful payment
    const autoConnectWalletOnPayment = useCallback(async (paymentCurrency: string) => {
      if (isConnected) return;
      
      const supportedCurrencies = ["USDT-BEP20", "USDC-BEP20", "PM-BEP20"];
      if (!supportedCurrencies.includes(paymentCurrency)) return;

      // Try to connect with the first available connector (usually MetaMask)
      const connector = connectors.find(c => c.ready);
      if (connector) {
        try {
          await connect({ connector });
          toast.success(`Wallet connected after ${paymentCurrency} payment!`);
        } catch (error) {
          console.error("Auto-connect failed:", error);
        }
      }
    }, [isConnected, connectors, connect]);

    // Send downtime alert email
    const sendDowntimeAlert = async (endpoint: typeof endpoints[0]) => {
      if (!emailAlertEnabled || !alertEmail || isSendingAlert) return;
      
      setIsSendingAlert(true);
      try {
        const response = await fetch('https://ihuqvxvcqnrdxphqxpqr.supabase.co/functions/v1/webhook-downtime-alert', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            merchantEmail: alertEmail,
            endpointName: endpoint.name,
            endpointUrl: endpoint.url,
            consecutiveFailures: endpoint.consecutiveFailures,
            lastResponseTime: endpoint.responseTime,
            uptime: endpoint.uptime,
            environment
          })
        });

        if (response.ok) {
          toast.success(`Downtime alert sent to ${alertEmail}`);
          // Mark alert as sent for this endpoint
          setEndpoints(prev => prev.map(ep => 
            ep.id === endpoint.id ? { ...ep, alertSent: true } : ep
          ));
        } else {
          throw new Error('Failed to send alert');
        }
      } catch (error) {
        console.error('Failed to send downtime alert:', error);
        toast.error('Failed to send downtime alert email');
      } finally {
        setIsSendingAlert(false);
      }
    };

    // Send recovery alert email
    const sendRecoveryAlert = async (endpoint: typeof endpoints[0], downtimeStart: Date | null) => {
      if (!emailAlertEnabled || !alertEmail || !recoveryAlertsEnabled) return;
      
      const downtimeDuration = downtimeStart 
        ? Math.round((Date.now() - downtimeStart.getTime()) / 60000) 
        : 0;
      
      try {
        const response = await fetch('https://ihuqvxvcqnrdxphqxpqr.supabase.co/functions/v1/webhook-recovery-alert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            merchantEmail: alertEmail,
            endpointName: endpoint.name,
            endpointUrl: endpoint.url,
            downtimeDuration,
            currentUptime: endpoint.uptime,
            responseTime: endpoint.responseTime || 0,
            environment
          })
        });

        if (response.ok) {
          toast.success(`Recovery alert sent to ${alertEmail}`);
        }
      } catch (error) {
        console.error('Failed to send recovery alert:', error);
      }
    };

    // Check a single endpoint health
    const checkEndpointHealth = useCallback(async (endpoint: typeof endpoints[0]) => {
      const startTime = Date.now();
      
      try {
        // Update status to checking
        setEndpoints(prev => prev.map(ep => 
          ep.id === endpoint.id ? { ...ep, status: "checking" as const } : ep
        ));

        // Send a HEAD request to check availability
        await fetch(endpoint.url, {
          method: 'HEAD',
          mode: 'no-cors',
          headers: {
            'X-Health-Check': 'true',
            'X-PM-Environment': environment
          }
        });

        const responseTime = Date.now() - startTime;
        const isHealthy = responseTime < 5000; // Consider healthy if under 5 seconds
        
        setEndpoints(prev => {
          const updated = prev.map(ep => {
            if (ep.id !== endpoint.id) return ep;
            
            const newHistory = [
              { timestamp: new Date(), status: isHealthy ? "healthy" as const : "unhealthy" as const, responseTime },
              ...ep.history.slice(0, 99) // Keep last 100 checks
            ];
            
            // Calculate uptime from history
            const healthyChecks = newHistory.filter(h => h.status === "healthy").length;
            const uptime = newHistory.length > 0 ? (healthyChecks / newHistory.length) * 100 : 100;
            const newConsecutiveFailures = isHealthy ? 0 : ep.consecutiveFailures + 1;
            
            // Check if endpoint just recovered from being down
            const justRecovered = isHealthy && ep.wasDown && !ep.recoverySent;
            
            return {
              ...ep,
              status: isHealthy ? "healthy" as const : (uptime > 80 ? "degraded" as const : "unhealthy" as const),
              lastChecked: new Date(),
              responseTime,
              uptime,
              consecutiveFailures: newConsecutiveFailures,
              alertSent: isHealthy ? false : ep.alertSent, // Reset alert flag when healthy
              recoverySent: justRecovered ? true : (isHealthy ? false : ep.recoverySent),
              wasDown: !isHealthy || (ep.wasDown && !isHealthy),
              downtimeStart: !isHealthy && !ep.wasDown ? new Date() : (isHealthy ? null : ep.downtimeStart),
              history: newHistory
            };
          });
          
          // Check if we need to send an alert or recovery notification
          const updatedEndpoint = updated.find(ep => ep.id === endpoint.id);
          const originalEndpoint = prev.find(ep => ep.id === endpoint.id);
          
          if (updatedEndpoint && emailAlertEnabled && alertEmail) {
            // Send downtime alert
            if (!updatedEndpoint.alertSent && 
                updatedEndpoint.consecutiveFailures >= failureThreshold) {
              sendDowntimeAlert(updatedEndpoint);
            }
            // Send recovery alert
            if (isHealthy && originalEndpoint?.wasDown && !originalEndpoint?.recoverySent && recoveryAlertsEnabled) {
              sendRecoveryAlert(updatedEndpoint, originalEndpoint.downtimeStart);
            }
          }
          
          return updated;
        });

        return { success: isHealthy, responseTime };
      } catch (error) {
        const responseTime = Date.now() - startTime;
        
        setEndpoints(prev => {
          const updated = prev.map(ep => {
            if (ep.id !== endpoint.id) return ep;
            
            const wasAlreadyDown = ep.wasDown;
            const newHistory = [
              { timestamp: new Date(), status: "unhealthy" as const, responseTime },
              ...ep.history.slice(0, 99)
            ];
            
            const healthyChecks = newHistory.filter(h => h.status === "healthy").length;
            const uptime = newHistory.length > 0 ? (healthyChecks / newHistory.length) * 100 : 0;
            const newConsecutiveFailures = ep.consecutiveFailures + 1;
            
            return {
              ...ep,
              status: uptime > 80 ? "degraded" as const : "unhealthy" as const,
              lastChecked: new Date(),
              responseTime,
              uptime,
              consecutiveFailures: newConsecutiveFailures,
              wasDown: true,
              downtimeStart: !wasAlreadyDown ? new Date() : ep.downtimeStart,
              history: newHistory
            };
          });
          
          // Check if we need to send an alert
          const updatedEndpoint = updated.find(ep => ep.id === endpoint.id);
          if (updatedEndpoint && 
              !updatedEndpoint.alertSent && 
              updatedEndpoint.consecutiveFailures >= failureThreshold &&
              emailAlertEnabled && 
              alertEmail) {
            sendDowntimeAlert(updatedEndpoint);
          }
          
          return updated;
        });

        return { success: false, responseTime };
      }
    }, [environment, emailAlertEnabled, alertEmail, failureThreshold, recoveryAlertsEnabled]);

    // Check all endpoints
    const checkAllEndpoints = useCallback(async () => {
      for (const endpoint of endpoints) {
        await checkEndpointHealth(endpoint);
      }
    }, [endpoints, checkEndpointHealth]);

    // Periodic monitoring
    useEffect(() => {
      if (!isMonitoring || endpoints.length === 0) return;

      const intervalId = setInterval(() => {
        checkAllEndpoints();
      }, checkInterval * 1000);

      return () => clearInterval(intervalId);
    }, [isMonitoring, checkInterval, endpoints.length, checkAllEndpoints]);

    // Add new endpoint
    const addEndpoint = () => {
      if (!newEndpointUrl) {
        toast.error("Please enter a webhook URL");
        return;
      }

      try {
        new URL(newEndpointUrl);
      } catch {
        toast.error("Please enter a valid URL");
        return;
      }

      const newEndpoint = {
        id: `ep_${Date.now()}`,
        url: newEndpointUrl,
        name: newEndpointName || new URL(newEndpointUrl).hostname,
        status: "unknown" as const,
        lastChecked: null as Date | null,
        responseTime: null as number | null,
        uptime: 100,
        consecutiveFailures: 0,
        alertSent: false,
        recoverySent: false,
        wasDown: false,
        downtimeStart: null as Date | null,
        history: [] as Array<{ timestamp: Date; status: "healthy" | "unhealthy"; responseTime: number }>
      };

      setEndpoints(prev => [...prev, newEndpoint]);
      setNewEndpointUrl("");
      setNewEndpointName("");
      setIsAddingEndpoint(false);
      toast.success("Endpoint added! Click 'Check Now' to verify its health.");
    };

    // Remove endpoint
    const removeEndpoint = (id: string) => {
      setEndpoints(prev => prev.filter(ep => ep.id !== id));
      toast.success("Endpoint removed");
    };

    // Get status color and icon
    const getStatusIndicator = (status: string) => {
      switch (status) {
        case "healthy":
          return { color: "text-green-500", bgColor: "bg-green-500", icon: Wifi };
        case "degraded":
          return { color: "text-yellow-500", bgColor: "bg-yellow-500", icon: AlertTriangle };
        case "unhealthy":
          return { color: "text-red-500", bgColor: "bg-red-500", icon: WifiOff };
        case "checking":
          return { color: "text-blue-500", bgColor: "bg-blue-500", icon: Loader2 };
        default:
          return { color: "text-muted-foreground", bgColor: "bg-muted", icon: Clock };
      }
    };

    return (
      <Card className="border-cyan-500/30 bg-gradient-to-r from-cyan-500/5 to-blue-500/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-cyan-500" />
              <CardTitle>Webhook Endpoint Health Check</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-cyan-500/50 text-cyan-500">
                {endpoints.length} Endpoint{endpoints.length !== 1 ? "s" : ""}
              </Badge>
              {isMonitoring && (
                <Badge className="bg-green-500 animate-pulse">
                  Monitoring
                </Badge>
              )}
            </div>
          </div>
          <CardDescription>Monitor your webhook endpoints' availability and performance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add Endpoint Section */}
          {isAddingEndpoint ? (
            <div className="p-4 bg-background/50 rounded-lg border space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="endpoint-name">Endpoint Name (optional)</Label>
                  <Input
                    id="endpoint-name"
                    placeholder="Production Webhook"
                    value={newEndpointName}
                    onChange={(e) => setNewEndpointName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endpoint-url">Webhook URL</Label>
                  <Input
                    id="endpoint-url"
                    placeholder="https://yoursite.com/api/webhook"
                    value={newEndpointUrl}
                    onChange={(e) => setNewEndpointUrl(e.target.value)}
                    className="font-mono"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={addEndpoint} className="bg-cyan-500 hover:bg-cyan-600">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Add Endpoint
                </Button>
                <Button variant="outline" onClick={() => setIsAddingEndpoint(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button 
              onClick={() => setIsAddingEndpoint(true)}
              variant="outline"
              className="w-full border-dashed border-cyan-500/50 hover:bg-cyan-500/10"
            >
              <Zap className="h-4 w-4 mr-2" />
              Add Webhook Endpoint to Monitor
            </Button>
          )}

          {/* Monitoring Controls */}
          {endpoints.length > 0 && (
            <div className="flex flex-wrap items-center gap-4 p-4 bg-background/50 rounded-lg border">
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setIsMonitoring(!isMonitoring)}
                  variant={isMonitoring ? "destructive" : "default"}
                  size="sm"
                  className={!isMonitoring ? "bg-cyan-500 hover:bg-cyan-600" : ""}
                >
                  {isMonitoring ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Stop Monitoring
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Start Monitoring
                    </>
                  )}
                </Button>
                <Button
                  onClick={checkAllEndpoints}
                  variant="outline"
                  size="sm"
                  disabled={endpoints.some(ep => ep.status === "checking")}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${endpoints.some(ep => ep.status === "checking") ? "animate-spin" : ""}`} />
                  Check Now
                </Button>
                <Button
                  onClick={exportHealthHistoryCSV}
                  variant="outline"
                  size="sm"
                  disabled={endpoints.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
              
              <div className="flex items-center gap-2 ml-auto">
                <Label htmlFor="check-interval" className="text-sm whitespace-nowrap">Check every:</Label>
                <select
                  id="check-interval"
                  value={checkInterval}
                  onChange={(e) => setCheckInterval(parseInt(e.target.value))}
                  className="bg-background border rounded-md px-3 py-1 text-sm"
                >
                  <option value={30}>30 seconds</option>
                  <option value={60}>1 minute</option>
                  <option value={300}>5 minutes</option>
                  <option value={600}>10 minutes</option>
                </select>
              </div>
            </div>
          )}

          {/* Endpoints List */}
          {endpoints.length > 0 ? (
            <div className="space-y-3">
              {endpoints.map((endpoint) => {
                const statusInfo = getStatusIndicator(endpoint.status);
                const StatusIcon = statusInfo.icon;
                
                return (
                  <div
                    key={endpoint.id}
                    className={`p-4 rounded-lg border transition-all ${
                      endpoint.status === "healthy"
                        ? "border-green-500/30 bg-green-500/5"
                        : endpoint.status === "degraded"
                        ? "border-yellow-500/30 bg-yellow-500/5"
                        : endpoint.status === "unhealthy"
                        ? "border-red-500/30 bg-red-500/5"
                        : endpoint.status === "checking"
                        ? "border-blue-500/30 bg-blue-500/5"
                        : "border-border"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`p-2 rounded-full ${statusInfo.bgColor}/20`}>
                          <StatusIcon className={`h-5 w-5 ${statusInfo.color} ${endpoint.status === "checking" ? "animate-spin" : ""}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium truncate">{endpoint.name}</h4>
                            <Badge variant="outline" className={statusInfo.color}>
                              {endpoint.status === "checking" ? "Checking..." : endpoint.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground font-mono truncate mt-1">
                            {endpoint.url}
                          </p>
                          <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-muted-foreground">
                            {endpoint.lastChecked && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Last checked: {endpoint.lastChecked.toLocaleTimeString()}
                              </span>
                            )}
                            {endpoint.responseTime !== null && (
                              <span className={`flex items-center gap-1 ${
                                endpoint.responseTime < 500 ? "text-green-500" :
                                endpoint.responseTime < 2000 ? "text-yellow-500" : "text-red-500"
                              }`}>
                                <Zap className="h-3 w-3" />
                                {endpoint.responseTime}ms
                              </span>
                            )}
                            <span className={`flex items-center gap-1 ${
                              endpoint.uptime >= 99 ? "text-green-500" :
                              endpoint.uptime >= 95 ? "text-yellow-500" : "text-red-500"
                            }`}>
                              <Activity className="h-3 w-3" />
                              {endpoint.uptime.toFixed(1)}% uptime
                            </span>
                            {endpoint.consecutiveFailures > 0 && (
                              <span className="text-red-500 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                {endpoint.consecutiveFailures} consecutive failures
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => checkEndpointHealth(endpoint)}
                          disabled={endpoint.status === "checking"}
                        >
                          <RefreshCw className={`h-4 w-4 ${endpoint.status === "checking" ? "animate-spin" : ""}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeEndpoint(endpoint.id)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Response Time History Mini Chart */}
                    {endpoint.history.length > 1 && (
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">Response Time History (last {Math.min(20, endpoint.history.length)} checks)</span>
                          <span className="text-xs text-muted-foreground">
                            Avg: {Math.round(endpoint.history.reduce((a, b) => a + b.responseTime, 0) / endpoint.history.length)}ms
                          </span>
                        </div>
                        <div className="flex items-end gap-0.5 h-8">
                          {endpoint.history.slice(0, 20).reverse().map((h, i) => (
                            <div
                              key={i}
                              className={`flex-1 rounded-t ${
                                h.status === "healthy" ? "bg-green-500" : "bg-red-500"
                              }`}
                              style={{ 
                                height: `${Math.min(100, (h.responseTime / 3000) * 100)}%`,
                                minHeight: '4px'
                              }}
                              title={`${h.responseTime}ms at ${h.timestamp.toLocaleTimeString()}`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No webhook endpoints configured</p>
              <p className="text-sm mt-1">Add an endpoint to start monitoring its health</p>
            </div>
          )}

          {/* Email Alert Settings */}
          <div className="p-4 bg-background/50 rounded-lg border space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-cyan-500" />
                <Label htmlFor="email-alert" className="font-medium">Email Downtime Alerts</Label>
              </div>
              <Switch
                id="email-alert"
                checked={emailAlertEnabled}
                onCheckedChange={setEmailAlertEnabled}
              />
            </div>
            
            {emailAlertEnabled && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="alert-email">Alert Email Address</Label>
                  <Input
                    id="alert-email"
                    type="email"
                    placeholder="alerts@yourcompany.com"
                    value={alertEmail}
                    onChange={(e) => setAlertEmail(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="failure-threshold">
                    Alert After Consecutive Failures: {failureThreshold}
                  </Label>
                  <Input
                    id="failure-threshold"
                    type="range"
                    min={1}
                    max={10}
                    value={failureThreshold}
                    onChange={(e) => setFailureThreshold(parseInt(e.target.value))}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground">
                    Send an email alert when an endpoint fails {failureThreshold} times in a row
                  </p>
                </div>

                {/* Recovery Alerts Toggle */}
                <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-green-500" />
                    <div>
                      <Label htmlFor="recovery-alerts" className="font-medium text-green-500">Recovery Alerts</Label>
                      <p className="text-xs text-muted-foreground">
                        Get notified when a down endpoint comes back online
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="recovery-alerts"
                    checked={recoveryAlertsEnabled}
                    onCheckedChange={setRecoveryAlertsEnabled}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Analytics Link */}
          <Button
            variant="outline"
            className="w-full border-cyan-500/50 hover:bg-cyan-500/10"
            onClick={() => navigate('/dashboard/merchant/webhook-analytics')}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            View Webhook Analytics Dashboard
          </Button>

          {/* Health Check Tips */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium text-sm mb-2">💡 Health Check Tips</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Health checks use HEAD requests to minimize bandwidth</li>
              <li>• Response times under 500ms are considered optimal</li>
              <li>• Endpoints are marked unhealthy after {failureThreshold}+ consecutive failures</li>
              <li>• Enable monitoring to receive automatic periodic health checks</li>
              <li>• Enable email alerts to get notified when endpoints go down</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex flex-col pb-20 lg:pb-0">
        <Header />
        <TradingViewTicker />
        <HeroBanner title="Merchant API" subtitle="Connect your wallet to access API keys" />
        <main className="container mx-auto px-4 py-12 flex-1">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Please connect your wallet to access the API integration panel</p>
            </CardContent>
          </Card>
        </main>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 lg:pb-0">
      <Header />
      <TradingViewTicker />
      <HeroBanner 
        title="Merchant API Integration" 
        subtitle="Production & Sandbox API keys with real-time payment links"
      />
      
      <main className="container mx-auto px-4 py-6 space-y-6 flex-1">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/dashboard" className="flex items-center gap-1">
                  <Home className="h-3.5 w-3.5" />
                  Dashboard
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/dashboard/merchant">Merchant</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>API Integration</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Environment Switcher */}
        <Card className="border-primary/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {environment === "sandbox" ? (
                  <TestTube className="h-6 w-6 text-yellow-500" />
                ) : (
                  <Globe className="h-6 w-6 text-green-500" />
                )}
                <div>
                  <CardTitle>API Environment</CardTitle>
                  <CardDescription>Switch between sandbox and production</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm ${environment === "sandbox" ? "text-yellow-500 font-semibold" : "text-muted-foreground"}`}>
                  Sandbox
                </span>
                <Switch
                  checked={environment === "production"}
                  onCheckedChange={(checked) => setEnvironment(checked ? "production" : "sandbox")}
                />
                <span className={`text-sm ${environment === "production" ? "text-green-500 font-semibold" : "text-muted-foreground"}`}>
                  Production
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className={`p-4 rounded-lg ${environment === "sandbox" ? "bg-yellow-500/10 border border-yellow-500/30" : "bg-green-500/10 border border-green-500/30"}`}>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={environment === "sandbox" ? "secondary" : "default"} className={environment === "production" ? "bg-green-600" : "bg-yellow-600"}>
                  {environment === "sandbox" ? "Sandbox Mode" : "Production Mode"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {environment === "sandbox" 
                  ? "Use sandbox for testing. No real transactions will be processed."
                  : "Production mode. All transactions are live and will process real payments."}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* API Keys Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">API Key</CardTitle>
                </div>
                <Badge variant="outline">{environment}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={currentApiKey}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(currentApiKey, "API Key")}
                >
                  {copiedText === "API Key" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => regenerateKey("api", environment)}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Use this key in the <code className="bg-muted px-1 rounded">X-API-Key</code> header
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Secret Key</CardTitle>
                </div>
                <Badge variant="outline">{environment}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  type="password"
                  value={currentSecretKey}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(currentSecretKey, "Secret Key")}
                >
                  {copiedText === "Secret Key" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => regenerateKey("secret", environment)}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Keep this secret! Used for webhook signature verification
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Base URL */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Base URL</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <code className={`flex-1 p-3 rounded-lg font-mono text-sm ${environment === "sandbox" ? "bg-yellow-500/10 text-yellow-500" : "bg-green-500/10 text-green-500"}`}>
                {currentBaseUrl}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(currentBaseUrl, "Base URL")}
              >
                {copiedText === "Base URL" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Payment Link Generator */}
        <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-rose-500/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <CardTitle>Quick Payment Link Generator</CardTitle>
            </div>
            <CardDescription>Generate payment links instantly for {environment} environment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-background/50 rounded-lg border">
              <Label className="text-sm text-muted-foreground mb-2 block">Generated Payment Link</Label>
              <div className="flex gap-2">
                <Input
                  value={generatePaymentLink(environment)}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(generatePaymentLink(environment), "Payment Link")}
                >
                  {copiedText === "Payment Link" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(generatePaymentLink(environment), '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {environment === "sandbox" 
                ? "⚠️ Sandbox links are for testing only and won't process real payments"
                : "✅ Production links will process real PM token payments"}
            </p>
          </CardContent>
        </Card>

        {/* API Endpoints Documentation */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Code className="h-5 w-5 text-primary" />
              <CardTitle>API Endpoints</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="create" className="space-y-4">
              <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full">
                {endpoints.map((endpoint, idx) => (
                  <TabsTrigger key={idx} value={endpoint.name.toLowerCase().replace(/\s/g, '-')}>
                    {endpoint.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {endpoints.map((endpoint, idx) => (
                <TabsContent key={idx} value={endpoint.name.toLowerCase().replace(/\s/g, '-')} className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Badge className={endpoint.method === "POST" ? "bg-green-600" : "bg-blue-600"}>
                      {endpoint.method}
                    </Badge>
                    <code className="text-primary font-mono">{currentBaseUrl}{endpoint.path}</code>
                  </div>
                  <p className="text-muted-foreground mb-4">{endpoint.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="mb-2 block">Request</Label>
                      <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                        {JSON.stringify(endpoint.requestExample, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <Label className="mb-2 block">Response</Label>
                      <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto text-green-500">
                        {JSON.stringify(endpoint.responseExample, null, 2)}
                      </pre>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Code Example */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Start Example</CardTitle>
            <CardDescription>Create a payment using cURL or JavaScript</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="curl">
              <TabsList>
                <TabsTrigger value="curl">cURL</TabsTrigger>
                <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              </TabsList>
              
              <TabsContent value="curl" className="mt-4">
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`curl -X POST ${currentBaseUrl}/payments/create \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ${currentApiKey}" \\
  -d '{
    "amount": "100.00",
    "currency": "PM",
    "order_id": "ORDER-12345",
    "callback_url": "https://yoursite.com/webhook"
  }'`}
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => copyToClipboard(
                    `curl -X POST ${currentBaseUrl}/payments/create -H "Content-Type: application/json" -H "X-API-Key: ${currentApiKey}" -d '{"amount": "100.00", "currency": "PM", "order_id": "ORDER-12345", "callback_url": "https://yoursite.com/webhook"}'`,
                    "cURL"
                  )}
                >
                  {copiedText === "cURL" ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                  Copy
                </Button>
              </TabsContent>
              
              <TabsContent value="javascript" className="mt-4">
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`const response = await fetch('${currentBaseUrl}/payments/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': '${currentApiKey}'
  },
  body: JSON.stringify({
    amount: '100.00',
    currency: 'PM',
    order_id: 'ORDER-12345',
    callback_url: 'https://yoursite.com/webhook'
  })
});

const data = await response.json();
console.log(data.payment_url);`}
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => copyToClipboard(
                    `const response = await fetch('${currentBaseUrl}/payments/create', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-API-Key': '${currentApiKey}' }, body: JSON.stringify({ amount: '100.00', currency: 'PM', order_id: 'ORDER-12345', callback_url: 'https://yoursite.com/webhook' }) });`,
                    "JavaScript"
                  )}
                >
                  {copiedText === "JavaScript" ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                  Copy
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Webhook Testing Tool */}
        <WebhookTestingTool 
          address={address}
          environment={environment}
          currentSecretKey={currentSecretKey}
        />

        {/* Webhook Health Check */}
        <WebhookHealthCheck environment={environment} />

        {/* Rate Limiting Visualization */}
        <RateLimitingVisualization />

        {/* Webhook Simulator */}
        <WebhookSimulator environment={environment} />

        {/* Webhook Payload Templates */}
        <WebhookPayloadTemplates />

        {/* Webhook Retry Queue */}
        <WebhookRetryQueue />

        {/* Webhook Payload Validator */}
        <WebhookPayloadValidator />

        {/* Notification Preferences */}
        <NotificationPreferences />

        {/* Webhook Analytics Link */}
        <Card className="border-cyan-500/30 bg-gradient-to-r from-cyan-500/5 to-blue-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-cyan-500/20">
                  <BarChart3 className="h-6 w-6 text-cyan-500" />
                </div>
                <div>
                  <h3 className="font-semibold">Webhook Analytics Dashboard</h3>
                  <p className="text-sm text-muted-foreground">
                    View delivery success rates, response times, and event volumes
                  </p>
                </div>
              </div>
              <Button onClick={() => navigate('/dashboard/merchant/webhook-analytics')}>
                View Analytics
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Embeddable Payment Widget */}
        <EmbeddablePaymentWidget merchantWallet={address || ""} />

        {/* Webhook Integration */}
        <Card className="border-purple-500/30 bg-gradient-to-r from-purple-500/5 to-pink-500/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-500" />
              <CardTitle>Webhook Integration</CardTitle>
            </div>
            <CardDescription>Receive real-time payment status updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-background/50 rounded-lg border space-y-3">
              <div>
                <Label className="text-sm font-medium">Webhook Endpoint</Label>
                <code className="block mt-1 p-2 bg-muted rounded text-sm font-mono">
                  https://ihuqvxvcqnrdxphqxpqr.supabase.co/functions/v1/payment-webhook
                </code>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Supported Events</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline">payment.created</Badge>
                  <Badge variant="outline">payment.completed</Badge>
                  <Badge variant="outline">payment.failed</Badge>
                  <Badge variant="outline">payment.expired</Badge>
                  <Badge variant="outline">payment.refunded</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Webhook Payload Example</Label>
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto text-purple-400">
{`{
  "event": "payment.completed",
  "payment_id": "pay_abc123xyz",
  "merchant_id": "${address?.slice(0, 10) || 'your_id'}",
  "amount": "100.00",
  "currency": "PM",
  "order_id": "ORDER-12345",
  "tx_hash": "0x1234...abcd",
  "status": "completed",
  "timestamp": "${new Date().toISOString()}"
}`}
              </pre>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Signature Verification</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Verify webhook authenticity using the X-Webhook-Signature header with your secret key:
              </p>
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`// Verify webhook signature
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expected = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  return signature === expected;
}

// In your webhook handler
app.post('/webhook', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const isValid = verifyWebhook(req.body, signature, YOUR_SECRET);
  
  if (!isValid) {
    return res.status(401).send('Invalid signature');
  }
  
  // Process the webhook event
  const { event, payment_id, status } = req.body;
  console.log(\`Payment \${payment_id}: \${event}\`);
  
  res.status(200).send('OK');
});`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default MerchantAPI;
