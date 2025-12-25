import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, UserPlus, TrendingUp, Globe, Zap } from "lucide-react";

interface PartnerEvent {
  id: number;
  type: "join" | "tier_upgrade" | "revenue" | "location";
  partnerName: string;
  country: string;
  details: string;
  timestamp: Date;
  tier?: string;
  newTier?: string;
}

// Mock real-time events simulating blockchain data
const generateMockEvents = (): PartnerEvent[] => {
  const regions = [
    { country: "Philippines", city: "Manila" },
    { country: "Indonesia", city: "Jakarta" },
    { country: "Malaysia", city: "Kuala Lumpur" },
    { country: "Thailand", city: "Bangkok" },
    { country: "Vietnam", city: "Ho Chi Minh" },
    { country: "UAE", city: "Dubai" },
    { country: "UAE", city: "Abu Dhabi" },
    { country: "South Africa", city: "Johannesburg" },
    { country: "South Africa", city: "Cape Town" },
    { country: "Nigeria", city: "Lagos" },
    { country: "India", city: "Mumbai" },
    { country: "Singapore", city: "Singapore" },
  ];

  const exchangerNames = [
    "AsiaEx Pro", "DubaiCoin Exchange", "AfriCrypto Hub", "PH Remit Express",
    "Indo Digital Pay", "Thai Money Transfer", "VN Cash Flow", "Gulf Forex Pro",
    "Cape Digital Exchange", "Mumbai Express Pay", "SG Quick Transfer", "UAE Money Hub"
  ];

  const events: PartnerEvent[] = [];
  const tiers = ["Bronze", "Silver", "Gold", "Platinum"];

  for (let i = 0; i < 15; i++) {
    const region = regions[Math.floor(Math.random() * regions.length)];
    const name = exchangerNames[Math.floor(Math.random() * exchangerNames.length)];
    const eventTypes: PartnerEvent["type"][] = ["join", "tier_upgrade", "revenue"];
    const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    
    let details = "";
    let tier = "";
    let newTier = "";
    
    if (type === "join") {
      tier = "Bronze";
      details = `New exchanger joined from ${region.city}`;
    } else if (type === "tier_upgrade") {
      const oldTierIdx = Math.floor(Math.random() * 3);
      tier = tiers[oldTierIdx];
      newTier = tiers[oldTierIdx + 1];
      details = `Upgraded from ${tier} to ${newTier}`;
    } else {
      details = `Processed $${(Math.random() * 50000 + 5000).toFixed(0)} in transactions`;
    }

    events.push({
      id: i + 1,
      type,
      partnerName: name,
      country: region.country,
      details,
      timestamp: new Date(Date.now() - Math.random() * 86400000 * 7),
      tier,
      newTier,
    });
  }

  return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

const PartnerEventsFeed = () => {
  const [events, setEvents] = useState<PartnerEvent[]>([]);
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    setEvents(generateMockEvents());

    // Simulate real-time updates
    const interval = setInterval(() => {
      if (isLive) {
        const regions = [
          { country: "Philippines", city: "Manila" },
          { country: "UAE", city: "Dubai" },
          { country: "South Africa", city: "Johannesburg" },
        ];
        const region = regions[Math.floor(Math.random() * regions.length)];
        const names = ["Quick Pay Asia", "Gulf Money Pro", "Africa Digital"];
        const name = names[Math.floor(Math.random() * names.length)];

        const newEvent: PartnerEvent = {
          id: Date.now(),
          type: Math.random() > 0.5 ? "join" : "tier_upgrade",
          partnerName: name,
          country: region.country,
          details: Math.random() > 0.5 
            ? `New exchanger joined from ${region.city}` 
            : "Upgraded from Silver to Gold",
          timestamp: new Date(),
          tier: "Silver",
          newTier: "Gold",
        };

        setEvents((prev) => [newEvent, ...prev.slice(0, 14)]);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [isLive]);

  const getEventIcon = (type: PartnerEvent["type"]) => {
    switch (type) {
      case "join":
        return <UserPlus className="h-4 w-4 text-green-500" />;
      case "tier_upgrade":
        return <TrendingUp className="h-4 w-4 text-yellow-500" />;
      case "revenue":
        return <Zap className="h-4 w-4 text-primary" />;
      default:
        return <Globe className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getEventBadgeColor = (type: PartnerEvent["type"]) => {
    switch (type) {
      case "join":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "tier_upgrade":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "revenue":
        return "bg-primary/10 text-primary border-primary/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <Card className="p-4 bg-card/50 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Live Partner Activity</h3>
        </div>
        <div className="flex items-center gap-2">
          {isLive && (
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs text-muted-foreground">Live</span>
            </span>
          )}
        </div>
      </div>

      <ScrollArea className="h-[300px]">
        <div className="space-y-3">
          {events.map((event) => (
            <div
              key={event.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/50 hover:border-primary/30 transition-colors"
            >
              <div className="mt-0.5">{getEventIcon(event.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm truncate">{event.partnerName}</span>
                  <Badge variant="outline" className={`text-xs ${getEventBadgeColor(event.type)}`}>
                    {event.type === "join" ? "New Partner" : event.type === "tier_upgrade" ? "Upgraded" : "Revenue"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{event.details}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    {event.country}
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">{formatTimeAgo(event.timestamp)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default PartnerEventsFeed;
