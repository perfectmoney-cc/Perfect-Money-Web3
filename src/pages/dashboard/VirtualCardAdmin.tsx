import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Settings, CreditCard, Users, DollarSign, Loader2, Shield, Crown, Star, Gem, Award, Medal, RefreshCw, ExternalLink, Snowflake, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { bsc } from "wagmi/chains";
import { toast } from "sonner";
import { formatEther, parseEther } from "viem";
import { VIRTUAL_CARD_ABI, VIRTUAL_CARD_CONTRACT_ADDRESS } from "@/contracts/virtualCardABI";
import { useVirtualCardTransactions } from "@/hooks/useVirtualCardTransactions";
import { Skeleton } from "@/components/ui/skeleton";

const tierNames = ["Novice", "Bronze", "Silver", "Gold", "Platinum", "Diamond"];
const tierIcons = [Medal, Award, Star, Crown, Gem, Shield];

const VirtualCardAdmin = () => {
  const { address, isConnected } = useAccount();
  const [topUpFeeInput, setTopUpFeeInput] = useState("");
  const [selectedTier, setSelectedTier] = useState(0);
  const [tierSettings, setTierSettings] = useState({
    minBalance: "",
    dailyLimit: "",
    monthlyLimit: "",
    cashbackRate: "",
    isActive: true
  });

  const { cardEvents, isLoading: eventsLoading, refetch: refetchEvents } = useVirtualCardTransactions();

  // Read global stats
  const { data: globalStats, refetch: refetchStats } = useReadContract({
    address: VIRTUAL_CARD_CONTRACT_ADDRESS as `0x${string}`,
    abi: VIRTUAL_CARD_ABI,
    functionName: "getGlobalStats",
  });

  // Read contract owner
  const { data: owner } = useReadContract({
    address: VIRTUAL_CARD_CONTRACT_ADDRESS as `0x${string}`,
    abi: VIRTUAL_CARD_ABI,
    functionName: "owner",
  });

  // Read current top-up fee
  const { data: currentFee } = useReadContract({
    address: VIRTUAL_CARD_CONTRACT_ADDRESS as `0x${string}`,
    abi: VIRTUAL_CARD_ABI,
    functionName: "topUpFee",
  });

  // Read tier info
  const { data: tierInfo, refetch: refetchTier } = useReadContract({
    address: VIRTUAL_CARD_CONTRACT_ADDRESS as `0x${string}`,
    abi: VIRTUAL_CARD_ABI,
    functionName: "getTierInfo",
    args: [selectedTier as number],
  });

  // Read paused state
  const { data: isPaused } = useReadContract({
    address: VIRTUAL_CARD_CONTRACT_ADDRESS as `0x${string}`,
    abi: VIRTUAL_CARD_ABI,
    functionName: "paused",
  });

  // Contract writes
  const { writeContract: setTopUpFee, data: feeHash, isPending: isSettingFee } = useWriteContract();
  const { writeContract: pauseContract, data: pauseHash, isPending: isPausing } = useWriteContract();
  const { writeContract: unpauseContract, data: unpauseHash, isPending: isUnpausing } = useWriteContract();
  const { writeContract: freezeCard, data: freezeHash, isPending: isFreezing } = useWriteContract();
  const { writeContract: unfreezeCard, data: unfreezeHash, isPending: isUnfreezing } = useWriteContract();

  // Transaction receipts
  const { isSuccess: feeSuccess } = useWaitForTransactionReceipt({ hash: feeHash });
  const { isSuccess: pauseSuccess } = useWaitForTransactionReceipt({ hash: pauseHash });
  const { isSuccess: unpauseSuccess } = useWaitForTransactionReceipt({ hash: unpauseHash });
  const { isSuccess: freezeSuccess } = useWaitForTransactionReceipt({ hash: freezeHash });
  const { isSuccess: unfreezeSuccess } = useWaitForTransactionReceipt({ hash: unfreezeHash });

  useEffect(() => {
    if (tierInfo) {
      setTierSettings({
        minBalance: formatEther(tierInfo.minBalance || BigInt(0)),
        dailyLimit: formatEther(tierInfo.dailyLimit || BigInt(0)),
        monthlyLimit: formatEther(tierInfo.monthlyLimit || BigInt(0)),
        cashbackRate: ((tierInfo.cashbackRate || BigInt(0)) / BigInt(100)).toString(),
        isActive: tierInfo.isActive || false
      });
    }
  }, [tierInfo]);

  useEffect(() => {
    if (feeSuccess) {
      toast.success("Top-up fee updated successfully!");
      refetchStats();
    }
    if (pauseSuccess || unpauseSuccess) {
      toast.success(pauseSuccess ? "Contract paused" : "Contract unpaused");
    }
    if (freezeSuccess) {
      toast.success("Card frozen successfully!");
      refetchEvents();
    }
    if (unfreezeSuccess) {
      toast.success("Card unfrozen successfully!");
      refetchEvents();
    }
  }, [feeSuccess, pauseSuccess, unpauseSuccess, freezeSuccess, unfreezeSuccess]);

  const handleSetFee = () => {
    if (!topUpFeeInput || isNaN(Number(topUpFeeInput))) {
      toast.error("Please enter a valid fee percentage");
      return;
    }
    const feeInBasisPoints = BigInt(Math.floor(Number(topUpFeeInput) * 100));
    setTopUpFee({
      address: VIRTUAL_CARD_CONTRACT_ADDRESS as `0x${string}`,
      abi: VIRTUAL_CARD_ABI,
      functionName: "setTopUpFee",
      args: [feeInBasisPoints],
      account: address,
      chain: bsc
    });
  };

  const handlePauseToggle = () => {
    if (isPaused) {
      unpauseContract({
        address: VIRTUAL_CARD_CONTRACT_ADDRESS as `0x${string}`,
        abi: VIRTUAL_CARD_ABI,
        functionName: "unpause",
        account: address,
        chain: bsc
      });
    } else {
      pauseContract({
        address: VIRTUAL_CARD_CONTRACT_ADDRESS as `0x${string}`,
        abi: VIRTUAL_CARD_ABI,
        functionName: "pause",
        account: address,
        chain: bsc
      });
    }
  };

  const handleFreezeCard = (userAddress: string) => {
    freezeCard({
      address: VIRTUAL_CARD_CONTRACT_ADDRESS as `0x${string}`,
      abi: VIRTUAL_CARD_ABI,
      functionName: "freezeCard",
      args: [userAddress as `0x${string}`],
      account: address,
      chain: bsc
    });
  };

  const handleUnfreezeCard = (userAddress: string) => {
    unfreezeCard({
      address: VIRTUAL_CARD_CONTRACT_ADDRESS as `0x${string}`,
      abi: VIRTUAL_CARD_ABI,
      functionName: "unfreezeCard",
      args: [userAddress as `0x${string}`],
      account: address,
      chain: bsc
    });
  };

  const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const isOwner = owner?.toLowerCase() === address?.toLowerCase();
  const totalCards = globalStats ? Number(globalStats[0]) : 0;
  const totalDeposits = globalStats ? Number(formatEther(globalStats[1])) : 0;
  const topUpFee = currentFee ? Number(currentFee) / 100 : 0;

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-bold mb-2">Connect Wallet</h2>
          <p className="text-muted-foreground">Please connect your wallet to access admin panel</p>
        </Card>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-destructive" />
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">Only contract owner can access this page</p>
          <Link to="/dashboard/virtual-card">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Virtual Card
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/dashboard/virtual-card">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Settings className="h-6 w-6 text-primary" />
              Virtual Card Admin
            </h1>
            <p className="text-muted-foreground text-sm">Manage tiers, fees, and cards</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Total Cards</p>
                  <p className="text-xl font-bold">{totalCards.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <DollarSign className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Total Deposits</p>
                  <p className="text-xl font-bold">{totalDeposits.toLocaleString()} PM</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <CreditCard className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Top-up Fee</p>
                  <p className="text-xl font-bold">{topUpFee}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isPaused ? 'bg-destructive/10' : 'bg-green-500/10'}`}>
                  <Shield className={`h-5 w-5 ${isPaused ? 'text-destructive' : 'text-green-500'}`} />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Status</p>
                  <p className={`text-xl font-bold ${isPaused ? 'text-destructive' : 'text-green-500'}`}>
                    {isPaused ? 'Paused' : 'Active'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="cards" className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="cards">All Cards</TabsTrigger>
            <TabsTrigger value="settings">Fee Settings</TabsTrigger>
            <TabsTrigger value="tiers">Tier Management</TabsTrigger>
          </TabsList>

          <TabsContent value="cards">
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    All Virtual Cards (Blockchain Events)
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => refetchEvents()} disabled={eventsLoading}>
                    <RefreshCw className={`h-4 w-4 ${eventsLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Owner Address</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Block</TableHead>
                      <TableHead>Transaction</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {eventsLoading ? (
                      [1, 2, 3].map((i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        </TableRow>
                      ))
                    ) : cardEvents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          No card creation events found on blockchain
                        </TableCell>
                      </TableRow>
                    ) : (
                      cardEvents.map((event, index) => (
                        <TableRow key={`${event.txHash}-${index}`}>
                          <TableCell className="font-mono text-sm">
                            {event.user ? truncateAddress(event.user) : "Unknown"}
                          </TableCell>
                          <TableCell>
                            <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                              {tierNames[event.tier] || "Novice"}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            #{event.blockNumber?.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <a
                              href={`https://bscscan.com/tx/${event.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline inline-flex items-center gap-1 text-sm"
                            >
                              {event.txHash ? truncateAddress(event.txHash) : "N/A"}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleFreezeCard(event.user)}
                                disabled={isFreezing}
                                className="gap-1 text-blue-500 border-blue-500/30 hover:bg-blue-500/10"
                              >
                                {isFreezing ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Snowflake className="h-3 w-3" />
                                )}
                                Freeze
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUnfreezeCard(event.user)}
                                disabled={isUnfreezing}
                                className="gap-1 text-yellow-500 border-yellow-500/30 hover:bg-yellow-500/10"
                              >
                                {isUnfreezing ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Sun className="h-3 w-3" />
                                )}
                                Unfreeze
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Top-up Fee Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Current Fee</Label>
                    <p className="text-2xl font-bold text-primary">{topUpFee}%</p>
                  </div>
                  <div className="space-y-2">
                    <Label>New Fee Percentage</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="e.g., 2.5"
                        value={topUpFeeInput}
                        onChange={(e) => setTopUpFeeInput(e.target.value)}
                        className="bg-muted/50"
                      />
                      <Button onClick={handleSetFee} disabled={isSettingFee}>
                        {isSettingFee ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Contract Controls
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">Contract Status</p>
                      <p className="text-sm text-muted-foreground">
                        {isPaused ? "Contract is paused" : "Contract is active"}
                      </p>
                    </div>
                    <Switch
                      checked={!isPaused}
                      onCheckedChange={handlePauseToggle}
                      disabled={isPausing || isUnpausing}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tiers">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-card border-border md:col-span-1">
                <CardHeader>
                  <CardTitle className="text-sm">Select Tier</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {tierNames.map((name, index) => {
                    const Icon = tierIcons[index];
                    return (
                      <button
                        key={name}
                        onClick={() => {
                          setSelectedTier(index);
                          refetchTier();
                        }}
                        className={`w-full p-3 rounded-lg flex items-center gap-3 transition-colors ${
                          selectedTier === index
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted/50 hover:bg-muted"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{name}</span>
                      </button>
                    );
                  })}
                </CardContent>
              </Card>

              <Card className="bg-card border-border md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {(() => {
                      const Icon = tierIcons[selectedTier];
                      return <Icon className="h-5 w-5 text-primary" />;
                    })()}
                    {tierNames[selectedTier]} Tier Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Minimum Balance (PM)</Label>
                      <Input value={tierSettings.minBalance} className="bg-muted/50" disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Daily Limit (PM)</Label>
                      <Input value={tierSettings.dailyLimit} className="bg-muted/50" disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Monthly Limit (PM)</Label>
                      <Input value={tierSettings.monthlyLimit} className="bg-muted/50" disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Cashback Rate (%)</Label>
                      <Input value={tierSettings.cashbackRate} className="bg-muted/50" disabled />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Tier settings are read-only from the contract.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VirtualCardAdmin;
