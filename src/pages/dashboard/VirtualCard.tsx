import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CreditCard, ArrowDownToLine, QrCode, Copy, Loader2, Sparkles, ShoppingCart, Settings, Store } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAccount, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { bsc } from "wagmi/chains";
import { toast } from "sonner";
import { formatEther, parseEther } from "viem";
import QRCode from "qrcode";
import pmTokenLogo from "@/assets/pm-token-logo.png";
import pmCardLogo from "@/assets/pm-card-logo.png";
import { PM_TOKEN_ADDRESS, CONTRACT_ADDRESSES } from "@/contracts/addresses";
import { VIRTUAL_CARD_ABI } from "@/contracts/virtualCardABI";
import { PMMerchantABI } from "@/contracts/merchantABI";
import VirtualCardTransactionHistory from "@/components/VirtualCardTransactionHistory";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const tierNames = ["Standard", "Bronze", "Silver", "Gold", "Platinum", "Diamond"];

interface Merchant {
  address: string;
  name: string;
  category: string;
  active: boolean;
}

const VirtualCardPage = () => {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [showSpendModal, setShowSpendModal] = useState(false);
  const [spendAmount, setSpendAmount] = useState("");
  const [selectedMerchant, setSelectedMerchant] = useState<string>("");
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loadingMerchants, setLoadingMerchants] = useState(false);
  const MERCHANT_CONTRACT_ADDRESS = CONTRACT_ADDRESSES[56].PMMerchant;
  const VIRTUAL_CARD_CONTRACT_ADDRESS = CONTRACT_ADDRESSES[56].PMVirtualCard || "0x0000000000000000000000000000000000000000";

  // Get PM token balance
  const { data: tokenBalance } = useBalance({
    address: address,
    token: PM_TOKEN_ADDRESS as `0x${string}`,
    chainId: 56
  });

  // Check if user has a card
  const { data: hasCard, refetch: refetchHasCard } = useReadContract({
    address: VIRTUAL_CARD_CONTRACT_ADDRESS as `0x${string}`,
    abi: VIRTUAL_CARD_ABI,
    functionName: "hasCard",
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  // Get card info
  const { data: cardInfo, refetch: refetchCardInfo } = useReadContract({
    address: VIRTUAL_CARD_CONTRACT_ADDRESS as `0x${string}`,
    abi: VIRTUAL_CARD_ABI,
    functionName: "getCardInfo",
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!hasCard }
  });

  // Get tier info for cashback rate
  const { data: tierInfo } = useReadContract({
    address: VIRTUAL_CARD_CONTRACT_ADDRESS as `0x${string}`,
    abi: VIRTUAL_CARD_ABI,
    functionName: "getTierInfo",
    args: cardInfo ? [cardInfo.tier] : undefined,
    query: { enabled: !!cardInfo }
  });

  // Contract write functions
  const { writeContract: createCard, data: createHash, isPending: isCreating } = useWriteContract();
  const { writeContract: spendCard, data: spendHash, isPending: isSpending } = useWriteContract();
  const { writeContract: withdraw, data: withdrawHash, isPending: isWithdrawing } = useWriteContract();

  // Transaction receipts
  const { isSuccess: createSuccess } = useWaitForTransactionReceipt({ hash: createHash });
  const { isSuccess: spendSuccess } = useWaitForTransactionReceipt({ hash: spendHash });
  const { isSuccess: withdrawSuccess } = useWaitForTransactionReceipt({ hash: withdrawHash });

  // Generate card number from wallet address
  const generateCardNumber = (addr: string): string => {
    if (!addr) return "0000 0000 0000 0000";
    const clean = addr.toLowerCase().replace("0x", "");
    const first8 = clean.slice(0, 8);
    const last8 = clean.slice(-8);
    const combined = (first8 + last8).toUpperCase();
    return `${combined.slice(0, 4)} ${combined.slice(4, 8)} ${combined.slice(8, 12)} ${combined.slice(12, 16)}`;
  };

  const cardNumber = address ? generateCardNumber(address) : "0000 0000 0000 0000";
  const cardBalance = cardInfo ? Number(formatEther(cardInfo.balance || BigInt(0))) : 0;
  const cardTier = cardInfo?.tier || 0;
  const cashbackRate = tierInfo ? Number(tierInfo.cashbackRate) / 100 : 0.5;

  // Generate QR code
  useEffect(() => {
    const generateQR = async () => {
      if (address) {
        try {
          const url = await QRCode.toDataURL(address, {
            width: 80,
            margin: 1,
            color: { dark: "#000000", light: "#FFFFFF" }
          });
          setQrCodeUrl(url);
        } catch (error) {
          console.error("QR generation error:", error);
        }
      }
    };
    generateQR();
  }, [address]);

  // Fetch active merchants from PMMerchant contract
  useEffect(() => {
    const fetchMerchants = async () => {
      if (MERCHANT_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
        // Contract not deployed, use empty list
        setMerchants([]);
        return;
      }
      
      setLoadingMerchants(true);
      try {
        // In production, you would fetch from the contract's getMerchantList function
        // For now, we'll attempt to get merchants that have active subscriptions
        // This would require indexing merchant subscription events
        setMerchants([]);
      } catch (error) {
        console.error("Error fetching merchants:", error);
        setMerchants([]);
      } finally {
        setLoadingMerchants(false);
      }
    };
    
    fetchMerchants();
  }, [MERCHANT_CONTRACT_ADDRESS]);

  // Refetch on success
  useEffect(() => {
    if (createSuccess || spendSuccess || withdrawSuccess) {
      refetchHasCard();
      refetchCardInfo();
      if (createSuccess) toast.success("Virtual Card created successfully!");
      if (spendSuccess) {
        toast.success("Payment successful! Cashback applied.");
        setShowSpendModal(false);
        setSpendAmount("");
        setSelectedMerchant("");
      }
      if (withdrawSuccess) toast.success("Withdrawal successful!");
    }
  }, [createSuccess, spendSuccess, withdrawSuccess]);

  const handleCreateCard = () => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet first");
      return;
    }
    createCard({
      address: VIRTUAL_CARD_CONTRACT_ADDRESS as `0x${string}`,
      abi: VIRTUAL_CARD_ABI,
      functionName: "createCard",
      account: address,
      chain: bsc
    });
  };

  const handleSpend = () => {
    if (!spendAmount || parseFloat(spendAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (!selectedMerchant) {
      toast.error("Please select a merchant");
      return;
    }
    if (parseFloat(spendAmount) > cardBalance) {
      toast.error("Insufficient card balance");
      return;
    }
    if (!address) return;
    
    spendCard({
      address: VIRTUAL_CARD_CONTRACT_ADDRESS as `0x${string}`,
      abi: VIRTUAL_CARD_ABI,
      functionName: "spend",
      account: address,
      chain: bsc,
      args: [parseEther(spendAmount)]
    });
  };

  const handleWithdraw = () => {
    if (cardBalance <= 0) {
      toast.error("No balance to withdraw");
      return;
    }
    if (!address) return;
    withdraw({
      address: VIRTUAL_CARD_CONTRACT_ADDRESS as `0x${string}`,
      abi: VIRTUAL_CARD_ABI,
      functionName: "withdraw",
      account: address,
      chain: bsc,
      args: [parseEther(cardBalance.toString())]
    });
  };

  const copyCardNumber = () => {
    navigator.clipboard.writeText(cardNumber.replace(/\s/g, ""));
    toast.success("Card number copied!");
  };

  const calculateCashback = (amount: string) => {
    const numAmount = parseFloat(amount) || 0;
    return (numAmount * cashbackRate / 100).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <CreditCard className="h-6 w-6 text-primary" />
                PM Virtual Card
              </h1>
              <p className="text-muted-foreground text-sm">Your crypto debit card</p>
            </div>
          </div>
          <Link to="/dashboard/virtual-card/admin">
            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="h-4 w-4" />
              Admin
            </Button>
          </Link>
        </div>

        {/* Virtual Card Display */}
        <div className="relative mb-8 px-2 sm:px-0">
          <div className={`relative w-full max-w-[360px] sm:max-w-md mx-auto aspect-[1.586/1] rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300`}>
            {/* Card Background - Red gradient matching Perfect Money style */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-red-700 to-red-900" />
            
            {/* Hexagon Pattern Overlay */}
            <div className="absolute inset-0 opacity-15" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0l17.32 10v20L20 40 2.68 30V10z' fill='none' stroke='%23ffffff' stroke-opacity='0.3'/%3E%3C/svg%3E")`,
              backgroundSize: "20px 20px",
            }} />
            
            {/* Gradient Overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/10" />

            {/* Card Content */}
            <div className="relative h-full p-3 sm:p-5 flex flex-col justify-between">
              {/* Header Row */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <img src={pmCardLogo} alt="PM" className="w-7 h-7 sm:w-10 sm:h-10 rounded-full shadow-lg" />
                  <div>
                    <p className="text-white font-bold text-[10px] sm:text-sm">Perfect Money</p>
                    <p className="text-white/70 text-[8px] sm:text-[10px]">Virtual Card</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold text-xs sm:text-base tracking-wider">VISA</p>
                  <p className="text-white/70 text-[8px] sm:text-[10px]">VIRTUAL</p>
                </div>
              </div>

              {/* Chip & QR Code Row */}
              <div className="flex items-center justify-between my-2 sm:my-4">
                {/* Chip */}
                <div className="w-9 h-7 sm:w-12 sm:h-9 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-md flex items-center justify-center">
                  <div className="w-6 h-5 sm:w-8 sm:h-6 border-2 border-yellow-600/50 rounded-sm grid grid-cols-2 gap-0.5 p-0.5">
                    <div className="bg-yellow-600/30 rounded-[2px]" />
                    <div className="bg-yellow-600/30 rounded-[2px]" />
                    <div className="bg-yellow-600/30 rounded-[2px]" />
                    <div className="bg-yellow-600/30 rounded-[2px]" />
                  </div>
                </div>
                
                {/* QR Code with Gold Border */}
                {qrCodeUrl && (
                  <div className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 p-0.5 sm:p-1 rounded-lg shadow-lg">
                    <div className="bg-white p-0.5 sm:p-1 rounded-md">
                      <img src={qrCodeUrl} alt="Card QR" className="w-9 h-9 sm:w-12 sm:h-12" />
                    </div>
                  </div>
                )}
              </div>

              {/* Card Number */}
              <div className="mb-1 sm:mb-2">
                <p className="text-white font-mono text-sm sm:text-lg md:text-xl tracking-[0.12em] sm:tracking-[0.2em] font-bold drop-shadow-lg">
                  {cardNumber}
                </p>
              </div>

              {/* Footer Row */}
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-white/60 text-[8px] sm:text-[10px] uppercase">Balance</p>
                  <p className="text-white font-bold text-sm sm:text-lg">
                    {cardBalance.toLocaleString()} PM
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="px-2 py-0.5 sm:px-3 sm:py-1 bg-white/20 backdrop-blur-sm rounded-full">
                      <p className="text-white font-semibold text-[10px] sm:text-xs">{tierNames[cardTier]}</p>
                    </div>
                    <div className="w-7 h-7 sm:w-10 sm:h-10 bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-full flex items-center justify-center border-2 border-yellow-400 shadow-lg">
                      <img src={pmTokenLogo} alt="PM" className="w-4 h-4 sm:w-6 sm:h-6" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {!hasCard ? (
            <Button
              onClick={handleCreateCard}
              disabled={isCreating || !isConnected}
              className="col-span-2 md:col-span-3 bg-primary hover:bg-primary/90 h-12"
            >
              {isCreating ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <Sparkles className="h-5 w-5 mr-2" />
              )}
              Create Virtual Card
            </Button>
          ) : (
            <>
              <Button
                onClick={() => navigate("/dashboard/buy")}
                className="bg-green-600 hover:bg-green-700 h-12"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Buy & Top Up
              </Button>
              
              <Dialog open={showSpendModal} onOpenChange={setShowSpendModal}>
                <DialogTrigger asChild>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 h-12"
                    disabled={cardBalance <= 0}
                  >
                    <Store className="h-5 w-5 mr-2" />
                    Spend
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Store className="h-5 w-5 text-primary" />
                      Spend with Card
                    </DialogTitle>
                    <DialogDescription>
                      Make a payment to a merchant using your virtual card balance.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Select Merchant</Label>
                      <Select value={selectedMerchant} onValueChange={setSelectedMerchant}>
                        <SelectTrigger className="bg-muted/50">
                          <SelectValue placeholder={loadingMerchants ? "Loading merchants..." : "Choose a merchant"} />
                        </SelectTrigger>
                        <SelectContent>
                          {merchants.length === 0 ? (
                            <SelectItem value="no-merchants" disabled>
                              {MERCHANT_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000" 
                                ? "Merchant contract not deployed" 
                                : "No active merchants found"}
                            </SelectItem>
                          ) : (
                            merchants.map((merchant) => (
                              <SelectItem key={merchant.address} value={merchant.address}>
                                <div className="flex flex-col">
                                  <span className="font-medium">{merchant.name}</span>
                                  <span className="text-xs text-muted-foreground">{merchant.category}</span>
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Amount (PM)</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={spendAmount}
                        onChange={(e) => setSpendAmount(e.target.value)}
                        className="bg-muted/50"
                      />
                      <p className="text-xs text-muted-foreground">
                        Available: {cardBalance.toLocaleString()} PM
                      </p>
                    </div>

                    {spendAmount && parseFloat(spendAmount) > 0 && (
                      <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                        <p className="text-sm text-green-500">
                          🎉 You'll earn <span className="font-bold">{calculateCashback(spendAmount)} PM</span> cashback ({cashbackRate}%)
                        </p>
                      </div>
                    )}

                    <Button
                      onClick={handleSpend}
                      disabled={isSpending || !spendAmount || !selectedMerchant}
                      className="w-full"
                    >
                      {isSpending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Store className="h-4 w-4 mr-2" />
                      )}
                      Confirm Payment
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Button
                onClick={handleWithdraw}
                disabled={isWithdrawing || cardBalance <= 0}
                variant="outline"
                className="h-12"
              >
                {isWithdrawing ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <ArrowDownToLine className="h-5 w-5 mr-2" />
                )}
                Withdraw
              </Button>
            </>
          )}
        </div>

        {/* Card Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                Card Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Card Number</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">{cardNumber}</span>
                  <button onClick={copyCardNumber} className="text-primary hover:text-primary/80">
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Status</span>
                <span className={`text-sm font-medium ${hasCard ? "text-green-500" : "text-yellow-500"}`}>
                  {hasCard ? "Active" : "Not Created"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Tier</span>
                <span className="text-sm font-medium">{tierNames[cardTier]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Cashback Rate</span>
                <span className="text-sm font-medium text-green-500">{cashbackRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Card Balance</span>
                <span className="text-sm font-bold text-primary">{cardBalance.toLocaleString()} PM</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <QrCode className="h-4 w-4 text-primary" />
                Wallet Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Connected Wallet</span>
                <span className="font-mono text-xs truncate max-w-[150px]">
                  {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Not connected"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Wallet Balance</span>
                <span className="text-sm font-medium">
                  {tokenBalance ? parseFloat(tokenBalance.formatted).toLocaleString() : "0"} PM
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Total Deposited</span>
                <span className="text-sm font-medium">
                  {cardInfo ? Number(formatEther(cardInfo.totalDeposited || BigInt(0))).toLocaleString() : "0"} PM
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Total Spent</span>
                <span className="text-sm font-medium">
                  {cardInfo ? Number(formatEther(cardInfo.totalSpent || BigInt(0))).toLocaleString() : "0"} PM
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <div className="mt-6">
          <VirtualCardTransactionHistory />
        </div>

        {/* Tier Benefits */}
        <Card className="mt-6 bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm">Tier Benefits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {tierNames.map((name, index) => (
                <div
                  key={name}
                  className={`p-3 rounded-lg border ${
                    index === cardTier
                      ? "border-primary bg-primary/10"
                      : "border-border bg-muted/50"
                  }`}
                >
                  <p className={`font-semibold text-sm ${index === cardTier ? "text-primary" : ""}`}>
                    {name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {index === 0 && "0.5% Cashback"}
                    {index === 1 && "1% Cashback"}
                    {index === 2 && "1.5% Cashback"}
                    {index === 3 && "2% Cashback"}
                    {index === 4 && "2.5% Cashback"}
                    {index === 5 && "3% Cashback"}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VirtualCardPage;
