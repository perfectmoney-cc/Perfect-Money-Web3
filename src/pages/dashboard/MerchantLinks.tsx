import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { TradingViewTicker } from "@/components/TradingViewTicker";
import { HeroBanner } from "@/components/HeroBanner";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Footer } from "@/components/Footer";
import { WalletCard } from "@/components/WalletCard";
import { ArrowLeft, Link as LinkIcon, ExternalLink, Copy, Trash2, Home } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const MerchantLinks = () => {
  const navigate = useNavigate();
  const [paymentLinks, setPaymentLinks] = useState<any[]>(() => {
    const stored = localStorage.getItem("merchantPaymentLinks");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    const updateLinks = () => {
      const stored = localStorage.getItem("merchantPaymentLinks");
      if (stored) {
        setPaymentLinks(JSON.parse(stored));
      }
    };

    window.addEventListener("merchantLinksUpdate", updateLinks);
    return () => window.removeEventListener("merchantLinksUpdate", updateLinks);
  }, []);

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success("Link copied to clipboard!");
  };

  const deleteLink = (id: string) => {
    const updated = paymentLinks.filter(l => l.id !== id);
    setPaymentLinks(updated);
    localStorage.setItem("merchantPaymentLinks", JSON.stringify(updated));
    toast.success("Payment link deleted");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 lg:pb-0">
      <Header />
      <TradingViewTicker />
      <HeroBanner 
        title="Payment Links" 
        subtitle="Manage your active payment links"
      />
      
      <main className="container mx-auto px-4 pt-6 lg:pt-12 pb-12 flex-1">
        <div className="md:hidden mb-6">
          <WalletCard showQuickFunctionsToggle={false} compact={true} />
        </div>

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
              <BreadcrumbPage>Payment Links</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Active Payment Links</h2>
            <Button 
              variant="gradient" 
              size="sm"
              onClick={() => navigate('/dashboard/merchant/create-link')}
            >
              <LinkIcon className="h-4 w-4 mr-2" />
              New Link
            </Button>
          </div>

          {paymentLinks.length === 0 ? (
            <Card className="p-8 lg:p-12 bg-card/50 backdrop-blur-sm text-center">
              <LinkIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No payment links created yet</p>
              <Button 
                variant="gradient"
                onClick={() => navigate('/dashboard/merchant/create-link')}
              >
                Create Your First Link
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {paymentLinks.map((link) => (
                <Card key={link.id} className="p-4 lg:p-6 bg-card/50 backdrop-blur-sm">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <span className="text-sm text-muted-foreground">Active</span>
                      </div>
                      <p className="font-medium truncate">{link.description || `Payment Link #${link.id}`}</p>
                      <p className="text-lg font-bold text-primary">{link.amount} PM</p>
                      <p className="text-xs text-muted-foreground mt-1">Created: {link.createdAt}</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyLink(link.url)}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(link.url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Open
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => deleteLink(link.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default MerchantLinks;
