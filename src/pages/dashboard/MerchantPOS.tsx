import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Smartphone, QrCode, Wifi, Download, Check, Monitor, Home } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const MerchantPOS = () => {
  const navigate = useNavigate();
  const [deviceName, setDeviceName] = useState("");
  const [pairedDevices] = useState([
    { id: 1, name: "Store Terminal 1", status: "online", lastActive: "2 min ago" },
    { id: 2, name: "Mobile POS", status: "offline", lastActive: "1 hour ago" },
  ]);

  const pairDevice = () => {
    if (!deviceName.trim()) {
      toast.error("Please enter a device name");
      return;
    }
    toast.success(`Device "${deviceName}" paired successfully!`);
    setDeviceName("");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/dashboard" className="flex items-center gap-1">
                <Home className="h-3.5 w-3.5" />
                Dashboard
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/dashboard/merchant">Merchant</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>POS Integration</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 rounded-xl bg-primary/10">
          <Smartphone className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">POS Integration</h1>
          <p className="text-muted-foreground">Connect your physical store with our mobile POS app</p>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" /> Pair New Device
              </CardTitle>
              <CardDescription>Scan this QR code with the PM POS app</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="bg-white p-4 rounded-lg mb-4">
                <QRCodeSVG value="pm-pos://pair/merchant-12345" size={180} />
              </div>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Or enter pairing code: <span className="font-mono font-bold">PM-4829-7361</span>
              </p>
              <div className="w-full space-y-2">
                <Label>Device Name</Label>
                <Input
                  placeholder="e.g., Front Counter Terminal"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                />
                <Button className="w-full" onClick={pairDevice}>
                  Pair Device
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" /> Paired Devices
              </CardTitle>
              <CardDescription>Manage your connected POS terminals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {pairedDevices.map((device) => (
                <div key={device.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${device.status === "online" ? "bg-green-500" : "bg-gray-400"}`} />
                    <div>
                      <p className="font-medium">{device.name}</p>
                      <p className="text-xs text-muted-foreground">{device.lastActive}</p>
                    </div>
                  </div>
                  <Badge variant={device.status === "online" ? "default" : "secondary"}>
                    {device.status}
                  </Badge>
                </div>
              ))}
              {pairedDevices.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No devices paired yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" /> Download POS App
            </CardTitle>
            <CardDescription>Get the PM POS app for your mobile device</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <Button variant="outline" className="h-auto py-4 flex items-center gap-3">
                <img src="/lovable-uploads/48c1d590-39bf-4769-b6b8-ad1c0bbcd829.png" alt="Android" className="w-8 h-8" />
                <div className="text-left">
                  <p className="text-xs text-muted-foreground">Download on</p>
                  <p className="font-semibold">Google Play</p>
                </div>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex items-center gap-3">
                <img src="/lovable-uploads/62397bdd-bb52-4769-8622-3b3f8c73031f.png" alt="iOS" className="w-8 h-8" />
                <div className="text-left">
                  <p className="text-xs text-muted-foreground">Download on</p>
                  <p className="font-semibold">App Store</p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Wifi className="h-5 w-5" /> POS Features
            </h3>
            <div className="grid md:grid-cols-2 gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                Accept PM, BNB, USDT, USDC payments
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                Offline mode with sync capability
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                Receipt printing via Bluetooth
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                Real-time inventory sync
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                Staff management & permissions
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                End-of-day reports
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MerchantPOS;
