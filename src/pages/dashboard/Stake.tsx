import { useState, useEffect } from "react";
import pmLogo from "@/assets/pm-logo-new.png";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/Header";
import { TradingViewTicker } from "@/components/TradingViewTicker";
import { HeroBanner } from "@/components/HeroBanner";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Footer } from "@/components/Footer";
import { WalletCard } from "@/components/WalletCard";
import { ArrowLeft, TrendingUp, Lock, Loader2, AlertTriangle, Clock, Gift } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId } from "wagmi";
import { parseEther, formatEther } from "viem";
import { PMStakingABI, PMTokenABI } from "@/contracts/abis";
import { CONTRACT_ADDRESSES, PM_TOKEN_ADDRESS } from "@/contracts/addresses";

interface StakeData {
  amount: bigint;
  planId: bigint;
  startTime: bigint;
  endTime: bigint;
  lastClaimTime: bigint;
  totalRewardsClaimed: bigint;
  isActive: boolean;
}

interface StakingPlan {
  id: number;
  name: string;
  duration: number;
  apyRate: number;
  minStake: bigint;
  maxStake: bigint;
  isActive: boolean;
}

const StakePage = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [stakeAmount, setStakeAmount] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState("0");
  const [selectedStakeId, setSelectedStakeId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const packagesPerPage = 5;

  // Get contract addresses
  const stakingAddress = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]?.PMStaking;
  const tokenAddress = PM_TOKEN_ADDRESS;

  // Contract reads
  const { data: userStakes, refetch: refetchStakes } = useReadContract({
    address: stakingAddress as `0x${string}`,
    abi: PMStakingABI,
    functionName: "getUserStakes",
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!stakingAddress && stakingAddress !== "0x0000000000000000000000000000000000000000" }
  });

  const { data: globalStats, refetch: refetchGlobalStats } = useReadContract({
    address: stakingAddress as `0x${string}`,
    abi: PMStakingABI,
    functionName: "getGlobalStats",
    query: { enabled: !!stakingAddress && stakingAddress !== "0x0000000000000000000000000000000000000000" }
  });

  const { data: userTotalStaked } = useReadContract({
    address: stakingAddress as `0x${string}`,
    abi: PMStakingABI,
    functionName: "totalStaked",
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!stakingAddress && stakingAddress !== "0x0000000000000000000000000000000000000000" }
  });

  const { data: planCount } = useReadContract({
    address: stakingAddress as `0x${string}`,
    abi: PMStakingABI,
    functionName: "planCount",
    query: { enabled: !!stakingAddress && stakingAddress !== "0x0000000000000000000000000000000000000000" }
  });

  const { data: pmBalance } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: PMTokenABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: PMTokenABI,
    functionName: "allowance",
    args: address && stakingAddress ? [address, stakingAddress] : undefined,
    query: { enabled: !!address && !!stakingAddress && stakingAddress !== "0x0000000000000000000000000000000000000000" }
  });

  // Fetch all staking plans
  const [stakingPlans, setStakingPlans] = useState<StakingPlan[]>([]);

  const { data: plan0 } = useReadContract({
    address: stakingAddress as `0x${string}`,
    abi: PMStakingABI,
    functionName: "getPlanInfo",
    args: [BigInt(0)],
    query: { enabled: !!stakingAddress && stakingAddress !== "0x0000000000000000000000000000000000000000" }
  });

  const { data: plan1 } = useReadContract({
    address: stakingAddress as `0x${string}`,
    abi: PMStakingABI,
    functionName: "getPlanInfo",
    args: [BigInt(1)],
    query: { enabled: !!stakingAddress && stakingAddress !== "0x0000000000000000000000000000000000000000" }
  });

  const { data: plan2 } = useReadContract({
    address: stakingAddress as `0x${string}`,
    abi: PMStakingABI,
    functionName: "getPlanInfo",
    args: [BigInt(2)],
    query: { enabled: !!stakingAddress && stakingAddress !== "0x0000000000000000000000000000000000000000" }
  });

  const { data: plan3 } = useReadContract({
    address: stakingAddress as `0x${string}`,
    abi: PMStakingABI,
    functionName: "getPlanInfo",
    args: [BigInt(3)],
    query: { enabled: !!stakingAddress && stakingAddress !== "0x0000000000000000000000000000000000000000" }
  });

  useEffect(() => {
    const plans: StakingPlan[] = [];
    const planData = [plan0, plan1, plan2, plan3];
    const planNames = ["30 Days Pool", "90 Days Pool", "180 Days Pool", "365 Days Pool"];
    
    planData.forEach((plan, index) => {
      if (plan) {
        const [duration, apyRate, minStake, maxStake, isActive] = plan as [bigint, bigint, bigint, bigint, boolean];
        plans.push({
          id: index,
          name: planNames[index],
          duration: Number(duration),
          apyRate: Number(apyRate),
          minStake,
          maxStake,
          isActive
        });
      }
    });
    
    if (plans.length > 0) {
      setStakingPlans(plans);
    } else {
      // Default plans if contract not deployed
      setStakingPlans([
        { id: 0, name: "30 Days Pool", duration: 30 * 24 * 60 * 60, apyRate: 500, minStake: parseEther("1000"), maxStake: parseEther("1000000"), isActive: true },
        { id: 1, name: "90 Days Pool", duration: 90 * 24 * 60 * 60, apyRate: 1000, minStake: parseEther("1000"), maxStake: parseEther("5000000"), isActive: true },
        { id: 2, name: "180 Days Pool", duration: 180 * 24 * 60 * 60, apyRate: 1500, minStake: parseEther("1000"), maxStake: parseEther("10000000"), isActive: true },
        { id: 3, name: "365 Days Pool", duration: 365 * 24 * 60 * 60, apyRate: 2500, minStake: parseEther("1000"), maxStake: parseEther("50000000"), isActive: true },
      ]);
    }
  }, [plan0, plan1, plan2, plan3]);

  // Contract writes
  const { writeContractAsync, isPending: isWritePending, data: txHash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  const currentPlan = stakingPlans.find(p => p.id === parseInt(selectedPlanId)) || stakingPlans[0];
  const totalPages = Math.ceil(((userStakes as StakeData[])?.length || 0) / packagesPerPage);
  const startIndex = (currentPage - 1) * packagesPerPage;
  const displayedStakes = ((userStakes as StakeData[]) || []).slice(startIndex, startIndex + packagesPerPage);

  // Calculate total pending rewards
  const [pendingRewards, setPendingRewards] = useState<bigint[]>([]);

  useEffect(() => {
    if (userStakes && address && stakingAddress && stakingAddress !== "0x0000000000000000000000000000000000000000") {
      // Calculate rewards client-side based on stake data
      const stakes = userStakes as StakeData[];
      const rewards = stakes.map((stake) => {
        if (!stake.isActive) return BigInt(0);
        const plan = stakingPlans.find(p => p.id === Number(stake.planId));
        if (!plan) return BigInt(0);
        
        const now = BigInt(Math.floor(Date.now() / 1000));
        const endTime = now > stake.endTime ? stake.endTime : now;
        const time = endTime - stake.lastClaimTime;
        
        return (stake.amount * BigInt(plan.apyRate) * time) / (BigInt(365 * 24 * 60 * 60) * BigInt(10000));
      });
      setPendingRewards(rewards);
    }
  }, [userStakes, stakingPlans, address, stakingAddress]);

  const totalPendingRewards = pendingRewards.reduce((sum, r) => sum + r, BigInt(0));

  const handleApprove = async () => {
    if (!address || !stakingAddress || stakingAddress === "0x0000000000000000000000000000000000000000") {
      toast.error("Staking contract not deployed yet");
      return;
    }

    try {
      await writeContractAsync({
        address: tokenAddress as `0x${string}`,
        abi: PMTokenABI,
        functionName: "approve",
        args: [stakingAddress as `0x${string}`, parseEther("999999999999999")],
      } as any);
      toast.success("Approval submitted!");
      refetchAllowance();
    } catch (error: any) {
      toast.error(error.shortMessage || "Approval failed");
    }
  };

  const handleStake = async () => {
    if (!stakeAmount || !address) {
      toast.error("Please enter an amount to stake");
      return;
    }

    if (!stakingAddress || stakingAddress === "0x0000000000000000000000000000000000000000") {
      toast.error("Staking contract not deployed yet");
      return;
    }

    const amount = parseEther(stakeAmount);
    
    if (pmBalance && amount > (pmBalance as bigint)) {
      toast.error("Insufficient PM balance");
      return;
    }

    if (currentPlan && amount < currentPlan.minStake) {
      toast.error(`Minimum stake is ${formatEther(currentPlan.minStake)} PM`);
      return;
    }

    // Check allowance
    if (allowance && (allowance as bigint) < amount) {
      toast.info("Please approve tokens first");
      await handleApprove();
      return;
    }

    try {
      await writeContractAsync({
        address: stakingAddress as `0x${string}`,
        abi: PMStakingABI,
        functionName: "stake",
        args: [amount, BigInt(selectedPlanId)],
      } as any);
      toast.success("Staking transaction submitted!");
      setStakeAmount("");
      refetchStakes();
      refetchGlobalStats();
    } catch (error: any) {
      toast.error(error.shortMessage || "Staking failed");
    }
  };

  const handleUnstake = async (stakeId: number) => {
    if (!address || !stakingAddress || stakingAddress === "0x0000000000000000000000000000000000000000") {
      toast.error("Staking contract not deployed yet");
      return;
    }

    try {
      await writeContractAsync({
        address: stakingAddress as `0x${string}`,
        abi: PMStakingABI,
        functionName: "unstake",
        args: [BigInt(stakeId)],
      } as any);
      toast.success("Unstaking transaction submitted!");
      refetchStakes();
      refetchGlobalStats();
    } catch (error: any) {
      toast.error(error.shortMessage || "Unstaking failed");
    }
  };

  const handleEmergencyUnstake = async (stakeId: number) => {
    if (!address || !stakingAddress || stakingAddress === "0x0000000000000000000000000000000000000000") {
      toast.error("Staking contract not deployed yet");
      return;
    }

    try {
      await writeContractAsync({
        address: stakingAddress as `0x${string}`,
        abi: PMStakingABI,
        functionName: "emergencyUnstake",
        args: [BigInt(stakeId)],
      } as any);
      toast.success("Emergency unstake transaction submitted!");
      refetchStakes();
      refetchGlobalStats();
    } catch (error: any) {
      toast.error(error.shortMessage || "Emergency unstake failed");
    }
  };

  const handleClaimRewards = async (stakeId: number) => {
    if (!address || !stakingAddress || stakingAddress === "0x0000000000000000000000000000000000000000") {
      toast.error("Staking contract not deployed yet");
      return;
    }

    try {
      await writeContractAsync({
        address: stakingAddress as `0x${string}`,
        abi: PMStakingABI,
        functionName: "claimRewards",
        args: [BigInt(stakeId)],
      } as any);
      toast.success("Claim rewards transaction submitted!");
      refetchStakes();
      refetchGlobalStats();
    } catch (error: any) {
      toast.error(error.shortMessage || "Claim failed");
    }
  };

  const formatDuration = (seconds: number) => {
    const days = Math.floor(seconds / (24 * 60 * 60));
    return `${days} days`;
  };

  const formatAPY = (apyRate: number) => {
    return `${(apyRate / 100).toFixed(1)}%`;
  };

  const getStakeStatus = (stake: StakeData) => {
    const now = BigInt(Math.floor(Date.now() / 1000));
    if (!stake.isActive) return { label: "Completed", color: "text-muted-foreground" };
    if (now >= stake.endTime) return { label: "Unlocked", color: "text-green-500" };
    return { label: "Active", color: "text-yellow-500" };
  };

  const isLoading = isWritePending || isConfirming;

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 lg:pb-0">
      <Header />
      <TradingViewTicker />
      <HeroBanner title="Stake PM Tokens" subtitle="Earn up to 25% APY by staking your tokens" />
      
      <main className="container mx-auto px-4 pt-12 pb-12 flex-1">
        {/* Mobile Wallet Card */}
        <div className="md:hidden mb-6">
          <WalletCard showQuickFunctionsToggle={false} compact={true} />
        </div>
        
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 text-sm">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="max-w-4xl mx-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
            <Card className="p-4 bg-gradient-to-br from-primary/10 to-secondary/10 backdrop-blur-sm border-primary/20">
              <p className="text-xs text-muted-foreground mb-1">Your Staked</p>
              <div className="flex items-center gap-2">
                <p className="font-bold text-lg">
                  {userTotalStaked ? Number(formatEther(userTotalStaked as bigint)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
                </p>
                <img src={pmLogo} alt="PM" className="h-5 w-5" />
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 backdrop-blur-sm border-green-500/20">
              <p className="text-xs text-muted-foreground mb-1">Pending Rewards</p>
              <div className="flex items-center gap-2">
                <p className="font-bold text-green-500 text-lg">
                  {Number(formatEther(totalPendingRewards)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <img src={pmLogo} alt="PM" className="h-5 w-5" />
              </div>
            </Card>

            <Card className="p-4 bg-card/50 backdrop-blur-sm">
              <p className="text-xs text-muted-foreground mb-1">Global Staked</p>
              <p className="font-bold text-lg">
                {globalStats ? Number(formatEther((globalStats as any)[0] as bigint)).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : "0"} PM
              </p>
            </Card>

            <Card className="p-4 bg-card/50 backdrop-blur-sm">
              <p className="text-xs text-muted-foreground mb-1">Reward Pool</p>
              <p className="font-bold text-lg">
                {globalStats ? Number(formatEther((globalStats as any)[2] as bigint)).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : "0"} PM
              </p>
            </Card>
          </div>

          {/* Staking Card */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm mb-6">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="font-bold text-xl">Stake PM Tokens</h1>
                  <p className="text-muted-foreground text-sm">Earn rewards by staking your tokens</p>
                </div>
              </div>

              {!isConnected && (
                <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 mb-4">
                  <div className="flex items-center gap-2 text-yellow-500">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="font-medium">Please connect your wallet to stake</span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="pool-select">Select Staking Plan</Label>
                <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                  <SelectTrigger id="pool-select">
                    <SelectValue placeholder="Choose a staking plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {stakingPlans.filter(p => p.isActive).map(plan => (
                      <SelectItem key={plan.id} value={plan.id.toString()}>
                        {plan.name} - {formatAPY(plan.apyRate)} APY ({formatDuration(plan.duration)} lockup)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {currentPlan && (
                  <div className="p-3 rounded-lg bg-muted/50 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-muted-foreground">APY:</span>
                        <span className="font-bold ml-2 text-green-500">{formatAPY(currentPlan.apyRate)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Lockup:</span>
                        <span className="font-bold ml-2">{formatDuration(currentPlan.duration)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Min:</span>
                        <span className="font-bold ml-2">{Number(formatEther(currentPlan.minStake)).toLocaleString()} PM</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Max:</span>
                        <span className="font-bold ml-2">{Number(formatEther(currentPlan.maxStake)).toLocaleString()} PM</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="stake-amount">Amount to Stake</Label>
                <Input 
                  id="stake-amount" 
                  type="number" 
                  placeholder="0.00" 
                  value={stakeAmount} 
                  onChange={e => setStakeAmount(e.target.value)}
                  disabled={!isConnected || isLoading}
                />
                <p className="text-sm text-muted-foreground">
                  Available: {pmBalance ? Number(formatEther(pmBalance as bigint)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"} PM
                </p>
              </div>

              {stakeAmount && currentPlan && (
                <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Estimated Yearly Rewards</span>
                    <span className="font-medium text-green-500">
                      +{(parseFloat(stakeAmount || "0") * currentPlan.apyRate / 10000).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PM
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Lock Until</span>
                    <span className="font-medium">
                      {new Date(Date.now() + currentPlan.duration * 1000).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}

              {isConnected && allowance !== undefined && (allowance as bigint) < parseEther(stakeAmount || "0") && (
                <Button variant="outline" size="lg" className="w-full" onClick={handleApprove} disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : null}
                  Approve PM Tokens
                </Button>
              )}

              <Button 
                variant="gradient" 
                size="lg" 
                className="w-full" 
                onClick={handleStake}
                disabled={!isConnected || isLoading || !stakeAmount}
              >
                {isLoading ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Lock className="h-5 w-5 mr-2" />}
                Stake Tokens
              </Button>
            </div>

            {/* Staking Info */}
            <div className="mt-6 p-4 rounded-lg bg-primary/10 border border-primary/20">
              <h3 className="font-bold mb-2">How Staking Works</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Choose a staking plan with APY rates from 5% to 25%</li>
                <li>• Stake your PM tokens for the selected lock period</li>
                <li>• Rewards accrue continuously and can be claimed anytime</li>
                <li>• After lock period ends, unstake to receive principal + rewards</li>
                <li>• Emergency unstake available (forfeits pending rewards)</li>
              </ul>
            </div>
          </Card>

          {/* Active Stakes */}
          {(userStakes as StakeData[])?.length > 0 && (
            <Card className="p-4 lg:p-6 bg-card/50 backdrop-blur-sm">
              <h2 className="text-xl font-bold mb-4">My Staked Positions</h2>
              <div className="space-y-3">
                {displayedStakes.map((stake, index) => {
                  const stakeId = startIndex + index;
                  const plan = stakingPlans.find(p => p.id === Number(stake.planId));
                  const status = getStakeStatus(stake);
                  const reward = pendingRewards[stakeId] || BigInt(0);
                  const isUnlocked = BigInt(Math.floor(Date.now() / 1000)) >= stake.endTime;

                  return (
                    <div key={stakeId} className="p-4 border border-border rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-bold text-lg">
                            {Number(formatEther(stake.amount)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PM
                          </p>
                          <p className="text-sm text-muted-foreground">{plan?.name || `Plan ${stake.planId}`}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full bg-background/50 ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">APY:</span>
                          <span className="font-bold text-green-500">{plan ? formatAPY(plan.apyRate) : "-"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Ends:</span>
                          <span className="font-bold">{new Date(Number(stake.endTime) * 1000).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1 col-span-2">
                          <Gift className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Pending:</span>
                          <span className="font-bold text-green-500">
                            +{Number(formatEther(reward)).toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })} PM
                          </span>
                        </div>
                      </div>

                      {stake.isActive && (
                        <div className="flex gap-2 flex-wrap">
                          {reward > BigInt(0) && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleClaimRewards(stakeId)}
                              disabled={isLoading}
                            >
                              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Claim Rewards"}
                            </Button>
                          )}
                          {isUnlocked ? (
                            <Button 
                              variant="gradient" 
                              size="sm" 
                              onClick={() => handleUnstake(stakeId)}
                              disabled={isLoading}
                            >
                              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Unstake"}
                            </Button>
                          ) : (
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={() => handleEmergencyUnstake(stakeId)}
                              disabled={isLoading}
                            >
                              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Emergency Unstake"}
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground px-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </Card>
          )}
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default StakePage;
