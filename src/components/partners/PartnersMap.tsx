import { useEffect, useRef, useState, useMemo } from "react";
import { Building2, Globe, MapPin, Loader2, Search, Filter } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useReadContract } from "wagmi";
import { PMPartnershipABI, PM_PARTNERSHIP_CONTRACT_ADDRESS } from "@/contracts/partnershipABI";

interface Partner {
  id: number;
  wallet: string;
  name: string;
  type: string;
  country: string;
  city: string;
  lat: number;
  lng: number;
  status: "Active" | "Pending" | "Inactive";
  tier: number;
  description?: string;
}

// Fallback mock data for when contract is not deployed
const fallbackPartnerLocations: Partner[] = [
  // Active Partners (15) - Asia, UAE, South Africa focus
  { id: 1, wallet: "0x1", name: "Manila Exchange Pro", type: "Exchanger", country: "Philippines", city: "Manila", lat: 14.5995, lng: 120.9842, status: "Active", tier: 2, description: "Leading crypto exchanger in Philippines" },
  { id: 2, wallet: "0x2", name: "Jakarta Digital Pay", type: "Exchanger", country: "Indonesia", city: "Jakarta", lat: -6.2088, lng: 106.8456, status: "Active", tier: 1, description: "Indonesia's top remittance service" },
  { id: 3, wallet: "0x3", name: "Singapore Money Hub", type: "Exchanger", country: "Singapore", city: "Singapore", lat: 1.3521, lng: 103.8198, status: "Active", tier: 3, description: "Multi-currency exchange platform" },
  { id: 4, wallet: "0x4", name: "Dubai Gold Exchange", type: "Exchanger", country: "UAE", city: "Dubai", lat: 25.2048, lng: 55.2708, status: "Active", tier: 3, description: "Premium crypto-gold exchange" },
  { id: 5, wallet: "0x5", name: "Abu Dhabi Crypto Hub", type: "Exchanger", country: "UAE", city: "Abu Dhabi", lat: 24.4539, lng: 54.3773, status: "Active", tier: 2, description: "Institutional crypto services" },
  { id: 6, wallet: "0x6", name: "Johannesburg Money Pro", type: "Exchanger", country: "South Africa", city: "Johannesburg", lat: -26.2041, lng: 28.0473, status: "Active", tier: 1, description: "African digital payment leader" },
  { id: 7, wallet: "0x7", name: "Cape Town Digital", type: "Exchanger", country: "South Africa", city: "Cape Town", lat: -33.9249, lng: 18.4241, status: "Active", tier: 2, description: "Southern Africa exchange hub" },
  { id: 8, wallet: "0x8", name: "Bangkok Quick Pay", type: "Exchanger", country: "Thailand", city: "Bangkok", lat: 13.7563, lng: 100.5018, status: "Active", tier: 1, description: "Thai baht crypto exchange" },
  { id: 9, wallet: "0x9", name: "Kuala Lumpur Express", type: "Exchanger", country: "Malaysia", city: "Kuala Lumpur", lat: 3.1390, lng: 101.6869, status: "Active", tier: 0, description: "Malaysian ringgit exchange" },
  { id: 10, wallet: "0x10", name: "Ho Chi Minh Transfer", type: "Exchanger", country: "Vietnam", city: "Ho Chi Minh", lat: 10.8231, lng: 106.6297, status: "Active", tier: 1, description: "Vietnam's leading exchanger" },
  { id: 11, wallet: "0x11", name: "Mumbai Express Pay", type: "Exchanger", country: "India", city: "Mumbai", lat: 19.0760, lng: 72.8777, status: "Active", tier: 2, description: "Indian crypto exchange" },
  { id: 12, wallet: "0x12", name: "Sharjah Money Center", type: "Exchanger", country: "UAE", city: "Sharjah", lat: 25.3462, lng: 55.4211, status: "Active", tier: 1, description: "UAE remittance services" },
  { id: 13, wallet: "0x13", name: "Pretoria Digital Hub", type: "Exchanger", country: "South Africa", city: "Pretoria", lat: -25.7461, lng: 28.1881, status: "Active", tier: 0, description: "Government district exchange" },
  { id: 14, wallet: "0x14", name: "Cebu Island Exchange", type: "Exchanger", country: "Philippines", city: "Cebu", lat: 10.3157, lng: 123.8854, status: "Active", tier: 1, description: "Visayas region exchanger" },
  { id: 15, wallet: "0x15", name: "Bali Crypto Exchange", type: "Exchanger", country: "Indonesia", city: "Bali", lat: -8.3405, lng: 115.0920, status: "Active", tier: 0, description: "Tourist-focused exchange" },
  
  // Pending Partners (10)
  { id: 16, wallet: "0x16", name: "Delhi Express Money", type: "Exchanger", country: "India", city: "New Delhi", lat: 28.6139, lng: 77.2090, status: "Pending", tier: 0, description: "Expanding to North India" },
  { id: 17, wallet: "0x17", name: "Surabaya Digital", type: "Exchanger", country: "Indonesia", city: "Surabaya", lat: -7.2575, lng: 112.7521, status: "Pending", tier: 0, description: "East Java expansion" },
  { id: 18, wallet: "0x18", name: "Durban Crypto Hub", type: "Exchanger", country: "South Africa", city: "Durban", lat: -29.8587, lng: 31.0218, status: "Pending", tier: 0, description: "Coastal exchange service" },
  { id: 19, wallet: "0x19", name: "Ras Al Khaimah Pay", type: "Exchanger", country: "UAE", city: "Ras Al Khaimah", lat: 25.7895, lng: 55.9432, status: "Pending", tier: 0, description: "Northern emirates service" },
  { id: 20, wallet: "0x20", name: "Davao Money Pro", type: "Exchanger", country: "Philippines", city: "Davao", lat: 7.1907, lng: 125.4553, status: "Pending", tier: 0, description: "Mindanao region exchange" },
  { id: 21, wallet: "0x21", name: "Hanoi Digital Pay", type: "Exchanger", country: "Vietnam", city: "Hanoi", lat: 21.0285, lng: 105.8542, status: "Pending", tier: 0, description: "North Vietnam expansion" },
  { id: 22, wallet: "0x22", name: "Chennai Express", type: "Exchanger", country: "India", city: "Chennai", lat: 13.0827, lng: 80.2707, status: "Pending", tier: 0, description: "South India services" },
  { id: 23, wallet: "0x23", name: "Phuket Island Pay", type: "Exchanger", country: "Thailand", city: "Phuket", lat: 7.8804, lng: 98.3923, status: "Pending", tier: 0, description: "Island tourist exchange" },
  { id: 24, wallet: "0x24", name: "Penang Quick Money", type: "Exchanger", country: "Malaysia", city: "Penang", lat: 5.4164, lng: 100.3327, status: "Pending", tier: 0, description: "Northern Malaysia hub" },
  { id: 25, wallet: "0x25", name: "Lagos Crypto Hub", type: "Exchanger", country: "Nigeria", city: "Lagos", lat: 6.5244, lng: 3.3792, status: "Pending", tier: 0, description: "West Africa expansion" },

  // Inactive Partners (5)
  { id: 26, wallet: "0x26", name: "Bandung Digital", type: "Exchanger", country: "Indonesia", city: "Bandung", lat: -6.9175, lng: 107.6191, status: "Inactive", tier: 0, description: "Under maintenance" },
  { id: 27, wallet: "0x27", name: "Fujairah Exchange", type: "Exchanger", country: "UAE", city: "Fujairah", lat: 25.1288, lng: 56.3265, status: "Inactive", tier: 1, description: "License renewal pending" },
  { id: 28, wallet: "0x28", name: "Port Elizabeth Pay", type: "Exchanger", country: "South Africa", city: "Port Elizabeth", lat: -33.9608, lng: 25.6022, status: "Inactive", tier: 0, description: "Restructuring operations" },
  { id: 29, wallet: "0x29", name: "Iloilo Express", type: "Exchanger", country: "Philippines", city: "Iloilo", lat: 10.7202, lng: 122.5621, status: "Inactive", tier: 0, description: "Temporary suspension" },
  { id: 30, wallet: "0x30", name: "Chiang Mai Digital", type: "Exchanger", country: "Thailand", city: "Chiang Mai", lat: 18.7883, lng: 98.9853, status: "Inactive", tier: 1, description: "Seasonal operations" },
];

const tierNames = ["Bronze", "Silver", "Gold", "Platinum"];

const PartnersMap = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Check if contract is deployed
  const isContractDeployed = PM_PARTNERSHIP_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000";

  // Fetch partner addresses from blockchain
  const { data: partnerAddresses } = useReadContract({
    address: PM_PARTNERSHIP_CONTRACT_ADDRESS as `0x${string}`,
    abi: PMPartnershipABI,
    functionName: "getAllPartners",
    query: { enabled: isContractDeployed }
  });

  // Fetch global stats from blockchain
  const { data: globalStats } = useReadContract({
    address: PM_PARTNERSHIP_CONTRACT_ADDRESS as `0x${string}`,
    abi: PMPartnershipABI,
    functionName: "getGlobalStats",
    query: { enabled: isContractDeployed }
  });

  // Use fallback data if contract not deployed
  const partnerLocations = useMemo(() => {
    if (!isContractDeployed || !partnerAddresses) {
      return fallbackPartnerLocations;
    }
    // In a real implementation, you would fetch each partner's details
    // For now, return fallback with blockchain info message
    return fallbackPartnerLocations;
  }, [isContractDeployed, partnerAddresses]);

  // Get unique countries for filter
  const countries = useMemo(() => {
    const uniqueCountries = [...new Set(partnerLocations.map(p => p.country))];
    return uniqueCountries.sort();
  }, [partnerLocations]);

  // Filter partners based on search and filters
  const filteredPartners = useMemo(() => {
    return partnerLocations.filter(partner => {
      const matchesSearch = searchQuery === "" || 
        partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        partner.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        partner.country.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCountry = countryFilter === "all" || partner.country === countryFilter;
      const matchesStatus = statusFilter === "all" || partner.status === statusFilter;
      
      return matchesSearch && matchesCountry && matchesStatus;
    });
  }, [partnerLocations, searchQuery, countryFilter, statusFilter]);

  const activeCount = filteredPartners.filter(p => p.status === "Active").length;
  const pendingCount = filteredPartners.filter(p => p.status === "Pending").length;
  const inactiveCount = filteredPartners.filter(p => p.status === "Inactive").length;
  const countriesCount = new Set(filteredPartners.map(p => p.country)).size;

  // Update markers when filters change
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add markers for filtered partners
    filteredPartners.forEach((partner) => {
      const color = partner.status === "Active" ? "#22c55e" : partner.status === "Pending" ? "#eab308" : "#ef4444";
      
      const icon = L.divIcon({
        className: "custom-marker",
        html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      const marker = L.marker([partner.lat, partner.lng], { icon }).addTo(mapRef.current!);
      
      const popupContent = `
        <div style="padding: 8px; min-width: 200px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <strong>${partner.name}</strong>
          </div>
          <div style="font-size: 12px; color: #666;">
            <p><strong>Type:</strong> ${partner.type}</p>
            <p><strong>Tier:</strong> ${tierNames[partner.tier]}</p>
            <p>📍 ${partner.city}, ${partner.country}</p>
            ${partner.description ? `<p style="margin-top: 4px;">${partner.description}</p>` : ''}
            <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 10px; margin-top: 8px; background: ${color}20; color: ${color};">
              ${partner.status}
            </span>
          </div>
        </div>
      `;
      
      marker.bindPopup(popupContent);
      markersRef.current.push(marker);
    });
  }, [filteredPartners]);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [15, 80],
      zoom: 3,
      scrollWheelZoom: true,
    });

    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    setIsLoading(false);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <Card className="p-4 bg-card/50">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search partners by name, city, or country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {countries.map(country => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {(searchQuery || countryFilter !== "all" || statusFilter !== "all") && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
            <span className="text-sm text-muted-foreground">Showing:</span>
            <Badge variant="secondary">{filteredPartners.length} partners</Badge>
            {searchQuery && (
              <Badge variant="outline" className="cursor-pointer" onClick={() => setSearchQuery("")}>
                Search: {searchQuery} ✕
              </Badge>
            )}
            {countryFilter !== "all" && (
              <Badge variant="outline" className="cursor-pointer" onClick={() => setCountryFilter("all")}>
                {countryFilter} ✕
              </Badge>
            )}
            {statusFilter !== "all" && (
              <Badge variant="outline" className="cursor-pointer" onClick={() => setStatusFilter("all")}>
                {statusFilter} ✕
              </Badge>
            )}
          </div>
        )}
      </Card>

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-sm text-muted-foreground">Active ({activeCount})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <span className="text-sm text-muted-foreground">Pending ({pendingCount})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-sm text-muted-foreground">Inactive ({inactiveCount})</span>
        </div>
        {isContractDeployed && (
          <Badge variant="outline" className="ml-auto text-green-500 border-green-500/30">
            🔗 Live Blockchain Data
          </Badge>
        )}
      </div>
      
      {/* Map */}
      <Card className="overflow-hidden rounded-xl border-border relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        <div 
          ref={mapContainerRef} 
          style={{ height: "500px", width: "100%" }}
          className="z-0"
        />
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <Card className="p-4 bg-card/50">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <div>
              <p className="text-2xl font-bold">
                {isContractDeployed && globalStats ? Number(globalStats[0]) : filteredPartners.length}
              </p>
              <p className="text-xs text-muted-foreground">Total Exchangers</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-card/50">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <div>
              <p className="text-2xl font-bold">
                {isContractDeployed && globalStats ? Number(globalStats[1]) : activeCount}
              </p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-card/50">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <div>
              <p className="text-2xl font-bold">{countriesCount}</p>
              <p className="text-xs text-muted-foreground">Countries</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-card/50">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <div>
              <p className="text-2xl font-bold">{new Set(filteredPartners.map(p => p.type)).size}</p>
              <p className="text-xs text-muted-foreground">Categories</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PartnersMap;