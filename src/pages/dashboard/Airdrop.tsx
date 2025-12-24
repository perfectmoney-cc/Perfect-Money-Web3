import { useState, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";
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
import { FaGithub } from "react-icons/fa";

import {
  ArrowLeft,
  Gift,
  Clock,
  CheckCircle,
  ExternalLink,
  Trophy,
  Loader2,
  BarChart3,
  AlertTriangle,
  Wallet,
  Coins,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { FaFacebook, FaYoutube, FaTwitter, FaTelegram } from "react-icons/fa";
import { SiTrustpilot, SiGoogle } from "react-icons/si";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useBalance } from "wagmi";
import { formatUnits, parseEther, formatEther } from "viem";
import { AIRDROP_ABI } from "@/contracts/airdropABI";
import { CONTRACT_ADDRESSES } from "@/contracts/addresses";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// --- X.com icon (replaces old Twitter bird) ---
const XBrandIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M18.244 2H21.5l-7.36 8.412L23 22h-6.828l-5.3-6.918L4.5 22H1.244l7.823-8.938L1 2h6.828l4.873 6.313L18.244 2Zm-2.396 17.338h1.86L7.29 4.56H5.318l10.53 14.778Z" />
  </svg>
);

const PMAIRDROP_ADDRESS = CONTRACT_ADDRESSES[56].PMAirdrop as `0x${string}`;
const TOTAL_TASKS = 9; // Fixed in contract

// Task definitions (matching contract's 9 tasks)
const TASK_DEFINITIONS = [
  {
    id: 0,
    title: "Like us on Facebook",
    icon: FaFacebook,
    link: "https://www.facebook.com/perfectmoney.cc",
    color: "text-blue-600",
  },
  {
    id: 1,
    title: "Leave Review on Facebook",
    icon: FaFacebook,
    link: "https://www.facebook.com/perfectmoney.cc/reviews",
    color: "text-blue-600",
  },
  {
    id: 2,
    title: "Subscribe to Youtube Channel",
    icon: FaYoutube,
    link: "https://www.youtube.com/@perfectmoney_cc",
    color: "text-red-600",
  },
  {
    id: 3,
    title: "React to any Youtube Videos",
    icon: FaYoutube,
    link: "https://www.youtube.com/@perfectmoney_cc/videos",
    color: "text-red-600",
  },
  {
    id: 4,
    title: "Follow us on X",
    icon: XBrandIcon,
    link: "https://x.com/perfectmoney_cc",
    color: "text-white",
  },
  {
    id: 5,
    title: "React or Post on X",
    icon: XBrandIcon,
    link: "https://x.com/perfectmoney_cc/status/1994303002920796389",
    color: "text-white",
  },
  {
    id: 6,
    title: "Subscribe to Telegram Channel",
    icon: FaTelegram,
    link: "t.me/perfectmoney_cc",
    color: "text-cyan-500",
  },
  {
    id: 7,
    title: "Review on TrustPilot",
    icon: SiTrustpilot,
    link: "https://www.trustpilot.com/review/perfectmoney.cc",
    color: "text-green-600",
  },
  {
    id: 8,
    title: "Visit our GitHub Repo",
    icon: FaGithub,
    link: "https://github.com/perfectmoney-cc", // change to your exact repo URL
    color: "text-gray-800",
  },
];

const AirdropPage = () => {
  const { address, isConnected } = useAccount();
  const [walletAddress, setWalletAddress] = useState("");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [claimConfirmOpen, setClaimConfirmOpen] = useState(false);
  const [pendingTaskId, setPendingTaskId] = useState<number | null>(null);
  const [taskVisitedStatus, setTaskVisitedStatus] = useState<boolean[]>(Array(TOTAL_TASKS).fill(false));

  // Get user's BNB balance
  const { data: bnbBalance, refetch: refetchBalance } = useBalance({
    address: address,
    chainId: 56,
  });

  // User's BNB balance in readable format
  const userBnbBalance = bnbBalance ? parseFloat(formatEther(bnbBalance.value)) : 0;

  // Check if contract is deployed
  const isContractDeployed = PMAIRDROP_ADDRESS !== "0x0000000000000000000000000000000000000000";

  // Read contract data
  const { data: claimFeeBNB, refetch: refetchClaimFee } = useReadContract({
    address: PMAIRDROP_ADDRESS,
    abi: AIRDROP_ABI,
    functionName: "claimFeeBNB",
    chainId: 56,
    query: { enabled: isContractDeployed },
  });

  const { data: networkFeeBNB, refetch: refetchNetworkFee } = useReadContract({
    address: PMAIRDROP_ADDRESS,
    abi: AIRDROP_ABI,
    functionName: "networkFeeBNB",
    chainId: 56,
    query: { enabled: isContractDeployed },
  });

  const { data: totalReward, refetch: refetchTotalReward } = useReadContract({
    address: PMAIRDROP_ADDRESS,
    abi: AIRDROP_ABI,
    functionName: "totalReward",
    chainId: 56,
    query: { enabled: isContractDeployed },
  });

  const { data: maxClaimable, refetch: refetchMaxClaimable } = useReadContract({
    address: PMAIRDROP_ADDRESS,
    abi: AIRDROP_ABI,
    functionName: "maxClaimable",
    chainId: 56,
    query: { enabled: isContractDeployed },
  });

  const { data: totalClaimed, refetch: refetchTotalClaimed } = useReadContract({
    address: PMAIRDROP_ADDRESS,
    abi: AIRDROP_ABI,
    functionName: "totalClaimed",
    chainId: 56,
    query: { enabled: isContractDeployed },
  });

  // User-specific: has claimed reward
  const { data: hasClaimedReward, refetch: refetchHasClaimed } = useReadContract({
    address: PMAIRDROP_ADDRESS,
    abi: AIRDROP_ABI,
    functionName: "hasClaimedReward",
    args: address ? [address] : undefined,
    chainId: 56,
    query: { enabled: isContractDeployed && !!address },
  });

  // Check each task's visited status
  const taskQueries = TASK_DEFINITIONS.map((task) =>
    useReadContract({
      address: PMAIRDROP_ADDRESS,
      abi: AIRDROP_ABI,
      functionName: "hasVisitedTask",
      args: address ? [address, BigInt(task.id)] : undefined,
      chainId: 56,
      query: { enabled: isContractDeployed && !!address },
    }),
  );

  // Update visited status when queries change
  useEffect(() => {
    const newStatus = taskQueries.map((q) => q.data === true);
    setTaskVisitedStatus(newStatus);
  }, [taskQueries.map((q) => q.data).join(",")]);

  // Extract fee values
  const claimFeeBnb = claimFeeBNB ? Number(formatEther(claimFeeBNB as bigint)) : 0.0005;
  const networkFeeBnb = networkFeeBNB ? Number(formatEther(networkFeeBNB as bigint)) : 0.0005;
  const totalFeeBnb = claimFeeBnb + networkFeeBnb;
  const hasEnoughBnb = userBnbBalance >= totalFeeBnb;

  // Format stats
  const totalRewardFormatted = totalReward ? formatUnits(totalReward as bigint, 18) : "0";
  const totalClaimedFormatted = totalClaimed ? formatUnits(totalClaimed as bigint, 18) : "0";
  const maxClaimableFormatted = maxClaimable ? formatUnits(maxClaimable as bigint, 18) : "0";

  // Write contract hooks
  const { writeContract: writeVisitTask, data: visitTxHash, isPending: isVisitPending } = useWriteContract();
  const { writeContract: writeClaimReward, data: claimTxHash, isPending: isClaimPending } = useWriteContract();

  const { isLoading: isVisitConfirming, isSuccess: isVisitConfirmed } = useWaitForTransactionReceipt({
    hash: visitTxHash,
  });
  const { isLoading: isClaimConfirming, isSuccess: isClaimConfirmed } = useWaitForTransactionReceipt({
    hash: claimTxHash,
  });

  // Auto-connect wallet on mount
  useEffect(() => {
    if (isConnected && address) {
      setWalletAddress(address);
    }
  }, [isConnected, address]);

  // 90 days countdown starting from December 6, 2025
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [prevTimeLeft, setPrevTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const AIRDROP_START_DATE = new Date("2025-12-06T00:00:00Z");
  const AIRDROP_END_DATE = new Date(AIRDROP_START_DATE.getTime() + 90 * 24 * 60 * 60 * 1000);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const distance = AIRDROP_END_DATE.getTime() - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const newTimeLeft = {
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      };

      setPrevTimeLeft(timeLeft);
      setTimeLeft(newTimeLeft);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Completed count
  const completedCount = taskVisitedStatus.filter(Boolean).length;
  const allTasksCompleted = completedCount === TOTAL_TASKS;

  // Handle task visit
  const handleVisitTask = (taskId: number, link: string) => {
    // Open the link first
    window.open(link, "_blank");

    if (!isConnected) {
      toast.error("Please connect your wallet to mark task as visited");
      return;
    }

    if (!isContractDeployed) {
      // Local fallback
      setTaskVisitedStatus((prev) => {
        const newStatus = [...prev];
        newStatus[taskId] = true;
        return newStatus;
      });
      toast.success("Task marked as visited!");
      return;
    }

    if (taskVisitedStatus[taskId]) {
      toast.info("Task already visited");
      return;
    }

    // Set pending task and show confirm
    setPendingTaskId(taskId);
    setConfirmDialogOpen(true);
  };

  // Execute visit task on blockchain
  const executeVisitTask = async () => {
    if (pendingTaskId === null) return;

    try {
      writeVisitTask({
        address: PMAIRDROP_ADDRESS,
        abi: AIRDROP_ABI,
        functionName: "visitTask",
        args: [BigInt(pendingTaskId)],
        chainId: 56,
      } as any);
      toast.info(`Marking task ${pendingTaskId + 1} as visited...`);
    } catch (error: any) {
      toast.error(error?.message || "Failed to mark task as visited");
    }

    setConfirmDialogOpen(false);
    setPendingTaskId(null);
  };

  // Handle claim reward (only when all tasks complete)
  const handleClaimReward = () => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!allTasksCompleted) {
      toast.error("Complete all 9 tasks first!");
      return;
    }

    if (hasClaimedReward) {
      toast.error("You have already claimed your reward");
      return;
    }

    setClaimConfirmOpen(true);
  };

  // Execute claim reward
  const executeClaimReward = async () => {
    if (!hasEnoughBnb) {
      toast.error(`Insufficient BNB. You need at least ${totalFeeBnb.toFixed(6)} BNB`);
      setClaimConfirmOpen(false);
      return;
    }

    try {
      const feeInWei = parseEther(totalFeeBnb.toFixed(18));

      writeClaimReward({
        address: PMAIRDROP_ADDRESS,
        abi: AIRDROP_ABI,
        functionName: "claimReward",
        value: feeInWei,
        chainId: 56,
      } as any);
      toast.info(`Claiming ${totalRewardFormatted} PM tokens...`);
    } catch (error: any) {
      toast.error(error?.message || "Failed to claim reward");
    }

    setClaimConfirmOpen(false);
  };

  // Handle visit task confirmation
  useEffect(() => {
    if (isVisitConfirmed && visitTxHash) {
      // Refetch task statuses
      taskQueries.forEach((q) => q.refetch());
      toast.success("Task marked as visited!");
      window.dispatchEvent(new Event("balanceUpdate"));
    }
  }, [isVisitConfirmed, visitTxHash]);

  // Confetti celebration function
  const triggerConfetti = useCallback(() => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#FFD700', '#FFA500', '#FF6347', '#00FF00', '#1E90FF', '#9370DB'],
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#FFD700', '#FFA500', '#FF6347', '#00FF00', '#1E90FF', '#9370DB'],
      });
    }, 250);
  }, []);

  // Handle claim reward confirmation
  useEffect(() => {
    if (isClaimConfirmed && claimTxHash) {
      refetchHasClaimed();
      refetchTotalClaimed();
      refetchBalance();
      toast.success(`🎉 Claimed ${totalRewardFormatted} PM tokens!`);
      triggerConfetti();
      window.dispatchEvent(new Event("balanceUpdate"));
    }
  }, [isClaimConfirmed, claimTxHash, triggerConfetti]);

  const isProcessing = isVisitPending || isVisitConfirming || isClaimPending || isClaimConfirming;

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 lg:pb-0">
      <Header />
      <TradingViewTicker />
      <HeroBanner title="Perfect Money Airdrop" subtitle="Complete all 9 tasks and claim your PM tokens" />

      <main className="container mx-auto px-4 pt-12 pb-12 flex-1">
        {/* Mobile Wallet Card */}
        <div className="md:hidden mt-5 mb-6">
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
          <Link
            to="/dashboard/airdrop/admin"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm"
          >
            Admin Panel
          </Link>
        </div>

        {/* Stats Card */}
        <Card className="p-4 mb-4 bg-gradient-to-br from-primary/10 to-secondary/10 backdrop-blur-sm border-primary/30">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h3 className="font-bold">Airdrop Statistics</h3>
            {!isContractDeployed && (
              <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full ml-auto">
                Not Deployed
              </span>
            )}
            {isContractDeployed && (
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full ml-auto">Active</span>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-2 bg-background/50 rounded-lg text-center">
              <p className="text-xs text-muted-foreground">Total Pool</p>
              <p className="font-bold">{Number(maxClaimableFormatted).toLocaleString()} PM</p>
            </div>
            <div className="p-2 bg-background/50 rounded-lg text-center">
              <p className="text-xs text-muted-foreground">Total Claimed</p>
              <p className="font-bold">{Number(totalClaimedFormatted).toLocaleString()} PM</p>
            </div>
            <div className="p-2 bg-background/50 rounded-lg text-center">
              <p className="text-xs text-muted-foreground">Remaining</p>
              <p className="font-bold">
                {(Number(maxClaimableFormatted) - Number(totalClaimedFormatted)).toLocaleString()} PM
              </p>
            </div>
            <div className="p-2 bg-background/50 rounded-lg text-center">
              <p className="text-xs text-muted-foreground">Reward Per User</p>
              <p className="font-bold text-primary">{Number(totalRewardFormatted).toLocaleString()} PM</p>
            </div>
          </div>
        </Card>

        {/* BNB Balance Card */}
        {isConnected && (
          <Card
            className={`p-4 mb-6 backdrop-blur-sm border ${hasEnoughBnb ? "bg-green-500/5 border-green-500/30" : "bg-red-500/5 border-red-500/30"}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Wallet className={`h-5 w-5 ${hasEnoughBnb ? "text-green-500" : "text-red-500"}`} />
                <div>
                  <p className="text-sm font-medium">Your BNB Balance</p>
                  <p className={`text-lg font-bold ${hasEnoughBnb ? "text-green-500" : "text-red-500"}`}>
                    {userBnbBalance.toFixed(6)} BNB
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Claim Fee (once)</p>
                <p className="text-sm font-medium">{totalFeeBnb.toFixed(6)} BNB</p>
                {!hasEnoughBnb && <p className="text-xs text-red-400 mt-1">Insufficient balance</p>}
              </div>
            </div>
          </Card>
        )}

        <div className="max-w-6xl mx-auto space-y-8">
          {/* Airdrop Header with Timer */}
          <Card className="p-6 md:p-8 bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <img src={pmLogo} alt="PM" className="h-10 md:h-12 w-10 md:w-12" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="md:text-3xl font-bold text-lg">{Number(totalRewardFormatted).toLocaleString()}</h2>
                      <img src={pmLogo} alt="PM" className="h-6 w-6" />
                      <span className="text-xl md:text-2xl font-bold">PM</span>
                    </div>
                    <p className="text-sm md:text-base text-muted-foreground">Reward for Completing All Tasks</p>
                  </div>
                </div>
                <p className="text-sm md:text-base text-muted-foreground">
                  Complete all 9 social tasks to claim your PM tokens. Fee is only charged once when you claim!
                </p>
              </div>

              <Card className="p-4 md:p-6 bg-background/80 backdrop-blur-sm border-primary/30 shadow-lg shadow-primary/10">
                <div className="text-center mb-4">
                  <Clock className="h-5 md:h-6 w-5 md:w-6 text-primary mx-auto mb-2 animate-pulse" />
                  <p className="text-xs md:text-sm text-muted-foreground font-medium">Time Remaining</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1">90 Day Airdrop Event</p>
                </div>
                <div className="grid grid-cols-4 gap-2 md:gap-3">
                  <div className="text-center group">
                    <div
                      className={`bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg p-2 md:p-3 mb-1 border border-primary/20 transition-all duration-300 ${prevTimeLeft.days !== timeLeft.days ? "animate-scale-in" : ""}`}
                    >
                      <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                        {String(timeLeft.days).padStart(2, "0")}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">Days</span>
                  </div>
                  <div className="text-center group">
                    <div
                      className={`bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg p-2 md:p-3 mb-1 border border-primary/20 transition-all duration-300 ${prevTimeLeft.hours !== timeLeft.hours ? "animate-scale-in" : ""}`}
                    >
                      <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                        {String(timeLeft.hours).padStart(2, "0")}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">Hours</span>
                  </div>
                  <div className="text-center group">
                    <div
                      className={`bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg p-2 md:p-3 mb-1 border border-primary/20 transition-all duration-300 ${prevTimeLeft.minutes !== timeLeft.minutes ? "animate-scale-in" : ""}`}
                    >
                      <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                        {String(timeLeft.minutes).padStart(2, "0")}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">Mins</span>
                  </div>
                  <div className="text-center group">
                    <div
                      className={`bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg p-2 md:p-3 mb-1 border border-primary/20 transition-all duration-300 ${prevTimeLeft.seconds !== timeLeft.seconds ? "animate-scale-in" : ""}`}
                    >
                      <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                        {String(timeLeft.seconds).padStart(2, "0")}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">Secs</span>
                  </div>
                </div>
              </Card>
            </div>
          </Card>

          {/* Main Content: Tasks and Claim Form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            {/* Tasks Column */}
            <Card className="p-4 md:p-6 bg-card/50 backdrop-blur-sm h-fit">
              <h2 className="md:text-2xl font-bold mb-4 md:mb-6 flex items-center gap-2 text-lg">
                <Gift className="h-5 md:h-6 w-5 md:w-6 text-primary" />
                Complete All 9 Tasks
              </h2>

              {/* Info Notice */}
              <div className="mb-4 p-3 bg-primary/10 border border-primary/30 rounded-lg">
                <p className="text-xs text-primary flex items-center gap-2">
                  <Coins className="h-4 w-4 flex-shrink-0" />
                  <span>
                    Complete all tasks first (free), then claim{" "}
                    <strong>{Number(totalRewardFormatted).toLocaleString()} PM</strong> tokens with a one-time fee of{" "}
                    <strong>{totalFeeBnb.toFixed(6)} BNB</strong>
                  </span>
                </p>
              </div>

              <div className="space-y-3">
                {TASK_DEFINITIONS.map((task, index) => {
                  const Icon = task.icon;
                  const isVisited = taskVisitedStatus[task.id];
                  const isLoading = isVisitPending && pendingTaskId === task.id;

                  return (
                    <div
                      key={task.id}
                      className={`flex items-center justify-between p-3 md:p-4 border rounded-lg transition-all duration-300 hover:scale-[1.01] ${
                        isVisited
                          ? "border-green-500/50 bg-gradient-to-r from-green-500/10 to-green-500/5 animate-fade-in"
                          : "border-border hover:border-primary/50 hover:bg-primary/5"
                      }`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                        {isVisited ? (
                          <CheckCircle className="h-4 md:h-5 w-4 md:w-5 text-green-500 flex-shrink-0 animate-scale-in" />
                        ) : (
                          <div className="h-4 md:h-5 w-4 md:w-5 rounded-full border-2 border-muted flex-shrink-0 transition-all hover:border-primary" />
                        )}
                        <Icon
                          className={`h-4 md:h-5 w-4 md:w-5 flex-shrink-0 ${task.color} transition-transform hover:scale-110`}
                        />
                        <span
                          className={`font-medium text-xs md:text-sm truncate ${isVisited ? "text-green-500" : ""}`}
                        >
                          {task.title}
                        </span>
                      </div>
                      <Button
                        variant={isVisited ? "ghost" : "outline"}
                        size="sm"
                        onClick={() => handleVisitTask(task.id, task.link)}
                        disabled={isVisited || isLoading || hasClaimedReward}
                        className={`flex-shrink-0 text-xs md:text-sm transition-all duration-200 ${
                          isVisited
                            ? "text-green-500 bg-green-500/10"
                            : "hover:bg-primary hover:text-primary-foreground"
                        }`}
                      >
                        {isLoading ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : isVisited ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Done
                          </>
                        ) : (
                          <>
                            Visit <ExternalLink className="h-3 w-3 ml-1" />
                          </>
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 md:mt-6 p-3 md:p-4 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs md:text-sm font-medium">Progress</span>
                  <span className="text-xs md:text-sm font-bold text-primary">
                    {completedCount} / {TOTAL_TASKS}
                  </span>
                </div>
                <div className="mt-2 h-3 bg-muted/50 rounded-full overflow-hidden border border-border/50">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-green-500 transition-all duration-500 ease-out relative"
                    style={{ width: `${(completedCount / TOTAL_TASKS) * 100}%` }}
                  >
                    {completedCount > 0 && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                    )}
                  </div>
                </div>
                {allTasksCompleted && (
                  <p className="text-xs text-green-500 font-medium mt-2 animate-fade-in flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> All tasks complete! You can now claim your reward.
                  </p>
                )}
              </div>
            </Card>

            {/* Claim Form Column */}
            <Card className="p-4 md:p-6 bg-card/50 backdrop-blur-sm h-fit">
              <h2 className="md:text-2xl font-bold mb-4 md:mb-6 text-lg">Claim Your Reward</h2>

              {hasClaimedReward ? (
                <div className="text-center py-8 md:py-12">
                  <CheckCircle className="h-12 md:h-16 w-12 md:w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg md:text-xl font-bold mb-2">Already Claimed!</h3>
                  <p className="text-sm md:text-base text-muted-foreground">
                    You have claimed {Number(totalRewardFormatted).toLocaleString()} PM tokens.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 md:space-y-6">
                  <div>
                    <Label htmlFor="wallet" className="text-sm md:text-base">
                      Connected Wallet (BEP-20)
                    </Label>
                    <Input
                      id="wallet"
                      placeholder="0x..."
                      value={walletAddress}
                      readOnly
                      className="mt-2 bg-muted/50"
                    />
                    {!isConnected && (
                      <p className="text-xs text-yellow-400 mt-1 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Connect your wallet to participate
                      </p>
                    )}
                  </div>

                  <div className="p-3 md:p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <h3 className="font-bold text-sm md:text-base mb-2 flex items-center gap-2">
                      <Trophy className="h-4 md:h-5 w-4 md:w-5 text-primary" />
                      Your Reward
                    </h3>
                    <div className="flex items-center gap-2">
                      <p className="md:text-3xl font-bold text-primary text-lg">
                        {Number(totalRewardFormatted).toLocaleString()}
                      </p>
                      <img src={pmLogo} alt="PM" className="h-6 w-6" />
                      <span className="text-xl md:text-2xl font-bold text-primary">PM</span>
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1">
                      {allTasksCompleted
                        ? "All tasks complete! Ready to claim."
                        : `Complete ${TOTAL_TASKS - completedCount} more task(s) to unlock`}
                    </p>
                  </div>

                  {/* Fee breakdown */}
                  <div className="p-3 bg-muted/30 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Claim Fee:</span>
                      <span className="font-medium">{claimFeeBnb.toFixed(6)} BNB</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Network Fee:</span>
                      <span className="font-medium">{networkFeeBnb.toFixed(6)} BNB</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold border-t pt-2">
                      <span>Total Fee:</span>
                      <span className="text-primary">{totalFeeBnb.toFixed(6)} BNB</span>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    disabled={!isConnected || !allTasksCompleted || isProcessing || !hasEnoughBnb}
                    onClick={handleClaimReward}
                  >
                    {isClaimPending || isClaimConfirming ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Processing...
                      </>
                    ) : !isConnected ? (
                      "Connect Wallet"
                    ) : !allTasksCompleted ? (
                      `Complete ${TOTAL_TASKS - completedCount} More Task(s)`
                    ) : !hasEnoughBnb ? (
                      "Insufficient BNB"
                    ) : (
                      <>
                        <Gift className="h-4 w-4 mr-2" />
                        Claim {Number(totalRewardFormatted).toLocaleString()} PM
                      </>
                    )}
                  </Button>

                  <div className="text-xs text-muted-foreground text-center space-y-1">
                    <p>• One claim per wallet address</p>
                    <p>• Fee charged only once when claiming</p>
                    <p>• Complete all 9 tasks to unlock claim</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />

      {/* Visit Task Confirmation Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark Task as Visited</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>You are about to mark this task as visited:</p>
              <p className="font-semibold text-foreground">
                {pendingTaskId !== null ? TASK_DEFINITIONS[pendingTaskId]?.title : ""}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                This will record your visit on the blockchain. No fee is charged for visiting tasks.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeVisitTask} disabled={isVisitPending}>
              {isVisitPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                "Confirm Visit"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Claim Reward Confirmation Dialog */}
      <AlertDialog open={claimConfirmOpen} onOpenChange={setClaimConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Claim Your Reward</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>You have completed all 9 tasks!</p>

              <div className="p-3 bg-muted rounded-lg space-y-2 mt-4">
                <div className="flex justify-between text-sm">
                  <span>Claim Fee:</span>
                  <span className="font-medium">{claimFeeBnb.toFixed(6)} BNB</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Network Fee:</span>
                  <span className="font-medium">{networkFeeBnb.toFixed(6)} BNB</span>
                </div>
                <div className="flex justify-between text-sm font-medium border-t pt-2">
                  <span>Total Fee:</span>
                  <span className="text-primary">{totalFeeBnb.toFixed(6)} BNB</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Your Balance:</span>
                  <span className={`font-medium ${hasEnoughBnb ? "text-green-500" : "text-red-500"}`}>
                    {userBnbBalance.toFixed(6)} BNB
                  </span>
                </div>
                <div className="flex justify-between text-sm border-t pt-2">
                  <span>Reward:</span>
                  <span className="font-bold text-primary">+{Number(totalRewardFormatted).toLocaleString()} PM</span>
                </div>
              </div>

              {!hasEnoughBnb && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-sm text-red-400 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Insufficient BNB balance to pay the claim fee
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeClaimReward}
              disabled={!hasEnoughBnb || isClaimPending}
              className={!hasEnoughBnb ? "opacity-50 cursor-not-allowed" : ""}
            >
              {isClaimPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                "Claim Reward"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AirdropPage;
