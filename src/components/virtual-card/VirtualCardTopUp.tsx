import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Wallet, ArrowUpCircle, Loader2, RefreshCw, ExternalLink, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useBalance } from "wagmi";
import { bsc } from "wagmi/chains";
import { toast } from "sonner";
import { formatEther, parseEther, formatUnits } from "viem";
import { VIRTUAL_CARD_ABI, VIRTUAL_CARD_CONTRACT_ADDRESS } from "@/contracts/virtualCardABI";
import { PM_TOKEN_ADDRESS } from "@/contracts/addresses";
import { PMTokenABI } from "@/contracts/abis";
import pmLogo from "@/assets/pm-logo-new.png";

interface TopUpEvent {
  user: string;
  amount: bigint;
  newBalance: bigint;
  timestamp: bigint;
  txHash: string;
  blockNumber: number;
}

const VirtualCardTopUp = () => {
  const { address, isConnected } = useAccount();
  const [topUpAmount, setTopUpAmount] = useState("");
  const [topUpHistory, setTopUpHistory] = useState<TopUpEvent[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Read PM token balance
  const { data: pmBalance, refetch: refetchPmBalance } = useReadContract({
    address: PM_TOKEN_ADDRESS as `0x${string}`,
    abi: PMTokenABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  // Read card balance
  const { data: cardInfo, refetch: refetchCardInfo } = useReadContract({
    address: VIRTUAL_CARD_CONTRACT_ADDRESS as `0x${string}`,
    abi: VIRTUAL_CARD_ABI,
    functionName: "getCardInfo",
    args: address ? [address] : undefined,
  });

  // Read PM token allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: PM_TOKEN_ADDRESS as `0x${string}`,
    abi: PMTokenABI,
    functionName: "allowance",
    args: address ? [address, VIRTUAL_CARD_CONTRACT_ADDRESS as `0x${string}`] : undefined,
  });

  // Read top-up fee
  const { data: topUpFee } = useReadContract({
    address: VIRTUAL_CARD_CONTRACT_ADDRESS as `0x${string}`,
    abi: VIRTUAL_CARD_ABI,
    functionName: "topUpFee",
  });

  // Approve PM tokens
  const { writeContract: approveTokens, data: approveHash, isPending: isApproving } = useWriteContract();
  const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  // Top up card
  const { writeContract: topUpCard, data: topUpHash, isPending: isTopUp } = useWriteContract();
  const { isLoading: isTopUpConfirming, isSuccess: isTopUpSuccess } = useWaitForTransactionReceipt({
    hash: topUpHash,
  });

  useEffect(() => {
    if (isApproveSuccess) {
      toast.success("PM tokens approved! Proceeding with top-up...");
      executeTopUp();
    }
  }, [isApproveSuccess]);

  useEffect(() => {
    if (isTopUpSuccess) {
      toast.success("Virtual card topped up successfully!");
      setTopUpAmount("");
      refetchPmBalance();
      refetchCardInfo();
      refetchAllowance();
      loadTopUpHistory();
    }
  }, [isTopUpSuccess]);

  // Load top-up history from mock data (would be from blockchain events in production)
  const loadTopUpHistory = async () => {
    setIsLoadingHistory(true);
    // Simulate loading blockchain events
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Mock data - in production, fetch from blockchain events
    const mockHistory: TopUpEvent[] = address ? [
      {
        user: address,
        amount: parseEther("100"),
        newBalance: parseEther("100"),
        timestamp: BigInt(Date.now() / 1000 - 86400),
        txHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        blockNumber: 12345678,
      },
      {
        user: address,
        amount: parseEther("250"),
        newBalance: parseEther("350"),
        timestamp: BigInt(Date.now() / 1000 - 172800),
        txHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef12345678",
        blockNumber: 12345000,
      },
    ] : [];
    
    setTopUpHistory(mockHistory);
    setIsLoadingHistory(false);
  };

  useEffect(() => {
    if (isConnected && address) {
      loadTopUpHistory();
    }
  }, [isConnected, address]);

  const executeTopUp = () => {
    if (!topUpAmount || !address) return;

    const amountInWei = parseEther(topUpAmount);
    
    topUpCard({
      address: VIRTUAL_CARD_CONTRACT_ADDRESS as `0x${string}`,
      abi: VIRTUAL_CARD_ABI,
      functionName: "topUp",
      args: [amountInWei],
      account: address,
      chain: bsc,
    });
  };

  const handleTopUp = () => {
    if (!topUpAmount || isNaN(Number(topUpAmount)) || Number(topUpAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    const amountInWei = parseEther(topUpAmount);
    const currentBalance = pmBalance as bigint || BigInt(0);
    const currentAllowance = allowance as bigint || BigInt(0);

    if (currentBalance < amountInWei) {
      toast.error("Insufficient PM token balance");
      return;
    }

    // Check if we need to approve first
    if (currentAllowance < amountInWei) {
      toast.info("Approving PM tokens for top-up...");
      approveTokens({
        address: PM_TOKEN_ADDRESS as `0x${string}`,
        abi: PMTokenABI,
        functionName: "approve",
        args: [VIRTUAL_CARD_CONTRACT_ADDRESS as `0x${string}`, amountInWei],
        account: address,
        chain: bsc,
      });
    } else {
      executeTopUp();
    }
  };

  const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  const pmBalanceFormatted = pmBalance ? Number(formatEther(pmBalance as bigint)).toFixed(2) : "0";
  const cardBalance = cardInfo ? Number(formatEther((cardInfo as any).balance || BigInt(0))).toFixed(2) : "0";
  const feePercentage = topUpFee ? Number(topUpFee) / 100 : 2;
  const feeAmount = topUpAmount ? (Number(topUpAmount) * feePercentage / 100).toFixed(4) : "0";
  const netAmount = topUpAmount ? (Number(topUpAmount) - Number(feeAmount)).toFixed(4) : "0";

  const isProcessing = isApproving || isApproveConfirming || isTopUp || isTopUpConfirming;

  if (!isConnected) {
    return (
      <Card className="p-8 text-center">
        <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-xl font-bold mb-2">Connect Wallet</h2>
        <p className="text-muted-foreground">Please connect your wallet to top up your virtual card</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Up Section */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpCircle className="h-5 w-5 text-primary" />
            Top Up Virtual Card
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Balances */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">PM Wallet Balance</p>
              <div className="flex items-center gap-2">
                <img src={pmLogo} alt="PM" className="h-5 w-5" />
                <span className="text-xl font-bold">{pmBalanceFormatted} PM</span>
              </div>
            </div>
            <div className="p-4 bg-primary/10 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Card Balance</p>
              <div className="flex items-center gap-2">
                <img src={pmLogo} alt="PM" className="h-5 w-5" />
                <span className="text-xl font-bold text-primary">{cardBalance} PM</span>
              </div>
            </div>
          </div>

          {/* Top Up Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Amount to Top Up (PM)</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
                className="bg-muted/50"
              />
            </div>

            {topUpAmount && Number(topUpAmount) > 0 && (
              <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Top-up Amount</span>
                  <span>{topUpAmount} PM</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Fee ({feePercentage}%)</span>
                  <span className="text-destructive">-{feeAmount} PM</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between font-medium">
                  <span>You'll Receive</span>
                  <span className="text-primary">{netAmount} PM</span>
                </div>
              </div>
            )}

            {/* Quick Amount Buttons */}
            <div className="flex flex-wrap gap-2">
              {[50, 100, 250, 500, 1000].map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  onClick={() => setTopUpAmount(amount.toString())}
                  className="flex-1 min-w-[60px]"
                >
                  {amount}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTopUpAmount(pmBalanceFormatted)}
                className="flex-1 min-w-[60px]"
              >
                MAX
              </Button>
            </div>

            <Button
              onClick={handleTopUp}
              disabled={isProcessing || !topUpAmount}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isApproving || isApproveConfirming ? "Approving..." : "Processing..."}
                </>
              ) : (
                <>
                  <ArrowUpCircle className="h-4 w-4 mr-2" />
                  Top Up Card
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Top-Up History
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadTopUpHistory}
              disabled={isLoadingHistory}
            >
              <RefreshCw className={`h-4 w-4 ${isLoadingHistory ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>New Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Transaction</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingHistory ? (
                [1, 2, 3].map((i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  </TableRow>
                ))
              ) : topUpHistory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    No top-up history found
                  </TableCell>
                </TableRow>
              ) : (
                topUpHistory.map((event, index) => (
                  <TableRow key={`${event.txHash}-${index}`}>
                    <TableCell className="text-sm">
                      {formatDate(event.timestamp)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <img src={pmLogo} alt="PM" className="h-4 w-4" />
                        <span className="font-medium text-green-500">
                          +{Number(formatEther(event.amount)).toFixed(2)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">
                        {Number(formatEther(event.newBalance)).toFixed(2)} PM
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <a
                        href={`https://bscscan.com/tx/${event.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1 text-sm"
                      >
                        {truncateAddress(event.txHash)}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default VirtualCardTopUp;
