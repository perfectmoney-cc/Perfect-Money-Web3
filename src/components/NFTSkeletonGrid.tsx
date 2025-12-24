import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

interface NFTSkeletonGridProps {
  count?: number;
  columns?: 2 | 3 | 4;
}

export function NFTSkeletonGrid({ count = 12, columns = 4 }: NFTSkeletonGridProps) {
  const gridCols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-6`}>
      {Array.from({ length: count }).map((_, i) => (
        <NFTCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function NFTCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-square bg-muted/50 relative">
        <Skeleton className="w-full h-full" />
        <div className="absolute top-3 right-3">
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div>
          <Skeleton className="h-5 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-4 w-4 rounded-full" />
        </div>
      </div>
    </Card>
  );
}

export function TrendingNFTSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="overflow-hidden border-2 border-yellow-500/20">
          <div className="aspect-square bg-muted/50 relative">
            <Skeleton className="w-full h-full" />
            <div className="absolute top-2 left-2">
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
            <div className="absolute top-2 right-2">
              <Skeleton className="h-6 w-12 rounded-full" />
            </div>
          </div>
          <div className="p-3">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <div className="flex items-center justify-between mt-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export function AnalyticsCardSkeleton() {
  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="h-5 w-5 rounded" />
        <Skeleton className="h-5 w-40" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="text-center p-4 rounded-lg bg-muted/50">
            <Skeleton className="h-8 w-20 mx-auto mb-2" />
            <Skeleton className="h-3 w-24 mx-auto" />
          </div>
        ))}
      </div>
    </Card>
  );
}
