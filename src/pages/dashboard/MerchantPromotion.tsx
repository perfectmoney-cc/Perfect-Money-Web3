import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Megaphone, Plus, Clock, Percent, Zap, Calendar, Trash2, Edit, Home } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const promotions = [
  { id: 1, name: "Weekend Flash Sale", discount: 20, type: "percentage", status: "active", endDate: "2024-12-15" },
  { id: 2, name: "First Purchase Bonus", discount: 500, type: "fixed", status: "active", endDate: "2024-12-31" },
  { id: 3, name: "Holiday Special", discount: 15, type: "percentage", status: "scheduled", endDate: "2024-12-25" },
];

const MerchantPromotion = () => {
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [promoName, setPromoName] = useState("");
  const [promoDiscount, setPromoDiscount] = useState("");
  const [promoType, setPromoType] = useState<"percentage" | "fixed">("percentage");
  const [promoDescription, setPromoDescription] = useState("");

  const createPromotion = () => {
    if (!promoName || !promoDiscount) {
      toast.error("Please fill in all required fields");
      return;
    }
    toast.success(`Promotion "${promoName}" created successfully!`);
    setPromoName("");
    setPromoDiscount("");
    setPromoDescription("");
    setShowCreate(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/dashboard" className="flex items-center gap-1">
                <Home className="h-3.5 w-3.5" />
                Dashboard
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/dashboard/merchant">Merchant</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Promotion Tools</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 rounded-xl bg-primary/10">
          <Megaphone className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Promotion Tools</h1>
          <p className="text-muted-foreground">Create flash sales and limited-time offers easily</p>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <Zap className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
              <p className="text-2xl font-bold">3</p>
              <p className="text-sm text-muted-foreground">Active Promotions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Percent className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold">2,450 PM</p>
              <p className="text-sm text-muted-foreground">Discount Given</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <p className="text-2xl font-bold">156</p>
              <p className="text-sm text-muted-foreground">Promo Uses</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Your Promotions</CardTitle>
                <CardDescription>Manage your active and scheduled promotions</CardDescription>
              </div>
              <Button onClick={() => setShowCreate(!showCreate)}>
                <Plus className="h-4 w-4 mr-2" /> Create Promotion
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {showCreate && (
              <div className="p-4 border rounded-lg bg-muted/50 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Promotion Name</Label>
                    <Input
                      placeholder="e.g., Summer Sale"
                      value={promoName}
                      onChange={(e) => setPromoName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Discount Value</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="20"
                        value={promoDiscount}
                        onChange={(e) => setPromoDiscount(e.target.value)}
                        className="flex-1"
                      />
                      <div className="flex border rounded-md">
                        <Button
                          type="button"
                          variant={promoType === "percentage" ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setPromoType("percentage")}
                          className="rounded-r-none"
                        >
                          %
                        </Button>
                        <Button
                          type="button"
                          variant={promoType === "fixed" ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setPromoType("fixed")}
                          className="rounded-l-none"
                        >
                          PM
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description (Optional)</Label>
                  <Textarea
                    placeholder="Describe your promotion..."
                    value={promoDescription}
                    onChange={(e) => setPromoDescription(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={createPromotion}>Create Promotion</Button>
                  <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                </div>
              </div>
            )}

            {promotions.map((promo) => (
              <div key={promo.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{promo.name}</span>
                    <Badge variant={promo.status === "active" ? "default" : "secondary"}>
                      {promo.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {promo.type === "percentage" ? `${promo.discount}% off` : `${promo.discount} PM off`} • Ends {promo.endDate}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch defaultChecked={promo.status === "active"} />
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" /> Quick Templates
            </CardTitle>
            <CardDescription>Start with a pre-made promotion template</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" onClick={() => {
              setPromoName("Flash Sale");
              setPromoDiscount("30");
              setPromoType("percentage");
              setShowCreate(true);
              toast.info("Flash Sale template loaded");
            }}>
              <Zap className="h-6 w-6 text-yellow-500" />
              <span>Flash Sale</span>
              <span className="text-xs text-muted-foreground">30% off for 24 hours</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" onClick={() => {
              setPromoName("New Customer Discount");
              setPromoDiscount("500");
              setPromoType("fixed");
              setShowCreate(true);
              toast.info("New Customer template loaded");
            }}>
              <Plus className="h-6 w-6 text-green-500" />
              <span>New Customer</span>
              <span className="text-xs text-muted-foreground">500 PM off first purchase</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" onClick={() => {
              setPromoName("Weekend Special");
              setPromoDiscount("15");
              setPromoType("percentage");
              setShowCreate(true);
              toast.info("Weekend Special template loaded");
            }}>
              <Clock className="h-6 w-6 text-blue-500" />
              <span>Weekend Special</span>
              <span className="text-xs text-muted-foreground">15% off Sat-Sun</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MerchantPromotion;
