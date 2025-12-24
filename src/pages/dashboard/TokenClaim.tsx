import { useState, useEffect } from "react";
import pmLogo from "@/assets/pm-logo-new.png";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Header } from "@/components/Header";
import { TradingViewTicker } from "@/components/TradingViewTicker";
import { HeroBanner } from "@/components/HeroBanner";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Footer } from "@/components/Footer";
import { WalletCard } from "@/components/WalletCard";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Gift, Clock, CheckCircle, Loader2, Lock, AlertTriangle, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatUnits } from 'viem';
import { PMTokenClaimABI } from "@/contracts/swapABI";
import { CONTRACT_ADDRESSES } from "@/contracts/addresses";

const CLAIM_ADDRESS = CONTRACT_ADDRESSES[56].PMTokenClaim as `0x${string}`;
const ROUND_NAMES = ["Seed", "Private", "Public"] as const;
const ROUND_COLORS = ["bg-yellow-500/20 text-yellow-400", "bg-blue-500/20 text-blue-400", "bg-green-500/20 text-green-400"];
const ROUND_BORDERS = ["border-yellow-500/30", "border-blue-500/30", "border-green-500/30"];

const TokenClaimPage = () => {
  const { address, isConnected } = useAccount();
  const [claimingRound, setClaimingRound] = useState<number | null>(null);

  // Read claim enabled status
  const { data: claimEnabled } = useReadContract({
    address: CLAIM_ADDRESS,
    abi: PMTokenClaimABI,
    functionName: 'claimEnabled',
    chainId: 56,
  });

  // Read TGE timestamp
  const { data: tgeTimestamp } = useReadContract({
    address: CLAIM_ADDRESS,
    abi: PMTokenClaimABI,
    functionName: 'tgeTimestamp',
    chainId: 56,
  });

  // Read total claimed globally
  const { data: totalClaimedGlobal } = useReadContract({
    address: CLAIM_ADDRESS,
    abi: PMTokenClaimABI,
    functionName: 'totalClaimed',
    chainId: 56,
  });

  // Read user info
  const { data: userInfo, refetch: refetchUserInfo } = useReadContract({
    address: CLAIM_ADDRESS,
    abi: PMTokenClaimABI,
    functionName: 'getUserInfo',
    args: [address || '0x0000000000000000000000000000000000000000'],
    chainId: 56,
  });

  // Read vesting info for each round
  const { data: seedVesting } = useReadContract({
    address: CLAIM_ADDRESS,
    abi: PMTokenClaimABI,
    functionName: 'getVestingInfo',
    args: [0],
    chainId: 56,
  });

  const { data: privateVesting } = useReadContract({
    address: CLAIM_ADDRESS,
    abi: PMTokenClaimABI,
    functionName: 'getVestingInfo',
    args: [1],
    chainId: 56,
  });

  const { data: publicVesting } = useReadContract({
    address: CLAIM_ADDRESS,
    abi: PMTokenClaimABI,
    functionName: 'getVestingInfo',
    args: [2],
    chainId: 56,
  });

  // Write contract
  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed && txHash) {
      toast.dismiss("claim-tx");
      toast.dismiss("claim-all-tx");
      toast.success("Tokens claimed successfully!");
      setClaimingRound(null);
      refetchUserInfo();
    }
  }, [isConfirmed, txHash]);

  const handleClaim = async (round: number) => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }

    setClaimingRound(round);
    
    try {
      writeContract({
        address: CLAIM_ADDRESS,
        abi: PMTokenClaimABI,
        functionName: 'claim',
        args: [round],
      } as any);
      
      toast.loading("Claiming tokens...", { id: "claim-tx" });
    } catch (error: any) {
      setClaimingRound(null);
      toast.error(error?.message || "Claim failed");
    }
  };

  const handleClaimAll = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }

    setClaimingRound(-1); // -1 indicates claim all
    
    try {
      writeContract({
        address: CLAIM_ADDRESS,
        abi: PMTokenClaimABI,
        functionName: 'claimAll',
        args: [],
      } as any);
      
      toast.loading("Claiming all tokens...", { id: "claim-all-tx" });
    } catch (error: any) {
      setClaimingRound(null);
      toast.error(error?.message || "Claim failed");
    }
  };

  const vestingInfos = [seedVesting, privateVesting, publicVesting];

  const formatVestingDuration = (seconds: bigint) => {
    const days = Number(seconds) / 86400;
    if (days >= 365) return `${(days / 365).toFixed(0)} year${days >= 730 ? 's' : ''}`;
    if (days >= 30) return `${(days / 30).toFixed(0)} month${days >= 60 ? 's' : ''}`;
    return `${days.toFixed(0)} day${days > 1 ? 's' : ''}`;
  };

  const getVestingStatus = (vestingInfo: any) => {
    if (!vestingInfo || !claimEnabled || !tgeTimestamp) return "Not Started";
    const now = Math.floor(Date.now() / 1000);
    const tgePercent = Number(vestingInfo[0]);
    
    // 100% TGE means fully vested immediately
    if (tgePercent >= 10000) return "Fully Vested";
    
    const cliffEnd = Number(vestingInfo[3]);
    const vestingEnd = Number(vestingInfo[4]);
    
    if (cliffEnd === 0) return "Awaiting TGE";
    if (now < cliffEnd) return "In Cliff";
    if (now < vestingEnd) return "Vesting";
    return "Fully Vested";
  };

  const getVestingProgress = (vestingInfo: any, purchased: bigint, claimed: bigint) => {
    if (!purchased || purchased === 0n) return 0;
    return (Number(claimed) / Number(purchased)) * 100;
  };

  // Parse user info
  const purchased = userInfo ? (userInfo as any)[0] as bigint[] : [0n, 0n, 0n];
  const claimed = userInfo ? (userInfo as any)[1] as bigint[] : [0n, 0n, 0n];
  const claimable = userInfo ? (userInfo as any)[2] as bigint[] : [0n, 0n, 0n];
  const totalPurchased = userInfo ? (userInfo as any)[3] as bigint : 0n;
  const totalUserClaimed = userInfo ? (userInfo as any)[4] as bigint : 0n;
  const totalClaimableUser = userInfo ? (userInfo as any)[5] as bigint : 0n;

  const formatTokens = (value: bigint) => {
    return Number(formatUnits(value, 18)).toLocaleString('en-US', { maximumFractionDigits: 0 });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 lg:pb-0">
      <Header />
      <TradingViewTicker />
      <HeroBanner title="Claim PM Tokens" subtitle="Claim your purchased tokens from presale" />
      
      <main className="container mx-auto px-4 pt-12 pb-12 flex-1">
        {/* Mobile Wallet Card */}
        <div className="md:hidden mb-6">
          <WalletCard showQuickFunctionsToggle={false} compact={true} />
        </div>
        
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 text-sm">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Claim Status */}
          <Card className="p-6 bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-sm border-primary/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Gift className="h-8 w-8 text-primary" />
                <div>
                  <h2 className="text-2xl font-bold">Token Claim Portal</h2>
                  <p className="text-muted-foreground text-sm">Vesting schedule with cliff periods</p>
                </div>
              </div>
              <Badge variant={claimEnabled ? "default" : "secondary"}>
                {claimEnabled ? "Claim Active" : "Claim Not Active"}
              </Badge>
            </div>

            {!claimEnabled && (
              <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 mb-4">
                <p className="text-yellow-400 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Token claiming has not been enabled yet. Please wait for the presale to end.
                </p>
              </div>
            )}

            {claimEnabled && tgeTimestamp && (
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 mb-4">
                <p className="text-green-400 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  TGE occurred on {new Date(Number(tgeTimestamp) * 1000).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            )}

            {/* User Summary */}
            {isConnected && (
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-background/50 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-1">Total Purchased</p>
                  <p className="text-xl font-bold">{formatTokens(totalPurchased)} PM</p>
                </div>
                <div className="p-4 bg-background/50 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-1">Total Claimed</p>
                  <p className="text-xl font-bold text-green-500">{formatTokens(totalUserClaimed)} PM</p>
                </div>
                <div className="p-4 bg-background/50 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-1">Available to Claim</p>
                  <p className="text-xl font-bold text-primary">{formatTokens(totalClaimableUser)} PM</p>
                </div>
              </div>
            )}

            {isConnected && totalClaimableUser > 0n && claimEnabled && (
              <Button
                variant="gradient"
                size="lg"
                className="w-full mt-4"
                onClick={handleClaimAll}
                disabled={isPending || isConfirming || claimingRound !== null}
              >
                {(isPending || isConfirming) && claimingRound === -1 ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Claiming...
                  </>
                ) : (
                  <>
                    <Gift className="h-5 w-5 mr-2" />
                    Claim All ({formatTokens(totalClaimableUser)} PM)
                  </>
                )}
              </Button>
            )}

            {!isConnected && (
              <div className="p-4 rounded-lg bg-muted/50 text-center mt-4">
                <p className="text-muted-foreground">Connect your wallet to view your claim status</p>
              </div>
            )}
          </Card>

          {/* Round Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ROUND_NAMES.map((name, index) => {
              const roundPurchased = purchased[index] || 0n;
              const roundClaimed = claimed[index] || 0n;
              const roundClaimable = claimable[index] || 0n;
              const vestingInfo = vestingInfos[index];
              const progress = getVestingProgress(vestingInfo, roundPurchased, roundClaimed);
              const status = getVestingStatus(vestingInfo);
              const isClaimingThis = claimingRound === index;

              return (
                <Card key={index} className={`p-4 border ${ROUND_BORDERS[index]}`}>
                  <div className="flex items-center justify-between mb-4">
                    <Badge className={ROUND_COLORS[index]}>{name} Round</Badge>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      status === "Fully Vested" ? "bg-green-500/20 text-green-400" :
                      status === "Vesting" ? "bg-blue-500/20 text-blue-400" :
                      status === "In Cliff" ? "bg-yellow-500/20 text-yellow-400" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {status}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Purchased</span>
                      <span className="font-medium">{formatTokens(roundPurchased)} PM</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Claimed</span>
                      <span className="font-medium text-green-500">{formatTokens(roundClaimed)} PM</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Available</span>
                      <span className="font-medium text-primary">{formatTokens(roundClaimable)} PM</span>
                    </div>

                    <Progress value={progress} className="h-2" />

                    {vestingInfo && (
                      <div className="text-xs text-muted-foreground space-y-1 p-2 bg-muted/30 rounded">
                        <p className="flex justify-between">
                          <span>TGE Release:</span>
                          <span className="font-medium">{Number(vestingInfo[0]) / 100}%</span>
                        </p>
                        {Number(vestingInfo[1]) > 0 && (
                          <p className="flex justify-between">
                            <span>Cliff:</span>
                            <span className="font-medium">{formatVestingDuration(vestingInfo[1])}</span>
                          </p>
                        )}
                        {Number(vestingInfo[2]) > 0 && (
                          <p className="flex justify-between">
                            <span>Vesting:</span>
                            <span className="font-medium">{formatVestingDuration(vestingInfo[2])}</span>
                          </p>
                        )}
                      </div>
                    )}

                    <Button
                      variant={roundClaimable > 0n ? "default" : "outline"}
                      size="sm"
                      className="w-full"
                      onClick={() => handleClaim(index)}
                      disabled={isPending || isConfirming || !claimEnabled || roundClaimable === 0n || claimingRound !== null}
                    >
                      {(isPending || isConfirming) && isClaimingThis ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Claiming...
                        </>
                      ) : roundClaimable > 0n ? (
                        <>
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Claim {formatTokens(roundClaimable)} PM
                        </>
                      ) : (
                        "Nothing to Claim"
                      )}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Vesting Schedule Info */}
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Vesting Schedule Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <h4 className="font-bold text-yellow-400 mb-2 flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Seed Round
                </h4>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    25% released at TGE
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-yellow-500" />
                    6 months cliff period
                  </li>
                  <li className="flex items-center gap-2">
                    <TrendingUp className="h-3 w-3 text-blue-500" />
                    12 months linear vesting
                  </li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <h4 className="font-bold text-blue-400 mb-2 flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Private Round
                </h4>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    50% released at TGE
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-yellow-500" />
                    3 months cliff period
                  </li>
                  <li className="flex items-center gap-2">
                    <TrendingUp className="h-3 w-3 text-blue-500" />
                    6 months linear vesting
                  </li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <h4 className="font-bold text-green-400 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Public Round
                </h4>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    100% released at TGE
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    No cliff period
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    No vesting required
                  </li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Global Stats */}
          {totalClaimedGlobal && (
            <Card className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Tokens Claimed (Global)</p>
                    <p className="text-xl font-bold">{formatTokens(totalClaimedGlobal)} PM</p>
                  </div>
                </div>
                <Link to="/dashboard/buy-token" className="text-primary hover:underline text-sm">
                  Buy More Tokens →
                </Link>
              </div>
            </Card>
          )}
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default TokenClaimPage;