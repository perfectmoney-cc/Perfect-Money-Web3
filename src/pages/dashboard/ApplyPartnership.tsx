import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Header } from "@/components/Header";
import { TradingViewTicker } from "@/components/TradingViewTicker";
import { HeroBanner } from "@/components/HeroBanner";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Footer } from "@/components/Footer";
import {
  ArrowLeft,
  Handshake,
  Building2,
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  Users,
  FileText,
  Upload,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useState } from "react";

const ApplyPartnership = () => {
  const [formData, setFormData] = useState({
    companyName: "",
    industrySector: "",
    websiteUrl: "",
    headquarters: "",
    yearEstablished: "",
    companySize: "",
    contactName: "",
    jobTitle: "",
    email: "",
    phone: "",
    alternativeContact: "",
    companyOverview: "",
    keyProducts: "",
    targetSegments: "",
    partnershipObjectives: "",
    integrationModel: "",
    expectedValue: "",
    comments: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Google Sheets URL for direct submission via Google Forms/Apps Script
  // This uses the Google Sheets web API to append data directly
  const GOOGLE_SHEETS_URL =
    "https://docs.google.com/spreadsheets/d/1ykn3YfnCNlb8iRn3Uli3VvI3Ij0iTMc1vilGYogeZX4/edit";
  
  // Google Apps Script web app URL for form submission (handles the actual data submission)
  const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycby0ZANQc9fm1140WSIUhb236USEAkI738TSm__2gV53jcoxcomeM_R9jsFXk4RFQlnDQg/exec";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      // Prepare form data for Google Sheets (ordered to match spreadsheet columns)
      const rowData = {
        timestamp: new Date().toISOString(),
        companyName: formData.companyName,
        industrySector: formData.industrySector,
        websiteUrl: formData.websiteUrl,
        headquarters: formData.headquarters,
        yearEstablished: formData.yearEstablished,
        companySize: formData.companySize,
        contactName: formData.contactName,
        jobTitle: formData.jobTitle,
        email: formData.email,
        phone: formData.phone,
        alternativeContact: formData.alternativeContact,
        companyOverview: formData.companyOverview,
        keyProducts: formData.keyProducts,
        targetSegments: formData.targetSegments,
        partnershipObjectives: formData.partnershipObjectives,
        integrationModel: formData.integrationModel,
        expectedValue: formData.expectedValue,
        comments: formData.comments,
      };

      // Send data to Google Apps Script which will append to Google Sheets
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rowData),
      });

      // With no-cors we can't read response, but if no error thrown, assume success
      toast.success(
        "Partnership application submitted successfully! Our team will review and contact you within 5-7 business days.",
      );
      setFormData({
        companyName: "",
        industrySector: "",
        websiteUrl: "",
        headquarters: "",
        yearEstablished: "",
        companySize: "",
        contactName: "",
        jobTitle: "",
        email: "",
        phone: "",
        alternativeContact: "",
        companyOverview: "",
        keyProducts: "",
        targetSegments: "",
        partnershipObjectives: "",
        integrationModel: "",
        expectedValue: "",
        comments: "",
      });
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 lg:pb-0">
      <Header />
      <TradingViewTicker />
      <HeroBanner
        title="Partnership Application"
        subtitle="Please provide accurate information to help us evaluate your partnership request"
      />

      <main className="container mx-auto px-4 pt-12 pb-12 flex-1">
        <Link
          to="/dashboard/partners"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Partners
        </Link>

        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-lg bg-primary/10">
              <Handshake className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Partnership Application</h1>
              <p className="text-muted-foreground">Complete all required fields to submit your application</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Company Information Section */}
            <Card className="p-6 bg-card/50 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-6">
                <Building2 className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Company Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Company Name *</label>
                  <Input
                    placeholder="Enter your registered legal business name"
                    value={formData.companyName}
                    onChange={(e) => handleChange("companyName", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Industry Sector *</label>
                  <Select value={formData.industrySector} onValueChange={(v) => handleChange("industrySector", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="financial-services">Financial Services</SelectItem>
                      <SelectItem value="exchange">Exchange Platform</SelectItem>
                      <SelectItem value="wallet">Wallet Provider</SelectItem>
                      <SelectItem value="payment-gateway">Payment Gateway</SelectItem>
                      <SelectItem value="fintech">FinTech</SelectItem>
                      <SelectItem value="compliance">Compliance Solutions</SelectItem>
                      <SelectItem value="defi">DeFi Protocol</SelectItem>
                      <SelectItem value="nft">NFT Platform</SelectItem>
                      <SelectItem value="gaming">Blockchain Gaming</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Website URL *</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="url"
                      placeholder="https://www.yourcompany.com"
                      className="pl-10"
                      value={formData.websiteUrl}
                      onChange={(e) => handleChange("websiteUrl", e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Headquarters Location *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="City, Country"
                      className="pl-10"
                      value={formData.headquarters}
                      onChange={(e) => handleChange("headquarters", e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Year Established *</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="e.g., 2015"
                      className="pl-10"
                      value={formData.yearEstablished}
                      onChange={(e) => handleChange("yearEstablished", e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Company Size *</label>
                  <Select value={formData.companySize} onValueChange={(v) => handleChange("companySize", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Number of employees" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10 employees</SelectItem>
                      <SelectItem value="11-50">11-50 employees</SelectItem>
                      <SelectItem value="51-200">51-200 employees</SelectItem>
                      <SelectItem value="201-500">201-500 employees</SelectItem>
                      <SelectItem value="501-1000">501-1000 employees</SelectItem>
                      <SelectItem value="1000+">1000+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Primary Contact Details */}
            <Card className="p-6 bg-card/50 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-6">
                <User className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Primary Contact Details</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Contact Person Name *</label>
                  <Input
                    placeholder="Full legal name of the primary representative"
                    value={formData.contactName}
                    onChange={(e) => handleChange("contactName", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Position / Job Title *</label>
                  <Input
                    placeholder="e.g., Business Development Manager, CEO"
                    value={formData.jobTitle}
                    onChange={(e) => handleChange("jobTitle", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="business@yourcompany.com"
                      className="pl-10"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      className="pl-10"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium mb-2 block">Alternative Contact (Optional)</label>
                  <Input
                    placeholder="Name, Email, or Phone"
                    value={formData.alternativeContact}
                    onChange={(e) => handleChange("alternativeContact", e.target.value)}
                  />
                </div>
              </div>
            </Card>

            {/* Business Overview */}
            <Card className="p-6 bg-card/50 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-6">
                <FileText className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Business Overview</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Company Overview *</label>
                  <Textarea
                    placeholder="Briefly describe your organization, services, and operational markets..."
                    className="min-h-[120px]"
                    value={formData.companyOverview}
                    onChange={(e) => handleChange("companyOverview", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Key Products or Services *</label>
                  <Textarea
                    placeholder="e.g., crypto exchange, payment processor, wallet service, compliance solutions, merchant tools"
                    className="min-h-[80px]"
                    value={formData.keyProducts}
                    onChange={(e) => handleChange("keyProducts", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Target Customer Segments *</label>
                  <Textarea
                    placeholder="e.g., retail clients, enterprises, merchants, fintechs, institutional traders"
                    className="min-h-[80px]"
                    value={formData.targetSegments}
                    onChange={(e) => handleChange("targetSegments", e.target.value)}
                    required
                  />
                </div>
              </div>
            </Card>

            {/* Partnership Proposal */}
            <Card className="p-6 bg-card/50 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-6">
                <Handshake className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Partnership Proposal</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Partnership Objectives *</label>
                  <Textarea
                    placeholder="How would you like to collaborate with Perfect Money? Please outline your goals..."
                    className="min-h-[120px]"
                    value={formData.partnershipObjectives}
                    onChange={(e) => handleChange("partnershipObjectives", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Proposed Integration or Cooperation Model *</label>
                  <Textarea
                    placeholder="e.g., API integration, co-branding, payment solutions, merchant onboarding, liquidity partnership, technology collaboration"
                    className="min-h-[100px]"
                    value={formData.integrationModel}
                    onChange={(e) => handleChange("integrationModel", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Expected Value for Both Parties *</label>
                  <Textarea
                    placeholder="Describe the mutual benefits and business impact..."
                    className="min-h-[100px]"
                    value={formData.expectedValue}
                    onChange={(e) => handleChange("expectedValue", e.target.value)}
                    required
                  />
                </div>
              </div>
            </Card>

            {/* Additional Information */}
            <Card className="p-6 bg-card/50 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-6">
                <Upload className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Additional Information (Optional)</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Supporting Documents</label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Upload pitch decks, product documentation, or compliance certificates
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">PDF, DOC, DOCX, PPT, PPTX (Max 10MB)</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Comments or Notes</label>
                  <Textarea
                    placeholder="Any additional details relevant to your application..."
                    className="min-h-[100px]"
                    value={formData.comments}
                    onChange={(e) => handleChange("comments", e.target.value)}
                  />
                </div>
              </div>
            </Card>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                type="submit"
                variant="gradient"
                className="flex-1 sm:flex-none sm:min-w-[200px]"
                disabled={isSubmitting}
              >
                <Building2 className="h-4 w-4 mr-2" />
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
              <Link to="/dashboard/partners" className="flex-1 sm:flex-none">
                <Button type="button" variant="outline" className="w-full">
                  Cancel / Return to Dashboard
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default ApplyPartnership;
