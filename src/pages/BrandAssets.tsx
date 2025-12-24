import { Header } from "@/components/Header";
import { TradingViewTicker } from "@/components/TradingViewTicker";
import { HeroBanner } from "@/components/HeroBanner";
import { Footer } from "@/components/Footer";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Palette, FileImage, Type, Shield } from "lucide-react";
import pmLogo from "@/assets/pm-logo-new.png";
import pmTokenLogo from "@/assets/pm-token-logo.png";

const BrandAssets = () => {
  const brandColors = [
    { name: "Primary Red", hex: "#E53E3E", rgb: "229, 62, 62" },
    { name: "Dark Navy", hex: "#0a0e1a", rgb: "10, 14, 26" },
    { name: "Secondary Blue", hex: "#3b82f6", rgb: "59, 130, 246" },
    { name: "Success Green", hex: "#22c55e", rgb: "34, 197, 94" },
    { name: "Warning Yellow", hex: "#f59e0b", rgb: "245, 158, 11" },
    { name: "Accent Cyan", hex: "#06b6d4", rgb: "6, 182, 212" },
  ];

  const logoAssets = [
    { name: "Primary Logo", description: "Main logo for light backgrounds", src: pmLogo },
    { name: "Token Logo", description: "Token symbol for exchanges", src: pmTokenLogo },
  ];

  const typographySpecs = [
    { name: "Heading Font", value: "Inter / SF Pro Display" },
    { name: "Body Font", value: "Inter / System UI" },
    { name: "Monospace", value: "JetBrains Mono / Monaco" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 lg:pb-0">
      <Header />
      <TradingViewTicker />
      <HeroBanner 
        title="Brand Assets" 
        subtitle="Official brand guidelines and downloadable assets for Perfect Money"
      />
      
      <main className="container mx-auto px-4 pt-12 pb-12 flex-1">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Brand Introduction */}
          <Card className="p-8 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-lg bg-primary/10">
                <Palette className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Brand Guidelines</h2>
                <p className="text-muted-foreground">Maintain consistency across all Perfect Money communications</p>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              These guidelines ensure that Perfect Money's brand identity remains consistent and recognizable across all platforms, 
              communications, and marketing materials. Please adhere to these specifications when using our brand assets.
            </p>
          </Card>

          {/* Logo Assets */}
          <Card className="p-8 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-lg bg-primary/10">
                <FileImage className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Logo Assets</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {logoAssets.map((asset, idx) => (
                <div key={idx} className="border border-border rounded-xl p-6 bg-gradient-to-br from-muted/20 to-muted/5">
                  <div className="h-32 flex items-center justify-center mb-4 bg-muted/30 rounded-lg">
                    <img src={asset.src} alt={asset.name} className="h-20 w-20 object-contain" />
                  </div>
                  <h3 className="font-semibold mb-2">{asset.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{asset.description}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="h-4 w-4" /> PNG
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="h-4 w-4" /> SVG
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 p-6 border border-yellow-500/30 bg-yellow-500/5 rounded-xl">
              <h3 className="font-semibold text-yellow-500 mb-2">Logo Usage Guidelines</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Maintain minimum clear space equal to the height of the "P" around the logo</li>
                <li>• Do not stretch, distort, or modify the logo proportions</li>
                <li>• Do not change the logo colors outside of approved variations</li>
                <li>• Minimum logo size: 24px height for digital, 10mm for print</li>
              </ul>
            </div>
          </Card>

          {/* Brand Colors */}
          <Card className="p-8 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-lg bg-primary/10">
                <Palette className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Brand Colors</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {brandColors.map((color, idx) => (
                <div key={idx} className="text-center">
                  <div 
                    className="w-full h-24 rounded-xl mb-3 shadow-lg border border-border"
                    style={{ backgroundColor: color.hex }}
                  />
                  <p className="font-semibold text-sm">{color.name}</p>
                  <p className="text-xs text-muted-foreground">{color.hex}</p>
                  <p className="text-xs text-muted-foreground">RGB: {color.rgb}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Typography */}
          <Card className="p-8 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-lg bg-primary/10">
                <Type className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Typography</h2>
            </div>
            <div className="space-y-6">
              {typographySpecs.map((spec, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 border border-border rounded-lg">
                  <span className="font-medium">{spec.name}</span>
                  <span className="text-muted-foreground font-mono">{spec.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 space-y-4">
              <div>
                <h3 className="text-4xl font-bold mb-2">Heading Example</h3>
                <p className="text-muted-foreground">Used for main titles and section headers</p>
              </div>
              <div>
                <p className="text-lg">Body text example. This is how regular content appears throughout the platform.</p>
              </div>
              <div>
                <code className="text-sm bg-muted px-3 py-1 rounded font-mono">Monospace for code and addresses</code>
              </div>
            </div>
          </Card>

          {/* Security Badge */}
          <Card className="p-8 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Security Badges</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Merchants can embed our security badges on their websites to showcase that they accept Perfect Money payments 
              with our AAA-rated security certification. Choose from multiple badge variants.
            </p>
            
            {/* Badge Variants */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* Light Badge */}
              <div className="p-4 bg-gradient-to-br from-gray-100 to-gray-50 border border-border rounded-xl text-center">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
                  <Shield className="h-5 w-5" />
                  <div className="text-left">
                    <p className="font-bold text-sm">PM Verified</p>
                    <p className="text-[10px] opacity-90">AAA Rating</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">Light Badge</p>
              </div>
              
              {/* Dark Badge */}
              <div className="p-4 bg-[#0a0e1a] border border-border rounded-xl text-center">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-red-600 text-white px-4 py-2 rounded-lg shadow-lg">
                  <Shield className="h-5 w-5" />
                  <div className="text-left">
                    <p className="font-bold text-sm">PM Verified</p>
                    <p className="text-[10px] opacity-90">AAA Rating</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">Dark Badge</p>
              </div>
              
              {/* Inline Badge */}
              <div className="p-4 bg-muted/30 border border-border rounded-xl text-center flex items-center justify-center">
                <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-500 px-3 py-1 rounded-full border border-green-500/30">
                  <Shield className="h-4 w-4" />
                  <span className="font-semibold text-xs">AAA Verified</span>
                </div>
              </div>
              
              {/* Compact Badge */}
              <div className="p-4 bg-muted/30 border border-border rounded-xl text-center flex items-center justify-center">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/30 rounded-lg">
                  <img src={pmLogo} alt="PM" className="h-5 w-5" />
                  <span className="text-xs font-bold text-primary">AAA</span>
                </div>
              </div>
            </div>
            
            {/* Full Security Card */}
            <h3 className="font-semibold mb-4">Full Security Card</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-br from-[#0a0e1a] to-[#1a1f3c] border border-green-500/30 rounded-xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-14 w-14 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center border border-green-500/30">
                    <img src={pmLogo} alt="PM" className="h-8 w-8" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Perfect Money</h4>
                    <p className="text-green-400 text-sm font-medium">AAA Security Rating</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-green-500/20 flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                    </div>
                    <span>Verified Smart Contract</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-green-500/20 flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                    </div>
                    <span>Multi-Audit Certified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-green-500/20 flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                    </div>
                    <span>0% Buy/Sell Tax</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-between">
                  <span className="text-xs text-gray-500">Score: 94.83/100</span>
                  <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-bold rounded">AAA</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold">Badge Downloads</h4>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-between" size="sm">
                    <span>Light Badge (PNG)</span>
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="w-full justify-between" size="sm">
                    <span>Dark Badge (PNG)</span>
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="w-full justify-between" size="sm">
                    <span>Inline Badge (SVG)</span>
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="w-full justify-between" size="sm">
                    <span>Full Security Card (HTML)</span>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Embed Codes */}
            <h3 className="font-semibold mb-4">Embed Codes</h3>
            <div className="space-y-4">
              <div className="p-4 bg-muted/20 rounded-lg">
                <p className="text-sm font-medium mb-2">Standard Badge:</p>
                <code className="text-xs bg-muted px-3 py-2 rounded block overflow-x-auto">
                  {`<a href="https://perfectmoney.io/verify"><img src="https://perfectmoney.io/badge/aaa-verified.png" alt="Perfect Money AAA Verified" /></a>`}
                </code>
              </div>
              <div className="p-4 bg-muted/20 rounded-lg">
                <p className="text-sm font-medium mb-2">Inline Badge:</p>
                <code className="text-xs bg-muted px-3 py-2 rounded block overflow-x-auto">
                  {`<a href="https://perfectmoney.io/verify" style="display:inline-flex;align-items:center;gap:4px;background:#22c55e20;color:#22c55e;padding:4px 12px;border-radius:9999px;border:1px solid #22c55e30;font-size:12px;font-weight:600;text-decoration:none"><span>✓</span>AAA Verified</a>`}
                </code>
              </div>
            </div>
          </Card>

          {/* Download All */}
          <Card className="p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Download Complete Brand Kit</h2>
              <p className="text-muted-foreground mb-6">
                Get all logos, icons, and brand assets in one package
              </p>
              <Button variant="gradient" size="lg" className="gap-2">
                <Download className="h-5 w-5" />
                Download Brand Kit (ZIP)
              </Button>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default BrandAssets;
