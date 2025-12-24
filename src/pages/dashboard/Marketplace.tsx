import { useState, useEffect, useMemo } from "react";
import pmLogo from "@/assets/pm-logo-new.png";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Header } from "@/components/Header";
import { TradingViewTicker } from "@/components/TradingViewTicker";
import { HeroBanner } from "@/components/HeroBanner";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Footer } from "@/components/Footer";
import { WalletCard } from "@/components/WalletCard";
import { Badge } from "@/components/ui/badge";
import { NFTActivityFeed } from "@/components/NFTActivityFeed";
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ArrowLeft, ShoppingCart, TrendingUp, ChevronLeft, ChevronRight, Gavel, Eye, Timer, User, Sparkles, Heart, Settings, Filter, X, Home } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { NFTImage } from "@/components/NFTImage";
import { NFTSkeletonGrid, TrendingNFTSkeletonGrid, AnalyticsCardSkeleton } from "@/components/NFTSkeletonGrid";
import { useNFTFavorites } from "@/hooks/useNFTFavorites";
import { useBlockchainStats, useMarketplaceNFTs, useUserBlockchainNFTs, BlockchainNFT } from "@/hooks/useNFTBlockchain";
import { NFT_CATEGORIES } from "@/contracts/nftABI";
import { useAccount } from "wagmi";
import { ipfsToHttp } from "@/utils/ipfsService";

interface MarketItem {
  id: number;
  name: string;
  price: number;
  category: string;
  date: Date;
  views: number;
  description: string;
  seller: string;
  image?: string | null;
  isAuction?: boolean;
  auctionEndTime?: string;
  highestBid?: number;
  highestBidder?: string;
  tokenURI?: string;
}

const MarketplacePage = () => {
  const navigate = useNavigate();
  const { address } = useAccount();
  const [sortBy, setSortBy] = useState("trending");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<MarketItem | null>(null);
  const [detailItem, setDetailItem] = useState<MarketItem | null>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [creatorFilter, setCreatorFilter] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [auctionTimeFilter, setAuctionTimeFilter] = useState<string>("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const { favorites, toggleFavorite, isFavorite, favoritesCount } = useNFTFavorites();
  const itemsPerPage = 12;

  // Blockchain data
  const { stats, isLoading: statsLoading, owner } = useBlockchainStats();
  const { listedNFTs, allNFTs, isLoading: nftsLoading } = useMarketplaceNFTs();
  const { ownedNFTs } = useUserBlockchainNFTs(address as `0x${string}` | undefined);

  const isAdmin = address && owner && address.toLowerCase() === owner.toLowerCase();

  // Convert blockchain NFTs to market items
  const marketItems = useMemo(() => {
    return listedNFTs.map((nft): MarketItem => ({
      id: nft.id,
      name: nft.name,
      price: parseFloat(nft.listing?.price || '0'),
      category: nft.category,
      date: new Date(nft.mintedAt * 1000),
      views: Math.floor(Math.random() * 500) + 50,
      description: nft.description,
      seller: nft.listing?.seller || nft.owner,
      image: nft.tokenURI ? ipfsToHttp(nft.tokenURI) : null,
      isAuction: nft.listing?.isAuction,
      auctionEndTime: nft.listing?.endTime ? new Date(nft.listing.endTime * 1000).toISOString() : undefined,
      highestBid: parseFloat(nft.listing?.highestBid || '0'),
      highestBidder: nft.listing?.highestBidder,
      tokenURI: nft.tokenURI,
    }));
  }, [listedNFTs]);

  const handleViewDetails = (item: MarketItem) => setDetailItem(item);
  const handleBuyNow = (item: MarketItem) => { setDetailItem(null); setSelectedItem(item); };

  const handleConfirmPurchase = () => {
    if (!selectedItem) return;
    toast.success(`Purchase initiated for ${selectedItem.name}! Please confirm in your wallet.`);
    setSelectedItem(null);
  };

  const handlePlaceBidOnAuction = () => {
    if (!detailItem || !bidAmount) return;
    const bidValue = parseFloat(bidAmount);
    if (bidValue <= (detailItem.highestBid || 0)) {
      toast.error("Bid must be higher than current highest bid");
      return;
    }
    toast.success(`Bid of ${bidValue} PM placed! Please confirm in your wallet.`);
    setBidAmount("");
  };

  const handleToggleFavorite = (e: React.MouseEvent, item: MarketItem) => {
    e.stopPropagation();
    const added = toggleFavorite({ id: item.id, name: item.name, price: item.price, category: item.category, image: item.image });
    toast.success(added ? `${item.name} added to favorites` : `${item.name} removed from favorites`);
  };

  // Filtering with creator, price range, and auction time
  const filteredItems = useMemo(() => {
    return marketItems.filter((item) => {
      const matchesSearch = searchQuery.trim() === "" ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
      const matchesCreator = creatorFilter.trim() === "" ||
        item.seller.toLowerCase().includes(creatorFilter.toLowerCase());
      const minPriceNum = minPrice ? parseFloat(minPrice) : 0;
      const maxPriceNum = maxPrice ? parseFloat(maxPrice) : Infinity;
      const matchesPrice = item.price >= minPriceNum && item.price <= maxPriceNum;
      
      // Auction time remaining filter
      let matchesAuctionTime = true;
      if (auctionTimeFilter !== "all" && item.isAuction && item.auctionEndTime) {
        const endTime = new Date(item.auctionEndTime).getTime();
        const now = Date.now();
        const hoursRemaining = (endTime - now) / (1000 * 60 * 60);
        
        switch (auctionTimeFilter) {
          case "1h": matchesAuctionTime = hoursRemaining > 0 && hoursRemaining <= 1; break;
          case "6h": matchesAuctionTime = hoursRemaining > 0 && hoursRemaining <= 6; break;
          case "24h": matchesAuctionTime = hoursRemaining > 0 && hoursRemaining <= 24; break;
          case "ending": matchesAuctionTime = hoursRemaining > 0 && hoursRemaining <= 3; break;
          case "active": matchesAuctionTime = hoursRemaining > 0; break;
          default: matchesAuctionTime = true;
        }
      } else if (auctionTimeFilter !== "all" && !item.isAuction) {
        matchesAuctionTime = false;
      }
      
      return matchesSearch && matchesCategory && matchesCreator && matchesPrice && matchesAuctionTime;
    });
  }, [marketItems, searchQuery, selectedCategory, creatorFilter, minPrice, maxPrice, auctionTimeFilter]);

  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "date") return b.date.getTime() - a.date.getTime();
      if (sortBy === "trending") return b.views - a.views;
      if (sortBy === "auctions") return (b.isAuction ? 1 : 0) - (a.isAuction ? 1 : 0);
      return 0;
    });
  }, [filteredItems, sortBy]);

  const totalPages = Math.ceil(sortedItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = sortedItems.slice(startIndex, startIndex + itemsPerPage);

  const formatTimeRemaining = (endTime: string) => {
    const diff = new Date(endTime).getTime() - Date.now();
    if (diff <= 0) return "Ended";
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${mins}m`;
  };

  const analyticsData = {
    totalVolume: stats?.totalVolume ? parseFloat(stats.totalVolume).toLocaleString() : '0',
    totalSales: stats?.totalSales || 0,
    floorPrice: marketItems.length > 0 ? Math.min(...marketItems.map(i => i.price)) : 0,
    totalMinted: stats?.totalMinted || 0,
    listed: stats?.totalListings || marketItems.length,
  };

  // Trending NFTs
  const trendingNFTs = useMemo(() => 
    [...marketItems].sort((a, b) => b.views - a.views).slice(0, 4),
    [marketItems]
  );

  const isLoading = statsLoading || nftsLoading;

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 lg:pb-0">
      <Header />
      <TradingViewTicker />
      <HeroBanner title="NFT Marketplace" subtitle="Browse, trade and auction digital assets with PM tokens" />

      <main className="container mx-auto px-4 pt-12 pb-12 flex-1">
        <div className="md:hidden mt-5 mb-6">
          <WalletCard showQuickFunctionsToggle={false} compact={true} />
        </div>

        {/* Breadcrumb Navigation */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/dashboard" className="flex items-center gap-1">
                  <Home className="h-4 w-4" />
                  Dashboard
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>NFT Marketplace</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center justify-end">
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Button variant="outline" onClick={() => navigate("/dashboard/marketplace/admin")}>
                  <Settings className="h-4 w-4 mr-2" />
                  Admin
                </Button>
              )}
              <Button variant="gradient" onClick={() => navigate("/dashboard/mint-nft")}>
                <Sparkles className="h-4 w-4 mr-2" />
                Mint NFT
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => navigate("/dashboard/marketplace/minters")}>
              <User className="h-4 w-4 mr-2" />
              Minters
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/dashboard/marketplace/stats")}>
              <TrendingUp className="h-4 w-4 mr-2" />
              Stats
            </Button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Collection Analytics */}
          {isLoading ? (
            <AnalyticsCardSkeleton />
          ) : (
            <Card className="p-6 bg-card/50 backdrop-blur-sm mb-8">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold">Collection Analytics</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold text-primary">{analyticsData.totalVolume}</p>
                  <p className="text-xs text-muted-foreground">Total Volume (PM)</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold text-green-500">{analyticsData.totalSales.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total Sales</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold text-yellow-500">{analyticsData.floorPrice.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Floor Price (PM)</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold text-blue-500">{analyticsData.totalMinted}</p>
                  <p className="text-xs text-muted-foreground">Total Minted</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold text-purple-500">{analyticsData.listed}</p>
                  <p className="text-xs text-muted-foreground">Listed Items</p>
                </div>
              </div>
            </Card>
          )}

          {/* Two Column Layout: Trending + Activity Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                <h2 className="text-lg font-bold">Trending NFTs</h2>
              </div>
              {isLoading ? (
                <TrendingNFTSkeletonGrid />
              ) : trendingNFTs.length === 0 ? (
                <Card className="p-8 text-center text-muted-foreground">
                  <p>No NFTs listed yet. Be the first to mint and list!</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {trendingNFTs.map((item, index) => (
                    <Card 
                      key={`trending-${item.id}`} 
                      className="overflow-hidden hover:shadow-glow transition-all cursor-pointer border-2 border-yellow-500/20 hover:border-yellow-500/50"
                      onClick={() => handleViewDetails(item)}
                    >
                      <div className="aspect-square bg-muted/50 relative overflow-hidden">
                        <NFTImage src={item.image} alt={item.name} />
                        <Badge className="absolute top-2 left-2 bg-yellow-500 text-black z-10">
                          #{index + 1} Trending
                        </Badge>
                        <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1 z-10">
                          <Eye className="h-3 w-3" />
                          <span className="text-xs">{item.views}</span>
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="font-bold text-sm truncate">{item.name}</h3>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-primary font-bold text-sm">{item.price} PM</span>
                          <span className="text-xs text-muted-foreground">{item.category}</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
            
            {/* Activity Feed */}
            <div className="lg:col-span-1">
              <NFTActivityFeed limit={10} />
            </div>
          </div>

          <Tabs defaultValue="browse" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="browse">Browse Marketplace</TabsTrigger>
              <TabsTrigger value="favorites" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Favorites ({favoritesCount})
              </TabsTrigger>
              <TabsTrigger value="owned">My NFTs ({ownedNFTs.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="browse" className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <ShoppingCart className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="font-bold text-lg">NFT Marketplace</h1>
                    <p className="text-muted-foreground text-sm">{marketItems.length} items listed</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Input
                    placeholder="Search NFTs..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className="w-[200px]"
                  />
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trending">Most Trending</SelectItem>
                      <SelectItem value="date">Date Added</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="auctions">Auctions First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Advanced Filters Toggle */}
              <div className="flex items-center gap-2">
                <Button
                  variant={showAdvancedFilters ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Advanced Filters
                </Button>
                {(creatorFilter || minPrice || maxPrice || auctionTimeFilter !== "all") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setCreatorFilter(""); setMinPrice(""); setMaxPrice(""); setAuctionTimeFilter("all"); setCurrentPage(1); }}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear Filters
                  </Button>
                )}
              </div>

              {/* Advanced Filters Panel */}
              {showAdvancedFilters && (
                <Card className="p-4 bg-muted/30 border-dashed">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Creator Address</label>
                      <Input
                        placeholder="0x... or partial address"
                        value={creatorFilter}
                        onChange={(e) => { setCreatorFilter(e.target.value); setCurrentPage(1); }}
                        className="font-mono text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Min Price (PM)</label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={minPrice}
                        onChange={(e) => { setMinPrice(e.target.value); setCurrentPage(1); }}
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Max Price (PM)</label>
                      <Input
                        type="number"
                        placeholder="No limit"
                        value={maxPrice}
                        onChange={(e) => { setMaxPrice(e.target.value); setCurrentPage(1); }}
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <Timer className="h-3 w-3" />
                        Auction Time
                      </label>
                      <Select value={auctionTimeFilter} onValueChange={(v) => { setAuctionTimeFilter(v); setCurrentPage(1); }}>
                        <SelectTrigger>
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Items</SelectItem>
                          <SelectItem value="active">Active Auctions</SelectItem>
                          <SelectItem value="ending">Ending Soon (≤3h)</SelectItem>
                          <SelectItem value="1h">Ending in 1 hour</SelectItem>
                          <SelectItem value="6h">Ending in 6 hours</SelectItem>
                          <SelectItem value="24h">Ending in 24 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Card>
              )}

              {/* Category Filter Chips */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => { setSelectedCategory("all"); setCurrentPage(1); }}
                >
                  All Categories
                </Button>
                {NFT_CATEGORIES.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => { setSelectedCategory(category); setCurrentPage(1); }}
                  >
                    {category}
                  </Button>
                ))}
              </div>

              {isLoading ? (
                <NFTSkeletonGrid count={12} columns={4} />
              ) : paginatedItems.length === 0 ? (
                <Card className="p-12 text-center">
                  <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No NFTs Listed</h3>
                  <p className="text-muted-foreground mb-4">Be the first to mint and list an NFT on the marketplace!</p>
                  <Button onClick={() => navigate("/dashboard/mint-nft")}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Mint Your First NFT
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {paginatedItems.map((item) => (
                    <Card key={item.id} className="overflow-hidden hover:shadow-glow transition-all group cursor-pointer" onClick={() => handleViewDetails(item)}>
                      <div className="aspect-square bg-muted/50 relative overflow-hidden">
                        <NFTImage src={item.image} alt={item.name} />
                        {item.isAuction && (
                          <Badge className="absolute top-3 left-3 bg-primary text-white z-10">
                            <Gavel className="h-3 w-3 mr-1" />
                            Auction
                          </Badge>
                        )}
                        <button
                          className={`absolute top-3 right-12 p-2 rounded-full z-10 transition-colors ${
                            isFavorite(item.id) ? "bg-red-500 text-white" : "bg-background/80 backdrop-blur-sm text-muted-foreground hover:text-red-500"
                          }`}
                          onClick={(e) => handleToggleFavorite(e, item)}
                        >
                          <Heart className={`h-4 w-4 ${isFavorite(item.id) ? "fill-current" : ""}`} />
                        </button>
                        <div className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1 z-10">
                          <Eye className="h-3 w-3" />
                          <span className="text-xs">{item.views}</span>
                        </div>
                      </div>
                      <div className="p-4 space-y-3">
                        <div>
                          <h3 className="font-bold mb-1">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">{item.category}</p>
                        </div>
                        
                        {item.isAuction ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Current Bid</span>
                              <div className="flex items-center gap-1">
                                <span className="font-bold text-primary">{item.highestBid || item.price}</span>
                                <img src={pmLogo} alt="PM" className="h-4 w-4" />
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Timer className="h-3 w-3" />
                              <span>Ends in {formatTimeRemaining(item.auctionEndTime!)}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <span className="text-primary font-bold">{item.price}</span>
                            <img src={pmLogo} alt="PM" className="h-4 w-4" />
                            <span className="text-primary font-bold">PM</span>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((pageNum) => (
                      <Button key={pageNum} variant={currentPage === pageNum ? "default" : "outline"} size="icon" onClick={() => setCurrentPage(pageNum)}>
                        {pageNum}
                      </Button>
                    ))}
                    {totalPages > 5 && <span className="text-muted-foreground">...</span>}
                  </div>
                  <Button variant="outline" size="icon" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="favorites" className="space-y-6">
              {favorites.length === 0 ? (
                <Card className="p-12 text-center">
                  <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No Favorites Yet</h3>
                  <p className="text-muted-foreground">Start adding NFTs to your favorites by clicking the heart icon!</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {favorites.map((fav) => (
                    <Card key={fav.id} className="overflow-hidden hover:shadow-glow transition-all">
                      <div className="aspect-square bg-muted/50 relative overflow-hidden">
                        <NFTImage src={fav.image} alt={fav.name} />
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold mb-1">{fav.name}</h3>
                        <p className="text-sm text-muted-foreground">{fav.category}</p>
                        <div className="flex items-center gap-1 mt-2">
                          <span className="text-primary font-bold">{fav.price}</span>
                          <img src={pmLogo} alt="PM" className="h-4 w-4" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="owned" className="space-y-6">
              {ownedNFTs.length === 0 ? (
                <Card className="p-12 text-center">
                  <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No NFTs Owned</h3>
                  <p className="text-muted-foreground mb-4">Start your collection by minting or purchasing NFTs!</p>
                  <Button onClick={() => navigate("/dashboard/mint-nft")}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Mint NFT
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {ownedNFTs.map((nft) => (
                    <Card key={nft.id} className="overflow-hidden hover:shadow-glow transition-all">
                      <div className="aspect-square bg-muted/50 relative overflow-hidden">
                        <NFTImage src={nft.tokenURI ? ipfsToHttp(nft.tokenURI) : undefined} alt={nft.name} />
                        {nft.listing?.isActive && (
                          <Badge className="absolute top-3 left-3 bg-green-500 text-white z-10">Listed</Badge>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold mb-1">{nft.name}</h3>
                        <p className="text-sm text-muted-foreground">{nft.category}</p>
                        {nft.listing?.isActive && (
                          <div className="flex items-center gap-1 mt-2">
                            <span className="text-primary font-bold">{nft.listing.price}</span>
                            <img src={pmLogo} alt="PM" className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Detail Dialog */}
      <Dialog open={!!detailItem} onOpenChange={() => setDetailItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{detailItem?.name}</DialogTitle>
            <DialogDescription>{detailItem?.category}</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="aspect-square bg-muted/50 rounded-lg overflow-hidden">
              <NFTImage src={detailItem?.image} alt={detailItem?.name || ''} />
            </div>
            <div className="space-y-4">
              <p className="text-muted-foreground">{detailItem?.description}</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Seller</span>
                  <span className="font-mono text-sm">{detailItem?.seller?.slice(0, 10)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{detailItem?.isAuction ? 'Current Bid' : 'Price'}</span>
                  <span className="font-bold text-primary">{detailItem?.isAuction ? detailItem?.highestBid : detailItem?.price} PM</span>
                </div>
              </div>
              {detailItem?.isAuction ? (
                <div className="space-y-3">
                  <Input
                    type="number"
                    placeholder="Enter bid amount"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                  />
                  <Button className="w-full" onClick={handlePlaceBidOnAuction}>
                    <Gavel className="h-4 w-4 mr-2" />
                    Place Bid
                  </Button>
                </div>
              ) : (
                <Button className="w-full" onClick={() => detailItem && handleBuyNow(detailItem)}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Buy Now
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Purchase Confirmation Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Purchase</DialogTitle>
            <DialogDescription>You are about to purchase {selectedItem?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Price</span>
              <span className="font-bold">{selectedItem?.price} PM</span>
            </div>
            <div className="flex justify-between">
              <span>Platform Fee (2%)</span>
              <span>{((selectedItem?.price || 0) * 0.02).toFixed(2)} PM</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-bold">Total</span>
              <span className="font-bold text-primary">{((selectedItem?.price || 0) * 1.02).toFixed(2)} PM</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedItem(null)}>Cancel</Button>
            <Button onClick={handleConfirmPurchase}>Confirm Purchase</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default MarketplacePage;
