import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
interface PromoBannerSettingsProps {
  onSave: (settings: {
    text: string;
    endDate: string;
    bonusPercentage: number;
  }) => void;
}
export const PromoBannerSettings = ({
  onSave
}: PromoBannerSettingsProps) => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("Special Offer: Buy PM Token & Get 20% Bonus!");
  const [endDate, setEndDate] = useState("");
  const [bonusPercentage, setBonusPercentage] = useState(20);
  const handleSave = () => {
    if (!endDate) {
      toast.error("Please select an end date");
      return;
    }
    onSave({
      text,
      endDate,
      bonusPercentage
    });
    toast.success("Promo banner settings saved!");
    setOpen(false);
  };
  return <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Promo Banner Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="promo-text">Banner Text</Label>
            <Input id="promo-text" value={text} onChange={e => setText(e.target.value)} placeholder="Enter banner text" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="end-date">Countdown End Date</Label>
            <Input id="end-date" type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bonus">Bonus Percentage</Label>
            <Input id="bonus" type="number" min="0" max="100" value={bonusPercentage} onChange={e => setBonusPercentage(Number(e.target.value))} placeholder="Enter bonus percentage" />
          </div>

          <Button onClick={handleSave} className="w-full">
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>;
};