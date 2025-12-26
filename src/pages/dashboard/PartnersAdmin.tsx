import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Settings, Users, Building2, Globe, Loader2, Plus, Trash2, Edit, CheckCircle, XCircle, MapPin, ExternalLink, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { bsc } from "wagmi/chains";
import { toast } from "sonner";
import { formatEther, parseEther } from "viem";
import { CONTRACT_ADDRESSES } from "@/contracts/addresses";
import { PMPartnershipABI, PM_PARTNERSHIP_CONTRACT_ADDRESS } from "@/contracts/partnershipABI";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

const tierNames = ["Bronze", "Silver", "Gold", "Platinum"];

// Mock data - will be replaced with blockchain data when contract is deployed
const mockApplications = [
  { id: 1, name: "Crypto Ventures Ltd", email: "contact@cryptoventures.com", type: "Exchange", country: "USA", status: "Pending", appliedAt: "2024-01-15" },
  { id: 2, name: "BlockTech Inc", email: "info@blocktech.io", type: "Technology", country: "UK", status: "Pending", appliedAt: "2024-01-18" },
  { id: 3, name: "DeFi Solutions", email: "hello@defisolutions.com", type: "DeFi Protocol", country: "Singapore", status: "Approved", appliedAt: "2024-01-10" },
  { id: 4, name: "NFT Gallery", email: "support@nftgallery.art", type: "Marketplace", country: "Germany", status: "Rejected", appliedAt: "2024-01-12" },
];

const mockPartners = [
  { id: 1, name: "CryptoExchange Pro", type: "Exchange", country: "USA", status: "Active", revenue: "125,000", joinedAt: "2023-06-15", wallet: "0x1234...5678" },
  { id: 2, name: "BlockTech Solutions", type: "Technology", country: "UK", status: "Active", revenue: "89,500", joinedAt: "2023-07-22", wallet: "0xabcd...efgh" },
  { id: 3, name: "Asia Wallet", type: "Wallet Provider", country: "Singapore", status: "Active", revenue: "156,200", joinedAt: "2023-08-10", wallet: "0x9876...5432" },
  { id: 4, name: "Euro Digital", type: "Marketplace", country: "Germany", status: "Inactive", revenue: "45,300", joinedAt: "2023-09-05", wallet: "0xfedc...ba98" },
];

const PartnersAdmin = () => {
  const { address, isConnected } = useAccount();
  const [selectedApplication, setSelectedApplication] = useState<number | null>(null);
  const [showAddPartner, setShowAddPartner] = useState(false);
  const [newPartner, setNewPartner] = useState({
    name: "",
    email: "",
    type: "",
    country: "",
    description: "",
    lat: "",
    lng: ""
  });

  // Read global stats from contract
  const { data: globalStats, refetch: refetchStats } = useReadContract({
    address: PM_PARTNERSHIP_CONTRACT_ADDRESS as `0x${string}`,
    abi: PMPartnershipABI,
    functionName: "getGlobalStats",
    query: { enabled: PM_PARTNERSHIP_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000" }
  });

  // Read contract owner
  const { data: contractOwner } = useReadContract({
    address: PM_PARTNERSHIP_CONTRACT_ADDRESS as `0x${string}`,
    abi: PMPartnershipABI,
    functionName: "owner",
    query: { enabled: PM_PARTNERSHIP_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000" }
  });

  // Contract writes
  const { writeContract: approveApp, data: approveHash, isPending: isApproving } = useWriteContract();
  const { writeContract: rejectApp, data: rejectHash, isPending: isRejecting } = useWriteContract();
  const { writeContract: updateStatus, data: statusHash, isPending: isUpdatingStatus } = useWriteContract();
  const { writeContract: addPartnerFn, data: addHash, isPending: isAdding } = useWriteContract();

  // Transaction receipts
  const { isSuccess: approveSuccess } = useWaitForTransactionReceipt({ hash: approveHash });
  const { isSuccess: rejectSuccess } = useWaitForTransactionReceipt({ hash: rejectHash });
  const { isSuccess: statusSuccess } = useWaitForTransactionReceipt({ hash: statusHash });
  const { isSuccess: addSuccess } = useWaitForTransactionReceipt({ hash: addHash });

  useEffect(() => {
    if (approveSuccess) {
      toast.success("Application approved!");
      refetchStats();
    }
    if (rejectSuccess) {
      toast.success("Application rejected");
      refetchStats();
    }
    if (statusSuccess) {
      toast.success("Partner status updated!");
      refetchStats();
    }
    if (addSuccess) {
      toast.success("Partner added successfully!");
      setShowAddPartner(false);
      setNewPartner({ name: "", email: "", type: "", country: "", description: "", lat: "", lng: "" });
      refetchStats();
    }
  }, [approveSuccess, rejectSuccess, statusSuccess, addSuccess]);

  // Check if user is contract owner
  const isOwner = contractOwner 
    ? contractOwner.toLowerCase() === address?.toLowerCase() 
    : true; // Default to true for mock data when contract not deployed

  // Use blockchain stats if available, otherwise use mock data
  const totalPartners = globalStats ? Number(globalStats[0]) : mockPartners.length;
  const activePartners = globalStats ? Number(globalStats[1]) : mockPartners.filter(p => p.status === "Active").length;
  const pendingApplications = globalStats ? Number(globalStats[2]) : mockApplications.filter(a => a.status === "Pending").length;
  const totalRevenuePaid = globalStats ? Number(formatEther(globalStats[3])) : 0;

  const handleApprove = (id: number) => {
    if (PM_PARTNERSHIP_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000") {
      approveApp({
        address: PM_PARTNERSHIP_CONTRACT_ADDRESS as `0x${string}`,
        abi: PMPartnershipABI,
        functionName: "approveApplication",
        args: [BigInt(id)],
        account: address,
        chain: bsc
      });
    } else {
      toast.success(`Application #${id} approved! (Mock)`);
    }
  };

  const handleReject = (id: number) => {
    if (PM_PARTNERSHIP_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000") {
      rejectApp({
        address: PM_PARTNERSHIP_CONTRACT_ADDRESS as `0x${string}`,
        abi: PMPartnershipABI,
        functionName: "rejectApplication",
        args: [BigInt(id), "Rejected by admin"],
        account: address,
        chain: bsc
      });
    } else {
      toast.error(`Application #${id} rejected (Mock)`);
    }
  };

  const handleToggleStatus = (walletAddress: string, currentStatus: string) => {
    const isActive = currentStatus === "Active";
    // Contract expects: 0 = Active, 1 = Inactive, 2 = Suspended
    const newStatusCode = isActive ? 1 : 0;
    if (PM_PARTNERSHIP_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000") {
      updateStatus({
        address: PM_PARTNERSHIP_CONTRACT_ADDRESS as `0x${string}`,
        abi: PMPartnershipABI,
        functionName: "updatePartnerStatus",
        args: [walletAddress as `0x${string}`, newStatusCode],
        account: address,
        chain: bsc
      });
    } else {
      toast.success(`Partner status changed to ${isActive ? "Inactive" : "Active"} (Mock)`);
    }
  };

  const handleAddPartner = () => {
    if (!newPartner.name || !newPartner.email || !newPartner.type) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    if (PM_PARTNERSHIP_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000" && address) {
      const lat = parseFloat(newPartner.lat) * 1e6 || 0;
      const lng = parseFloat(newPartner.lng) * 1e6 || 0;
      
      addPartnerFn({
        address: PM_PARTNERSHIP_CONTRACT_ADDRESS as `0x${string}`,
        abi: PMPartnershipABI,
        functionName: "addPartner",
        args: [
          address, // _wallet - Using current wallet as partner address for demo
          newPartner.name, // _name
          newPartner.type, // _partnerType
          newPartner.country, // _country
          "", // _city
          newPartner.email, // _email
          BigInt(Math.floor(lat)), // _latitude
          BigInt(Math.floor(lng)), // _longitude
          0, // _tier (Bronze)
          newPartner.description // _description
        ],
        account: address,
        chain: bsc
      });
    } else {
      toast.success("Partner added successfully! (Mock)");
      setShowAddPartner(false);
      setNewPartner({ name: "", email: "", type: "", country: "", description: "", lat: "", lng: "" });
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-bold mb-2">Connect Wallet</h2>
          <p className="text-muted-foreground">Please connect your wallet to access admin panel</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/dashboard/partners">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Settings className="h-6 w-6 text-primary" />
              Partners Admin
            </h1>
            <p className="text-muted-foreground text-sm">Manage partnerships and applications</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Total Partners</p>
                  <p className="text-xl font-bold">{mockPartners.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Active Partners</p>
                  <p className="text-xl font-bold">{mockPartners.filter(p => p.status === "Active").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <Users className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Pending Applications</p>
                  <p className="text-xl font-bold">{mockApplications.filter(a => a.status === "Pending").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Globe className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Countries</p>
                  <p className="text-xl font-bold">{new Set(mockPartners.map(p => p.country)).size}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="partners" className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="partners">Active Partners</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="partners">
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Partner Directory
                  </CardTitle>
                  <Dialog open={showAddPartner} onOpenChange={setShowAddPartner}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Partner
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Partner</DialogTitle>
                        <DialogDescription>Add a new partner to the network manually.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Partner Name *</Label>
                          <Input
                            value={newPartner.name}
                            onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })}
                            placeholder="Company name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Email *</Label>
                          <Input
                            type="email"
                            value={newPartner.email}
                            onChange={(e) => setNewPartner({ ...newPartner, email: e.target.value })}
                            placeholder="contact@company.com"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Type *</Label>
                            <Select value={newPartner.type} onValueChange={(v) => setNewPartner({ ...newPartner, type: v })}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Exchange">Exchange</SelectItem>
                                <SelectItem value="Technology">Technology</SelectItem>
                                <SelectItem value="Wallet Provider">Wallet Provider</SelectItem>
                                <SelectItem value="Marketplace">Marketplace</SelectItem>
                                <SelectItem value="DeFi Protocol">DeFi Protocol</SelectItem>
                                <SelectItem value="Investment">Investment</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Country</Label>
                            <Input
                              value={newPartner.country}
                              onChange={(e) => setNewPartner({ ...newPartner, country: e.target.value })}
                              placeholder="Country"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Latitude</Label>
                            <Input
                              value={newPartner.lat}
                              onChange={(e) => setNewPartner({ ...newPartner, lat: e.target.value })}
                              placeholder="e.g., 40.7128"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Longitude</Label>
                            <Input
                              value={newPartner.lng}
                              onChange={(e) => setNewPartner({ ...newPartner, lng: e.target.value })}
                              placeholder="e.g., -74.0060"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea
                            value={newPartner.description}
                            onChange={(e) => setNewPartner({ ...newPartner, description: e.target.value })}
                            placeholder="Brief description..."
                          />
                        </div>
                        <Button onClick={handleAddPartner} className="w-full">
                          Add Partner
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Partner</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Revenue (PM)</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockPartners.map((partner) => (
                      <TableRow key={partner.id}>
                        <TableCell className="font-medium">{partner.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{partner.type}</Badge>
                        </TableCell>
                        <TableCell>{partner.country}</TableCell>
                        <TableCell className="text-green-500">${partner.revenue}</TableCell>
                        <TableCell className="text-muted-foreground">{partner.joinedAt}</TableCell>
                        <TableCell>
                          <Badge className={partner.status === "Active" ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}>
                            {partner.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Switch
                              checked={partner.status === "Active"}
                              onCheckedChange={() => handleToggleStatus(partner.wallet || `0x${partner.id}`, partner.status)}
                            />
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Partnership Applications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Applied</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockApplications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell className="font-medium">{app.name}</TableCell>
                        <TableCell className="text-muted-foreground">{app.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{app.type}</Badge>
                        </TableCell>
                        <TableCell>{app.country}</TableCell>
                        <TableCell className="text-muted-foreground">{app.appliedAt}</TableCell>
                        <TableCell>
                          <Badge className={
                            app.status === "Pending" ? "bg-yellow-500/20 text-yellow-500" :
                            app.status === "Approved" ? "bg-green-500/20 text-green-500" :
                            "bg-red-500/20 text-red-500"
                          }>
                            {app.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {app.status === "Pending" && (
                            <div className="flex gap-2 justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleApprove(app.id)}
                                className="gap-1 text-green-500 border-green-500/30 hover:bg-green-500/10"
                              >
                                <CheckCircle className="h-3 w-3" />
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReject(app.id)}
                                className="gap-1 text-red-500 border-red-500/30 hover:bg-red-500/10"
                              >
                                <XCircle className="h-3 w-3" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Revenue Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Revenue Share (%)</Label>
                    <Input type="number" placeholder="10" defaultValue="10" />
                  </div>
                  <div className="space-y-2">
                    <Label>Minimum Payout (PM)</Label>
                    <Input type="number" placeholder="100" defaultValue="100" />
                  </div>
                  <Button className="w-full">Save Settings</Button>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Partnership Tiers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-muted/30 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-medium">Bronze</p>
                      <p className="text-xs text-muted-foreground">5% Revenue Share</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-medium">Silver</p>
                      <p className="text-xs text-muted-foreground">10% Revenue Share</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-medium">Gold</p>
                      <p className="text-xs text-muted-foreground">15% Revenue Share</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PartnersAdmin;
