import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/Header";
import { TradingViewTicker } from "@/components/TradingViewTicker";
import { HeroBanner } from "@/components/HeroBanner";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Footer } from "@/components/Footer";
import { 
  ArrowLeft, 
  Shield, 
  Settings, 
  DollarSign, 
  Pause, 
  Play, 
  Plus, 
  Wallet,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Store,
  ImageIcon
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useAccount, useWriteContract } from "wagmi";
import { PMNFTABI, PMMarketplaceABI } from "@/contracts/nftABI";
import { getContractAddress } from "@/contracts/addresses";
import { parseEther } from "viem";
import { useBlockchainStats } from "@/hooks/useNFTBlockchain";

const PMNFT_ADDRESS = getContractAddress(56, 'PMNFT') as `0x${string}`;
const PMMARKETPLACE_ADDRESS = getContractAddress(56, 'PMMarketplace') as `0x${string}`;

export default function NFTAdmin() {
  const { address } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();
  const { 
    stats, 
    mintFee, 
    platformFee, 
    nftPaused,
    marketplacePaused,
    collector,
    marketplaceCollector,
    owner,
    marketplaceOwner, 
    categories,
    isLoading,
    refetch 
  } = useBlockchainStats();

  // NFT Contract states
  const [newMintFee, setNewMintFee] = useState("");
  const [newNFTCollector, setNewNFTCollector] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [nftWithdrawAmount, setNftWithdrawAmount] = useState("");

  // Marketplace Contract states
  const [newPlatformFee, setNewPlatformFee] = useState("");
  const [newMarketplaceCollector, setNewMarketplaceCollector] = useState("");
  const [marketplaceWithdrawAmount, setMarketplaceWithdrawAmount] = useState("");

  const isNFTOwner = address?.toLowerCase() === owner?.toLowerCase();
  const isMarketplaceOwner = address?.toLowerCase() === marketplaceOwner?.toLowerCase();

  // NFT Contract Functions
  const handleSetMintFee = async () => {
    if (!newMintFee) {
      toast.error("Please enter a minting fee");
      return;
    }
    try {
      await writeContractAsync({
        address: PMNFT_ADDRESS,
        abi: PMNFTABI,
        functionName: 'setMFee',
        args: [parseEther(newMintFee)],
      } as any);
      toast.success("Minting fee updated!");
      setNewMintFee("");
      refetch();
    } catch (error: any) {
      toast.error(error?.message || "Failed to update minting fee");
    }
  };

  const handleSetNFTCollector = async () => {
    if (!newNFTCollector || !newNFTCollector.startsWith("0x")) {
      toast.error("Please enter a valid address");
      return;
    }
    try {
      await writeContractAsync({
        address: PMNFT_ADDRESS,
        abi: PMNFTABI,
        functionName: 'setCol',
        args: [newNFTCollector as `0x${string}`],
      } as any);
      toast.success("NFT fee collector updated!");
      setNewNFTCollector("");
      refetch();
    } catch (error: any) {
      toast.error(error?.message || "Failed to update collector");
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      toast.error("Please enter a category name");
      return;
    }
    try {
      await writeContractAsync({
        address: PMNFT_ADDRESS,
        abi: PMNFTABI,
        functionName: 'addCat',
        args: [newCategory],
      } as any);
      toast.success(`Category "${newCategory}" added!`);
      setNewCategory("");
      refetch();
    } catch (error: any) {
      toast.error(error?.message || "Failed to add category");
    }
  };

  const handleToggleNFTPause = async () => {
    try {
      await writeContractAsync({
        address: PMNFT_ADDRESS,
        abi: PMNFTABI,
        functionName: 'setPause',
        args: [!nftPaused],
      } as any);
      toast.success(nftPaused ? "NFT contract unpaused!" : "NFT contract paused!");
      refetch();
    } catch (error: any) {
      toast.error(error?.message || "Failed to toggle pause");
    }
  };

  const handleNFTWithdraw = async () => {
    if (!nftWithdrawAmount) {
      toast.error("Please enter amount to withdraw");
      return;
    }
    try {
      await writeContractAsync({
        address: PMNFT_ADDRESS,
        abi: PMNFTABI,
        functionName: 'wd',
        args: [parseEther(nftWithdrawAmount)],
      } as any);
      toast.success("NFT contract withdrawal successful!");
      setNftWithdrawAmount("");
    } catch (error: any) {
      toast.error(error?.message || "Withdrawal failed");
    }
  };

  // Marketplace Contract Functions
  const handleSetPlatformFee = async () => {
    if (!newPlatformFee || parseInt(newPlatformFee) > 10) {
      toast.error("Platform fee must be 0-10%");
      return;
    }
    try {
      await writeContractAsync({
        address: PMMARKETPLACE_ADDRESS,
        abi: PMMarketplaceABI,
        functionName: 'setPFee',
        args: [BigInt(newPlatformFee)],
      } as any);
      toast.success("Platform fee updated!");
      setNewPlatformFee("");
      refetch();
    } catch (error: any) {
      toast.error(error?.message || "Failed to update platform fee");
    }
  };

  const handleSetMarketplaceCollector = async () => {
    if (!newMarketplaceCollector || !newMarketplaceCollector.startsWith("0x")) {
      toast.error("Please enter a valid address");
      return;
    }
    try {
      await writeContractAsync({
        address: PMMARKETPLACE_ADDRESS,
        abi: PMMarketplaceABI,
        functionName: 'setCol',
        args: [newMarketplaceCollector as `0x${string}`],
      } as any);
      toast.success("Marketplace fee collector updated!");
      setNewMarketplaceCollector("");
      refetch();
    } catch (error: any) {
      toast.error(error?.message || "Failed to update collector");
    }
  };

  const handleToggleMarketplacePause = async () => {
    try {
      await writeContractAsync({
        address: PMMARKETPLACE_ADDRESS,
        abi: PMMarketplaceABI,
        functionName: 'setPause',
        args: [!marketplacePaused],
      } as any);
      toast.success(marketplacePaused ? "Marketplace unpaused!" : "Marketplace paused!");
      refetch();
    } catch (error: any) {
      toast.error(error?.message || "Failed to toggle pause");
    }
  };

  const handleMarketplaceWithdraw = async () => {
    if (!marketplaceWithdrawAmount) {
      toast.error("Please enter amount to withdraw");
      return;
    }
    try {
      await writeContractAsync({
        address: PMMARKETPLACE_ADDRESS,
        abi: PMMarketplaceABI,
        functionName: 'wd',
        args: [parseEther(marketplaceWithdrawAmount)],
      } as any);
      toast.success("Marketplace withdrawal successful!");
      setMarketplaceWithdrawAmount("");
    } catch (error: any) {
      toast.error(error?.message || "Withdrawal failed");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 lg:pb-0">
      <Header />
      <TradingViewTicker />
      <HeroBanner title="NFT Admin Panel" subtitle="Manage PMNFT and PMMarketplace contracts separately" />

      <main className="container mx-auto px-4 pt-12 pb-12 flex-1">
        <div className="flex items-center justify-between mb-6">
          <Link to="/dashboard/marketplace" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm">
            <ArrowLeft className="h-4 w-4" />
            Back to Marketplace
          </Link>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Access Warning */}
        {(!isNFTOwner && !isMarketplaceOwner) && (
          <Card className="p-6 mb-6 border-yellow-500/50 bg-yellow-500/10">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
              <div>
                <h3 className="font-semibold text-yellow-500">Admin Access Required</h3>
                <p className="text-sm text-muted-foreground">
                  Only contract owners can modify settings.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Contract Statistics Overview */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">Platform Statistics</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <p className="text-2xl font-bold text-primary">{stats?.totalMinted || 0}</p>
              <p className="text-xs text-muted-foreground">Total Minted</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <p className="text-2xl font-bold text-green-500">{stats?.totalListings || 0}</p>
              <p className="text-xs text-muted-foreground">Total Listings</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <p className="text-2xl font-bold text-blue-500">{stats?.totalSales || 0}</p>
              <p className="text-xs text-muted-foreground">Total Sales</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <p className="text-2xl font-bold text-yellow-500">{parseFloat(stats?.totalVolume || '0').toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Volume (PM)</p>
            </div>
          </div>
        </Card>

        <Tabs defaultValue="nft" className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="nft" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              PMNFT Contract
            </TabsTrigger>
            <TabsTrigger value="marketplace" className="flex items-center gap-2">
              <Store className="h-4 w-4" />
              PMMarketplace Contract
            </TabsTrigger>
          </TabsList>

          {/* NFT Contract Tab */}
          <TabsContent value="nft" className="space-y-6">
            {!isNFTOwner && (
              <Card className="p-4 border-yellow-500/50 bg-yellow-500/10">
                <div className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span className="text-yellow-500">NFT Contract Owner: {owner ? `${owner.slice(0, 8)}...${owner.slice(-6)}` : 'Loading...'}</span>
                </div>
              </Card>
            )}

            <div className="grid lg:grid-cols-2 gap-6">
              {/* NFT Contract Status */}
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold">NFT Contract Status</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm text-muted-foreground">Contract State</span>
                    <Badge variant={nftPaused ? "destructive" : "default"} className="gap-1">
                      {nftPaused ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                      {nftPaused ? "Paused" : "Active"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm text-muted-foreground">Total Minted</span>
                    <span className="font-mono font-bold">{stats?.totalMinted || 0}</span>
                  </div>
                  <Button 
                    variant={nftPaused ? "default" : "destructive"}
                    className="w-full"
                    onClick={handleToggleNFTPause}
                    disabled={!isNFTOwner || isPending}
                  >
                    {isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : nftPaused ? (
                      <Play className="h-4 w-4 mr-2" />
                    ) : (
                      <Pause className="h-4 w-4 mr-2" />
                    )}
                    {nftPaused ? "Unpause NFT Contract" : "Pause NFT Contract"}
                  </Button>
                </div>
              </Card>

              {/* Minting Fee */}
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold">Minting Fee</h2>
                </div>
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Current Minting Fee</span>
                      <span className="font-mono font-bold">{parseFloat(mintFee).toLocaleString()} PM</span>
                    </div>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="New fee (PM)" 
                        value={newMintFee}
                        onChange={(e) => setNewMintFee(e.target.value)}
                        type="number"
                        disabled={!isNFTOwner}
                      />
                      <Button onClick={handleSetMintFee} disabled={!isNFTOwner || isPending}>
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Set"}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>

              {/* NFT Fee Collector */}
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Wallet className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold">NFT Fee Collector</h2>
                </div>
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <span className="text-sm text-muted-foreground block mb-1">Current Collector</span>
                    <span className="font-mono text-sm break-all">{collector || 'Loading...'}</span>
                  </div>
                  <div className="space-y-2">
                    <Label>New Collector Address</Label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="0x..." 
                        value={newNFTCollector}
                        onChange={(e) => setNewNFTCollector(e.target.value)}
                        disabled={!isNFTOwner}
                      />
                      <Button onClick={handleSetNFTCollector} disabled={!isNFTOwner || isPending}>
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update"}
                      </Button>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Emergency Withdraw (PM)</Label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Amount" 
                        value={nftWithdrawAmount}
                        onChange={(e) => setNftWithdrawAmount(e.target.value)}
                        type="number"
                        disabled={!isNFTOwner}
                      />
                      <Button variant="destructive" onClick={handleNFTWithdraw} disabled={!isNFTOwner || isPending}>
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Withdraw"}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>

              {/* NFT Categories */}
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Settings className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold">NFT Categories</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat, i) => (
                      <Badge key={i} variant="outline" className="gap-1">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        {cat}
                      </Badge>
                    ))}
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Add New Category</Label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Category name" 
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        disabled={!isNFTOwner}
                      />
                      <Button onClick={handleAddCategory} disabled={!isNFTOwner || isPending}>
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Marketplace Contract Tab */}
          <TabsContent value="marketplace" className="space-y-6">
            {!isMarketplaceOwner && (
              <Card className="p-4 border-yellow-500/50 bg-yellow-500/10">
                <div className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span className="text-yellow-500">Marketplace Contract Owner: {marketplaceOwner ? `${marketplaceOwner.slice(0, 8)}...${marketplaceOwner.slice(-6)}` : 'Loading...'}</span>
                </div>
              </Card>
            )}

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Marketplace Contract Status */}
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Store className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold">Marketplace Status</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm text-muted-foreground">Contract State</span>
                    <Badge variant={marketplacePaused ? "destructive" : "default"} className="gap-1">
                      {marketplacePaused ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                      {marketplacePaused ? "Paused" : "Active"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm text-muted-foreground">Total Listings</span>
                    <span className="font-mono font-bold">{stats?.totalListings || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm text-muted-foreground">Total Sales</span>
                    <span className="font-mono font-bold">{stats?.totalSales || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm text-muted-foreground">Total Volume</span>
                    <span className="font-mono font-bold text-primary">
                      {parseFloat(stats?.totalVolume || '0').toLocaleString()} PM
                    </span>
                  </div>
                  <Button 
                    variant={marketplacePaused ? "default" : "destructive"}
                    className="w-full"
                    onClick={handleToggleMarketplacePause}
                    disabled={!isMarketplaceOwner || isPending}
                  >
                    {isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : marketplacePaused ? (
                      <Play className="h-4 w-4 mr-2" />
                    ) : (
                      <Pause className="h-4 w-4 mr-2" />
                    )}
                    {marketplacePaused ? "Unpause Marketplace" : "Pause Marketplace"}
                  </Button>
                </div>
              </Card>

              {/* Platform Fee */}
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold">Platform Fee</h2>
                </div>
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Current Platform Fee</span>
                      <span className="font-mono font-bold">{platformFee}%</span>
                    </div>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="New % (0-10)" 
                        value={newPlatformFee}
                        onChange={(e) => setNewPlatformFee(e.target.value)}
                        type="number"
                        max="10"
                        disabled={!isMarketplaceOwner}
                      />
                      <Button onClick={handleSetPlatformFee} disabled={!isMarketplaceOwner || isPending}>
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Set"}
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This fee is charged on each sale. Maximum is 10%.
                  </p>
                </div>
              </Card>

              {/* Marketplace Fee Collector */}
              <Card className="p-6 lg:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <Wallet className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold">Marketplace Fee Collector</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-3 rounded-lg bg-muted/50">
                      <span className="text-sm text-muted-foreground block mb-1">Current Collector</span>
                      <span className="font-mono text-sm break-all">{marketplaceCollector || 'Loading...'}</span>
                    </div>
                    <div className="space-y-2">
                      <Label>New Collector Address</Label>
                      <div className="flex gap-2">
                        <Input 
                          placeholder="0x..." 
                          value={newMarketplaceCollector}
                          onChange={(e) => setNewMarketplaceCollector(e.target.value)}
                          disabled={!isMarketplaceOwner}
                        />
                        <Button onClick={handleSetMarketplaceCollector} disabled={!isMarketplaceOwner || isPending}>
                          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update"}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="p-3 rounded-lg bg-muted/50">
                      <span className="text-sm text-muted-foreground block mb-1">Contract Balance</span>
                      <span className="font-mono text-lg font-bold text-primary">Check on BSCScan</span>
                    </div>
                    <div className="space-y-2">
                      <Label>Emergency Withdraw (PM)</Label>
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Amount" 
                          value={marketplaceWithdrawAmount}
                          onChange={(e) => setMarketplaceWithdrawAmount(e.target.value)}
                          type="number"
                          disabled={!isMarketplaceOwner}
                        />
                        <Button variant="destructive" onClick={handleMarketplaceWithdraw} disabled={!isMarketplaceOwner || isPending}>
                          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Withdraw"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
