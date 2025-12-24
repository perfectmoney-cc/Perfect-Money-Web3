import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Crown, User, TrendingUp, Loader2 } from "lucide-react";
import { useAccount, useReadContract, useChainId } from "wagmi";
import { vaultABI } from "@/contracts/vaultABI";
import { CONTRACT_ADDRESSES, ChainId } from "@/contracts/addresses";
import { formatUnits } from "viem";
import { usePublicClient } from "wagmi";

interface LeaderboardEntry {
  rank: number;
  address: string;
  totalStaked: number;
  planTier: "bronze" | "silver" | "gold";
  rewardsEarned: number;
}

export const StakingLeaderboard = () => {
  const { address } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const currentChainId = (chainId === 56 || chainId === 97 ? chainId : 56) as ChainId;
  const vaultAddress = CONTRACT_ADDRESSES[currentChainId]?.PMVault || "0x0000000000000000000000000000000000000000";

  // Read global stats
  const { data: globalStats } = useReadContract({
    address: vaultAddress as `0x${string}`,
    abi: vaultABI,
    functionName: "getGlobalStats",
  });

  // Read user stakes
  const { data: userStakes } = useReadContract({
    address: vaultAddress as `0x${string}`,
    abi: vaultABI,
    functionName: "getUserStakes",
    args: address ? [address as `0x${string}`] : undefined,
  });

  useEffect(() => {
    const fetchLeaderboardFromEvents = async () => {
      if (!publicClient || vaultAddress === "0x0000000000000000000000000000000000000000") {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Fetch Staked events to build leaderboard
        const stakedLogs = await publicClient.getLogs({
          address: vaultAddress as `0x${string}`,
          event: {
            type: "event",
            name: "Staked",
            inputs: [
              { indexed: true, name: "user", type: "address" },
              { indexed: false, name: "planId", type: "uint256" },
              { indexed: false, name: "amount", type: "uint256" },
            ],
          },
          fromBlock: BigInt(0),
          toBlock: "latest",
        });

        // Aggregate stakes by user
        const userStakesMap = new Map<string, { totalStaked: bigint; planId: number }>();
        
        for (const log of stakedLogs) {
          const user = log.args.user as string;
          const amount = log.args.amount as bigint;
          const planId = Number(log.args.planId);
          
          const existing = userStakesMap.get(user.toLowerCase()) || { totalStaked: BigInt(0), planId: 0 };
          userStakesMap.set(user.toLowerCase(), {
            totalStaked: existing.totalStaked + amount,
            planId: Math.max(existing.planId, planId),
          });
        }

        // Convert to leaderboard entries and sort
        const entries: LeaderboardEntry[] = Array.from(userStakesMap.entries())
          .map(([addr, data]) => ({
            rank: 0,
            address: addr,
            totalStaked: Number(formatUnits(data.totalStaked, 18)),
            planTier: (data.planId === 2 ? "gold" : data.planId === 1 ? "silver" : "bronze") as "bronze" | "silver" | "gold",
            rewardsEarned: Number(formatUnits(data.totalStaked, 18)) * 0.05, // Estimated rewards
          }))
          .sort((a, b) => b.totalStaked - a.totalStaked)
          .slice(0, 10)
          .map((entry, index) => ({ ...entry, rank: index + 1 }));

        setLeaderboard(entries);

        // Check if current user is in the leaderboard
        if (address) {
          const userEntry = entries.find(e => e.address.toLowerCase() === address.toLowerCase());
          if (userEntry) {
            setUserRank(userEntry);
          } else if (userStakes && Array.isArray(userStakes) && userStakes.length > 0) {
            // User has stakes but not in top 10
            const totalUserStaked = (userStakes as any[]).reduce((sum, stake) => {
              return sum + Number(formatUnits(stake.amount as bigint, 18));
            }, 0);
            
            const highestPlan = Math.max(...(userStakes as any[]).map(s => Number(s.planId)));
            
            // Find rank
            const allEntries = Array.from(userStakesMap.entries())
              .map(([addr, data]) => ({
                address: addr,
                totalStaked: Number(formatUnits(data.totalStaked, 18)),
              }))
              .sort((a, b) => b.totalStaked - a.totalStaked);
            
            const rank = allEntries.findIndex(e => e.address.toLowerCase() === address.toLowerCase()) + 1;

            setUserRank({
              rank: rank || allEntries.length + 1,
              address: address,
              totalStaked: totalUserStaked,
              planTier: highestPlan === 2 ? "gold" : highestPlan === 1 ? "silver" : "bronze",
              rewardsEarned: totalUserStaked * 0.05,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
        // Fallback to empty leaderboard
        setLeaderboard([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboardFromEvents();
  }, [publicClient, vaultAddress, address, userStakes]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-sm font-bold w-5 text-center">{rank}</span>;
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case "gold":
        return <Badge className="bg-yellow-500/20 text-yellow-500 text-xs">Gold</Badge>;
      case "silver":
        return <Badge className="bg-gray-400/20 text-gray-400 text-xs">Silver</Badge>;
      case "bronze":
        return <Badge className="bg-amber-600/20 text-amber-600 text-xs">Bronze</Badge>;
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Top Stakers Leaderboard
        </h3>
        <Badge variant="outline" className="animate-pulse">
          Live Rankings
        </Badge>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* User's Rank */}
          {userRank && (
            <div className="mb-4 p-4 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Your Rank</p>
                    <p className="font-bold text-lg">#{userRank.rank}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Staked</p>
                  <p className="font-bold">${userRank.totalStaked.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Est. Rewards</p>
                  <p className="font-bold text-green-500">${userRank.rewardsEarned.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Leaderboard Table */}
          {leaderboard.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">No stakers yet. Be the first!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry, index) => {
                const isCurrentUser = address && entry.address.toLowerCase() === address.toLowerCase();
                
                return (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                      isCurrentUser
                        ? "bg-primary/10 border border-primary/30"
                        : "bg-muted/30 hover:bg-muted/50"
                    } ${entry.rank <= 3 ? "border-l-4" : ""} ${
                      entry.rank === 1 ? "border-l-yellow-500" :
                      entry.rank === 2 ? "border-l-gray-400" :
                      entry.rank === 3 ? "border-l-amber-600" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 flex justify-center">
                        {getRankIcon(entry.rank)}
                      </div>
                      <div>
                        <p className={`font-mono text-sm ${isCurrentUser ? "text-primary font-bold" : ""}`}>
                          {isCurrentUser ? "You" : formatAddress(entry.address)}
                        </p>
                        {getTierBadge(entry.planTier)}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Staked</p>
                        <p className="font-semibold">${entry.totalStaked.toLocaleString()}</p>
                      </div>
                      <div className="text-right min-w-[80px]">
                        <p className="text-xs text-muted-foreground">Est. Earned</p>
                        <p className="font-semibold text-green-500 flex items-center justify-end gap-1">
                          <TrendingUp className="h-3 w-3" />
                          ${entry.rewardsEarned.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <p className="text-xs text-center text-muted-foreground mt-4">
            Rankings update in real-time from blockchain data
          </p>
        </>
      )}
    </Card>
  );
};
