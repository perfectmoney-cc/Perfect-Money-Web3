import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Header } from "@/components/Header";
import { TradingViewTicker } from "@/components/TradingViewTicker";
import { HeroBanner } from "@/components/HeroBanner";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Footer } from "@/components/Footer";
import { WalletCard } from "@/components/WalletCard";
import { ArrowLeft, Lock, Unlock, Clock, Shield, Calendar, CheckCircle2, CalendarPlus, Loader2, TrendingUp } from "lucide-react";
import { VestingChart } from "@/components/VestingChart";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { format, addDays } from "date-fns";
import { parseUnits, formatUnits, formatEther, maxUint256 } from 'viem';
import bscLogo from "@/assets/bsc-logo.png";
import { CONTRACT_ADDRESSES, PM_TOKEN_ADDRESS } from "@/contracts/addresses";
import { PMTokenLockerABI } from "@/contracts/abis";
import { ERC20_ABI } from "@/contracts/swapABI";

// Contract addresses
const LOCKER_ADDRESS = CONTRACT_ADDRESSES[56].PMTokenLocker as `0x${string}`;

const LOCK_DURATIONS = [
  { label: "30 Days", value: "30d", days: 30 },
  { label: "90 Days", value: "90d", days: 90 },
  { label: "6 Months", value: "6m", days: 180 },
  { label: "1 Year", value: "1y", days: 365 },
  { label: "2 Years", value: "2y", days: 730 },
  { label: "Custom", value: "custom", days: 0 },
];

const EXTENSION_OPTIONS = [
  { label: "30 Days", days: 30 },
  { label: "60 Days", days: 60 },
  { label: "90 Days", days: 90 },
  { label: "6 Months", days: 180 },
  { label: "1 Year", days: 365 },
];

interface LockedToken {
  id: number;
  token: string;
  tokenName: string;
  owner: string;
  amount: bigint;
  lockDate: number;
  unlockDate: number;
  withdrawn: boolean;
  description: string;
}

const TokenLockerPage = () => {
  const { address, isConnected } = useAccount();
  const [tokenAddress, setTokenAddress] = useState(PM_TOKEN_ADDRESS);
  const [tokenName, setTokenName] = useState("PM Token");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("30d");
  const [customDays, setCustomDays] = useState("");
  
  // Lock extension state
  const [extensionLockId, setExtensionLockId] = useState<number | null>(null);
  const [extensionDays, setExtensionDays] = useState(30);
  
  const isLockerDeployed = LOCKER_ADDRESS !== "0x0000000000000000000000000000000000000000";

  // Write contract hooks
  const { writeContract, data: txHash, isPending: isWritePending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  // Read global stats from contract
  const { data: globalStats, refetch: refetchStats } = useReadContract({
    address: LOCKER_ADDRESS,
    abi: PMTokenLockerABI,
    functionName: 'getGlobalStats',
    chainId: 56,
    query: { enabled: isLockerDeployed }
  });

  // Read user's active locks from contract
  const { data: userActiveLocks, refetch: refetchLocks, isLoading: isLoadingLocks } = useReadContract({
    address: LOCKER_ADDRESS,
    abi: PMTokenLockerABI,
    functionName: 'getUserActiveLocks',
    args: address ? [address] : undefined,
    chainId: 56,
    query: { enabled: isLockerDeployed && !!address }
  });

  // Read user lock IDs
  const { data: userLockIds } = useReadContract({
    address: LOCKER_ADDRESS,
    abi: PMTokenLockerABI,
    functionName: 'getUserLocks',
    args: address ? [address] : undefined,
    chainId: 56,
    query: { enabled: isLockerDeployed && !!address }
  });

  // Read lock fee
  const { data: lockFee } = useReadContract({
    address: LOCKER_ADDRESS,
    abi: PMTokenLockerABI,
    functionName: 'lockFee',
    chainId: 56,
    query: { enabled: isLockerDeployed }
  });

  // Check token allowance
  const { data: allowanceData, refetch: refetchAllowance } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address && isLockerDeployed ? [address, LOCKER_ADDRESS] : undefined,
    query: { enabled: !!address && !!tokenAddress && isLockerDeployed }
  });

  // Parse user locks
  const lockedTokens: LockedToken[] = useMemo(() => {
    if (!userActiveLocks || !Array.isArray(userActiveLocks)) return [];
    
    return (userActiveLocks as any[]).map((lock, index) => ({
      id: userLockIds ? Number((userLockIds as bigint[])[index]) : index,
      token: lock.token,
      tokenName: lock.token === PM_TOKEN_ADDRESS ? "PM Token" : "Unknown Token",
      owner: lock.owner,
      amount: lock.amount,
      lockDate: Number(lock.lockDate),
      unlockDate: Number(lock.unlockDate),
      withdrawn: lock.withdrawn,
      description: lock.description
    }));
  }, [userActiveLocks, userLockIds]);

  // Format stats
  const totalLocks = globalStats ? Number((globalStats as any)[0]) : 0;
  const totalValueLocked = globalStats ? formatUnits((globalStats as any)[1], 18) : "0";
  const currentLockFee = lockFee ? formatEther(lockFee as bigint) : "0.01";

  // Check if approval needed
  const needsApproval = useMemo(() => {
    if (!amount || !allowanceData) return false;
    const requiredAmount = parseUnits(amount || "0", 18);
    return BigInt(allowanceData as bigint) < requiredAmount;
  }, [amount, allowanceData]);

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed && txHash) {
      toast.success("Transaction successful!");
      refetchStats();
      refetchLocks();
      refetchAllowance();
      setAmount("");
      setDescription("");
      setExtensionLockId(null);
    }
  }, [isConfirmed, txHash, refetchStats, refetchLocks, refetchAllowance]);

  const getUnlockDate = () => {
    const now = new Date();
    if (duration === "custom") {
      return addDays(now, parseInt(customDays) || 0);
    }
    const selected = LOCK_DURATIONS.find(d => d.value === duration);
    return addDays(now, selected?.days || 30);
  };

  const getUnlockTimestamp = () => {
    return BigInt(Math.floor(getUnlockDate().getTime() / 1000));
  };

  const handleApprove = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      writeContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [LOCKER_ADDRESS, maxUint256],
      } as any);
    } catch (error: any) {
      toast.error(error?.message || "Approval failed");
    }
  };

  const handleLock = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!tokenAddress || !amount) {
      toast.error("Please fill all required fields");
      return;
    }

    if (!isLockerDeployed) {
      toast.error("Token Locker contract not deployed");
      return;
    }

    try {
      const amountInWei = parseUnits(amount, 18);
      const unlockTimestamp = getUnlockTimestamp();
      const feeAmount = lockFee ? (lockFee as bigint) : parseUnits("0.01", 18);

      writeContract({
        address: LOCKER_ADDRESS,
        abi: PMTokenLockerABI,
        functionName: 'lockTokens',
        args: [tokenAddress as `0x${string}`, amountInWei, unlockTimestamp, description || "Token Lock"],
        value: feeAmount,
      } as any);
    } catch (error: any) {
      toast.error(error?.message || "Lock failed");
    }
  };

  const handleUnlock = async (lockId: number, unlockDate: number) => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }

    const now = Math.floor(Date.now() / 1000);
    if (now < unlockDate) {
      toast.error("Tokens are still locked until " + format(new Date(unlockDate * 1000), "MMM d, yyyy"));
      return;
    }

    try {
      writeContract({
        address: LOCKER_ADDRESS,
        abi: PMTokenLockerABI,
        functionName: 'unlockTokens',
        args: [BigInt(lockId)],
      } as any);
    } catch (error: any) {
      toast.error(error?.message || "Unlock failed");
    }
  };

  const handleExtendLock = async (lockId: number, currentUnlockDate: number) => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      const newUnlockTimestamp = BigInt(currentUnlockDate + (extensionDays * 24 * 60 * 60));
      
      writeContract({
        address: LOCKER_ADDRESS,
        abi: PMTokenLockerABI,
        functionName: 'extendLock',
        args: [BigInt(lockId), newUnlockTimestamp],
      } as any);
    } catch (error: any) {
      toast.error(error?.message || "Extension failed");
    }
  };

  const getTimeRemaining = (unlockDate: number) => {
    const now = Math.floor(Date.now() / 1000);
    const diff = unlockDate - now;
    if (diff <= 0) return "Ready to unlock";
    
    const days = Math.floor(diff / (60 * 60 * 24));
    const hours = Math.floor((diff % (60 * 60 * 24)) / (60 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
  };

  // Format locks for VestingChart
  const vestingChartData = lockedTokens.map(lock => ({
    id: lock.id.toString(),
    tokenName: lock.tokenName,
    amount: formatUnits(lock.amount, 18),
    lockDate: new Date(lock.lockDate * 1000),
    unlockDate: new Date(lock.unlockDate * 1000),
    status: lock.withdrawn ? "unlocked" as const : (Date.now() / 1000 >= lock.unlockDate ? "pending" as const : "locked" as const)
  }));

  const isProcessing = isWritePending || isConfirming;

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 lg:pb-0">
      <Header />
      <TradingViewTicker />
      <HeroBanner title="Token Locker" subtitle="Lock your tokens securely with customizable unlock schedules" />
      
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="md:hidden mb-6 mt-4">
          <WalletCard showQuickFunctionsToggle={false} compact={true} />
        </div>
        
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 text-sm">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Global Stats Card */}
            <Card className="p-4 bg-gradient-to-br from-primary/10 to-secondary/10 backdrop-blur-sm border-primary/30">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h3 className="font-bold">Token Locker Statistics</h3>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-2 bg-background/50 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Total Locks</p>
                  <p className="font-bold">{totalLocks.toLocaleString()}</p>
                </div>
                <div className="p-2 bg-background/50 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">TVL</p>
                  <p className="font-bold">{Number(totalValueLocked).toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
                </div>
                <div className="p-2 bg-background/50 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Lock Fee</p>
                  <p className="font-bold">{currentLockFee} BNB</p>
                </div>
              </div>
            </Card>

            {/* Lock Form */}
            <Card className="p-6 bg-card/50 backdrop-blur-sm">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Create New Lock
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label>Token Contract Address</Label>
                  <Input 
                    placeholder="0x..."
                    value={tokenAddress}
                    onChange={(e) => setTokenAddress(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Token Name (Optional)</Label>
                  <Input 
                    placeholder="e.g., PM Token"
                    value={tokenName}
                    onChange={(e) => setTokenName(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label>Amount to Lock</Label>
                  <Input 
                    placeholder="0.00"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Description (Optional)</Label>
                  <Input 
                    placeholder="e.g., Team tokens"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <Label>Lock Duration</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {LOCK_DURATIONS.map(d => (
                        <SelectItem key={d.value} value={d.value}>
                          {d.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {duration === "custom" && (
                  <div className="space-y-2">
                    <Label>Custom Days</Label>
                    <Input 
                      placeholder="Enter number of days"
                      type="number"
                      value={customDays}
                      onChange={(e) => setCustomDays(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className="p-4 rounded-lg bg-muted/50 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="font-medium">Lock Summary</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Lock Date:</span>
                    <p className="font-medium">{format(new Date(), "MMM d, yyyy")}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Unlock Date:</span>
                    <p className="font-medium">{format(getUnlockDate(), "MMM d, yyyy")}</p>
                  </div>
                </div>
              </div>

              {needsApproval ? (
                <Button 
                  variant="gradient" 
                  className="w-full"
                  onClick={handleApprove}
                  disabled={isProcessing || !isConnected}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Approve Token
                    </>
                  )}
                </Button>
              ) : (
                <Button 
                  variant="gradient" 
                  className="w-full"
                  onClick={handleLock}
                  disabled={isProcessing || !isConnected}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Locking Tokens...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Lock Tokens ({currentLockFee} BNB fee)
                    </>
                  )}
                </Button>
              )}
            </Card>

            {/* Vesting Schedule Chart */}
            <VestingChart lockedTokens={vestingChartData} />

            {/* Locked Tokens List */}
            <Card className="p-6 bg-card/50 backdrop-blur-sm">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Your Locked Tokens
              </h2>
              
              {isLoadingLocks ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : lockedTokens.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Lock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No locked tokens yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {lockedTokens.map((lock, index) => (
                    <div key={index} className="p-4 rounded-lg bg-muted/50 border border-border">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{lock.tokenName}</h4>
                          <p className="text-xs text-muted-foreground font-mono">{lock.token.slice(0, 10)}...{lock.token.slice(-8)}</p>
                          {lock.description && (
                            <p className="text-xs text-muted-foreground mt-1">{lock.description}</p>
                          )}
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          lock.withdrawn ? "bg-green-500/20 text-green-400" :
                          Date.now() / 1000 >= lock.unlockDate ? "bg-blue-500/20 text-blue-400" :
                          "bg-yellow-500/20 text-yellow-400"
                        }`}>
                          {lock.withdrawn ? "Unlocked" : (Date.now() / 1000 >= lock.unlockDate ? "Ready" : "Locked")}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-muted-foreground">Amount</span>
                          <p className="font-medium">{Number(formatUnits(lock.amount, 18)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Network</span>
                          <p className="font-medium flex items-center gap-1">
                            <img src={bscLogo} alt="BSC" className="h-4 w-4" />
                            BSC
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Lock Date</span>
                          <p className="font-medium">{format(new Date(lock.lockDate * 1000), "MMM d, yyyy")}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Unlock Date</span>
                          <p className="font-medium">{format(new Date(lock.unlockDate * 1000), "MMM d, yyyy")}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-sm text-muted-foreground">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {getTimeRemaining(lock.unlockDate)}
                        </span>
                        <div className="flex gap-2">
                          {!lock.withdrawn && (
                            <>
                              {/* Extend Lock Button */}
                              <Dialog open={extensionLockId === lock.id} onOpenChange={(open) => !open && setExtensionLockId(null)}>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => setExtensionLockId(lock.id)}
                                  >
                                    <CalendarPlus className="h-4 w-4 mr-1" />
                                    Extend
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                      <CalendarPlus className="h-5 w-5 text-primary" />
                                      Extend Lock Period
                                    </DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4 py-4">
                                    <div className="p-4 rounded-lg bg-muted/50">
                                      <p className="text-sm text-muted-foreground mb-1">Current Unlock Date</p>
                                      <p className="font-semibold">{format(new Date(lock.unlockDate * 1000), "MMM d, yyyy")}</p>
                                    </div>
                                    
                                    <div className="space-y-2">
                                      <Label>Extend By</Label>
                                      <Select value={extensionDays.toString()} onValueChange={(v) => setExtensionDays(parseInt(v))}>
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {EXTENSION_OPTIONS.map(opt => (
                                            <SelectItem key={opt.days} value={opt.days.toString()}>
                                              {opt.label}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                                      <p className="text-sm text-muted-foreground mb-1">New Unlock Date</p>
                                      <p className="font-semibold text-primary">
                                        {format(new Date((lock.unlockDate + extensionDays * 24 * 60 * 60) * 1000), "MMM d, yyyy")}
                                      </p>
                                    </div>

                                    <Button 
                                      variant="gradient" 
                                      className="w-full"
                                      onClick={() => handleExtendLock(lock.id, lock.unlockDate)}
                                      disabled={isProcessing}
                                    >
                                      {isProcessing ? (
                                        <>
                                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                          Extending...
                                        </>
                                      ) : (
                                        <>
                                          <CalendarPlus className="h-4 w-4 mr-2" />
                                          Confirm Extension
                                        </>
                                      )}
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>

                              {/* Unlock Button */}
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleUnlock(lock.id, lock.unlockDate)}
                                disabled={Date.now() / 1000 < lock.unlockDate || isProcessing}
                              >
                                {isProcessing ? (
                                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                ) : (
                                  <Unlock className="h-4 w-4 mr-1" />
                                )}
                                Unlock
                              </Button>
                            </>
                          )}
                          {lock.withdrawn && (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-6 bg-card/50 backdrop-blur-sm">
              <h3 className="font-bold text-lg mb-4">Why Lock Tokens?</h3>
              <div className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <Shield className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-medium">Build Trust</p>
                    <p className="text-muted-foreground">Show commitment by locking liquidity or team tokens</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Lock className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-medium">Prevent Rug Pulls</p>
                    <p className="text-muted-foreground">Locked tokens cannot be withdrawn until unlock date</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Calendar className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-medium">Vesting Schedules</p>
                    <p className="text-muted-foreground">Create time-locked vesting for team allocations</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CalendarPlus className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-medium">Extend Locks</p>
                    <p className="text-muted-foreground">Easily extend lock periods for continued commitment</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-primary/10 border-primary/20">
              <p className="text-sm text-muted-foreground">
                <span className="font-bold text-foreground">🔒 Secure:</span> All locks are managed by audited smart contracts on-chain on BSC Mainnet.
              </p>
            </Card>

            <div className="hidden md:block mt-6">
              <WalletCard showQuickFunctionsToggle={false} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default TokenLockerPage;
