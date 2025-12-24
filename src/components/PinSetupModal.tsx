import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface PinSetupModalProps {
  open: boolean;
  onComplete: () => void;
}

export const PinSetupModal = ({ open, onComplete }: PinSetupModalProps) => {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [step, setStep] = useState<"create" | "confirm">("create");
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const handleContinue = () => {
    if (step === "create") {
      if (pin.length < 4) {
        toast({
          title: "PIN too short",
          description: "Please enter at least 4 characters.",
          variant: "destructive",
        });
        return;
      }
      setStep("confirm");
    } else {
      if (pin === confirmPin) {
        localStorage.setItem("pm_wallet_pin", pin);
        localStorage.setItem("pm_pin_setup_complete", "true");
        toast({
          title: "PIN Created",
          description: "Your security PIN has been set successfully.",
        });
        onComplete();
      } else {
        toast({
          title: "PIN mismatch",
          description: "The PINs do not match. Please try again.",
          variant: "destructive",
        });
        setConfirmPin("");
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleContinue();
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-md bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f0f23] border border-red-900/30" 
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <img 
              src="/lovable-uploads/1f18ea95-c5fa-4f4f-89ce-8586de189248.png" 
              alt="Perfect Money" 
              className="h-14"
            />
          </div>
          <DialogTitle className="text-center text-white">
            {step === "create" ? "Create Security PIN" : "Confirm Your PIN"}
          </DialogTitle>
          <DialogDescription className="text-center text-gray-400">
            {step === "create" 
              ? "Set a PIN to secure your wallet. You'll need this to unlock after inactivity."
              : "Please re-enter your PIN to confirm."
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Lock className="h-5 w-5" />
            </div>
            <Input
              type={showPassword ? "text" : "password"}
              value={step === "create" ? pin : confirmPin}
              onChange={(e) => step === "create" ? setPin(e.target.value) : setConfirmPin(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={step === "create" ? "Enter new PIN" : "Confirm PIN"}
              className="pl-10 pr-10 h-12 text-lg bg-[#0a0e1a]/50 border-gray-700 text-white placeholder:text-gray-500"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          <Button 
            onClick={handleContinue}
            className="w-full h-12 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-medium"
          >
            {step === "create" ? "Continue" : "Set PIN"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
