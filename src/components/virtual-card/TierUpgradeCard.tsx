import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Medal, Award, Star, Crown, Gem, Shield, ArrowUp, Loader2, Check, Lock } from "lucide-react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { bsc } from "wagmi/chains";
import { toast } from "sonner";
import { formatEther, parseEther } from "viem";
import { VIRTUAL_CARD_ABI, VIRTUAL_CARD_CONTRACT_ADDRESS } from "@/contracts/virtualCardABI";

const tierNames = ["Novice", "Bronze", "Silver", "Gold", "Platinum", "Diamond"];
const tierIcons = [Medal, Award, Star, Crown, Gem, Shield];
const tierColors = ["text-gray-400", "text-amber-600", "text-gray-300", "text-yellow-500", "text-blue-400", "text-purple-500"];
const tierBgColors = ["bg-gray-500/10", "bg-amber-600/10", "bg-gray-300/10", "bg-yellow-500/10", "bg-blue-400/10", "bg-purple-500/10"];

interface TierBenefit {
  cashback: string;
  dailyLimit: string;
  monthlyLimit: string;
  minBalance: string;
}

const tierBenefits: TierBenefit[] = [
  { cashback: "0.5%", dailyLimit: "500 PM", monthlyLimit: "5,000 PM", minBalance: "0 PM" },
  { cashback: "1%", dailyLimit: "1,000 PM", monthlyLimit: "15,000 PM", minBalance: "100 PM" },
  { cashback: "1.5%", dailyLimit: "2,500 PM", monthlyLimit: "50,000 PM", minBalance: "500 PM" },
  { cashback: "2%", dailyLimit: "5,000 PM", monthlyLimit: "100,000 PM", minBalance: "2,000 PM" },
  { cashback: "2.5%", dailyLimit: "10,000 PM", monthlyLimit: "250,000 PM", minBalance: "10,000 PM" },
  { cashback: "3%", dailyLimit: "Unlimited", monthlyLimit: "Unlimited", minBalance: "50,000 PM" },
];

interface TierUpgradeCardProps {
  currentTier: number;
  totalDeposited: number;
  hasCard: boolean;
}

const TierUpgradeCard = ({ currentTier, totalDeposited, hasCard }: TierUpgradeCardProps) => {
  const { address, isConnected } = useAccount();
  const [selectedTier, setSelectedTier] = useState<number | null>(null);

  // Get next tier requirement
  const { data: nextTierReq } = useReadContract({
    address: VIRTUAL_CARD_CONTRACT_ADDRESS as `0x${string}`,
    abi: VIRTUAL_CARD_ABI,
    functionName: "getNextTierRequirement",
    args: address ? [address] : undefined,
    query: { enabled: !!address && hasCard }
  });

  // Upgrade tier
  const { writeContract: upgradeTier, data: upgradeHash, isPending: isUpgrading } = useWriteContract();
  const { isSuccess: upgradeSuccess } = useWaitForTransactionReceipt({ hash: upgradeHash });

  const handleUpgrade = (tier: number) => {
    if (!address || tier <= currentTier) return;
    
    upgradeTier({
      address: VIRTUAL_CARD_CONTRACT_ADDRESS as `0x${string}`,
      abi: VIRTUAL_CARD_ABI,
      functionName: "upgradeTier",
      args: [tier],
      account: address,
      chain: bsc
    });
  };

  // Calculate progress to next tier
  const nextTier = Math.min(currentTier + 1, 5);
  const nextTierMinBalance = parseFloat(tierBenefits[nextTier].minBalance.replace(/[^0-9.]/g, ''));
  const currentTierMinBalance = parseFloat(tierBenefits[currentTier].minBalance.replace(/[^0-9.]/g, ''));
  const progressToNext = nextTierMinBalance > 0 
    ? Math.min(100, ((totalDeposited - currentTierMinBalance) / (nextTierMinBalance - currentTierMinBalance)) * 100)
    : 100;

  if (!hasCard) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6 text-center">
          <Lock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">Create a virtual card to view tier benefits</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <ArrowUp className="h-5 w-5 text-primary" />
          Tier Upgrade & Benefits
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Tier Display */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              {(() => {
                const TierIcon = tierIcons[currentTier];
                return (
                  <div className={`p-2 rounded-full ${tierBgColors[currentTier]}`}>
                    <TierIcon className={`h-6 w-6 ${tierColors[currentTier]}`} />
                  </div>
                );
              })()}
              <div>
                <p className="text-sm text-muted-foreground">Current Tier</p>
                <p className={`text-xl font-bold ${tierColors[currentTier]}`}>{tierNames[currentTier]}</p>
              </div>
            </div>
            <Badge className="bg-primary/20 text-primary border-primary/30">
              {tierBenefits[currentTier].cashback} Cashback
            </Badge>
          </div>

          {currentTier < 5 && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Progress to {tierNames[nextTier]}</span>
                <span className="text-primary">{progressToNext.toFixed(0)}%</span>
              </div>
              <Progress value={progressToNext} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Deposit {tierBenefits[nextTier].minBalance} total to unlock {tierNames[nextTier]}
              </p>
            </div>
          )}
        </div>

        {/* Tier Benefits Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {tierNames.map((name, index) => {
            const TierIcon = tierIcons[index];
            const isCurrentTier = index === currentTier;
            const isLocked = index > currentTier;
            const canUpgrade = index > currentTier && totalDeposited >= parseFloat(tierBenefits[index].minBalance.replace(/[^0-9.]/g, ''));

            return (
              <button
                key={name}
                onClick={() => setSelectedTier(selectedTier === index ? null : index)}
                className={`relative p-3 rounded-lg border transition-all ${
                  isCurrentTier 
                    ? "border-primary bg-primary/10" 
                    : isLocked 
                    ? "border-border bg-muted/30 opacity-60"
                    : "border-border bg-muted/50 hover:bg-muted"
                }`}
              >
                {isCurrentTier && (
                  <div className="absolute -top-2 -right-2">
                    <Badge className="bg-primary text-[10px] px-1.5 py-0">Current</Badge>
                  </div>
                )}
                {isLocked && (
                  <Lock className="absolute top-2 right-2 h-3 w-3 text-muted-foreground" />
                )}
                <TierIcon className={`h-5 w-5 mb-1 ${tierColors[index]}`} />
                <p className={`font-semibold text-sm ${isCurrentTier ? "text-primary" : ""}`}>{name}</p>
                <p className="text-xs text-muted-foreground">{tierBenefits[index].cashback}</p>
                
                {selectedTier === index && (
                  <div className="absolute left-0 right-0 top-full mt-2 z-10 p-3 bg-popover border border-border rounded-lg shadow-lg text-left">
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cashback</span>
                        <span className="font-medium text-green-500">{tierBenefits[index].cashback}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Daily Limit</span>
                        <span>{tierBenefits[index].dailyLimit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Monthly Limit</span>
                        <span>{tierBenefits[index].monthlyLimit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Required</span>
                        <span>{tierBenefits[index].minBalance}</span>
                      </div>
                      {canUpgrade && (
                        <Button 
                          size="sm" 
                          className="w-full mt-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpgrade(index);
                          }}
                          disabled={isUpgrading}
                        >
                          {isUpgrading ? (
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          ) : (
                            <ArrowUp className="h-3 w-3 mr-1" />
                          )}
                          Upgrade Now
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Benefits Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Daily Limit</p>
            <p className="font-semibold text-primary">{tierBenefits[currentTier].dailyLimit}</p>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Monthly Limit</p>
            <p className="font-semibold text-primary">{tierBenefits[currentTier].monthlyLimit}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TierUpgradeCard;
