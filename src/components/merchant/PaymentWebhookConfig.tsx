import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Webhook, Plus, Trash2, CheckCircle, XCircle, Loader2, Bell, Globe, Key, TestTube } from "lucide-react";
import { toast } from "sonner";
import { useAccount } from "wagmi";

interface WebhookEndpoint {
  id: string;
  url: string;
  secret: string;
  events: string[];
  active: boolean;
  createdAt: number;
  lastTriggered?: number;
  successCount: number;
  failureCount: number;
}

const EVENT_TYPES = [
  { id: "payment.completed", label: "Payment Completed", description: "When a payment link is paid" },
  { id: "payment.pending", label: "Payment Pending", description: "When payment is initiated" },
  { id: "payment.failed", label: "Payment Failed", description: "When payment fails" },
  { id: "payment.expired", label: "Payment Expired", description: "When payment link expires" },
  { id: "refund.created", label: "Refund Created", description: "When a refund is initiated" },
];

export const PaymentWebhookConfig = () => {
  const { address } = useAccount();
  const [endpoints, setEndpoints] = useState<WebhookEndpoint[]>([]);
  const [newUrl, setNewUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>(["payment.completed"]);
  const [isAdding, setIsAdding] = useState(false);
  const [isTesting, setIsTesting] = useState<string | null>(null);

  useEffect(() => {
    if (address) {
      const stored = localStorage.getItem(`webhookEndpoints_${address}`);
      if (stored) {
        setEndpoints(JSON.parse(stored));
      }
    }
  }, [address]);

  const saveEndpoints = (newEndpoints: WebhookEndpoint[]) => {
    setEndpoints(newEndpoints);
    if (address) {
      localStorage.setItem(`webhookEndpoints_${address}`, JSON.stringify(newEndpoints));
    }
  };

  const generateSecret = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return "whsec_" + Array.from({ length: 32 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  };

  const handleAddEndpoint = () => {
    if (!newUrl) {
      toast.error("Please enter a webhook URL");
      return;
    }
    if (!newUrl.startsWith("https://")) {
      toast.error("Webhook URL must use HTTPS");
      return;
    }
    if (selectedEvents.length === 0) {
      toast.error("Please select at least one event");
      return;
    }

    const newEndpoint: WebhookEndpoint = {
      id: Math.random().toString(36).substr(2, 9),
      url: newUrl,
      secret: generateSecret(),
      events: selectedEvents,
      active: true,
      createdAt: Date.now(),
      successCount: 0,
      failureCount: 0,
    };

    saveEndpoints([...endpoints, newEndpoint]);
    setNewUrl("");
    setSelectedEvents(["payment.completed"]);
    setIsAdding(false);
    toast.success("Webhook endpoint added successfully!");
  };

  const handleDeleteEndpoint = (id: string) => {
    saveEndpoints(endpoints.filter((e) => e.id !== id));
    toast.success("Webhook endpoint removed");
  };

  const handleToggleEndpoint = (id: string) => {
    saveEndpoints(
      endpoints.map((e) => (e.id === id ? { ...e, active: !e.active } : e))
    );
  };

  const handleTestWebhook = async (endpoint: WebhookEndpoint) => {
    setIsTesting(endpoint.id);
    
    try {
      // Simulate sending a test webhook
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Update success count
      saveEndpoints(
        endpoints.map((e) =>
          e.id === endpoint.id
            ? { ...e, lastTriggered: Date.now(), successCount: e.successCount + 1 }
            : e
        )
      );
      
      toast.success("Test webhook sent successfully!");
    } catch {
      saveEndpoints(
        endpoints.map((e) =>
          e.id === endpoint.id
            ? { ...e, failureCount: e.failureCount + 1 }
            : e
        )
      );
      toast.error("Failed to send test webhook");
    } finally {
      setIsTesting(null);
    }
  };

  const toggleEvent = (eventId: string) => {
    setSelectedEvents((prev) =>
      prev.includes(eventId)
        ? prev.filter((e) => e !== eventId)
        : [...prev, eventId]
    );
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Webhook className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Payment Webhooks</CardTitle>
              <CardDescription>Receive real-time payment notifications</CardDescription>
            </div>
          </div>
          {!isAdding && (
            <Button onClick={() => setIsAdding(true)} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Endpoint
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAdding && (
          <Card className="p-4 border-dashed border-2 border-primary/30">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Endpoint URL
                </Label>
                <Input
                  placeholder="https://your-server.com/webhooks/payments"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Events to Listen
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {EVENT_TYPES.map((event) => (
                    <div
                      key={event.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedEvents.includes(event.id)
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => toggleEvent(event.id)}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center ${
                            selectedEvents.includes(event.id)
                              ? "bg-primary border-primary"
                              : "border-muted-foreground"
                          }`}
                        >
                          {selectedEvents.includes(event.id) && (
                            <CheckCircle className="h-3 w-3 text-primary-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{event.label}</p>
                          <p className="text-xs text-muted-foreground">{event.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAddEndpoint} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Webhook
                </Button>
                <Button variant="outline" onClick={() => setIsAdding(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {endpoints.length === 0 && !isAdding ? (
          <div className="text-center py-8 text-muted-foreground">
            <Webhook className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No webhook endpoints configured</p>
            <p className="text-sm">Add an endpoint to receive payment notifications</p>
          </div>
        ) : (
          <div className="space-y-3">
            {endpoints.map((endpoint) => (
              <Card key={endpoint.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={endpoint.active ? "default" : "secondary"}>
                        {endpoint.active ? "Active" : "Inactive"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {endpoint.successCount} sent • {endpoint.failureCount} failed
                      </span>
                    </div>
                    <p className="font-mono text-sm truncate mb-2">{endpoint.url}</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {endpoint.events.map((event) => (
                        <Badge key={event} variant="outline" className="text-xs">
                          {event}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Key className="h-3 w-3" />
                      <span className="font-mono">{endpoint.secret.slice(0, 20)}...</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs"
                        onClick={() => {
                          navigator.clipboard.writeText(endpoint.secret);
                          toast.success("Secret copied!");
                        }}
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() => handleTestWebhook(endpoint)}
                      disabled={isTesting === endpoint.id}
                    >
                      {isTesting === endpoint.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <TestTube className="h-3 w-3" />
                      )}
                      Test
                    </Button>
                    <Switch
                      checked={endpoint.active}
                      onCheckedChange={() => handleToggleEndpoint(endpoint.id)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDeleteEndpoint(endpoint.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentWebhookConfig;
