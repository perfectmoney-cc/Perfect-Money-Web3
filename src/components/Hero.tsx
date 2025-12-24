import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Zap, Globe, Users, Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useNavigate, Link } from "react-router-dom";
import { FaAndroid, FaApple } from "react-icons/fa";
export const Hero = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success("Successfully subscribed to newsletter!");
      setEmail("");
    }
  };
  return <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Animated background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(263,70%,60%,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(190,80%,50%,0.15),transparent_50%)]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block mb-6 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm lg:block">
            <span className="text-sm font-medium bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Powered by Binance Smart Chain
            </span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Decentralized Payments
            <br />
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Just Made Perfect</span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Experience instant, secure, and borderless transactions with PerfectMoney tokens on the Binance Smart Chain.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <ConnectButton.Custom>
              {({
              account,
              chain,
              openConnectModal,
              mounted
            }) => {
              const ready = mounted;
              const connected = ready && account && chain;
              return <Button variant="hero" size="lg" className="gap-2" onClick={() => {
                if (connected) {
                  navigate("/dashboard");
                } else {
                  openConnectModal();
                }
              }}>
                    {connected ? "Launch App" : "Connect Wallet"}
                    <ArrowRight className="h-5 w-5" />
                  </Button>;
            }}
            </ConnectButton.Custom>
            <Button variant="outline" size="lg" asChild className="hidden lg:inline-flex">
              <a href="#about">Learn More</a>
            </Button>
          </div>

          {/* Download Buttons */}
          

          {/* Stats - Hidden on mobile, shown on desktop */}
          <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto mb-16">
            <div className="p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border">
              <div className="flex justify-center mb-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2">100B PM</h3>
              <p className="text-muted-foreground">Total Supply</p>
            </div>
            
            <div className="p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border">
              <div className="flex justify-center mb-3">
                <div className="p-3 rounded-lg bg-secondary/10">
                  <Zap className="h-6 w-6 text-secondary" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2">Instant</h3>
              <p className="text-muted-foreground">Transactions</p>
            </div>
            
            <div className="p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border">
              <div className="flex justify-center mb-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2">Global</h3>
              <p className="text-muted-foreground">Accessibility</p>
            </div>

            <div className="p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border">
              <div className="flex justify-center mb-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2">50K+</h3>
              <p className="text-muted-foreground">Active Users</p>
            </div>
          </div>
        </div>
      </div>

    </section>;
};