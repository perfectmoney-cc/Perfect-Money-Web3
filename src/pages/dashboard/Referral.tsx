import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/Header";
import { TradingViewTicker } from "@/components/TradingViewTicker";
import { HeroBanner } from "@/components/HeroBanner";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Footer } from "@/components/Footer";
import { WalletCard } from "@/components/WalletCard";
import { 
  ArrowLeft, 
  Users, 
  Copy, 
  Gift, 
  TrendingUp, 
  ChevronLeft, 
  ChevronRight,
  Wallet,
  Coins,
  Vault,
  ShoppingCart,
  Plane,
  DollarSign,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { referralABI } from "@/contracts/referralABI";
import { REFERRAL_CONTRACT_ADDRESS, PM_TOKEN_ADDRESS, USDT_ADDRESS, USDC_ADDRESS } from "@/contracts/addresses";
import { formatUnits } from "viem";

const ReferralPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const referralsPerPage = 10;
  const { address, isConnected } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();

  const walletAddress = address || "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb";
  const referralCode = walletAddress;
  const referralLink = `https://perfectmoney.cc/ref/${referralCode}`;

  // Fetch referrer info from contract
  const { data: referrerInfo, refetch: refetchReferrerInfo } = useReadContract({
    address: REFERRAL_CONTRACT_ADDRESS as `0x${string}`,
    abi: referralABI,
    functionName: "getReferrerInfo",
    args: [walletAddress as `0x${string}`],
  });

  // Fetch total referrals globally
  const { data: totalReferralsData } = useReadContract({
    address: REFERRAL_CONTRACT_ADDRESS as `0x${string}`,
    abi: referralABI,
    functionName: "totalReferrals",
  });

  const totalReferred = referrerInfo ? Number(referrerInfo[0]) : 0;
  const totalEarnedPM = referrerInfo ? formatUnits(referrerInfo[1] as bigint, 18) : "0";
  const totalEarnedUSDT = referrerInfo ? formatUnits(referrerInfo[2] as bigint, 18) : "0";
  const totalEarnedUSDC = referrerInfo ? formatUnits(referrerInfo[3] as bigint, 18) : "0";
  const availablePM = "0";
  const availableUSDT = "0";
  const availableUSDC = "0";

  const hasClaimableRewards = parseFloat(totalEarnedPM) > 0 || parseFloat(totalEarnedUSDT) > 0 || parseFloat(totalEarnedUSDC) > 0;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleClaimCommissions = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      await writeContractAsync({
        address: REFERRAL_CONTRACT_ADDRESS as `0x${string}`,
        abi: referralABI,
        functionName: "claimCommissions",
      } as any);
      
      toast.success("Commissions claimed successfully!");
      refetchReferrerInfo();
    } catch (error: any) {
      console.error("Claim error:", error);
      toast.error(error.shortMessage || "Failed to claim commissions");
    }
  };

  const commissionTypes = [
    {
      icon: Vault,
      title: "Vault Staking",
      description: "10% commission in USDC/USDT",
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
      token: "USDC/USDT"
    },
    {
      icon: Coins,
      title: "PM Token Staking",
      description: "10% commission in PM Token",
      color: "text-primary",
      bg: "bg-primary/10",
      token: "PM"
    },
    {
      icon: Plane,
      title: "Airdrop Claims",
      description: "10% commission in PM Token",
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      token: "PM"
    },
    {
      icon: ShoppingCart,
      title: "Token Purchases",
      description: "10% commission in PM Token",
      color: "text-green-500",
      bg: "bg-green-500/10",
      token: "PM"
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 lg:pb-0">
      <Header />
      <TradingViewTicker />
      <HeroBanner title="Referral Program" subtitle="Earn 10% direct commission on every activity" />
      
      <main className="container mx-auto px-4 pt-12 pb-12 flex-1">
        {/* Mobile Wallet Card */}
        <div className="md:hidden mt-5 mb-6">
          <WalletCard showQuickFunctionsToggle={false} compact={true} />
        </div>

        <Link to="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 text-sm">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-lg bg-gradient-to-r from-primary/20 to-blue-500/20">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Referral Dashboard</h1>
              <p className="text-muted-foreground text-sm">Earn 10% on every referred activity</p>
            </div>
          </div>

          {/* Commission Types */}
          <Card className="p-6 bg-gradient-to-r from-primary/5 via-blue-500/5 to-purple-500/5 border-primary/30 mb-8">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              Earn 10% Direct Commission
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {commissionTypes.map((type, index) => (
                <Card key={index} className="p-4 bg-card/80 backdrop-blur-sm border-border/50">
                  <div className={`p-2 rounded-lg ${type.bg} w-fit mb-3`}>
                    <type.icon className={`h-5 w-5 ${type.color}`} />
                  </div>
                  <h3 className="font-semibold text-sm">{type.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
                  <Badge variant="secondary" className="mt-2 text-xs">{type.token}</Badge>
                </Card>
              ))}
            </div>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-4 bg-card/50 backdrop-blur-sm">
              <Users className="h-6 w-6 text-primary mb-2" />
              <h3 className="font-bold text-2xl">{totalReferred}</h3>
              <p className="text-xs text-muted-foreground">Total Referrals</p>
            </Card>
            <Card className="p-4 bg-card/50 backdrop-blur-sm">
              <Coins className="h-6 w-6 text-yellow-500 mb-2" />
              <h3 className="font-bold text-2xl">{parseFloat(totalEarnedPM).toFixed(2)}</h3>
              <p className="text-xs text-muted-foreground">Total PM Earned</p>
            </Card>
            <Card className="p-4 bg-card/50 backdrop-blur-sm">
              <DollarSign className="h-6 w-6 text-green-500 mb-2" />
              <h3 className="font-bold text-2xl">${(parseFloat(totalEarnedUSDT) + parseFloat(totalEarnedUSDC)).toFixed(2)}</h3>
              <p className="text-xs text-muted-foreground">Total USDT/USDC Earned</p>
            </Card>
            <Card className="p-4 bg-card/50 backdrop-blur-sm">
              <TrendingUp className="h-6 w-6 text-blue-500 mb-2" />
              <h3 className="font-bold text-2xl">{Number(totalReferralsData || 0)}</h3>
              <p className="text-xs text-muted-foreground">Network Total</p>
            </Card>
          </div>

          {/* Claimable Rewards */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm mb-8">
            <h2 className="font-bold text-lg mb-4">Available Commissions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="p-4 bg-primary/5 border-primary/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">PM Token</p>
                    <p className="text-2xl font-bold text-primary">{parseFloat(availablePM).toFixed(4)}</p>
                  </div>
                  <Coins className="h-8 w-8 text-primary opacity-50" />
                </div>
              </Card>
              <Card className="p-4 bg-green-500/5 border-green-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">USDT</p>
                    <p className="text-2xl font-bold text-green-500">${parseFloat(availableUSDT).toFixed(4)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500 opacity-50" />
                </div>
              </Card>
              <Card className="p-4 bg-blue-500/5 border-blue-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">USDC</p>
                    <p className="text-2xl font-bold text-blue-500">${parseFloat(availableUSDC).toFixed(4)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-blue-500 opacity-50" />
                </div>
              </Card>
            </div>
            <Button 
              onClick={handleClaimCommissions}
              disabled={!hasClaimableRewards || isPending || !isConnected}
              className="w-full bg-gradient-to-r from-primary to-blue-600 hover:opacity-90"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Claiming...
                </>
              ) : (
                <>
                  <Wallet className="h-4 w-4 mr-2" />
                  Claim All Commissions
                </>
              )}
            </Button>
          </Card>

          {/* Referral Link */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm mb-6">
            <h2 className="font-bold mb-4 text-lg">Your Referral Link</h2>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input value={referralLink} readOnly className="font-mono text-xs sm:text-sm" />
                <Button variant="outline" onClick={() => copyToClipboard(referralLink)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <h3 className="font-semibold mb-2 text-sm">Your Wallet Address (Referral Code)</h3>
                <div className="flex items-center justify-between gap-2">
                  <code className="text-sm font-mono text-primary break-all">{referralCode}</code>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(referralCode)} className="shrink-0">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* How It Works */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm">
            <h2 className="text-xl font-bold mb-6">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-primary">1</span>
                </div>
                <h3 className="font-semibold mb-1">Share Your Link</h3>
                <p className="text-sm text-muted-foreground">Send your unique referral link to friends</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-primary">2</span>
                </div>
                <h3 className="font-semibold mb-1">They Register</h3>
                <p className="text-sm text-muted-foreground">Your referrals register using your link</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-primary">3</span>
                </div>
                <h3 className="font-semibold mb-1">Earn 10% Forever</h3>
                <p className="text-sm text-muted-foreground">Get 10% on all their transactions</p>
              </div>
            </div>

            <div className="mt-8 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
              <h3 className="font-semibold text-green-500 mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Commission Breakdown
              </h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span>Vault Staking: 10% in USDC/USDT</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <span>PM Staking: 10% in PM Token</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  <span>Airdrop Claims: 10% in PM Token</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span>Token Purchases: 10% in PM Token</span>
                </li>
              </ul>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default ReferralPage;