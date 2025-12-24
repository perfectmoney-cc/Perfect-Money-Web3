import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Header } from "@/components/Header";
import { TradingViewTicker } from "@/components/TradingViewTicker";
import { HeroBanner } from "@/components/HeroBanner";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Footer } from "@/components/Footer";
import { WalletCard } from "@/components/WalletCard";
import { AddressBookModal } from "@/components/AddressBookModal";
import { ArrowLeft, Send, Upload, Loader2, CheckCircle2, AlertCircle, Info, FileUp, Wallet, Plus, Fuel, Trash2, AlertTriangle, Book, BookPlus, TrendingUp, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useGasPrice, useReadContract } from 'wagmi';
import { parseUnits, formatEther, formatUnits, maxUint256 } from 'viem';
import { useTransactionHistory } from "@/hooks/useTransactionHistory";
import { useAddressBook } from "@/hooks/useAddressBook";
import { validateRecipientAddress } from "@/utils/addressValidation";
import { PMTokenSenderABI, ERC20_ABI } from "@/contracts/swapABI";
import { CONTRACT_ADDRESSES } from "@/contracts/addresses";
import bscLogo from "@/assets/bsc-logo.png";
import maticLogo from "@/assets/matic-logo.png";

const SUPPORTED_NETWORKS = [
  { id: "bsc", name: "BSC Mainnet", chainId: 56, logo: bscLogo, rpc: "https://bsc-dataseed.binance.org" },
  { id: "polygon", name: "Polygon Mainnet", chainId: 137, logo: maticLogo, rpc: "https://polygon-rpc.com" },
  { id: "base", name: "Base Mainnet", chainId: 8453, logo: bscLogo, rpc: "https://mainnet.base.org" },
  { id: "monad", name: "Monad Mainnet", chainId: 10143, logo: maticLogo, rpc: "https://testnet-rpc.monad.xyz" },
];

const PMTOKEN_SENDER_ADDRESS = CONTRACT_ADDRESSES[56].PMTokenSender as `0x${string}`;

interface Recipient {
  address: string;
  amount: string;
  isValid?: boolean;
  error?: string;
  isENS?: boolean;
}

interface ConnectedWallet {
  address: string;
  label: string;
}

interface TxResult {
  address: string;
  status: "success" | "failed" | "pending";
  hash?: string;
}

const TokenSenderPage = () => {
  const { address, isConnected } = useAccount();
  const { addTransaction } = useTransactionHistory();
  const { addAddress, addressExists } = useAddressBook();
  const [network, setNetwork] = useState("bsc");
  const [tokenAddress, setTokenAddress] = useState("");
  const [recipients, setRecipients] = useState<Recipient[]>([{ address: "", amount: "" }]);
  const [bulkInput, setBulkInput] = useState("");
  const [inputMode, setInputMode] = useState<"manual" | "bulk">("manual");
  const [isSending, setIsSending] = useState(false);
  const [txResults, setTxResults] = useState<TxResult[]>([]);
  const [needsApproval, setNeedsApproval] = useState(false);
  
  // Address book
  const [showAddressBook, setShowAddressBook] = useState(false);
  const [addressBookTargetIndex, setAddressBookTargetIndex] = useState<number>(0);
  
  // Batch execution state
  const [currentBatchIndex, setCurrentBatchIndex] = useState(0);
  const [batchProgress, setBatchProgress] = useState(0);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);

  // Multi-wallet support
  const [wallets, setWallets] = useState<ConnectedWallet[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<string>("");

  // Gas estimation
  const [totalGasCost, setTotalGasCost] = useState<string>("0");
  const [gasPrice, setGasPrice] = useState<string>("0");

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash });
  const { data: gasPriceData } = useGasPrice({ chainId: 56 });

  // Check if contract is deployed
  const isContractDeployed = PMTOKEN_SENDER_ADDRESS !== "0x0000000000000000000000000000000000000000";

  // Read global stats from PMTokenSender contract
  const { data: globalStats } = useReadContract({
    address: PMTOKEN_SENDER_ADDRESS,
    abi: PMTokenSenderABI,
    functionName: 'getGlobalStats',
    chainId: 56,
    query: { enabled: isContractDeployed }
  });

  // Read user stats from PMTokenSender contract
  const { data: userStats } = useReadContract({
    address: PMTOKEN_SENDER_ADDRESS,
    abi: PMTokenSenderABI,
    functionName: 'getUserStats',
    args: address ? [address] : undefined,
    chainId: 56,
    query: { enabled: isContractDeployed && !!address }
  });

  // Read service fee
  const { data: serviceFee } = useReadContract({
    address: PMTOKEN_SENDER_ADDRESS,
    abi: PMTokenSenderABI,
    functionName: 'serviceFee',
    chainId: 56,
    query: { enabled: isContractDeployed }
  });

  // Check allowance
  const { data: allowanceData, refetch: refetchAllowance } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address && isContractDeployed ? [address, PMTOKEN_SENDER_ADDRESS] : undefined,
    query: { enabled: !!tokenAddress && !!address && isContractDeployed }
  });

  // Format stats
  const totalTransactions = globalStats ? (globalStats as any)[0].toString() : "0";
  const totalAmountSent = globalStats ? formatUnits((globalStats as any)[1], 18) : "0";
  const currentServiceFee = serviceFee ? formatEther(serviceFee as bigint) : "0";
  const userTxCount = userStats ? (userStats as any)[0].toString() : "0";
  const userTotalSent = userStats ? formatUnits((userStats as any)[1], 18) : "0";

  // Initialize wallets with connected wallet
  useEffect(() => {
    if (isConnected && address) {
      const existingWallets = wallets.filter(w => w.address !== address);
      setWallets([{ address, label: "Primary Wallet" }, ...existingWallets]);
      if (!selectedWallet) setSelectedWallet(address);
    }
  }, [isConnected, address]);

  // Check if approval is needed
  useEffect(() => {
    if (tokenAddress && allowanceData !== undefined && isContractDeployed) {
      const totalAmount = getTotalAmount();
      if (totalAmount > 0) {
        const requiredAmount = parseUnits(totalAmount.toString(), 18);
        setNeedsApproval(BigInt(allowanceData as bigint) < requiredAmount);
      }
    } else {
      setNeedsApproval(false);
    }
  }, [tokenAddress, allowanceData, recipients]);

  // Gas estimation
  useEffect(() => {
    const estimateGasCost = async () => {
      const validRecipients = recipients.filter(r => r.address && r.amount && r.isValid !== false);
      if (!tokenAddress || validRecipients.length === 0) {
        setTotalGasCost("0");
        return;
      }
      try {
        const gasPerTx = isContractDeployed ? 85000n : 65000n; // Higher gas for contract
        const totalGas = gasPerTx * BigInt(validRecipients.length);
        if (gasPriceData) {
          const totalCost = totalGas * gasPriceData;
          setGasPrice(formatEther(gasPriceData));
          setTotalGasCost(formatEther(totalCost));
        }
      } catch (error) {
        console.error("Gas estimation error:", error);
      }
    };
    estimateGasCost();
  }, [tokenAddress, recipients, gasPriceData, isContractDeployed]);

  // Validate address on change
  const validateAndUpdateRecipient = (index: number, field: "address" | "amount", value: string) => {
    const updated = [...recipients];
    updated[index][field] = value;
    
    if (field === "address") {
      const validation = validateRecipientAddress(value);
      updated[index].isValid = validation.isValid;
      updated[index].error = validation.error;
      updated[index].isENS = validation.isENS;
    }
    
    setRecipients(updated);
  };

  const addWallet = () => {
    const newWalletAddress = prompt("Enter wallet address:");
    if (newWalletAddress && newWalletAddress.startsWith("0x")) {
      const label = prompt("Enter wallet label:") || `Wallet ${wallets.length + 1}`;
      setWallets([...wallets, { address: newWalletAddress, label }]);
      toast.success("Wallet added successfully");
    } else if (newWalletAddress) {
      toast.error("Invalid wallet address");
    }
  };

  const removeWallet = (walletAddress: string) => {
    if (walletAddress === address) {
      toast.error("Cannot remove primary wallet");
      return;
    }
    setWallets(wallets.filter(w => w.address !== walletAddress));
    if (selectedWallet === walletAddress) setSelectedWallet(address || "");
  };

  const addRecipient = () => {
    setRecipients([...recipients, { address: "", amount: "" }]);
  };

  const removeRecipient = (index: number) => {
    if (recipients.length > 1) {
      setRecipients(recipients.filter((_, i) => i !== index));
    }
  };

  const parseBulkInput = () => {
    const lines = bulkInput.split('\n').filter(line => line.trim());
    const parsed: Recipient[] = [];
    
    for (const line of lines) {
      const [addr, amount] = line.split(',').map(s => s.trim());
      if (addr && amount) {
        const validation = validateRecipientAddress(addr);
        parsed.push({
          address: addr,
          amount,
          isValid: validation.isValid,
          error: validation.error,
          isENS: validation.isENS
        });
      }
    }
    
    if (parsed.length > 0) {
      setRecipients(parsed);
      setInputMode("manual");
      const invalidCount = parsed.filter(r => !r.isValid).length;
      if (invalidCount > 0) {
        toast.warning(`Parsed ${parsed.length} recipients, ${invalidCount} have invalid addresses`);
      } else {
        toast.success(`Parsed ${parsed.length} valid recipients`);
      }
    } else {
      toast.error("Invalid format. Use: address,amount per line");
    }
  };

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith('.csv')) {
      toast.error("Please upload a CSV file");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      const parsed: Recipient[] = [];
      const startIndex = lines[0]?.toLowerCase().includes('address') ? 1 : 0;
      
      for (let i = startIndex; i < lines.length; i++) {
        const parts = lines[i].split(',').map(s => s.trim().replace(/"/g, ''));
        if (parts.length >= 2 && parts[0] && parts[1]) {
          const validation = validateRecipientAddress(parts[0]);
          parsed.push({
            address: parts[0],
            amount: parts[1],
            isValid: validation.isValid,
            error: validation.error,
            isENS: validation.isENS
          });
        }
      }
      
      if (parsed.length > 0) {
        setRecipients(parsed);
        setInputMode("manual");
        const invalidCount = parsed.filter(r => !r.isValid).length;
        if (invalidCount > 0) {
          toast.warning(`Imported ${parsed.length} recipients, ${invalidCount} have invalid addresses`);
        } else {
          toast.success(`Imported ${parsed.length} valid recipients from CSV`);
        }
      } else {
        toast.error("No valid recipients found in CSV");
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const getTotalAmount = () => {
    return recipients.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
  };

  const getValidRecipients = () => {
    return recipients.filter(r => r.address && r.amount && r.isValid !== false);
  };

  const handleApprove = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }
    if (!tokenAddress) {
      toast.error("Please enter a token contract address");
      return;
    }

    try {
      writeContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [PMTOKEN_SENDER_ADDRESS, maxUint256],
      } as any);
      toast.info("Please confirm the approval in your wallet");
    } catch (error: any) {
      toast.error(error?.message || "Approval failed");
    }
  };

  const handleBatchSend = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }
    if (!tokenAddress) {
      toast.error("Please enter a token contract address");
      return;
    }
    
    const validRecipients = getValidRecipients();
    if (validRecipients.length === 0) {
      toast.error("No valid recipients to send to");
      return;
    }

    setIsSending(true);
    setIsBatchProcessing(true);
    setTxResults([]);
    setCurrentBatchIndex(0);
    setBatchProgress(0);

    try {
      // Use PMTokenSender contract if deployed
      if (isContractDeployed && validRecipients.length > 1) {
        const addresses = validRecipients.map(r => r.address as `0x${string}`);
        const amounts = validRecipients.map(r => parseUnits(r.amount, 18));
        const fee = serviceFee as bigint || BigInt(0);

        writeContract({
          address: PMTOKEN_SENDER_ADDRESS,
          abi: PMTokenSenderABI,
          functionName: 'batchSendToken',
          args: [tokenAddress as `0x${string}`, addresses, amounts],
          value: fee,
        } as any);

        setTxResults(validRecipients.map(r => ({ address: r.address, status: "pending" })));
        setBatchProgress(100);

        addTransaction({
          type: 'send',
          amount: getTotalAmount().toString(),
          token: 'TOKEN',
          address: `${validRecipients.length} recipients`,
          status: 'pending'
        });

      } else {
        // Fallback to individual transfers
        for (let i = 0; i < validRecipients.length; i++) {
          const recipient = validRecipients[i];
          setCurrentBatchIndex(i + 1);
          setBatchProgress(((i + 1) / validRecipients.length) * 100);

          try {
            setTxResults(prev => [...prev, { address: recipient.address, status: "pending" }]);

            if (isContractDeployed) {
              const fee = serviceFee as bigint || BigInt(0);
              writeContract({
                address: PMTOKEN_SENDER_ADDRESS,
                abi: PMTokenSenderABI,
                functionName: 'sendToken',
                args: [tokenAddress as `0x${string}`, recipient.address as `0x${string}`, parseUnits(recipient.amount, 18)],
                value: fee,
              } as any);
            } else {
              writeContract({
                address: tokenAddress as `0x${string}`,
                abi: ERC20_ABI,
                functionName: 'transfer',
                args: [recipient.address as `0x${string}`, parseUnits(recipient.amount, 18)]
              } as any);
            }

            addTransaction({
              type: 'send',
              amount: recipient.amount,
              token: 'TOKEN',
              address: recipient.address,
              status: 'pending'
            });

            setTxResults(prev => 
              prev.map((r, idx) => idx === prev.length - 1 ? { ...r, status: "success" } : r)
            );

            await new Promise(resolve => setTimeout(resolve, 500));
          } catch (error) {
            setTxResults(prev => 
              prev.map((r, idx) => idx === prev.length - 1 ? { ...r, status: "failed" } : r)
            );
          }
        }
      }

      toast.success(`Batch sending initiated! ${validRecipients.length} transactions.`);
    } catch (error: any) {
      toast.error(error?.message || "Batch send failed");
    }

    setIsSending(false);
    setIsBatchProcessing(false);
  };

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed && txHash) {
      refetchAllowance();
      if (needsApproval) {
        toast.success("Token approved! You can now send tokens.");
        setNeedsApproval(false);
      } else {
        setTxResults(prev => prev.map(r => ({ ...r, status: "success" })));
        toast.success("Transactions completed successfully!");
      }
      window.dispatchEvent(new Event("balanceUpdate"));
      window.dispatchEvent(new Event("transactionUpdate"));
    }
  }, [isConfirmed, txHash]);

  const selectedNetwork = SUPPORTED_NETWORKS.find(n => n.id === network);
  const validRecipientsCount = getValidRecipients().length;
  const invalidRecipientsCount = recipients.filter(r => r.address && r.isValid === false).length;

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 lg:pb-0">
      <Header />
      <TradingViewTicker />
      <HeroBanner title="Token Sender" subtitle="Send tokens to multiple addresses in bulk across multiple networks" />
      
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="md:hidden mb-6 mt-8">
          <WalletCard showQuickFunctionsToggle={false} compact={true} />
        </div>
        
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 text-sm">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        {/* Global Stats Card */}
        <Card className="p-4 mb-6 bg-gradient-to-br from-primary/10 to-secondary/10 backdrop-blur-sm border-primary/30">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h3 className="font-bold">PMTokenSender Statistics</h3>
            {!isContractDeployed && (
              <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full ml-auto">Not Deployed</span>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="p-2 bg-background/50 rounded-lg text-center">
              <p className="text-xs text-muted-foreground">Total Txs</p>
              <p className="font-bold">{Number(totalTransactions).toLocaleString()}</p>
            </div>
            <div className="p-2 bg-background/50 rounded-lg text-center">
              <p className="text-xs text-muted-foreground">Total Sent</p>
              <p className="font-bold">{Number(totalAmountSent).toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
            </div>
            <div className="p-2 bg-background/50 rounded-lg text-center">
              <p className="text-xs text-muted-foreground">Your Txs</p>
              <p className="font-bold">{userTxCount}</p>
            </div>
            <div className="p-2 bg-background/50 rounded-lg text-center">
              <p className="text-xs text-muted-foreground">Your Sent</p>
              <p className="font-bold">{Number(userTotalSent).toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
            </div>
            <div className="p-2 bg-background/50 rounded-lg text-center">
              <p className="text-xs text-muted-foreground">Service Fee</p>
              <p className="font-bold">{currentServiceFee} BNB</p>
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Multi-Wallet Selection */}
            <Card className="p-6 bg-card/50 backdrop-blur-sm">
              <h2 className="font-bold mb-4 flex items-center gap-2 text-base">
                <Wallet className="h-5 w-5 text-primary" />
                Source Wallets
              </h2>
              
              <div className="space-y-3">
                {wallets.map(wallet => (
                  <div key={wallet.address} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="selectedWallet" 
                        checked={selectedWallet === wallet.address} 
                        onChange={() => setSelectedWallet(wallet.address)} 
                        className="h-4 w-4 text-primary" 
                      />
                      <div>
                        <p className="font-medium text-sm">{wallet.label}</p>
                        <p className="text-xs text-muted-foreground font-mono">{wallet.address.slice(0, 10)}...{wallet.address.slice(-8)}</p>
                      </div>
                    </div>
                    {wallet.address !== address && (
                      <Button variant="ghost" size="sm" onClick={() => removeWallet(wallet.address)}>
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="outline" onClick={addWallet} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Wallet
                </Button>
              </div>
            </Card>

            {/* Network Selection */}
            <Card className="p-6 bg-card/50 backdrop-blur-sm">
              <h2 className="font-bold mb-4 flex items-center gap-2 text-base">
                <Info className="h-5 w-5 text-primary" />
                Network & Token Configuration
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Select Network</Label>
                  <Select value={network} onValueChange={setNetwork}>
                    <SelectTrigger>
                      <SelectValue>
                        <div className="flex items-center gap-2">
                          <img src={selectedNetwork?.logo} alt={selectedNetwork?.name} className="h-5 w-5" />
                          <span>{selectedNetwork?.name}</span>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_NETWORKS.map(n => (
                        <SelectItem key={n.id} value={n.id}>
                          <div className="flex items-center gap-2">
                            <img src={n.logo} alt={n.name} className="h-5 w-5" />
                            <span>{n.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Token Contract Address</Label>
                  <Input placeholder="0x..." value={tokenAddress} onChange={e => setTokenAddress(e.target.value)} />
                </div>
              </div>
            </Card>

            {/* Recipients Input */}
            <Card className="p-6 bg-card/50 backdrop-blur-sm">
              <div className="mb-4 flex items-center justify-between gap-2">
                <h2 className="font-bold flex items-center gap-2 text-base">
                  <Send className="h-5 w-5 text-primary" />
                  Recipients
                  {invalidRecipientsCount > 0 && (
                    <span className="text-xs text-red-400 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {invalidRecipientsCount} invalid
                    </span>
                  )}
                </h2>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => { setAddressBookTargetIndex(0); setShowAddressBook(true); }}
                    className="text-sm"
                  >
                    <Book className="h-4 w-4 mr-1" />
                    Address Book
                  </Button>
                  <Button variant={inputMode === "manual" ? "default" : "outline"} size="sm" onClick={() => setInputMode("manual")} className="text-sm">
                    Manual
                  </Button>
                  <Button variant={inputMode === "bulk" ? "default" : "outline"} size="sm" onClick={() => setInputMode("bulk")} className="text-sm">
                    <Upload className="h-4 w-4 mr-1" />
                    Bulk
                  </Button>
                </div>
              </div>

              {inputMode === "manual" ? (
                <div className="space-y-3">
                  {recipients.map((recipient, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex gap-2 items-start">
                        <div className="flex-1 relative">
                          <Input 
                            placeholder="Recipient address (0x... or ENS.eth)" 
                            value={recipient.address} 
                            onChange={e => validateAndUpdateRecipient(index, "address", e.target.value)}
                            className={`pr-10 ${recipient.isValid === false ? "border-red-500" : recipient.isENS ? "border-blue-500" : ""}`}
                          />
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                            onClick={() => { setAddressBookTargetIndex(index); setShowAddressBook(true); }}
                            title="Select from Address Book"
                          >
                            <Book className="h-4 w-4 text-muted-foreground hover:text-primary" />
                          </Button>
                        </div>
                        <div className="w-32">
                          <Input 
                            placeholder="Amount" 
                            type="number" 
                            value={recipient.amount} 
                            onChange={e => validateAndUpdateRecipient(index, "amount", e.target.value)} 
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          {recipient.isValid === true && !addressExists(recipient.address) && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 w-7 p-0"
                              onClick={() => {
                                const label = prompt("Enter a label for this address:");
                                if (label) {
                                  addAddress(recipient.address, label);
                                  toast.success("Address saved to address book");
                                }
                              }}
                              title="Save to Address Book"
                            >
                              <BookPlus className="h-4 w-4 text-green-500" />
                            </Button>
                          )}
                          {recipient.isValid === true && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                          {recipient.isValid === false && <AlertCircle className="h-5 w-5 text-red-500" />}
                          {recipient.isENS && <span className="text-xs text-blue-400">ENS</span>}
                        </div>
                        {recipients.length > 1 && (
                          <Button variant="ghost" size="icon" onClick={() => removeRecipient(index)}>×</Button>
                        )}
                      </div>
                      {recipient.error && (
                        <p className="text-xs text-red-400 ml-1">{recipient.error}</p>
                      )}
                    </div>
                  ))}
                  <Button variant="outline" onClick={addRecipient} className="w-full">
                    + Add Recipient
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                    <input type="file" accept=".csv" onChange={handleCsvUpload} className="hidden" id="csv-upload" />
                    <label htmlFor="csv-upload" className="cursor-pointer">
                      <FileUp className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">Click to upload CSV file</p>
                      <p className="text-xs text-muted-foreground mt-1">Format: address,amount (one per line)</p>
                    </label>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">Or paste manually</span>
                    </div>
                  </div>

                  <Textarea 
                    placeholder={`Enter recipients (one per line)\nFormat: address,amount\nSupports ENS names (.eth)\nExample:\n0x123...,100\nvitalik.eth,200`}
                    value={bulkInput} 
                    onChange={e => setBulkInput(e.target.value)} 
                    rows={6} 
                  />
                  <Button variant="outline" onClick={parseBulkInput} className="w-full">
                    Parse Recipients
                  </Button>
                </div>
              )}
            </Card>

            {/* Batch Progress */}
            {isBatchProcessing && (
              <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/30">
                <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  Batch Processing
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Processing transaction {currentBatchIndex} of {validRecipientsCount}</span>
                    <span className="font-medium">{Math.round(batchProgress)}%</span>
                  </div>
                  <Progress value={batchProgress} className="h-3" />
                </div>
              </Card>
            )}

            {/* Transaction Results */}
            {txResults.length > 0 && (
              <Card className="p-6 bg-card/50 backdrop-blur-sm">
                <h2 className="font-bold text-lg mb-4">Transaction Results</h2>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {txResults.map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded bg-muted/50">
                      <span className="text-sm font-mono truncate max-w-[200px]">{result.address}</span>
                      {result.status === "pending" && <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />}
                      {result.status === "success" && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                      {result.status === "failed" && <AlertCircle className="h-5 w-5 text-red-500" />}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            {/* Gas Estimation Preview */}
            <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/20">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Fuel className="h-5 w-5 text-primary" />
                Gas Estimation
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Gas Price</span>
                  <span className="font-medium">{parseFloat(gasPrice).toFixed(9)} BNB</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Est. Gas per Tx</span>
                  <span className="font-medium">~{isContractDeployed ? "85,000" : "65,000"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Valid Recipients</span>
                  <span className="font-medium">{validRecipientsCount}</span>
                </div>
                {isContractDeployed && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Service Fee</span>
                    <span className="font-medium">{currentServiceFee} BNB</span>
                  </div>
                )}
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between text-sm font-semibold">
                    <span className="text-primary">Total Gas Cost</span>
                    <span className="text-primary">{parseFloat(totalGasCost).toFixed(6)} BNB</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur-sm">
              <h3 className="font-bold text-lg mb-4">Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Network</span>
                  <span className="font-medium">{selectedNetwork?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Source Wallet</span>
                  <span className="font-medium font-mono text-xs">{selectedWallet.slice(0, 6)}...{selectedWallet.slice(-4)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Valid Recipients</span>
                  <span className="font-medium text-green-400">{validRecipientsCount}</span>
                </div>
                {invalidRecipientsCount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Invalid Recipients</span>
                    <span className="font-medium text-red-400">{invalidRecipientsCount}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Amount</span>
                  <span className="font-medium">{getTotalAmount().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Est. Gas Fee</span>
                  <span className="font-medium">{parseFloat(totalGasCost).toFixed(6)} BNB</span>
                </div>
              </div>
              
              {needsApproval && isContractDeployed ? (
                <Button 
                  variant="outline" 
                  className="w-full mt-6" 
                  onClick={handleApprove} 
                  disabled={isPending || isConfirming || !isConnected || !tokenAddress}
                >
                  {isPending || isConfirming ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    <>Approve Token</>
                  )}
                </Button>
              ) : (
                <Button 
                  variant="gradient" 
                  className="w-full mt-6" 
                  onClick={handleBatchSend} 
                  disabled={isSending || !isConnected || validRecipientsCount === 0 || isPending || isConfirming}
                >
                  {isSending || isPending || isConfirming ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending {currentBatchIndex}/{validRecipientsCount}...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send to {validRecipientsCount} Recipients
                    </>
                  )}
                </Button>
              )}
            </Card>

            <Card className="p-4 bg-primary/10 border-primary/20">
              <p className="text-sm text-muted-foreground">
                <span className="font-bold text-foreground">💡 Tip:</span> {isContractDeployed 
                  ? "PMTokenSender contract saves gas on batch transactions. Max 500 recipients per batch."
                  : "Deploy PMTokenSender contract for optimized batch transactions."}
              </p>
            </Card>

            <div className="hidden md:block mt-6">
              <WalletCard showQuickFunctionsToggle={false} />
            </div>
          </div>
        </div>

        {/* How It Works - Desktop Only */}
        <div className="hidden lg:block mt-8">
          <Card className="p-6 bg-card/50 backdrop-blur-sm">
            <h2 className="font-bold text-lg mb-6 text-center">How Token Sender Works</h2>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center mx-auto">
                  <span className="text-primary font-bold text-lg">1</span>
                </div>
                <h3 className="font-semibold text-sm">Connect Wallet</h3>
                <p className="text-xs text-muted-foreground">Connect your Web3 wallet and select the source wallet for distribution</p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center mx-auto">
                  <span className="text-primary font-bold text-lg">2</span>
                </div>
                <h3 className="font-semibold text-sm">Configure Token</h3>
                <p className="text-xs text-muted-foreground">Select network and enter the token contract address you want to send</p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center mx-auto">
                  <span className="text-primary font-bold text-lg">3</span>
                </div>
                <h3 className="font-semibold text-sm">Add Recipients</h3>
                <p className="text-xs text-muted-foreground">Enter addresses manually, import from CSV, or select from your address book</p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center mx-auto">
                  <span className="text-primary font-bold text-lg">4</span>
                </div>
                <h3 className="font-semibold text-sm">Execute Send</h3>
                <p className="text-xs text-muted-foreground">Review gas estimation and execute batch transactions to all recipients</p>
              </div>
            </div>
          </Card>
        </div>
      </main>

      {/* Address Book Modal */}
      <AddressBookModal
        open={showAddressBook}
        onClose={() => setShowAddressBook(false)}
        onSelectAddress={(selectedAddress) => {
          const validation = validateRecipientAddress(selectedAddress);
          const updated = [...recipients];
          updated[addressBookTargetIndex] = {
            ...updated[addressBookTargetIndex],
            address: selectedAddress,
            isValid: validation.isValid,
            error: validation.error,
            isENS: validation.isENS
          };
          setRecipients(updated);
        }}
      />

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default TokenSenderPage;