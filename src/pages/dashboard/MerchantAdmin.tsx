import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Settings, History, Wallet, Shield, DollarSign, 
  RefreshCw, Copy, Check, Eye, EyeOff, Pause, Play, Users,
  TrendingUp, AlertTriangle, CheckCircle, XCircle, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, formatEther, formatUnits, parseUnits } from "viem";
import { paymentABI } from "@/contracts/paymentABI";

const PAYMENT_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000";

const MerchantAdmin = () => {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const [copiedText, setCopiedText] = useState<string | null>(null);
  
  // Contract Settings State
  const [platformFee, setPlatformFee] = useState("100"); // basis points (1%)
  const [newCollector, setNewCollector] = useState("");
  const [widgetTitle, setWidgetTitle] = useState("Perfect Money Payment");
  const [widgetDescription, setWidgetDescription] = useState("Complete your payment securely");
  const [widgetActive, setWidgetActive] = useState(true);
  const [defaultAmount, setDefaultAmount] = useState("100");
  const [defaultCurrency, setDefaultCurrency] = useState("PM");

  // Mock Transaction History
  const [transactions] = useState([
    {
      id: "pay_abc123xyz",
      from: "0x1234...5678",
      to: "0xabcd...efgh",
      amount: "100.00",
      currency: "PM",
      status: "completed",
      timestamp: new Date(Date.now() - 3600000),
      txHash: "0x1234567890abcdef..."
    },
    {
      id: "pay_def456uvw",
      from: "0x9876...5432",
      to: "0xabcd...efgh",
      amount: "250.50",
      currency: "USDT",
      status: "completed",
      timestamp: new Date(Date.now() - 7200000),
      txHash: "0xfedcba0987654321..."
    },
    {
      id: "pay_ghi789rst",
      from: "0x1111...2222",
      to: "0xabcd...efgh",
      amount: "75.00",
      currency: "USDC",
      status: "pending",
      timestamp: new Date(Date.now() - 1800000),
      txHash: null
    },
    {
      id: "pay_jkl012opq",
      from: "0x3333...4444",
      to: "0xabcd...efgh",
      amount: "500.00",
      currency: "BNB",
      status: "failed",
      timestamp: new Date(Date.now() - 10800000),
      txHash: null
    },
    {
      id: "pay_mno345lmn",
      from: "0x5555...6666",
      to: "0xabcd...efgh",
      amount: "1000.00",
      currency: "PM",
      status: "refunded",
      timestamp: new Date(Date.now() - 86400000),
      txHash: "0xabcdef1234567890..."
    }
  ]);

  // Stats
  const stats = {
    totalVolume: "125,450.00",
    totalTransactions: 1247,
    successRate: 98.5,
    pendingPayments: 12,
    todayVolume: "4,520.00",
    averageAmount: "100.60"
  };

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    toast.success(`${label} copied!`);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleUpdatePlatformFee = async () => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }
    try {
      toast.success(`Platform fee updated to ${parseInt(platformFee) / 100}%`);
    } catch (error) {
      toast.error("Failed to update platform fee");
    }
  };

  const handleUpdateCollector = async () => {
    if (!address || !newCollector) {
      toast.error("Please enter a valid collector address");
      return;
    }
    try {
      toast.success("Fee collector address updated");
      setNewCollector("");
    } catch (error) {
      toast.error("Failed to update collector address");
    }
  };

  const handleSaveWidgetConfig = async () => {
    try {
      toast.success("Widget configuration saved!");
    } catch (error) {
      toast.error("Failed to save widget configuration");
    }
  };

  const handlePauseContract = async (pause: boolean) => {
    try {
      toast.success(pause ? "Contract paused" : "Contract resumed");
    } catch (error) {
      toast.error("Failed to update contract status");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" /> Completed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-600"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case "failed":
        return <Badge className="bg-red-600"><XCircle className="h-3 w-3 mr-1" /> Failed</Badge>;
      case "refunded":
        return <Badge className="bg-purple-600"><RefreshCw className="h-3 w-3 mr-1" /> Refunded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCurrencyBadge = (currency: string) => {
    const colors: Record<string, string> = {
      PM: "bg-primary",
      USDT: "bg-green-600",
      USDC: "bg-blue-600",
      BNB: "bg-yellow-600"
    };
    return <Badge className={colors[currency] || "bg-muted"}>{currency}</Badge>;
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Connect Wallet</h2>
              <p className="text-muted-foreground">Please connect your wallet to access the Merchant Admin Panel.</p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/merchant")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Merchant Admin Panel</h1>
              <p className="text-muted-foreground">Manage payment contract settings and view transactions</p>
            </div>
          </div>
          <Badge variant="outline" className="border-primary text-primary">
            <Shield className="h-3 w-3 mr-1" /> Admin Access
          </Badge>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-primary">${stats.totalVolume}</div>
              <p className="text-xs text-muted-foreground">Total Volume</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stats.totalTransactions}</div>
              <p className="text-xs text-muted-foreground">Transactions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-green-500">{stats.successRate}%</div>
              <p className="text-xs text-muted-foreground">Success Rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-yellow-500">{stats.pendingPayments}</div>
              <p className="text-xs text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">${stats.todayVolume}</div>
              <p className="text-xs text-muted-foreground">Today's Volume</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">${stats.averageAmount}</div>
              <p className="text-xs text-muted-foreground">Avg. Amount</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="settings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" /> Contract Settings
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" /> Transaction History
            </TabsTrigger>
            <TabsTrigger value="widget" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" /> Widget Config
            </TabsTrigger>
          </TabsList>

          {/* Contract Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Platform Fee */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Platform Fee
                  </CardTitle>
                  <CardDescription>Set the platform fee percentage for all payments</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Fee (in basis points, 100 = 1%)</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={platformFee}
                        onChange={(e) => setPlatformFee(e.target.value)}
                        min="0"
                        max="1000"
                      />
                      <Button onClick={handleUpdatePlatformFee} disabled={isPending}>
                        {isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Update"}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Current: {parseInt(platformFee) / 100}% fee on all transactions
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Fee Collector */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-primary" />
                    Fee Collector Address
                  </CardTitle>
                  <CardDescription>Address to receive platform fees</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Current Collector</Label>
                    <div className="flex gap-2">
                      <Input
                        value={address || ""}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(address || "", "Address")}
                      >
                        {copiedText === "Address" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>New Collector Address</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="0x..."
                        value={newCollector}
                        onChange={(e) => setNewCollector(e.target.value)}
                        className="font-mono"
                      />
                      <Button onClick={handleUpdateCollector} disabled={isPending || !newCollector}>
                        Update
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contract Control */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Contract Control
                  </CardTitle>
                  <CardDescription>Pause or resume the payment contract</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                      <span className="font-medium">Contract Status: Active</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-yellow-500 border-yellow-500/50"
                        onClick={() => handlePauseContract(true)}
                      >
                        <Pause className="h-4 w-4 mr-1" /> Pause
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-500 border-green-500/50"
                        onClick={() => handlePauseContract(false)}
                      >
                        <Play className="h-4 w-4 mr-1" /> Resume
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    ⚠️ Pausing the contract will prevent all new payments from being processed.
                  </p>
                </CardContent>
              </Card>

              {/* Supported Currencies */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Supported Currencies
                  </CardTitle>
                  <CardDescription>Enable or disable payment currencies</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {["PM Token", "USDT (BEP20)", "USDC (BEP20)", "BNB"].map((currency) => (
                      <div key={currency} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="font-medium">{currency}</span>
                        <Switch defaultChecked />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Transaction History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Transactions</CardTitle>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" /> Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2">ID</th>
                        <th className="text-left py-3 px-2">From</th>
                        <th className="text-left py-3 px-2">Amount</th>
                        <th className="text-left py-3 px-2">Currency</th>
                        <th className="text-left py-3 px-2">Status</th>
                        <th className="text-left py-3 px-2">Time</th>
                        <th className="text-left py-3 px-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-2 font-mono text-sm">{tx.id.slice(0, 12)}...</td>
                          <td className="py-3 px-2 font-mono text-sm">{tx.from}</td>
                          <td className="py-3 px-2 font-medium">{tx.amount}</td>
                          <td className="py-3 px-2">{getCurrencyBadge(tx.currency)}</td>
                          <td className="py-3 px-2">{getStatusBadge(tx.status)}</td>
                          <td className="py-3 px-2 text-sm text-muted-foreground">
                            {tx.timestamp.toLocaleString()}
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex gap-1">
                              {tx.txHash && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => window.open(`https://bscscan.com/tx/${tx.txHash}`, '_blank')}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              )}
                              {tx.status === "completed" && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-purple-500"
                                  onClick={() => toast.info("Refund dialog would open here")}
                                >
                                  <RefreshCw className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Widget Configuration Tab */}
          <TabsContent value="widget" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Widget Appearance */}
              <Card>
                <CardHeader>
                  <CardTitle>Widget Appearance</CardTitle>
                  <CardDescription>Customize how your payment widget looks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Widget Title</Label>
                    <Input
                      value={widgetTitle}
                      onChange={(e) => setWidgetTitle(e.target.value)}
                      placeholder="Perfect Money Payment"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Widget Description</Label>
                    <Input
                      value={widgetDescription}
                      onChange={(e) => setWidgetDescription(e.target.value)}
                      placeholder="Complete your payment securely"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Widget Active</Label>
                    <Switch
                      checked={widgetActive}
                      onCheckedChange={setWidgetActive}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Default Payment Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Default Payment Settings</CardTitle>
                  <CardDescription>Set default values for the payment widget</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Default Amount</Label>
                    <Input
                      type="number"
                      value={defaultAmount}
                      onChange={(e) => setDefaultAmount(e.target.value)}
                      placeholder="100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Default Currency</Label>
                    <select
                      className="w-full p-2 border rounded-lg bg-background"
                      value={defaultCurrency}
                      onChange={(e) => setDefaultCurrency(e.target.value)}
                    >
                      <option value="PM">PM Token</option>
                      <option value="USDT">USDT (BEP20)</option>
                      <option value="USDC">USDC (BEP20)</option>
                      <option value="BNB">BNB</option>
                    </select>
                  </div>
                  <Button className="w-full" onClick={handleSaveWidgetConfig}>
                    Save Widget Configuration
                  </Button>
                </CardContent>
              </Card>

              {/* Widget Preview */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Widget Preview</CardTitle>
                  <CardDescription>See how your widget will appear to customers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="max-w-md mx-auto p-6 border rounded-xl bg-gradient-to-b from-background to-muted">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold">{widgetTitle}</h3>
                      <p className="text-muted-foreground text-sm">{widgetDescription}</p>
                    </div>
                    <div className="space-y-4">
                      <div className="p-4 bg-background rounded-lg border">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Amount</span>
                          <span className="font-bold text-xl">{defaultAmount} {defaultCurrency}</span>
                        </div>
                      </div>
                      <Button className="w-full" size="lg">
                        Pay Now
                      </Button>
                      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                        <Shield className="h-3 w-3" />
                        Secured by Perfect Money
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default MerchantAdmin;
