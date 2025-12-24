import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/Header";
import { TradingViewTicker } from "@/components/TradingViewTicker";
import { HeroBanner } from "@/components/HeroBanner";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Footer } from "@/components/Footer";
import { ArrowLeft, Link as LinkIcon, Copy, CheckCircle, ExternalLink, Loader2, Clock, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { bsc } from "wagmi/chains";
import { parseEther, formatEther, keccak256, encodePacked } from "viem";
import { PM_TOKEN_ADDRESS, CONTRACT_ADDRESSES } from "@/contracts/addresses";
import { PMTokenABI } from "@/contracts/abis";
import QRCode from "qrcode";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// PMPayment ABI for payment link functions
const PMPaymentABI = [
  {
    inputs: [
      { name: "amount", type: "uint256" },
      { name: "description", type: "string" },
      { name: "expiresIn", type: "uint256" }
    ],
    name: "createPaymentLink",
    outputs: [{ type: "bytes32" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "linkId", type: "bytes32" }],
    name: "payLink",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "linkId", type: "bytes32" }],
    name: "cancelPaymentLink",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "linkId", type: "bytes32" }],
    name: "getPaymentLink",
    outputs: [
      {
        components: [
          { name: "merchant", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "description", type: "string" },
          { name: "active", type: "bool" },
          { name: "expiresAt", type: "uint256" }
        ],
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "merchant", type: "address" }],
    name: "getMerchantLinks",
    outputs: [{ type: "bytes32[]" }],
    stateMutability: "view",
    type: "function"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "linkId", type: "bytes32" },
      { indexed: true, name: "merchant", type: "address" },
      { indexed: false, name: "amount", type: "uint256" }
    ],
    name: "PaymentLinkCreated",
    type: "event"
  }
] as const;

const EXPIRY_OPTIONS = [
  { value: "3600", label: "1 Hour" },
  { value: "86400", label: "24 Hours" },
  { value: "259200", label: "3 Days" },
  { value: "604800", label: "7 Days" },
  { value: "2592000", label: "30 Days" },
];

const CreatePaymentLink = () => {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [expiresIn, setExpiresIn] = useState("86400");
  const [generatedLink, setGeneratedLink] = useState("");
  const [linkId, setLinkId] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [isCreatingOnChain, setIsCreatingOnChain] = useState(false);

  const PAYMENT_CONTRACT_ADDRESS = CONTRACT_ADDRESSES[56]?.PMPayment || "0x0000000000000000000000000000000000000000";
  const isContractDeployed = PAYMENT_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000";

  // Contract write for creating payment link
  const { writeContract, data: createHash, isPending: isCreating } = useWriteContract();
  const { isSuccess: createSuccess, isLoading: isWaitingForTx } = useWaitForTransactionReceipt({ hash: createHash });

  // Get user's PM balance
  const { data: pmBalance } = useReadContract({
    address: PM_TOKEN_ADDRESS as `0x${string}`,
    abi: PMTokenABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  // Handle successful transaction
  useEffect(() => {
    if (createSuccess && createHash) {
      const newLinkId = createHash.slice(0, 18);
      setLinkId(newLinkId);
      const link = `${window.location.origin}/pay/${newLinkId}`;
      setGeneratedLink(link);
      
      // Generate QR code
      QRCode.toDataURL(link, { width: 200, margin: 2 })
        .then(url => setQrCodeUrl(url))
        .catch(console.error);
      
      toast.success("Payment link created on blockchain!");
      setIsCreatingOnChain(false);
    }
  }, [createSuccess, createHash]);

  const handleGenerateOnChain = async () => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!isContractDeployed) {
      // Fallback to off-chain generation
      handleGenerateOffChain();
      return;
    }

    setIsCreatingOnChain(true);

    try {
      writeContract({
        address: PAYMENT_CONTRACT_ADDRESS as `0x${string}`,
        abi: PMPaymentABI,
        functionName: "createPaymentLink",
        args: [
          parseEther(amount),
          description || "Payment Request",
          BigInt(expiresIn)
        ],
        chain: bsc,
        account: address
      });
    } catch (error: any) {
      console.error("Error creating payment link:", error);
      toast.error(error?.message || "Failed to create payment link");
      setIsCreatingOnChain(false);
    }
  };

  const handleGenerateOffChain = () => {
    if (!amount) {
      toast.error("Please enter an amount");
      return;
    }

    // Get merchant API key
    const merchantApiKeys = JSON.parse(localStorage.getItem("merchantApiKeys") || "{}");
    const apiKey = address ? merchantApiKeys[address] : null;

    if (!apiKey) {
      toast.error("Merchant API key not found. Please subscribe to a merchant plan first.");
      return;
    }

    const newLinkId = Math.random().toString(36).substr(2, 9);
    const link = `${window.location.origin}/pay/${newLinkId}`;
    
    // Store payment link details locally
    const paymentLinks = JSON.parse(localStorage.getItem("paymentLinks") || "{}");
    paymentLinks[newLinkId] = {
      merchant: address,
      amount: parseFloat(amount),
      description: description || "Payment Request",
      createdAt: Date.now(),
      expiresAt: Date.now() + parseInt(expiresIn) * 1000,
      status: "pending"
    };
    localStorage.setItem("paymentLinks", JSON.stringify(paymentLinks));
    
    setLinkId(newLinkId);
    setGeneratedLink(link);
    
    // Generate QR code
    QRCode.toDataURL(link, { width: 200, margin: 2 })
      .then(url => setQrCodeUrl(url))
      .catch(console.error);
    
    toast.success("Payment link created successfully!");
  };

  const handlePaymentComplete = () => {
    const pmBalanceLocal = parseFloat(localStorage.getItem("pmBalance") || "10000");
    const newBalance = pmBalanceLocal + parseFloat(amount);
    localStorage.setItem("pmBalance", newBalance.toString());
    
    const merchantTransactions = JSON.parse(localStorage.getItem("merchantTransactions") || "[]");
    const newTransaction = {
      id: Date.now(),
      amount: parseFloat(amount),
      time: "Just now"
    };
    merchantTransactions.unshift(newTransaction);
    localStorage.setItem("merchantTransactions", JSON.stringify(merchantTransactions));
    
    const recentTransactions = JSON.parse(localStorage.getItem("recentTransactions") || "[]");
    const dashboardTransaction = {
      id: Date.now(),
      description: `Payment received: ${description || "Payment Link"}`,
      amount: parseFloat(amount),
      time: "Just now",
      type: "credit"
    };
    recentTransactions.unshift(dashboardTransaction);
    localStorage.setItem("recentTransactions", JSON.stringify(recentTransactions));
    
    window.dispatchEvent(new Event("balanceUpdate"));
    window.dispatchEvent(new Event("transactionUpdate"));
    window.dispatchEvent(new Event("merchantTransactionUpdate"));
    
    toast.success(`Payment of ${amount} PM received!`);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const getExpiryLabel = (value: string) => {
    return EXPIRY_OPTIONS.find(opt => opt.value === value)?.label || "24 Hours";
  };

  const isProcessing = isCreating || isWaitingForTx || isCreatingOnChain;

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 lg:pb-0">
      <Header />
      <TradingViewTicker />
      <HeroBanner 
        title="Create Payment Link" 
        subtitle="Generate blockchain-powered payment links"
      />
      
      <main className="container mx-auto px-4 pt-12 pb-12 flex-1">
        <Link to="/dashboard/merchant" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Merchant Dashboard
        </Link>

        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6 lg:mb-8">
            <div className="p-2 lg:p-3 rounded-lg bg-primary/10">
              <LinkIcon className="h-5 w-5 lg:h-6 lg:w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">Create Payment Link</h1>
              <p className="text-sm lg:text-base text-muted-foreground">
                {isContractDeployed ? "Create on-chain payment links using PMPayment contract" : "Generate shareable payment links"}
              </p>
            </div>
          </div>

          {!isConnected && (
            <Card className="p-4 mb-6 bg-yellow-500/10 border-yellow-500/30">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                <p className="text-sm">Connect your wallet to create payment links</p>
              </div>
            </Card>
          )}

          <Card className="p-4 lg:p-8 bg-card/50 backdrop-blur-sm mb-6">
            <h2 className="text-lg lg:text-xl font-bold mb-4 lg:mb-6">Payment Details</h2>
            <div className="space-y-4 lg:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                <div className="space-y-2">
                  <Label>Amount (PM)</Label>
                  <Input 
                    type="number" 
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="text-base"
                  />
                  {pmBalance && (
                    <p className="text-xs text-muted-foreground">
                      Your balance: {parseFloat(formatEther(pmBalance as bigint)).toLocaleString()} PM
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Expiry Time</Label>
                  <Select value={expiresIn} onValueChange={setExpiresIn}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select expiry" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPIRY_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Title / Description</Label>
                <Input 
                  placeholder="Payment for..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="text-base"
                />
              </div>

              <div className="space-y-2">
                <Label>Additional Notes (Optional)</Label>
                <Textarea 
                  placeholder="Additional details about this payment..."
                  className="min-h-[80px] lg:min-h-[100px] text-base"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {isContractDeployed ? (
                  <Button 
                    variant="gradient" 
                    onClick={handleGenerateOnChain} 
                    disabled={isProcessing || !isConnected}
                    className="w-full sm:w-auto"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {isWaitingForTx ? "Confirming..." : "Creating..."}
                      </>
                    ) : (
                      <>
                        <LinkIcon className="h-4 w-4 mr-2" />
                        Create On-Chain Link
                      </>
                    )}
                  </Button>
                ) : (
                  <Button 
                    variant="gradient" 
                    onClick={handleGenerateOffChain} 
                    disabled={!isConnected}
                    className="w-full sm:w-auto"
                  >
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Generate Payment Link
                  </Button>
                )}
              </div>

              {isContractDeployed && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  Using PMPayment contract for secure on-chain payment links
                </p>
              )}
            </div>
          </Card>

          {generatedLink && (
            <Card className="p-4 lg:p-8 bg-gradient-primary">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="h-5 w-5 lg:h-6 lg:w-6 text-green-500" />
                <h2 className="text-lg lg:text-xl font-bold">Payment Link Generated!</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 p-3 lg:p-4 bg-background/10 rounded-lg">
                    <p className="text-xs lg:text-sm text-foreground/80 mb-2">Your payment link:</p>
                    <p className="font-mono text-xs lg:text-sm break-all">{generatedLink}</p>
                  </div>
                  
                  {qrCodeUrl && (
                    <div className="flex justify-center">
                      <div className="p-2 bg-white rounded-lg">
                        <img src={qrCodeUrl} alt="Payment QR" className="w-24 h-24 lg:w-32 lg:h-32" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Button variant="secondary" onClick={handleCopy} className="w-full">
                    {copied ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Link
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate(`/dashboard/merchant/share-link?amount=${amount}&description=${description}&link=${generatedLink}`)}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  <Button variant="gradient" className="w-full" onClick={handlePaymentComplete}>
                    Simulate Payment
                  </Button>
                </div>

                <div className="pt-4 border-t border-border/20">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-foreground/60 mb-1">Amount</p>
                      <p className="font-bold">{amount} PM</p>
                    </div>
                    <div>
                      <p className="text-foreground/60 mb-1">Expires In</p>
                      <p className="font-bold">{getExpiryLabel(expiresIn)}</p>
                    </div>
                    {description && (
                      <div className="col-span-2">
                        <p className="text-foreground/60 mb-1">Description</p>
                        <p className="font-bold break-words">{description}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default CreatePaymentLink;