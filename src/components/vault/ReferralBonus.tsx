import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Copy, Gift, CheckCircle, TrendingUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId } from "wagmi";
import { referralABI } from "@/contracts/referralABI";
import { CONTRACT_ADDRESSES, ChainId } from "@/contracts/addresses";
import { formatUnits } from "viem";
import { bsc } from "wagmi/chains";

export const ReferralBonus = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [referralLink, setReferralLink] = useState("");
  
  const currentChainId = (chainId === 56 || chainId === 97 ? chainId : 56) as ChainId;
  const referralAddress = CONTRACT_ADDRESSES[currentChainId]?.PMReferral || "0x0000000000000000000000000000000000000000";

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  // Read referrer info from blockchain
  const { data: referrerInfo, refetch: refetchReferrerInfo } = useReadContract({
    address: referralAddress as `0x${string}`,
    abi: referralABI,
    functionName: "getReferrerInfo",
    args: address ? [address as `0x${string}`] : undefined,
  });

  // Read total platform referrals
  const { data: totalPlatformReferrals } = useReadContract({
    address: referralAddress as `0x${string}`,
    abi: referralABI,
    functionName: "totalReferrals",
  });

  // Read total rewards paid
  const { data: totalRewardsPaid } = useReadContract({
    address: referralAddress as `0x${string}`,
    abi: referralABI,
    functionName: "totalRewardsPaid",
  });

  const stats = {
    totalReferrals: referrerInfo ? Number(referrerInfo[0]) : 0,
    totalEarned: referrerInfo ? Number(formatUnits(referrerInfo[1] as bigint, 18)) : 0,
    availableRewards: referrerInfo ? Number(formatUnits(referrerInfo[2] as bigint, 18)) : 0,
    currentTierRate: referrerInfo ? Number(referrerInfo[3]) / 100 : 5, // Convert basis points to percentage
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success("Rewards claimed successfully!");
      refetchReferrerInfo();
    }
  }, [isSuccess]);

  const generateReferralLink = () => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }
    const code = address.slice(2, 10).toUpperCase();
    const link = `${window.location.origin}/dashboard/vault?ref=${code}`;
    setReferralLink(link);
    toast.success("Referral link generated!");
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Link copied to clipboard!");
  };

  const handleClaimRewards = async () => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet");
      return;
    }

    if (stats.availableRewards < 10) {
      toast.error("Minimum 10 PM tokens required to claim");
      return;
    }

    try {
      writeContract({
        address: referralAddress as `0x${string}`,
        abi: referralABI,
        functionName: "claimRewards",
        chain: bsc,
        account: address,
      });
    } catch (error) {
      console.error("Claim error:", error);
      toast.error("Failed to claim rewards");
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Referral Program
        </h3>
        <Badge className="bg-green-500/20 text-green-500">
          {stats.currentTierRate}% Bonus
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-3 rounded-lg bg-muted/30 text-center">
          <p className="text-2xl font-bold">{stats.totalReferrals}</p>
          <p className="text-xs text-muted-foreground">Total Referrals</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/30 text-center">
          <p className="text-2xl font-bold text-green-500">
            {totalPlatformReferrals ? Number(totalPlatformReferrals).toLocaleString() : "0"}
          </p>
          <p className="text-xs text-muted-foreground">Platform Referrals</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/30 text-center">
          <p className="text-2xl font-bold text-primary">{stats.totalEarned.toFixed(2)} PM</p>
          <p className="text-xs text-muted-foreground">Total Earned</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/30 text-center">
          <p className="text-2xl font-bold text-yellow-500">{stats.availableRewards.toFixed(2)} PM</p>
          <p className="text-xs text-muted-foreground">Pending Bonus</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Your Referral Link</label>
          <div className="flex gap-2">
            <Input
              value={referralLink}
              readOnly
              placeholder="Generate your referral link"
              className="font-mono text-sm"
            />
            {referralLink ? (
              <Button variant="outline" onClick={copyToClipboard}>
                <Copy className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={generateReferralLink}>
                Generate
              </Button>
            )}
          </div>
        </div>

        <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/30">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Gift className="h-4 w-4 text-primary" />
            How It Works
          </h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              Share your referral link with friends
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              Earn {stats.currentTierRate}% bonus on their staking transactions
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              Higher tier rates: 5% (Bronze) → 7.5% (Silver) → 10% (Gold) → 15% (Platinum)
            </li>
            <li className="flex items-start gap-2">
              <TrendingUp className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              No limit on referral earnings!
            </li>
          </ul>
        </div>

        {stats.availableRewards >= 10 && (
          <Button 
            className="w-full" 
            onClick={handleClaimRewards}
            disabled={isPending || isConfirming}
          >
            {(isPending || isConfirming) ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Claiming...
              </>
            ) : (
              `Claim ${stats.availableRewards.toFixed(2)} PM Bonus`
            )}
          </Button>
        )}
      </div>
    </Card>
  );
};
