import { Button } from "@/components/ui/button";
import { Wallet, Download } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { FaAndroid, FaApple } from "react-icons/fa";
import pmLogo from "@/assets/pm-app-logo.png";
export const MobileLanding = () => {
  const navigate = useNavigate();
  const {
    isConnected
  } = useAccount();
  const handleInstallApp = () => {
    const installPrompt = (window as any).deferredPrompt;
    if (installPrompt) {
      installPrompt.prompt();
      installPrompt.userChoice.then((choice: any) => {
        if (choice.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        }
        (window as any).deferredPrompt = null;
      });
    } else if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js');
    }
  };
  return <div className="min-h-screen flex items-center justify-center overflow-hidden relative bg-background">
      {/* Animated bubble background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20" />
        
        {/* Floating bubbles */}
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-primary/20 blur-3xl animate-[pulse_4s_ease-in-out_infinite]" />
        <div className="absolute top-40 right-20 w-40 h-40 rounded-full bg-secondary/20 blur-3xl animate-[pulse_5s_ease-in-out_infinite]" />
        <div className="absolute bottom-32 left-1/4 w-28 h-28 rounded-full bg-primary/15 blur-2xl animate-[pulse_6s_ease-in-out_infinite]" />
        <div className="absolute bottom-20 right-1/3 w-36 h-36 rounded-full bg-secondary/15 blur-3xl animate-[pulse_7s_ease-in-out_infinite]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-primary/10 blur-3xl animate-[pulse_8s_ease-in-out_infinite]" />
        
        {/* Radial gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(263,70%,60%,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(190,80%,50%,0.15),transparent_50%)]" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-md mx-auto text-center space-y-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-2xl animate-pulse" />
              <img alt="PerfectMoney" className="h-32 w-32 relative z-10 rounded-3xl shadow-2xl" src="/lovable-uploads/9fc72b1f-5c36-4cc4-8d36-ba14d8af3610.png" />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Perfect Money</span>
            </h1>
            <p className="text-lg text-muted-foreground">Decentralized Payments Made Just Perfect</p>
            <div className="inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
              <span className="text-sm font-medium bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Powered by Binance Smart Chain
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-4 pt-8">
            <ConnectButton.Custom>
              {({
              account,
              chain,
              openConnectModal,
              mounted
            }) => {
              const ready = mounted;
              const connected = ready && account && chain;
              if (connected && isConnected) {
                navigate("/dashboard");
              }
              return <Button variant="gradient" size="lg" className="w-full gap-2 shadow-lg" onClick={openConnectModal}>
                    <Wallet className="h-5 w-5" />
                    Connect Wallet
                  </Button>;
            }}
            </ConnectButton.Custom>

            <div className="grid grid-cols-2 gap-3 w-full">
              <Button variant="outline" size="lg" className="gap-2" asChild>
                <Link to="/downloads">
                  <FaAndroid className="h-5 w-5 text-green-500" />
                  Android
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="gap-2" asChild>
                <Link to="/downloads">
                  <FaApple className="h-5 w-5" />
                  iOS
                </Link>
              </Button>
            </div>
            <Button variant="outline" size="lg" className="w-full gap-2" onClick={handleInstallApp}>
              <Download className="h-5 w-5" />
              Install from Browser
            </Button>
          </div>
        </div>
      </div>

      
    </div>;
};
export default MobileLanding;