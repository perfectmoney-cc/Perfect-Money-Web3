import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TradingViewTicker } from "@/components/TradingViewTicker";
import { HeroBanner } from "@/components/HeroBanner";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Card } from "@/components/ui/card";
import { ArrowLeft, AlertCircle, CheckCircle, Clock, Wallet, Shield, FileText } from "lucide-react";
import { Link } from "react-router-dom";

const PresaleTerms = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 lg:pb-0">
      <Header />
      <TradingViewTicker />
      <HeroBanner title="Presale Terms" subtitle="Terms and conditions for Perfect Money token presale participation" />
      
      <main className="container mx-auto px-4 pt-12 pb-12 flex-1">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Overview */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <FileText className="h-8 w-8 text-primary flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-bold mb-4">Presale Overview</h2>
                <p className="text-muted-foreground leading-relaxed">
                  The Perfect Money (PM) token presale offers early investors the opportunity to acquire PM tokens at a discounted rate before the public launch. By participating in the presale, you agree to be bound by these terms and conditions.
                </p>
              </div>
            </div>
          </Card>

          {/* Eligibility */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Eligibility Requirements
            </h2>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Participants must be at least 18 years of age or the age of majority in their jurisdiction</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Participants must not be residents of restricted jurisdictions (USA, China, North Korea, Iran, Cuba, Syria)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Participants must have a compatible Web3 wallet (MetaMask, Trust Wallet, etc.)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Participants must complete any required verification processes</span>
              </li>
            </ul>
          </Card>

          {/* Token Details */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Wallet className="h-6 w-6 text-primary" />
              Presale Token Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-border rounded-lg">
                <p className="text-sm text-muted-foreground">Token Name</p>
                <p className="font-bold text-lg">Perfect Money (PM)</p>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <p className="text-sm text-muted-foreground">Network</p>
                <p className="font-bold text-lg">BNB Smart Chain (BEP-20)</p>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <p className="text-sm text-muted-foreground">Presale Allocation</p>
                <p className="font-bold text-lg">20% of Total Supply</p>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <p className="text-sm text-muted-foreground">Accepted Currencies</p>
                <p className="font-bold text-lg">USDT, USDC, BNB</p>
              </div>
            </div>
          </Card>

          {/* Vesting Schedule */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Clock className="h-6 w-6 text-primary" />
              Vesting & Distribution
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p>Token distribution follows the schedule below:</p>
              <div className="space-y-2">
                <div className="flex justify-between p-3 border border-border rounded-lg">
                  <span>Initial Release (TGE)</span>
                  <span className="font-bold text-foreground">25%</span>
                </div>
                <div className="flex justify-between p-3 border border-border rounded-lg">
                  <span>Month 1 After TGE</span>
                  <span className="font-bold text-foreground">25%</span>
                </div>
                <div className="flex justify-between p-3 border border-border rounded-lg">
                  <span>Month 2 After TGE</span>
                  <span className="font-bold text-foreground">25%</span>
                </div>
                <div className="flex justify-between p-3 border border-border rounded-lg">
                  <span>Month 3 After TGE</span>
                  <span className="font-bold text-foreground">25%</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Risks & Disclaimers */}
          <Card className="p-6 bg-yellow-500/10 border-yellow-500/20">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-yellow-500" />
              Risks & Disclaimers
            </h2>
            <ul className="space-y-3 text-muted-foreground">
              <li>• Cryptocurrency investments carry significant risk of loss. Only invest what you can afford to lose.</li>
              <li>• Token prices may fluctuate significantly. Past performance is not indicative of future results.</li>
              <li>• Perfect Money makes no guarantees regarding token value, listing, or exchange availability.</li>
              <li>• Participants are responsible for their own tax obligations in their respective jurisdictions.</li>
              <li>• All presale purchases are final and non-refundable once confirmed on the blockchain.</li>
              <li>• Perfect Money reserves the right to modify presale terms with reasonable notice to participants.</li>
            </ul>
          </Card>

          {/* Agreement */}
          <Card className="p-6 bg-primary/10 border-primary/20">
            <h2 className="text-xl font-bold mb-4">Agreement</h2>
            <p className="text-muted-foreground leading-relaxed">
              By participating in the Perfect Money token presale, you acknowledge that you have read, understood, and agree to be bound by these Presale Terms, our Privacy Policy, and Terms of Service. You confirm that you meet all eligibility requirements and accept all associated risks.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Last Updated: December 2024
            </p>
          </Card>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default PresaleTerms;
