import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Header } from "@/components/Header";
import { TradingViewTicker } from "@/components/TradingViewTicker";
import { HeroBanner } from "@/components/HeroBanner";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Footer } from "@/components/Footer";
import { ArrowLeft, Link as LinkIcon, Copy, CheckCircle, ExternalLink } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const CreatePaymentLink = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [merchantAddress, setMerchantAddress] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const wallet = localStorage.getItem("connectedWallet");
    setMerchantAddress(wallet || "");
  }, []);

  const handleGenerate = () => {
    if (!amount) {
      toast.error("Please enter an amount");
      return;
    }

    // Get merchant API key
    const merchantApiKeys = JSON.parse(localStorage.getItem("merchantApiKeys") || "{}");
    const apiKey = merchantApiKeys[merchantAddress];

    if (!apiKey) {
      toast.error("Merchant API key not found. Please subscribe to a merchant plan first.");
      return;
    }

    const linkId = Math.random().toString(36).substr(2, 9);
    const link = `https://perfectmoney.app/pay/${linkId}`;
    
    // Store API key reference for this payment link
    localStorage.setItem(`payment_link_api_${merchantAddress}`, apiKey);
    
    setGeneratedLink(link);
    toast.success("Payment link created successfully!");
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
      description: `Payment received: ${description || "Payment Link"}`,
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

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 lg:pb-0">
      <Header />
      <TradingViewTicker />
      <HeroBanner 
        title="Create Payment Link" 
        subtitle="Generate shareable payment links"
      />
      
      <main className="container mx-auto px-4 pt-12 pb-12 flex-1">
        <Link to="/dashboard/merchant" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Merchant Dashboard
        </Link>

        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6 lg:mb-8">
            <div className="p-2 lg:p-3 rounded-lg bg-primary/10">
              <LinkIcon className="h-5 w-5 lg:h-6 lg:w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">Create Payment Link</h1>
              <p className="text-sm lg:text-base text-muted-foreground">Generate links for easy payments</p>
            </div>
          </div>

          <Card className="p-4 lg:p-8 bg-card/50 backdrop-blur-sm mb-6">
            <h2 className="text-lg lg:text-xl font-bold mb-4 lg:mb-6">Payment Details</h2>
            <div className="space-y-4 lg:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Amount (PM)</label>
                  <Input 
                    type="number" 
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="text-base"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Title</label>
                  <Input 
                    placeholder="Payment for..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="text-base"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Description (Optional)</label>
                <Textarea 
                  placeholder="Additional details about this payment..."
                  className="min-h-[80px] lg:min-h-[100px] text-base"
                />
              </div>

              <Button variant="gradient" onClick={handleGenerate} className="w-full sm:w-auto">
                <LinkIcon className="h-4 w-4 mr-2" />
                Generate Payment Link
              </Button>
            </div>
          </Card>

          {generatedLink && (
            <Card className="p-4 lg:p-8 bg-gradient-primary">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="h-5 w-5 lg:h-6 lg:w-6 text-green-500" />
                <h2 className="text-lg lg:text-xl font-bold">Payment Link Generated!</h2>
              </div>
              
              <div className="space-y-4">
                <div className="p-3 lg:p-4 bg-background/10 rounded-lg">
                  <p className="text-xs lg:text-sm text-foreground/80 mb-2">Your payment link:</p>
                  <p className="font-mono text-xs lg:text-sm break-all">{generatedLink}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Button variant="secondary" onClick={handleCopy} className="w-full">
                    {copied ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Link
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate(`/dashboard/merchant/share-link?amount=${amount}&description=${description}&link=${generatedLink}`)}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  <Button variant="gradient" className="w-full" onClick={handlePaymentComplete}>
                    Simulate Payment
                  </Button>
                </div>

                <div className="pt-4 border-t border-border/20">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-foreground/60 mb-1">Amount</p>
                      <p className="font-bold">{amount} PM</p>
                    </div>
                    {description && (
                      <div>
                        <p className="text-foreground/60 mb-1">Title</p>
                        <p className="font-bold break-words">{description}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default CreatePaymentLink;
