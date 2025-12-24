import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  GripVertical, 
  LayoutGrid, 
  Save, 
  RotateCcw,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  BarChart3,
  CreditCard,
  Link as LinkIcon,
  Activity,
  Ticket,
  Zap
} from "lucide-react";

interface WidgetConfig {
  id: string;
  name: string;
  enabled: boolean;
  order: number;
}

// Icon mapping - icons cannot be stored in localStorage
const widgetIcons: Record<string, React.ElementType> = {
  revenue: CreditCard,
  transactions: Activity,
  links: LinkIcon,
  chart: BarChart3,
  integration: Zap,
  voucher: Ticket,
};

const defaultWidgets: WidgetConfig[] = [
  { id: "revenue", name: "Total Revenue", enabled: true, order: 0 },
  { id: "transactions", name: "Transactions", enabled: true, order: 1 },
  { id: "links", name: "Active Links", enabled: true, order: 2 },
  { id: "chart", name: "Revenue Chart", enabled: true, order: 3 },
  { id: "integration", name: "Payment Integration", enabled: true, order: 4 },
  { id: "voucher", name: "Voucher Management", enabled: true, order: 5 },
];

interface DashboardCustomizerProps {
  onSave?: (config: WidgetConfig[]) => void;
}

export const DashboardCustomizer = ({ onSave }: DashboardCustomizerProps) => {
  const [widgets, setWidgets] = useState<WidgetConfig[]>(() => {
    const saved = localStorage.getItem("merchantDashboardLayout");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return defaultWidgets;
      }
    }
    return defaultWidgets;
  });
  const [hasChanges, setHasChanges] = useState(false);

  const toggleWidget = (id: string) => {
    setWidgets(prev => 
      prev.map(w => w.id === id ? { ...w, enabled: !w.enabled } : w)
    );
    setHasChanges(true);
  };

  const moveWidget = (id: string, direction: "up" | "down") => {
    setWidgets(prev => {
      const sorted = [...prev].sort((a, b) => a.order - b.order);
      const index = sorted.findIndex(w => w.id === id);
      
      if (direction === "up" && index > 0) {
        const temp = sorted[index].order;
        sorted[index].order = sorted[index - 1].order;
        sorted[index - 1].order = temp;
      } else if (direction === "down" && index < sorted.length - 1) {
        const temp = sorted[index].order;
        sorted[index].order = sorted[index + 1].order;
        sorted[index + 1].order = temp;
      }
      
      return sorted;
    });
    setHasChanges(true);
  };

  const saveLayout = () => {
    localStorage.setItem("merchantDashboardLayout", JSON.stringify(widgets));
    setHasChanges(false);
    onSave?.(widgets);
    toast.success("Dashboard layout saved");
  };

  const resetLayout = () => {
    setWidgets(defaultWidgets);
    localStorage.removeItem("merchantDashboardLayout");
    setHasChanges(false);
    toast.info("Dashboard layout reset to default");
  };

  const sortedWidgets = [...widgets].sort((a, b) => a.order - b.order);
  const enabledCount = widgets.filter(w => w.enabled).length;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <LayoutGrid className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Dashboard Layout</CardTitle>
              <CardDescription>Customize your merchant dashboard widgets</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="bg-background">
            {enabledCount}/{widgets.length} Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {sortedWidgets.map((widget, index) => {
            const Icon = widgetIcons[widget.id] || LayoutGrid;
            return (
              <div
                key={widget.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                  widget.enabled 
                    ? "bg-card border-border" 
                    : "bg-muted/30 border-border/50 opacity-60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                  <div className={`p-2 rounded-lg ${widget.enabled ? "bg-primary/20" : "bg-muted"}`}>
                    <Icon className={`h-4 w-4 ${widget.enabled ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <span className={`font-medium text-sm ${!widget.enabled && "text-muted-foreground"}`}>
                    {widget.name}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex flex-col">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={() => moveWidget(widget.id, "up")}
                      disabled={index === 0}
                    >
                      <ChevronUp className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={() => moveWidget(widget.id, "down")}
                      disabled={index === sortedWidgets.length - 1}
                    >
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`toggle-${widget.id}`} className="sr-only">
                      {widget.enabled ? "Hide" : "Show"} {widget.name}
                    </Label>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => toggleWidget(widget.id)}
                    >
                      {widget.enabled ? (
                        <Eye className="h-4 w-4 text-green-500" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-2 pt-2">
          <Button 
            onClick={saveLayout} 
            disabled={!hasChanges}
            className="flex-1"
            variant="gradient"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Layout
          </Button>
          <Button 
            variant="outline" 
            onClick={resetLayout}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
