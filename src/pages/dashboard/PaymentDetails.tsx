import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { TradingViewTicker } from "@/components/TradingViewTicker";
import { HeroBanner } from "@/components/HeroBanner";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Footer } from "@/components/Footer";
import { ArrowLeft, CheckCircle, Clock, DollarSign } from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import pmLogo from "@/assets/pm-logo-new.png";
import { processMerchantPayment } from "@/utils/merchantAPI";

const PaymentDetails = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const amount = searchParams.get("amount") || "0";
  const description = searchParams.get("description") || "Payment";
  const recipient = searchParams.get("recipient") || "";
  const [isPaying, setIsPaying] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);

  const handlePayment = () => {
    setIsPaying(true);
    
    setTimeout(() => {
      // Get customer wallet
      const customerWallet = localStorage.getItem("connectedWallet") || "";
      
      // Get merchant API key from the payment link (if available)
      const apiKey = localStorage.getItem(`payment_link_api_${recipient}`) || "";

      // Process payment through merchant API
      const result = processMerchantPayment({
        apiKey: apiKey,
        amount: parseFloat(amount),
        currency: "PM",
        customerWallet: customerWallet,
        metadata: {
          description: description,
          merchantAddress: recipient,
          paymentLink: window.location.href
        }
      });

      setIsPaying(false);

      if (result.success) {
        setPaymentComplete(true);
        toast.success(`Payment of ${amount} PM sent successfully!`);
        
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } else {
        toast.error(result.error || "Payment failed. Please try again.");
      }
    }, 2000);
  };

  if (paymentComplete) {
    return (
      <div className="min-h-screen bg-background flex flex-col pb-20 lg:pb-0">
        <Header />
        <TradingViewTicker />
        <HeroBanner 
          title="Payment Complete" 
          subtitle="Your payment has been processed"
        />
        
        <main className="container mx-auto px-4 pt-12 pb-12 flex-1">
          <div className="max-w-2xl mx-auto">
            <Card className="p-8 bg-gradient-primary text-center">
              <div className="inline-flex p-4 rounded-full bg-green-500/20 mb-6">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
              <p className="text-xl mb-2">{amount} PM</p>
              <p className="text-muted-foreground mb-8">{description}</p>
              <Button variant="gradient" onClick={() => navigate("/dashboard")}>
                Return to Dashboard
              </Button>
            </Card>
          </div>
        </main>

        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 lg:pb-0">
      <Header />
      <TradingViewTicker />
      <HeroBanner 
        title="Payment Details" 
        subtitle="Review and confirm your payment"
      />
      
      <main className="container mx-auto px-4 pt-12 pb-12 flex-1">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="max-w-2xl mx-auto">
          <Card className="p-8 bg-card/50 backdrop-blur-sm">
            <div className="text-center mb-8">
              <div className="inline-flex p-4 rounded-lg bg-primary/10 mb-4">
                <DollarSign className="h-12 w-12 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Confirm Payment</h1>
              <p className="text-muted-foreground">Review the details before proceeding</p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="p-6 bg-gradient-primary rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-2">Amount to Pay</p>
                <div className="flex items-center justify-center gap-2">
                  <img src={pmLogo} alt="PM" className="h-8 w-8" />
                  <p className="text-4xl font-bold">{amount}</p>
                  <span className="text-2xl font-bold text-primary">PM</span>
                </div>
              </div>

              <div className="p-4 bg-background/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Description</p>
                <p className="font-medium">{description}</p>
              </div>

              {recipient && (
                <div className="p-4 bg-background/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Recipient</p>
                  <p className="font-mono text-sm break-all">{recipient}</p>
                </div>
              )}

              <div className="p-4 bg-background/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Transaction Fee</span>
                  <span className="font-medium">0 PM</span>
                </div>
              </div>

              <div className="p-4 bg-primary/10 rounded-lg border-2 border-primary/20">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Total</span>
                  <div className="flex items-center gap-2">
                    <img src={pmLogo} alt="PM" className="h-5 w-5" />
                    <span className="text-xl font-bold text-primary">{amount} PM</span>
                  </div>
                </div>
              </div>
            </div>

            <Button 
              variant="gradient" 
              className="w-full" 
              size="lg"
              onClick={handlePayment}
              disabled={isPaying}
            >
              {isPaying ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm & Pay
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground mt-4">
              By confirming, you authorize this payment from your PM balance
            </p>
          </Card>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default PaymentDetails;
