import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/Header";
import { TradingViewTicker } from "@/components/TradingViewTicker";
import { HeroBanner } from "@/components/HeroBanner";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Footer } from "@/components/Footer";
import { WalletCard } from "@/components/WalletCard";
import { 
  ArrowLeft, Settings, Users, Store, CheckCircle, XCircle, 
  Loader2, Shield, Ticket, Ban, UserCheck, Plus, Trash2 
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId } from "wagmi";
import { voucherABI } from "@/contracts/voucherABI";
import { CONTRACT_ADDRESSES, ChainId } from "@/contracts/addresses";
import { bsc } from "wagmi/chains";

const VoucherAdmin = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [merchantAddress, setMerchantAddress] = useState("");
  const [newFeeCollector, setNewFeeCollector] = useState("");
  const [checkMerchantAddress, setCheckMerchantAddress] = useState("");

  const currentChainId = (chainId === 56 || chainId === 97 ? chainId : 56) as ChainId;
  const voucherAddress = CONTRACT_ADDRESSES[currentChainId]?.PMVoucher || "0x0000000000000000000000000000000000000000";

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  // Read contract owner
  const { data: contractOwner } = useReadContract({
    address: voucherAddress as `0x${string}`,
    abi: voucherABI,
    functionName: "owner",
  });

  // Read fee collector
  const { data: feeCollector } = useReadContract({
    address: voucherAddress as `0x${string}`,
    abi: voucherABI,
    functionName: "feeCollector",
  });

  // Check if connected user is merchant
  const { data: isUserMerchant } = useReadContract({
    address: voucherAddress as `0x${string}`,
    abi: voucherABI,
    functionName: "approvedMerchants",
    args: address ? [address as `0x${string}`] : undefined,
  });


  // Check if checked address is merchant
  const { data: isMerchantApproved, refetch: recheckMerchant } = useReadContract({
    address: voucherAddress as `0x${string}`,
    abi: voucherABI,
    functionName: "approvedMerchants",
    args: checkMerchantAddress ? [checkMerchantAddress as `0x${string}`] : undefined,
  });

  const isOwner = address && contractOwner && address.toLowerCase() === (contractOwner as string).toLowerCase();

  useEffect(() => {
    if (isSuccess) {
      toast.success("Transaction successful!");
      setMerchantAddress("");
      setNewFeeCollector("");
      recheckMerchant();
    }
  }, [isSuccess]);

  const handleApproveMerchant = async () => {
    if (!merchantAddress) {
      toast.error("Please enter a merchant address");
      return;
    }

    try {
      writeContract({
        address: voucherAddress as `0x${string}`,
        abi: voucherABI,
        functionName: "approveMerchant",
        args: [merchantAddress as `0x${string}`],
        chain: bsc,
        account: address,
      });
    } catch (error) {
      console.error("Approve error:", error);
      toast.error("Failed to approve merchant");
    }
  };

  const handleRevokeMerchant = async () => {
    if (!merchantAddress) {
      toast.error("Please enter a merchant address");
      return;
    }

    try {
      writeContract({
        address: voucherAddress as `0x${string}`,
        abi: voucherABI,
        functionName: "revokeMerchant",
        args: [merchantAddress as `0x${string}`],
        chain: bsc,
        account: address,
      });
    } catch (error) {
      console.error("Revoke error:", error);
      toast.error("Failed to revoke merchant");
    }
  };

  const handleSetFeeCollector = async () => {
    if (!newFeeCollector) {
      toast.error("Please enter a fee collector address");
      return;
    }

    try {
      writeContract({
        address: voucherAddress as `0x${string}`,
        abi: voucherABI,
        functionName: "setFeeCollector",
        args: [newFeeCollector as `0x${string}`],
        chain: bsc,
        account: address,
      });
    } catch (error) {
      console.error("Set fee collector error:", error);
      toast.error("Failed to set fee collector");
    }
  };

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-background flex flex-col pb-20 lg:pb-0">
        <Header />
        <TradingViewTicker />
        <HeroBanner title="Voucher Admin" subtitle="Manage voucher system settings" />

        <main className="container mx-auto px-4 pt-12 pb-12 flex-1">
          <div className="md:hidden mb-6">
            <WalletCard showQuickFunctionsToggle={false} compact={true} />
          </div>

          <Link to="/dashboard/voucher" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 text-sm">
            <ArrowLeft className="h-4 w-4" />
            Back to Vouchers
          </Link>

          <Card className="max-w-xl mx-auto p-8 text-center">
            <Shield className="h-16 w-16 mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">Only the contract owner can access this page.</p>
          </Card>
        </main>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 lg:pb-0">
      <Header />
      <TradingViewTicker />
      <HeroBanner title="Voucher Admin" subtitle="Manage voucher system settings" />

      <main className="container mx-auto px-4 pt-12 pb-12 flex-1">
        <div className="md:hidden mb-6">
          <WalletCard showQuickFunctionsToggle={false} compact={true} />
        </div>

        <Link to="/dashboard/voucher" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 text-sm">
          <ArrowLeft className="h-4 w-4" />
          Back to Vouchers
        </Link>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Contract Status */}
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/30">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Contract Status</h2>
              <Badge className="bg-green-500/20 text-green-500">Owner</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-background/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Contract Address</p>
                <p className="font-mono text-sm truncate">{voucherAddress}</p>
              </div>
              <div className="p-4 bg-background/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Fee Collector</p>
                <p className="font-mono text-sm truncate">{feeCollector as string || "Not set"}</p>
              </div>
            </div>
          </Card>

          <Tabs defaultValue="merchants" className="w-full">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="merchants">
                <Users className="h-4 w-4 mr-2" />
                Merchants
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="merchants" className="mt-4 space-y-4">
              {/* Approve/Revoke Merchant */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Store className="h-5 w-5 text-primary" />
                  Manage Merchants
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label>Merchant Address</Label>
                    <Input
                      placeholder="0x..."
                      value={merchantAddress}
                      onChange={(e) => setMerchantAddress(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={handleApproveMerchant}
                      disabled={isPending || isConfirming}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {(isPending || isConfirming) ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <UserCheck className="h-4 w-4 mr-2" />
                          Approve
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleRevokeMerchant}
                      disabled={isPending || isConfirming}
                      variant="destructive"
                      className="flex-1"
                    >
                      {(isPending || isConfirming) ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Ban className="h-4 w-4 mr-2" />
                          Revoke
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Check Merchant Status */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Check Merchant Status
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label>Address to Check</Label>
                    <Input
                      placeholder="0x..."
                      value={checkMerchantAddress}
                      onChange={(e) => setCheckMerchantAddress(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <Button onClick={() => recheckMerchant()} variant="outline" className="w-full">
                    Check Status
                  </Button>
                  {checkMerchantAddress && (
                    <div className="p-4 rounded-lg bg-muted/50 flex items-center justify-between">
                      <span className="font-mono text-sm truncate">{checkMerchantAddress}</span>
                      {isMerchantApproved ? (
                        <Badge className="bg-green-500/20 text-green-500">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approved
                        </Badge>
                      ) : (
                        <Badge className="bg-red-500/20 text-red-500">
                          <XCircle className="h-3 w-3 mr-1" />
                          Not Approved
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="mt-4 space-y-4">
              {/* Fee Collector */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  Fee Collector
                </h3>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">Current Fee Collector</p>
                    <p className="font-mono text-sm">{feeCollector as string || "Not set"}</p>
                  </div>
                  <div>
                    <Label>New Fee Collector Address</Label>
                    <Input
                      placeholder="0x..."
                      value={newFeeCollector}
                      onChange={(e) => setNewFeeCollector(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <Button
                    onClick={handleSetFeeCollector}
                    disabled={isPending || isConfirming}
                    className="w-full"
                  >
                    {(isPending || isConfirming) ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Update Fee Collector"
                    )}
                  </Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default VoucherAdmin;