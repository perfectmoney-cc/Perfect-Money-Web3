import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, Crown, Zap, Wallet, Loader2, AlertCircle, ShoppingCart, RefreshCw, Clock, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useAccount, useReadContract, useWriteContract, useBalance } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { parseEther, formatEther } from "viem";
import { PMTokenABI } from "@/contracts/abis";
import { PMMerchantABI } from "@/contracts/merchantABI";
import { getContractAddress, ChainId } from "@/contracts/addresses";
import pmLogo from "@/assets/pm-logo-new.png";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Skeleton component for plan cards
const PlanCardSkeleton = () => (
  <Card className="p-6 border border-border">
    <div className="text-center mb-6">
      <Skeleton className="h-14 w-14 rounded-lg mx-auto mb-4" />
      <Skeleton className="h-8 w-32 mx-auto mb-2" />
      <Skeleton className="h-10 w-40 mx-auto" />
    </div>
    <div className="space-y-3 mb-6">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-4 flex-1" />
        </div>
      ))}
    </div>
    <Skeleton className="h-10 w-full" />
  </Card>
);

interface MerchantSubscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubscribe: (planName: string, walletAddress: string) => void;
  subscriptionEndTime?: bigint;
}

export const MerchantSubscriptionModal = ({ 
  open, 
  onOpenChange, 
  onSubscribe,
  subscriptionEndTime
}: MerchantSubscriptionModalProps) => {
  const { address, isConnected, chainId } = useAccount();
  const { openConnectModal } = useConnectModal();
  const navigate = useNavigate();
  const { writeContractAsync } = useWriteContract();
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribingTier, setSubscribingTier] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null);
  const walletAddress = address || "";

  // Current PM token price in BNB (can be updated from DEX or oracle)
  // Default: 1 PM = 0.000001 BNB (example price)
  const PM_PRICE_IN_BNB = 0.000001;

  // Get contract addresses
  const tokenAddress = chainId ? getContractAddress(chainId as ChainId, 'PMToken') : undefined;
  const merchantAddress = chainId ? getContractAddress(chainId as ChainId, 'PMMerchant') : undefined;
  const isContractDeployed = merchantAddress && merchantAddress !== "0x0000000000000000000000000000000000000000";

  // Fetch user's PM token balance with refetch capability
  const { data: pmBalance, isLoading: isLoadingBalance, refetch: refetchBalance } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: PMTokenABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!tokenAddress && !!address,
    }
  });

  const userBalance = pmBalance ? formatEther(pmBalance as bigint) : "0";
  const userBalanceNumber = parseFloat(userBalance);

  // Check for subscription renewal reminder
  useEffect(() => {
    if (subscriptionEndTime && subscriptionEndTime > BigInt(0)) {
      const endTimeMs = Number(subscriptionEndTime) * 1000;
      const now = Date.now();
      const daysUntilExpiry = Math.ceil((endTimeMs - now) / (1000 * 60 * 60 * 24));
      
      // Show reminder if subscription expires within 30 days
      if (daysUntilExpiry > 0 && daysUntilExpiry <= 30) {
        toast.warning(
          `Your subscription expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}! Renew now to avoid service interruption.`,
          {
            duration: 10000,
            icon: <Clock className="h-5 w-5" />,
            action: {
              label: "Renew Now",
              onClick: () => onOpenChange(true),
            },
          }
        );
      }
    }
  }, [subscriptionEndTime, onOpenChange]);

  // Auto-refresh balance when modal opens
  useEffect(() => {
    if (open && address) {
      setIsRefreshing(true);
      refetchBalance().finally(() => setIsRefreshing(false));
    }
  }, [open, address, refetchBalance]);

  // Manual refresh handler
  const handleRefreshBalance = async () => {
    setIsRefreshing(true);
    await refetchBalance();
    setIsRefreshing(false);
    toast.success("Balance refreshed!");
  };

  // Calculate cost in BNB for tooltip
  const calculateBnbCost = (pmAmount: number) => {
    return (pmAmount * PM_PRICE_IN_BNB).toFixed(4);
  };

  const plans = [
    {
      name: "Starter",
      price: "10,000",
      priceNumber: 10000,
      period: "/year",
      icon: Zap,
      tier: 0,
      features: [
        "Up to 100 transactions/month",
        "Basic payment integration",
        "Email support",
        "Payment QR codes",
        "Transaction history"
      ]
    },
    {
      name: "Professional",
      price: "25,000",
      priceNumber: 25000,
      period: "/year",
      icon: Crown,
      popular: true,
      tier: 1,
      features: [
        "Unlimited transactions",
        "Advanced API access",
        "Priority 24/7 support",
        "Custom payment links",
        "Advanced analytics",
        "Multi-currency support",
        "Webhook notifications",
        "A/B Testing for payment pages"
      ]
    }
  ];

  const handlePlanSelect = (plan: typeof plans[0]) => {
    if (!isConnected || !walletAddress) {
      toast.error("Please connect your wallet first");
      if (openConnectModal) {
        openConnectModal();
      }
      return;
    }

    if (!isContractDeployed) {
      toast.error("Merchant contract not yet deployed. Please try again later.");
      return;
    }

    if (userBalanceNumber < plan.priceNumber) {
      toast.error(`Insufficient PM balance. You need ${plan.price} PM but have ${userBalanceNumber.toLocaleString()} PM`);
      return;
    }

    // Open confirmation dialog
    setSelectedPlan(plan);
    setConfirmDialogOpen(true);
  };

  const handleConfirmSubscribe = async () => {
    if (!selectedPlan) return;
    
    setConfirmDialogOpen(false);
    setIsSubscribing(true);
    setSubscribingTier(selectedPlan.tier);

    try {
      // Step 1: Approve PM tokens
      toast.info("Step 1/2: Approving PM tokens...");
      const approveHash = await writeContractAsync({
        address: tokenAddress as `0x${string}`,
        abi: PMTokenABI,
        functionName: 'approve',
        args: [merchantAddress as `0x${string}`, parseEther(selectedPlan.priceNumber.toString())],
      } as any);

      toast.info("Waiting for approval confirmation...");
      // Wait a bit for the transaction to be mined
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Step 2: Subscribe
      toast.info("Step 2/2: Subscribing to merchant plan...");
      const subscribeHash = await writeContractAsync({
        address: merchantAddress as `0x${string}`,
        abi: PMMerchantABI,
        functionName: 'subscribe',
        args: [selectedPlan.tier],
      } as any);

      toast.success(`Successfully subscribed to ${selectedPlan.name} plan!`);
      onSubscribe(selectedPlan.name, walletAddress);
      onOpenChange(false);
    } catch (error: any) {
      console.error("Subscription error:", error);
      if (error?.message?.includes("user rejected")) {
        toast.error("Transaction cancelled by user");
      } else {
        toast.error(error?.shortMessage || error?.message || "Subscription failed. Please try again.");
      }
    } finally {
      setIsSubscribing(false);
      setSubscribingTier(null);
      setSelectedPlan(null);
    }
  };

  const canAfford = (priceNumber: number) => userBalanceNumber >= priceNumber;

  const isLoadingPlans = isLoadingBalance && isConnected;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto [&>button]:hidden">
          <DialogHeader className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => {
                  onOpenChange(false);
                  navigate('/dashboard');
                }}
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Back</span>
              </Button>
              <div className="w-20" /> {/* Spacer for balance */}
            </div>
            <DialogTitle className="text-2xl text-center mb-2">
              Choose Your Merchant Plan
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              Select a plan to start accepting PM token payments
            </DialogDescription>
            {isConnected && walletAddress && (
              <div className="flex flex-col items-center gap-2 mt-2">
                <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-lg">
                  <Wallet className="h-4 w-4 text-primary" />
                  <span className="text-sm font-mono">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                  <img src={pmLogo} alt="PM" className="h-4 w-4" />
                  <span className="text-sm font-semibold">
                    Balance: {isLoadingBalance || isRefreshing ? "Loading..." : `${parseFloat(userBalance).toLocaleString()} PM`}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 ml-1"
                    onClick={handleRefreshBalance}
                    disabled={isRefreshing}
                  >
                    <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
            )}
            {!isConnected && (
              <Button 
                variant="outline" 
                className="mt-4 mx-auto"
                onClick={() => openConnectModal?.()}
              >
                <Wallet className="h-4 w-4 mr-2" />
                Connect Wallet to Subscribe
              </Button>
            )}
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
            {isLoadingPlans ? (
              <>
                <PlanCardSkeleton />
                <PlanCardSkeleton />
              </>
            ) : plans.map((plan) => {
              const Icon = plan.icon;
              const affordable = canAfford(plan.priceNumber);
              const isThisSubscribing = isSubscribing && subscribingTier === plan.tier;
              
              return (
                <Card 
                  key={plan.name} 
                  className={`p-6 relative ${
                    plan.popular 
                      ? 'border-2 border-primary shadow-glow' 
                      : 'border border-border'
                  } ${!affordable && isConnected ? 'opacity-70' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-primary px-3 py-1 rounded-full text-xs font-bold">
                        POPULAR
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center mb-6">
                    <div className="inline-flex p-3 rounded-lg bg-primary/10 mb-4">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold text-primary">{plan.price}</span>
                      <img src={pmLogo} alt="PM" className="h-5 w-5 ml-1" />
                      <span className="font-semibold">PM</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {!isContractDeployed ? (
                    <div className="text-center p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30 mb-3">
                      <AlertCircle className="h-4 w-4 text-yellow-500 mx-auto mb-1" />
                      <p className="text-xs text-yellow-500">Contract not deployed yet</p>
                    </div>
                  ) : isConnected && !affordable ? (
                    <div className="text-center p-3 bg-red-500/10 rounded-lg border border-red-500/30 mb-3">
                      <AlertCircle className="h-4 w-4 text-red-500 mx-auto mb-1" />
                      <p className="text-xs text-red-500 mb-2">
                        Need {(plan.priceNumber - userBalanceNumber).toLocaleString()} more PM
                      </p>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={() => {
                                onOpenChange(false);
                                navigate("/dashboard/buy-token");
                              }}
                            >
                              <ShoppingCart className="h-3 w-3 mr-1" />
                              Buy PM Tokens
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">
                              ~{calculateBnbCost(plan.priceNumber - userBalanceNumber)} BNB needed
                            </p>
                            <p className="text-xs text-muted-foreground">
                              1 PM ≈ {PM_PRICE_IN_BNB} BNB
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  ) : null}

                  <Button 
                    variant={plan.popular ? "gradient" : "outline"}
                    className="w-full"
                    onClick={() => handlePlanSelect(plan)}
                    disabled={isSubscribing || (isConnected && !affordable) || !isContractDeployed}
                  >
                    {isThisSubscribing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      `Subscribe to ${plan.name}`
                    )}
                  </Button>
                </Card>
              );
            })}
          </div>

          <div className="text-center text-xs text-muted-foreground border-t pt-4">
            All plans include secure blockchain payments and can be cancelled anytime
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Subscription Payment</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>You are about to subscribe to the <span className="font-semibold text-foreground">{selectedPlan?.name}</span> plan.</p>
                
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Plan:</span>
                    <span className="font-semibold">{selectedPlan?.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-semibold">1 Year</span>
                  </div>
                  <div className="flex justify-between items-center border-t pt-2">
                    <span className="text-muted-foreground">Total Cost:</span>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-primary text-lg">{selectedPlan?.price}</span>
                      <img src={pmLogo} alt="PM" className="h-4 w-4" />
                      <span className="font-semibold">PM</span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  This will require two blockchain transactions: token approval and subscription payment.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSubscribe}>
              Confirm & Pay
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
