import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Gift, Loader2, Send, CheckCircle, User } from "lucide-react";
import { toast } from "sonner";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId } from "wagmi";
import { voucherABI } from "@/contracts/voucherABI";
import { CONTRACT_ADDRESSES, ChainId } from "@/contracts/addresses";
import { bsc } from "wagmi/chains";

interface VoucherGiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  voucher: {
    id: string;
    code: string;
    name: string;
    value: string;
  };
  onSuccess: () => void;
}

export const VoucherGiftModal = ({ isOpen, onClose, voucher, onSuccess }: VoucherGiftModalProps) => {
  const { address } = useAccount();
  const chainId = useChainId();
  const [recipientAddress, setRecipientAddress] = useState("");
  const [message, setMessage] = useState("");
  
  const currentChainId = (chainId === 56 || chainId === 97 ? chainId : 56) as ChainId;
  const voucherAddress = CONTRACT_ADDRESSES[currentChainId]?.PMVoucher || "0x0000000000000000000000000000000000000000";

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const validateAddress = (addr: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(addr);
  };

  const handleGift = async () => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!recipientAddress || !validateAddress(recipientAddress)) {
      toast.error("Please enter a valid wallet address");
      return;
    }

    if (recipientAddress.toLowerCase() === address.toLowerCase()) {
      toast.error("Cannot gift voucher to yourself");
      return;
    }

    try {
      writeContract({
        address: voucherAddress as `0x${string}`,
        abi: voucherABI,
        functionName: "transferVoucher",
        args: [BigInt(voucher.id), recipientAddress as `0x${string}`],
        chain: bsc,
        account: address,
      });
    } catch (error) {
      console.error("Gift error:", error);
      toast.error("Failed to gift voucher");
    }
  };

  if (isSuccess) {
    toast.success(`Voucher gifted to ${recipientAddress.slice(0, 6)}...${recipientAddress.slice(-4)}!`);
    onSuccess();
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Gift Voucher
          </DialogTitle>
          <DialogDescription>
            Transfer this voucher to another user
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Voucher Info */}
          <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{voucher.name}</p>
                <p className="text-sm font-mono text-muted-foreground">{voucher.code}</p>
              </div>
              <p className="text-lg font-bold text-primary">{voucher.value}</p>
            </div>
          </div>

          {/* Recipient Address */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Recipient Wallet Address
            </Label>
            <Input
              placeholder="0x..."
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              className="font-mono"
            />
            {recipientAddress && !validateAddress(recipientAddress) && (
              <p className="text-xs text-destructive">Invalid wallet address</p>
            )}
          </div>

          {/* Personal Message */}
          <div className="space-y-2">
            <Label>Personal Message (optional)</Label>
            <Textarea
              placeholder="Add a personal message to your gift..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground text-right">{message.length}/200</p>
          </div>

          <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-sm text-yellow-600 dark:text-yellow-400">
            <strong>Note:</strong> Once gifted, this voucher will be transferred to the recipient and removed from your wallet.
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={isPending || isConfirming}>
              Cancel
            </Button>
            <Button 
              onClick={handleGift} 
              disabled={isPending || isConfirming || !validateAddress(recipientAddress)}
              className="flex-1"
            >
              {(isPending || isConfirming) ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gifting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Gift Voucher
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
