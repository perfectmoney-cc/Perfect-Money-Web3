import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { toast } from "sonner";
import pmLogo from "@/assets/pm-logo-new.png";

interface ConnectWalletModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: () => void;
}

export const ConnectWalletModal = ({ open, onOpenChange, onConnect }: ConnectWalletModalProps) => {
  const wallets = [
    {
      name: "MetaMask",
      icon: "🦊",
      description: "Connect using MetaMask browser extension",
    },
    {
      name: "Trust Wallet",
      icon: "🛡️",
      description: "Connect using Trust Wallet mobile or extension",
    },
    {
      name: "WalletConnect",
      icon: "🔗",
      description: "Scan QR code with your mobile wallet",
    },
    {
      name: "Coinbase Wallet",
      icon: "💼",
      description: "Connect using Coinbase Wallet",
    },
  ];

  const handleWalletClick = (walletName: string) => {
    toast.success(`Connecting to ${walletName}...`);
    setTimeout(() => {
      onConnect();
      onOpenChange(false);
      toast.success(`Successfully connected to ${walletName}!`);
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <img src={pmLogo} alt="PM Logo" className="h-16 w-16" />
          </div>
          <DialogTitle className="flex items-center justify-center gap-2 text-2xl">
            <Wallet className="h-6 w-6 text-primary" />
            Connect Wallet
          </DialogTitle>
          <DialogDescription className="text-center">
            Choose your preferred wallet to connect to PerfectMoney
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-3 py-4">
          {wallets.map((wallet) => (
            <Button
              key={wallet.name}
              variant="outline"
              className="h-auto p-4 justify-start hover:bg-primary/10 hover:border-primary transition-all"
              onClick={() => handleWalletClick(wallet.name)}
            >
              <div className="flex items-start gap-4 w-full">
                <span className="text-3xl flex-shrink-0">{wallet.icon}</span>
                <div className="text-left flex-1">
                  <div className="font-semibold text-base mb-1">{wallet.name}</div>
                  <div className="text-xs text-muted-foreground">{wallet.description}</div>
                </div>
              </div>
            </Button>
          ))}
        </div>

        <div className="text-center text-xs text-muted-foreground border-t pt-4">
          By connecting a wallet, you agree to PerfectMoney's Terms of Service
        </div>
      </DialogContent>
    </Dialog>
  );
};
