import { useState, useEffect } from "react";
import { Lock, Eye, EyeOff, Fingerprint, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useDisconnect } from "wagmi";
interface PinLockScreenProps {
  onUnlock: () => void;
}
export const PinLockScreen = ({
  onUnlock
}: PinLockScreenProps) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const {
    toast
  } = useToast();
  const {
    disconnect
  } = useDisconnect();

  // Check for biometric availability
  useEffect(() => {
    const checkBiometric = async () => {
      if (window.PublicKeyCredential) {
        try {
          const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          setBiometricAvailable(available);
        } catch {
          setBiometricAvailable(false);
        }
      }
    };
    checkBiometric();
  }, []);
  const handleUnlock = () => {
    const storedPin = localStorage.getItem("pm_wallet_pin");
    if (pin === storedPin) {
      setError(false);
      onUnlock();
      toast({
        title: "Unlocked",
        description: "Welcome back!"
      });
    } else {
      setError(true);
      setPin("");
      toast({
        title: "Invalid PIN",
        description: "Please enter the correct PIN to unlock.",
        variant: "destructive"
      });
    }
  };
  const handleBiometricAuth = async () => {
    try {
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(32),
          timeout: 60000,
          userVerification: "required",
          rpId: window.location.hostname
        }
      });
      if (credential) {
        onUnlock();
        toast({
          title: "Unlocked",
          description: "Biometric authentication successful!"
        });
      }
    } catch (err) {
      toast({
        title: "Biometric Failed",
        description: "Please use your PIN instead.",
        variant: "destructive"
      });
    }
  };
  const handleForgotPin = () => {
    localStorage.removeItem("pm_wallet_pin");
    localStorage.removeItem("pm_pin_setup_complete");
    localStorage.removeItem("pm_wallet_locked");
    disconnect();
    toast({
      title: "PIN Reset",
      description: "Wallet disconnected. Please reconnect to set a new PIN."
    });
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleUnlock();
    }
  };
  return <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-[#0a0e1a] via-[#1a0a0a] to-[#0a1020] backdrop-blur-sm">
      <div className="bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f0f23] rounded-lg shadow-xl p-8 w-full max-w-sm mx-4 border border-red-900/30">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src="/lovable-uploads/1f18ea95-c5fa-4f4f-89ce-8586de189248.png" alt="Perfect Money" className="h-16" />
        </div>
        
        {/* Title */}
        <p className="text-center text-gray-300 mb-6 font-medium">
          Enter your password to unlock
        </p>

        {/* PIN Input */}
        <div className="relative mb-4">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Lock className="h-5 w-5" />
          </div>
          <Input type={showPassword ? "text" : "password"} value={pin} onChange={e => setPin(e.target.value)} onKeyPress={handleKeyPress} placeholder="Enter your PIN" className={`pl-10 pr-10 h-12 text-lg bg-[#0a0e1a]/50 border-gray-700 text-white placeholder:text-gray-500 ${error ? "border-red-500" : ""}`} autoFocus />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300">
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>

        {/* Unlock Button */}
        <Button onClick={handleUnlock} className="w-full h-12 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-medium">
          <Lock className="h-4 w-4 mr-2" />
          Unlock
        </Button>

        {/* Biometric Button */}
        {biometricAvailable}

        {/* Forgot PIN */}
        <button onClick={handleForgotPin} className="w-full mt-4 text-sm text-gray-400 hover:text-red-400 flex items-center justify-center gap-2 transition-colors">
          <LogOut className="h-4 w-4" />
          Forgot PIN? Disconnect Wallet
        </button>
      </div>
    </div>;
};