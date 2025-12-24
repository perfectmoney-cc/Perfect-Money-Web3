import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Sparkles, 
  ShoppingCart, 
  Tag, 
  XCircle, 
  Gavel, 
  ArrowRightLeft, 
  Trophy,
  ExternalLink,
  Clock
} from "lucide-react";
import { useNFTActivity, NFTActivity } from "@/hooks/useNFTBlockchain";
import { formatDistanceToNow } from "date-fns";

const activityConfig: Record<NFTActivity['type'], { icon: React.ReactNode; label: string; color: string }> = {
  mint: { icon: <Sparkles className="h-4 w-4" />, label: 'Minted', color: 'bg-green-500/20 text-green-400' },
  list: { icon: <Tag className="h-4 w-4" />, label: 'Listed', color: 'bg-blue-500/20 text-blue-400' },
  delist: { icon: <XCircle className="h-4 w-4" />, label: 'Delisted', color: 'bg-gray-500/20 text-gray-400' },
  sale: { icon: <ShoppingCart className="h-4 w-4" />, label: 'Sold', color: 'bg-yellow-500/20 text-yellow-400' },
  bid: { icon: <Gavel className="h-4 w-4" />, label: 'Bid', color: 'bg-purple-500/20 text-purple-400' },
  auction_end: { icon: <Trophy className="h-4 w-4" />, label: 'Auction Ended', color: 'bg-orange-500/20 text-orange-400' },
  transfer: { icon: <ArrowRightLeft className="h-4 w-4" />, label: 'Transferred', color: 'bg-cyan-500/20 text-cyan-400' },
};

const shortenAddress = (address: string) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

interface NFTActivityFeedProps {
  limit?: number;
  className?: string;
}

export function NFTActivityFeed({ limit = 20, className = '' }: NFTActivityFeedProps) {
  const { activities, isLoading } = useNFTActivity(limit);

  if (isLoading) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Recent Activity</h3>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Recent Activity</h3>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No activity yet</p>
          <p className="text-sm">Activity will appear here once NFTs are minted or traded</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Recent Activity</h3>
        <Badge variant="outline" className="ml-auto">{activities.length}</Badge>
      </div>
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-3">
          {activities.map((activity) => {
            const config = activityConfig[activity.type];
            return (
              <div 
                key={activity.id} 
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className={`p-2 rounded-full ${config.color}`}>
                  {config.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{config.label}</span>
                    <Badge variant="outline" className="text-xs">
                      #{activity.tokenId}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {activity.type === 'sale' || activity.type === 'transfer' ? (
                      <>
                        {shortenAddress(activity.from)} → {shortenAddress(activity.to || '')}
                      </>
                    ) : (
                      <>{shortenAddress(activity.from)}</>
                    )}
                    {activity.price && (
                      <span className="text-primary ml-2 font-medium">
                        {parseFloat(activity.price).toLocaleString()} PM
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span>
                      {formatDistanceToNow(new Date(activity.timestamp * 1000), { addSuffix: true })}
                    </span>
                    <a 
                      href={`https://bscscan.com/tx/${activity.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 hover:text-primary transition-colors"
                    >
                      View <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </Card>
  );
}
