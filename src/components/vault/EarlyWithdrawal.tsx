import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface EarlyWithdrawalProps {
  isOpen: boolean;
  onClose: () => void;
  stake: {
    amount: number;
    token: string;
    planName: string;
    endTime: number;
    pendingProfit: number;
  };
  onConfirm: () => void;
}

const EARLY_WITHDRAWAL_FEE = 20; // 20% penalty

export const EarlyWithdrawalModal = ({ isOpen, onClose, stake, onConfirm }: EarlyWithdrawalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const calculatePenalty = () => {
    return stake.amount * (EARLY_WITHDRAWAL_FEE / 100);
  };

  const calculateNetAmount = () => {
    return stake.amount - calculatePenalty();
  };

  const getDaysRemaining = () => {
    const now = Date.now() / 1000;
    const remaining = stake.endTime - now;
    return Math.max(0, Math.ceil(remaining / (24 * 60 * 60)));
  };

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(`Emergency withdrawal completed! Received ${calculateNetAmount().toFixed(2)} ${stake.token}`);
      onConfirm();
      onClose();
    } catch (error) {
      toast.error("Withdrawal failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Emergency Early Withdrawal
          </DialogTitle>
          <DialogDescription>
            This action will incur a {EARLY_WITHDRAWAL_FEE}% penalty fee
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
            <div className="flex items-center gap-2 mb-3">
              <Lock className="h-4 w-4 text-destructive" />
              <span className="font-semibold text-destructive">Lock Period Not Complete</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your stake in the <Badge variant="outline">{stake.planName}</Badge> pool has{" "}
              <strong>{getDaysRemaining()} days</strong> remaining in the lock period.
            </p>
          </div>

          <div className="space-y-3 p-4 rounded-lg bg-muted/30">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Staked Amount</span>
              <span className="font-semibold">{stake.amount.toFixed(2)} {stake.token}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Pending Profit</span>
              <span className="font-semibold text-yellow-500">
                {stake.pendingProfit.toFixed(4)} {stake.token}
              </span>
            </div>
            <div className="flex justify-between text-sm text-destructive">
              <span>Early Withdrawal Penalty ({EARLY_WITHDRAWAL_FEE}%)</span>
              <span className="font-semibold">-{calculatePenalty().toFixed(2)} {stake.token}</span>
            </div>
            <div className="border-t border-border pt-3 flex justify-between">
              <span className="font-semibold">You Will Receive</span>
              <span className="font-bold text-lg">{calculateNetAmount().toFixed(2)} {stake.token}</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-sm text-yellow-600 dark:text-yellow-400">
            <strong>Warning:</strong> Pending profits will be forfeited and you will lose{" "}
            {calculatePenalty().toFixed(2)} {stake.token} from your capital.
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              `Withdraw ${calculateNetAmount().toFixed(2)} ${stake.token}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
