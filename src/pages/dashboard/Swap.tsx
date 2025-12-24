import { useState, useEffect, useCallback } from "react";
import bnbLogo from "@/assets/bnb-logo.png";
import pmLogo from "@/assets/pm-logo-new.png";
import usdtLogo from "@/assets/usdt-logo.png";
import usdcLogo from "@/assets/usdc-logo.png";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Header } from "@/components/Header";
import { TradingViewTicker } from "@/components/TradingViewTicker";
import { HeroBanner } from "@/components/HeroBanner";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Footer } from "@/components/Footer";
import { WalletCard } from "@/components/WalletCard";
import { ArrowLeft, ArrowDownUp, Settings, Loader2, CheckCircle2, ShieldCheck, AlertTriangle, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseEther, parseUnits, formatEther, formatUnits, maxUint256 } from 'viem';
import { BSC_TOKENS } from "@/contracts/presaleABI";
import { PMSwapABI, ERC20_ABI } from "@/contracts/swapABI";
import { PM_TOKEN_ADDRESS, CONTRACT_ADDRESSES } from "@/contracts/addresses";

// Contract addresses
const PMSWAP_ADDRESS = CONTRACT_ADDRESSES[56].PMSwap as `0x${string}`;
const PANCAKE_ROUTER = CONTRACT_ADDRESSES[56].PancakeRouter as `0x${string}`;
const WBNB_ADDRESS = CONTRACT_ADDRESSES[56].WBNB as `0x${string}`;

// PancakeSwap Router ABI for getAmountsOut and reserves
const PANCAKE_ROUTER_ABI = [
  {
    inputs: [{ name: "amountIn", type: "uint256" }, { name: "path", type: "address[]" }],
    name: "getAmountsOut",
    outputs: [{ name: "amounts", type: "uint256[]" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "amountOutMin", type: "uint256" }, { name: "path", type: "address[]" }, { name: "to", type: "address" }, { name: "deadline", type: "uint256" }],
    name: "swapExactETHForTokens",
    outputs: [{ name: "amounts", type: "uint256[]" }],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [{ name: "amountIn", type: "uint256" }, { name: "amountOutMin", type: "uint256" }, { name: "path", type: "address[]" }, { name: "to", type: "address" }, { name: "deadline", type: "uint256" }],
    name: "swapExactTokensForETH",
    outputs: [{ name: "amounts", type: "uint256[]" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "amountIn", type: "uint256" }, { name: "amountOutMin", type: "uint256" }, { name: "path", type: "address[]" }, { name: "to", type: "address" }, { name: "deadline", type: "uint256" }],
    name: "swapExactTokensForTokens",
    outputs: [{ name: "amounts", type: "uint256[]" }],
    stateMutability: "nonpayable",
    type: "function"
  }
] as const;

// PancakeSwap Factory ABI for getting pair address
const PANCAKE_FACTORY_ABI = [
  {
    inputs: [{ name: "tokenA", type: "address" }, { name: "tokenB", type: "address" }],
    name: "getPair",
    outputs: [{ name: "pair", type: "address" }],
    stateMutability: "view",
    type: "function"
  }
] as const;

// PancakeSwap Pair ABI for reserves
const PANCAKE_PAIR_ABI = [
  {
    inputs: [],
    name: "getReserves",
    outputs: [
      { name: "_reserve0", type: "uint112" },
      { name: "_reserve1", type: "uint112" },
      { name: "_blockTimestampLast", type: "uint32" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "token0",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "token1",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  }
] as const;

// PancakeSwap Factory address on BSC
const PANCAKE_FACTORY = "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73" as `0x${string}`;

// Static helper function for token addresses
const getTokenAddressStatic = (symbol: string): `0x${string}` => {
  switch (symbol) {
    case "BNB": return WBNB_ADDRESS;
    case "PM": return PM_TOKEN_ADDRESS as `0x${string}`;
    case "USDT": return BSC_TOKENS.USDT as `0x${string}`;
    case "USDC": return BSC_TOKENS.USDC as `0x${string}`;
    default: return WBNB_ADDRESS;
  }
};

// Get swap path for PancakeSwap
const getSwapPath = (fromToken: string, toToken: string): `0x${string}`[] => {
  const fromAddress = getTokenAddressStatic(fromToken);
  const toAddress = getTokenAddressStatic(toToken);
  
  // If one of them is BNB/WBNB, direct path
  if (fromToken === "BNB" || toToken === "BNB") {
    return [fromAddress, toAddress];
  }
  // Otherwise route through WBNB
  return [fromAddress, WBNB_ADDRESS, toAddress];
};

const SLIPPAGE_OPTIONS = ["0.1", "0.5", "1.0", "3.0"];

const SwapPage = () => {
  const { address, isConnected } = useAccount();
  const [fromToken, setFromToken] = useState("BNB");
  const [toToken, setToToken] = useState("PM");
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [slippage, setSlippage] = useState("0.5");
  const [customSlippage, setCustomSlippage] = useState("");
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [swapStatus, setSwapStatus] = useState<"processing" | "approving" | "success" | null>(null);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [showSlippageWarning, setShowSlippageWarning] = useState(false);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [debouncedFromAmount, setDebouncedFromAmount] = useState("");
  const [priceImpact, setPriceImpact] = useState<string>("0");

  // Debounce fromAmount changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFromAmount(fromAmount);
    }, 500);
    return () => clearTimeout(timer);
  }, [fromAmount]);

  // Write contract for swap
  const { writeContract, data: txHash, isPending } = useWriteContract();
  
  // Wait for transaction
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Check if PMSwap is deployed
  const isPMSwapDeployed = PMSWAP_ADDRESS !== "0x0000000000000000000000000000000000000000";

  // Get swap path for current pair
  const swapPath = getSwapPath(fromToken, toToken);
  const hasValidAmount = debouncedFromAmount && parseFloat(debouncedFromAmount) > 0;

  // Fetch price quote from PancakeSwap Router
  const { data: amountsOut, isLoading: isQuoteLoading, refetch: refetchQuote } = useReadContract({
    address: PANCAKE_ROUTER,
    abi: PANCAKE_ROUTER_ABI,
    functionName: 'getAmountsOut',
    args: hasValidAmount 
      ? [parseUnits(debouncedFromAmount, 18), swapPath]
      : undefined,
    chainId: 56,
    query: { 
      enabled: hasValidAmount && fromToken !== toToken,
      refetchInterval: 10000, // Refresh every 10 seconds
    }
  });

  // Also try PMSwap if deployed
  const { data: pmSwapAmountOut } = useReadContract({
    address: PMSWAP_ADDRESS,
    abi: PMSwapABI,
    functionName: 'getAmountOut',
    args: hasValidAmount && isPMSwapDeployed
      ? [getTokenAddressStatic(fromToken), getTokenAddressStatic(toToken), parseUnits(debouncedFromAmount, 18)]
      : undefined,
    chainId: 56,
    query: { enabled: hasValidAmount && isPMSwapDeployed && fromToken !== toToken }
  });

  // Read swap stats from PMSwap contract (if deployed)
  const { data: swapStats } = useReadContract({
    address: PMSWAP_ADDRESS,
    abi: PMSwapABI,
    functionName: 'getSwapStats',
    chainId: 56,
    query: { enabled: isPMSwapDeployed }
  });

  // Read swap fee
  const { data: swapFee } = useReadContract({
    address: PMSWAP_ADDRESS,
    abi: PMSwapABI,
    functionName: 'swapFee',
    chainId: 56,
    query: { enabled: isPMSwapDeployed }
  });

  // Check allowance for ERC20 tokens
  const { data: allowanceData, refetch: refetchAllowance } = useReadContract({
    address: getTokenAddressStatic(fromToken),
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, isPMSwapDeployed ? PMSWAP_ADDRESS : PANCAKE_ROUTER] : undefined,
    query: { enabled: fromToken !== "BNB" && !!address }
  });

  // Get pair address for price impact calculation
  const fromTokenAddress = getTokenAddressStatic(fromToken);
  const toTokenAddress = getTokenAddressStatic(toToken);
  
  const { data: pairAddress } = useReadContract({
    address: PANCAKE_FACTORY,
    abi: PANCAKE_FACTORY_ABI,
    functionName: 'getPair',
    args: [fromTokenAddress, toTokenAddress],
    chainId: 56,
    query: { enabled: fromToken !== toToken }
  });

  // Get reserves from the pair
  const { data: reserves } = useReadContract({
    address: pairAddress as `0x${string}`,
    abi: PANCAKE_PAIR_ABI,
    functionName: 'getReserves',
    chainId: 56,
    query: { enabled: !!pairAddress && pairAddress !== "0x0000000000000000000000000000000000000000" }
  });

  // Get token0 to know which reserve is which
  const { data: token0 } = useReadContract({
    address: pairAddress as `0x${string}`,
    abi: PANCAKE_PAIR_ABI,
    functionName: 'token0',
    chainId: 56,
    query: { enabled: !!pairAddress && pairAddress !== "0x0000000000000000000000000000000000000000" }
  });

  // Calculate price impact based on reserves
  useEffect(() => {
    if (!reserves || !token0 || !hasValidAmount || !amountsOut || !Array.isArray(amountsOut) || amountsOut.length === 0) {
      setPriceImpact("0");
      return;
    }

    try {
      const [reserve0, reserve1] = reserves as [bigint, bigint, number];
      const isFromToken0 = (token0 as string).toLowerCase() === fromTokenAddress.toLowerCase();
      
      // Get correct reserves based on token order
      const reserveIn = isFromToken0 ? reserve0 : reserve1;
      const reserveOut = isFromToken0 ? reserve1 : reserve0;
      
      if (reserveIn === BigInt(0) || reserveOut === BigInt(0)) {
        setPriceImpact("0");
        return;
      }

      const amountIn = parseUnits(debouncedFromAmount, 18);
      const actualAmountOut = amountsOut[amountsOut.length - 1] as bigint;
      
      // Calculate expected output without price impact (constant product formula)
      // Expected output = (amountIn * reserveOut) / reserveIn
      const expectedOutput = (amountIn * reserveOut) / reserveIn;
      
      if (expectedOutput === BigInt(0)) {
        setPriceImpact("0");
        return;
      }
      
      // Price impact = ((expectedOutput - actualAmountOut) / expectedOutput) * 100
      const impactBps = Number((expectedOutput - actualAmountOut) * BigInt(10000) / expectedOutput);
      const impactPercent = impactBps / 100;
      
      setPriceImpact(impactPercent > 0 ? impactPercent.toFixed(2) : "0.01");
    } catch (error) {
      console.error("Error calculating price impact:", error);
      setPriceImpact("0");
    }
  }, [reserves, token0, hasValidAmount, amountsOut, fromTokenAddress, debouncedFromAmount]);

  // Check for high slippage warning
  useEffect(() => {
    const slippageValue = customSlippage || slippage;
    setShowSlippageWarning(parseFloat(slippageValue) > 3);
  }, [slippage, customSlippage]);

  const getCurrentSlippage = () => {
    return customSlippage || slippage;
  };

  // Fetch real balances from blockchain
  const { data: bnbBalanceData } = useBalance({ address, chainId: 56 });
  const { data: pmBalanceData } = useBalance({ address, token: PM_TOKEN_ADDRESS as `0x${string}`, chainId: 56 });
  const { data: usdtBalanceData } = useBalance({ address, token: BSC_TOKENS.USDT as `0x${string}`, chainId: 56 });
  const { data: usdcBalanceData } = useBalance({ address, token: BSC_TOKENS.USDC as `0x${string}`, chainId: 56 });

  const bnbBalance = bnbBalanceData ? parseFloat(bnbBalanceData.formatted) : 0;
  const pmBalance = pmBalanceData ? parseFloat(pmBalanceData.formatted) : 0;
  const usdtBalance = usdtBalanceData ? parseFloat(usdtBalanceData.formatted) : 0;
  const usdcBalance = usdcBalanceData ? parseFloat(usdcBalanceData.formatted) : 0;

  const tokens = [{
    symbol: "BNB",
    name: "BNB",
    balance: bnbBalance.toFixed(4),
    logo: bnbLogo
  }, {
    symbol: "PM",
    name: "Perfect Money",
    balance: pmBalance.toFixed(2),
    logo: pmLogo
  }, {
    symbol: "USDT",
    name: "Tether USD",
    balance: usdtBalance.toFixed(2),
    logo: usdtLogo
  }, {
    symbol: "USDC",
    name: "USD Coin",
    balance: usdcBalance.toFixed(2),
    logo: usdcLogo
  }];

  // Check if approval is needed
  useEffect(() => {
    if (fromToken !== "BNB" && fromAmount && allowanceData !== undefined) {
      const requiredAmount = parseUnits(fromAmount || "0", 18);
      setNeedsApproval(BigInt(allowanceData as bigint) < requiredAmount);
    } else {
      setNeedsApproval(false);
    }
  }, [fromToken, fromAmount, allowanceData]);

  // Update toAmount when amountsOut changes from PancakeSwap
  useEffect(() => {
    setIsLoadingQuote(isQuoteLoading);
    
    if (amountsOut && Array.isArray(amountsOut) && amountsOut.length > 0) {
      // Get the last element which is the output amount
      const outputAmount = amountsOut[amountsOut.length - 1];
      const formatted = formatUnits(outputAmount as bigint, 18);
      setToAmount(parseFloat(formatted).toFixed(6));
    } else if (!hasValidAmount) {
      setToAmount("");
    }
  }, [amountsOut, isQuoteLoading, hasValidAmount]);

  // Refetch quote when tokens change
  useEffect(() => {
    if (hasValidAmount && fromToken !== toToken) {
      refetchQuote();
    }
  }, [fromToken, toToken, hasValidAmount, refetchQuote]);

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed && txHash) {
      if (swapStatus === "approving") {
        refetchAllowance();
        setSwapStatus(null);
        setShowSwapModal(false);
        toast.success("Token approved! You can now swap.");
      } else {
        setSwapStatus("success");
        window.dispatchEvent(new Event("balanceUpdate"));
        window.dispatchEvent(new Event("transactionUpdate"));
        
        setTimeout(() => {
          setShowSwapModal(false);
          setSwapStatus(null);
          setFromAmount("");
          setToAmount("");
          toast.success("Swap completed successfully!");
        }, 2000);
      }
    }
  }, [isConfirmed, txHash, swapStatus, refetchAllowance]);

  const getTokenAddress = (symbol: string): `0x${string}` => getTokenAddressStatic(symbol);

  const handleApprove = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }

    setShowSwapModal(true);
    setSwapStatus("approving");

    try {
      const spender = isPMSwapDeployed ? PMSWAP_ADDRESS : PANCAKE_ROUTER;
      writeContract({
        address: getTokenAddress(fromToken),
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [spender, maxUint256],
      } as any);
    } catch (error: any) {
      setShowSwapModal(false);
      setSwapStatus(null);
      toast.error(error?.message || "Approval failed");
    }
  };

  const handleSwap = async () => {
    if (!fromAmount || !toAmount) {
      toast.error("Please enter swap amounts");
      return;
    }
    
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }

    const fromValue = parseFloat(fromAmount);
    const fromBalance = parseFloat(tokens.find(t => t.symbol === fromToken)?.balance || "0");
    
    if (fromValue > fromBalance) {
      toast.error(`Insufficient ${fromToken} balance`);
      return;
    }

    setShowSwapModal(true);
    setSwapStatus("processing");

    try {
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20); // 20 minutes
      const currentSlippage = getCurrentSlippage();
      const slippageMultiplier = 1 - (parseFloat(currentSlippage) / 100);
      const minAmountOut = parseUnits((parseFloat(toAmount) * slippageMultiplier).toFixed(18), 18);
      const path = swapPath;

      if (isPMSwapDeployed) {
        // Use PMSwap contract
        if (fromToken === "BNB") {
          writeContract({
            address: PMSWAP_ADDRESS,
            abi: PMSwapABI,
            functionName: 'swapBNBForTokens',
            args: [getTokenAddress(toToken), minAmountOut, deadline],
            value: parseEther(fromAmount),
          } as any);
        } else if (toToken === "BNB") {
          writeContract({
            address: PMSWAP_ADDRESS,
            abi: PMSwapABI,
            functionName: 'swapTokensForBNB',
            args: [getTokenAddress(fromToken), parseUnits(fromAmount, 18), minAmountOut, deadline],
          } as any);
        } else {
          writeContract({
            address: PMSWAP_ADDRESS,
            abi: PMSwapABI,
            functionName: 'swapTokensForTokens',
            args: [getTokenAddress(fromToken), getTokenAddress(toToken), parseUnits(fromAmount, 18), minAmountOut, deadline],
          } as any);
        }
      } else {
        // Use PancakeSwap Router directly
        if (fromToken === "BNB") {
          writeContract({
            address: PANCAKE_ROUTER,
            abi: PANCAKE_ROUTER_ABI,
            functionName: 'swapExactETHForTokens',
            args: [minAmountOut, path, address!, deadline],
            value: parseEther(fromAmount),
          } as any);
        } else if (toToken === "BNB") {
          writeContract({
            address: PANCAKE_ROUTER,
            abi: PANCAKE_ROUTER_ABI,
            functionName: 'swapExactTokensForETH',
            args: [parseUnits(fromAmount, 18), minAmountOut, path, address!, deadline],
          } as any);
        } else {
          writeContract({
            address: PANCAKE_ROUTER,
            abi: PANCAKE_ROUTER_ABI,
            functionName: 'swapExactTokensForTokens',
            args: [parseUnits(fromAmount, 18), minAmountOut, path, address!, deadline],
          } as any);
        }
      }
    } catch (error: any) {
      setShowSwapModal(false);
      setSwapStatus(null);
      toast.error(error?.message || "Swap failed");
    }
  };

  const handleFlip = () => {
    const tempToken = fromToken;
    const tempAmount = fromAmount;
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    if (!value || parseFloat(value) <= 0) {
      setToAmount("");
    }
  };

  const handleFromTokenChange = (value: string) => {
    if (value === toToken) {
      // If selecting the same token, swap them
      setToToken(fromToken);
    }
    setFromToken(value);
  };

  const handleToTokenChange = (value: string) => {
    if (value === fromToken) {
      // If selecting the same token, swap them
      setFromToken(toToken);
    }
    setToToken(value);
  };

  // Format swap stats
  const totalFeesCollected = swapStats ? formatEther((swapStats as any)[0]) : "0";
  const totalSwapVolume = swapStats ? formatEther((swapStats as any)[1]) : "0";
  const totalSwapCount = swapStats ? (swapStats as any)[2].toString() : "0";
  const currentFee = isPMSwapDeployed && swapFee ? (Number(swapFee) / 100).toFixed(2) : "0.30";

  // Read user stats from PMSwap (if deployed)
  const { data: userStats } = useReadContract({
    address: PMSWAP_ADDRESS,
    abi: PMSwapABI,
    functionName: 'getUserStats',
    args: [address || '0x0000000000000000000000000000000000000000'],
    chainId: 56,
    query: { enabled: isPMSwapDeployed && !!address }
  });

  // Format user stats
  const userSwapCount = isPMSwapDeployed && userStats ? (userStats as any)[0].toString() : "0";
  const userSwapVolume = isPMSwapDeployed && userStats ? formatEther((userStats as any)[1]) : "0";

  // Calculate exchange rate
  const exchangeRate = toAmount && fromAmount && parseFloat(fromAmount) > 0 
    ? (parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(6) 
    : "0";

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 lg:pb-0">
      <Header />
      <TradingViewTicker />
      <HeroBanner title="Token Swap" subtitle="Swap tokens instantly via PMSwap on BSC" />
      
      <main className="container mx-auto px-4 pt-12 pb-12 flex-1 my-0">
        {/* Mobile Wallet Card */}
        <div className="md:hidden mb-6">
          <WalletCard showQuickFunctionsToggle={false} compact={true} />
        </div>
        
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 text-sm">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Liquidity Pool Info */}
          {pairAddress && pairAddress !== "0x0000000000000000000000000000000000000000" && reserves && (
            <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm border-blue-500/30">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <TrendingUp className="h-4 w-4 text-blue-400" />
                </div>
                <h3 className="font-bold">Liquidity Pool Info</h3>
                <span className="text-xs bg-muted px-2 py-0.5 rounded-full ml-auto">
                  {fromToken}/{toToken}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-background/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">{fromToken} Reserve</p>
                  <p className="font-bold text-sm">
                    {(() => {
                      const [reserve0, reserve1] = reserves as [bigint, bigint, number];
                      const isFromToken0 = (token0 as string)?.toLowerCase() === fromTokenAddress.toLowerCase();
                      const reserveIn = isFromToken0 ? reserve0 : reserve1;
                      return Number(formatUnits(reserveIn, 18)).toLocaleString('en-US', { maximumFractionDigits: 2 });
                    })()}
                  </p>
                </div>
                <div className="p-3 bg-background/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">{toToken} Reserve</p>
                  <p className="font-bold text-sm">
                    {(() => {
                      const [reserve0, reserve1] = reserves as [bigint, bigint, number];
                      const isFromToken0 = (token0 as string)?.toLowerCase() === fromTokenAddress.toLowerCase();
                      const reserveOut = isFromToken0 ? reserve1 : reserve0;
                      return Number(formatUnits(reserveOut, 18)).toLocaleString('en-US', { maximumFractionDigits: 2 });
                    })()}
                  </p>
                </div>
                <div className="p-3 bg-background/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Pool Rate</p>
                  <p className="font-bold text-sm">
                    {(() => {
                      const [reserve0, reserve1] = reserves as [bigint, bigint, number];
                      const isFromToken0 = (token0 as string)?.toLowerCase() === fromTokenAddress.toLowerCase();
                      const reserveIn = isFromToken0 ? reserve0 : reserve1;
                      const reserveOut = isFromToken0 ? reserve1 : reserve0;
                      if (reserveIn === BigInt(0)) return "0";
                      return (Number(reserveOut) / Number(reserveIn)).toFixed(6);
                    })()}
                  </p>
                </div>
                <div className="p-3 bg-background/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Price Impact</p>
                  <p className={`font-bold text-sm ${parseFloat(priceImpact) > 3 ? 'text-red-500' : parseFloat(priceImpact) > 1 ? 'text-yellow-400' : 'text-green-500'}`}>
                    {parseFloat(priceImpact) < 0.01 ? '< 0.01' : priceImpact}%
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Swap Stats Card */}
          <Card className="p-4 bg-gradient-to-br from-primary/10 to-secondary/10 backdrop-blur-sm border-primary/30">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="font-bold">PMSwap Statistics</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-2 bg-background/50 rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Total Swaps</p>
                <p className="font-bold">{Number(totalSwapCount).toLocaleString()}</p>
              </div>
              <div className="p-2 bg-background/50 rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Volume</p>
                <p className="font-bold">{Number(totalSwapVolume).toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
              </div>
              <div className="p-2 bg-background/50 rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Your Swaps</p>
                <p className="font-bold">{userSwapCount}</p>
              </div>
              <div className="p-2 bg-background/50 rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Swap Fee</p>
                <p className="font-bold">{currentFee}%</p>
              </div>
            </div>
          </Card>

          <Card className="p-8 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <ArrowDownUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="font-bold text-xl">Swap Tokens</h1>
                  <p className="text-muted-foreground">Trade tokens via PMSwap</p>
                </div>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Settings className="h-5 w-5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Slippage Tolerance</h4>
                      <p className="text-xs text-muted-foreground mb-3">
                        Your transaction will revert if the price changes unfavorably by more than this percentage.
                      </p>
                      <div className="flex gap-2 mb-3">
                        {SLIPPAGE_OPTIONS.map((option) => (
                          <Button
                            key={option}
                            variant={slippage === option && !customSlippage ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              setSlippage(option);
                              setCustomSlippage("");
                            }}
                          >
                            {option}%
                          </Button>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Custom"
                          type="number"
                          value={customSlippage}
                          onChange={(e) => setCustomSlippage(e.target.value)}
                          className="w-24"
                        />
                        <span className="text-muted-foreground">%</span>
                      </div>
                      {showSlippageWarning && (
                        <div className="mt-3 p-2 rounded bg-yellow-500/20 border border-yellow-500/30 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          <span className="text-xs text-yellow-400">High slippage may result in unfavorable rates</span>
                        </div>
                      )}
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground">
                        Current: <span className="font-medium text-foreground">{getCurrentSlippage()}%</span>
                      </p>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              {/* From Token */}
              <div className="p-4 rounded-lg border border-border bg-muted/30">
                <div className="flex justify-between mb-2">
                  <Label>From</Label>
                  <span className="text-sm text-muted-foreground">
                    Balance: {tokens.find(t => t.symbol === fromToken)?.balance}
                  </span>
                </div>
                <div className="flex gap-3">
                  <Input type="number" placeholder="0.00" value={fromAmount} onChange={e => handleFromAmountChange(e.target.value)} className="flex-1 text-2xl h-14 bg-background" />
                  <Select value={fromToken} onValueChange={handleFromTokenChange}>
                    <SelectTrigger className="w-32 h-14">
                      <SelectValue>
                        <div className="flex items-center gap-2">
                          <img src={tokens.find(t => t.symbol === fromToken)?.logo} alt={fromToken} className="h-5 w-5" />
                          <span>{fromToken}</span>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {tokens.map(token => (
                        <SelectItem key={token.symbol} value={token.symbol}>
                          <div className="flex items-center gap-2">
                            <img src={token.logo} alt={token.symbol} className="h-5 w-5" />
                            <span>{token.symbol}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Flip Button */}
              <div className="flex justify-center -my-2 relative z-10">
                <Button variant="outline" size="icon" className="rounded-full bg-background" onClick={handleFlip}>
                  <ArrowDownUp className="h-5 w-5" />
                </Button>
              </div>

              {/* To Token */}
              <div className="p-4 rounded-lg border border-border bg-muted/30">
                <div className="flex justify-between mb-2">
                  <Label>To</Label>
                  <span className="text-sm text-muted-foreground">
                    Balance: {tokens.find(t => t.symbol === toToken)?.balance}
                  </span>
                </div>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Input 
                      type="number" 
                      placeholder="0.00" 
                      value={toAmount} 
                      readOnly 
                      className="text-2xl h-14 bg-background w-full" 
                    />
                    {isLoadingQuote && hasValidAmount && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <Select value={toToken} onValueChange={handleToTokenChange}>
                    <SelectTrigger className="w-32 h-14">
                      <SelectValue>
                        <div className="flex items-center gap-2">
                          <img src={tokens.find(t => t.symbol === toToken)?.logo} alt={toToken} className="h-5 w-5" />
                          <span>{toToken}</span>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {tokens.map(token => (
                        <SelectItem key={token.symbol} value={token.symbol}>
                          <div className="flex items-center gap-2">
                            <img src={token.logo} alt={token.symbol} className="h-5 w-5" />
                            <span>{token.symbol}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Swap Details */}
            <div className="mt-6 p-4 rounded-lg bg-muted/50 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Exchange Rate</span>
                <span className="font-medium">
                  {isLoadingQuote ? (
                    <Loader2 className="h-4 w-4 animate-spin inline" />
                  ) : (
                    <>1 {fromToken} ≈ {exchangeRate} {toToken}</>
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Price Impact</span>
                <span className={`font-medium ${parseFloat(priceImpact) > 3 ? 'text-red-500' : parseFloat(priceImpact) > 1 ? 'text-yellow-400' : 'text-green-500'}`}>
                  {parseFloat(priceImpact) < 0.01 ? '< 0.01' : priceImpact}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Slippage Tolerance</span>
                <span className={`font-medium ${showSlippageWarning ? 'text-yellow-400' : ''}`}>{getCurrentSlippage()}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Platform Fee</span>
                <span className="font-medium">{isPMSwapDeployed ? currentFee : "0.25"}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Network Fee</span>
                <span className="font-medium">~0.0003 BNB</span>
              </div>
            </div>

            {/* PMSwap Info */}
            <div className="mt-4 p-4 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm">
                <span className="font-bold">🔄 Powered by PMSwap</span>
                <br />
                <span className="text-muted-foreground">Swaps are executed via PMSwap contract with {currentFee}% fee on BSC (BEP20)</span>
              </p>
            </div>

            {needsApproval && fromToken !== "BNB" ? (
              <Button variant="gradient" size="lg" className="w-full mt-6" onClick={handleApprove} disabled={isPending || isConfirming}>
                {(isPending || isConfirming) ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Approving...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-5 w-5 mr-2" />
                    Approve {fromToken}
                  </>
                )}
              </Button>
            ) : (
              <Button variant="gradient" size="lg" className="w-full mt-6" onClick={handleSwap} disabled={isPending || isConfirming}>
                {(isPending || isConfirming) ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Swapping...
                  </>
                ) : (
                  <>
                    <ArrowDownUp className="h-5 w-5 mr-2" />
                    Swap Tokens
                  </>
                )}
              </Button>
            )}
          </Card>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />

      {/* Swap Processing Modal */}
      <Dialog open={showSwapModal} onOpenChange={setShowSwapModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Swap Transaction</DialogTitle>
            <DialogDescription>
              {swapStatus === "processing" ? "Processing your swap transaction..." : swapStatus === "approving" ? "Approving token..." : "Swap completed successfully!"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-8">
            {swapStatus === "approving" ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-16 w-16 text-primary animate-spin" />
                <div className="text-center space-y-2">
                  <p className="font-semibold">Approving {fromToken}</p>
                  <p className="text-sm text-muted-foreground">
                    Please confirm the approval in your wallet
                  </p>
                  <p className="text-xs text-muted-foreground">This allows PMSwap to use your tokens</p>
                </div>
              </div>
            ) : swapStatus === "processing" ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-16 w-16 text-primary animate-spin" />
                <div className="text-center space-y-2">
                  <p className="font-semibold">Swapping Tokens</p>
                  <p className="text-sm text-muted-foreground">
                    {fromAmount} {fromToken} → {toAmount} {toToken}
                  </p>
                  <p className="text-xs text-muted-foreground">Please wait while we process your transaction...</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-full bg-green-500/20 p-4">
                  <CheckCircle2 className="h-16 w-16 text-green-500" />
                </div>
                <div className="text-center space-y-2">
                  <p className="font-bold text-lg">Swap Successful!</p>
                  <p className="text-sm text-muted-foreground">
                    Swapped {fromAmount} {fromToken} for {toAmount} {toToken}
                  </p>
                  <div className="p-4 rounded-lg bg-muted/50 mt-4">
                    <p className="text-xs text-muted-foreground mb-1">Transaction Hash</p>
                    <p className="font-mono text-xs break-all">
                      {txHash || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SwapPage;
