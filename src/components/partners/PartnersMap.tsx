import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Building2, Globe, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";

// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

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

const createCustomIcon = (status: string) => {
  const color = status === "Active" ? "#22c55e" : status === "Pending" ? "#eab308" : "#ef4444";
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const PartnersMap = () => {
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
      
      <Card className="overflow-hidden rounded-xl border-border">
        <MapContainer
          center={[20, 0]}
          zoom={2}
          style={{ height: "500px", width: "100%" }}
          scrollWheelZoom={true}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {partnerLocations.map((partner) => (
            <Marker
              key={partner.id}
              position={[partner.lat, partner.lng]}
              icon={createCustomIcon(partner.status)}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    <span className="font-bold">{partner.name}</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="text-muted-foreground">{partner.type}</p>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{partner.city}, {partner.country}</span>
                    </div>
                    {partner.description && (
                      <p className="text-xs text-muted-foreground mt-2">{partner.description}</p>
                    )}
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs mt-2 ${
                      partner.status === "Active" 
                        ? "bg-green-500/20 text-green-500" 
                        : partner.status === "Pending"
                        ? "bg-yellow-500/20 text-yellow-500"
                        : "bg-red-500/20 text-red-500"
                    }`}>
                      {partner.status}
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
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
