import { useEffect, useRef, useState } from "react";
import { Building2, Globe, MapPin, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Partner {
  id: number;
  name: string;
  type: string;
  country: string;
  city: string;
  lat: number;
  lng: number;
  status: "Active" | "Pending" | "Inactive";
  description?: string;
}

// Sample partner locations globally
const partnerLocations: Partner[] = [
  { id: 1, name: "CryptoExchange Pro", type: "Exchange", country: "USA", city: "New York", lat: 40.7128, lng: -74.0060, status: "Active", description: "Leading cryptocurrency exchange" },
  { id: 2, name: "BlockTech Solutions", type: "Technology", country: "UK", city: "London", lat: 51.5074, lng: -0.1278, status: "Active", description: "Blockchain infrastructure provider" },
  { id: 3, name: "Asia Wallet", type: "Wallet Provider", country: "Singapore", city: "Singapore", lat: 1.3521, lng: 103.8198, status: "Active", description: "Multi-chain wallet solution" },
  { id: 4, name: "Euro Digital", type: "Marketplace", country: "Germany", city: "Berlin", lat: 52.5200, lng: 13.4050, status: "Active", description: "NFT marketplace" },
  { id: 5, name: "Tokyo Finance", type: "Exchange", country: "Japan", city: "Tokyo", lat: 35.6762, lng: 139.6503, status: "Active", description: "Japanese crypto exchange" },
  { id: 6, name: "Dubai Ventures", type: "Investment", country: "UAE", city: "Dubai", lat: 25.2048, lng: 55.2708, status: "Active", description: "Crypto investment fund" },
  { id: 7, name: "Sydney Chain", type: "Technology", country: "Australia", city: "Sydney", lat: -33.8688, lng: 151.2093, status: "Active", description: "DeFi protocol developer" },
  { id: 8, name: "Brazil Crypto Hub", type: "Exchange", country: "Brazil", city: "São Paulo", lat: -23.5505, lng: -46.6333, status: "Active", description: "Latin America's largest exchange" },
  { id: 9, name: "Nordic Block", type: "Technology", country: "Sweden", city: "Stockholm", lat: 59.3293, lng: 18.0686, status: "Pending", description: "Nordic blockchain solutions" },
  { id: 10, name: "Mumbai Digital", type: "Wallet Provider", country: "India", city: "Mumbai", lat: 19.0760, lng: 72.8777, status: "Active", description: "Indian crypto wallet" },
  { id: 11, name: "Seoul Labs", type: "Technology", country: "South Korea", city: "Seoul", lat: 37.5665, lng: 126.9780, status: "Active", description: "Blockchain R&D center" },
  { id: 12, name: "Toronto DeFi", type: "Marketplace", country: "Canada", city: "Toronto", lat: 43.6532, lng: -79.3832, status: "Active", description: "DeFi aggregator platform" },
];

const PartnersMap = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map
    const map = L.map(mapContainerRef.current, {
      center: [20, 0],
      zoom: 2,
      scrollWheelZoom: true,
    });

    mapRef.current = map;

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Add markers for each partner
    partnerLocations.forEach((partner) => {
      const color = partner.status === "Active" ? "#22c55e" : partner.status === "Pending" ? "#eab308" : "#ef4444";
      
      const icon = L.divIcon({
        className: "custom-marker",
        html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      const marker = L.marker([partner.lat, partner.lng], { icon }).addTo(map);
      
      const popupContent = `
        <div style="padding: 8px; min-width: 180px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <strong>${partner.name}</strong>
          </div>
          <div style="font-size: 12px; color: #666;">
            <p>${partner.type}</p>
            <p>📍 ${partner.city}, ${partner.country}</p>
            ${partner.description ? `<p style="margin-top: 4px;">${partner.description}</p>` : ''}
            <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 10px; margin-top: 8px; background: ${color}20; color: ${color};">
              ${partner.status}
            </span>
          </div>
        </div>
      `;
      
      marker.bindPopup(popupContent);
    });

    setIsLoading(false);

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-sm text-muted-foreground">Active</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <span className="text-sm text-muted-foreground">Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-sm text-muted-foreground">Inactive</span>
        </div>
      </div>
      
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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <Card className="p-4 bg-card/50">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <div>
              <p className="text-2xl font-bold">{partnerLocations.length}</p>
              <p className="text-xs text-muted-foreground">Total Partners</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-card/50">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <div>
              <p className="text-2xl font-bold">{partnerLocations.filter(p => p.status === "Active").length}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-card/50">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <div>
              <p className="text-2xl font-bold">{new Set(partnerLocations.map(p => p.country)).size}</p>
              <p className="text-xs text-muted-foreground">Countries</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-card/50">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <div>
              <p className="text-2xl font-bold">{new Set(partnerLocations.map(p => p.type)).size}</p>
              <p className="text-xs text-muted-foreground">Categories</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PartnersMap;
