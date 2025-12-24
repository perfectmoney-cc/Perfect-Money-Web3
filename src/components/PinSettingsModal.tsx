import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Eye, EyeOff, Lock, Shield } from "lucide-react";
import { toast } from "sonner";

interface PinSettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export const PinSettingsModal = ({ open, onClose }: PinSettingsModalProps) => {
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(
    localStorage.getItem("pm_remember_device") === "true"
  );

  const handleChangePin = () => {
    const storedPin = localStorage.getItem("pm_wallet_pin");
    
    if (currentPin !== storedPin) {
      toast.error("Current PIN is incorrect");
      return;
    }
    
    if (newPin.length < 4) {
      toast.error("New PIN must be at least 4 digits");
      return;
    }
    
    if (newPin !== confirmPin) {
      toast.error("New PINs do not match");
      return;
    }
    
    localStorage.setItem("pm_wallet_pin", newPin);
    toast.success("PIN changed successfully");
    setCurrentPin("");
    setNewPin("");
    setConfirmPin("");
    onClose();
  };

  const handleRememberDeviceChange = (checked: boolean) => {
    setRememberDevice(checked);
    localStorage.setItem("pm_remember_device", checked.toString());
    
    if (checked) {
      toast.success("Device remembered - Extended timeout to 30 minutes");
    } else {
      toast.info("Device forgotten - Timeout reset to 2 minutes");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-background via-background to-primary/10 border-primary/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Security Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Remember Device Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
            <div className="space-y-1">
              <Label className="font-medium">Remember This Device</Label>
              <p className="text-xs text-muted-foreground">
                Extends inactivity timeout to 30 minutes
              </p>
            </div>
            <Switch
              checked={rememberDevice}
              onCheckedChange={handleRememberDeviceChange}
            />
          </div>

          {/* Change PIN Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              <Label className="font-medium">Change PIN</Label>
            </div>

            <div className="space-y-3">
              <div className="relative">
                <Input
                  type={showCurrentPin ? "text" : "password"}
                  placeholder="Current PIN"
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value)}
                  maxLength={6}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPin(!showCurrentPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCurrentPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="relative">
                <Input
                  type={showNewPin ? "text" : "password"}
                  placeholder="New PIN (min 4 digits)"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  maxLength={6}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPin(!showNewPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="relative">
                <Input
                  type={showConfirmPin ? "text" : "password"}
                  placeholder="Confirm New PIN"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  maxLength={6}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPin(!showConfirmPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <Button
                variant="gradient"
                className="w-full"
                onClick={handleChangePin}
                disabled={!currentPin || !newPin || !confirmPin}
              >
                <Lock className="h-4 w-4 mr-2" />
                Update PIN
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
