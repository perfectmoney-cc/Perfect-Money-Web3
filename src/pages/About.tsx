import { Header } from "@/components/Header";
import { TradingViewTicker } from "@/components/TradingViewTicker";
import { HeroBanner } from "@/components/HeroBanner";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Target, Eye, Heart, AlertCircle, CheckCircle, History } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <TradingViewTicker />
      <HeroBanner 
        title="About Us" 
        subtitle="Building the future of decentralized payments"
      />
      
      <main className="container mx-auto px-4 pt-12 pb-12">
        <div className="max-w-6xl mx-auto">
          {/* History Section */}
          <Card className="p-8 mb-12 bg-card/50 backdrop-blur-sm">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 rounded-lg bg-primary/10">
                <History className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-2">History of Perfect Money</h2>
                <p className="text-muted-foreground">The Evolution from Centralization to Decentralization</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-3">Perfect Money: The Centralized Era</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Perfect Money was established in 2007 as a centralized digital payment system, offering users 
                  the ability to make instant payments and money transfers worldwide. Operating under a traditional 
                  financial model, it provided services including instant payments, currency exchange, and merchant 
                  solutions. However, being centralized meant users had to trust a single entity with their funds, 
                  faced potential account freezes, and dealt with limited transparency in operations.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 bg-destructive/5 border-destructive/20">
                  <h4 className="font-bold mb-3 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    Centralized Limitations
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Single point of failure</li>
                    <li>• Account freeze risks</li>
                    <li>• Limited transparency</li>
                    <li>• Geographic restrictions</li>
                    <li>• High dependency on operator</li>
                    <li>• KYC barriers to entry</li>
                  </ul>
                </Card>

                <Card className="p-6 bg-green-500/5 border-green-500/20">
                  <h4 className="font-bold mb-3 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Decentralized Advantages
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• No single point of failure</li>
                    <li>• Immutable transactions</li>
                    <li>• Complete transparency</li>
                    <li>• Global accessibility</li>
                    <li>• User sovereignty</li>
                    <li>• Permissionless access</li>
                  </ul>
                </Card>
              </div>
            </div>
          </Card>

          {/* Problem & Solution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Card className="p-8 bg-card/50 backdrop-blur-sm">
              <div className="p-3 rounded-lg bg-destructive/10 inline-block mb-4">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <h2 className="text-2xl font-bold mb-4">The Problem</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Traditional payment systems, even digital ones, operate in centralized silos. Users face:
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li>• High transaction fees (2-5%)</li>
                <li>• Slow settlement times</li>
                <li>• Limited control over assets</li>
                <li>• Geographic restrictions</li>
                <li>• Lack of transparency</li>
                <li>• Censorship and account freezes</li>
                <li>• Privacy concerns</li>
              </ul>
            </Card>

            <Card className="p-8 bg-card/50 backdrop-blur-sm">
              <div className="p-3 rounded-lg bg-green-500/10 inline-block mb-4">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Our Solution</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                PerfectMoney leverages blockchain technology to provide:
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li>• Minimal transaction fees (&lt;0.1%)</li>
                <li>• Instant settlement</li>
                <li>• Full asset ownership</li>
                <li>• Global accessibility</li>
                <li>• Complete transparency</li>
                <li>• Censorship-resistant</li>
                <li>• Enhanced privacy options</li>
              </ul>
            </Card>
          </div>

          {/* About PerfectMoney */}
          <Card className="p-8 mb-12 bg-gradient-to-br from-primary/10 to-secondary/10 backdrop-blur-sm border-primary/20">
            <h2 className="text-3xl font-bold mb-6">About PerfectMoney</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              PerfectMoney is a next-generation decentralized payment platform built on Binance Smart Chain. 
              We combine the reliability and user experience of traditional payment systems with the transparency, 
              security, and freedom of blockchain technology.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Our platform enables instant peer-to-peer transactions, merchant payments, staking rewards, and 
              seamless currency exchange—all powered by our native PM token. By eliminating intermediaries and 
              leveraging smart contracts, we provide a truly decentralized financial infrastructure that puts 
              users in complete control of their assets.
            </p>
          </Card>

          {/* Mission, Vision, Values */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card className="p-8 bg-card/50 backdrop-blur-sm text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-2xl bg-primary/10">
                  <Target className="h-10 w-10 text-primary" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4">Mission</h3>
              <p className="text-muted-foreground leading-relaxed">
                To democratize financial services by providing a decentralized, transparent, and accessible 
                payment platform that empowers individuals and businesses worldwide.
              </p>
            </Card>

            <Card className="p-8 bg-card/50 backdrop-blur-sm text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-2xl bg-secondary/10">
                  <Eye className="h-10 w-10 text-secondary" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4">Vision</h3>
              <p className="text-muted-foreground leading-relaxed">
                To become the leading decentralized payment infrastructure, facilitating billions of dollars 
                in daily transactions and bridging traditional finance with the decentralized economy.
              </p>
            </Card>

            <Card className="p-8 bg-card/50 backdrop-blur-sm text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-2xl bg-primary/10">
                  <Heart className="h-10 w-10 text-primary" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4">Values</h3>
              <p className="text-muted-foreground leading-relaxed">
                Transparency, security, accessibility, innovation, and user sovereignty guide every decision 
                we make in building the future of decentralized payments.
              </p>
            </Card>
          </div>

          {/* Core Values Detail */}
          <Card className="p-8 bg-card/50 backdrop-blur-sm">
            <h2 className="text-3xl font-bold mb-6">Core Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-3">Transparency</h3>
                <p className="text-muted-foreground">
                  All transactions are recorded on-chain, providing complete visibility and auditability 
                  for users and regulators alike.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3">Security</h3>
                <p className="text-muted-foreground">
                  We prioritize security through rigorous smart contract audits, best practices, and 
                  continuous monitoring.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3">Accessibility</h3>
                <p className="text-muted-foreground">
                  Financial services should be available to everyone, regardless of location or background, 
                  with minimal barriers to entry.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3">Innovation</h3>
                <p className="text-muted-foreground">
                  We continuously explore new technologies and features to improve user experience and 
                  expand platform capabilities.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3">User Sovereignty</h3>
                <p className="text-muted-foreground">
                  Users maintain complete control over their assets with no third-party interference or 
                  custodial risks.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3">Community Focus</h3>
                <p className="text-muted-foreground">
                  Our community drives platform development through governance participation and continuous 
                  feedback.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
