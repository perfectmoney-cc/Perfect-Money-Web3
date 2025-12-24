import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/Header";
import { TradingViewTicker } from "@/components/TradingViewTicker";
import { HeroBanner } from "@/components/HeroBanner";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Footer } from "@/components/Footer";
import { WalletCard } from "@/components/WalletCard";
import { 
  ArrowLeft, Settings, Vault, Shield, Loader2, DollarSign, 
  Coins, PauseCircle, PlayCircle, Wallet, TrendingUp, Users
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { vaultABI } from "@/contracts/vaultABI";
import { CONTRACT_ADDRESSES, ChainId } from "@/contracts/addresses";
import { bsc } from "wagmi/chains";
import { formatEther, parseEther } from "viem";

const VaultAdmin = () => {
  const { address, isConnected } = useAccount();
  const [fundAmount, setFundAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [newFeeCollector, setNewFeeCollector] = useState("");
  const [selectedToken, setSelectedToken] = useState<"usdt" | "usdc">("usdt");

  const vaultAddress = CONTRACT_ADDRESSES[56]?.PMVault || "0x0000000000000000000000000000000000000000";

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  // Read contract owner
  const { data: contractOwner } = useReadContract({
    address: vaultAddress as `0x${string}`,
    abi: vaultABI,
    functionName: "owner",
  });

  // Read paused status
  const { data: isPaused } = useReadContract({
    address: vaultAddress as `0x${string}`,
    abi: vaultABI,
    functionName: "paused",
  });

  // Read fee collector
  const { data: feeCollector } = useReadContract({
    address: vaultAddress as `0x${string}`,
    abi: vaultABI,
    functionName: "feeCollector",
  });

  // Read global stats
  const { data: globalStats } = useReadContract({
    address: vaultAddress as `0x${string}`,
    abi: vaultABI,
    functionName: "getGlobalStats",
  });

  // Read plan count
  const { data: planCount } = useReadContract({
    address: vaultAddress as `0x${string}`,
    abi: vaultABI,
    functionName: "planCount",
  });

  // Read plan info for each plan
  const { data: bronzePlan } = useReadContract({
    address: vaultAddress as `0x${string}`,
    abi: vaultABI,
    functionName: "getPlanInfo",
    args: [BigInt(0)],
  });

  const { data: silverPlan } = useReadContract({
    address: vaultAddress as `0x${string}`,
    abi: vaultABI,
    functionName: "getPlanInfo",
    args: [BigInt(1)],
  });

  const { data: goldPlan } = useReadContract({
    address: vaultAddress as `0x${string}`,
    abi: vaultABI,
    functionName: "getPlanInfo",
    args: [BigInt(2)],
  });

  const isOwner = address && contractOwner && address.toLowerCase() === (contractOwner as string).toLowerCase();

  useEffect(() => {
    if (isSuccess) {
      toast.success("Transaction successful!");
      setFundAmount("");
      setWithdrawAmount("");
      setNewFeeCollector("");
    }
  }, [isSuccess]);

  const handlePauseToggle = async () => {
    try {
      writeContract({
        address: vaultAddress as `0x${string}`,
        abi: vaultABI,
        functionName: isPaused ? "unpause" : "pause",
        chain: bsc,
        account: address,
      });
    } catch (error) {
      console.error("Pause toggle error:", error);
      toast.error("Failed to toggle pause state");
    }
  };

  const handleFundRewardPool = async () => {
    if (!fundAmount) {
      toast.error("Please enter an amount");
      return;
    }

    const tokenAddress = selectedToken === "usdt" 
      ? CONTRACT_ADDRESSES[56].USDT 
      : CONTRACT_ADDRESSES[56].USDC;

    try {
      writeContract({
        address: vaultAddress as `0x${string}`,
        abi: vaultABI,
        functionName: "fundRewardPool",
        args: [tokenAddress as `0x${string}`, parseEther(fundAmount)],
        chain: bsc,
        account: address,
      });
    } catch (error) {
      console.error("Fund error:", error);
      toast.error("Failed to fund reward pool");
    }
  };

  const handleWithdrawRewardPool = async () => {
    if (!withdrawAmount) {
      toast.error("Please enter an amount");
      return;
    }

    const tokenAddress = selectedToken === "usdt" 
      ? CONTRACT_ADDRESSES[56].USDT 
      : CONTRACT_ADDRESSES[56].USDC;

    try {
      writeContract({
        address: vaultAddress as `0x${string}`,
        abi: vaultABI,
        functionName: "withdrawRewardPool",
        args: [tokenAddress as `0x${string}`, parseEther(withdrawAmount)],
        chain: bsc,
        account: address,
      });
    } catch (error) {
      console.error("Withdraw error:", error);
      toast.error("Failed to withdraw from reward pool");
    }
  };

  const handleSetFeeCollector = async () => {
    if (!newFeeCollector) {
      toast.error("Please enter an address");
      return;
    }

    try {
      writeContract({
        address: vaultAddress as `0x${string}`,
        abi: vaultABI,
        functionName: "setFeeCollector",
        args: [newFeeCollector as `0x${string}`],
        chain: bsc,
        account: address,
      });
    } catch (error) {
      console.error("Set fee collector error:", error);
      toast.error("Failed to set fee collector");
    }
  };

  const handleUpdatePlan = async (planId: number, isActive: boolean) => {
    try {
      writeContract({
        address: vaultAddress as `0x${string}`,
        abi: vaultABI,
        functionName: "updatePlan",
        args: [BigInt(planId), isActive],
        chain: bsc,
        account: address,
      });
    } catch (error) {
      console.error("Update plan error:", error);
      toast.error("Failed to update plan");
    }
  };

  const formatPlanData = (plan: any) => {
    if (!plan) return null;
    return {
      minStake: plan.minStake ? formatEther(plan.minStake) : "0",
      maxStake: plan.maxStake ? formatEther(plan.maxStake) : "0",
      dailyRate: plan.dailyRate ? (Number(plan.dailyRate) / 100).toFixed(2) : "0",
      minPmHold: plan.minPmHold ? formatEther(plan.minPmHold) : "0",
      maxPoolSize: plan.maxPoolSize ? formatEther(plan.maxPoolSize) : "0",
      currentPoolSize: plan.currentPoolSize ? formatEther(plan.currentPoolSize) : "0",
      isActive: plan.isActive ?? false,
    };
  };

  const plans = [
    { id: 0, name: "Bronze", color: "text-amber-600", data: formatPlanData(bronzePlan) },
    { id: 1, name: "Silver", color: "text-gray-400", data: formatPlanData(silverPlan) },
    { id: 2, name: "Gold", color: "text-yellow-500", data: formatPlanData(goldPlan) },
  ];

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-background flex flex-col pb-20 lg:pb-0">
        <Header />
        <TradingViewTicker />
        <HeroBanner title="Vault Admin" subtitle="Manage staking vault settings" />

        <main className="container mx-auto px-4 pt-12 pb-12 flex-1">
          <div className="md:hidden mb-6">
            <WalletCard showQuickFunctionsToggle={false} compact={true} />
          </div>

          <Link to="/dashboard/vault" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 text-sm">
            <ArrowLeft className="h-4 w-4" />
            Back to Vault
          </Link>

          <Card className="max-w-xl mx-auto p-8 text-center">
            <Shield className="h-16 w-16 mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">Only the contract owner can access this page.</p>
          </Card>
        </main>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 lg:pb-0">
      <Header />
      <TradingViewTicker />
      <HeroBanner title="Vault Admin" subtitle="Manage staking vault settings" />

      <main className="container mx-auto px-4 pt-12 pb-12 flex-1">
        <div className="md:hidden mb-6">
          <WalletCard showQuickFunctionsToggle={false} compact={true} />
        </div>

        <Link to="/dashboard/vault" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 text-sm">
          <ArrowLeft className="h-4 w-4" />
          Back to Vault
        </Link>

        <div className="max-w-6xl mx-auto space-y-6">
          {/* Global Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Vault className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">Total Staked</span>
              </div>
              <p className="text-xl font-bold">
                ${globalStats ? parseFloat(formatEther(globalStats[0])).toLocaleString() : "0"}
              </p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-green-500" />
                <span className="text-xs text-muted-foreground">Rewards Distributed</span>
              </div>
              <p className="text-xl font-bold text-green-500">
                ${globalStats ? parseFloat(formatEther(globalStats[1])).toLocaleString() : "0"}
              </p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Coins className="h-4 w-4 text-blue-500" />
                <span className="text-xs text-muted-foreground">Active Plans</span>
              </div>
              <p className="text-xl font-bold">{planCount?.toString() || "3"}</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                {isPaused ? (
                  <PauseCircle className="h-4 w-4 text-red-500" />
                ) : (
                  <PlayCircle className="h-4 w-4 text-green-500" />
                )}
                <span className="text-xs text-muted-foreground">Status</span>
              </div>
              <Badge className={isPaused ? "bg-red-500/20 text-red-500" : "bg-green-500/20 text-green-500"}>
                {isPaused ? "Paused" : "Active"}
              </Badge>
            </Card>
          </div>

          <Tabs defaultValue="plans" className="w-full">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="plans">
                <Coins className="h-4 w-4 mr-2" />
                Plans
              </TabsTrigger>
              <TabsTrigger value="rewards">
                <DollarSign className="h-4 w-4 mr-2" />
                Reward Pool
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Plans Tab */}
            <TabsContent value="plans" className="mt-4 space-y-4">
              {plans.map((plan) => (
                <Card key={plan.id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-semibold ${plan.color}`}>{plan.name} Plan</h3>
                    <div className="flex items-center gap-3">
                      <Badge className={plan.data?.isActive ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}>
                        {plan.data?.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Switch
                        checked={plan.data?.isActive || false}
                        onCheckedChange={(checked) => handleUpdatePlan(plan.id, checked)}
                        disabled={isPending || isConfirming}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs text-muted-foreground">Stake Range</p>
                      <p className="font-semibold">${parseFloat(plan.data?.minStake || "0").toLocaleString()} - ${parseFloat(plan.data?.maxStake || "0").toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs text-muted-foreground">Daily Rate</p>
                      <p className="font-semibold text-green-500">{plan.data?.dailyRate}%</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs text-muted-foreground">Min PM Hold</p>
                      <p className="font-semibold">{parseFloat(plan.data?.minPmHold || "0").toLocaleString()} PM</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs text-muted-foreground">Pool Size</p>
                      <p className="font-semibold">${parseFloat(plan.data?.currentPoolSize || "0").toLocaleString()} / ${parseFloat(plan.data?.maxPoolSize || "0").toLocaleString()}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>

            {/* Reward Pool Tab */}
            <TabsContent value="rewards" className="mt-4 space-y-4">
              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Fund Reward Pool
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <Button
                      variant={selectedToken === "usdt" ? "default" : "outline"}
                      onClick={() => setSelectedToken("usdt")}
                      className="flex-1"
                    >
                      USDT
                    </Button>
                    <Button
                      variant={selectedToken === "usdc" ? "default" : "outline"}
                      onClick={() => setSelectedToken("usdc")}
                      className="flex-1"
                    >
                      USDC
                    </Button>
                  </div>
                  <div>
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={fundAmount}
                      onChange={(e) => setFundAmount(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <Button
                    onClick={handleFundRewardPool}
                    disabled={isPending || isConfirming}
                    className="w-full"
                  >
                    {(isPending || isConfirming) ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Fund Reward Pool"
                    )}
                  </Button>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary" />
                  Withdraw from Reward Pool
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <Button
                    onClick={handleWithdrawRewardPool}
                    disabled={isPending || isConfirming}
                    variant="outline"
                    className="w-full"
                  >
                    {(isPending || isConfirming) ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Withdraw"
                    )}
                  </Button>
                </div>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="mt-4 space-y-4">
              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <PauseCircle className="h-5 w-5 text-primary" />
                  Contract Status
                </h3>
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium">Contract is {isPaused ? "Paused" : "Active"}</p>
                    <p className="text-sm text-muted-foreground">
                      {isPaused ? "No new stakes allowed" : "Users can stake and claim"}
                    </p>
                  </div>
                  <Button
                    onClick={handlePauseToggle}
                    disabled={isPending || isConfirming}
                    variant={isPaused ? "default" : "destructive"}
                  >
                    {(isPending || isConfirming) ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isPaused ? (
                      <>
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Resume
                      </>
                    ) : (
                      <>
                        <PauseCircle className="h-4 w-4 mr-2" />
                        Pause
                      </>
                    )}
                  </Button>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  Fee Collector
                </h3>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Current Fee Collector</p>
                    <p className="font-mono text-sm truncate">{feeCollector as string || "Not set"}</p>
                  </div>
                  <div>
                    <Label>New Fee Collector Address</Label>
                    <Input
                      placeholder="0x..."
                      value={newFeeCollector}
                      onChange={(e) => setNewFeeCollector(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <Button
                    onClick={handleSetFeeCollector}
                    disabled={isPending || isConfirming}
                    className="w-full"
                  >
                    {(isPending || isConfirming) ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Update Fee Collector"
                    )}
                  </Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default VaultAdmin;