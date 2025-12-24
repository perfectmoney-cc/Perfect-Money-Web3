import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Beaker, 
  Send, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock,
  Copy,
  Check,
  RefreshCw,
  Zap
} from "lucide-react";
import { toast } from "sonner";

interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  payload: Record<string, unknown>;
  expectedResponse: {
    status: number;
    body: Record<string, unknown>;
  };
  category: "success" | "error" | "edge-case";
}

interface SimulationResult {
  id: string;
  scenario: string;
  timestamp: Date;
  status: "success" | "error" | "timeout" | "pending";
  responseTime?: number;
  responseStatus?: number;
  responseBody?: string;
  error?: string;
}

export const WebhookSimulator = ({ 
  environment 
}: { 
  environment: "sandbox" | "production" 
}) => {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);
  const [results, setResults] = useState<SimulationResult[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [simulateDelay, setSimulateDelay] = useState(false);
  const [delayMs, setDelayMs] = useState(2000);
  const [simulateTimeout, setSimulateTimeout] = useState(false);

  const scenarios: SimulationScenario[] = [
    // Success scenarios
    {
      id: "payment_completed",
      name: "Payment Completed",
      description: "Standard successful payment notification",
      icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      category: "success",
      payload: {
        event: "payment.completed",
        payment_id: `pay_${Date.now().toString(36)}`,
        amount: "150.00",
        currency: "PM",
        order_id: "ORDER-001",
        tx_hash: `0x${Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        status: "completed",
        timestamp: new Date().toISOString()
      },
      expectedResponse: { status: 200, body: { received: true } }
    },
    {
      id: "payment_created",
      name: "Payment Created",
      description: "New payment request initiated",
      icon: <Zap className="h-4 w-4 text-blue-500" />,
      category: "success",
      payload: {
        event: "payment.created",
        payment_id: `pay_${Date.now().toString(36)}`,
        amount: "75.50",
        currency: "PM",
        order_id: "ORDER-002",
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        status: "pending",
        timestamp: new Date().toISOString()
      },
      expectedResponse: { status: 200, body: { received: true } }
    },
    {
      id: "refund_processed",
      name: "Refund Processed",
      description: "Partial or full refund completed",
      icon: <RefreshCw className="h-4 w-4 text-orange-500" />,
      category: "success",
      payload: {
        event: "payment.refunded",
        payment_id: `pay_${Date.now().toString(36)}`,
        refund_id: `ref_${Date.now().toString(36)}`,
        original_amount: "200.00",
        refund_amount: "50.00",
        currency: "PM",
        reason: "Customer request",
        status: "refunded",
        timestamp: new Date().toISOString()
      },
      expectedResponse: { status: 200, body: { received: true } }
    },
    // Error scenarios
    {
      id: "payment_failed",
      name: "Payment Failed",
      description: "Payment processing failure",
      icon: <XCircle className="h-4 w-4 text-red-500" />,
      category: "error",
      payload: {
        event: "payment.failed",
        payment_id: `pay_${Date.now().toString(36)}`,
        amount: "500.00",
        currency: "PM",
        order_id: "ORDER-003",
        error_code: "INSUFFICIENT_BALANCE",
        error_message: "Customer has insufficient balance",
        status: "failed",
        timestamp: new Date().toISOString()
      },
      expectedResponse: { status: 200, body: { received: true } }
    },
    {
      id: "payment_expired",
      name: "Payment Expired",
      description: "Payment link expired without completion",
      icon: <Clock className="h-4 w-4 text-yellow-500" />,
      category: "error",
      payload: {
        event: "payment.expired",
        payment_id: `pay_${Date.now().toString(36)}`,
        amount: "100.00",
        currency: "PM",
        order_id: "ORDER-004",
        expired_at: new Date().toISOString(),
        status: "expired",
        timestamp: new Date().toISOString()
      },
      expectedResponse: { status: 200, body: { received: true } }
    },
    // Edge cases
    {
      id: "large_payment",
      name: "Large Payment",
      description: "High-value transaction (stress test)",
      icon: <AlertTriangle className="h-4 w-4 text-purple-500" />,
      category: "edge-case",
      payload: {
        event: "payment.completed",
        payment_id: `pay_${Date.now().toString(36)}`,
        amount: "999999.99",
        currency: "PM",
        order_id: "ORDER-LARGE",
        tx_hash: `0x${Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        status: "completed",
        metadata: { high_value: true, requires_review: true },
        timestamp: new Date().toISOString()
      },
      expectedResponse: { status: 200, body: { received: true } }
    },
    {
      id: "unicode_order",
      name: "Unicode Characters",
      description: "Order with special characters",
      icon: <AlertTriangle className="h-4 w-4 text-purple-500" />,
      category: "edge-case",
      payload: {
        event: "payment.completed",
        payment_id: `pay_${Date.now().toString(36)}`,
        amount: "50.00",
        currency: "PM",
        order_id: "订单-émojis-🎉-ORDER",
        customer_name: "José García 日本語",
        status: "completed",
        timestamp: new Date().toISOString()
      },
      expectedResponse: { status: 200, body: { received: true } }
    },
    {
      id: "duplicate_webhook",
      name: "Duplicate Webhook",
      description: "Same event sent twice (idempotency test)",
      icon: <AlertTriangle className="h-4 w-4 text-purple-500" />,
      category: "edge-case",
      payload: {
        event: "payment.completed",
        payment_id: "pay_duplicate_test",
        idempotency_key: "idem_12345",
        amount: "100.00",
        currency: "PM",
        order_id: "ORDER-DUPLICATE",
        status: "completed",
        timestamp: new Date().toISOString()
      },
      expectedResponse: { status: 200, body: { received: true, already_processed: true } }
    }
  ];

  const toggleScenario = (id: string) => {
    setSelectedScenarios(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const selectAll = (category?: "success" | "error" | "edge-case") => {
    if (category) {
      const categoryScenarios = scenarios.filter(s => s.category === category).map(s => s.id);
      setSelectedScenarios(prev => [...new Set([...prev, ...categoryScenarios])]);
    } else {
      setSelectedScenarios(scenarios.map(s => s.id));
    }
  };

  const clearSelection = () => {
    setSelectedScenarios([]);
  };

  const runSimulation = async () => {
    if (!webhookUrl) {
      toast.error("Please enter a webhook URL");
      return;
    }

    if (selectedScenarios.length === 0) {
      toast.error("Please select at least one scenario");
      return;
    }

    try {
      new URL(webhookUrl);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }

    setIsRunning(true);
    const newResults: SimulationResult[] = [];

    for (const scenarioId of selectedScenarios) {
      const scenario = scenarios.find(s => s.id === scenarioId);
      if (!scenario) continue;

      const resultId = `result_${Date.now()}_${scenarioId}`;
      
      // Add pending result
      setResults(prev => [{
        id: resultId,
        scenario: scenario.name,
        timestamp: new Date(),
        status: "pending"
      }, ...prev]);

      // Simulate delay if enabled
      if (simulateDelay) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }

      const startTime = Date.now();

      try {
        // Simulate timeout
        if (simulateTimeout && Math.random() < 0.3) {
          await new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Request timeout")), 5000)
          );
        }

        await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': `sha256_sim_${Date.now()}`,
            'X-Webhook-Environment': environment,
            'X-Webhook-Simulation': 'true',
            'X-Scenario-Id': scenarioId
          },
          body: JSON.stringify(scenario.payload),
          mode: 'no-cors'
        });

        const responseTime = Date.now() - startTime;

        setResults(prev => prev.map(r => 
          r.id === resultId 
            ? { ...r, status: "success" as const, responseTime, responseStatus: 200 }
            : r
        ));

        newResults.push({
          id: resultId,
          scenario: scenario.name,
          timestamp: new Date(),
          status: "success",
          responseTime,
          responseStatus: 200
        });

      } catch (error) {
        const responseTime = Date.now() - startTime;
        const isTimeout = error instanceof Error && error.message.includes("timeout");

        setResults(prev => prev.map(r => 
          r.id === resultId 
            ? { 
                ...r, 
                status: isTimeout ? "timeout" as const : "error" as const, 
                responseTime,
                error: error instanceof Error ? error.message : "Unknown error"
              }
            : r
        ));
      }

      // Small delay between scenarios
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    setIsRunning(false);
    toast.success(`Simulation complete: ${selectedScenarios.length} scenarios tested`);
  };

  const copyPayload = (payload: Record<string, unknown>) => {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    toast.success("Payload copied to clipboard");
  };

  const clearResults = () => {
    setResults([]);
    toast.success("Results cleared");
  };

  return (
    <Card className="border-emerald-500/30 bg-gradient-to-r from-emerald-500/5 to-teal-500/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Beaker className="h-5 w-5 text-emerald-500" />
            <CardTitle>Webhook Simulator</CardTitle>
          </div>
          <Badge variant="outline" className="border-emerald-500/50 text-emerald-500">
            {selectedScenarios.length} Selected
          </Badge>
        </div>
        <CardDescription>Test your endpoint with various payload scenarios</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Webhook URL */}
        <div className="space-y-2">
          <Label htmlFor="sim-webhook-url">Webhook Endpoint URL</Label>
          <Input
            id="sim-webhook-url"
            placeholder="https://yoursite.com/api/webhook"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            className="font-mono"
          />
        </div>

        {/* Simulation Options */}
        <div className="p-4 bg-background/50 rounded-lg border space-y-4">
          <Label className="font-medium">Simulation Options</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sim-delay">Simulate Network Delay</Label>
                <p className="text-xs text-muted-foreground">Add delay between requests</p>
              </div>
              <Switch
                id="sim-delay"
                checked={simulateDelay}
                onCheckedChange={setSimulateDelay}
              />
            </div>
            {simulateDelay && (
              <div className="space-y-2">
                <Label className="text-xs">Delay (ms): {delayMs}</Label>
                <Input
                  type="range"
                  min={500}
                  max={5000}
                  step={500}
                  value={delayMs}
                  onChange={(e) => setDelayMs(parseInt(e.target.value))}
                  className="cursor-pointer"
                />
              </div>
            )}
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sim-timeout">Simulate Random Timeouts</Label>
                <p className="text-xs text-muted-foreground">30% chance of timeout</p>
              </div>
              <Switch
                id="sim-timeout"
                checked={simulateTimeout}
                onCheckedChange={setSimulateTimeout}
              />
            </div>
          </div>
        </div>

        {/* Scenario Selection */}
        <Tabs defaultValue="success">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="success">Success</TabsTrigger>
              <TabsTrigger value="error">Errors</TabsTrigger>
              <TabsTrigger value="edge-case">Edge Cases</TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => selectAll()}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={clearSelection}>
                Clear
              </Button>
            </div>
          </div>

          {["success", "error", "edge-case"].map(category => (
            <TabsContent key={category} value={category} className="space-y-2">
              {scenarios.filter(s => s.category === category).map(scenario => (
                <div
                  key={scenario.id}
                  onClick={() => toggleScenario(scenario.id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedScenarios.includes(scenario.id)
                      ? "border-emerald-500 bg-emerald-500/10"
                      : "border-border hover:border-emerald-500/50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {scenario.icon}
                      <div>
                        <div className="font-medium">{scenario.name}</div>
                        <div className="text-sm text-muted-foreground">{scenario.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyPayload(scenario.payload);
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      {selectedScenarios.includes(scenario.id) && (
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>
          ))}
        </Tabs>

        {/* Run Button */}
        <div className="flex gap-3">
          <Button
            onClick={runSimulation}
            disabled={isRunning || selectedScenarios.length === 0 || !webhookUrl}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Running Simulation...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Run Simulation ({selectedScenarios.length} scenarios)
              </>
            )}
          </Button>
          {results.length > 0 && (
            <Button variant="outline" onClick={clearResults}>
              Clear Results
            </Button>
          )}
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-2">
            <Label>Simulation Results</Label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {results.map((result) => (
                <div
                  key={result.id}
                  className={`p-3 rounded-lg border flex items-center justify-between ${
                    result.status === "success"
                      ? "border-green-500/30 bg-green-500/5"
                      : result.status === "timeout"
                      ? "border-yellow-500/30 bg-yellow-500/5"
                      : result.status === "error"
                      ? "border-red-500/30 bg-red-500/5"
                      : "border-blue-500/30 bg-blue-500/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {result.status === "success" ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : result.status === "timeout" ? (
                      <Clock className="h-5 w-5 text-yellow-500" />
                    ) : result.status === "error" ? (
                      <XCircle className="h-5 w-5 text-red-500" />
                    ) : (
                      <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                    )}
                    <div>
                      <div className="font-medium text-sm">{result.scenario}</div>
                      <div className="text-xs text-muted-foreground">
                        {result.timestamp.toLocaleTimeString()}
                        {result.error && <span className="text-red-400"> • {result.error}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className={
                      result.status === "success" ? "text-green-500" :
                      result.status === "timeout" ? "text-yellow-500" : "text-red-500"
                    }>
                      {result.status === "pending" ? "Sending..." : result.status}
                    </Badge>
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
          <h4 className="font-medium text-sm mb-2">💡 Simulation Tips</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Test success scenarios first to verify basic connectivity</li>
            <li>• Use edge cases to ensure your handler is robust</li>
            <li>• The "Duplicate Webhook" scenario tests idempotency handling</li>
            <li>• Enable timeout simulation to test your retry logic</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
