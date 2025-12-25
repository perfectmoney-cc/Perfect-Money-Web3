import { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { TradingViewTicker } from "@/components/TradingViewTicker";
import { HeroBanner } from "@/components/HeroBanner";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Footer } from "@/components/Footer";
import { WalletCard } from "@/components/WalletCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Handshake, Building2, Globe, CheckCircle, ChevronLeft, ChevronRight, MapPin, Settings, Activity, Coins } from "lucide-react";
import { Link } from "react-router-dom";
import useEmblaCarousel from 'embla-carousel-react';
import PartnersMap from "@/components/partners/PartnersMap";
import PartnerEventsFeed from "@/components/partners/PartnerEventsFeed";
import { useAccount } from "wagmi";

const PartnersPage = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });
  const { isConnected } = useAccount();

  const partners = Array.from({ length: 10 }, (_, i) => ({
    name: `Exchanger ${i + 1}`,
    type: ["Currency Exchange", "Remittance", "Digital Payments", "Cross-Border"][i % 4],
    status: "Active",
    region: ["Asia", "UAE", "South Africa", "Southeast Asia"][i % 4],
  }));

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 lg:pb-0">
      <Header />
      <TradingViewTicker />
      <HeroBanner 
        title="Global Exchanger Network" 
        subtitle="Connect with trusted exchangers worldwide for seamless PM Token transactions"
      />
      
      <main className="container mx-auto px-4 pt-12 pb-12 flex-1">
        {/* Mobile Wallet Card */}
        <div className="md:hidden mb-6">
          <WalletCard showQuickFunctionsToggle={false} compact={true} />
        </div>
        
        <div className="flex items-center justify-between mb-6">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          {isConnected && (
            <Link to="/dashboard/partners/admin">
              <Button variant="outline" size="sm" className="gap-2">
                <Settings className="h-4 w-4" />
                Admin
              </Button>
            </Link>
          )}
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-lg bg-primary/10">
              <Globe className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Exchanger for Global Market</h1>
              <p className="text-muted-foreground">Trusted exchangers across Asia, UAE, and South Africa</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 bg-card/50 backdrop-blur-sm">
              <Building2 className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-bold text-2xl mb-1">30+</h3>
              <p className="text-sm text-muted-foreground">Active Exchangers</p>
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur-sm">
              <Globe className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-bold text-2xl mb-1">8</h3>
              <p className="text-sm text-muted-foreground">Countries</p>
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur-sm">
              <CheckCircle className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-bold text-2xl mb-1">$5M+</h3>
              <p className="text-sm text-muted-foreground">Monthly Volume</p>
            </Card>
          </div>

          <Tabs defaultValue="exchangers" className="space-y-6">
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="exchangers" className="gap-2">
                <Building2 className="h-4 w-4" />
                Exchangers
              </TabsTrigger>
              <TabsTrigger value="map" className="gap-2">
                <MapPin className="h-4 w-4" />
                Global Map
              </TabsTrigger>
              <TabsTrigger value="activity" className="gap-2">
                <Activity className="h-4 w-4" />
                Live Activity
              </TabsTrigger>
            </TabsList>

            <TabsContent value="exchangers">
              <Card className="p-8 bg-card/50 backdrop-blur-sm mb-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Verified Exchangers</h2>
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
                              <Coins className="h-5 w-5 text-primary" />
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
                        <p className="text-xs text-muted-foreground">Region: {partner.region}</p>
                      </Card>
                    ))}
                  </div>
                </div>
              </Card>

              <Card className="p-8 bg-card/50 backdrop-blur-sm mb-6">
                <h2 className="text-xl font-bold mb-4">Exchanger Benefits</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex gap-3">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">Revenue Sharing</h3>
                      <p className="text-sm text-muted-foreground">Earn commission on every PM Token transaction</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">PM Token Staking Rewards</h3>
                      <p className="text-sm text-muted-foreground">Stake PM tokens for enhanced tier benefits</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">Global Market Access</h3>
                      <p className="text-sm text-muted-foreground">Connect with users across Asia, UAE, and Africa</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">Priority Support</h3>
                      <p className="text-sm text-muted-foreground">24/7 dedicated exchanger support line</p>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="map">
              <PartnersMap />
            </TabsContent>

            <TabsContent value="activity">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PartnerEventsFeed />
                <Card className="p-6 bg-card/50 backdrop-blur-sm">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Coins className="h-5 w-5 text-primary" />
                    Staking Tiers
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg border border-amber-600/30 bg-amber-500/5">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-amber-500">Bronze Tier</span>
                        <span className="text-sm text-muted-foreground">1,000 PM</span>
                      </div>
                      <p className="text-xs text-muted-foreground">5% revenue share • Basic support</p>
                    </div>
                    <div className="p-4 rounded-lg border border-gray-400/30 bg-gray-400/5">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-400">Silver Tier</span>
                        <span className="text-sm text-muted-foreground">5,000 PM</span>
                      </div>
                      <p className="text-xs text-muted-foreground">10% revenue share • Priority support</p>
                    </div>
                    <div className="p-4 rounded-lg border border-yellow-500/30 bg-yellow-500/5">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-yellow-500">Gold Tier</span>
                        <span className="text-sm text-muted-foreground">25,000 PM</span>
                      </div>
                      <p className="text-xs text-muted-foreground">15% revenue share • Dedicated manager</p>
                    </div>
                    <div className="p-4 rounded-lg border border-purple-500/30 bg-purple-500/5">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-purple-500">Platinum Tier</span>
                        <span className="text-sm text-muted-foreground">100,000 PM</span>
                      </div>
                      <p className="text-xs text-muted-foreground">20% revenue share • VIP benefits</p>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          <Card className="p-8 bg-gradient-primary text-center mt-6">
            <h2 className="text-2xl font-bold mb-4">Become an Exchanger</h2>
            <p className="text-foreground/80 mb-6">
              Join our global network of PM Token exchangers and start earning today. Stake PM tokens to unlock premium benefits.
            </p>
            <Link to="/dashboard/partners/apply">
              <Button variant="secondary" size="lg">
                Apply for Exchanger Partnership
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
