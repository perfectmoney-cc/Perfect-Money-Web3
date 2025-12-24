import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Book, Search, Plus, Trash2, Clock, Check, X, Download, Upload, QrCode } from "lucide-react";
import { useAddressBook, SavedAddress } from "@/hooks/useAddressBook";
import { toast } from "sonner";
import { validateRecipientAddress } from "@/utils/addressValidation";
import { Html5Qrcode } from "html5-qrcode";

interface AddressBookModalProps {
  open: boolean;
  onClose: () => void;
  onSelectAddress: (address: string) => void;
}

export const AddressBookModal = ({ open, onClose, onSelectAddress }: AddressBookModalProps) => {
  const { addresses, addAddress, removeAddress, getRecentAddresses, searchAddresses } = useAddressBook();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredAddresses = searchQuery ? searchAddresses(searchQuery) : addresses;
  const recentAddresses = getRecentAddresses(3);

  const handleAddAddress = () => {
    if (!newAddress || !newLabel) {
      toast.error("Please fill in all fields");
      return;
    }

    const validation = validateRecipientAddress(newAddress);
    if (!validation.isValid) {
      toast.error(validation.error || "Invalid address");
      return;
    }

    addAddress(newAddress, newLabel);
    setNewAddress("");
    setNewLabel("");
    setShowAddForm(false);
    toast.success("Address saved to address book");
  };

  const handleSelectAddress = (addr: SavedAddress) => {
    onSelectAddress(addr.address);
    onClose();
  };

  const handleRemoveAddress = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeAddress(id);
    toast.success("Address removed");
  };

  // Export addresses to JSON file
  const handleExport = () => {
    if (addresses.length === 0) {
      toast.error("No addresses to export");
      return;
    }
    const exportData = JSON.stringify(addresses, null, 2);
    const blob = new Blob([exportData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pm-address-book-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${addresses.length} addresses`);
  };

  // Import addresses from JSON file
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        if (!Array.isArray(importedData)) {
          toast.error("Invalid file format");
          return;
        }
        let importedCount = 0;
        importedData.forEach((item: any) => {
          if (item.address && item.label) {
            const validation = validateRecipientAddress(item.address);
            if (validation.isValid) {
              addAddress(item.address, item.label, item.network);
              importedCount++;
            }
          }
        });
        toast.success(`Imported ${importedCount} addresses`);
      } catch (error) {
        toast.error("Failed to parse import file");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  // QR Code Scanner
  const startScanner = async () => {
    setIsScanning(true);
    try {
      scannerRef.current = new Html5Qrcode("qr-reader");
      await scannerRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          // Check if it's a valid address
          const address = decodedText.startsWith("ethereum:") 
            ? decodedText.replace("ethereum:", "").split("@")[0]
            : decodedText;
          
          const validation = validateRecipientAddress(address);
          if (validation.isValid) {
            setNewAddress(address);
            setShowAddForm(true);
            stopScanner();
            toast.success("Address scanned successfully");
          } else {
            toast.error("Invalid address in QR code");
          }
        },
        () => {}
      );
    } catch (error) {
      toast.error("Failed to start camera");
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
      } catch (error) {
        console.error("Error stopping scanner:", error);
      }
    }
    setIsScanning(false);
  };

  return (
    <Dialog open={open} onOpenChange={() => { stopScanner(); onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Book className="h-5 w-5 text-primary" />
            Address Book
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Export/Import Buttons */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExport} className="flex-1">
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="flex-1">
              <Upload className="h-4 w-4 mr-1" />
              Import
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search addresses or labels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* QR Scanner */}
          {isScanning && (
            <div className="space-y-2">
              <div id="qr-reader" className="w-full rounded-lg overflow-hidden" />
              <Button variant="outline" onClick={stopScanner} className="w-full">
                <X className="h-4 w-4 mr-2" />
                Stop Scanning
              </Button>
            </div>
          )}

          {/* Add New Address Form */}
          {showAddForm ? (
            <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-3">
              <div className="flex items-center justify-between">
                <Label className="font-medium">Add New Address</Label>
                <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Input
                placeholder="Label (e.g., My Exchange)"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
              />
              <Input
                placeholder="Address (0x... or ENS.eth)"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
              />
              <Button onClick={handleAddAddress} className="w-full" size="sm">
                <Check className="h-4 w-4 mr-2" />
                Save Address
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowAddForm(true)} className="flex-1">
                <Plus className="h-4 w-4 mr-2" />
                Add New
              </Button>
              <Button variant="outline" onClick={startScanner} disabled={isScanning} className="flex-1">
                <QrCode className="h-4 w-4 mr-2" />
                Scan QR
              </Button>
            </div>
          )}

          {/* Recent Addresses */}
          {!searchQuery && recentAddresses.length > 0 && (
            <div>
              <Label className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                <Clock className="h-3 w-3" />
                Recently Used
              </Label>
              <div className="space-y-2">
                {recentAddresses.map((addr) => (
                  <div
                    key={addr.id}
                    onClick={() => handleSelectAddress(addr)}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-primary/10 cursor-pointer border border-transparent hover:border-primary/30 transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{addr.label}</p>
                      <p className="text-xs text-muted-foreground font-mono truncate">{addr.address}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Addresses */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">
              {searchQuery ? `Results (${filteredAddresses.length})` : `All Addresses (${addresses.length})`}
            </Label>
            <ScrollArea className="h-[200px]">
              {filteredAddresses.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Book className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    {searchQuery ? "No addresses found" : "No saved addresses yet"}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredAddresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => handleSelectAddress(addr)}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-primary/10 cursor-pointer border border-transparent hover:border-primary/30 transition-all group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{addr.label}</p>
                        <p className="text-xs text-muted-foreground font-mono truncate">{addr.address}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleRemoveAddress(addr.id, e)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};