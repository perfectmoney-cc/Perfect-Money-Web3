import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { TradingViewTicker } from "@/components/TradingViewTicker";
import { HeroBanner } from "@/components/HeroBanner";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Footer } from "@/components/Footer";
import { ArrowLeft, Copy, CheckCircle, ExternalLink, Share2 } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import QRCode from "qrcode";

const ShareLinkDetails = () => {
  const [searchParams] = useSearchParams();
  const amount = searchParams.get("amount") || "0";
  const description = searchParams.get("description") || "Payment";
  const linkUrl = searchParams.get("link") || "";
  const [qrCode, setQrCode] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (linkUrl) {
      QRCode.toDataURL(linkUrl, { width: 300, margin: 2 })
        .then(setQrCode)
        .catch(() => toast.error("Failed to generate QR code"));
    }
  }, [linkUrl]);

  const handleCopy = () => {
    navigator.clipboard.writeText(linkUrl);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Payment Request: ${description}`,
          text: `Pay ${amount} PM tokens`,
          url: linkUrl,
        });
        toast.success("Shared successfully!");
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          toast.error("Failed to share");
        }
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 lg:pb-0">
      <Header />
      <TradingViewTicker />
      <HeroBanner 
        title="Share Link Details" 
        subtitle="View and share your payment link"
      />
      
      <main className="container mx-auto px-4 pt-12 pb-12 flex-1">
        <Link to="/dashboard/merchant/create-link" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Create Payment Link
        </Link>

        <div className="max-w-2xl mx-auto">
          <Card className="p-8 bg-card/50 backdrop-blur-sm">
            <div className="text-center mb-8">
              <div className="inline-flex p-4 rounded-lg bg-primary/10 mb-4">
                <Share2 className="h-12 w-12 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Payment Link Ready</h1>
              <p className="text-muted-foreground">Share this link to receive payment</p>
            </div>

            {qrCode && (
              <div className="flex justify-center mb-6">
                <img src={qrCode} alt="Payment QR Code" className="rounded-lg border-4 border-border" />
              </div>
            )}

            <div className="space-y-4 mb-6">
              <div className="p-4 bg-background/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Amount</p>
                <p className="text-2xl font-bold text-primary">{amount} PM</p>
              </div>

              <div className="p-4 bg-background/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Description</p>
                <p className="font-medium">{description}</p>
              </div>

              <div className="p-4 bg-background/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Payment Link</p>
                <p className="font-mono text-sm break-all text-primary">{linkUrl}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button variant="outline" onClick={handleCopy} className="w-full">
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
              <Button variant="gradient" onClick={handleShare} className="w-full">
                <Share2 className="h-4 w-4 mr-2" />
                Share Link
              </Button>
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <a 
                href={linkUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Open payment page
              </a>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default ShareLinkDetails;
