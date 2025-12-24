import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Copy, ShoppingCart, ShoppingBag, Grid3X3, X, Send, ArrowDownToLine, ArrowDownUp, TrendingUp, Store, Gift, Users, Handshake, Shield, MessageCircle, Link2, Settings, Lock, SendHorizonal, Sparkles, Ticket, Vault, CreditCard, CandlestickChart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import pmTokenLogo from "@/assets/pm-token-logo.png";
import QRCode from "qrcode";
import { useAccount, useBalance } from "wagmi";
import { PM_TOKEN_ADDRESS } from "@/contracts/addresses";
import { PinSettingsModal } from "./PinSettingsModal";
interface WalletCardProps {
  showQuickFunctionsToggle?: boolean;
  compact?: boolean;
}
export const WalletCard = ({
  showQuickFunctionsToggle = true,
  compact = false
}: WalletCardProps) => {
  const navigate = useNavigate();
  const {
    address,
    isConnected
  } = useAccount();

  // Use wagmi for PM token balance - will fetch from blockchain when connected
  const {
    data: tokenBalance,
    isLoading: isBalanceLoading,
    refetch: refetchBalance
  } = useBalance({
    address: address,
    token: PM_TOKEN_ADDRESS as `0x${string}`,
    chainId: 56 // BSC Mainnet
  });

  // Also get native BNB balance for reference
  const {
    data: bnbBalance
  } = useBalance({
    address: address,
    chainId: 56
  });
  const [balance, setBalance] = useState(() => {
    const savedBalance = localStorage.getItem("pmBalance");
    if (savedBalance === null) {
      localStorage.setItem("pmBalance", "0");
      return "0";
    }
    return savedBalance;
  });

  // Refetch balance every 10 seconds for real-time updates
  useEffect(() => {
    if (isConnected && address) {
      const interval = setInterval(() => {
        refetchBalance();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [isConnected, address, refetchBalance]);
  const [showQuickFunctions, setShowQuickFunctions] = useState(false);
  const [showPinSettings, setShowPinSettings] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  // Get wallet address from wagmi or fallback
  const walletAddress = address || "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb";

  // Update balance when token balance changes from blockchain
  useEffect(() => {
    if (tokenBalance?.formatted !== undefined) {
      const formattedBalance = tokenBalance.formatted;
      setBalance(formattedBalance);
      localStorage.setItem("pmBalance", formattedBalance);
      window.dispatchEvent(new Event("balanceUpdate"));
    }
  }, [tokenBalance]);

  // Generate QR code when wallet address changes
  useEffect(() => {
    const generateQR = async () => {
      try {
        const url = await QRCode.toDataURL(walletAddress, {
          width: 120,
          margin: 1,
          color: {
            dark: "#000000",
            light: "#FFFFFF"
          }
        });
        setQrCodeUrl(url);
      } catch (error) {
        console.error("QR generation error:", error);
      }
    };
    if (walletAddress) {
      generateQR();
    }
  }, [walletAddress]);

  // Listen for balance updates
  useEffect(() => {
    const handleBalanceUpdate = () => {
      const newBalance = localStorage.getItem("pmBalance") || "10000";
      setBalance(newBalance);
    };
    window.addEventListener("balanceUpdate", handleBalanceUpdate);
    return () => window.removeEventListener("balanceUpdate", handleBalanceUpdate);
  }, []);
  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    toast.success("Address copied to clipboard");
  };
  const addTokenToWallet = async () => {
    // Check for ethereum provider first
    const ethereum = (window as any).ethereum;
    if (!ethereum) {
      toast.error("No Web3 wallet detected. Please install MetaMask or another Web3 wallet.");
      return;
    }
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    // Validate token address format
    const tokenAddress = "0x181108f76d9910569203b5d59eb14Bc31961a989";
    if (!tokenAddress || !tokenAddress.startsWith("0x") || tokenAddress.length !== 42) {
      toast.error("Invalid token contract address");
      return;
    }
    try {
      // Use the new PM token icon in public folder
      const tokenImageUrl = `${window.location.origin}/pm-token-icon.png`;
      const wasAdded = await ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: tokenAddress,
            symbol: "PM",
            decimals: 18,
            image: tokenImageUrl
          }
        }
      });
      if (wasAdded) {
        toast.success("PM Token added to your wallet!");
      } else {
        toast.info("Token addition was cancelled");
      }
    } catch (error: any) {
      console.error("Error adding token:", error);
      if (error.code === 4001) {
        toast.info("Token addition was rejected by user");
      } else {
        toast.error("Could not add token. Please add it manually in your wallet.");
      }
    }
  };
  const quickFunctions = [{
    to: "/dashboard/virtual-card",
    icon: CreditCard,
    label: "PM Card",
    color: "text-amber-500",
    bg: "bg-amber-500/10"
  }, {
    to: "/dashboard/send",
    icon: Send,
    label: "Send",
    color: "text-primary",
    bg: "bg-primary/10"
  }, {
    to: "/dashboard/receive",
    icon: ArrowDownToLine,
    label: "Receive",
    color: "text-secondary",
    bg: "bg-secondary/10"
  }, {
    to: "/dashboard/swap",
    icon: ArrowDownUp,
    label: "Swap",
    color: "text-primary",
    bg: "bg-primary/10"
  }, {
    to: "/dashboard/trade",
    icon: CandlestickChart,
    label: "Trade",
    color: "text-green-500",
    bg: "bg-green-500/10"
  }, {
    to: "/dashboard/buy",
    icon: ShoppingCart,
    label: "Buy",
    color: "text-green-500",
    bg: "bg-green-500/10"
  }, {
    to: "/dashboard/stake",
    icon: TrendingUp,
    label: "Stake",
    color: "text-primary",
    bg: "bg-primary/10"
  }, {
    to: "/dashboard/merchant",
    icon: Store,
    label: "Merchant",
    color: "text-orange-500",
    bg: "bg-orange-500/10"
  }, {
    to: "/dashboard/store",
    icon: ShoppingBag,
    label: "PM Store",
    color: "text-rose-500",
    bg: "bg-rose-500/10"
  }, {
    to: "/dashboard/voucher",
    icon: Ticket,
    label: "Voucher",
    color: "text-teal-500",
    bg: "bg-teal-500/10"
  }, {
    to: "/dashboard/vault",
    icon: Vault,
    label: "Vault",
    color: "text-indigo-500",
    bg: "bg-indigo-500/10"
  }, {
    to: "/dashboard/referral",
    icon: Users,
    label: "Referral",
    color: "text-blue-500",
    bg: "bg-blue-500/10"
  }, {
    to: "/dashboard/airdrop",
    icon: Gift,
    label: "Airdrop",
    color: "text-purple-500",
    bg: "bg-purple-500/10"
  }, {
    to: "/dashboard/partners",
    icon: Handshake,
    label: "Partners",
    color: "text-yellow-500",
    bg: "bg-yellow-500/10"
  }, {
    to: "/dashboard/token-security",
    icon: Shield,
    label: "Security",
    color: "text-red-500",
    bg: "bg-red-500/10"
  }, {
    to: "/dashboard/community",
    icon: MessageCircle,
    label: "Community",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10"
  }, {
    to: "/dashboard/marketplace",
    icon: ShoppingCart,
    label: "Marketplace",
    color: "text-pink-500",
    bg: "bg-pink-500/10"
  }, {
    to: "/dashboard/token-sender",
    icon: SendHorizonal,
    label: "Token Sender",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10"
  }, {
    to: "/dashboard/token-locker",
    icon: Lock,
    label: "Token Locker",
    color: "text-amber-500",
    bg: "bg-amber-500/10"
  }, {
    to: "/dashboard/mint-nft",
    icon: Sparkles,
    label: "Mint NFT",
    color: "text-fuchsia-500",
    bg: "bg-fuchsia-500/10"
  }];
  return <div className="space-y-4">
      {/* Wallet Card Header */}
      {showQuickFunctionsToggle && <div className="flex items-center justify-between mb-3">
          <h2 className="text-primary font-semibold text-lg">Wallets</h2>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowPinSettings(true)} className="p-2 rounded-lg bg-primary/10 border border-primary/30 hover:bg-primary/20 transition-all duration-300" title="Security Settings">
              <Settings className="h-4 w-4 text-primary" />
            </button>
            <button onClick={() => setShowQuickFunctions(!showQuickFunctions)} className="p-2 rounded-lg bg-primary/10 border border-primary/30 hover:bg-primary/20 transition-all duration-300" title="Quick Functions">
              <Grid3X3 className="h-4 w-4 text-primary" />
            </button>
          </div>
        </div>}

      {/* PIN Settings Modal */}
      <PinSettingsModal open={showPinSettings} onClose={() => setShowPinSettings(false)} />

      {/* Professional Wallet Card */}
      <Card className="relative overflow-hidden rounded-2xl border-0 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-[#E53E3E] via-[#c53030] to-[#1a1f3c]" />
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative p-5 md:p-6">
          <div className="flex flex-col md:flex-row md:items-start gap-4">
            {/* QR Code Section */}
            <div className="flex items-start gap-4">
              <div className="bg-white p-2 rounded-lg shadow-lg">
                {qrCodeUrl ? <img src={qrCodeUrl} alt="Wallet QR Code" className="w-20 h-20 md:w-24 md:h-24" /> : <div className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center bg-gray-100 rounded">
                    <span className="text-xs text-gray-400">Loading...</span>
                  </div>}
              </div>

              {/* Token Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  {/* PM Logo */}
                  
                  <div className="flex flex-col">
                    <span className="text-white font-bold text-lg">Perfect Money</span>
                    <span className="text-white/80 text-[10px] font-medium">Just Made It Perfect</span>
                  </div>
                </div>

                {/* Wallet ID - Full Address */}
                <div className="mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-white/80 text-xs">WID:</span>
                    <span className="text-white font-mono text-xs md:text-sm truncate max-w-[120px] md:max-w-[200px]">
                      {walletAddress}
                    </span>
                    <button onClick={copyAddress} className="hover:text-white transition-colors text-white/60">
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Balance */}
                <div>
                  <p className="text-white md:text-3xl font-bold text-base">
                    {isBalanceLoading ? <span className="animate-pulse">Loading...</span> : `${parseFloat(balance).toLocaleString("en-US", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  })} PM`}
                  </p>
                  {isConnected && <p className="text-white/60 text-xs mt-1">Real-time • BSC Mainnet</p>}
                </div>
              </div>
            </div>

            {/* Status Badge - Desktop */}
            <div className="hidden md:flex ml-auto">
              <div className="px-3 py-1.5 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Connected
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      {!compact && <>
          <div className="flex gap-3 mt-4">
            <Button onClick={() => navigate("/dashboard/buy")} className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold gap-2">
              <ShoppingCart className="h-4 w-4" />
              Buy Token
            </Button>
            <Button variant="outline" onClick={addTokenToWallet} className="flex-1 border-primary/50 hover:bg-primary/10 text-foreground font-semibold gap-2">
              <img src={pmTokenLogo} alt="PM" className="h-4 w-4" />
              Add Token
            </Button>
          </div>

          {/* Separator */}
          <Separator className="my-4 bg-border/50" />
        </>}

      {/* Quick Functions Modal */}
      {showQuickFunctions && <Card className="relative overflow-hidden bg-card border border-border shadow-xl animate-fade-in">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Grid3X3 className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Quick Functions</h3>
              </div>
              <button onClick={() => setShowQuickFunctions(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {quickFunctions.map(item => <Link key={item.to} to={item.to} className="flex flex-col items-center gap-2 p-3 md:p-4 rounded-xl bg-muted/50 hover:bg-primary/10 transition-all border border-transparent hover:border-primary/30">
                  <div className={`p-2 md:p-3 rounded-full ${item.bg}`}>
                    <item.icon className={`h-4 w-4 md:h-5 md:w-5 ${item.color}`} />
                  </div>
                  <span className="text-[10px] md:text-xs font-medium">{item.label}</span>
                </Link>)}
            </div>
          </div>
        </Card>}
    </div>;
};