import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/Header";
import { TradingViewTicker } from "@/components/TradingViewTicker";
import { HeroBanner } from "@/components/HeroBanner";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Footer } from "@/components/Footer";
import {
  ArrowLeft,
  Settings,
  DollarSign,
  Users,
  Loader2,
  Shield,
  AlertTriangle,
  Wallet,
  Save,
  RefreshCw,
  Coins,
  BarChart3,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatUnits, parseUnits, formatEther, parseEther } from 'viem';
import { AIRDROP_ABI } from "@/contracts/airdropABI";
import { CONTRACT_ADDRESSES } from "@/contracts/addresses";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PMAIRDROP_ADDRESS = CONTRACT_ADDRESSES[56].PMAirdrop as `0x${string}`;

const AirdropAdminPage = () => {
  const { address, isConnected } = useAccount();
  const [claimFee, setClaimFee] = useState("0.0005");
  const [networkFee, setNetworkFee] = useState("0.0005");
  const [feeCollectorAddress, setFeeCollectorAddress] = useState("");
  const [maxClaimableValue, setMaxClaimableValue] = useState("");
  const [totalRewardValue, setTotalRewardValue] = useState("");

  const isContractDeployed = PMAIRDROP_ADDRESS !== "0x0000000000000000000000000000000000000000";

  // Read contract owner
  const { data: contractOwner } = useReadContract({
    address: PMAIRDROP_ADDRESS,
    abi: AIRDROP_ABI,
    functionName: 'owner',
    chainId: 56,
    query: { enabled: isContractDeployed }
  });

  const isOwner = address && contractOwner && address.toLowerCase() === (contractOwner as string).toLowerCase();

  // Read fees
  const { data: claimFeeBNB, refetch: refetchClaimFee } = useReadContract({
    address: PMAIRDROP_ADDRESS,
    abi: AIRDROP_ABI,
    functionName: 'claimFeeBNB',
    chainId: 56,
    query: { enabled: isContractDeployed }
  });

  const { data: networkFeeBNB, refetch: refetchNetworkFee } = useReadContract({
    address: PMAIRDROP_ADDRESS,
    abi: AIRDROP_ABI,
    functionName: 'networkFeeBNB',
    chainId: 56,
    query: { enabled: isContractDeployed }
  });

  const { data: feeCollector, refetch: refetchFeeCollector } = useReadContract({
    address: PMAIRDROP_ADDRESS,
    abi: AIRDROP_ABI,
    functionName: 'feeCollector',
    chainId: 56,
    query: { enabled: isContractDeployed }
  });

  const { data: totalReward, refetch: refetchTotalReward } = useReadContract({
    address: PMAIRDROP_ADDRESS,
    abi: AIRDROP_ABI,
    functionName: 'totalReward',
    chainId: 56,
    query: { enabled: isContractDeployed }
  });

  const { data: maxClaimable, refetch: refetchMaxClaimable } = useReadContract({
    address: PMAIRDROP_ADDRESS,
    abi: AIRDROP_ABI,
    functionName: 'maxClaimable',
    chainId: 56,
    query: { enabled: isContractDeployed }
  });

  const { data: totalClaimed, refetch: refetchTotalClaimed } = useReadContract({
    address: PMAIRDROP_ADDRESS,
    abi: AIRDROP_ABI,
    functionName: 'totalClaimed',
    chainId: 56,
    query: { enabled: isContractDeployed }
  });

  // Write contract
  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  // Update local state from contract data
  useEffect(() => {
    if (claimFeeBNB) {
      setClaimFee(formatEther(claimFeeBNB as bigint));
    }
  }, [claimFeeBNB]);

  useEffect(() => {
    if (networkFeeBNB) {
      setNetworkFee(formatEther(networkFeeBNB as bigint));
    }
  }, [networkFeeBNB]);

  useEffect(() => {
    if (feeCollector) {
      setFeeCollectorAddress(feeCollector as string);
    }
  }, [feeCollector]);

  useEffect(() => {
    if (totalReward) {
      setTotalRewardValue(formatUnits(totalReward as bigint, 18));
    }
  }, [totalReward]);

  useEffect(() => {
    if (maxClaimable) {
      setMaxClaimableValue(formatUnits(maxClaimable as bigint, 18));
    }
  }, [maxClaimable]);

  // Refresh on confirmation
  useEffect(() => {
    if (isConfirmed) {
      toast.success("Transaction confirmed!");
      refetchClaimFee();
      refetchNetworkFee();
      refetchFeeCollector();
      refetchTotalReward();
      refetchMaxClaimable();
      refetchTotalClaimed();
    }
  }, [isConfirmed]);

  const refetchAll = () => {
    refetchClaimFee();
    refetchNetworkFee();
    refetchFeeCollector();
    refetchTotalReward();
    refetchMaxClaimable();
    refetchTotalClaimed();
    toast.success("Data refreshed!");
  };

  // Admin actions
  const handleSetClaimFee = () => {
    if (!isOwner) return toast.error("Only owner can perform this action");
    const feeInWei = parseEther(claimFee || "0");
    writeContract({
      address: PMAIRDROP_ADDRESS,
      abi: AIRDROP_ABI,
      functionName: 'setClaimFeeBNB',
      args: [feeInWei],
      chainId: 56,
    } as any);
  };

  const handleSetNetworkFee = () => {
    if (!isOwner) return toast.error("Only owner can perform this action");
    const feeInWei = parseEther(networkFee || "0");
    writeContract({
      address: PMAIRDROP_ADDRESS,
      abi: AIRDROP_ABI,
      functionName: 'setNetworkFeeBNB',
      args: [feeInWei],
      chainId: 56,
    } as any);
  };

  const handleSetFeeCollector = () => {
    if (!isOwner) return toast.error("Only owner can perform this action");
    if (!feeCollectorAddress.startsWith("0x") || feeCollectorAddress.length !== 42) {
      return toast.error("Invalid address");
    }
    writeContract({
      address: PMAIRDROP_ADDRESS,
      abi: AIRDROP_ABI,
      functionName: 'setFeeCollector',
      args: [feeCollectorAddress as `0x${string}`],
      chainId: 56,
    } as any);
  };

  const handleSetTotalReward = () => {
    if (!isOwner) return toast.error("Only owner can perform this action");
    const rewardInWei = parseUnits(totalRewardValue || "0", 18);
    writeContract({
      address: PMAIRDROP_ADDRESS,
      abi: AIRDROP_ABI,
      functionName: 'setTotalReward',
      args: [rewardInWei],
      chainId: 56,
    } as any);
  };

  const handleSetMaxClaimable = () => {
    if (!isOwner) return toast.error("Only owner can perform this action");
    const maxInWei = parseUnits(maxClaimableValue || "0", 18);
    writeContract({
      address: PMAIRDROP_ADDRESS,
      abi: AIRDROP_ABI,
      functionName: 'setMaxClaimable',
      args: [maxInWei],
      chainId: 56,
    } as any);
  };

  const handleWithdrawTokens = () => {
    if (!isOwner) return toast.error("Only owner can perform this action");
    const remainingTokens = maxClaimable && totalClaimed 
      ? (maxClaimable as bigint) - (totalClaimed as bigint) 
      : BigInt(0);
    if (remainingTokens <= BigInt(0)) {
      return toast.error("No tokens to withdraw");
    }
    writeContract({
      address: PMAIRDROP_ADDRESS,
      abi: AIRDROP_ABI,
      functionName: 'withdrawTokens',
      args: [remainingTokens],
      chainId: 56,
    } as any);
  };

  // Format display values
  const totalClaimedFormatted = totalClaimed ? formatUnits(totalClaimed as bigint, 18) : "0";
  const maxClaimableFormatted = maxClaimable ? formatUnits(maxClaimable as bigint, 18) : "0";
  const totalRewardFormatted = totalReward ? formatUnits(totalReward as bigint, 18) : "0";
  const remainingTokens = maxClaimable && totalClaimed 
    ? Number(maxClaimableFormatted) - Number(totalClaimedFormatted)
    : 0;

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex flex-col pb-20 lg:pb-0">
        <Header />
        <TradingViewTicker />
        <HeroBanner title="Airdrop Admin" subtitle="Manage airdrop settings" />
        <main className="container mx-auto px-4 pt-12 pb-12 flex-1">
          <Card className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Wallet Not Connected</h2>
            <p className="text-muted-foreground">Please connect your wallet to access the admin panel.</p>
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
        <HeroBanner title="Airdrop Admin" subtitle="Manage airdrop settings" />
        <main className="container mx-auto px-4 pt-12 pb-12 flex-1">
          <Link to="/dashboard/airdrop" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 text-sm">
            <ArrowLeft className="h-4 w-4" />
            Back to Airdrop
          </Link>
          <Card className="p-8 text-center">
            <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-2">Only the contract owner can access the admin panel.</p>
            <p className="text-xs text-muted-foreground">Contract Owner: {contractOwner as string}</p>
            <p className="text-xs text-muted-foreground">Your Address: {address}</p>
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
      <HeroBanner title="Airdrop Admin Panel" subtitle="Manage airdrop settings for the new contract" />
      
      <main className="container mx-auto px-4 pt-12 pb-12 flex-1">
        <div className="flex items-center justify-between mb-6">
          <Link to="/dashboard/airdrop" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm">
            <ArrowLeft className="h-4 w-4" />
            Back to Airdrop
          </Link>
          <Button variant="outline" size="sm" onClick={refetchAll} disabled={isPending || isConfirming}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isConfirming ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="h-4 w-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Total Reward</span>
            </div>
            <p className="text-lg font-bold">{Number(totalRewardFormatted).toLocaleString()} PM</p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/30">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-4 w-4 text-blue-500" />
              <span className="text-xs text-muted-foreground">Max Claimable</span>
            </div>
            <p className="text-lg font-bold">{Number(maxClaimableFormatted).toLocaleString()} PM</p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-purple-500" />
              <span className="text-xs text-muted-foreground">Total Claimed</span>
            </div>
            <p className="text-lg font-bold">{Number(totalClaimedFormatted).toLocaleString()} PM</p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="h-4 w-4 text-orange-500" />
              <span className="text-xs text-muted-foreground">Remaining</span>
            </div>
            <p className="text-lg font-bold">{remainingTokens.toLocaleString()} PM</p>
          </Card>
        </div>

        <Tabs defaultValue="fees" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="fees">Fee Settings</TabsTrigger>
            <TabsTrigger value="rewards">Reward Settings</TabsTrigger>
          </TabsList>

          {/* Fee Settings Tab */}
          <TabsContent value="fees">
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Fee Configuration
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Claim Fee (BNB)</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="number"
                        step="0.0001"
                        value={claimFee}
                        onChange={(e) => setClaimFee(e.target.value)}
                        placeholder="0.0005"
                      />
                      <Button onClick={handleSetClaimFee} disabled={isPending || isConfirming}>
                        {isPending || isConfirming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Fee charged when claiming all tasks</p>
                  </div>
                  <div>
                    <Label>Network Fee (BNB)</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="number"
                        step="0.0001"
                        value={networkFee}
                        onChange={(e) => setNetworkFee(e.target.value)}
                        placeholder="0.0005"
                      />
                      <Button onClick={handleSetNetworkFee} disabled={isPending || isConfirming}>
                        {isPending || isConfirming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Additional network fee in BNB</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label>Fee Collector Address</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        value={feeCollectorAddress}
                        onChange={(e) => setFeeCollectorAddress(e.target.value)}
                        placeholder="0x..."
                      />
                      <Button onClick={handleSetFeeCollector} disabled={isPending || isConfirming}>
                        {isPending || isConfirming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Address that receives collected fees</p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Reward Settings Tab */}
          <TabsContent value="rewards">
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Reward Configuration
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Total Reward (PM per user)</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="number"
                        value={totalRewardValue}
                        onChange={(e) => setTotalRewardValue(e.target.value)}
                        placeholder="100000"
                      />
                      <Button onClick={handleSetTotalReward} disabled={isPending || isConfirming}>
                        {isPending || isConfirming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">PM tokens given per user after completing all 9 tasks</p>
                  </div>
                  <div>
                    <Label>Max Claimable Total (PM)</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="number"
                        value={maxClaimableValue}
                        onChange={(e) => setMaxClaimableValue(e.target.value)}
                        placeholder="10000000"
                      />
                      <Button onClick={handleSetMaxClaimable} disabled={isPending || isConfirming}>
                        {isPending || isConfirming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Total PM tokens available in airdrop pool</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label>Withdraw Remaining Tokens</Label>
                    <Button 
                      onClick={handleWithdrawTokens} 
                      disabled={isPending || isConfirming || remainingTokens <= 0} 
                      className="w-full mt-1" 
                      variant="outline"
                    >
                      {isPending || isConfirming ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Wallet className="h-4 w-4 mr-2" />
                      )}
                      Withdraw {remainingTokens.toLocaleString()} PM
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">Emergency withdraw unclaimed tokens</p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Contract Info */}
        <Card className="mt-6 p-4 bg-muted/50">
          <h4 className="font-medium mb-2">Contract Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <p><span className="text-muted-foreground">Contract:</span> {PMAIRDROP_ADDRESS}</p>
            <p><span className="text-muted-foreground">Owner:</span> {contractOwner as string}</p>
            <p><span className="text-muted-foreground">Claim Fee:</span> {formatEther(claimFeeBNB as bigint || BigInt(0))} BNB</p>
            <p><span className="text-muted-foreground">Network Fee:</span> {formatEther(networkFeeBNB as bigint || BigInt(0))} BNB</p>
          </div>
        </Card>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default AirdropAdminPage;
