import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Ticket, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, useChainId } from "wagmi";
import { parseEther } from "viem";
import { voucherABI } from "@/contracts/voucherABI";
import { CONTRACT_ADDRESSES, ChainId } from "@/contracts/addresses";
import { erc20Abi } from "viem";
import { bsc } from "wagmi/chains";

interface CreateVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const VOUCHER_TYPES = [
  { value: "0", label: "Discount (%)", description: "Percentage discount" },
  { value: "1", label: "Gift (PM)", description: "Fixed PM token amount" },
  { value: "2", label: "Reward (PM)", description: "Reward PM tokens" },
];

export const CreateVoucherModal = ({ isOpen, onClose, onSuccess }: CreateVoucherModalProps) => {
  const { address } = useAccount();
  const chainId = useChainId();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [voucherType, setVoucherType] = useState("1");
  const [expiryDays, setExpiryDays] = useState("30");
  const [isTransferable, setIsTransferable] = useState(true);
  const [isApproving, setIsApproving] = useState(false);

  const currentChainId = (chainId === 56 || chainId === 97 ? chainId : 56) as ChainId;
  const voucherAddress = CONTRACT_ADDRESSES[currentChainId]?.PMVoucher || "0x0000000000000000000000000000000000000000";
  const pmTokenAddress = CONTRACT_ADDRESSES[currentChainId]?.PMToken;

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { writeContract: approveWrite, data: approveTxHash } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const { isLoading: isApproveConfirming } = useWaitForTransactionReceipt({
    hash: approveTxHash,
  });

  const { data: creationFee } = useReadContract({
    address: voucherAddress as `0x${string}`,
    abi: voucherABI,
    functionName: "merchantCreationFee",
  });

  const { data: allowance } = useReadContract({
    address: pmTokenAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: "allowance",
    args: address ? [address, voucherAddress as `0x${string}`] : undefined,
  });

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "PM-";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCode(result);
  };

  const handleCreate = async () => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }
    if (!code.trim() || !name.trim() || !value) {
      toast.error("Please fill all fields");
      return;
    }

    const valueNum = parseFloat(value);
    if (voucherType === "0" && valueNum > 100) {
      toast.error("Discount cannot exceed 100%");
      return;
    }

    try {
      const expiryTimestamp = BigInt(Math.floor(Date.now() / 1000) + parseInt(expiryDays) * 24 * 60 * 60);
      
      // Calculate required approval: creation fee + value (for gift/reward types)
      let requiredApproval = creationFee || BigInt(0);
      if (voucherType !== "0") {
        requiredApproval += parseEther(value);
      }

      // Check if approval is needed
      if (allowance !== undefined && allowance < requiredApproval) {
        setIsApproving(true);
        toast.info("Approving PM tokens...");
        
        approveWrite({
          address: pmTokenAddress as `0x${string}`,
          abi: erc20Abi,
          functionName: "approve",
          args: [voucherAddress as `0x${string}`, requiredApproval * BigInt(2)],
          chain: bsc,
          account: address,
        });
        
        return;
      }

      // Value in wei for GIFT/REWARD, or percentage * 100 for DISCOUNT
      const voucherValue = voucherType === "0" 
        ? BigInt(Math.floor(valueNum * 100))
        : parseEther(value);

      writeContract({
        address: voucherAddress as `0x${string}`,
        abi: voucherABI,
        functionName: "createVoucher",
        args: [code, name, voucherValue, parseInt(voucherType), expiryTimestamp, isTransferable],
        chain: bsc,
        account: address,
      });
    } catch (error) {
      console.error("Create voucher error:", error);
      toast.error("Failed to create voucher");
    }
  };

  // Handle approval confirmation
  if (isApproveConfirming && isApproving) {
    // Wait for approval then create
  }

  if (isSuccess) {
    toast.success("Voucher created successfully!");
    onSuccess();
    onClose();
    setCode("");
    setName("");
    setValue("");
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-primary" />
            Create New Voucher
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Voucher Code</Label>
            <div className="flex gap-2">
              <Input
                placeholder="PM-XXXXXXXX"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={32}
              />
              <Button variant="outline" onClick={generateCode} type="button">
                Generate
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Voucher Name</Label>
            <Input
              placeholder="e.g., Welcome Bonus"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Voucher Type</Label>
            <Select value={voucherType} onValueChange={setVoucherType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VOUCHER_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>
              Value {voucherType === "0" ? "(% Discount)" : "(PM Tokens)"}
            </Label>
            <Input
              type="number"
              placeholder={voucherType === "0" ? "e.g., 10" : "e.g., 100"}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              min="0"
              max={voucherType === "0" ? "100" : undefined}
            />
          </div>

          <div className="space-y-2">
            <Label>Expires In (Days)</Label>
            <Select value={expiryDays} onValueChange={setExpiryDays}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 Days</SelectItem>
                <SelectItem value="14">14 Days</SelectItem>
                <SelectItem value="30">30 Days</SelectItem>
                <SelectItem value="60">60 Days</SelectItem>
                <SelectItem value="90">90 Days</SelectItem>
                <SelectItem value="180">180 Days</SelectItem>
                <SelectItem value="365">1 Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label>Transferable</Label>
            <Switch checked={isTransferable} onCheckedChange={setIsTransferable} />
          </div>

          {creationFee && (
            <p className="text-xs text-muted-foreground">
              Creation fee: {(Number(creationFee) / 10**18).toFixed(2)} PM
            </p>
          )}

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleCreate} 
              disabled={isPending || isConfirming || isApproving}
              className="flex-1"
            >
              {(isPending || isConfirming || isApproving) ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isApproving ? "Approving..." : "Creating..."}
                </>
              ) : (
                "Create Voucher"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
