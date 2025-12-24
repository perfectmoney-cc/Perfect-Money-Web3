import { useState, useEffect } from "react";
import { RefreshCw, Clock, CheckCircle, XCircle, Play, Pause, Trash2, AlertTriangle, RotateCcw, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface RetryQueueItem {
  id: string;
  webhookUrl: string;
  event: string;
  payload: Record<string, unknown>;
  attempts: number;
  maxAttempts: number;
  nextRetryAt: Date;
  lastError: string;
  status: "pending" | "retrying" | "failed" | "completed";
  createdAt: Date;
  lastAttemptAt: Date | null;
}

export const WebhookRetryQueue = () => {
  const [queue, setQueue] = useState<RetryQueueItem[]>(() => {
    // Initialize with mock data
    return [
      {
        id: "retry_1",
        webhookUrl: "https://api.example.com/webhook",
        event: "payment.completed",
        payload: { payment_id: "pay_123", amount: "100.00" },
        attempts: 2,
        maxAttempts: 5,
        nextRetryAt: new Date(Date.now() + 30000),
        lastError: "Connection timeout",
        status: "pending",
        createdAt: new Date(Date.now() - 300000),
        lastAttemptAt: new Date(Date.now() - 60000)
      },
      {
        id: "retry_2",
        webhookUrl: "https://store.example.com/hooks/payment",
        event: "payment.failed",
        payload: { payment_id: "pay_456", error: "Insufficient funds" },
        attempts: 4,
        maxAttempts: 5,
        nextRetryAt: new Date(Date.now() + 120000),
        lastError: "HTTP 503 Service Unavailable",
        status: "pending",
        createdAt: new Date(Date.now() - 600000),
        lastAttemptAt: new Date(Date.now() - 180000)
      },
      {
        id: "retry_3",
        webhookUrl: "https://app.example.com/notifications",
        event: "refund.processed",
        payload: { refund_id: "ref_789", amount: "50.00" },
        attempts: 5,
        maxAttempts: 5,
        nextRetryAt: new Date(),
        lastError: "HTTP 500 Internal Server Error",
        status: "failed",
        createdAt: new Date(Date.now() - 900000),
        lastAttemptAt: new Date(Date.now() - 300000)
      }
    ];
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "failed">("all");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Calculate countdown timers
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const getTimeUntilRetry = (nextRetryAt: Date) => {
    const diff = nextRetryAt.getTime() - Date.now();
    if (diff <= 0) return "Now";
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  };

  const filteredQueue = queue.filter(item => {
    if (filterStatus === "all") return true;
    return item.status === filterStatus;
  });

  const retryNow = async (itemId: string) => {
    setQueue(prev => prev.map(item => 
      item.id === itemId ? { ...item, status: "retrying" as const } : item
    ));

    // Simulate retry attempt
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 50% chance of success for demo
    const success = Math.random() > 0.5;

    setQueue(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      
      if (success) {
        return { ...item, status: "completed" as const };
      } else {
        const newAttempts = item.attempts + 1;
        return {
          ...item,
          status: newAttempts >= item.maxAttempts ? "failed" as const : "pending" as const,
          attempts: newAttempts,
          lastAttemptAt: new Date(),
          nextRetryAt: new Date(Date.now() + Math.pow(2, newAttempts) * 1000),
          lastError: "Simulated failure for demo"
        };
      }
    }));

    toast(success ? "Webhook delivered successfully!" : "Retry attempt failed", {
      icon: success ? "✅" : "❌"
    });
  };

  const retryAll = async () => {
    setIsProcessing(true);
    const pendingItems = queue.filter(item => item.status === "pending");
    
    for (const item of pendingItems) {
      await retryNow(item.id);
    }
    
    setIsProcessing(false);
    toast.success(`Processed ${pendingItems.length} items`);
  };

  const removeItem = (itemId: string) => {
    setQueue(prev => prev.filter(item => item.id !== itemId));
    toast.success("Item removed from queue");
  };

  const removeSelected = () => {
    setQueue(prev => prev.filter(item => !selectedItems.has(item.id)));
    setSelectedItems(new Set());
    toast.success(`Removed ${selectedItems.size} items`);
  };

  const clearCompleted = () => {
    const completedCount = queue.filter(item => item.status === "completed").length;
    setQueue(prev => prev.filter(item => item.status !== "completed"));
    toast.success(`Cleared ${completedCount} completed items`);
  };

  const resetFailed = () => {
    setQueue(prev => prev.map(item => 
      item.status === "failed" 
        ? { 
            ...item, 
            status: "pending" as const, 
            attempts: 0,
            nextRetryAt: new Date(Date.now() + 5000)
          } 
        : item
    ));
    toast.success("Reset all failed items");
  };

  const toggleSelect = (itemId: string) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const getStatusBadge = (status: RetryQueueItem["status"]) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="text-yellow-500 border-yellow-500/50">Pending</Badge>;
      case "retrying":
        return <Badge className="bg-blue-500 animate-pulse">Retrying...</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
    }
  };

  const pendingCount = queue.filter(q => q.status === "pending").length;
  const failedCount = queue.filter(q => q.status === "failed").length;
  const completedCount = queue.filter(q => q.status === "completed").length;

  return (
    <Card className="border-amber-500/30 bg-gradient-to-r from-amber-500/5 to-orange-500/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-amber-500" />
            <CardTitle>Webhook Retry Queue</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-yellow-500">{pendingCount} Pending</Badge>
            <Badge variant="outline" className="text-red-500">{failedCount} Failed</Badge>
            <Badge variant="outline" className="text-green-500">{completedCount} Done</Badge>
          </div>
        </div>
        <CardDescription>
          Manage pending webhook retries and manually trigger delivery attempts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 p-4 bg-background/50 rounded-lg border">
          <Button
            onClick={retryAll}
            disabled={isProcessing || pendingCount === 0}
            className="bg-amber-500 hover:bg-amber-600"
          >
            {isProcessing ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            Retry All Pending
          </Button>
          
          <Button
            variant="outline"
            onClick={resetFailed}
            disabled={failedCount === 0}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Failed
          </Button>
          
          <Button
            variant="outline"
            onClick={clearCompleted}
            disabled={completedCount === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Completed
          </Button>

          {selectedItems.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={removeSelected}
            >
              Remove Selected ({selectedItems.size})
            </Button>
          )}

          {/* Filter */}
          <div className="flex items-center gap-2 ml-auto">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              className="bg-background border rounded-md px-3 py-1 text-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending Only</option>
              <option value="failed">Failed Only</option>
            </select>
          </div>
        </div>

        {/* Queue List */}
        {filteredQueue.length > 0 ? (
          <div className="space-y-3">
            {filteredQueue.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-lg border transition-all ${
                  item.status === "completed"
                    ? "border-green-500/30 bg-green-500/5"
                    : item.status === "failed"
                    ? "border-red-500/30 bg-red-500/5"
                    : item.status === "retrying"
                    ? "border-blue-500/30 bg-blue-500/5"
                    : "border-yellow-500/30 bg-yellow-500/5"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.id)}
                      onChange={() => toggleSelect(item.id)}
                      className="mt-1 h-4 w-4 rounded border-gray-300"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {item.event}
                        </Badge>
                        {getStatusBadge(item.status)}
                      </div>
                      
                      <p className="text-sm font-mono truncate text-muted-foreground">
                        {item.webhookUrl}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <RefreshCw className="h-3 w-3" />
                          Attempts: {item.attempts}/{item.maxAttempts}
                        </span>
                        
                        {item.status === "pending" && (
                          <span className="flex items-center gap-1 text-yellow-500">
                            <Clock className="h-3 w-3" />
                            Next retry: {getTimeUntilRetry(item.nextRetryAt)}
                          </span>
                        )}
                        
                        {item.lastAttemptAt && (
                          <span>
                            Last attempt: {item.lastAttemptAt.toLocaleTimeString()}
                          </span>
                        )}
                      </div>
                      
                      {item.lastError && item.status !== "completed" && (
                        <div className="flex items-center gap-2 mt-2 text-xs text-red-400">
                          <AlertTriangle className="h-3 w-3" />
                          {item.lastError}
                        </div>
                      )}

                      {/* Progress bar for attempts */}
                      <div className="mt-2">
                        <Progress 
                          value={(item.attempts / item.maxAttempts) * 100} 
                          className="h-1"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {item.status === "pending" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => retryNow(item.id)}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Retry Now
                      </Button>
                    )}
                    
                    {item.status === "failed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setQueue(prev => prev.map(q => 
                            q.id === item.id 
                              ? { ...q, status: "pending" as const, attempts: 0, nextRetryAt: new Date() }
                              : q
                          ));
                          toast.success("Item reset for retry");
                        }}
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Reset
                      </Button>
                    )}
                    
                    {item.status === "retrying" && (
                      <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
                    )}
                    
                    {item.status === "completed" && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Payload Preview (collapsible could be added) */}
                <details className="mt-3">
                  <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                    View Payload
                  </summary>
                  <pre className="mt-2 p-2 bg-muted/50 rounded text-xs overflow-x-auto">
                    {JSON.stringify(item.payload, null, 2)}
                  </pre>
                </details>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No items in retry queue</p>
            <p className="text-sm mt-1">All webhooks have been delivered successfully</p>
          </div>
        )}

        {/* Tips */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium text-sm mb-2">💡 Queue Management Tips</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Items are automatically retried with exponential backoff (1s, 2s, 4s, 8s...)</li>
            <li>• After {queue[0]?.maxAttempts || 5} failed attempts, items are marked as failed</li>
            <li>• Failed items can be manually reset to retry from the beginning</li>
            <li>• Use "Retry Now" for immediate delivery attempt without waiting</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default WebhookRetryQueue;
