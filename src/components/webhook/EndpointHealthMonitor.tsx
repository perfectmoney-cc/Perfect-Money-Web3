import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Bell,
  BellOff,
  Plus,
  Trash2,
  Clock,
  Zap
} from "lucide-react";

interface Endpoint {
  id: string;
  url: string;
  name: string;
  status: "healthy" | "degraded" | "down" | "unknown";
  lastChecked: Date | null;
  responseTime: number | null;
  uptime: number;
  consecutiveFailures: number;
  alertsEnabled: boolean;
}

const generateMockEndpoints = (): Endpoint[] => [
  {
    id: "1",
    url: "https://api.merchant.com/webhooks/payments",
    name: "Payment Webhook",
    status: "healthy",
    lastChecked: new Date(),
    responseTime: 145,
    uptime: 99.8,
    consecutiveFailures: 0,
    alertsEnabled: true,
  },
  {
    id: "2",
    url: "https://api.merchant.com/webhooks/orders",
    name: "Order Webhook",
    status: "healthy",
    lastChecked: new Date(),
    responseTime: 203,
    uptime: 99.5,
    consecutiveFailures: 0,
    alertsEnabled: true,
  },
  {
    id: "3",
    url: "https://api.merchant.com/webhooks/subscriptions",
    name: "Subscription Webhook",
    status: "degraded",
    lastChecked: new Date(),
    responseTime: 890,
    uptime: 95.2,
    consecutiveFailures: 2,
    alertsEnabled: true,
  },
];

export const EndpointHealthMonitor = () => {
  const [endpoints, setEndpoints] = useState<Endpoint[]>(generateMockEndpoints);
  const [isChecking, setIsChecking] = useState(false);
  const [newEndpointUrl, setNewEndpointUrl] = useState("");
  const [newEndpointName, setNewEndpointName] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [alertThreshold, setAlertThreshold] = useState(3);

  // Simulate periodic health checks
  useEffect(() => {
    const interval = setInterval(() => {
      setEndpoints(prev => prev.map(endpoint => {
        const random = Math.random();
        let newStatus: Endpoint["status"] = endpoint.status;
        let newResponseTime = endpoint.responseTime;
        let newConsecutiveFailures = endpoint.consecutiveFailures;

        if (random > 0.95) {
          // Simulate failure
          newStatus = "down";
          newResponseTime = null;
          newConsecutiveFailures = endpoint.consecutiveFailures + 1;
          
          if (newConsecutiveFailures >= alertThreshold && endpoint.alertsEnabled) {
            toast.error(`Alert: ${endpoint.name} is unresponsive!`, {
              description: `${newConsecutiveFailures} consecutive failures detected.`,
            });
          }
        } else if (random > 0.85) {
          // Simulate degradation
          newStatus = "degraded";
          newResponseTime = 500 + Math.random() * 1000;
          newConsecutiveFailures = 0;
        } else {
          // Healthy
          newStatus = "healthy";
          newResponseTime = 100 + Math.random() * 200;
          newConsecutiveFailures = 0;
        }

        return {
          ...endpoint,
          status: newStatus,
          lastChecked: new Date(),
          responseTime: newResponseTime ? Math.round(newResponseTime) : null,
          consecutiveFailures: newConsecutiveFailures,
          uptime: newStatus === "healthy" 
            ? Math.min(100, endpoint.uptime + 0.01)
            : Math.max(0, endpoint.uptime - 0.1),
        };
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, [alertThreshold]);

  const checkAllEndpoints = async () => {
    setIsChecking(true);
    
    // Simulate health check
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setEndpoints(prev => prev.map(endpoint => ({
      ...endpoint,
      lastChecked: new Date(),
      status: Math.random() > 0.1 ? "healthy" : "degraded",
      responseTime: Math.round(100 + Math.random() * 300),
    })));
    
    setIsChecking(false);
    toast.success("All endpoints checked");
  };

  const addEndpoint = () => {
    if (!newEndpointUrl || !newEndpointName) {
      toast.error("Please fill in all fields");
      return;
    }

    const newEndpoint: Endpoint = {
      id: Date.now().toString(),
      url: newEndpointUrl,
      name: newEndpointName,
      status: "unknown",
      lastChecked: null,
      responseTime: null,
      uptime: 100,
      consecutiveFailures: 0,
      alertsEnabled: true,
    };

    setEndpoints(prev => [...prev, newEndpoint]);
    setNewEndpointUrl("");
    setNewEndpointName("");
    setShowAddForm(false);
    toast.success("Endpoint added successfully");
  };

  const removeEndpoint = (id: string) => {
    setEndpoints(prev => prev.filter(e => e.id !== id));
    toast.info("Endpoint removed");
  };

  const toggleAlerts = (id: string) => {
    setEndpoints(prev => prev.map(e => 
      e.id === id ? { ...e, alertsEnabled: !e.alertsEnabled } : e
    ));
  };

  const getStatusIcon = (status: Endpoint["status"]) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "degraded":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "down":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: Endpoint["status"]) => {
    switch (status) {
      case "healthy":
        return "bg-green-500/20 text-green-500 border-green-500/30";
      case "degraded":
        return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
      case "down":
        return "bg-red-500/20 text-red-500 border-red-500/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const healthyCount = endpoints.filter(e => e.status === "healthy").length;
  const overallHealth = (healthyCount / endpoints.length) * 100;

  return (
    <Card className="border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-purple-500/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-500/20">
              <Activity className="h-5 w-5 text-violet-500" />
            </div>
            <div>
              <CardTitle className="text-lg">Endpoint Health Monitor</CardTitle>
              <CardDescription>Real-time webhook endpoint monitoring with alerts</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={overallHealth >= 90 ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"}>
              {overallHealth.toFixed(0)}% Healthy
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={checkAllEndpoints}
              disabled={isChecking}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? "animate-spin" : ""}`} />
              Check All
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Endpoint
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Label htmlFor="threshold" className="text-sm text-muted-foreground">
              Alert after
            </Label>
            <Input
              id="threshold"
              type="number"
              min={1}
              max={10}
              value={alertThreshold}
              onChange={(e) => setAlertThreshold(Number(e.target.value))}
              className="w-16 h-8"
            />
            <span className="text-sm text-muted-foreground">failures</span>
          </div>
        </div>

        {/* Add Endpoint Form */}
        {showAddForm && (
          <div className="p-4 rounded-lg border bg-card/50 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="endpoint-name">Endpoint Name</Label>
                <Input
                  id="endpoint-name"
                  placeholder="Payment Webhook"
                  value={newEndpointName}
                  onChange={(e) => setNewEndpointName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endpoint-url">Endpoint URL</Label>
                <Input
                  id="endpoint-url"
                  placeholder="https://api.example.com/webhooks"
                  value={newEndpointUrl}
                  onChange={(e) => setNewEndpointUrl(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={addEndpoint}>Add Endpoint</Button>
              <Button size="sm" variant="ghost" onClick={() => setShowAddForm(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {/* Endpoints List */}
        <div className="space-y-3">
          {endpoints.map((endpoint) => (
            <div
              key={endpoint.id}
              className="p-4 rounded-lg border bg-card/50 hover:bg-card/80 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  {getStatusIcon(endpoint.status)}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{endpoint.name}</span>
                      <Badge variant="outline" className={`text-xs ${getStatusColor(endpoint.status)}`}>
                        {endpoint.status}
                      </Badge>
                      {endpoint.consecutiveFailures > 0 && (
                        <Badge variant="outline" className="bg-red-500/10 text-red-500 text-xs">
                          {endpoint.consecutiveFailures} failures
                        </Badge>
                      )}
                    </div>
                    <code className="text-xs text-muted-foreground">{endpoint.url}</code>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                      {endpoint.responseTime && (
                        <span className="flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          {endpoint.responseTime}ms
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Activity className="h-3 w-3" />
                        {endpoint.uptime.toFixed(1)}% uptime
                      </span>
                      {endpoint.lastChecked && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {endpoint.lastChecked.toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => toggleAlerts(endpoint.id)}
                    title={endpoint.alertsEnabled ? "Disable alerts" : "Enable alerts"}
                  >
                    {endpoint.alertsEnabled ? (
                      <Bell className="h-4 w-4 text-primary" />
                    ) : (
                      <BellOff className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => removeEndpoint(endpoint.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Uptime</span>
                  <span>{endpoint.uptime.toFixed(1)}%</span>
                </div>
                <Progress 
                  value={endpoint.uptime} 
                  className="h-1.5"
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
