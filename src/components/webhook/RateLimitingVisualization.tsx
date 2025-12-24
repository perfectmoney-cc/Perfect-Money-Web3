import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Gauge, TrendingUp, AlertTriangle, Clock, Activity, RefreshCw, Ban, CheckCircle } from "lucide-react";

interface RateLimitData {
  timestamp: Date;
  requests: number;
  throttled: number;
  accepted: number;
}

interface RateLimitConfig {
  requestsPerMinute: number;
  requestsPerHour: number;
  burstLimit: number;
}

export const RateLimitingVisualization = () => {
  const [config, setConfig] = useState<RateLimitConfig>({
    requestsPerMinute: 60,
    requestsPerHour: 1000,
    burstLimit: 10
  });
  
  const [currentMinuteUsage, setCurrentMinuteUsage] = useState(0);
  const [currentHourUsage, setCurrentHourUsage] = useState(0);
  const [burstUsage, setBurstUsage] = useState(0);
  const [isThrottled, setIsThrottled] = useState(false);
  const [history, setHistory] = useState<RateLimitData[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);

  // Simulate rate limit data
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      // Simulate incoming requests
      const newRequests = Math.floor(Math.random() * 15);
      const throttled = Math.max(0, (currentMinuteUsage + newRequests) - config.requestsPerMinute);
      const accepted = newRequests - throttled;

      setCurrentMinuteUsage(prev => Math.min(prev + accepted, config.requestsPerMinute));
      setCurrentHourUsage(prev => Math.min(prev + accepted, config.requestsPerHour));
      setBurstUsage(Math.min(newRequests, config.burstLimit));
      setIsThrottled(throttled > 0);

      setHistory(prev => [{
        timestamp: new Date(),
        requests: newRequests,
        throttled,
        accepted
      }, ...prev.slice(0, 59)]); // Keep last 60 entries
    }, 1000);

    return () => clearInterval(interval);
  }, [isSimulating, currentMinuteUsage, config]);

  // Reset minute counter every 60 seconds
  useEffect(() => {
    if (!isSimulating) return;

    const minuteReset = setInterval(() => {
      setCurrentMinuteUsage(0);
    }, 60000);

    return () => clearInterval(minuteReset);
  }, [isSimulating]);

  const getUsageColor = (usage: number, limit: number) => {
    const percentage = (usage / limit) * 100;
    if (percentage >= 90) return "text-red-500";
    if (percentage >= 70) return "text-yellow-500";
    return "text-green-500";
  };

  const getProgressColor = (usage: number, limit: number) => {
    const percentage = (usage / limit) * 100;
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  const totalRequests = history.reduce((sum, h) => sum + h.requests, 0);
  const totalThrottled = history.reduce((sum, h) => sum + h.throttled, 0);
  const throttleRate = totalRequests > 0 ? (totalThrottled / totalRequests) * 100 : 0;

  return (
    <Card className="border-indigo-500/30 bg-gradient-to-r from-indigo-500/5 to-violet-500/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gauge className="h-5 w-5 text-indigo-500" />
            <CardTitle>Rate Limiting Monitor</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {isThrottled && (
              <Badge variant="destructive" className="animate-pulse">
                <Ban className="h-3 w-3 mr-1" />
                Throttled
              </Badge>
            )}
            <Badge variant="outline" className="border-indigo-500/50 text-indigo-500">
              {isSimulating ? "Live" : "Paused"}
            </Badge>
          </div>
        </div>
        <CardDescription>Monitor webhook request rates and throttling status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rate Limit Configuration */}
        <div className="p-4 bg-background/50 rounded-lg border space-y-4">
          <Label className="font-medium">Rate Limit Configuration</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Requests/Minute</Label>
              <Input
                type="number"
                value={config.requestsPerMinute}
                onChange={(e) => setConfig(prev => ({ ...prev, requestsPerMinute: parseInt(e.target.value) || 60 }))}
                disabled={isSimulating}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Requests/Hour</Label>
              <Input
                type="number"
                value={config.requestsPerHour}
                onChange={(e) => setConfig(prev => ({ ...prev, requestsPerHour: parseInt(e.target.value) || 1000 }))}
                disabled={isSimulating}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Burst Limit</Label>
              <Input
                type="number"
                value={config.burstLimit}
                onChange={(e) => setConfig(prev => ({ ...prev, burstLimit: parseInt(e.target.value) || 10 }))}
                disabled={isSimulating}
              />
            </div>
          </div>
        </div>

        {/* Current Usage Gauges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-background/50 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Minute Rate</span>
              <span className={`font-mono font-bold ${getUsageColor(currentMinuteUsage, config.requestsPerMinute)}`}>
                {currentMinuteUsage}/{config.requestsPerMinute}
              </span>
            </div>
            <Progress 
              value={(currentMinuteUsage / config.requestsPerMinute) * 100} 
              className={`h-2 ${getProgressColor(currentMinuteUsage, config.requestsPerMinute)}`}
            />
            <p className="text-xs text-muted-foreground mt-2">
              {config.requestsPerMinute - currentMinuteUsage} remaining
            </p>
          </div>

          <div className="p-4 bg-background/50 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Hourly Rate</span>
              <span className={`font-mono font-bold ${getUsageColor(currentHourUsage, config.requestsPerHour)}`}>
                {currentHourUsage}/{config.requestsPerHour}
              </span>
            </div>
            <Progress 
              value={(currentHourUsage / config.requestsPerHour) * 100} 
              className={`h-2 ${getProgressColor(currentHourUsage, config.requestsPerHour)}`}
            />
            <p className="text-xs text-muted-foreground mt-2">
              {config.requestsPerHour - currentHourUsage} remaining
            </p>
          </div>

          <div className="p-4 bg-background/50 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Burst Rate</span>
              <span className={`font-mono font-bold ${getUsageColor(burstUsage, config.burstLimit)}`}>
                {burstUsage}/{config.burstLimit}
              </span>
            </div>
            <Progress 
              value={(burstUsage / config.burstLimit) * 100} 
              className={`h-2 ${getProgressColor(burstUsage, config.burstLimit)}`}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Instant requests per second
            </p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-background/50 rounded-lg border text-center">
            <Activity className="h-5 w-5 mx-auto mb-2 text-indigo-500" />
            <div className="text-2xl font-bold">{totalRequests}</div>
            <div className="text-xs text-muted-foreground">Total Requests</div>
          </div>
          <div className="p-4 bg-background/50 rounded-lg border text-center">
            <CheckCircle className="h-5 w-5 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold text-green-500">{totalRequests - totalThrottled}</div>
            <div className="text-xs text-muted-foreground">Accepted</div>
          </div>
          <div className="p-4 bg-background/50 rounded-lg border text-center">
            <Ban className="h-5 w-5 mx-auto mb-2 text-red-500" />
            <div className="text-2xl font-bold text-red-500">{totalThrottled}</div>
            <div className="text-xs text-muted-foreground">Throttled</div>
          </div>
          <div className="p-4 bg-background/50 rounded-lg border text-center">
            <TrendingUp className="h-5 w-5 mx-auto mb-2 text-yellow-500" />
            <div className="text-2xl font-bold text-yellow-500">{throttleRate.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground">Throttle Rate</div>
          </div>
        </div>

        {/* Request History Chart */}
        {history.length > 0 && (
          <div className="p-4 bg-background/50 rounded-lg border">
            <div className="flex items-center justify-between mb-3">
              <Label className="font-medium">Request History (Last 60 seconds)</Label>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded" />
                  Accepted
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded" />
                  Throttled
                </span>
              </div>
            </div>
            <div className="flex items-end gap-0.5 h-24">
              {history.slice(0, 30).reverse().map((h, i) => {
                const maxHeight = Math.max(...history.map(x => x.requests), 1);
                const acceptedHeight = (h.accepted / maxHeight) * 100;
                const throttledHeight = (h.throttled / maxHeight) * 100;
                
                return (
                  <div key={i} className="flex-1 flex flex-col justify-end gap-0.5" title={`${h.timestamp.toLocaleTimeString()}: ${h.accepted} accepted, ${h.throttled} throttled`}>
                    {h.throttled > 0 && (
                      <div 
                        className="bg-red-500 rounded-t w-full"
                        style={{ height: `${throttledHeight}%`, minHeight: h.throttled > 0 ? '2px' : '0' }}
                      />
                    )}
                    <div 
                      className="bg-green-500 rounded-t w-full"
                      style={{ height: `${acceptedHeight}%`, minHeight: h.accepted > 0 ? '2px' : '0' }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>30s ago</span>
              <span>Now</span>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-3">
          <Button
            onClick={() => setIsSimulating(!isSimulating)}
            className={isSimulating ? "bg-red-500 hover:bg-red-600" : "bg-indigo-500 hover:bg-indigo-600"}
          >
            {isSimulating ? (
              <>
                <Ban className="h-4 w-4 mr-2" />
                Stop Simulation
              </>
            ) : (
              <>
                <Activity className="h-4 w-4 mr-2" />
                Start Simulation
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setHistory([]);
              setCurrentMinuteUsage(0);
              setCurrentHourUsage(0);
              setBurstUsage(0);
              setIsThrottled(false);
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>

        {/* Tips */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium text-sm mb-2">💡 Rate Limiting Tips</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• When rate limited, requests receive HTTP 429 (Too Many Requests)</li>
            <li>• Implement exponential backoff when receiving 429 responses</li>
            <li>• Burst limits protect against sudden traffic spikes</li>
            <li>• Contact support to increase limits for high-volume integrations</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
