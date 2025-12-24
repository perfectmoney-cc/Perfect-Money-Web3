import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { 
  Radio, 
  Pause, 
  Play, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock,
  Zap,
  ArrowRight,
  Filter,
  CalendarIcon,
  X
} from "lucide-react";

interface WebhookEvent {
  id: string;
  timestamp: Date;
  eventType: string;
  endpoint: string;
  status: "success" | "failed" | "pending";
  responseTime: number;
  payload: Record<string, unknown>;
}

const eventTypes = [
  "payment.received",
  "payment.confirmed",
  "order.created",
  "order.completed",
  "refund.issued",
  "subscription.started",
  "subscription.renewed",
];

const generateMockEvent = (): WebhookEvent => {
  const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
  const status = Math.random() > 0.15 ? "success" : Math.random() > 0.5 ? "failed" : "pending";
  
  return {
    id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    timestamp: new Date(),
    eventType,
    endpoint: "https://api.merchant.com/webhooks",
    status,
    responseTime: Math.floor(50 + Math.random() * 400),
    payload: {
      event: eventType,
      amount: (Math.random() * 1000).toFixed(2),
      currency: "PM",
      orderId: `ORD-${Math.floor(Math.random() * 100000)}`,
    },
  };
};

interface Filters {
  eventType: string | null;
  status: string | null;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
}

export const RealtimeEventStream = () => {
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [isStreaming, setIsStreaming] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    eventType: null,
    status: null,
    dateFrom: undefined,
    dateTo: undefined,
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const maxEvents = 50;

  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      const newEvent = generateMockEvent();
      setEvents(prev => {
        const updated = [newEvent, ...prev];
        return updated.slice(0, maxEvents);
      });
    }, 2000 + Math.random() * 3000);

    return () => clearInterval(interval);
  }, [isStreaming]);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [events, autoScroll]);

  const clearEvents = () => {
    setEvents([]);
  };

  const clearFilters = () => {
    setFilters({
      eventType: null,
      status: null,
      dateFrom: undefined,
      dateTo: undefined,
    });
  };

  const filteredEvents = events.filter(event => {
    if (filters.eventType && event.eventType !== filters.eventType) return false;
    if (filters.status && event.status !== filters.status) return false;
    if (filters.dateFrom && event.timestamp < filters.dateFrom) return false;
    if (filters.dateTo) {
      const endOfDay = new Date(filters.dateTo);
      endOfDay.setHours(23, 59, 59, 999);
      if (event.timestamp > endOfDay) return false;
    }
    return true;
  });

  const hasActiveFilters = filters.eventType || filters.status || filters.dateFrom || filters.dateTo;

  const getStatusIcon = (status: WebhookEvent["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500 animate-pulse" />;
    }
  };

  const getStatusBadge = (status: WebhookEvent["status"]) => {
    const variants: Record<string, string> = {
      success: "bg-green-500/20 text-green-500 border-green-500/30",
      failed: "bg-red-500/20 text-red-500 border-red-500/30",
      pending: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
    };
    return variants[status];
  };

  const successCount = events.filter(e => e.status === "success").length;
  const failedCount = events.filter(e => e.status === "failed").length;

  return (
    <Card className="border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-blue-500/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/20">
              <Radio className={`h-5 w-5 text-cyan-500 ${isStreaming ? "animate-pulse" : ""}`} />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                Live Event Stream
                {isStreaming && (
                  <span className="flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                  </span>
                )}
              </CardTitle>
              <CardDescription>Real-time webhook deliveries</CardDescription>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs">
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
                {successCount} Success
              </Badge>
              <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/30">
                {failedCount} Failed
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant={isStreaming ? "outline" : "default"}
              size="sm"
              onClick={() => setIsStreaming(!isStreaming)}
            >
              {isStreaming ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearEvents}
              disabled={events.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={hasActiveFilters ? "border-primary" : ""}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                  {[filters.eventType, filters.status, filters.dateFrom, filters.dateTo].filter(Boolean).length}
                </Badge>
              )}
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Switch
              id="auto-scroll"
              checked={autoScroll}
              onCheckedChange={setAutoScroll}
            />
            <Label htmlFor="auto-scroll" className="text-sm">Auto-scroll</Label>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="p-4 rounded-lg border bg-card/50 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Event Filters
              </h4>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-3 w-3 mr-1" />
                  Clear All
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Event Type Filter */}
              <div className="space-y-2">
                <Label className="text-xs">Event Type</Label>
                <Select
                  value={filters.eventType || "all"}
                  onValueChange={(value) => setFilters(prev => ({ 
                    ...prev, 
                    eventType: value === "all" ? null : value 
                  }))}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    {eventTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <Label className="text-xs">Status</Label>
                <Select
                  value={filters.status || "all"}
                  onValueChange={(value) => setFilters(prev => ({ 
                    ...prev, 
                    status: value === "all" ? null : value 
                  }))}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date From Filter */}
              <div className="space-y-2">
                <Label className="text-xs">From Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal h-9">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateFrom ? format(filters.dateFrom, "PP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateFrom}
                      onSelect={(date) => setFilters(prev => ({ ...prev, dateFrom: date }))}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Date To Filter */}
              <div className="space-y-2">
                <Label className="text-xs">To Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal h-9">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateTo ? format(filters.dateTo, "PP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateTo}
                      onSelect={(date) => setFilters(prev => ({ ...prev, dateTo: date }))}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {hasActiveFilters && (
              <p className="text-xs text-muted-foreground">
                Showing {filteredEvents.length} of {events.length} events
              </p>
            )}
          </div>
        )}

        <ScrollArea className="h-[400px] rounded-lg border bg-background/50" ref={scrollRef}>
          <div className="p-2 space-y-2">
            {filteredEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[350px] text-muted-foreground">
                <Zap className="h-12 w-12 mb-4 opacity-20" />
                <p className="text-sm">
                  {events.length === 0 
                    ? "Waiting for webhook events..." 
                    : "No events match your filters"}
                </p>
                <p className="text-xs mt-1">
                  {events.length === 0 
                    ? "Events will appear here in real-time"
                    : "Try adjusting your filter criteria"}
                </p>
              </div>
            ) : (
              filteredEvents.map((event, index) => (
                <div
                  key={event.id}
                  className={`p-3 rounded-lg border bg-card/50 transition-all ${
                    index === 0 ? "animate-in fade-in slide-in-from-top-2 duration-300" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(event.status)}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{event.eventType}</span>
                          <Badge 
                            variant="outline" 
                            className={`text-[10px] py-0 ${getStatusBadge(event.status)}`}
                          >
                            {event.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <code className="px-1.5 py-0.5 rounded bg-muted text-[10px]">
                            {event.id}
                          </code>
                          <ArrowRight className="h-3 w-3" />
                          <span className="truncate max-w-[200px]">{event.endpoint}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right text-xs text-muted-foreground whitespace-nowrap">
                      <div>{event.responseTime}ms</div>
                      <div>{event.timestamp.toLocaleTimeString()}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};