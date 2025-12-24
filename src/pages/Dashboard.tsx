import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { TradingViewTicker } from "@/components/TradingViewTicker";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { WalletCard } from "@/components/WalletCard";
import { BscTransactionHistory } from "@/components/BscTransactionHistory";
import { PortfolioValue } from "@/components/PortfolioValue";
import { TokenPriceCards } from "@/components/TokenPriceCards";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { Skeleton } from "@/components/ui/skeleton";
import { Wallet, Send, ArrowDownToLine, ShoppingCart, TrendingUp, Users, Store, Gift, Handshake, ArrowDownUp, Shield, MessageCircle, CandlestickChart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";
import { toast } from "sonner";

// Dashboard skeleton component
const DashboardSkeleton = () => (
  <div className="space-y-6 px-0">
    <Card className="p-6 bg-card/50 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-6 w-48" />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2 mt-4">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    </Card>
    <Skeleton className="h-32 rounded-lg" />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-24 rounded-lg" />
      ))}
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-28 rounded-lg" />
      ))}
    </div>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { isConnected } = useAccount();
  const [walletConnected, setWalletConnected] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);
  
  const connectWallet = async () => {
    // Placeholder for Web3 wallet connection
    toast.success("Wallet connected successfully!");
    setWalletConnected(true);
  };
  return <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <Header />
      <TradingViewTicker />
      <PWAInstallPrompt walletConnected={isConnected || walletConnected} />
      
      <main className="container mx-auto px-4 pt-24 pb-12 py-[45px]">
        {!walletConnected ? <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="p-12 text-center max-w-md bg-card/50 backdrop-blur-sm">
              <div className="mb-6 flex justify-center">
                <div className="p-6 rounded-full bg-primary/10">
                  <Wallet className="h-12 w-12 text-primary" />
                </div>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Connect Your Wallet</h2>
              <p className="text-muted-foreground mb-8">
                Connect your Web3 wallet to access the PerfectMoney platform and manage your PM tokens.
              </p>
              <Button variant="gradient" size="lg" className="w-full" onClick={connectWallet}>
                <Wallet className="h-5 w-5 mr-2" />
                Connect Wallet
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                Supports MetaMask, Trust Wallet, and WalletConnect
              </p>
            </Card>
          </div> : isLoading ? <DashboardSkeleton /> : <div className="space-y-6 px-0">
          {/* Wallet Card Component */}
            <WalletCard showQuickFunctionsToggle={true} />
            
            {/* Portfolio Value */}
            <PortfolioValue />

            {/* Token Price Cards */}
            <TokenPriceCards />
            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4 md:p-6 transition-all bg-card/50 backdrop-blur-sm hover:border-primary/50 cursor-pointer">
                <a href="/dashboard/send" className="flex flex-col items-center gap-2 md:flex-row md:items-start md:gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Send className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                  </div>
                  <div className="text-center md:text-left">
                    <h3 className="font-bold mb-1 text-sm md:text-base">Send</h3>
                    <p className="text-xs md:text-sm text-muted-foreground hidden md:block">Transfer PM tokens</p>
                  </div>
                </a>
              </Card>

              <Card className="p-4 md:p-6 transition-all bg-card/50 backdrop-blur-sm hover:border-secondary/50 cursor-pointer">
                <a href="/dashboard/receive" className="flex flex-col items-center gap-2 md:flex-row md:items-start md:gap-4">
                  <div className="p-3 rounded-lg bg-secondary/10">
                    <ArrowDownToLine className="h-5 w-5 md:h-6 md:w-6 text-secondary" />
                  </div>
                  <div className="text-center md:text-left">
                    <h3 className="font-bold mb-1 text-sm md:text-base">Receive</h3>
                    <p className="text-xs md:text-sm text-muted-foreground hidden md:block">Get PM tokens</p>
                  </div>
                </a>
              </Card>

              <Card className="p-4 md:p-6 transition-all bg-card/50 backdrop-blur-sm hover:border-primary/50 cursor-pointer">
                <a href="/dashboard/swap" className="flex flex-col items-center gap-2 md:flex-row md:items-start md:gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <ArrowDownUp className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                  </div>
                  <div className="text-center md:text-left">
                    <h3 className="font-bold mb-1 text-sm md:text-base">Swap</h3>
                    <p className="text-xs md:text-sm text-muted-foreground hidden md:block">Exchange tokens</p>
                  </div>
                </a>
              </Card>

              <Card className="p-4 md:p-6 transition-all bg-card/50 backdrop-blur-sm hover:border-green-500/50 cursor-pointer">
                <a href="/dashboard/trade" className="flex flex-col items-center gap-2 md:flex-row md:items-start md:gap-4">
                  <div className="p-3 rounded-lg bg-green-500/10">
                    <CandlestickChart className="h-5 w-5 md:h-6 md:w-6 text-green-500" />
                  </div>
                  <div className="text-center md:text-left">
                    <h3 className="font-bold mb-1 text-sm md:text-base">Trade</h3>
                    <p className="text-xs md:text-sm text-muted-foreground hidden md:block">PM/USDT Chart</p>
                  </div>
                </a>
              </Card>
            </div>
            {/* BSC Transaction History */}
            <BscTransactionHistory />
          </div>}
      </main>

      <MobileBottomNav />
    </div>;
};
export default Dashboard;