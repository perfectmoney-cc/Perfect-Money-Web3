import pmLogo from "@/assets/pm-logo-new.png";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { TradingViewTicker } from "@/components/TradingViewTicker";
import { HeroBanner } from "@/components/HeroBanner";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Footer } from "@/components/Footer";
import { WalletCard } from "@/components/WalletCard";
import { ArrowLeft, Copy } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { useAccount } from 'wagmi';
const ReceivePage = () => {
  const {
    address,
    isConnected
  } = useAccount();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  // Use connected wallet address or fallback
  const walletAddress = address || "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb";
  useEffect(() => {
    const generateQR = async () => {
      try {
        const qrUrl = await QRCode.toDataURL(walletAddress, {
          width: 200,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        setQrCodeUrl(qrUrl);
      } catch (error) {
        console.error("QR generation error:", error);
      }
    };
    generateQR();
  }, [walletAddress]);
  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    toast.success("Address copied to clipboard");
  };
  return <div className="min-h-screen bg-background flex flex-col pb-20 lg:pb-0">
      <Header />
      <TradingViewTicker />
      <HeroBanner title="Receive PM Tokens" subtitle="Share your wallet address to receive tokens from others" />
      
      <main className="container mx-auto px-4 pt-12 pb-12 flex-1">
        {/* Mobile Wallet Card */}
        <div className="md:hidden mb-6">
          <WalletCard showQuickFunctionsToggle={false} compact={true} />
        </div>
        
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 text-sm">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="max-w-2xl mx-auto">
          <Card className="p-8 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <img src={pmLogo} alt="PM" className="h-8 w-8" />
              <div>
                <h1 className="text-lg font-bold flex items-center gap-2">
                  Receive PM Tokens
                </h1>
                <p className="text-sm text-muted-foreground">Share your wallet address to receive tokens</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* QR Code */}
              <div className="flex justify-center p-8 bg-muted/50 rounded-lg">
                {qrCodeUrl ? <div className="relative">
                    <img src={qrCodeUrl} alt="Wallet QR Code" className="w-48 h-48 rounded-[10px] border-2 border-primary shadow-[0_0_20px_rgba(239,68,68,0.5)]" />
                  </div> : <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Generating QR...</p>
                  </div>}
              </div>

              {/* Wallet Address */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Your Wallet Address</p>
                <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg">
                  <code className="flex-1 font-mono text-sm break-all">{walletAddress}</code>
                  <Button variant="outline" size="sm" onClick={copyAddress}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Instructions */}
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <h3 className="font-bold mb-2">How to Receive</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>1. Share your wallet address or QR code with the sender</li>
                  <li>2. Make sure they send PM tokens on BSC network</li>
                  <li>3. Tokens will appear in your wallet after confirmation</li>
                </ul>
              </div>

              <Button variant="gradient" size="lg" className="w-full" onClick={copyAddress}>
                <Copy className="h-5 w-5 mr-2" />
                Copy Address
              </Button>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>;
};
export default ReceivePage;