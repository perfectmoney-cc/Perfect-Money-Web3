import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Settings, Users, Building2, Globe, Loader2, Plus, Trash2, Edit, CheckCircle, XCircle, MapPin, ExternalLink, Shield, Search, Filter, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useReadContracts } from "wagmi";
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
const statusNames = ["Active", "Pending", "Inactive", "Suspended"];

interface Partner {
  id: number;
  wallet: string;
  name: string;
  type: string;
  country: string;
  city: string;
  email: string;
  tier: number;
  status: number;
  totalRevenue: string;
  joinedAt: string;
  description: string;
  lat: number;
  lng: number;
}

interface Application {
  id: number;
  applicant: string;
  name: string;
  email: string;
  type: string;
  country: string;
  city: string;
  requestedTier: number;
  status: number;
  appliedAt: string;
  description: string;
}

// Fallback mock data for when contract is not deployed - focused on Asia, UAE, South Africa
const fallbackPartners: Partner[] = [
  // Active (15)
  { id: 1, wallet: "0x1234567890123456789012345678901234567890", name: "Manila Exchange Pro", type: "Exchanger", country: "Philippines", city: "Manila", email: "contact@manilaex.com", tier: 2, status: 0, totalRevenue: "125000", joinedAt: "2024-06-15", description: "Leading exchanger in Philippines", lat: 14.5995, lng: 120.9842 },
  { id: 2, wallet: "0x2345678901234567890123456789012345678901", name: "Jakarta Digital Pay", type: "Exchanger", country: "Indonesia", city: "Jakarta", email: "info@jakartapay.id", tier: 1, status: 0, totalRevenue: "89500", joinedAt: "2024-07-22", description: "Indonesia's top remittance service", lat: -6.2088, lng: 106.8456 },
  { id: 3, wallet: "0x3456789012345678901234567890123456789012", name: "Singapore Money Hub", type: "Exchanger", country: "Singapore", city: "Singapore", email: "hello@sgmoneyhub.sg", tier: 3, status: 0, totalRevenue: "256200", joinedAt: "2024-05-10", description: "Multi-currency exchange platform", lat: 1.3521, lng: 103.8198 },
  { id: 4, wallet: "0x4567890123456789012345678901234567890123", name: "Dubai Gold Exchange", type: "Exchanger", country: "UAE", city: "Dubai", email: "support@dubaigold.ae", tier: 3, status: 0, totalRevenue: "312000", joinedAt: "2024-04-05", description: "Premium crypto-gold exchange", lat: 25.2048, lng: 55.2708 },
  { id: 5, wallet: "0x5678901234567890123456789012345678901234", name: "Abu Dhabi Crypto Hub", type: "Exchanger", country: "UAE", city: "Abu Dhabi", email: "contact@adcrypto.ae", tier: 2, status: 0, totalRevenue: "178000", joinedAt: "2024-06-20", description: "Institutional crypto services", lat: 24.4539, lng: 54.3773 },
  { id: 6, wallet: "0x6789012345678901234567890123456789012345", name: "Johannesburg Money Pro", type: "Exchanger", country: "South Africa", city: "Johannesburg", email: "info@joburgpay.co.za", tier: 1, status: 0, totalRevenue: "67800", joinedAt: "2024-08-15", description: "African digital payment leader", lat: -26.2041, lng: 28.0473 },
  { id: 7, wallet: "0x7890123456789012345678901234567890123456", name: "Cape Town Digital", type: "Exchanger", country: "South Africa", city: "Cape Town", email: "hello@ctdigital.co.za", tier: 2, status: 0, totalRevenue: "89200", joinedAt: "2024-07-10", description: "Southern Africa exchange hub", lat: -33.9249, lng: 18.4241 },
  { id: 8, wallet: "0x8901234567890123456789012345678901234567", name: "Bangkok Quick Pay", type: "Exchanger", country: "Thailand", city: "Bangkok", email: "support@bkkpay.th", tier: 1, status: 0, totalRevenue: "54300", joinedAt: "2024-09-01", description: "Thai baht crypto exchange", lat: 13.7563, lng: 100.5018 },
  { id: 9, wallet: "0x9012345678901234567890123456789012345678", name: "Kuala Lumpur Express", type: "Exchanger", country: "Malaysia", city: "Kuala Lumpur", email: "info@klexpress.my", tier: 0, status: 0, totalRevenue: "32100", joinedAt: "2024-10-05", description: "Malaysian ringgit exchange", lat: 3.1390, lng: 101.6869 },
  { id: 10, wallet: "0xa123456789012345678901234567890123456789", name: "Ho Chi Minh Transfer", type: "Exchanger", country: "Vietnam", city: "Ho Chi Minh", email: "contact@hcmtransfer.vn", tier: 1, status: 0, totalRevenue: "45600", joinedAt: "2024-08-20", description: "Vietnam's leading exchanger", lat: 10.8231, lng: 106.6297 },
  { id: 11, wallet: "0xb234567890123456789012345678901234567890", name: "Mumbai Express Pay", type: "Exchanger", country: "India", city: "Mumbai", email: "support@mumbaiexp.in", tier: 2, status: 0, totalRevenue: "98700", joinedAt: "2024-06-25", description: "Indian crypto exchange", lat: 19.0760, lng: 72.8777 },
  { id: 12, wallet: "0xc345678901234567890123456789012345678901", name: "Sharjah Money Center", type: "Exchanger", country: "UAE", city: "Sharjah", email: "info@sharjahmoney.ae", tier: 1, status: 0, totalRevenue: "56400", joinedAt: "2024-09-10", description: "UAE remittance services", lat: 25.3462, lng: 55.4211 },
  { id: 13, wallet: "0xd456789012345678901234567890123456789012", name: "Pretoria Digital Hub", type: "Exchanger", country: "South Africa", city: "Pretoria", email: "hello@ptadigital.co.za", tier: 0, status: 0, totalRevenue: "23400", joinedAt: "2024-10-15", description: "Government district exchange", lat: -25.7461, lng: 28.1881 },
  { id: 14, wallet: "0xe567890123456789012345678901234567890123", name: "Cebu Island Exchange", type: "Exchanger", country: "Philippines", city: "Cebu", email: "support@cebuex.ph", tier: 1, status: 0, totalRevenue: "41200", joinedAt: "2024-08-30", description: "Visayas region exchanger", lat: 10.3157, lng: 123.8854 },
  { id: 15, wallet: "0xf678901234567890123456789012345678901234", name: "Bali Crypto Exchange", type: "Exchanger", country: "Indonesia", city: "Bali", email: "info@balicrypto.id", tier: 0, status: 0, totalRevenue: "18900", joinedAt: "2024-11-01", description: "Tourist-focused exchange", lat: -8.3405, lng: 115.0920 },
];

const fallbackApplications: Application[] = [
  // Pending (10)
  { id: 1, applicant: "0xaa11223344556677889900112233445566778899", name: "Delhi Express Money", email: "apply@delhiexp.in", type: "Exchanger", country: "India", city: "New Delhi", requestedTier: 1, status: 0, appliedAt: "2024-12-20", description: "Expanding to North India" },
  { id: 2, applicant: "0xbb22334455667788990011223344556677889900", name: "Surabaya Digital", email: "contact@surabaya.id", type: "Exchanger", country: "Indonesia", city: "Surabaya", requestedTier: 0, status: 0, appliedAt: "2024-12-21", description: "East Java expansion" },
  { id: 3, applicant: "0xcc33445566778899001122334455667788990011", name: "Durban Crypto Hub", email: "info@durbancrypto.co.za", type: "Exchanger", country: "South Africa", city: "Durban", requestedTier: 1, status: 0, appliedAt: "2024-12-22", description: "Coastal exchange service" },
  { id: 4, applicant: "0xdd44556677889900112233445566778899001122", name: "Ras Al Khaimah Pay", email: "hello@rakpay.ae", type: "Exchanger", country: "UAE", city: "Ras Al Khaimah", requestedTier: 0, status: 0, appliedAt: "2024-12-23", description: "Northern emirates service" },
  { id: 5, applicant: "0xee55667788990011223344556677889900112233", name: "Davao Money Pro", email: "support@davaopro.ph", type: "Exchanger", country: "Philippines", city: "Davao", requestedTier: 1, status: 0, appliedAt: "2024-12-24", description: "Mindanao region exchange" },
  { id: 6, applicant: "0xff66778899001122334455667788990011223344", name: "Hanoi Digital Pay", email: "contact@hanoipay.vn", type: "Exchanger", country: "Vietnam", city: "Hanoi", requestedTier: 0, status: 0, appliedAt: "2024-12-18", description: "North Vietnam expansion" },
  { id: 7, applicant: "0x0077889900112233445566778899001122334455", name: "Chennai Express", email: "info@chennaiexp.in", type: "Exchanger", country: "India", city: "Chennai", requestedTier: 1, status: 0, appliedAt: "2024-12-19", description: "South India services" },
  { id: 8, applicant: "0x1188990011223344556677889900112233445566", name: "Phuket Island Pay", email: "hello@phuketpay.th", type: "Exchanger", country: "Thailand", city: "Phuket", requestedTier: 0, status: 0, appliedAt: "2024-12-17", description: "Island tourist exchange" },
  { id: 9, applicant: "0x2299001122334455667788990011223344556677", name: "Penang Quick Money", email: "support@penangqm.my", type: "Exchanger", country: "Malaysia", city: "Penang", requestedTier: 0, status: 0, appliedAt: "2024-12-16", description: "Northern Malaysia hub" },
  { id: 10, applicant: "0x3300112233445566778899001122334455667788", name: "Lagos Crypto Hub", email: "contact@lagoscrypto.ng", type: "Exchanger", country: "Nigeria", city: "Lagos", requestedTier: 2, status: 0, appliedAt: "2024-12-15", description: "West Africa expansion" },
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

  // Search and filter states
  const [partnerSearch, setPartnerSearch] = useState("");
  const [partnerCountryFilter, setPartnerCountryFilter] = useState("all");
  const [partnerStatusFilter, setPartnerStatusFilter] = useState("all");
  const [partnerTierFilter, setPartnerTierFilter] = useState("all");
  
  const [appSearch, setAppSearch] = useState("");
  const [appCountryFilter, setAppCountryFilter] = useState("all");
  const [appStatusFilter, setAppStatusFilter] = useState("all");

  // Check if contract is deployed
  const isContractDeployed = PM_PARTNERSHIP_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000";

  // Read global stats from contract
  const { data: globalStats, refetch: refetchStats, isLoading: isLoadingStats } = useReadContract({
    address: PM_PARTNERSHIP_CONTRACT_ADDRESS as `0x${string}`,
    abi: PMPartnershipABI,
    functionName: "getGlobalStats",
    query: { enabled: isContractDeployed }
  });

  // Read all partner addresses
  const { data: partnerAddresses, refetch: refetchPartners, isLoading: isLoadingPartners } = useReadContract({
    address: PM_PARTNERSHIP_CONTRACT_ADDRESS as `0x${string}`,
    abi: PMPartnershipABI,
    functionName: "getAllPartners",
    query: { enabled: isContractDeployed }
  });

  // Read application count
  const { data: applicationCount, refetch: refetchAppCount } = useReadContract({
    address: PM_PARTNERSHIP_CONTRACT_ADDRESS as `0x${string}`,
    abi: PMPartnershipABI,
    functionName: "applicationCount",
    query: { enabled: isContractDeployed }
  });

  // Read contract owner
  const { data: contractOwner } = useReadContract({
    address: PM_PARTNERSHIP_CONTRACT_ADDRESS as `0x${string}`,
    abi: PMPartnershipABI,
    functionName: "owner",
    query: { enabled: isContractDeployed }
  });

  // Fetch partner details for all addresses
  const partnerContracts = useMemo(() => {
    if (!partnerAddresses || !Array.isArray(partnerAddresses)) return [];
    return (partnerAddresses as `0x${string}`[]).map((addr) => ({
      address: PM_PARTNERSHIP_CONTRACT_ADDRESS as `0x${string}`,
      abi: PMPartnershipABI,
      functionName: "getPartner" as const,
      args: [addr] as const,
    }));
  }, [partnerAddresses]);

  const { data: partnerDetails, isLoading: isLoadingDetails } = useReadContracts({
    // @ts-ignore - complex type inference
    contracts: partnerContracts,
    query: { enabled: partnerContracts.length > 0 }
  });

  // Fetch application details
  const applicationContracts = useMemo(() => {
    if (!applicationCount) return [];
    const count = Number(applicationCount);
    return Array.from({ length: count }, (_, i) => ({
      address: PM_PARTNERSHIP_CONTRACT_ADDRESS as `0x${string}`,
      abi: PMPartnershipABI,
      functionName: "getApplication",
      args: [BigInt(i + 1)],
    }));
  }, [applicationCount]);

  const { data: applicationDetails, isLoading: isLoadingApps } = useReadContracts({
    contracts: applicationContracts,
    query: { enabled: applicationContracts.length > 0 }
  });

  // Process blockchain partner data
  const partners: Partner[] = useMemo(() => {
    if (!isContractDeployed || !partnerDetails) {
      return fallbackPartners;
    }
    
    const processedPartners: Partner[] = [];
    partnerDetails.forEach((result, index) => {
      if (result.status === "success" && result.result) {
        const p = result.result as any;
        processedPartners.push({
          id: index + 1,
          wallet: p.wallet,
          name: p.name,
          type: p.partnerType,
          country: p.country,
          city: p.city,
          email: p.email,
          tier: Number(p.tier),
          status: Number(p.status),
          totalRevenue: formatEther(p.totalRevenue || 0n),
          joinedAt: new Date(Number(p.joinedAt) * 1000).toISOString().split("T")[0],
          description: p.description,
          lat: Number(p.latitude) / 1e6,
          lng: Number(p.longitude) / 1e6,
        });
      }
    });
    
    return processedPartners.length > 0 ? processedPartners : fallbackPartners;
  }, [isContractDeployed, partnerDetails]);

  // Process blockchain application data
  const applications: Application[] = useMemo(() => {
    if (!isContractDeployed || !applicationDetails) {
      return fallbackApplications;
    }
    
    const processedApps: Application[] = [];
    applicationDetails.forEach((result, index) => {
      if (result.status === "success" && result.result) {
        const a = result.result as any;
        if (a.applicant !== "0x0000000000000000000000000000000000000000") {
          processedApps.push({
            id: index + 1,
            applicant: a.applicant,
            name: a.name,
            email: a.email,
            type: a.partnerType,
            country: a.country,
            city: a.city,
            requestedTier: Number(a.requestedTier),
            status: Number(a.status),
            appliedAt: new Date(Number(a.appliedAt) * 1000).toISOString().split("T")[0],
            description: a.description,
          });
        }
      }
    });
    
    return processedApps.length > 0 ? processedApps : fallbackApplications;
  }, [isContractDeployed, applicationDetails]);

  // Get unique countries for filters
  const partnerCountries = useMemo(() => 
    [...new Set(partners.map(p => p.country))].sort(), 
    [partners]
  );
  
  const appCountries = useMemo(() => 
    [...new Set(applications.map(a => a.country))].sort(), 
    [applications]
  );

  // Filter partners
  const filteredPartners = useMemo(() => {
    return partners.filter(partner => {
      const matchesSearch = partnerSearch === "" || 
        partner.name.toLowerCase().includes(partnerSearch.toLowerCase()) ||
        partner.wallet.toLowerCase().includes(partnerSearch.toLowerCase()) ||
        partner.city.toLowerCase().includes(partnerSearch.toLowerCase()) ||
        partner.email.toLowerCase().includes(partnerSearch.toLowerCase());
      
      const matchesCountry = partnerCountryFilter === "all" || partner.country === partnerCountryFilter;
      const matchesStatus = partnerStatusFilter === "all" || partner.status === parseInt(partnerStatusFilter);
      const matchesTier = partnerTierFilter === "all" || partner.tier === parseInt(partnerTierFilter);
      
      return matchesSearch && matchesCountry && matchesStatus && matchesTier;
    });
  }, [partners, partnerSearch, partnerCountryFilter, partnerStatusFilter, partnerTierFilter]);

  // Filter applications
  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const matchesSearch = appSearch === "" || 
        app.name.toLowerCase().includes(appSearch.toLowerCase()) ||
        app.email.toLowerCase().includes(appSearch.toLowerCase()) ||
        app.city.toLowerCase().includes(appSearch.toLowerCase());
      
      const matchesCountry = appCountryFilter === "all" || app.country === appCountryFilter;
      const matchesStatus = appStatusFilter === "all" || app.status === parseInt(appStatusFilter);
      
      return matchesSearch && matchesCountry && matchesStatus;
    });
  }, [applications, appSearch, appCountryFilter, appStatusFilter]);

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
      refetchAll();
    }
    if (rejectSuccess) {
      toast.success("Application rejected");
      refetchAll();
    }
    if (statusSuccess) {
      toast.success("Partner status updated!");
      refetchAll();
    }
    if (addSuccess) {
      toast.success("Partner added successfully!");
      setShowAddPartner(false);
      setNewPartner({ name: "", email: "", type: "", country: "", description: "", lat: "", lng: "" });
      refetchAll();
    }
  }, [approveSuccess, rejectSuccess, statusSuccess, addSuccess]);

  const refetchAll = () => {
    refetchStats();
    refetchPartners();
    refetchAppCount();
  };

  // Check if user is contract owner
  const isOwner = contractOwner 
    ? contractOwner.toLowerCase() === address?.toLowerCase() 
    : true;

  // Stats from blockchain or mock
  const totalPartnersCount = isContractDeployed && globalStats ? Number(globalStats[0]) : partners.length;
  const activePartnersCount = isContractDeployed && globalStats ? Number(globalStats[1]) : partners.filter(p => p.status === 0).length;
  const pendingAppsCount = isContractDeployed && globalStats ? Number(globalStats[2]) : applications.filter(a => a.status === 0).length;
  const totalRevenuePaid = isContractDeployed && globalStats ? Number(formatEther(globalStats[3])) : 0;

  const handleApprove = (id: number) => {
    if (isContractDeployed) {
      approveApp({
        address: PM_PARTNERSHIP_CONTRACT_ADDRESS as `0x${string}`,
        abi: PMPartnershipABI,
        functionName: "approveApplication",
        args: [BigInt(id)],
        account: address,
        chain: bsc
      });
    } else {
      toast.success(`Application #${id} approved! (Demo mode)`);
    }
  };

  const handleReject = (id: number) => {
    if (isContractDeployed) {
      rejectApp({
        address: PM_PARTNERSHIP_CONTRACT_ADDRESS as `0x${string}`,
        abi: PMPartnershipABI,
        functionName: "rejectApplication",
        args: [BigInt(id), "Rejected by admin"],
        account: address,
        chain: bsc
      });
    } else {
      toast.error(`Application #${id} rejected (Demo mode)`);
    }
  };

  const handleToggleStatus = (walletAddress: string, currentStatus: number) => {
    const newStatusCode = currentStatus === 0 ? 1 : 0;
    if (isContractDeployed) {
      updateStatus({
        address: PM_PARTNERSHIP_CONTRACT_ADDRESS as `0x${string}`,
        abi: PMPartnershipABI,
        functionName: "updatePartnerStatus",
        args: [walletAddress as `0x${string}`, newStatusCode],
        account: address,
        chain: bsc
      });
    } else {
      toast.success(`Partner status changed to ${statusNames[newStatusCode]} (Demo mode)`);
    }
  };

  const handleAddPartner = () => {
    if (!newPartner.name || !newPartner.email || !newPartner.type) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    if (isContractDeployed && address) {
      const lat = parseFloat(newPartner.lat) * 1e6 || 0;
      const lng = parseFloat(newPartner.lng) * 1e6 || 0;
      
      addPartnerFn({
        address: PM_PARTNERSHIP_CONTRACT_ADDRESS as `0x${string}`,
        abi: PMPartnershipABI,
        functionName: "addPartner",
        args: [
          address,
          newPartner.name,
          newPartner.type,
          newPartner.country,
          "",
          newPartner.email,
          BigInt(Math.floor(lat)),
          BigInt(Math.floor(lng)),
          0,
          newPartner.description
        ],
        account: address,
        chain: bsc
      });
    } else {
      toast.success("Partner added successfully! (Demo mode)");
      setShowAddPartner(false);
      setNewPartner({ name: "", email: "", type: "", country: "", description: "", lat: "", lng: "" });
    }
  };

  const clearPartnerFilters = () => {
    setPartnerSearch("");
    setPartnerCountryFilter("all");
    setPartnerStatusFilter("all");
    setPartnerTierFilter("all");
  };

  const clearAppFilters = () => {
    setAppSearch("");
    setAppCountryFilter("all");
    setAppStatusFilter("all");
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
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
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
              <p className="text-muted-foreground text-sm flex items-center gap-2">
                Manage global exchanger network
                {isContractDeployed ? (
                  <Badge variant="outline" className="text-green-500 border-green-500/30 text-xs">
                    🔗 Live Blockchain
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-yellow-500 border-yellow-500/30 text-xs">
                    Demo Mode
                  </Badge>
                )}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={refetchAll} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
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
                  <p className="text-xl font-bold">{totalPartnersCount}</p>
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
                  <p className="text-xl font-bold">{activePartnersCount}</p>
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
                  <p className="text-xl font-bold">{pendingAppsCount}</p>
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
                  <p className="text-xl font-bold">{partnerCountries.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="partners" className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="partners">Active Partners ({filteredPartners.length})</TabsTrigger>
            <TabsTrigger value="applications">Applications ({filteredApplications.filter(a => a.status === 0).length})</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="partners">
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex flex-col gap-4">
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
                                  <SelectItem value="Exchanger">Exchanger</SelectItem>
                                  <SelectItem value="Payment">Payment</SelectItem>
                                  <SelectItem value="Remittance">Remittance</SelectItem>
                                  <SelectItem value="Marketplace">Marketplace</SelectItem>
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
                                placeholder="e.g., 14.5995"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Longitude</Label>
                              <Input
                                value={newPartner.lng}
                                onChange={(e) => setNewPartner({ ...newPartner, lng: e.target.value })}
                                placeholder="e.g., 120.9842"
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
                          <Button onClick={handleAddPartner} disabled={isAdding} className="w-full">
                            {isAdding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Add Partner
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Search and Filters */}
                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name, wallet, city, or email..."
                        value={partnerSearch}
                        onChange={(e) => setPartnerSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={partnerCountryFilter} onValueChange={setPartnerCountryFilter}>
                      <SelectTrigger className="w-full md:w-[160px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Countries</SelectItem>
                        {partnerCountries.map(country => (
                          <SelectItem key={country} value={country}>{country}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={partnerStatusFilter} onValueChange={setPartnerStatusFilter}>
                      <SelectTrigger className="w-full md:w-[140px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="0">Active</SelectItem>
                        <SelectItem value="1">Pending</SelectItem>
                        <SelectItem value="2">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={partnerTierFilter} onValueChange={setPartnerTierFilter}>
                      <SelectTrigger className="w-full md:w-[130px]">
                        <SelectValue placeholder="Tier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Tiers</SelectItem>
                        <SelectItem value="0">Bronze</SelectItem>
                        <SelectItem value="1">Silver</SelectItem>
                        <SelectItem value="2">Gold</SelectItem>
                        <SelectItem value="3">Platinum</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Active Filters */}
                  {(partnerSearch || partnerCountryFilter !== "all" || partnerStatusFilter !== "all" || partnerTierFilter !== "all") && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-muted-foreground">Filters:</span>
                      {partnerSearch && (
                        <Badge variant="secondary" className="cursor-pointer" onClick={() => setPartnerSearch("")}>
                          Search: {partnerSearch} ✕
                        </Badge>
                      )}
                      {partnerCountryFilter !== "all" && (
                        <Badge variant="secondary" className="cursor-pointer" onClick={() => setPartnerCountryFilter("all")}>
                          {partnerCountryFilter} ✕
                        </Badge>
                      )}
                      {partnerStatusFilter !== "all" && (
                        <Badge variant="secondary" className="cursor-pointer" onClick={() => setPartnerStatusFilter("all")}>
                          {statusNames[parseInt(partnerStatusFilter)]} ✕
                        </Badge>
                      )}
                      {partnerTierFilter !== "all" && (
                        <Badge variant="secondary" className="cursor-pointer" onClick={() => setPartnerTierFilter("all")}>
                          {tierNames[parseInt(partnerTierFilter)]} ✕
                        </Badge>
                      )}
                      <Button variant="ghost" size="sm" onClick={clearPartnerFilters} className="text-xs h-6">
                        Clear All
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingDetails ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Partner</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Tier</TableHead>
                          <TableHead>Revenue (PM)</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPartners.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                              No partners found matching your filters
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredPartners.map((partner) => (
                            <TableRow key={partner.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{partner.name}</p>
                                  <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                                    {partner.wallet.slice(0, 6)}...{partner.wallet.slice(-4)}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{partner.type}</Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-sm">{partner.city}, {partner.country}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={
                                  partner.tier === 3 ? "bg-purple-500/20 text-purple-400" :
                                  partner.tier === 2 ? "bg-yellow-500/20 text-yellow-400" :
                                  partner.tier === 1 ? "bg-gray-400/20 text-gray-300" :
                                  "bg-orange-500/20 text-orange-400"
                                }>
                                  {tierNames[partner.tier]}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-green-500 font-medium">
                                {parseFloat(partner.totalRevenue).toLocaleString()} PM
                              </TableCell>
                              <TableCell className="text-muted-foreground text-sm">{partner.joinedAt}</TableCell>
                              <TableCell>
                                <Badge className={
                                  partner.status === 0 ? "bg-green-500/20 text-green-500" : 
                                  partner.status === 1 ? "bg-yellow-500/20 text-yellow-500" :
                                  "bg-red-500/20 text-red-500"
                                }>
                                  {statusNames[partner.status]}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex gap-2 justify-end items-center">
                                  <Switch
                                    checked={partner.status === 0}
                                    onCheckedChange={() => handleToggleStatus(partner.wallet, partner.status)}
                                    disabled={isUpdatingStatus}
                                  />
                                  <Button variant="ghost" size="icon">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  Showing {filteredPartners.length} of {partners.length} partners
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications">
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex flex-col gap-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Partnership Applications
                  </CardTitle>
                  
                  {/* Search and Filters */}
                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name, email, or city..."
                        value={appSearch}
                        onChange={(e) => setAppSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={appCountryFilter} onValueChange={setAppCountryFilter}>
                      <SelectTrigger className="w-full md:w-[160px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Countries</SelectItem>
                        {appCountries.map(country => (
                          <SelectItem key={country} value={country}>{country}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={appStatusFilter} onValueChange={setAppStatusFilter}>
                      <SelectTrigger className="w-full md:w-[140px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="0">Pending</SelectItem>
                        <SelectItem value="1">Approved</SelectItem>
                        <SelectItem value="2">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Active Filters */}
                  {(appSearch || appCountryFilter !== "all" || appStatusFilter !== "all") && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-muted-foreground">Filters:</span>
                      {appSearch && (
                        <Badge variant="secondary" className="cursor-pointer" onClick={() => setAppSearch("")}>
                          Search: {appSearch} ✕
                        </Badge>
                      )}
                      {appCountryFilter !== "all" && (
                        <Badge variant="secondary" className="cursor-pointer" onClick={() => setAppCountryFilter("all")}>
                          {appCountryFilter} ✕
                        </Badge>
                      )}
                      {appStatusFilter !== "all" && (
                        <Badge variant="secondary" className="cursor-pointer" onClick={() => setAppStatusFilter("all")}>
                          {appStatusFilter === "0" ? "Pending" : appStatusFilter === "1" ? "Approved" : "Rejected"} ✕
                        </Badge>
                      )}
                      <Button variant="ghost" size="sm" onClick={clearAppFilters} className="text-xs h-6">
                        Clear All
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingApps ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Company</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Requested Tier</TableHead>
                          <TableHead>Applied</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredApplications.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                              No applications found matching your filters
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredApplications.map((app) => (
                            <TableRow key={app.id}>
                              <TableCell className="font-medium">{app.name}</TableCell>
                              <TableCell className="text-muted-foreground text-sm">{app.email}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-sm">{app.city}, {app.country}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{app.type}</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge className={
                                  app.requestedTier === 3 ? "bg-purple-500/20 text-purple-400" :
                                  app.requestedTier === 2 ? "bg-yellow-500/20 text-yellow-400" :
                                  app.requestedTier === 1 ? "bg-gray-400/20 text-gray-300" :
                                  "bg-orange-500/20 text-orange-400"
                                }>
                                  {tierNames[app.requestedTier]}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground text-sm">{app.appliedAt}</TableCell>
                              <TableCell>
                                <Badge className={
                                  app.status === 0 ? "bg-yellow-500/20 text-yellow-500" :
                                  app.status === 1 ? "bg-green-500/20 text-green-500" :
                                  "bg-red-500/20 text-red-500"
                                }>
                                  {app.status === 0 ? "Pending" : app.status === 1 ? "Approved" : "Rejected"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                {app.status === 0 && (
                                  <div className="flex gap-2 justify-end">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleApprove(app.id)}
                                      disabled={isApproving}
                                      className="gap-1 text-green-500 border-green-500/30 hover:bg-green-500/10"
                                    >
                                      {isApproving ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
                                      Approve
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleReject(app.id)}
                                      disabled={isRejecting}
                                      className="gap-1 text-red-500 border-red-500/30 hover:bg-red-500/10"
                                    >
                                      {isRejecting ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
                                      Reject
                                    </Button>
                                  </div>
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  Showing {filteredApplications.length} of {applications.length} applications
                </p>
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
                  <div className="p-3 bg-orange-500/10 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-medium text-orange-400">Bronze</p>
                      <p className="text-xs text-muted-foreground">5% Revenue Share • 1,000 PM Stake</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="p-3 bg-gray-400/10 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-300">Silver</p>
                      <p className="text-xs text-muted-foreground">10% Revenue Share • 5,000 PM Stake</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="p-3 bg-yellow-500/10 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-medium text-yellow-400">Gold</p>
                      <p className="text-xs text-muted-foreground">15% Revenue Share • 10,000 PM Stake</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="p-3 bg-purple-500/10 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-medium text-purple-400">Platinum</p>
                      <p className="text-xs text-muted-foreground">20% Revenue Share • 25,000 PM Stake</p>
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
