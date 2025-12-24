import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Header } from "@/components/Header";
import { TradingViewTicker } from "@/components/TradingViewTicker";
import { HeroBanner } from "@/components/HeroBanner";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Footer } from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Settings, Users, Calendar, Loader2, ShieldCheck, AlertTriangle, Clock, CheckCircle, Info, Percent, Gift } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther, parseUnits, formatUnits } from 'viem';
import { PMPresaleABI } from "@/contracts/abis";
import { CONTRACT_ADDRESSES } from "@/contracts/addresses";

const PRESALE_ADDRESS = CONTRACT_ADDRESSES[56].PMPresale as `0x${string}`;

const ROUND_NAMES = ["Seed", "Private", "Public"] as const;
const ROUND_COLORS = [
  "from-yellow-500/20 to-orange-500/20 border-yellow-500/30",
  "from-blue-500/20 to-purple-500/20 border-blue-500/30", 
  "from-green-500/20 to-emerald-500/20 border-green-500/30",
];

// Storage key for promo settings
const PROMO_SETTINGS_KEY = "pm_promo_banner_settings";

interface RoundConfig {
  price: string;
  supply: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  minBuy: string;
  maxBuyTokens: string;
  whitelistEnabled: boolean;
}

interface RoundStatus {
  sold: bigint;
  isConfigured: boolean;
  isActive: boolean;
  isUpcoming: boolean;
  isEnded: boolean;
}

interface PromoSettings {
  bonusPercentage: number;
  bannerText: string;
  enabled: boolean;
}

const PresaleAdminPage = () => {
  const { address, isConnected } = useAccount();
  const [selectedRound, setSelectedRound] = useState(0);
  const [whitelistAddresses, setWhitelistAddresses] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  
  // Promo banner settings
  const [promoSettings, setPromoSettings] = useState<PromoSettings>(() => {
    const saved = localStorage.getItem(PROMO_SETTINGS_KEY);
    return saved ? JSON.parse(saved) : {
      bonusPercentage: 10,
      bannerText: "🚀 Token Sale is now Open: Buy PM Token & Get {bonus}% Bonus!",
      enabled: true
    };
  });
  
  const [roundConfigs, setRoundConfigs] = useState<RoundConfig[]>([
    { price: "0.00001", supply: "5000000000", startDate: "", startTime: "00:00", endDate: "", endTime: "23:59", minBuy: "0.1", maxBuyTokens: "100000000", whitelistEnabled: true },
    { price: "0.000015", supply: "5000000000", startDate: "", startTime: "00:00", endDate: "", endTime: "23:59", minBuy: "0.1", maxBuyTokens: "100000000", whitelistEnabled: true },
    { price: "0.00002", supply: "10000000000", startDate: "", startTime: "00:00", endDate: "", endTime: "23:59", minBuy: "0.05", maxBuyTokens: "200000000", whitelistEnabled: false },
  ]);

  const [roundStatuses, setRoundStatuses] = useState<RoundStatus[]>([
    { sold: 0n, isConfigured: false, isActive: false, isUpcoming: false, isEnded: false },
    { sold: 0n, isConfigured: false, isActive: false, isUpcoming: false, isEnded: false },
    { sold: 0n, isConfigured: false, isActive: false, isUpcoming: false, isEnded: false },
  ]);

  // Read contract owner
  const { data: contractOwner } = useReadContract({
    address: PRESALE_ADDRESS,
    abi: PMPresaleABI,
    functionName: 'owner',
    chainId: 56,
  });

  // Read token decimals
  const { data: tokenDecimals } = useReadContract({
    address: PRESALE_ADDRESS,
    abi: PMPresaleABI,
    functionName: 'tokenDecimals',
    chainId: 56,
  });

  // Read presale ended status
  const { data: presaleEnded } = useReadContract({
    address: PRESALE_ADDRESS,
    abi: PMPresaleABI,
    functionName: 'presaleEnded',
    chainId: 56,
  });

  // Read round info using getRoundInfo helper
  const { data: seedRoundInfo } = useReadContract({
    address: PRESALE_ADDRESS,
    abi: PMPresaleABI,
    functionName: 'getRoundInfo',
    args: [0],
    chainId: 56,
  });

  const { data: privateRoundInfo } = useReadContract({
    address: PRESALE_ADDRESS,
    abi: PMPresaleABI,
    functionName: 'getRoundInfo',
    args: [1],
    chainId: 56,
  });

  const { data: publicRoundInfo } = useReadContract({
    address: PRESALE_ADDRESS,
    abi: PMPresaleABI,
    functionName: 'getRoundInfo',
    args: [2],
    chainId: 56,
  });

  // Read total sold and supply
  const { data: totalSold } = useReadContract({
    address: PRESALE_ADDRESS,
    abi: PMPresaleABI,
    functionName: 'getTotalSold',
    chainId: 56,
  });

  const { data: totalSupply } = useReadContract({
    address: PRESALE_ADDRESS,
    abi: PMPresaleABI,
    functionName: 'getTotalSupply',
    chainId: 56,
  });

  // Read active round
  const { data: activeRound } = useReadContract({
    address: PRESALE_ADDRESS,
    abi: PMPresaleABI,
    functionName: 'getActiveRound',
    chainId: 56,
  });

  // Write contract functions
  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  // Check if connected wallet is owner
  useEffect(() => {
    if (address && contractOwner) {
      setIsOwner(address.toLowerCase() === (contractOwner as string).toLowerCase());
    }
  }, [address, contractOwner]);

  const decimals = Number(tokenDecimals || 18);

  // Load existing round data
  useEffect(() => {
    const roundInfos = [seedRoundInfo, privateRoundInfo, publicRoundInfo];
    const newConfigs = [...roundConfigs];
    const newStatuses = [...roundStatuses];
    const now = Math.floor(Date.now() / 1000);
    
    roundInfos.forEach((info, index) => {
      if (info) {
        const infoArray = info as readonly [bigint, bigint, bigint, bigint, bigint, bigint, bigint, boolean];
        const [price, supply, sold, start, end, minBuy, maxBuyTokens, whitelistEnabled] = infoArray;
        
        const isConfigured = price > 0n && supply > 0n;
        const startNum = Number(start);
        const endNum = Number(end);
        
        newStatuses[index] = {
          sold,
          isConfigured,
          isActive: isConfigured && now >= startNum && now <= endNum,
          isUpcoming: isConfigured && now < startNum,
          isEnded: isConfigured && now > endNum,
        };
        
        if (isConfigured) {
          const startDate = new Date(startNum * 1000);
          const endDate = new Date(endNum * 1000);
          
          // Format dates in local timezone for display
          const formatLocalDate = (d: Date) => {
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
          };
          
          const formatLocalTime = (d: Date) => {
            const hours = String(d.getHours()).padStart(2, '0');
            const minutes = String(d.getMinutes()).padStart(2, '0');
            return `${hours}:${minutes}`;
          };
          
          newConfigs[index] = {
            price: formatEther(price),
            supply: formatUnits(supply, decimals),
            startDate: formatLocalDate(startDate),
            startTime: formatLocalTime(startDate),
            endDate: formatLocalDate(endDate),
            endTime: formatLocalTime(endDate),
            minBuy: formatEther(minBuy),
            maxBuyTokens: formatUnits(maxBuyTokens, decimals),
            whitelistEnabled: whitelistEnabled,
          };
        }
      }
    });
    
    setRoundConfigs(newConfigs);
    setRoundStatuses(newStatuses);
  }, [seedRoundInfo, privateRoundInfo, publicRoundInfo, decimals]);

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed && txHash) {
      toast.dismiss();
      toast.success("Transaction confirmed!");
    }
  }, [isConfirmed, txHash]);

  const handleConfigChange = (field: keyof RoundConfig, value: string | boolean) => {
    const newConfigs = [...roundConfigs];
    newConfigs[selectedRound] = { ...newConfigs[selectedRound], [field]: value };
    setRoundConfigs(newConfigs);
  };

  const handleConfigureRound = async () => {
    const config = roundConfigs[selectedRound];
    
    if (!config.startDate || !config.endDate) {
      toast.error("Please set start and end dates");
      return;
    }

    const startTimestamp = Math.floor(new Date(`${config.startDate}T${config.startTime}`).getTime() / 1000);
    const endTimestamp = Math.floor(new Date(`${config.endDate}T${config.endTime}`).getTime() / 1000);

    if (endTimestamp <= startTimestamp) {
      toast.error("End time must be after start time");
      return;
    }

    try {
      // Parse supply and maxBuyTokens with token decimals
      const supplyInUnits = parseUnits(config.supply, decimals);
      const maxBuyInUnits = parseUnits(config.maxBuyTokens, decimals);

      writeContract({
        address: PRESALE_ADDRESS,
        abi: PMPresaleABI,
        functionName: 'configureRound',
        args: [
          selectedRound,
          parseEther(config.price), // price is in wei per token
          supplyInUnits,
          BigInt(startTimestamp),
          BigInt(endTimestamp),
          parseEther(config.minBuy), // minBuy is in BNB (wei)
          maxBuyInUnits, // maxBuyTokens is in token units
          config.whitelistEnabled
        ],
      } as any);
      
      toast.loading(`Configuring ${ROUND_NAMES[selectedRound]} round...`, { id: "config-tx" });
    } catch (error: any) {
      toast.error(error?.message || "Configuration failed");
    }
  };

  const handleSetWhitelist = async (status: boolean) => {
    const addresses = whitelistAddresses
      .split(/[\n,]/)
      .map(addr => addr.trim())
      .filter(addr => addr.startsWith('0x') && addr.length === 42);

    if (addresses.length === 0) {
      toast.error("No valid addresses found");
      return;
    }

    try {
      writeContract({
        address: PRESALE_ADDRESS,
        abi: PMPresaleABI,
        functionName: 'setWhitelist',
        args: [selectedRound, addresses, status],
      } as any);
      
      toast.loading(`${status ? 'Adding' : 'Removing'} ${addresses.length} addresses...`, { id: "whitelist-tx" });
    } catch (error: any) {
      toast.error(error?.message || "Whitelist update failed");
    }
  };

  const handleEndPresale = async () => {
    if (!window.confirm("Are you sure you want to end the presale? This cannot be undone.")) {
      return;
    }

    try {
      writeContract({
        address: PRESALE_ADDRESS,
        abi: PMPresaleABI,
        functionName: 'endPresale',
        args: [],
      } as any);
      
      toast.loading("Ending presale...", { id: "end-tx" });
    } catch (error: any) {
      toast.error(error?.message || "Failed to end presale");
    }
  };

  const handleWithdrawBNB = async () => {
    try {
      writeContract({
        address: PRESALE_ADDRESS,
        abi: PMPresaleABI,
        functionName: 'withdrawBNB',
        args: [],
      } as any);
      
      toast.loading("Withdrawing BNB...", { id: "withdraw-tx" });
    } catch (error: any) {
      toast.error(error?.message || "Withdrawal failed");
    }
  };

  const handleWithdrawUnsoldTokens = async () => {
    try {
      writeContract({
        address: PRESALE_ADDRESS,
        abi: PMPresaleABI,
        functionName: 'withdrawUnsoldTokens',
        args: [],
      } as any);
      
      toast.loading("Withdrawing unsold tokens...", { id: "withdraw-tokens-tx" });
    } catch (error: any) {
      toast.error(error?.message || "Withdrawal failed");
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex flex-col pb-20 lg:pb-0">
        <Header />
        <TradingViewTicker />
        <HeroBanner title="Presale Admin" subtitle="Configure presale rounds and whitelist" />
        <main className="container mx-auto px-4 pt-12 pb-12 flex-1">
          <Card className="p-8 text-center">
            <AlertTriangle className="h-16 w-16 mx-auto text-yellow-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Connect Wallet</h2>
            <p className="text-muted-foreground">Please connect your wallet to access admin functions.</p>
          </Card>
        </main>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-background flex flex-col pb-20 lg:pb-0">
        <Header />
        <TradingViewTicker />
        <HeroBanner title="Presale Admin" subtitle="Configure presale rounds and whitelist" />
        <main className="container mx-auto px-4 pt-12 pb-12 flex-1">
          <Card className="p-8 text-center">
            <ShieldCheck className="h-16 w-16 mx-auto text-red-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">Only the contract owner can access admin functions.</p>
            <p className="text-xs text-muted-foreground mt-2">Connected: {address}</p>
            <p className="text-xs text-muted-foreground">Owner: {contractOwner as string}</p>
          </Card>
        </main>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  const config = roundConfigs[selectedRound];

  const formatDateDisplay = (dateStr: string, timeStr: string) => {
    if (!dateStr) return "Not Set";
    const date = new Date(`${dateStr}T${timeStr}`);
    return date.toLocaleString("en-US", {
      weekday: "short",
      month: "short", 
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: RoundStatus) => {
    if (!status.isConfigured) return <Badge variant="outline">Not Configured</Badge>;
    if (status.isActive) return <Badge className="bg-green-500">Active</Badge>;
    if (status.isUpcoming) return <Badge variant="secondary">Upcoming</Badge>;
    if (status.isEnded) return <Badge variant="outline">Ended</Badge>;
    return <Badge variant="outline">Inactive</Badge>;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 lg:pb-0">
      <Header />
      <TradingViewTicker />
      <HeroBanner title="Presale Admin Panel" subtitle="Configure rounds, whitelist, and manage presale" />
      
      <main className="container mx-auto px-4 pt-12 pb-12 flex-1">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 text-sm">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        {presaleEnded && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/30">
            <p className="text-red-400 font-medium">⚠️ Presale has ended. Configuration is locked.</p>
          </div>
        )}

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Round Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ROUND_NAMES.map((name, index) => {
              const status = roundStatuses[index];
              const cfg = roundConfigs[index];
              const supply = parseFloat(cfg.supply) || 0;
              const sold = status.sold ? Number(formatUnits(status.sold, decimals)) : 0;
              const progress = supply > 0 ? (sold / supply) * 100 : 0;
              
              return (
                <Card 
                  key={index} 
                  className={`p-4 bg-gradient-to-br ${ROUND_COLORS[index]} cursor-pointer transition-all hover:scale-[1.02] ${selectedRound === index ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setSelectedRound(index)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold">{name}</h3>
                    {getStatusBadge(status)}
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">
                      <span className="block">Start: {formatDateDisplay(cfg.startDate, cfg.startTime)}</span>
                      <span className="block">End: {formatDateDisplay(cfg.endDate, cfg.endTime)}</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="text-xs text-muted-foreground flex justify-between">
                      <span>{sold.toLocaleString()} sold</span>
                      <span>{progress.toFixed(1)}%</span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Round Selection */}
          <Tabs value={selectedRound.toString()} onValueChange={(v) => setSelectedRound(parseInt(v))}>
            <TabsList className="grid w-full grid-cols-3">
              {ROUND_NAMES.map((name, index) => (
                <TabsTrigger key={index} value={index.toString()} className="flex items-center gap-2">
                  {roundStatuses[index].isActive && <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
                  {name} Round
                </TabsTrigger>
              ))}
            </TabsList>

            {[0, 1, 2].map((roundIndex) => (
              <TabsContent key={roundIndex} value={roundIndex.toString()} className="space-y-6">
                {/* Round Configuration */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <Settings className="h-6 w-6 text-primary" />
                      <h2 className="text-xl font-bold">{ROUND_NAMES[roundIndex]} Round Configuration</h2>
                    </div>
                    {getStatusBadge(roundStatuses[roundIndex])}
                  </div>

                  {/* Quick Info */}
                  {roundStatuses[roundIndex].isConfigured && (
                    <div className="mb-6 p-4 rounded-lg bg-muted/50 border">
                      <div className="flex items-center gap-2 mb-2">
                        <Info className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Current Configuration</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground block">Rate</span>
                          <span className="font-medium">1 BNB = {parseFloat(roundConfigs[roundIndex].price) > 0 ? Math.floor(1 / parseFloat(roundConfigs[roundIndex].price)).toLocaleString() : 0} PM</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Supply</span>
                          <span className="font-medium">{parseFloat(roundConfigs[roundIndex].supply).toLocaleString()} PM</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Min Buy</span>
                          <span className="font-medium">{roundConfigs[roundIndex].minBuy} BNB</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Max/Wallet</span>
                          <span className="font-medium">{parseFloat(roundConfigs[roundIndex].maxBuyTokens).toLocaleString()} PM</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Price (BNB per token)</Label>
                      <Input
                        type="number"
                        step="0.000001"
                        placeholder="0.00001"
                        value={roundConfigs[roundIndex].price}
                        onChange={(e) => handleConfigChange('price', e.target.value)}
                        disabled={presaleEnded as boolean}
                      />
                      <p className="text-xs text-muted-foreground">
                        Rate: 1 BNB = {parseFloat(roundConfigs[roundIndex].price) > 0 ? Math.floor(1 / parseFloat(roundConfigs[roundIndex].price)).toLocaleString() : 0} PM
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Supply (tokens)</Label>
                      <Input
                        type="number"
                        placeholder="5000000000"
                        value={roundConfigs[roundIndex].supply}
                        onChange={(e) => handleConfigChange('supply', e.target.value)}
                        disabled={presaleEnded as boolean}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        value={roundConfigs[roundIndex].startDate}
                        onChange={(e) => handleConfigChange('startDate', e.target.value)}
                        disabled={presaleEnded as boolean}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Start Time</Label>
                      <Input
                        type="time"
                        value={roundConfigs[roundIndex].startTime}
                        onChange={(e) => handleConfigChange('startTime', e.target.value)}
                        disabled={presaleEnded as boolean}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input
                        type="date"
                        value={roundConfigs[roundIndex].endDate}
                        onChange={(e) => handleConfigChange('endDate', e.target.value)}
                        disabled={presaleEnded as boolean}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>End Time</Label>
                      <Input
                        type="time"
                        value={roundConfigs[roundIndex].endTime}
                        onChange={(e) => handleConfigChange('endTime', e.target.value)}
                        disabled={presaleEnded as boolean}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Min Buy (BNB)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={roundConfigs[roundIndex].minBuy}
                        onChange={(e) => handleConfigChange('minBuy', e.target.value)}
                        disabled={presaleEnded as boolean}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Max Tokens per Wallet</Label>
                      <Input
                        type="number"
                        value={roundConfigs[roundIndex].maxBuyTokens}
                        onChange={(e) => handleConfigChange('maxBuyTokens', e.target.value)}
                        disabled={presaleEnded as boolean}
                      />
                    </div>

                    <div className="flex items-center justify-between col-span-full p-4 rounded-lg bg-muted/50">
                      <div>
                        <Label>Whitelist Required</Label>
                        <p className="text-sm text-muted-foreground">Only whitelisted addresses can participate</p>
                      </div>
                      <Switch
                        checked={roundConfigs[roundIndex].whitelistEnabled}
                        onCheckedChange={(checked) => handleConfigChange('whitelistEnabled', checked)}
                        disabled={presaleEnded as boolean}
                      />
                    </div>
                  </div>

                  <Button
                    variant="gradient"
                    className="w-full mt-6"
                    onClick={handleConfigureRound}
                    disabled={isPending || isConfirming || presaleEnded as boolean}
                  >
                    {(isPending || isConfirming) ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Configuring...
                      </>
                    ) : (
                      <>
                        <Settings className="h-5 w-5 mr-2" />
                        Save {ROUND_NAMES[roundIndex]} Configuration
                      </>
                    )}
                  </Button>
                </Card>

                {/* Whitelist Management */}
                {roundConfigs[roundIndex].whitelistEnabled && (
                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <Users className="h-6 w-6 text-primary" />
                      <h2 className="text-xl font-bold">{ROUND_NAMES[roundIndex]} Whitelist Management</h2>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Wallet Addresses (one per line or comma-separated)</Label>
                        <Textarea
                          placeholder="0x1234...&#10;0x5678...&#10;0xabcd..."
                          rows={6}
                          value={whitelistAddresses}
                          onChange={(e) => setWhitelistAddresses(e.target.value)}
                          disabled={presaleEnded as boolean}
                        />
                      </div>

                      <div className="flex gap-4">
                        <Button
                          variant="default"
                          className="flex-1"
                          onClick={() => handleSetWhitelist(true)}
                          disabled={isPending || isConfirming || presaleEnded as boolean}
                        >
                          Add to Whitelist
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleSetWhitelist(false)}
                          disabled={isPending || isConfirming || presaleEnded as boolean}
                        >
                          Remove from Whitelist
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}
              </TabsContent>
            ))}
          </Tabs>

          {/* Promo Banner Settings */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Gift className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-bold">Promo Banner Settings</h2>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <Label>Enable Promo Banner</Label>
                  <p className="text-sm text-muted-foreground">Show the promotional banner on the website</p>
                </div>
                <Switch
                  checked={promoSettings.enabled}
                  onCheckedChange={(checked) => {
                    const newSettings = { ...promoSettings, enabled: checked };
                    setPromoSettings(newSettings);
                    localStorage.setItem(PROMO_SETTINGS_KEY, JSON.stringify(newSettings));
                    toast.success(checked ? "Promo banner enabled" : "Promo banner disabled");
                  }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Percent className="h-4 w-4" />
                    Bonus Percentage
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={promoSettings.bonusPercentage}
                    onChange={(e) => setPromoSettings({ ...promoSettings, bonusPercentage: Number(e.target.value) })}
                    placeholder="10"
                  />
                  <p className="text-xs text-muted-foreground">
                    Bonus percentage displayed in the promo banner
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Banner Text</Label>
                  <Input
                    value={promoSettings.bannerText}
                    onChange={(e) => setPromoSettings({ ...promoSettings, bannerText: e.target.value })}
                    placeholder="🚀 Token Sale is now Open..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Use {"{bonus}"} to insert the bonus percentage
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30">
                <p className="text-sm font-medium mb-1">Preview:</p>
                <p className="text-sm">
                  {promoSettings.bannerText.replace("{bonus}", promoSettings.bonusPercentage.toString())}
                </p>
              </div>

              <Button
                variant="gradient"
                className="w-full"
                onClick={() => {
                  localStorage.setItem(PROMO_SETTINGS_KEY, JSON.stringify(promoSettings));
                  toast.success("Promo banner settings saved!");
                  // Dispatch custom event for PromoBanner to listen to
                  window.dispatchEvent(new CustomEvent('promoSettingsUpdated', { detail: promoSettings }));
                }}
              >
                Save Promo Settings
              </Button>
            </div>
          </Card>

          {/* Admin Actions */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-6">Presale Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="destructive"
                onClick={handleEndPresale}
                disabled={isPending || isConfirming || presaleEnded as boolean}
              >
                End Presale
              </Button>
              <Button
                variant="outline"
                onClick={handleWithdrawBNB}
                disabled={isPending || isConfirming || !presaleEnded}
              >
                Withdraw BNB
              </Button>
              <Button
                variant="outline"
                onClick={handleWithdrawUnsoldTokens}
                disabled={isPending || isConfirming || !presaleEnded}
              >
                Withdraw Unsold Tokens
              </Button>
            </div>
            {!presaleEnded && (
              <p className="text-xs text-muted-foreground mt-4">
                Note: Withdraw functions are only available after presale ends.
              </p>
            )}
          </Card>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default PresaleAdminPage;
