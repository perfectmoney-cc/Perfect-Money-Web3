import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Cake, Calendar, Users, Star, PartyPopper, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface VoucherTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  defaultValue: number;
  type: "discount" | "gift" | "reward";
  expiryDays: number;
  gradient: string;
  popular?: boolean;
}

const TEMPLATES: VoucherTemplate[] = [
  {
    id: "birthday",
    name: "Birthday Gift",
    description: "Celebrate with a special birthday bonus",
    icon: <Cake className="h-6 w-6" />,
    defaultValue: 50,
    type: "gift",
    expiryDays: 30,
    gradient: "from-pink-500/20 to-purple-500/20",
    popular: true,
  },
  {
    id: "holiday",
    name: "Holiday Special",
    description: "Festive season promotion voucher",
    icon: <PartyPopper className="h-6 w-6" />,
    defaultValue: 20,
    type: "discount",
    expiryDays: 14,
    gradient: "from-red-500/20 to-green-500/20",
  },
  {
    id: "referral",
    name: "Referral Reward",
    description: "Thank you for referring a friend",
    icon: <Users className="h-6 w-6" />,
    defaultValue: 100,
    type: "reward",
    expiryDays: 60,
    gradient: "from-blue-500/20 to-cyan-500/20",
    popular: true,
  },
  {
    id: "welcome",
    name: "Welcome Bonus",
    description: "New user onboarding gift",
    icon: <Sparkles className="h-6 w-6" />,
    defaultValue: 25,
    type: "gift",
    expiryDays: 7,
    gradient: "from-yellow-500/20 to-orange-500/20",
  },
  {
    id: "loyalty",
    name: "Loyalty Reward",
    description: "Reward for loyal customers",
    icon: <Star className="h-6 w-6" />,
    defaultValue: 75,
    type: "reward",
    expiryDays: 90,
    gradient: "from-amber-500/20 to-yellow-500/20",
  },
  {
    id: "event",
    name: "Special Event",
    description: "Limited time event voucher",
    icon: <Calendar className="h-6 w-6" />,
    defaultValue: 15,
    type: "discount",
    expiryDays: 3,
    gradient: "from-violet-500/20 to-indigo-500/20",
  },
];

interface VoucherTemplatesProps {
  onSelectTemplate: (template: VoucherTemplate) => void;
}

export const VoucherTemplates = ({ onSelectTemplate }: VoucherTemplatesProps) => {
  const getTypeBadge = (type: string) => {
    switch (type) {
      case "discount":
        return <Badge className="bg-blue-500/20 text-blue-500 text-xs">Discount</Badge>;
      case "gift":
        return <Badge className="bg-purple-500/20 text-purple-500 text-xs">Gift</Badge>;
      case "reward":
        return <Badge className="bg-green-500/20 text-green-500 text-xs">Reward</Badge>;
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold flex items-center gap-2">
          <Gift className="h-5 w-5 text-primary" />
          Voucher Templates
        </h3>
        <p className="text-sm text-muted-foreground">Quick-start with pre-configured templates</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {TEMPLATES.map((template) => (
          <div
            key={template.id}
            className={`relative p-4 rounded-lg bg-gradient-to-br ${template.gradient} border border-border hover:border-primary/50 transition-all cursor-pointer group`}
            onClick={() => {
              onSelectTemplate(template);
              toast.success(`${template.name} template selected`);
            }}
          >
            {template.popular && (
              <Badge className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs">
                Popular
              </Badge>
            )}
            
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-background/50 text-primary">
                {template.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">{template.name}</h4>
                <p className="text-xs text-muted-foreground mb-2">{template.description}</p>
                <div className="flex items-center gap-2">
                  {getTypeBadge(template.type)}
                  <span className="text-xs text-muted-foreground">
                    {template.type === "discount" 
                      ? `${template.defaultValue}% off` 
                      : `${template.defaultValue} PM`}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Valid for {template.expiryDays} days
              </span>
              <Button size="sm" variant="ghost" className="h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                Use Template
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export type { VoucherTemplate };
