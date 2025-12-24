import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/Header";
import { TradingViewTicker } from "@/components/TradingViewTicker";
import { HeroBanner } from "@/components/HeroBanner";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Footer } from "@/components/Footer";
import { WalletCard } from "@/components/WalletCard";
import { Ticket, Gift, Clock, CheckCircle, XCircle, Search, Plus, QrCode, Scan, Loader2, ArrowLeft, Settings, FileText, BarChart3, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId } from "wagmi";
import { voucherABI } from "@/contracts/voucherABI";
import { CONTRACT_ADDRESSES, ChainId } from "@/contracts/addresses";
import { QRScannerModal } from "@/components/QRScannerModal";
import { CreateVoucherModal } from "@/components/CreateVoucherModal";
import { BulkVoucherModal } from "@/components/voucher/BulkVoucherModal";
import { VoucherTemplates, VoucherTemplate } from "@/components/voucher/VoucherTemplates";
import { MerchantAnalytics } from "@/components/voucher/MerchantAnalytics";
import { VoucherGiftModal } from "@/components/voucher/VoucherGiftModal";
import { bsc } from "wagmi/chains";

interface VoucherItem {
  id: string;
  code: string;
  name: string;
  value: string;
  expiryDate: string;
  status: "active" | "used" | "expired";
  type: "discount" | "gift" | "reward";
  isTransferable: boolean;
}

const Voucher = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [vouchers, setVouchers] = useState<VoucherItem[]>([]);
  const [redeemCode, setRedeemCode] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [selectedVoucherForGift, setSelectedVoucherForGift] = useState<VoucherItem | null>(null);
  const [activeTab, setActiveTab] = useState("vouchers");

  const currentChainId = (chainId === 56 || chainId === 97 ? chainId : 56) as ChainId;
  const voucherAddress = CONTRACT_ADDRESSES[currentChainId]?.PMVoucher || "0x0000000000000000000000000000000000000000";

  const { writeContract, data: redeemTxHash, isPending: isRedeeming } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: redeemSuccess } = useWaitForTransactionReceipt({
    hash: redeemTxHash,
  });

  const { data: userVoucherIds, refetch: refetchVouchers } = useReadContract({
    address: voucherAddress as `0x${string}`,
    abi: voucherABI,
    functionName: "getUserVouchers",
    args: address ? [address] : undefined,
  });

  const { data: isMerchant } = useReadContract({
    address: voucherAddress as `0x${string}`,
    abi: voucherABI,
    functionName: "approvedMerchants",
    args: address ? [address] : undefined,
  });

  const { data: contractOwner } = useReadContract({
    address: voucherAddress as `0x${string}`,
    abi: voucherABI,
    functionName: "owner",
  });

  const canCreateVouchers = isMerchant || (address && contractOwner && address.toLowerCase() === (contractOwner as string).toLowerCase());
  const isOwner = address && contractOwner && address.toLowerCase() === (contractOwner as string).toLowerCase();

  useEffect(() => {
    if (redeemSuccess) {
      toast.success("Voucher redeemed successfully!");
      setRedeemCode("");
      refetchVouchers();
    }
  }, [redeemSuccess]);

  const filteredVouchers = vouchers.filter(
    (v) =>
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeVouchers = filteredVouchers.filter((v) => v.status === "active");
  const usedVouchers = filteredVouchers.filter((v) => v.status === "used");
  const expiredVouchers = filteredVouchers.filter((v) => v.status === "expired");

  const handleRedeem = async () => {
    if (!redeemCode.trim()) {
      toast.error("Please enter a voucher code");
      return;
    }
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      writeContract({
        address: voucherAddress as `0x${string}`,
        abi: voucherABI,
        functionName: "redeemVoucher",
        args: [redeemCode],
        chain: bsc,
        account: address,
      });
    } catch (error) {
      console.error("Redeem error:", error);
      toast.error("Failed to redeem voucher");
    }
  };

  const handleScanResult = (code: string) => {
    setRedeemCode(code);
    toast.success(`QR Code scanned: ${code}`);
  };

  const getStatusBadge = (status: VoucherItem["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Active</Badge>;
      case "used":
        return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">Used</Badge>;
      case "expired":
        return <Badge className="bg-red-500/20 text-red-500 border-red-500/30">Expired</Badge>;
    }
  };

  const getTypeIcon = (type: VoucherItem["type"]) => {
    switch (type) {
      case "discount":
        return <Ticket className="h-5 w-5 text-primary" />;
      case "gift":
        return <Gift className="h-5 w-5 text-purple-500" />;
      case "reward":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
  };

  const VoucherCard = ({ voucher }: { voucher: VoucherItem }) => (
    <Card className="p-4 bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">{getTypeIcon(voucher.type)}</div>
          <div>
            <h3 className="font-semibold text-sm">{voucher.name}</h3>
            <p className="text-xs text-muted-foreground font-mono">{voucher.code}</p>
          </div>
        </div>
        {getStatusBadge(voucher.status)}
      </div>
      <div className="flex items-center justify-between mt-4">
        <div>
          <p className="text-lg font-bold text-primary">{voucher.value}</p>
          <p className="text-xs text-muted-foreground">Expires: {voucher.expiryDate}</p>
        </div>
        {voucher.status === "active" && (
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs"
              onClick={() => {
                setSelectedVoucherForGift(voucher);
                setShowGiftModal(true);
              }}
            >
              <Send className="h-3 w-3 mr-1" />
              Gift
            </Button>
            <Button size="sm" variant="outline" className="text-xs">
              <QrCode className="h-3 w-3 mr-1" />
              Use
            </Button>
          </div>
        )}
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 lg:pb-0">
      <Header />
      <TradingViewTicker />
      <HeroBanner title="My Vouchers" subtitle="Manage and redeem your PM vouchers" />

      <main className="container mx-auto px-4 pt-12 pb-12 flex-1">
        {/* Mobile Wallet Card */}
        <div className="md:hidden mb-6">
          <WalletCard showQuickFunctionsToggle={false} compact={true} />
        </div>

        <div className="flex items-center justify-between mb-6">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          {isOwner && (
            <Link to="/dashboard/voucher/admin">
              <Button variant="outline" size="sm" className="gap-2">
                <Settings className="h-4 w-4" />
                Admin Panel
              </Button>
            </Link>
          )}
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Redeem Voucher Section */}
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Plus className="h-5 w-5 text-primary" />
                <h2 className="font-semibold">Redeem Voucher</h2>
              </div>
              {canCreateVouchers && (
                <div className="flex gap-2">
                  <Button onClick={() => setShowBulkModal(true)} size="sm" variant="outline" className="gap-2">
                    <FileText className="h-4 w-4" />
                    Bulk Create
                  </Button>
                  <Button onClick={() => setShowCreateModal(true)} size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create
                  </Button>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <Input
                placeholder="Enter voucher code"
                value={redeemCode}
                onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={() => setShowScanner(true)}
                className="px-3"
              >
                <Scan className="h-4 w-4" />
              </Button>
              <Button 
                onClick={handleRedeem} 
                disabled={isRedeeming || isConfirming || !isConnected}
                className="bg-primary hover:bg-primary/90"
              >
                {(isRedeeming || isConfirming) ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Redeem"
                )}
              </Button>
            </div>
          </Card>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search vouchers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4 text-center bg-green-500/10 border-green-500/30">
              <p className="text-2xl font-bold text-green-500">{activeVouchers.length}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </Card>
            <Card className="p-4 text-center bg-yellow-500/10 border-yellow-500/30">
              <p className="text-2xl font-bold text-yellow-500">{usedVouchers.length}</p>
              <p className="text-xs text-muted-foreground">Used</p>
            </Card>
            <Card className="p-4 text-center bg-red-500/10 border-red-500/30">
              <p className="text-2xl font-bold text-red-500">{expiredVouchers.length}</p>
              <p className="text-xs text-muted-foreground">Expired</p>
            </Card>
          </div>

          {/* Vouchers Tabs */}
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="active">Active ({activeVouchers.length})</TabsTrigger>
              <TabsTrigger value="used">Used ({usedVouchers.length})</TabsTrigger>
              <TabsTrigger value="expired">Expired ({expiredVouchers.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="mt-4 space-y-3">
              {activeVouchers.length > 0 ? (
                activeVouchers.map((voucher) => <VoucherCard key={voucher.id} voucher={voucher} />)
              ) : (
                <Card className="p-8 text-center">
                  <Ticket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No active vouchers</p>
                  <p className="text-sm text-muted-foreground mt-2">Redeem a voucher code to get started</p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="used" className="mt-4 space-y-3">
              {usedVouchers.length > 0 ? (
                usedVouchers.map((voucher) => <VoucherCard key={voucher.id} voucher={voucher} />)
              ) : (
                <Card className="p-8 text-center">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No used vouchers</p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="expired" className="mt-4 space-y-3">
              {expiredVouchers.length > 0 ? (
                expiredVouchers.map((voucher) => <VoucherCard key={voucher.id} voucher={voucher} />)
              ) : (
                <Card className="p-8 text-center">
                  <XCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No expired vouchers</p>
                </Card>
              )}
            </TabsContent>
          </Tabs>
          {/* Merchant Features */}
          {canCreateVouchers && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="vouchers">My Vouchers</TabsTrigger>
                <TabsTrigger value="templates">Templates</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="templates" className="mt-4">
                <VoucherTemplates onSelectTemplate={(template) => {
                  setShowCreateModal(true);
                  toast.info(`${template.name} template applied`);
                }} />
              </TabsContent>

              <TabsContent value="analytics" className="mt-4">
                <MerchantAnalytics />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>

      <Footer />
      <MobileBottomNav />

      <QRScannerModal
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleScanResult}
      />

      <CreateVoucherModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => refetchVouchers()}
      />

      <BulkVoucherModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        onSuccess={() => refetchVouchers()}
      />

      {selectedVoucherForGift && (
        <VoucherGiftModal
          isOpen={showGiftModal}
          onClose={() => {
            setShowGiftModal(false);
            setSelectedVoucherForGift(null);
          }}
          voucher={selectedVoucherForGift}
          onSuccess={() => refetchVouchers()}
        />
      )}
    </div>
  );
};

export default Voucher;