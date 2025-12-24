import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Wallet, Network } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import logoImage from "@/assets/perfect-money-logo.png";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { PromoBanner } from "./PromoBanner";
import { PromoBannerSettings } from "./PromoBannerSettings";
export const Header = () => {
  const {
    isConnected
  } = useAccount();
  const navigate = useNavigate();
  const location = useLocation();
  const [bannerSettings, setBannerSettings] = useState({
    text: "Special Offer: Buy PM Token & Get {bonus}% Bonus!",
    endDate: "",
    bonusPercentage: 20
  });
  const handleBannerSettingsSave = (settings: typeof bannerSettings) => {
    setBannerSettings(settings);
  };
  useEffect(() => {
    const infoPages = ['/roadmap', '/tokenomics', '/whitepaper', '/about', '/faq', '/contact'];
    const isInfoPage = infoPages.some(page => location.pathname === page);
    if (isConnected && location.pathname === '/' && !isInfoPage) {
      navigate('/dashboard');
      toast.success('Wallet connected successfully!');
    } else if (!isConnected && location.pathname.startsWith('/dashboard')) {
      navigate('/');
      toast.info('Wallet disconnected. Redirecting to home...');
    }
  }, [isConnected, location.pathname, navigate]);
  return <header className="fixed top-0 left-0 right-0 z-50">
      <PromoBanner text={bannerSettings.text} endDate={bannerSettings.endDate} bonusPercentage={bannerSettings.bonusPercentage} />
      <PromoBannerSettings onSave={handleBannerSettingsSave} />
      <div className="border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img alt="PerfectMoney Logo" className="h-10 w-10" src="/lovable-uploads/48c1d590-39bf-4769-b6b8-ad1c0bbcd829.png" />
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white">Perfect Money™</span>
              <span className="text-[10px] text-white/80 font-medium -mt-1">Just Made It Perfect</span>
            </div>
          </Link>
          
          <nav className="hidden lg:flex items-center gap-6">
            <Link to="/" className="text-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/about" className="text-foreground hover:text-primary transition-colors">
              About
            </Link>
            <Link to="/tokenomics" className="text-foreground hover:text-primary transition-colors">
              Tokenomics
            </Link>
            <Link to="/roadmap" className="text-foreground hover:text-primary transition-colors">
              Roadmap
            </Link>
            <Link to="/whitepaper" className="text-foreground hover:text-primary transition-colors">
              Whitepaper
            </Link>
            <Link to="/faq" className="text-foreground hover:text-primary transition-colors">
              FAQ
            </Link>
            <Link to="/contact" className="text-foreground hover:text-primary transition-colors">
              Contact Us
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <ConnectButton.Custom>
              {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                mounted
              }) => {
                const connected = mounted && account && chain;
                return <div className="flex items-center gap-2">
                    {connected && <Button variant="outline" size="icon" onClick={openChainModal} title="Switch Network" className="hidden lg:flex">
                        <Network className="h-4 w-4" />
                      </Button>}
                    {connected ? <>
                        <Button variant="outline" size="icon" onClick={openChainModal} className="lg:hidden">
                          <Network className="h-4 w-4" />
                        </Button>
                        <Button variant="gradient" className="gap-2" onClick={openAccountModal}>
                          <Wallet className="h-4 w-4 lg:hidden" />
                          <span className="hidden lg:inline">{account.displayName}</span>
                        </Button>
                      </> : <Button variant="gradient" className="gap-2" onClick={openConnectModal}>
                        <Wallet className="h-4 w-4" />
                        <span className="hidden lg:inline">Connect Wallet</span>
                      </Button>}
                  </div>;
              }}
            </ConnectButton.Custom>
          </div>
        </div>
      </div>
      </div>
    </header>;
};