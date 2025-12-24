import { useState, useMemo } from "react";
import pmLogo from "@/assets/pm-logo-new.png";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/Header";
import { TradingViewTicker } from "@/components/TradingViewTicker";
import { HeroBanner } from "@/components/HeroBanner";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, Search, Users, TrendingUp, Package, 
  BarChart3, ChevronLeft, ChevronRight, Star, Loader2, RefreshCw
} from "lucide-react";
import { Link } from "react-router-dom";
import { useBlockchainStats, useNFTHolders, useNFTCollections } from "@/hooks/useNFTBlockchain";

const MarketplaceStats = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  
  // Fetch real blockchain data
  const { stats, mintFee, platformFee, isLoading: statsLoading, refetch } = useBlockchainStats();
  const { holders } = useNFTHolders();
  const { collections } = useNFTCollections();

  // Filter collections by search
  const filteredCollections = useMemo(() => 
    collections.filter(c =>
      searchQuery === "" || c.category.toLowerCase().includes(searchQuery.toLowerCase())
    ), [collections, searchQuery]
  );

  // Filter holders by search
  const filteredHolders = useMemo(() =>
    holders.filter(h =>
      searchQuery === "" || h.address.toLowerCase().includes(searchQuery.toLowerCase())
    ), [holders, searchQuery]
  );

  const totalPagesCollections = Math.ceil(filteredCollections.length / itemsPerPage);
  const totalPagesHolders = Math.ceil(filteredHolders.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedCollections = filteredCollections.slice(startIndex, startIndex + itemsPerPage);
  const displayedHolders = filteredHolders.slice(startIndex, startIndex + itemsPerPage);

  // Global stats from blockchain
  const globalStats = {
    totalCollections: collections.length,
    totalHolders: holders.length,
    totalVolume: stats?.totalVolume ? parseFloat(stats.totalVolume) : 0,
    totalMinted: stats?.totalMinted || 0,
    totalListings: stats?.totalListings || 0,
    totalSales: stats?.totalSales || 0,
    mintingFee: mintFee,
    platformFeePercent: platformFee,
  };

  const getCategoryEmoji = (category: string) => {
    const emojiMap: Record<string, string> = {
      "PM Digital Card": "💳",
      "PM Voucher Card": "🎟️",
      "PM Gift Cards": "🎁",
      "PM Partner Badge": "🏅",
      "PM Discount Card": "🏷️",
      "PM VIP Exclusive Card": "👑",
    };
    return emojiMap[category] || "🎨";
  };

  const getHolderEmoji = (rank: number) => {
    const emojis = ["🐋", "🦈", "🐠", "🐡", "🦑", "🦐", "🦀", "🐙", "🦞", "🐚"];
    return emojis[(rank - 1) % emojis.length];
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 lg:pb-0">
      <Header />
      <TradingViewTicker />
      <HeroBanner title="Marketplace Statistics" subtitle="Real-time NFT collections, holders, and trading analytics from blockchain" />

      <main className="container mx-auto px-4 pt-12 pb-12 flex-1">
        <div className="flex items-center justify-between mb-6">
          <Link to="/dashboard/marketplace" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm">
            <ArrowLeft className="h-4 w-4" />
            Back to Marketplace
          </Link>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={statsLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${statsLoading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Global Stats from Blockchain */}
          {statsLoading ? (
            <div className="flex items-center justify-center py-8 mb-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading blockchain data...</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
              <Card className="p-4 bg-card/50 backdrop-blur-sm text-center">
                <Package className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">{globalStats.totalCollections}</p>
                <p className="text-xs text-muted-foreground">Collections</p>
              </Card>
              <Card className="p-4 bg-card/50 backdrop-blur-sm text-center">
                <Users className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{globalStats.totalHolders}</p>
                <p className="text-xs text-muted-foreground">Unique Holders</p>
              </Card>
              <Card className="p-4 bg-card/50 backdrop-blur-sm text-center">
                <TrendingUp className="h-6 w-6 text-green-500 mx-auto mb-2" />
                <div className="flex items-center justify-center gap-1">
                  <p className="text-2xl font-bold">{globalStats.totalVolume.toLocaleString()}</p>
                  <img src={pmLogo} alt="PM" className="h-5 w-5" />
                </div>
                <p className="text-xs text-muted-foreground">Total Volume</p>
              </Card>
              <Card className="p-4 bg-card/50 backdrop-blur-sm text-center">
                <BarChart3 className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{globalStats.totalMinted}</p>
                <p className="text-xs text-muted-foreground">Total Minted</p>
              </Card>
              <Card className="p-4 bg-card/50 backdrop-blur-sm text-center border-primary/30">
                <div className="flex items-center justify-center gap-1 mb-2">
                  <img src={pmLogo} alt="PM" className="h-6 w-6" />
                </div>
                <p className="text-2xl font-bold">{globalStats.mintingFee}</p>
                <p className="text-xs text-muted-foreground">Minting Fee (PM)</p>
              </Card>
              <Card className="p-4 bg-card/50 backdrop-blur-sm text-center">
                <BarChart3 className="h-6 w-6 text-orange-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{globalStats.platformFeePercent}%</p>
                <p className="text-xs text-muted-foreground">Platform Fee</p>
              </Card>
            </div>
          )}

          {/* Additional Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <Card className="p-4 bg-card/50 backdrop-blur-sm text-center">
              <p className="text-2xl font-bold text-green-500">{globalStats.totalSales}</p>
              <p className="text-xs text-muted-foreground">Total Sales</p>
            </Card>
            <Card className="p-4 bg-card/50 backdrop-blur-sm text-center">
              <p className="text-2xl font-bold text-blue-500">{globalStats.totalListings}</p>
              <p className="text-xs text-muted-foreground">Active Listings</p>
            </Card>
            <Card className="p-4 bg-card/50 backdrop-blur-sm text-center col-span-2 md:col-span-1">
              <p className="text-2xl font-bold text-yellow-500">
                {globalStats.totalMinted > 0 ? ((globalStats.totalListings / globalStats.totalMinted) * 100).toFixed(1) : 0}%
              </p>
              <p className="text-xs text-muted-foreground">Listed Ratio</p>
            </Card>
          </div>

          {/* Search */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search collections or holder addresses..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>
          </div>

          <Tabs defaultValue="collections" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="collections">Collections ({collections.length})</TabsTrigger>
              <TabsTrigger value="holders">Top Holders ({holders.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="collections">
              <Card className="p-6 bg-card/50 backdrop-blur-sm overflow-x-auto">
                {displayedCollections.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No collections found. Mint NFTs to see collection stats here.</p>
                  </div>
                ) : (
                  <table className="w-full min-w-[800px]">
                    <thead>
                      <tr className="text-left text-sm text-muted-foreground border-b border-border">
                        <th className="pb-3 pr-4"><Star className="h-4 w-4" /></th>
                        <th className="pb-3 pr-4">#</th>
                        <th className="pb-3 pr-4">Collection</th>
                        <th className="pb-3 pr-4 text-right">NFTs</th>
                        <th className="pb-3 pr-4 text-right">Floor Price</th>
                        <th className="pb-3 pr-4 text-right">Volume</th>
                        <th className="pb-3 text-right">Listed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedCollections.map((collection, index) => (
                        <tr key={collection.category} className="border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer">
                          <td className="py-4 pr-4">
                            <Star className="h-4 w-4 text-muted-foreground hover:text-yellow-500 cursor-pointer" />
                          </td>
                          <td className="py-4 pr-4 font-medium">{startIndex + index + 1}</td>
                          <td className="py-4 pr-4">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{getCategoryEmoji(collection.category)}</span>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{collection.category}</span>
                                <Badge variant="secondary" className="text-xs bg-blue-500/20 text-blue-500">✓</Badge>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 pr-4 text-right font-medium">{collection.count}</td>
                          <td className="py-4 pr-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <span className="font-medium">{collection.floorPrice > 0 ? collection.floorPrice.toLocaleString() : '-'}</span>
                              {collection.floorPrice > 0 && <img src={pmLogo} alt="PM" className="h-4 w-4" />}
                            </div>
                          </td>
                          <td className="py-4 pr-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <span className={`font-bold px-2 py-1 rounded ${collection.volume > 0 ? 'bg-green-500/20 text-green-500' : ''}`}>
                                {collection.volume.toLocaleString()}
                              </span>
                              <img src={pmLogo} alt="PM" className="h-4 w-4" />
                            </div>
                          </td>
                          <td className="py-4 text-right text-muted-foreground">{collection.listed}/{collection.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {totalPagesCollections > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <Button variant="outline" size="icon" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPagesCollections}
                    </span>
                    <Button variant="outline" size="icon" onClick={() => setCurrentPage((p) => Math.min(totalPagesCollections, p + 1))} disabled={currentPage === totalPagesCollections}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="holders">
              <Card className="p-6 bg-card/50 backdrop-blur-sm overflow-x-auto">
                {displayedHolders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No holders found. NFT owners will appear here.</p>
                  </div>
                ) : (
                  <table className="w-full min-w-[700px]">
                    <thead>
                      <tr className="text-left text-sm text-muted-foreground border-b border-border">
                        <th className="pb-3 pr-4">#</th>
                        <th className="pb-3 pr-4">Holder</th>
                        <th className="pb-3 pr-4 text-right">NFTs Owned</th>
                        <th className="pb-3 text-right">Portfolio Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedHolders.map((holder, index) => {
                        const rank = startIndex + index + 1;
                        return (
                          <tr key={holder.address} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                            <td className="py-4 pr-4">
                              <span className={`font-bold ${rank === 1 ? 'text-yellow-500' : rank === 2 ? 'text-gray-400' : rank === 3 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                                {rank}
                              </span>
                            </td>
                            <td className="py-4 pr-4">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{getHolderEmoji(rank)}</span>
                                <span className="font-mono text-sm">{holder.address.slice(0, 6)}...{holder.address.slice(-4)}</span>
                              </div>
                            </td>
                            <td className="py-4 pr-4 text-right font-bold">{holder.nftsOwned}</td>
                            <td className="py-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <span className="font-bold text-primary">{holder.totalValue.toLocaleString()}</span>
                                <img src={pmLogo} alt="PM" className="h-4 w-4" />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}

                {totalPagesHolders > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <Button variant="outline" size="icon" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPagesHolders}
                    </span>
                    <Button variant="outline" size="icon" onClick={() => setCurrentPage((p) => Math.min(totalPagesHolders, p + 1))} disabled={currentPage === totalPagesHolders}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default MarketplaceStats;
