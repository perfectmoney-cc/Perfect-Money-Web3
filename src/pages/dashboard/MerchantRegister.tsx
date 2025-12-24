import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Store, CheckCircle, Loader2, Home, Building2, Globe, Mail, Phone, MapPin } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { bsc } from "wagmi/chains";
import { Header } from "@/components/Header";
import { TradingViewTicker } from "@/components/TradingViewTicker";
import { HeroBanner } from "@/components/HeroBanner";
import { Footer } from "@/components/Footer";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const categories = [
  { value: "retail", label: "Retail & Shopping" },
  { value: "food", label: "Food & Dining" },
  { value: "entertainment", label: "Entertainment" },
  { value: "travel", label: "Travel & Tourism" },
  { value: "services", label: "Professional Services" },
  { value: "technology", label: "Technology" },
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "other", label: "Other" },
];

const MerchantRegister = () => {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    businessName: "",
    category: "",
    description: "",
    email: "",
    phone: "",
    website: "",
    address: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || !address) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!formData.businessName || !formData.category || !formData.email) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      // Store merchant registration in localStorage for now
      // In production, this would go to the PMMerchant contract
      const merchants = JSON.parse(localStorage.getItem("registeredMerchants") || "[]");
      const newMerchant = {
        address: address,
        name: formData.businessName,
        category: formData.category,
        description: formData.description,
        email: formData.email,
        phone: formData.phone,
        website: formData.website,
        physicalAddress: formData.address,
        registeredAt: Date.now(),
        active: true,
      };
      
      // Check if already registered
      const existingIndex = merchants.findIndex((m: any) => m.address.toLowerCase() === address.toLowerCase());
      if (existingIndex >= 0) {
        merchants[existingIndex] = newMerchant;
      } else {
        merchants.push(newMerchant);
      }
      
      localStorage.setItem("registeredMerchants", JSON.stringify(merchants));
      
      toast.success("Merchant registration submitted successfully!");
      setTimeout(() => navigate("/dashboard/merchant"), 1500);
    } catch (error: any) {
      toast.error(error?.message || "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 lg:pb-0">
      <Header />
      <TradingViewTicker />
      <HeroBanner 
        title="Register Your Business" 
        subtitle="Join the PM Token merchant network and accept crypto payments"
      />
      
      <main className="container mx-auto px-4 pt-12 pb-12 flex-1">
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
              <BreadcrumbPage>Register Business</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="max-w-2xl mx-auto">
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-6 w-6 text-primary" />
                Business Registration
              </CardTitle>
              <CardDescription>
                Register your business to appear in the PM Virtual Card merchant list and accept payments.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name *</Label>
                  <Input
                    id="businessName"
                    name="businessName"
                    placeholder="Enter your business name"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Business Category *</Label>
                  <Select value={formData.category} onValueChange={handleCategoryChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Business Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe your business and services"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="business@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+1 234 567 8900"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="website"
                      name="website"
                      type="url"
                      placeholder="https://yourbusiness.com"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Physical Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="address"
                      name="address"
                      placeholder="Street address, City, Country"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <h4 className="font-semibold mb-2">Benefits of Registration</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Appear in PM Virtual Card merchant list
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Accept PM token payments instantly
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Zero transaction fees for PM payments
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Access to merchant analytics dashboard
                    </li>
                  </ul>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(-1)}
                    className="flex-1"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !isConnected}
                    className="flex-1 bg-primary"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Store className="h-4 w-4 mr-2" />
                        Register Business
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default MerchantRegister;
