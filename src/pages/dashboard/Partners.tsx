import { useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { TradingViewTicker } from "@/components/TradingViewTicker";
import { HeroBanner } from "@/components/HeroBanner";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Footer } from "@/components/Footer";
import { WalletCard } from "@/components/WalletCard";
import { ArrowLeft, Handshake, Building2, Globe, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import useEmblaCarousel from 'embla-carousel-react';

const PartnersPage = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });

  const partners = Array.from({ length: 10 }, (_, i) => ({
    name: `Partner Company ${i + 1}`,
    type: ["Exchange", "Technology", "Wallet Provider", "Marketplace"][i % 4],
    status: "Active",
    logo: `Partner ${i + 1}`,
  }));

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 lg:pb-0">
      <Header />
      <TradingViewTicker />
      <HeroBanner 
        title="Partners Network" 
        subtitle="Connect with industry leaders and grow together"
      />
      
      <main className="container mx-auto px-4 pt-12 pb-12 flex-1">
        {/* Mobile Wallet Card */}
        <div className="md:hidden mb-6">
          <WalletCard showQuickFunctionsToggle={false} compact={true} />
        </div>
        
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-lg bg-primary/10">
              <Handshake className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Partnership Program</h1>
              <p className="text-muted-foreground">Build strategic alliances</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 bg-card/50 backdrop-blur-sm">
              <Building2 className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-bold text-2xl mb-1">50+</h3>
              <p className="text-sm text-muted-foreground">Active Partners</p>
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur-sm">
              <Globe className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-bold text-2xl mb-1">25</h3>
              <p className="text-sm text-muted-foreground">Countries</p>
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur-sm">
              <CheckCircle className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-bold text-2xl mb-1">$2M+</h3>
              <p className="text-sm text-muted-foreground">Partnership Volume</p>
            </Card>
          </div>

          <Card className="p-8 bg-card/50 backdrop-blur-sm mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Current Partners</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={scrollPrev}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={scrollNext}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex gap-4">
                {partners.map((partner, index) => (
                  <Card key={index} className="p-6 bg-background/50 min-w-[280px] flex-shrink-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-bold">{partner.name}</h3>
                          <p className="text-sm text-muted-foreground">{partner.type}</p>
                        </div>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-500">
                        {partner.status}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </Card>

          <Card className="p-8 bg-card/50 backdrop-blur-sm mb-6">
            <h2 className="text-xl font-bold mb-4">Partnership Benefits</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex gap-3">
                <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Revenue Sharing</h3>
                  <p className="text-sm text-muted-foreground">Earn a percentage of all transactions generated</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Technical Support</h3>
                  <p className="text-sm text-muted-foreground">Dedicated integration and API support</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Marketing Resources</h3>
                  <p className="text-sm text-muted-foreground">Co-marketing opportunities and materials</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Priority Access</h3>
                  <p className="text-sm text-muted-foreground">Early access to new features and updates</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-8 bg-gradient-primary text-center">
            <h2 className="text-2xl font-bold mb-4">Become a Partner</h2>
            <p className="text-foreground/80 mb-6">
              Join our growing network of partners and unlock new opportunities for your business
            </p>
            <Link to="/dashboard/partners/apply">
              <Button variant="secondary" size="lg">
                Apply for Partnership
              </Button>
            </Link>
          </Card>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default PartnersPage;
