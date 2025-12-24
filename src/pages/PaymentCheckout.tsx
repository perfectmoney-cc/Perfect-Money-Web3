import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Loader2, CheckCircle, XCircle, Clock, AlertTriangle, CreditCard, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import pmLogo from "@/assets/pm-logo-new.png";
import QRCode from "qrcode";

interface PaymentLink {
  id: string;
  amount: number;
  currency: string;
  description: string;
  status: 'pending' | 'paid' | 'expired' | 'cancelled';
  expiresAt: string;
  merchantName?: string;
  redirectUrl?: string;
}

const TOKEN_ADDRESSES: Record<string, string> = {
  PM: "0x181108f76d9910569203b5d59eb14Bc31961a989",
  USDT: "0x55d398326f99059fF775485246999027B3197955",
  USDC: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
  PYUSD: "0x6c3ea9036406852006290770BEdFcAbA0e23A0e8",
};

const PaymentCheckout = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const [paymentLink, setPaymentLink] = useState<PaymentLink | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  // Fetch payment link details
  useEffect(() => {
    const fetchPaymentLink = async () => {
      if (!id) return;
      
      try {
        // For demo, create mock payment link
        // In production, this would fetch from the merchant-payment-api edge function
        const mockPayment: PaymentLink = {
          id: id,
          amount: 100,
          currency: 'PM',
          description: 'Payment for Order #' + id.slice(0, 8),
          status: 'pending',
          expiresAt: new Date(Date.now() + 3600000).toISOString(),
          merchantName: 'Demo Merchant',
        };
        
        setPaymentLink(mockPayment);
        
        // Generate QR code
        const paymentUrl = window.location.href;
        const qr = await QRCode.toDataURL(paymentUrl, { width: 200, margin: 2 });
        setQrCodeUrl(qr);
      } catch (error) {
        console.error('Error fetching payment:', error);
        toast.error('Failed to load payment details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentLink();
  }, [id]);

  // Countdown timer
  useEffect(() => {
    if (!paymentLink?.expiresAt) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(paymentLink.expiresAt).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft("Expired");
        setPaymentLink(prev => prev ? { ...prev, status: 'expired' } : null);
        clearInterval(timer);
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [paymentLink?.expiresAt]);

  const handlePayment = async () => {
    if (!isConnected || !address || !paymentLink) {
      toast.error('Please connect your wallet first');
      return;
    }
    setIsPaying(true);
    // Simulate payment - in production would use writeContract
    setTimeout(() => {
      setPaymentLink(prev => prev ? { ...prev, status: 'paid' } : null);
      toast.success('Payment successful!');
      setIsPaying(false);
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!paymentLink) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 pt-24 pb-12">
          <Card className="max-w-md mx-auto p-8 text-center">
            <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Payment Not Found</h1>
            <p className="text-muted-foreground mb-6">This payment link doesn't exist or has been removed.</p>
            <Button onClick={() => navigate('/')}>Go Home</Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <Card className="max-w-lg mx-auto overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary/20 to-secondary/20 p-6 border-b">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <img src={pmLogo} alt="PM" className="h-10 w-10" />
                <div>
                  <h1 className="font-bold text-lg">Payment Request</h1>
                  <p className="text-sm text-muted-foreground">{paymentLink.merchantName || 'Merchant'}</p>
                </div>
              </div>
              <Badge 
                variant={paymentLink.status === 'paid' ? 'default' : paymentLink.status === 'expired' ? 'destructive' : 'secondary'}
                className="capitalize"
              >
                {paymentLink.status}
              </Badge>
            </div>
          </div>

          {/* Payment Details */}
          <div className="p-6 space-y-6">
            {/* Amount */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Amount Due</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-4xl font-bold">{paymentLink.amount.toLocaleString()}</span>
                <span className="text-2xl font-semibold text-primary">{paymentLink.currency}</span>
              </div>
              {paymentLink.description && (
                <p className="text-sm text-muted-foreground mt-2">{paymentLink.description}</p>
              )}
            </div>

            {/* Timer */}
            {paymentLink.status === 'pending' && (
              <div className="flex items-center justify-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Expires in:</span>
                <span className="font-mono font-bold text-primary">{timeLeft}</span>
              </div>
            )}

            {/* QR Code */}
            {paymentLink.status === 'pending' && qrCodeUrl && (
              <div className="flex justify-center">
                <div className="p-4 bg-white rounded-xl">
                  <img src={qrCodeUrl} alt="Payment QR" className="w-40 h-40" />
                </div>
              </div>
            )}

            {/* Status Messages */}
            {paymentLink.status === 'paid' && (
              <div className="text-center py-8">
                <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-green-500 mb-2">Payment Successful!</h2>
                <p className="text-muted-foreground">Thank you for your payment.</p>
              </div>
            )}

            {paymentLink.status === 'expired' && (
              <div className="text-center py-8">
                <AlertTriangle className="h-20 w-20 text-destructive mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-destructive mb-2">Payment Expired</h2>
                <p className="text-muted-foreground">This payment link has expired.</p>
              </div>
            )}

            {/* Pay Button */}
            {paymentLink.status === 'pending' && (
              <div className="space-y-3">
                {isConnected ? (
                  <Button 
                    variant="gradient" 
                    size="lg" 
                    className="w-full"
                    onClick={handlePayment}
                    disabled={isPaying}
                  >
                    {isPaying ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-5 w-5 mr-2" />
                        Pay {paymentLink.amount} {paymentLink.currency}
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="text-center">
                    <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground mb-4">Connect your wallet to pay</p>
                    <Button variant="outline" size="lg" className="w-full">
                      Connect Wallet
                    </Button>
                  </div>
                )}

                <p className="text-xs text-center text-muted-foreground">
                  Powered by Perfect Money • Secure Payment
                </p>
              </div>
            )}
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentCheckout;
