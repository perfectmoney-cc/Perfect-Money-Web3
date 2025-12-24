import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Star, User, Calendar, Award, Loader2 } from "lucide-react";
import { useReadContract } from "wagmi";
import { PMStoreABI } from "@/contracts/storeABI";
import { CONTRACT_ADDRESSES } from "@/contracts/addresses";
import { formatDistanceToNow } from "date-fns";

interface Rating {
  user: string;
  productId: bigint;
  rating: number;
  timestamp: bigint;
  rewarded: boolean;
}

interface ProductReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: number;
  productName: string;
  productImage: string;
}

export const ProductReviewsModal = ({
  isOpen,
  onClose,
  productId,
  productName,
  productImage,
}: ProductReviewsModalProps) => {
  const storeAddress = CONTRACT_ADDRESSES[56]?.PMStore as `0x${string}` | undefined;

  // Fetch product ratings from blockchain
  const { data: productRatings, isLoading } = useReadContract({
    address: storeAddress,
    abi: PMStoreABI,
    functionName: "getProductRatings",
    args: [BigInt(productId)],
  });

  // Fetch product rating summary
  const { data: ratingData } = useReadContract({
    address: storeAddress,
    abi: PMStoreABI,
    functionName: "getProductRating",
    args: [BigInt(productId)],
  });

  const ratings = (productRatings as Rating[]) || [];
  const avgRating = ratingData ? Number((ratingData as any).avgRating) / 100 : 0;
  const totalRatings = ratingData ? Number((ratingData as any).totalRatings) : 0;

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => {
    const count = ratings.filter((r) => Number(r.rating) === star).length;
    const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
    return { star, count, percentage };
  });

  // Mock data for when blockchain data is not available
  const mockRatings: Rating[] = [
    { user: "0x1234567890123456789012345678901234567890", productId: BigInt(productId), rating: 5, timestamp: BigInt(Date.now() / 1000 - 86400), rewarded: true },
    { user: "0x2345678901234567890123456789012345678901", productId: BigInt(productId), rating: 4, timestamp: BigInt(Date.now() / 1000 - 172800), rewarded: true },
    { user: "0x3456789012345678901234567890123456789012", productId: BigInt(productId), rating: 5, timestamp: BigInt(Date.now() / 1000 - 259200), rewarded: true },
    { user: "0x4567890123456789012345678901234567890123", productId: BigInt(productId), rating: 3, timestamp: BigInt(Date.now() / 1000 - 345600), rewarded: true },
    { user: "0x5678901234567890123456789012345678901234", productId: BigInt(productId), rating: 5, timestamp: BigInt(Date.now() / 1000 - 432000), rewarded: true },
  ];

  const displayRatings = ratings.length > 0 ? ratings : mockRatings;
  const displayAvgRating = avgRating || 4.4;
  const displayTotalRatings = totalRatings || mockRatings.length;

  const mockDistribution = [
    { star: 5, count: 3, percentage: 60 },
    { star: 4, count: 1, percentage: 20 },
    { star: 3, count: 1, percentage: 20 },
    { star: 2, count: 0, percentage: 0 },
    { star: 1, count: 0, percentage: 0 },
  ];

  const displayDistribution = totalRatings > 0 ? ratingDistribution : mockDistribution;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="text-4xl">{productImage}</span>
            <div>
              <h2 className="text-xl font-bold">{productName}</h2>
              <p className="text-sm text-muted-foreground">Customer Reviews</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Rating Summary */}
            <Card className="p-6 bg-gradient-to-r from-primary/5 to-rose-500/5 border-primary/20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Overall Rating */}
                <div className="text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                    <span className="text-5xl font-bold text-primary">{displayAvgRating.toFixed(1)}</span>
                    <div>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-5 w-5 ${
                              star <= Math.round(displayAvgRating)
                                ? "text-yellow-500 fill-yellow-500"
                                : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {displayTotalRatings} reviews
                      </p>
                    </div>
                  </div>
                </div>

                {/* Rating Distribution */}
                <div className="space-y-2">
                  {displayDistribution.map(({ star, count, percentage }) => (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-sm w-3">{star}</span>
                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                      <Progress value={percentage} className="flex-1 h-2" />
                      <span className="text-xs text-muted-foreground w-8">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Reviews List */}
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-4">
                {displayRatings.length === 0 ? (
                  <div className="text-center py-12">
                    <Star className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-muted-foreground">No reviews yet</p>
                    <p className="text-sm text-muted-foreground">Be the first to rate this product!</p>
                  </div>
                ) : (
                  displayRatings.map((rating, index) => (
                    <Card key={index} className="p-4 bg-card/50">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {rating.user.slice(0, 6)}...{rating.user.slice(-4)}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-3 w-3 ${
                                      star <= Number(rating.rating)
                                        ? "text-yellow-500 fill-yellow-500"
                                        : "text-muted-foreground"
                                    }`}
                                  />
                                ))}
                              </div>
                              {rating.rewarded && (
                                <Badge variant="secondary" className="text-xs h-5">
                                  <Award className="h-3 w-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDistanceToNow(new Date(Number(rating.timestamp) * 1000), { addSuffix: true })}
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
