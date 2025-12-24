import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Ticket, Loader2, Download, FileText, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useAccount } from "wagmi";

interface BulkVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface GeneratedVoucher {
  code: string;
  value: number;
  type: string;
  expiryDate: string;
}

const VOUCHER_TYPES = [
  { value: "0", label: "Discount (%)" },
  { value: "1", label: "Gift (PM)" },
  { value: "2", label: "Reward (PM)" },
];

export const BulkVoucherModal = ({ isOpen, onClose, onSuccess }: BulkVoucherModalProps) => {
  const { address } = useAccount();
  const [quantity, setQuantity] = useState("10");
  const [prefix, setPrefix] = useState("PM-BULK-");
  const [value, setValue] = useState("100");
  const [voucherType, setVoucherType] = useState("1");
  const [expiryDays, setExpiryDays] = useState("30");
  const [isTransferable, setIsTransferable] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVouchers, setGeneratedVouchers] = useState<GeneratedVoucher[]>([]);

  const generateRandomCode = (prefix: string) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = prefix;
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleGenerate = async () => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    const qty = parseInt(quantity);
    if (qty < 1 || qty > 100) {
      toast.error("Quantity must be between 1 and 100");
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simulate voucher generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const vouchers: GeneratedVoucher[] = [];
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + parseInt(expiryDays));
      
      for (let i = 0; i < qty; i++) {
        vouchers.push({
          code: generateRandomCode(prefix),
          value: parseFloat(value),
          type: VOUCHER_TYPES.find(t => t.value === voucherType)?.label || "Gift",
          expiryDate: expiryDate.toISOString().split('T')[0],
        });
      }
      
      setGeneratedVouchers(vouchers);
      toast.success(`Generated ${qty} vouchers successfully!`);
    } catch (error) {
      toast.error("Failed to generate vouchers");
    } finally {
      setIsGenerating(false);
    }
  };

  const exportToCSV = () => {
    if (generatedVouchers.length === 0) {
      toast.error("No vouchers to export");
      return;
    }

    const headers = ["Code", "Value", "Type", "Expiry Date"];
    const rows = generatedVouchers.map(v => [v.code, v.value, v.type, v.expiryDate]);
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pm-vouchers-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("CSV exported successfully!");
  };

  const handleClose = () => {
    setGeneratedVouchers([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Bulk Voucher Creation
          </DialogTitle>
          <DialogDescription>
            Generate multiple vouchers at once with custom settings
          </DialogDescription>
        </DialogHeader>

        {generatedVouchers.length === 0 ? (
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantity (max 100)</Label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Code Prefix</Label>
                <Input
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value.toUpperCase())}
                  maxLength={10}
                />
              </div>
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
              <Label>Value per Voucher {voucherType === "0" ? "(%)" : "(PM)"}</Label>
              <Input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label>Expires In</Label>
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
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label>Transferable</Label>
              <Switch checked={isTransferable} onCheckedChange={setIsTransferable} />
            </div>

            <div className="p-3 rounded-lg bg-muted/50 text-sm">
              <p className="text-muted-foreground">
                Estimated cost: <strong>{parseInt(quantity) * parseFloat(value)} PM</strong> (for gift/reward types)
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating}
                className="flex-1"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Ticket className="h-4 w-4 mr-2" />
                    Generate {quantity} Vouchers
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-2 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="font-semibold text-green-600 dark:text-green-400">
                {generatedVouchers.length} vouchers generated successfully!
              </span>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2">
              {generatedVouchers.slice(0, 10).map((voucher, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <span className="font-mono text-sm">{voucher.code}</span>
                  <span className="text-sm text-muted-foreground">{voucher.value} {voucher.type}</span>
                </div>
              ))}
              {generatedVouchers.length > 10 && (
                <p className="text-center text-sm text-muted-foreground">
                  ... and {generatedVouchers.length - 10} more
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Close
              </Button>
              <Button onClick={exportToCSV} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Export to CSV
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
