import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TradingViewTicker } from "@/components/TradingViewTicker";
import { HeroBanner } from "@/components/HeroBanner";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Shield, Scale, Globe, FileCheck, Users, AlertTriangle, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const LegalCompliance = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 lg:pb-0">
      <Header />
      <TradingViewTicker />
      <HeroBanner title="Legal Compliance" subtitle="Our commitment to regulatory compliance and legal standards" />
      
      <main className="container mx-auto px-4 pt-12 pb-12 flex-1">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Overview */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <Scale className="h-8 w-8 text-primary flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-bold mb-4">Compliance Overview</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Perfect Money is committed to maintaining the highest standards of legal compliance and regulatory adherence. We operate in accordance with applicable laws and industry best practices to ensure a secure and transparent platform for all users.
                </p>
              </div>
            </div>
          </Card>

          {/* Regulatory Framework */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Regulatory Framework
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p>Perfect Money adheres to the following regulatory standards:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <h3 className="font-semibold text-foreground">AML Compliance</h3>
                  </div>
                  <p className="text-sm">Anti-Money Laundering procedures to prevent illicit activities</p>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <h3 className="font-semibold text-foreground">KYC Procedures</h3>
                  </div>
                  <p className="text-sm">Know Your Customer verification for high-value transactions</p>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <h3 className="font-semibold text-foreground">GDPR Compliance</h3>
                  </div>
                  <p className="text-sm">Data protection in accordance with European regulations</p>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <h3 className="font-semibold text-foreground">Smart Contract Audits</h3>
                  </div>
                  <p className="text-sm">Third-party security audits of all smart contracts</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Jurisdictional Restrictions */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Globe className="h-6 w-6 text-primary" />
              Jurisdictional Restrictions
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p>Due to regulatory requirements, Perfect Money services are not available in the following jurisdictions:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {["United States", "China", "North Korea", "Iran", "Cuba", "Syria", "Crimea Region", "Russia", "Belarus"].map((country) => (
                  <div key={country} className="p-3 border border-red-500/30 rounded-lg bg-red-500/5 text-center">
                    <span className="text-sm text-red-400">{country}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm mt-4">
                Users from restricted jurisdictions are prohibited from accessing Perfect Money services. VPN usage to circumvent these restrictions is strictly prohibited and may result in account termination.
              </p>
            </div>
          </Card>

          {/* User Obligations */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              User Obligations
            </h2>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Users must provide accurate and truthful information during registration and verification</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Users must comply with all applicable laws in their jurisdiction</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Users must not use the platform for any illegal or fraudulent activities</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Users are responsible for reporting and paying any applicable taxes</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Users must maintain the security of their wallet and account credentials</span>
              </li>
            </ul>
          </Card>

          {/* Compliance Measures */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FileCheck className="h-6 w-6 text-primary" />
              Compliance Measures
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <div className="p-4 border border-border rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">Transaction Monitoring</h3>
                <p className="text-sm">We implement real-time transaction monitoring to detect and prevent suspicious activities, including unusual transaction patterns and high-risk transactions.</p>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">Risk Assessment</h3>
                <p className="text-sm">Regular risk assessments are conducted to identify potential compliance risks and implement appropriate mitigation measures.</p>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">Record Keeping</h3>
                <p className="text-sm">We maintain comprehensive records of all transactions and user activities in accordance with regulatory requirements.</p>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">Reporting Obligations</h3>
                <p className="text-sm">We comply with all reporting requirements to relevant authorities, including suspicious activity reports where applicable.</p>
              </div>
            </div>
          </Card>

          {/* Legal Notice */}
          <Card className="p-6 bg-yellow-500/10 border-yellow-500/20">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
              Legal Notice
            </h2>
            <div className="space-y-3 text-muted-foreground text-sm">
              <p>• This document is for informational purposes only and does not constitute legal advice.</p>
              <p>• Perfect Money reserves the right to modify its compliance policies at any time.</p>
              <p>• Users are encouraged to seek independent legal advice regarding their obligations.</p>
              <p>• Failure to comply with these requirements may result in account suspension or termination.</p>
            </div>
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

export default LegalCompliance;
