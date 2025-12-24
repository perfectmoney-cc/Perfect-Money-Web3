import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, History, Filter, RefreshCw, CheckCircle, XCircle, Clock, AlertTriangle, Search, Download, Eye, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { TradingViewTicker } from "@/components/TradingViewTicker";
import { HeroBanner } from "@/components/HeroBanner";
import { Footer } from "@/components/Footer";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { useAccount } from "wagmi";
import { Lock, Loader2 } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface WebhookLog {
  id: string;
  event: string;
  webhookUrl: string;
  status: "delivered" | "failed" | "pending" | "retrying";
  responseCode?: number;
  responseTime?: number;
  attempts: number;
  maxRetries: number;
  lastAttempt: Date;
  nextRetry?: Date;
  payload: Record<string, unknown>;
  response?: string;
  error?: string;
  createdAt: Date;
}

// Generate mock webhook logs for demonstration
const generateMockLogs = (address: string | undefined): WebhookLog[] => {
  const events = ["payment.completed", "payment.created", "payment.failed", "payment.expired", "payment.refunded"];
  const statuses: WebhookLog["status"][] = ["delivered", "failed", "retrying", "pending"];
  const urls = [
    "https://api.yourstore.com/webhooks/payments",
    "https://hooks.example.com/pm-payments",
    "https://webhook.site/test-endpoint",
  ];

  return Array.from({ length: 25 }, (_, i) => {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const event = events[Math.floor(Math.random() * events.length)];
    const attempts = status === "delivered" ? Math.floor(Math.random() * 3) + 1 : Math.floor(Math.random() * 5) + 1;
    
    return {
      id: `log_${Date.now() - i * 100000}${Math.random().toString(36).slice(-4)}`,
      event,
      webhookUrl: urls[Math.floor(Math.random() * urls.length)],
      status,
      responseCode: status === "delivered" ? 200 : status === "failed" ? [500, 502, 503, 408][Math.floor(Math.random() * 4)] : undefined,
      responseTime: status !== "pending" ? Math.floor(Math.random() * 2000) + 100 : undefined,
      attempts,
      maxRetries: 5,
      lastAttempt: new Date(Date.now() - i * 3600000),
      nextRetry: status === "retrying" ? new Date(Date.now() + Math.pow(2, attempts) * 1000 * 60) : undefined,
      payload: {
        event,
        payment_id: `pay_${Math.random().toString(36).slice(-8)}`,
        merchant_id: address?.slice(0, 10) || "test_merch",
        amount: (Math.random() * 1000).toFixed(2),
        currency: "PM",
        order_id: `ORDER-${Math.floor(Math.random() * 100000)}`,
        timestamp: new Date(Date.now() - i * 3600000).toISOString(),
      },
      response: status === "delivered" ? '{"success": true}' : status === "failed" ? '{"error": "Internal server error"}' : undefined,
      error: status === "failed" ? "Connection timeout after 30s" : undefined,
      createdAt: new Date(Date.now() - i * 3600000),
    };
  });
};

const WebhookLogs = () => {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<WebhookLog[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [eventFilter, setEventFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null);
  const [isRetrying, setIsRetrying] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading logs
    const timer = setTimeout(() => {
      setLogs(generateMockLogs(address));
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [address]);

  useEffect(() => {
    let filtered = [...logs];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        log =>
          log.id.toLowerCase().includes(query) ||
          log.webhookUrl.toLowerCase().includes(query) ||
          log.event.toLowerCase().includes(query) ||
          (log.payload.order_id as string)?.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(log => log.status === statusFilter);
    }

    if (eventFilter !== "all") {
      filtered = filtered.filter(log => log.event === eventFilter);
    }

    setFilteredLogs(filtered);
  }, [logs, searchQuery, statusFilter, eventFilter]);

  const handleRetry = async (log: WebhookLog) => {
    setIsRetrying(log.id);
    
    // Simulate retry
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setLogs(prev =>
      prev.map(l =>
        l.id === log.id
          ? {
              ...l,
              status: Math.random() > 0.3 ? "delivered" : "retrying",
              attempts: l.attempts + 1,
              lastAttempt: new Date(),
              responseCode: Math.random() > 0.3 ? 200 : 500,
              responseTime: Math.floor(Math.random() * 1000) + 100,
            }
          : l
      )
    );
    
    setIsRetrying(null);
    toast.success("Webhook retry initiated");
  };

  const getStatusBadge = (status: WebhookLog["status"]) => {
    switch (status) {
      case "delivered":
        return <Badge className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Delivered</Badge>;
      case "failed":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      case "retrying":
        return <Badge className="bg-yellow-600"><RefreshCw className="h-3 w-3 mr-1 animate-spin" />Retrying</Badge>;
      case "pending":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  const exportLogs = () => {
    const csv = [
      ["ID", "Event", "Status", "Response Code", "Attempts", "URL", "Created At"].join(","),
      ...filteredLogs.map(log =>
        [log.id, log.event, log.status, log.responseCode || "", log.attempts, log.webhookUrl, log.createdAt.toISOString()].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `webhook-logs-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Logs exported successfully");
  };

  const stats = {
    total: logs.length,
    delivered: logs.filter(l => l.status === "delivered").length,
    failed: logs.filter(l => l.status === "failed").length,
    retrying: logs.filter(l => l.status === "retrying").length,
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex flex-col pb-20 lg:pb-0">
        <Header />
        <TradingViewTicker />
        <HeroBanner title="Webhook Event Logs" subtitle="Connect your wallet to view webhook logs" />
        <main className="container mx-auto px-4 py-12 flex-1">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Please connect your wallet to access webhook logs</p>
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
        title="Webhook Event Logs"
        subtitle="View all webhook delivery attempts and their statuses"
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
              <BreadcrumbLink asChild>
                <Link to="/dashboard/merchant/api">API</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Webhook Logs</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Events</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <History className="h-8 w-8 text-primary/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-green-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Delivered</p>
                  <p className="text-2xl font-bold text-green-500">{stats.delivered}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-red-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Failed</p>
                  <p className="text-2xl font-bold text-red-500">{stats.failed}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-yellow-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Retrying</p>
                  <p className="text-2xl font-bold text-yellow-500">{stats.retrying}</p>
                </div>
                <RefreshCw className="h-8 w-8 text-yellow-500/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                <CardTitle>Filters</CardTitle>
              </div>
              <Button variant="outline" size="sm" onClick={exportLogs}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by ID, URL, or order..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="retrying">Retrying</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              <Select value={eventFilter} onValueChange={setEventFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by event" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="payment.created">payment.created</SelectItem>
                  <SelectItem value="payment.completed">payment.completed</SelectItem>
                  <SelectItem value="payment.failed">payment.failed</SelectItem>
                  <SelectItem value="payment.expired">payment.expired</SelectItem>
                  <SelectItem value="payment.refunded">payment.refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Webhook Delivery History</CardTitle>
            <CardDescription>
              {filteredLogs.length} of {logs.length} events shown
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No webhook logs found matching your criteria</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredLogs.map(log => (
                  <div
                    key={log.id}
                    className={`p-4 rounded-lg border transition-all hover:bg-muted/50 ${
                      log.status === "delivered"
                        ? "border-green-500/20"
                        : log.status === "failed"
                        ? "border-red-500/20"
                        : log.status === "retrying"
                        ? "border-yellow-500/20"
                        : "border-border"
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {getStatusBadge(log.status)}
                          <Badge variant="outline">{log.event}</Badge>
                          <span className="text-xs text-muted-foreground font-mono">{log.id}</span>
                        </div>
                        <p className="text-sm font-mono text-muted-foreground truncate max-w-md">
                          {log.webhookUrl}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Attempts: {log.attempts}/{log.maxRetries}</span>
                          {log.responseCode && <span>HTTP {log.responseCode}</span>}
                          {log.responseTime && <span>{log.responseTime}ms</span>}
                          <span>{log.lastAttempt.toLocaleString()}</span>
                        </div>
                        {log.nextRetry && (
                          <p className="text-xs text-yellow-500">
                            Next retry: {log.nextRetry.toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedLog(log)}>
                              <Eye className="h-4 w-4 mr-1" />
                              Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Webhook Event Details</DialogTitle>
                              <DialogDescription>{log.id}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-muted-foreground">Status</p>
                                  {getStatusBadge(log.status)}
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Event Type</p>
                                  <Badge variant="outline">{log.event}</Badge>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Attempts</p>
                                  <p className="font-medium">{log.attempts} / {log.maxRetries}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Response Time</p>
                                  <p className="font-medium">{log.responseTime ? `${log.responseTime}ms` : "-"}</p>
                                </div>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground mb-1">Webhook URL</p>
                                <code className="block p-2 bg-muted rounded text-sm font-mono break-all">
                                  {log.webhookUrl}
                                </code>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground mb-1">Payload</p>
                                <pre className="p-3 bg-muted rounded text-sm overflow-x-auto">
                                  {JSON.stringify(log.payload, null, 2)}
                                </pre>
                              </div>
                              {log.response && (
                                <div>
                                  <p className="text-sm text-muted-foreground mb-1">Response</p>
                                  <pre className="p-3 bg-muted rounded text-sm overflow-x-auto text-green-500">
                                    {log.response}
                                  </pre>
                                </div>
                              )}
                              {log.error && (
                                <div>
                                  <p className="text-sm text-muted-foreground mb-1">Error</p>
                                  <pre className="p-3 bg-red-500/10 border border-red-500/30 rounded text-sm text-red-500">
                                    {log.error}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                        {(log.status === "failed" || log.status === "retrying") && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRetry(log)}
                            disabled={isRetrying === log.id}
                          >
                            {isRetrying === log.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <RotateCcw className="h-4 w-4 mr-1" />
                                Retry
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Retry Policy Info */}
        <Card className="border-orange-500/30 bg-gradient-to-r from-orange-500/5 to-amber-500/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-orange-500" />
              <CardTitle>Retry Policy</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Failed webhook deliveries are automatically retried with exponential backoff:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map(attempt => (
                <div
                  key={attempt}
                  className="p-3 bg-background/50 rounded-lg border text-center"
                >
                  <p className="text-sm text-muted-foreground">Attempt {attempt}</p>
                  <p className="font-bold text-orange-500">
                    {attempt === 1 ? "Immediate" : `${Math.pow(2, attempt - 1)} min`}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              After 5 failed attempts, the webhook is marked as permanently failed. You can manually retry at any time.
            </p>
          </CardContent>
        </Card>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default WebhookLogs;
