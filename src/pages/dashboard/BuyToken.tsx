import { useState, useEffect } from "react";
import pmLogo from "@/assets/pm-logo-new.png";
import bnbLogo from "@/assets/bnb-logo.png";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Header } from "@/components/Header";
import { TradingViewTicker } from "@/components/TradingViewTicker";
import { HeroBanner } from "@/components/HeroBanner";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Footer } from "@/components/Footer";
import { WalletCard } from "@/components/WalletCard";
import { PresalePurchaseHistory } from "@/components/PresalePurchaseHistory";
import {
  ArrowLeft,
  Wallet,
  ArrowRightLeft,
  Clock,
  TrendingUp,
  Loader2,
  Lock,
  Unlock,
  CheckCircle,
  AlertTriangle,
  Settings,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { parseEther, formatEther, formatUnits } from "viem";
import { PMPresaleABI } from "@/contracts/abis";
import { CONTRACT_ADDRESSES } from "@/contracts/addresses";

const PRESALE_ADDRESS = CONTRACT_ADDRESSES[56].PMPresale as `0x${string}`;

const ROUND_NAMES = ["Seed", "Private", "Public"] as const;
const ROUND_COLORS = [
  "from-yellow-500/20 to-orange-500/20",
  "from-blue-500/20 to-purple-500/20",
  "from-green-500/20 to-emerald-500/20",
];
const ROUND_BADGES = [
  "bg-yellow-500/20 text-yellow-400",
  "bg-blue-500/20 text-blue-400",
  "bg-green-500/20 text-green-400",
];

interface RoundInfo {
  price: bigint;
  supply: bigint;
  sold: bigint;
  start: bigint;
  end: bigint;
  minBuy: bigint;
  maxBuyTokens: bigint;
  whitelistEnabled: boolean;
}

const BuyTokenPage = () => {
  const { address, isConnected } = useAccount();
  const [bnbAmount, setBnbAmount] = useState("");
  const [pmAmount, setPmAmount] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedRound, setSelectedRound] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Fetch BNB balance from blockchain
  const { data: bnbBalance } = useBalance({
    address,
    chainId: 56,
  });

  // Read presale ended status
  const { data: presaleEnded } = useReadContract({
    address: PRESALE_ADDRESS,
    abi: PMPresaleABI,
    functionName: "presaleEnded",
    chainId: 56,
  });

  // Read token decimals
  const { data: tokenDecimals } = useReadContract({
    address: PRESALE_ADDRESS,
    abi: PMPresaleABI,
    functionName: "tokenDecimals",
    chainId: 56,
  });

  // Read round info using getRoundInfo helper function
  const { data: seedRoundData, refetch: refetchSeed } = useReadContract({
    address: PRESALE_ADDRESS,
    abi: PMPresaleABI,
    functionName: "getRoundInfo",
    args: [0],
    chainId: 56,
  });

  const { data: privateRoundData, refetch: refetchPrivate } = useReadContract({
    address: PRESALE_ADDRESS,
    abi: PMPresaleABI,
    functionName: "getRoundInfo",
    args: [1],
    chainId: 56,
  });

  const { data: publicRoundData, refetch: refetchPublic } = useReadContract({
    address: PRESALE_ADDRESS,
    abi: PMPresaleABI,
    functionName: "getRoundInfo",
    args: [2],
    chainId: 56,
  });

  // Read total sold and supply directly from contract
  const { data: totalSoldData, refetch: refetchTotalSold } = useReadContract({
    address: PRESALE_ADDRESS,
    abi: PMPresaleABI,
    functionName: "getTotalSold",
    chainId: 56,
  });

  const { data: totalSupplyData, refetch: refetchTotalSupply } = useReadContract({
    address: PRESALE_ADDRESS,
    abi: PMPresaleABI,
    functionName: "getTotalSupply",
    chainId: 56,
  });

  // Read active round from contract
  const { data: activeRoundData, refetch: refetchActiveRound } = useReadContract({
    address: PRESALE_ADDRESS,
    abi: PMPresaleABI,
    functionName: "getActiveRound",
    chainId: 56,
  });

  // Read contract owner to check if current user is admin
  const { data: contractOwner } = useReadContract({
    address: PRESALE_ADDRESS,
    abi: PMPresaleABI,
    functionName: "owner",
    chainId: 56,
  });

  // Check if connected wallet is owner
  const isOwner = address && contractOwner && address.toLowerCase() === (contractOwner as string).toLowerCase();

  // Check if user is whitelisted for selected round
  const { data: isUserWhitelisted, refetch: refetchWhitelist } = useReadContract({
    address: PRESALE_ADDRESS,
    abi: PMPresaleABI,
    functionName: "isWhitelisted",
    args: [selectedRound, address || "0x0000000000000000000000000000000000000000"],
    chainId: 56,
  });

  // Read user purchased amount for each round
  const { data: userPurchasedSeed, refetch: refetchUserSeed } = useReadContract({
    address: PRESALE_ADDRESS,
    abi: PMPresaleABI,
    functionName: "purchasedAmount",
    args: [0, address || "0x0000000000000000000000000000000000000000"],
    chainId: 56,
  });

  const { data: userPurchasedPrivate, refetch: refetchUserPrivate } = useReadContract({
    address: PRESALE_ADDRESS,
    abi: PMPresaleABI,
    functionName: "purchasedAmount",
    args: [1, address || "0x0000000000000000000000000000000000000000"],
    chainId: 56,
  });

  const { data: userPurchasedPublic, refetch: refetchUserPublic } = useReadContract({
    address: PRESALE_ADDRESS,
    abi: PMPresaleABI,
    functionName: "purchasedAmount",
    args: [2, address || "0x0000000000000000000000000000000000000000"],
    chainId: 56,
  });

  // Write contract for buying tokens
  const { writeContract, data: txHash, isPending } = useWriteContract();

  // Wait for transaction
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Parse round data helper
  const parseRoundData = (data: any): RoundInfo | null => {
    if (!data) return null;
    return {
      price: data[0],
      supply: data[1],
      sold: data[2],
      start: data[3],
      end: data[4],
      minBuy: data[5],
      maxBuyTokens: data[6],
      whitelistEnabled: data[7],
    };
  };

  // Process round info
  const roundInfos: (RoundInfo | null)[] = [
    parseRoundData(seedRoundData),
    parseRoundData(privateRoundData),
    parseRoundData(publicRoundData),
  ];

  const userPurchased = [userPurchasedSeed, userPurchasedPrivate, userPurchasedPublic];

  const currentRoundInfo = roundInfos[selectedRound];
  const currentUserPurchased = userPurchased[selectedRound] || 0n;

  // Calculate exchange rate for selected round
  const decimals = tokenDecimals || 18;
  const getExchangeRate = (roundInfo: RoundInfo | null) => {
    if (!roundInfo || roundInfo.price === 0n) return 100000;
    // price is in wei per token, so 1 BNB (1e18 wei) / price = tokens per BNB
    return Number(10n ** 18n / roundInfo.price);
  };

  const exchangeRate = getExchangeRate(currentRoundInfo);

  // Use totals directly from contract
  const totalSoldAmount = totalSoldData ? Number(formatUnits(totalSoldData as bigint, Number(decimals))) : 0;
  const totalSupplyAmount = totalSupplyData ? Number(formatUnits(totalSupplyData as bigint, Number(decimals))) : 0;

  const soldPercentage = totalSupplyAmount > 0 ? (totalSoldAmount / totalSupplyAmount) * 100 : 0;
  const remaining = totalSupplyAmount - totalSoldAmount;

  // Get active round from contract
  const contractActiveRound = activeRoundData !== undefined ? Number(activeRoundData) : -1;

  // Countdown Timer for selected round
  useEffect(() => {
    const roundInfo = roundInfos[selectedRound];
    if (!roundInfo) return;

    const updateCountdown = () => {
      const now = Math.floor(Date.now() / 1000);
      const endTime = Number(roundInfo.end);
      const startTime = Number(roundInfo.start);

      let targetTime: number;
      if (now < startTime) {
        targetTime = startTime; // Count to start
      } else {
        targetTime = endTime; // Count to end
      }

      const distance = (targetTime - now) * 1000;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [selectedRound, seedRoundData, privateRoundData, publicRoundData]);

  const handleBnbChange = (value: string) => {
    setBnbAmount(value);
    const pm = parseFloat(value) * exchangeRate;
    setPmAmount(pm ? pm.toFixed(2) : "");
  };

  const handlePmChange = (value: string) => {
    setPmAmount(value);
    const bnb = parseFloat(value) / exchangeRate;
    setBnbAmount(bnb ? bnb.toFixed(6) : "");
  };

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed && txHash) {
      setIsProcessing(false);
      setShowSuccessModal(true);
      toast.dismiss("confirm-tx");
      toast.success(`Purchase successful! ${parseFloat(pmAmount).toLocaleString()} PM added to your balance.`);
      window.dispatchEvent(new Event("balanceUpdate"));
      window.dispatchEvent(new Event("transactionUpdate"));
      setBnbAmount("");
      setPmAmount("");
      // Refetch all data
      refetchSeed();
      refetchPrivate();
      refetchPublic();
      refetchUserSeed();
      refetchUserPrivate();
      refetchUserPublic();
      refetchTotalSold();
      refetchTotalSupply();
      refetchActiveRound();
      refetchWhitelist();
    }
  }, [isConfirmed, txHash, pmAmount]);

  // Auto-refresh data every 30 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      refetchSeed();
      refetchPrivate();
      refetchPublic();
      refetchTotalSold();
      refetchTotalSupply();
      refetchActiveRound();
      if (isConnected) {
        refetchUserSeed();
        refetchUserPrivate();
        refetchUserPublic();
        refetchWhitelist();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isConnected, refetchSeed, refetchPrivate, refetchPublic, refetchTotalSold, refetchTotalSupply, refetchActiveRound, refetchUserSeed, refetchUserPrivate, refetchUserPublic, refetchWhitelist]);

  const isRoundActive = (roundInfo: RoundInfo | null) => {
    if (!roundInfo) return false;
    const now = Math.floor(Date.now() / 1000);
    return now >= Number(roundInfo.start) && now <= Number(roundInfo.end);
  };

  const isRoundUpcoming = (roundInfo: RoundInfo | null) => {
    if (!roundInfo) return false;
    const now = Math.floor(Date.now() / 1000);
    return now < Number(roundInfo.start);
  };

  const handleBuy = async () => {
    if (!bnbAmount || !pmAmount) {
      toast.error("Please enter an amount");
      return;
    }

    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }

    if (presaleEnded) {
      toast.error("Presale has ended");
      return;
    }

    if (!isRoundActive(currentRoundInfo)) {
      toast.error("This round is not active");
      return;
    }

    // Check whitelist status
    if (currentRoundInfo?.whitelistEnabled && !isUserWhitelisted) {
      toast.error("You are not whitelisted for this round");
      return;
    }

    const bnbRequired = parseFloat(bnbAmount);
    const currentBnbBalance = bnbBalance ? parseFloat(bnbBalance.formatted) : 0;

    if (bnbRequired > currentBnbBalance) {
      toast.error("Insufficient BNB balance");
      return;
    }

    const minBuyBnb = currentRoundInfo ? Number(formatEther(currentRoundInfo.minBuy)) : 0.01;
    if (bnbRequired < minBuyBnb) {
      toast.error(`Minimum purchase is ${minBuyBnb} BNB`);
      return;
    }

    // Check max buy tokens
    const pmToBuy = parseFloat(pmAmount);
    const alreadyPurchased = currentUserPurchased
      ? Number(formatUnits(currentUserPurchased as bigint, Number(decimals)))
      : 0;
    const maxTokens = currentRoundInfo ? Number(formatUnits(currentRoundInfo.maxBuyTokens, Number(decimals))) : 0;

    if (maxTokens > 0 && alreadyPurchased + pmToBuy > maxTokens) {
      toast.error(
        `Exceeds max per wallet. You can buy up to ${(maxTokens - alreadyPurchased).toLocaleString()} more PM`,
      );
      return;
    }

    setIsProcessing(true);
    toast.loading("Initiating transaction...", { id: "buy-tx" });

    try {
      writeContract({
        address: PRESALE_ADDRESS,
        abi: PMPresaleABI,
        functionName: "buyTokens",
        args: [selectedRound],
        value: parseEther(bnbAmount),
      } as any);

      toast.dismiss("buy-tx");
      toast.loading("Please confirm in your wallet...", { id: "confirm-tx" });
    } catch (error: any) {
      setIsProcessing(false);
      toast.dismiss("buy-tx");
      toast.dismiss("confirm-tx");
      toast.error(error?.message || "Transaction failed");
    }
  };

  const getRoundStatus = (roundInfo: RoundInfo | null, index: number) => {
    if (!roundInfo) return "Not Configured";
    if (roundInfo.price === 0n) return "Not Configured";
    // Use contract's active round for accurate status
    if (contractActiveRound === index) return "Active";
    const now = Math.floor(Date.now() / 1000);
    if (now < Number(roundInfo.start)) return "Upcoming";
    if (now > Number(roundInfo.end)) return "Ended";
    return "Inactive";
  };

  const formatDate = (timestamp: bigint) => {
    if (!timestamp || timestamp === 0n) return "Not Set";
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });
  };

  // Get price per token in BNB (for display)
  const getPricePerToken = (roundInfo: RoundInfo | null) => {
    if (!roundInfo || roundInfo.price === 0n) return "0";
    // price is wei per token, convert to BNB
    return formatEther(roundInfo.price);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 lg:pb-0">
      <Header />
      <TradingViewTicker />
      <HeroBanner title="Buy PM Tokens" subtitle="Multi-round presale: Seed → Private → Public" />

      <main className="container mx-auto px-4 pt-12 pb-12 flex-1">
        {/* Mobile Wallet Card */}
        <div className="md:hidden mb-6">
          <WalletCard showQuickFunctionsToggle={false} compact={true} />
        </div>

        <div className="flex items-center justify-between mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          
          {isOwner && (
            <Link to="/dashboard/presale-admin">
              <Button variant="outline" size="sm" className="gap-2">
                <Settings className="h-4 w-4" />
                Admin Panel
              </Button>
            </Link>
          )}
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Total Presale Progress */}
          <Card className="p-6 bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-sm border-primary/30">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl md:text-2xl font-bold mb-2">🔥 PM Token Multi-Round Presale</h2>
                <p className="text-muted-foreground text-xs">Three rounds with progressive pricing</p>
              </div>
              {presaleEnded && (
                <Badge variant="destructive" className="text-sm">
                  Presale Ended
                </Badge>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Total Presale Progress</span>
                  <span className="text-sm font-bold text-primary">{soldPercentage.toFixed(2)}% Sold</span>
                </div>
                <Progress value={soldPercentage} className="h-3" />
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>Sold: {totalSoldAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })} PM</span>
                  <span>Remaining: {remaining.toLocaleString("en-US", { maximumFractionDigits: 0 })} PM</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Round Selection Tabs */}
          <Tabs defaultValue="0" onValueChange={(v) => setSelectedRound(parseInt(v))} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              {ROUND_NAMES.map((name, index) => {
                const info = roundInfos[index];
                const status = getRoundStatus(info, index);
                return (
                  <TabsTrigger key={index} value={index.toString()} className="relative">
                    <span className="flex items-center gap-2">
                      {status === "Active" && <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
                      {status === "Upcoming" && <Lock className="w-3 h-3" />}
                      {status === "Ended" && <CheckCircle className="w-3 h-3" />}
                      {name}
                    </span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {[0, 1, 2].map((roundIndex) => {
              const info = roundInfos[roundIndex];
              const status = getRoundStatus(info, roundIndex);
              const isActive = status === "Active";
              const roundSold = info ? Number(formatUnits(info.sold, Number(decimals))) : 0;
              const roundSupply = info ? Number(formatUnits(info.supply, Number(decimals))) : 0;
              const roundProgress = roundSupply > 0 ? (roundSold / roundSupply) * 100 : 0;
              const userBought = userPurchased[roundIndex]
                ? Number(formatUnits(userPurchased[roundIndex] as bigint, Number(decimals)))
                : 0;

              return (
                <TabsContent key={roundIndex} value={roundIndex.toString()} className="space-y-6">
                  {/* Round Info Card */}
                  <Card
                    className={`p-6 bg-gradient-to-br ${ROUND_COLORS[roundIndex]} backdrop-blur-sm border-primary/30`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Badge className={ROUND_BADGES[roundIndex]}>{ROUND_NAMES[roundIndex]} Round</Badge>
                        <Badge variant={isActive ? "default" : status === "Upcoming" ? "secondary" : "outline"}>
                          {status}
                        </Badge>
                      </div>
                      {info?.whitelistEnabled && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          Whitelist Only
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="p-3 bg-background/50 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Rate</p>
                        <p className="text-sm md:text-base font-bold">
                          1 BNB = {getExchangeRate(info).toLocaleString()} PM
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ({getPricePerToken(info)} BNB/PM)
                        </p>
                      </div>
                      <div className="p-3 bg-background/50 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Allocation</p>
                        <p className="text-sm md:text-base font-bold">
                          {roundSupply.toLocaleString("en-US", { maximumFractionDigits: 0 })} PM
                        </p>
                      </div>
                      <div className="p-3 bg-background/50 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Min Buy</p>
                        <p className="text-sm md:text-base font-bold">{info ? formatEther(info.minBuy) : "0"} BNB</p>
                      </div>
                      <div className="p-3 bg-background/50 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Max Per Wallet</p>
                        <p className="text-sm md:text-base font-bold">
                          {info
                            ? Number(formatUnits(info.maxBuyTokens, Number(decimals))).toLocaleString("en-US", {
                                maximumFractionDigits: 0,
                              })
                            : "0"}{" "}
                          PM
                        </p>
                      </div>
                    </div>

                    {/* Round Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">{ROUND_NAMES[roundIndex]} Progress</span>
                        <span className="text-sm font-bold text-primary">{roundProgress.toFixed(2)}%</span>
                      </div>
                      <Progress value={roundProgress} className="h-3" />
                      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                        <span>Sold: {roundSold.toLocaleString("en-US", { maximumFractionDigits: 0 })} PM</span>
                        <span>
                          Remaining: {(roundSupply - roundSold).toLocaleString("en-US", { maximumFractionDigits: 0 })}{" "}
                          PM
                        </span>
                      </div>
                    </div>

                    {/* User Purchase Info */}
                    {isConnected && userBought > 0 && (
                      <div className="p-3 bg-primary/10 rounded-lg border border-primary/20 mb-4">
                        <p className="text-sm text-muted-foreground">Your Purchase</p>
                        <p className="text-lg font-bold text-primary">
                          {userBought.toLocaleString("en-US", { maximumFractionDigits: 0 })} PM
                        </p>
                      </div>
                    )}

                    {/* Round Dates */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Start</p>
                          <p className="font-medium">{info ? formatDate(info.start) : "Not Set"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">End</p>
                          <p className="font-medium">{info ? formatDate(info.end) : "Not Set"}</p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Countdown Timer */}
                  {(isActive || isRoundUpcoming(info)) && selectedRound === roundIndex && (
                    <Card className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
                      <div className="text-center mb-3">
                        <p className="text-sm text-muted-foreground">
                          {isRoundUpcoming(info) ? "Round Starts In" : "Round Ends In"}
                        </p>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-center">
                        {Object.entries(timeLeft).map(([unit, value]) => (
                          <div key={unit} className="p-2 bg-background/50 rounded-lg">
                            <p className="text-2xl font-bold text-primary">{value}</p>
                            <p className="text-xs text-muted-foreground capitalize">{unit}</p>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* Buy Form */}
                  <Card className="p-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-primary" />
                      Buy PM Tokens
                    </h3>

                    <div className="space-y-4">
                      {/* BNB Input */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <img src={bnbLogo} alt="BNB" className="w-5 h-5" />
                          You Pay (BNB)
                        </Label>
                        <div className="relative">
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={bnbAmount}
                            onChange={(e) => handleBnbChange(e.target.value)}
                            className="pr-16"
                            disabled={!isActive || presaleEnded}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                            BNB
                          </span>
                        </div>
                        {bnbBalance && (
                          <p className="text-xs text-muted-foreground">
                            Balance: {parseFloat(bnbBalance.formatted).toFixed(4)} BNB
                          </p>
                        )}
                      </div>

                      {/* Exchange Icon */}
                      <div className="flex justify-center">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <ArrowRightLeft className="h-5 w-5 text-primary" />
                        </div>
                      </div>

                      {/* PM Output */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <img src={pmLogo} alt="PM" className="w-5 h-5 rounded-full" />
                          You Receive (PM)
                        </Label>
                        <div className="relative">
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={pmAmount}
                            onChange={(e) => handlePmChange(e.target.value)}
                            className="pr-16"
                            disabled={!isActive || presaleEnded}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                            PM
                          </span>
                        </div>
                      </div>

                      {/* Exchange Rate Info */}
                      <div className="p-3 bg-muted/50 rounded-lg space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Exchange Rate</span>
                          <span className="font-medium">1 BNB = {exchangeRate.toLocaleString()} PM</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Network Fee</span>
                          <span className="font-medium">~0.0005 BNB</span>
                        </div>
                      </div>

                      {/* Whitelist Warning */}
                      {info?.whitelistEnabled && (
                        <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                          <p className="text-sm text-yellow-400 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            This round is whitelist-only. Make sure you're whitelisted before purchasing.
                          </p>
                        </div>
                      )}

                      {/* Status Messages */}
                      {!isActive && status !== "Not Configured" && (
                        <div className="p-3 bg-muted/50 rounded-lg text-center">
                          <p className="text-sm text-muted-foreground">
                            {isRoundUpcoming(info) ? "This round has not started yet" : "This round has ended"}
                          </p>
                        </div>
                      )}

                      {/* Buy Button */}
                      <Button
                        variant="gradient"
                        size="lg"
                        className="w-full"
                        onClick={handleBuy}
                        disabled={
                          !isConnected || !isActive || isPending || isConfirming || isProcessing || presaleEnded
                        }
                      >
                        {!isConnected ? (
                          "Connect Wallet"
                        ) : presaleEnded ? (
                          "Presale Ended"
                        ) : !isActive ? (
                          "Round Not Active"
                        ) : isPending || isConfirming || isProcessing ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            {isPending ? "Confirming..." : "Processing..."}
                          </>
                        ) : (
                          <>
                            <TrendingUp className="h-5 w-5 mr-2" />
                            Buy PM Tokens
                          </>
                        )}
                      </Button>
                    </div>
                  </Card>
                </TabsContent>
              );
            })}
          </Tabs>

          {/* Claim Info */}
          <Card className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <div>
                <p className="font-medium">Token Claiming</p>
                <p className="text-sm text-muted-foreground">
                  After the presale ends, claim your tokens from the{" "}
                  <Link to="/dashboard/token-claim" className="text-primary hover:underline">
                    Token Claim page
                  </Link>
                </p>
              </div>
            </div>
          </Card>

          {/* Purchase History */}
          {isConnected && tokenDecimals !== undefined && (
            <PresalePurchaseHistory tokenDecimals={Number(tokenDecimals)} />
          )}
        </div>
      </main>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              Purchase Successful!
            </DialogTitle>
            <DialogDescription className="space-y-4 pt-4">
              <div className="p-4 bg-green-500/10 rounded-lg text-center">
                <p className="text-3xl font-bold text-green-500 mb-1">
                  {parseFloat(pmAmount || "0").toLocaleString()} PM
                </p>
                <p className="text-sm text-muted-foreground">Tokens purchased in {ROUND_NAMES[selectedRound]} Round</p>
              </div>
              <p className="text-sm text-center text-muted-foreground">
                Your tokens will be available to claim after the presale ends.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowSuccessModal(false)}>
                  Close
                </Button>
                <Button variant="gradient" className="flex-1" asChild>
                  <Link to="/dashboard/token-claim">View Claims</Link>
                </Button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default BuyTokenPage;
