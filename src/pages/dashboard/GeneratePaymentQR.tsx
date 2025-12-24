import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/Header";
import { TradingViewTicker } from "@/components/TradingViewTicker";
import { HeroBanner } from "@/components/HeroBanner";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Footer } from "@/components/Footer";
import { ArrowLeft, QrCode, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const GeneratePaymentQR = () => {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [generated, setGenerated] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  useEffect(() => {
    const detectWallet = async () => {
      // @ts-ignore
      if (typeof window.ethereum !== 'undefined') {
        try {
          // @ts-ignore
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
          } else {
            setWalletAddress("0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb");
          }
        } catch (error) {
          console.error("Error detecting wallet:", error);
          setWalletAddress("0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb");
        }
      } else {
        setWalletAddress("0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb");
      }
    };
    
    detectWallet();
  }, []);

  const handleGenerate = async () => {
    if (!amount) {
      toast.error("Please enter an amount");
      return;
    }
    
    const paymentData = JSON.stringify({
      to: walletAddress,
      amount: amount,
      description: description || "Payment"
    });
    
    const qrUrl = await QRCode.toDataURL(paymentData);
    setQrCodeUrl(qrUrl);
    setGenerated(true);
    toast.success("Payment QR code generated successfully!");
  };

  const handlePaymentComplete = () => {
    const pmBalance = parseFloat(localStorage.getItem("pmBalance") || "10000");
    const newBalance = pmBalance + parseFloat(amount);
    localStorage.setItem("pmBalance", newBalance.toString());
    
    const merchantTransactions = JSON.parse(localStorage.getItem("merchantTransactions") || "[]");
    const newTransaction = {
      id: Date.now(),
      amount: parseFloat(amount),
      time: "Just now"
    };
    merchantTransactions.unshift(newTransaction);
    localStorage.setItem("merchantTransactions", JSON.stringify(merchantTransactions));
    
    const recentTransactions = JSON.parse(localStorage.getItem("recentTransactions") || "[]");
    const dashboardTransaction = {
      id: Date.now(),
      description: `Payment received: ${description || "QR Payment"}`,
      amount: parseFloat(amount),
      time: "Just now",
      type: "credit"
    };
    recentTransactions.unshift(dashboardTransaction);
    localStorage.setItem("recentTransactions", JSON.stringify(recentTransactions));
    
    window.dispatchEvent(new Event("balanceUpdate"));
    window.dispatchEvent(new Event("transactionUpdate"));
    window.dispatchEvent(new Event("merchantTransactionUpdate"));
    
    toast.success(`Payment of ${amount} PM received!`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 lg:pb-0">
      <Header />
      <TradingViewTicker />
      <HeroBanner 
        title="Generate Payment QR" 
        subtitle="Create a QR code for receiving payments"
      />
      
      <main className="container mx-auto px-4 pt-12 pb-12 flex-1">
        <Link to="/dashboard/merchant" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Merchant Dashboard
        </Link>

        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-lg bg-primary/10">
              <QrCode className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Generate Payment QR</h1>
              <p className="text-muted-foreground">Create QR codes for payments</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-8 bg-card/50 backdrop-blur-sm">
              <h2 className="text-xl font-bold mb-6">Payment Details</h2>
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Amount (PM)</label>
                  <Input 
                    type="number" 
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Description (Optional)</label>
                  <Input 
                    placeholder="Payment for..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Recipient Address</label>
                  <Input 
                    placeholder="0x..."
                    value={walletAddress}
                    readOnly
                  />
                </div>
                <Button variant="gradient" className="w-full" onClick={handleGenerate}>
                  <QrCode className="h-4 w-4 mr-2" />
                  Generate QR Code
                </Button>
              </div>
            </Card>

            <Card className="p-8 bg-card/50 backdrop-blur-sm">
              <h2 className="text-xl font-bold mb-6">QR Code Preview</h2>
              {generated ? (
                <div className="space-y-6">
                  <div className="aspect-square bg-white rounded-lg flex items-center justify-center p-4">
                    {qrCodeUrl && (
                      <img 
                        src={qrCodeUrl} 
                        alt="Payment QR Code" 
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-bold">{amount} PM</span>
                    </div>
                    {description && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Description:</span>
                        <span>{description}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="gradient" className="flex-1" onClick={handlePaymentComplete}>
                      Simulate Payment
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="aspect-square bg-muted/20 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <QrCode className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Enter details to generate QR code</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default GeneratePaymentQR;
