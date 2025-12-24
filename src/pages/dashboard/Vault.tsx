import { useState, useEffect, useCallback, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/Header";
import { TradingViewTicker } from "@/components/TradingViewTicker";
import { HeroBanner } from "@/components/HeroBanner";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Footer } from "@/components/Footer";
import { WalletCard } from "@/components/WalletCard";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { 
  ArrowLeft, Vault as VaultIcon, Lock, TrendingUp, Clock, 
  Coins, Loader2, CheckCircle, AlertTriangle, DollarSign, Sparkles,
  BarChart3, History, Target, Settings, PieChart, Users, Trophy, AlertCircle, Gift, Home
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useAccount, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACT_ADDRESSES, PM_TOKEN_ADDRESS } from "@/contracts/addresses";
import { vaultABI } from "@/contracts/vaultABI";
import { erc20Abi, formatUnits, parseUnits } from "viem";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from "recharts";
import { ReferralBonus } from "@/components/vault/ReferralBonus";
import { EarlyWithdrawalModal } from "@/components/vault/EarlyWithdrawal";
import { StakingLeaderboard } from "@/components/vault/StakingLeaderboard";
import usdtLogo from "@/assets/usdt-logo.png";
import usdcLogo from "@/assets/usdc-logo.png";

// Vault Skeleton Components
const PlanCardSkeleton = () => (
  <Card className="p-6">
    <div className="flex items-center gap-4 mb-4">
      <Skeleton className="h-12 w-12 rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
    <div className="space-y-3">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-10 w-full" />
    </div>
  </Card>
);

const StakeCardSkeleton = () => (
  <Card className="p-6">
    <div className="flex justify-between items-start mb-4">
      <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
    <div className="space-y-3">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-10 w-full" />
    </div>
  </Card>
);

interface StakingPlan {
  id: number;
  name: string;
  tier: "bronze" | "silver" | "gold";
  minAmount: number;
  maxAmount: number;
  monthlyRate: number; // Monthly rate in percentage (e.g., 5 = 5%)
  lockPeriod: number;
  minPmHold: number;
  maxPoolSize: number;
  currentPoolSize: number;
  isActive: boolean;
  color: string;
  gradient: string;
  chartColor: string;
}

interface UserStake {
  planId: number;
  amount: number;
  token: "USDT" | "USDC";
  tokenAddress: string;
  startTime: number;
  endTime: number;
  claimedRewards: number;
  lastClaimTime: number;
  isActive: boolean;
}

interface StakeHistoryItem {
  date: string;
  action: "stake" | "claim" | "withdraw";
  amount: number;
  token: string;
  plan: string;
}

const DEFAULT_STAKING_PLANS: Omit<StakingPlan, 'currentPoolSize' | 'isActive'>[] = [
  {
    id: 0,
    name: "Bronze",
    tier: "bronze",
    minAmount: 10,
    maxAmount: 1000,
    monthlyRate: 5, // 5% monthly
    lockPeriod: 90,
    minPmHold: 100000,
    maxPoolSize: 300000,
    color: "text-amber-600",
    gradient: "from-amber-500/20 to-amber-700/20",
    chartColor: "#d97706",
  },
  {
    id: 1,
    name: "Silver",
    tier: "silver",
    minAmount: 1001,
    maxAmount: 10000,
    monthlyRate: 6, // 6% monthly
    lockPeriod: 90,
    minPmHold: 300000,
    maxPoolSize: 500000,
    color: "text-gray-400",
    gradient: "from-gray-400/20 to-gray-600/20",
    chartColor: "#9ca3af",
  },
  {
    id: 2,
    name: "Gold",
    tier: "gold",
    minAmount: 10001,
    maxAmount: 25000,
    monthlyRate: 8, // 8% monthly
    lockPeriod: 90,
    minPmHold: 500000,
    maxPoolSize: 1000000,
    color: "text-yellow-500",
    gradient: "from-yellow-500/20 to-yellow-600/20",
    chartColor: "#eab308",
  },
];

const VAULT_ADDRESS = CONTRACT_ADDRESSES[56]?.PMVault as `0x${string}`;
const USDT_ADDRESS = CONTRACT_ADDRESSES[56]?.USDT as `0x${string}`;
const USDC_ADDRESS = CONTRACT_ADDRESSES[56]?.USDC as `0x${string}`;

const Vault = () => {
  const { address, isConnected } = useAccount();
  const [selectedPlan, setSelectedPlan] = useState<StakingPlan | null>(null);
  const [stakeAmount, setStakeAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState<"USDT" | "USDC">("USDT");
  const [isStaking, setIsStaking] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimingIndex, setClaimingIndex] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [stakeHistory, setStakeHistory] = useState<StakeHistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState("stake");
  const [showEarlyWithdrawal, setShowEarlyWithdrawal] = useState(false);
  const [selectedStakeForWithdrawal, setSelectedStakeForWithdrawal] = useState<number | null>(null);

  // Contract write hooks
  const { writeContractAsync } = useWriteContract();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const { isLoading: isWritePending, isSuccess: isWriteSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Get PM token balance
  const { data: pmTokenBalance } = useBalance({
    address: address,
    token: PM_TOKEN_ADDRESS as `0x${string}`,
    chainId: 56,
  });

  // Get USDT balance
  const { data: usdtBalance } = useBalance({
    address: address,
    token: USDT_ADDRESS,
    chainId: 56,
  });

  // Get USDC balance
  const { data: usdcBalance } = useBalance({
    address: address,
    token: USDC_ADDRESS,
    chainId: 56,
  });

  // Read contract owner
  const { data: contractOwner } = useReadContract({
    address: VAULT_ADDRESS,
    abi: vaultABI,
    functionName: "owner",
    chainId: 56,
  });

  // Read global stats
  const { data: globalStats, refetch: refetchGlobalStats } = useReadContract({
    address: VAULT_ADDRESS,
    abi: vaultABI,
    functionName: "getGlobalStats",
    chainId: 56,
  });

  // Read plan info for Bronze (id 0)
  const { data: bronzePlanData } = useReadContract({
    address: VAULT_ADDRESS,
    abi: vaultABI,
    functionName: "getPlanInfo",
    args: [BigInt(0)],
    chainId: 56,
  });

  // Read plan info for Silver (id 1)
  const { data: silverPlanData } = useReadContract({
    address: VAULT_ADDRESS,
    abi: vaultABI,
    functionName: "getPlanInfo",
    args: [BigInt(1)],
    chainId: 56,
  });

  // Read plan info for Gold (id 2)
  const { data: goldPlanData } = useReadContract({
    address: VAULT_ADDRESS,
    abi: vaultABI,
    functionName: "getPlanInfo",
    args: [BigInt(2)],
    chainId: 56,
  });

  // Read user stakes
  const { data: userStakesData, refetch: refetchUserStakes } = useReadContract({
    address: VAULT_ADDRESS,
    abi: vaultABI,
    functionName: "getUserStakes",
    args: address ? [address] : undefined,
    chainId: 56,
  });

  // Read USDT allowance
  const { data: usdtAllowance, refetch: refetchUsdtAllowance } = useReadContract({
    address: USDT_ADDRESS,
    abi: erc20Abi,
    functionName: "allowance",
    args: address ? [address, VAULT_ADDRESS] : undefined,
    chainId: 56,
  });

  // Read USDC allowance
  const { data: usdcAllowance, refetch: refetchUsdcAllowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: "allowance",
    args: address ? [address, VAULT_ADDRESS] : undefined,
    chainId: 56,
  });

  const pmBalance = pmTokenBalance ? parseFloat(pmTokenBalance.formatted) : 0;

  // Build staking plans from contract data
  const stakingPlans = useMemo((): StakingPlan[] => {
    const plans: StakingPlan[] = [];
    
    const planDataArray = [bronzePlanData, silverPlanData, goldPlanData];
    
    planDataArray.forEach((planData, index) => {
      const defaultPlan = DEFAULT_STAKING_PLANS[index];
      if (planData && defaultPlan) {
        // monthlyRate is in basis points (500 = 5%)
        const monthlyRatePercent = Number(planData.monthlyRate) / 100;
        plans.push({
          ...defaultPlan,
          minAmount: Number(formatUnits(planData.minStake, 18)),
          maxAmount: Number(formatUnits(planData.maxStake, 18)),
          monthlyRate: monthlyRatePercent,
          minPmHold: Number(formatUnits(planData.minPmHold, 18)),
          maxPoolSize: Number(formatUnits(planData.maxPoolSize, 18)),
          currentPoolSize: Number(formatUnits(planData.currentPoolSize, 18)),
          isActive: planData.isActive,
        });
      } else if (defaultPlan) {
        plans.push({
          ...defaultPlan,
          currentPoolSize: 0,
          isActive: true,
        });
      }
    });
    
    return plans;
  }, [bronzePlanData, silverPlanData, goldPlanData]);

  // Parse user stakes from contract
  const userStakes = useMemo((): UserStake[] => {
    if (!userStakesData) return [];
    
    return (userStakesData as any[]).map((stake) => ({
      planId: Number(stake.planId),
      amount: Number(formatUnits(stake.amount, 18)),
      token: stake.token === USDT_ADDRESS ? "USDT" : "USDC",
      tokenAddress: stake.token,
      startTime: Number(stake.startTime),
      endTime: Number(stake.endTime),
      claimedRewards: Number(formatUnits(stake.claimedRewards, 18)),
      lastClaimTime: Number(stake.lastClaimTime),
      isActive: stake.isActive,
    }));
  }, [userStakesData]);

  // Set default selected plan
  useEffect(() => {
    if (stakingPlans.length > 0 && !selectedPlan) {
      setSelectedPlan(stakingPlans[0]);
    }
  }, [stakingPlans, selectedPlan]);

  // Real-time profit calculation - update every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Refetch data after successful write
  useEffect(() => {
    if (isWriteSuccess) {
      refetchUserStakes();
      refetchGlobalStats();
      refetchUsdtAllowance();
      refetchUsdcAllowance();
    }
  }, [isWriteSuccess, refetchUserStakes, refetchGlobalStats, refetchUsdtAllowance, refetchUsdcAllowance]);

  // Calculate pending profit in real-time (matching contract logic)
  // Daily rate = monthly rate / 30
  // Rewards = amount * (monthlyRate/10000) * (elapsed/30 days)
  const calculatePendingProfit = useCallback((stake: UserStake) => {
    const plan = stakingPlans.find(p => p.id === stake.planId);
    if (!plan || !stake.isActive) return 0;

    const now = currentTime / 1000;
    const elapsed = now - stake.lastClaimTime;
    
    // monthlyRate is already in percentage (e.g., 5 = 5%)
    // Daily rate = monthlyRate / 30 / 100 (convert to decimal)
    const dailyRateDecimal = plan.monthlyRate / 30 / 100;
    const daysElapsed = elapsed / (24 * 60 * 60);
    
    return Math.max(0, stake.amount * dailyRateDecimal * daysElapsed);
  }, [currentTime, stakingPlans]);

  // Get daily rate from monthly rate
  const getDailyRate = (monthlyRate: number) => {
    return monthlyRate / 30;
  };

  // Analytics calculations
  const analytics = useMemo(() => {
    const activeStakes = userStakes.filter(s => s.isActive);
    const totalStaked = activeStakes.reduce((sum, s) => sum + s.amount, 0);
    const totalClaimed = userStakes.reduce((sum, s) => sum + s.claimedRewards, 0);
    const totalPending = activeStakes.reduce((sum, s) => sum + calculatePendingProfit(s), 0);
    
    // Calculate projected earnings
    const projectedMonthly = activeStakes.reduce((sum, s) => {
      const plan = stakingPlans.find(p => p.id === s.planId);
      return sum + (s.amount * ((plan?.monthlyRate || 0) / 100));
    }, 0);

    const projectedYearly = projectedMonthly * 12;

    // Distribution by plan
    const planDistribution = stakingPlans.map(plan => ({
      name: plan.name,
      value: activeStakes.filter(s => s.planId === plan.id).reduce((sum, s) => sum + s.amount, 0),
      color: plan.chartColor,
    })).filter(p => p.value > 0);

    // Generate chart data for profit over time
    const chartData = [];
    const now = Date.now();
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000);
      const dayProfit = activeStakes.reduce((sum, stake) => {
        const plan = stakingPlans.find(p => p.id === stake.planId);
        if (!plan) return sum;
        const stakeStart = stake.startTime * 1000;
        if (date.getTime() < stakeStart) return sum;
        return sum + (stake.amount * plan.monthlyRate / 30 / 100);
      }, 0);
      
      chartData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        profit: parseFloat(dayProfit.toFixed(2)),
      });
    }

    return {
      totalStaked,
      totalClaimed,
      totalPending,
      projectedMonthly,
      projectedYearly,
      planDistribution,
      chartData,
      activeCount: activeStakes.length,
    };
  }, [userStakes, calculatePendingProfit, stakingPlans]);

  const getPoolPercentage = (plan: StakingPlan) => {
    return (plan.currentPoolSize / plan.maxPoolSize) * 100;
  };

  const isPoolFull = (plan: StakingPlan) => {
    return plan.currentPoolSize >= plan.maxPoolSize;
  };

  const hasEnoughPM = (plan: StakingPlan) => {
    return pmBalance >= plan.minPmHold;
  };

  const getDailyProfit = (amount: number, monthlyRate: number) => {
    return amount * (monthlyRate / 30 / 100);
  };

  const handleApproveToken = async () => {
    if (!selectedPlan || !address) return;
    
    const tokenAddress = selectedToken === "USDT" ? USDT_ADDRESS : USDC_ADDRESS;
    const amount = parseUnits("1000000000", 18); // Large approval amount

    setIsApproving(true);
    try {
      const hash = await writeContractAsync({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "approve",
        args: [VAULT_ADDRESS, amount],
      } as any);
      setTxHash(hash);
      toast.success(`Approving ${selectedToken}...`);
    } catch (error: any) {
      console.error("Approval error:", error);
      toast.error(error?.shortMessage || "Approval failed");
      setIsApproving(false);
    }
  };

  const handleStake = async () => {
    if (!selectedPlan) return;
    
    const amount = parseFloat(stakeAmount);
    
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (amount < selectedPlan.minAmount || amount > selectedPlan.maxAmount) {
      toast.error(`Amount must be between ${selectedPlan.minAmount} and ${selectedPlan.maxAmount} ${selectedToken}`);
      return;
    }

    if (!hasEnoughPM(selectedPlan)) {
      toast.error(`You need at least ${selectedPlan.minPmHold.toLocaleString()} PM tokens to stake in ${selectedPlan.name} pool`);
      return;
    }

    if (isPoolFull(selectedPlan)) {
      toast.error("This pool is currently full");
      return;
    }

    // Check allowance
    const currentAllowance = selectedToken === "USDT" ? usdtAllowance : usdcAllowance;
    const amountInWei = parseUnits(amount.toString(), 18);
    
    if (!currentAllowance || currentAllowance < amountInWei) {
      handleApproveToken();
      return;
    }

    setIsStaking(true);
    
    try {
      const hash = await writeContractAsync({
        address: VAULT_ADDRESS,
        abi: vaultABI,
        functionName: "stake",
        args: [BigInt(selectedPlan.id), amountInWei, selectedToken === "USDT"],
      } as any);
      setTxHash(hash);
      
      setStakeHistory([
        {
          date: new Date().toLocaleString(),
          action: "stake",
          amount: amount,
          token: selectedToken,
          plan: selectedPlan.name,
        },
        ...stakeHistory,
      ]);
      setStakeAmount("");
      toast.success(`Staking ${amount} ${selectedToken} in ${selectedPlan.name} pool...`);
    } catch (error: any) {
      console.error("Staking error:", error);
      toast.error(error?.shortMessage || "Staking failed. Please try again.");
    } finally {
      setIsStaking(false);
    }
  };

  const handleClaimRewards = async (stakeIndex: number) => {
    const stake = userStakes[stakeIndex];
    const pendingProfit = calculatePendingProfit(stake);
    
    if (pendingProfit < 10) {
      toast.error("Minimum claim amount is 10 USDT/USDC");
      return;
    }

    setIsClaiming(true);
    setClaimingIndex(stakeIndex);
    
    try {
      const hash = await writeContractAsync({
        address: VAULT_ADDRESS,
        abi: vaultABI,
        functionName: "claimRewards",
        args: [BigInt(stakeIndex)],
      } as any);
      setTxHash(hash);
      
      const afterTax = pendingProfit * 0.95;
      setStakeHistory([
        {
          date: new Date().toLocaleString(),
          action: "claim",
          amount: afterTax,
          token: stake.token,
          plan: stakingPlans.find(p => p.id === stake.planId)?.name || "",
        },
        ...stakeHistory,
      ]);
      toast.success(`Claiming $${afterTax.toFixed(2)} ${stake.token}...`);
    } catch (error: any) {
      console.error("Claim error:", error);
      toast.error(error?.shortMessage || "Claim failed. Please try again.");
    } finally {
      setIsClaiming(false);
      setClaimingIndex(null);
    }
  };

  const handleWithdrawCapital = async (stakeIndex: number) => {
    const stake = userStakes[stakeIndex];
    const now = currentTime / 1000;
    
    if (now < stake.endTime) {
      toast.error("Capital is still locked");
      return;
    }

    const pendingProfit = calculatePendingProfit(stake);
    if (pendingProfit >= 10) {
      toast.error("Please claim your pending profit first");
      return;
    }
    
    try {
      const hash = await writeContractAsync({
        address: VAULT_ADDRESS,
        abi: vaultABI,
        functionName: "withdrawCapital",
        args: [BigInt(stakeIndex)],
      } as any);
      setTxHash(hash);
      
      setStakeHistory([
        {
          date: new Date().toLocaleString(),
          action: "withdraw",
          amount: stake.amount,
          token: stake.token,
          plan: stakingPlans.find(p => p.id === stake.planId)?.name || "",
        },
        ...stakeHistory,
      ]);
      toast.success(`Withdrawing ${stake.amount} ${stake.token} capital...`);
    } catch (error: any) {
      console.error("Withdrawal error:", error);
      toast.error(error?.shortMessage || "Withdrawal failed. Please try again.");
    }
  };

  const handleEarlyWithdrawal = (stakeIndex: number) => {
    setSelectedStakeForWithdrawal(stakeIndex);
    setShowEarlyWithdrawal(true);
  };

  const confirmEarlyWithdrawal = () => {
    if (selectedStakeForWithdrawal === null) return;
    
    const stake = userStakes[selectedStakeForWithdrawal];
    const penalty = stake.amount * 0.20;
    const netAmount = stake.amount - penalty;
    
    // Note: Early withdrawal would need a separate contract function
    setStakeHistory([
      {
        date: new Date().toLocaleString(),
        action: "withdraw",
        amount: netAmount,
        token: stake.token,
        plan: stakingPlans.find(p => p.id === stake.planId)?.name || "",
      },
      ...stakeHistory,
    ]);
    
    toast.success(`Emergency withdrawal processed. Net amount: $${netAmount.toFixed(2)}`);
    setSelectedStakeForWithdrawal(null);
    setShowEarlyWithdrawal(false);
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "bronze":
        return <Coins className="h-6 w-6 text-amber-600" />;
      case "silver":
        return <Coins className="h-6 w-6 text-gray-400" />;
      case "gold":
        return <Sparkles className="h-6 w-6 text-yellow-500" />;
      default:
        return <Coins className="h-6 w-6" />;
    }
  };

  const formatTimeRemaining = (endTime: number) => {
    const now = currentTime / 1000;
    const remaining = endTime - now;
    
    if (remaining <= 0) return "Unlocked";
    
    const days = Math.floor(remaining / (24 * 60 * 60));
    const hours = Math.floor((remaining % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((remaining % (60 * 60)) / 60);
    const seconds = Math.floor(remaining % 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    return `${minutes}m ${seconds}s`;
  };

  // Check if user is contract owner
  const isOwner = contractOwner && address ? 
    (contractOwner as string).toLowerCase() === address.toLowerCase() : false;

  // Global stats from contract
  const globalTotalStaked = globalStats ? Number(formatUnits((globalStats as any)[0], 18)) : 0;
  const globalTotalRewards = globalStats ? Number(formatUnits((globalStats as any)[1], 18)) : 0;

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 lg:pb-0">
      <Header />
      <TradingViewTicker />
      <HeroBanner title="Staking Vault" subtitle="Stake USDT/USDC and earn passive income daily" />

      <main className="container mx-auto px-4 pt-12 pb-12 flex-1">
        <div className="md:hidden mb-6">
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
              <BreadcrumbPage>Vault</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center justify-end mb-6">
          {isOwner && (
            <Link to="/dashboard/vault/admin">
              <Button variant="outline" size="sm" className="gap-2">
                <Settings className="h-4 w-4" />
                Admin Panel
              </Button>
            </Link>
          )}
        </div>

        <div className="max-w-6xl mx-auto space-y-6">
          {/* Global Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Your PM Token Balance</p>
                  <p className="text-xl font-bold">{pmBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })} PM</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-600/10 border-green-500/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <VaultIcon className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Global Total Staked</p>
                  <p className="text-xl font-bold">${globalTotalStaked.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-yellow-500/10 to-orange-600/10 border-yellow-500/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/20">
                  <Gift className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Rewards Distributed</p>
                  <p className="text-xl font-bold text-yellow-500">${globalTotalRewards.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="stake" className="gap-2">
                <VaultIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Stake</span>
              </TabsTrigger>
              <TabsTrigger value="leaderboard" className="gap-2">
                <Trophy className="h-4 w-4" />
                <span className="hidden sm:inline">Ranking</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <History className="h-4 w-4" />
                <span className="hidden sm:inline">History</span>
              </TabsTrigger>
            </TabsList>

            {/* Stake Tab */}
            <TabsContent value="stake" className="mt-6 space-y-6">
              {/* Staking Plans */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stakingPlans.map((plan) => {
                  const poolPercentage = getPoolPercentage(plan);
                  const isFull = isPoolFull(plan);
                  const hasRequiredPM = hasEnoughPM(plan);
                  const dailyRate = getDailyRate(plan.monthlyRate);

                  return (
                    <Card
                      key={plan.id}
                      className={`relative overflow-hidden cursor-pointer transition-all duration-300 ${
                        selectedPlan?.id === plan.id
                          ? "ring-2 ring-primary shadow-xl scale-[1.02]"
                          : "hover:shadow-lg"
                      } ${isFull || !plan.isActive ? "opacity-60" : ""}`}
                      onClick={() => !isFull && plan.isActive && setSelectedPlan(plan)}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${plan.gradient}`} />
                      
                      <div className="relative p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            {getTierIcon(plan.tier)}
                            <h3 className={`text-xl font-bold ${plan.color}`}>{plan.name}</h3>
                          </div>
                          {!plan.isActive ? (
                            <Badge variant="secondary">Inactive</Badge>
                          ) : isFull ? (
                            <Badge variant="destructive">Pool Full</Badge>
                          ) : (
                            <Badge className="bg-green-500/20 text-green-500">Active</Badge>
                          )}
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground text-sm">Monthly Rate</span>
                            <span className="font-bold text-lg text-green-500">{plan.monthlyRate}%</span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="text-muted-foreground text-sm">Daily Rate</span>
                            <span className="font-semibold text-sm text-green-400">~{dailyRate.toFixed(2)}%</span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="text-muted-foreground text-sm">Stake Range</span>
                            <span className="font-semibold text-sm">
                              ${plan.minAmount.toLocaleString()} - ${plan.maxAmount.toLocaleString()}
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-muted-foreground text-sm">Lock Period</span>
                            <span className="font-semibold text-sm">{plan.lockPeriod} Days</span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-muted-foreground text-sm">Min PM Hold</span>
                            <span className={`font-semibold text-sm ${hasRequiredPM ? "text-green-500" : "text-red-500"}`}>
                              {plan.minPmHold.toLocaleString()} PM
                            </span>
                          </div>

                          <div className="pt-2">
                            <div className="flex justify-between text-xs mb-1">
                              <span>Pool Capacity</span>
                              <span>{poolPercentage.toFixed(1)}%</span>
                            </div>
                            <Progress value={poolPercentage} className="h-2" />
                            <div className="flex justify-between text-xs mt-1 text-muted-foreground">
                              <span>${plan.currentPoolSize.toLocaleString()}</span>
                              <span>${plan.maxPoolSize.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Stake Form */}
              {selectedPlan && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <VaultIcon className="h-5 w-5 text-primary" />
                    Stake in {selectedPlan.name} Pool
                  </h3>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">Select Token</label>
                        <div className="flex gap-2">
                          <Button
                            variant={selectedToken === "USDT" ? "default" : "outline"}
                            onClick={() => setSelectedToken("USDT")}
                            className="flex-1 gap-2"
                          >
                            <img src={usdtLogo} alt="USDT" className="h-5 w-5" />
                            USDT
                          </Button>
                          <Button
                            variant={selectedToken === "USDC" ? "default" : "outline"}
                            onClick={() => setSelectedToken("USDC")}
                            className="flex-1 gap-2"
                          >
                            <img src={usdcLogo} alt="USDC" className="h-5 w-5" />
                            USDC
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Balance: {selectedToken === "USDT" 
                            ? (usdtBalance ? parseFloat(usdtBalance.formatted).toFixed(2) : "0") 
                            : (usdcBalance ? parseFloat(usdcBalance.formatted).toFixed(2) : "0")} {selectedToken}
                        </p>
                      </div>

                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">Amount</label>
                        <Input
                          type="number"
                          placeholder={`${selectedPlan.minAmount} - ${selectedPlan.maxAmount}`}
                          value={stakeAmount}
                          onChange={(e) => setStakeAmount(e.target.value)}
                          className="text-lg"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Min: ${selectedPlan.minAmount} | Max: ${selectedPlan.maxAmount}
                        </p>
                      </div>

                      <Button
                        onClick={handleStake}
                        disabled={isStaking || isApproving || isPoolFull(selectedPlan) || !hasEnoughPM(selectedPlan) || !isConnected || !selectedPlan.isActive}
                        className="w-full h-12 text-lg"
                      >
                        {isStaking || isApproving ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : isPoolFull(selectedPlan) ? (
                          "Pool Full"
                        ) : !selectedPlan.isActive ? (
                          "Plan Inactive"
                        ) : !hasEnoughPM(selectedPlan) ? (
                          `Need ${selectedPlan.minPmHold.toLocaleString()} PM`
                        ) : (
                          `Stake ${selectedToken}`
                        )}
                      </Button>
                    </div>

                    <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                      <h4 className="font-semibold flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Earning Estimate
                      </h4>
                      
                      {stakeAmount && parseFloat(stakeAmount) > 0 && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Daily Profit</span>
                            <span className="font-semibold text-green-500">
                              +${getDailyProfit(parseFloat(stakeAmount), selectedPlan.monthlyRate).toFixed(4)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Monthly Profit (30 days)</span>
                            <span className="font-semibold text-green-500">
                              +${(parseFloat(stakeAmount) * selectedPlan.monthlyRate / 100).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total ({selectedPlan.lockPeriod} days)</span>
                            <span className="font-bold text-green-500">
                              +${(getDailyProfit(parseFloat(stakeAmount), selectedPlan.monthlyRate) * selectedPlan.lockPeriod).toFixed(2)}
                            </span>
                          </div>
                        </>
                      )}

                      <div className="pt-3 border-t border-border space-y-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          Lock Period: {selectedPlan.lockPeriod} days
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          Daily profit withdrawals available
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <AlertTriangle className="h-3 w-3 text-yellow-500" />
                          Min. 10 USDT/USDC to claim | 5% withdrawal tax
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Active Stakes */}
              {userStakes.filter(s => s.isActive).length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <VaultIcon className="h-5 w-5 text-primary" />
                    Your Active Stakes
                    <Badge variant="outline" className="ml-2 animate-pulse">
                      Live Updates
                    </Badge>
                  </h3>

                  <div className="space-y-4">
                    {userStakes.filter(s => s.isActive).map((stake, filteredIndex) => {
                      const stakeIndex = userStakes.findIndex(s => s === stake);
                      const plan = stakingPlans.find(p => p.id === stake.planId);
                      const pendingProfit = calculatePendingProfit(stake);
                      const now = currentTime / 1000;
                      const isUnlocked = now >= stake.endTime;
                      
                      return (
                        <div key={stakeIndex} className="p-4 rounded-lg bg-muted/30 border border-border">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Badge className={`bg-gradient-to-r ${plan?.gradient}`}>{plan?.name}</Badge>
                              <span className="font-semibold">{stake.amount.toFixed(2)} {stake.token}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {isUnlocked ? (
                                <Badge className="bg-green-500/20 text-green-500">Unlocked</Badge>
                              ) : (
                                <Badge variant="outline" className="font-mono">
                                  <Lock className="h-3 w-3 mr-1" />
                                  {formatTimeRemaining(stake.endTime)}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Started</p>
                              <p className="font-medium">{new Date(stake.startTime * 1000).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Unlock Date</p>
                              <p className="font-medium">{new Date(stake.endTime * 1000).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Claimed Profit</p>
                              <p className="font-medium text-green-500">${stake.claimedRewards.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Pending Profit</p>
                              <p className="font-bold text-yellow-500 animate-pulse">
                                ${pendingProfit.toFixed(6)}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-3 mt-4">
                            <Button
                              size="sm"
                              onClick={() => handleClaimRewards(stakeIndex)}
                              disabled={pendingProfit < 10 || (isClaiming && claimingIndex === stakeIndex)}
                              className="flex-1 min-w-[140px] gap-2"
                            >
                              {isClaiming && claimingIndex === stakeIndex ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Gift className="h-4 w-4" />
                              )}
                              {pendingProfit < 10 ? `Min $10` : `Claim $${(pendingProfit * 0.95).toFixed(2)}`}
                            </Button>
                            {isUnlocked ? (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="flex-1 min-w-[140px]"
                                onClick={() => handleWithdrawCapital(stakeIndex)}
                              >
                                Withdraw Capital
                              </Button>
                            ) : (
                              <Button 
                                size="sm" 
                                variant="destructive" 
                                className="flex-1 min-w-[140px]"
                                onClick={() => handleEarlyWithdrawal(stakeIndex)}
                              >
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Emergency Exit
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}
            </TabsContent>

            {/* Leaderboard Tab */}
            <TabsContent value="leaderboard" className="mt-6">
              <StakingLeaderboard />
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="mt-6 space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <VaultIcon className="h-4 w-4 text-blue-500" />
                    <span className="text-xs text-muted-foreground">Total Staked</span>
                  </div>
                  <p className="text-2xl font-bold">${analytics.totalStaked.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{analytics.activeCount} active stakes</p>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-xs text-muted-foreground">Total Earned</span>
                  </div>
                  <p className="text-2xl font-bold text-green-500">${analytics.totalClaimed.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">Claimed rewards</p>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border-yellow-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-yellow-500" />
                    <span className="text-xs text-muted-foreground">Pending</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-500">${analytics.totalPending.toFixed(4)}</p>
                  <p className="text-xs text-muted-foreground">Ready to claim</p>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-purple-500" />
                    <span className="text-xs text-muted-foreground">Projected Monthly</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-500">${analytics.projectedMonthly.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">Est. earnings</p>
                </Card>
              </div>

              {/* Profit Chart */}
              {analytics.chartData.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    Daily Profit Trend (Last 30 Days)
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analytics.chartData}>
                        <defs>
                          <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                        <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--background))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="profit" 
                          stroke="#22c55e" 
                          fillOpacity={1} 
                          fill="url(#profitGradient)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              )}

              {/* Distribution Chart */}
              {analytics.planDistribution.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-primary" />
                    Stake Distribution by Plan
                  </h3>
                  <div className="h-64 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={analytics.planDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {analytics.planDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number) => [`$${value.toFixed(2)}`, 'Staked']}
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--background))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              )}
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="mt-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <History className="h-5 w-5 text-primary" />
                  Transaction History
                </h3>
                
                {stakeHistory.length > 0 ? (
                  <div className="space-y-3">
                    {stakeHistory.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            item.action === "stake" ? "bg-blue-500/20" :
                            item.action === "claim" ? "bg-green-500/20" : "bg-red-500/20"
                          }`}>
                            {item.action === "stake" ? <VaultIcon className="h-4 w-4 text-blue-500" /> :
                             item.action === "claim" ? <Gift className="h-4 w-4 text-green-500" /> :
                             <ArrowLeft className="h-4 w-4 text-red-500" />}
                          </div>
                          <div>
                            <p className="font-medium capitalize">{item.action}</p>
                            <p className="text-xs text-muted-foreground">{item.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${
                            item.action === "claim" ? "text-green-500" : ""
                          }`}>
                            {item.action === "stake" ? "-" : "+"}${item.amount.toFixed(2)} {item.token}
                          </p>
                          <p className="text-xs text-muted-foreground">{item.plan} Pool</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No transaction history yet</p>
                    <p className="text-sm text-muted-foreground">Your staking activities will appear here</p>
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />

      {/* Early Withdrawal Modal */}
      {showEarlyWithdrawal && selectedStakeForWithdrawal !== null && (() => {
        const stake = userStakes[selectedStakeForWithdrawal];
        const plan = stakingPlans.find(p => p.id === stake.planId);
        return (
          <EarlyWithdrawalModal
            isOpen={showEarlyWithdrawal}
            onClose={() => {
              setShowEarlyWithdrawal(false);
              setSelectedStakeForWithdrawal(null);
            }}
            stake={{
              amount: stake.amount,
              token: stake.token,
              planName: plan?.name || "Unknown",
              endTime: stake.endTime,
              pendingProfit: calculatePendingProfit(stake),
            }}
            onConfirm={confirmEarlyWithdrawal}
          />
        );
      })()}
    </div>
  );
};

export default Vault;
