import { useState, useEffect, useRef, useCallback } from "react";
import pmLogo from "@/assets/pm-logo-new.png";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/Header";
import { TradingViewTicker } from "@/components/TradingViewTicker";
import { HeroBanner } from "@/components/HeroBanner";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Footer } from "@/components/Footer";
import { WalletCard } from "@/components/WalletCard";
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ArrowLeft, Send, QrCode, X, Home, Camera, RefreshCw, SwitchCamera } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import { useAccount, useBalance } from 'wagmi';
import { PM_TOKEN_ADDRESS } from "@/contracts/addresses";
const SendPage = () => {
  const { address, isConnected } = useAccount();
  const { data: tokenBalance, isLoading: isBalanceLoading } = useBalance({
    address: address,
    token: PM_TOKEN_ADDRESS as `0x${string}`
  });
  
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const mountedRef = useRef(true);

  // Get actual wallet balance
  const actualBalance = tokenBalance?.formatted ? parseFloat(tokenBalance.formatted) : 0;
  const displayBalance = isConnected && !isBalanceLoading 
    ? actualBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "0.00";

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (state === Html5QrcodeScannerState.SCANNING) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (err) {
        console.error("Error stopping scanner:", err);
      } finally {
        scannerRef.current = null;
        if (mountedRef.current) {
          setScanning(false);
        }
      }
    }
  }, []);

  const startScanner = useCallback(async () => {
    const container = document.getElementById("qr-reader");
    if (!container) {
      console.error("QR reader container not found");
      return;
    }

    await stopScanner();

    try {
      setScanError(null);
      
      // Check camera permissions first
      const devices = await Html5Qrcode.getCameras();
      if (!devices || devices.length === 0) {
        setScanError("No cameras found on this device");
        return;
      }

      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode },
        {
          fps: 15,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        (decodedText) => {
          if (mountedRef.current) {
            // Extract wallet address from QR code
            let walletAddress = decodedText;
            if (decodedText.includes('ethereum:') || decodedText.includes('0x')) {
              const match = decodedText.match(/0x[a-fA-F0-9]{40}/);
              if (match) {
                walletAddress = match[0];
              }
            }
            setRecipient(walletAddress);
            toast.success("Wallet address scanned successfully!");
            stopScanner();
          }
        },
        () => {
          // Ignore scan errors (no QR code found in frame)
        }
      );

      if (mountedRef.current) {
        setScanning(true);
      }
    } catch (err: any) {
      console.error("QR Scanner error:", err);
      if (mountedRef.current) {
        if (err.name === "NotAllowedError") {
          setScanError("Camera access denied. Please enable camera permissions in your browser settings.");
        } else if (err.name === "NotFoundError") {
          setScanError("No camera found on this device.");
        } else if (err.name === "NotReadableError") {
          setScanError("Camera is in use by another application.");
        } else {
          setScanError(`Unable to access camera: ${err.message || "Unknown error"}`);
        }
        toast.error("Camera access failed");
      }
    }
  }, [facingMode, stopScanner]);

  const handleSwitchCamera = async () => {
    const newMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(newMode);
    await stopScanner();
    setTimeout(() => startScanner(), 100);
  };

  const handleStartScanning = () => {
    setScanning(true);
    setScanError(null);
    setTimeout(() => startScanner(), 100);
  };

  const handleRetry = () => {
    setScanError(null);
    startScanner();
  };

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopScanner();
    };
  }, [stopScanner]);

  const handleSend = () => {
    if (!recipient || !amount) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }
    const sendAmount = parseFloat(amount);
    if (sendAmount > actualBalance) {
      toast.error("Insufficient balance");
      return;
    }
    toast.success("Transaction sent successfully!");
    setRecipient("");
    setAmount("");
    setNote("");
  };
  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 lg:pb-0">
      <Header />
      <TradingViewTicker />
      <HeroBanner title="Send PM Tokens" subtitle="Transfer tokens instantly to any wallet address" />
      
      <main className="container mx-auto px-4 pt-12 pb-12 flex-1 my-[20px]">
        {/* Mobile Wallet Card */}
        <div className="md:hidden mb-6">
          <WalletCard showQuickFunctionsToggle={false} compact={true} />
        </div>
        
        {/* Breadcrumb Navigation */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/dashboard" className="flex items-center gap-1">
                  <Home className="h-4 w-4" />
                  Dashboard
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Send Tokens</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="max-w-2xl mx-auto">
          <Card className="p-8 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-lg bg-primary/10">
                <Send className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="font-bold text-xl">Send PM Tokens</h1>
                <p className="text-muted-foreground">Transfer tokens to another wallet</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient Address *</Label>
                <div className="flex gap-2">
                  <Input 
                    id="recipient" 
                    placeholder="0x..." 
                    value={recipient} 
                    onChange={e => setRecipient(e.target.value)} 
                    className="font-mono flex-1" 
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon" 
                    onClick={handleStartScanning} 
                    className="shrink-0"
                  >
                    <QrCode className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {scanning && (
                <Card className="p-4 bg-background/95 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Camera className="h-4 w-4 text-primary" />
                      Scan QR Code
                    </h3>
                    <Button variant="ghost" size="icon" onClick={stopScanner}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div 
                    id="qr-reader" 
                    className="w-full aspect-square bg-muted rounded-lg overflow-hidden relative"
                  >
                    {!scanError && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-pulse text-muted-foreground text-sm">
                          Initializing camera...
                        </div>
                      </div>
                    )}
                  </div>

                  {scanError && (
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center gap-2 text-destructive text-sm p-3 bg-destructive/10 rounded-lg">
                        <X className="h-4 w-4 flex-shrink-0" />
                        <span>{scanError}</span>
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={handleRetry} 
                        className="w-full"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry Camera
                      </Button>
                    </div>
                  )}
                  
                  {!scanError && (
                    <Button 
                      variant="outline" 
                      onClick={handleSwitchCamera}
                      className="w-full mt-4"
                    >
                      <SwitchCamera className="h-4 w-4 mr-2" />
                      Switch Camera
                    </Button>
                  )}
                  
                  <p className="text-sm text-muted-foreground text-center mt-3">
                    Position the QR code within the frame to scan
                  </p>
                </Card>
              )}

              <div className="space-y-2">
                <Label htmlFor="amount">Amount (PM) *</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <img src={pmLogo} alt="PM" className="h-5 w-5" />
                  </div>
                  <Input 
                    id="amount" 
                    type="number" 
                    placeholder="0.00" 
                    value={amount} 
                    onChange={e => setAmount(e.target.value)} 
                    className="pl-12" 
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">PM</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Available: {displayBalance} PM
                  {!isConnected && <span className="text-yellow-500 ml-2">(Connect wallet to see balance)</span>}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="note">Note (Optional)</Label>
                <Input 
                  id="note" 
                  placeholder="Payment for..." 
                  value={note} 
                  onChange={e => setNote(e.target.value)} 
                />
              </div>

              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Network Fee</span>
                  <span className="font-medium">~0.0001 BNB</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Amount</span>
                  <span className="font-bold">{amount || "0.00"} PM</span>
                </div>
              </div>

              <Button variant="gradient" size="lg" className="w-full" onClick={handleSend}>
                <Send className="h-5 w-5 mr-2" />
                Send Tokens
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

export default SendPage;