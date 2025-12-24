import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Download, Smartphone } from "lucide-react";
import { toast } from "sonner";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAInstallPromptProps {
  walletConnected?: boolean;
}

export const PWAInstallPrompt = ({ walletConnected = false }: PWAInstallPromptProps) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [hasShownOnce, setHasShownOnce] = useState(false);

  useEffect(() => {
    // Check if already installed or dismissed
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    
    if (dismissed || isStandalone) {
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      (window as any).deferredPrompt = promptEvent;
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((error) => {
        console.log('Service Worker registration failed:', error);
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  // Auto-show popup when wallet is connected
  useEffect(() => {
    if (walletConnected && deferredPrompt && !hasShownOnce) {
      const dismissed = localStorage.getItem("pwa-install-dismissed");
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      
      if (!dismissed && !isStandalone) {
        setTimeout(() => {
          setShowPrompt(true);
          setHasShownOnce(true);
        }, 2000);
      }
    }
  }, [walletConnected, deferredPrompt, hasShownOnce]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      toast.info("Installation not available on this browser. Try using Chrome or Edge.");
      return;
    }

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      toast.success('Perfect Money App installed successfully!');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleClose = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-install-dismissed", "true");
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
      <Card className="relative w-full max-w-sm bg-card border-primary/30 shadow-2xl animate-scale-in overflow-hidden">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-muted transition-colors z-10"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-6 pb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-card shadow-lg border border-border">
              <img src="/pm-icon-512.png" alt="Perfect Money" className="w-14 h-14" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Install App</h2>
              <p className="text-sm text-muted-foreground">Perfect Money</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 pt-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            Install Perfect Money for quick access, offline support, and a native app experience.
          </p>

          <div className="space-y-2">
            <div className="flex items-center gap-3 text-sm">
              <div className="p-1.5 rounded-full bg-green-500/10">
                <Smartphone className="h-4 w-4 text-green-500" />
              </div>
              <span>Works offline</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="p-1.5 rounded-full bg-blue-500/10">
                <Download className="h-4 w-4 text-blue-500" />
              </div>
              <span>Fast loading</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Maybe Later
            </Button>
            <Button
              onClick={handleInstallClick}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              <Download className="h-4 w-4 mr-2" />
              Install
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};