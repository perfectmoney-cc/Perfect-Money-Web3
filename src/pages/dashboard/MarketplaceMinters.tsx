import { useState } from "react";
import pmLogo from "@/assets/pm-logo-new.png";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/Header";
import { TradingViewTicker } from "@/components/TradingViewTicker";
import { HeroBanner } from "@/components/HeroBanner";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, User, TrendingUp, Award, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

interface Minter {
  rank: number;
  address: string;
  avatar: string;
  minted: number;
  volume: number;
  floorPrice: number;
  topOffer: number;
  change24h: number;
  sales: number;
  listed: string;
}

const MarketplaceMinters = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Sample minter data - in production, fetch from blockchain
  const allMinters: Minter[] = Array.from({ length: 50 }, (_, i) => ({
    rank: i + 1,
    address: `0x${Math.random().toString(16).substr(2, 4)}...${Math.random().toString(16).substr(2, 4)}`,
    avatar: ["🎨", "🔥", "⭐", "💎", "🚀", "🌟", "👑", "🎭", "🎪", "🎯"][i % 10],
    minted: Math.floor(Math.random() * 100) + 5,
    volume: Math.floor(Math.random() * 50000) + 1000,
    floorPrice: Math.floor(Math.random() * 500) + 50,
    topOffer: Math.floor(Math.random() * 400) + 40,
    change24h: (Math.random() * 10 - 5),
    sales: Math.floor(Math.random() * 500) + 10,
    listed: `${Math.floor(Math.random() * 50) + 1}/${Math.floor(Math.random() * 100) + 50}`,
  }));

  const filteredMinters = allMinters.filter(minter =>
    searchQuery === "" || minter.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredMinters.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedMinters = filteredMinters.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 lg:pb-0">
      <Header />
      <TradingViewTicker />
      <HeroBanner title="All Minters" subtitle="View all NFT minters and their statistics" />

      <main className="container mx-auto px-4 pt-12 pb-12 flex-1">
        <div className="flex items-center justify-between mb-6">
          <Link to="/dashboard/marketplace" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm">
            <ArrowLeft className="h-4 w-4" />
            Back to Marketplace
          </Link>
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-4 bg-card/50 backdrop-blur-sm text-center">
              <User className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{allMinters.length}</p>
              <p className="text-xs text-muted-foreground">Total Minters</p>
            </Card>
            <Card className="p-4 bg-card/50 backdrop-blur-sm text-center">
              <TrendingUp className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{allMinters.reduce((sum, m) => sum + m.volume, 0).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total Volume (PM)</p>
            </Card>
            <Card className="p-4 bg-card/50 backdrop-blur-sm text-center">
              <Award className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{allMinters.reduce((sum, m) => sum + m.minted, 0).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total NFTs Minted</p>
            </Card>
            <Card className="p-4 bg-card/50 backdrop-blur-sm text-center">
              <Award className="h-6 w-6 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{allMinters.reduce((sum, m) => sum + m.sales, 0).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total Sales</p>
            </Card>
          </div>

          {/* Search */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search minter address..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>
          </div>

          {/* Minters Table */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="text-left text-sm text-muted-foreground border-b border-border">
                  <th className="pb-3 pr-4">#</th>
                  <th className="pb-3 pr-4">Minter</th>
                  <th className="pb-3 pr-4 text-right">Floor</th>
                  <th className="pb-3 pr-4 text-right">Top Offer</th>
                  <th className="pb-3 pr-4 text-right">Floor 1d %</th>
                  <th className="pb-3 pr-4 text-right">Volume</th>
                  <th className="pb-3 pr-4 text-right">Sales</th>
                  <th className="pb-3 text-right">Listed</th>
                </tr>
              </thead>
              <tbody>
                {displayedMinters.map((minter) => (
                  <tr key={minter.rank} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-4 pr-4">
                      <span className={`font-bold ${minter.rank === 1 ? 'text-yellow-500' : minter.rank === 2 ? 'text-gray-400' : minter.rank === 3 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                        {minter.rank}
                      </span>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{minter.avatar}</span>
                        <div>
                          <span className="font-mono text-sm font-medium">{minter.address}</span>
                          <Badge variant="secondary" className="ml-2 text-xs">Verified</Badge>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 pr-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span className="font-medium">{minter.floorPrice}</span>
                        <img src={pmLogo} alt="PM" className="h-4 w-4" />
                      </div>
                    </td>
                    <td className="py-4 pr-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span className="font-medium">{minter.topOffer}</span>
                        <img src={pmLogo} alt="PM" className="h-4 w-4" />
                      </div>
                    </td>
                    <td className="py-4 pr-4 text-right">
                      <span className={minter.change24h >= 0 ? 'text-green-500' : 'text-red-500'}>
                        {minter.change24h >= 0 ? '▲' : '▼'} {Math.abs(minter.change24h).toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-4 pr-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span className={`font-bold px-2 py-1 rounded ${minter.volume > 20000 ? 'bg-green-500/20 text-green-500' : ''}`}>
                          {minter.volume.toLocaleString()}
                        </span>
                        <img src={pmLogo} alt="PM" className="h-4 w-4" />
                      </div>
                    </td>
                    <td className="py-4 pr-4 text-right font-medium">{minter.sales}</td>
                    <td className="py-4 text-right">
                      <span className="text-muted-foreground">{minter.listed}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button variant="outline" size="icon" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button variant="outline" size="icon" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default MarketplaceMinters;
