import { Header } from "@/components/Header";
import { TradingViewTicker } from "@/components/TradingViewTicker";
import { HeroBanner } from "@/components/HeroBanner";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { CheckCircle, Circle, Clock } from "lucide-react";

const roadmapPhases = [
  {
    phase: "Phase 1",
    title: "Foundation & Launch",
    status: "completed",
    quarter: "Q4 2025",
    items: [
      "Complete BEP-20 token contract with security features",
      "Token Security Scan Audits by GoPlusLab,Skynet CertiK and SolidityScan",
      "Seed fund sale and initial token distribution",
      "Launch official website and whitepaper v.10",
      "Set-up Social media channels and Discord community",
      "Community building initiatives and Airdrop Campaign",
    ],
  },
  {
    phase: "Phase 2",
    title: "Core Features & DEX Listing",
    status: "upcoming",
    quarter: "Q1 2026",
    items: [
      "PancakeSwap liquidity pool launch",
      "MetaMask, WalletConnect, Trust Wallet",
      "Send/receive functionality with QR codes",
      "Launch staking with 20% APY",
      "iOS and Android beta release",
      "Custom transaction explorer",
    ],
  },
  {
    phase: "Phase 3",
    title: "Merchant Features",
    status: "upcoming",
    quarter: "Q2 2026",
    items: [
      "RESTful API for merchant integration",
      "Generate and scan QR codes for payments",
      "Analytics and transaction management",
      "Shareable payment link generator",
      "Recurring payment automation",
      "WooCommerce, Shopify plugins",
    ],
  },
  {
    phase: "Phase 4",
    title: "DeFi Expansion",
    status: "upcoming",
    quarter: "Q3 2026",
    items: [
      "Built-in DEX for token swapping",
      "Create PM-BNB and PM-USDT pools",
      "Launch farming programs with rewards",
      "Community voting on proposals",
      "List on 3+ centralized exchanges",
      "Automated referral reward distribution",
    ],
  },
  {
    phase: "Phase 5",
    title: "Global Expansion",
    status: "upcoming",
    quarter: "Q4 2026",
    items: [
      "Bridge to Ethereum, Polygon networks",
      "Credit card and bank transfer integration",
      "Partner with global merchants",
      "Complete iOS and Android apps",
      "Global marketing and PR campaign",
      "Optional compliance for large transactions",
    ],
  },
  {
    phase: "Phase 6",
    title: "Enterprise Solutions",
    status: "upcoming",
    quarter: "Q1 2027",
    items: [
      "Advanced API for large businesses",
      "Customizable payment platform",
      "Corporate and institutional adoption",
      "AI-powered insights and reporting",
      "International payment optimization",
      "1M+ users, 10K+ merchants",
    ],
  },
];

const Roadmap = () => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case "in-progress":
        return <Clock className="h-6 w-6 text-secondary" />;
      default:
        return <Circle className="h-6 w-6 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "border-green-500/50 bg-green-500/5";
      case "in-progress":
        return "border-secondary/50 bg-secondary/5";
      default:
        return "border-border bg-card/50";
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <TradingViewTicker />
      <HeroBanner
        title="Development Roadmap"
        subtitle="Our strategic plan to build the most comprehensive decentralized payment platform"
      />

      <main className="container mx-auto px-4 pt-12 pb-12">
        <div className="max-w-6xl mx-auto">
          {/* Mobile View - Vertical Timeline */}
          <div className="lg:hidden space-y-8">
            {roadmapPhases.map((phase, index) => (
              <Card
                key={index}
                className={`p-6 backdrop-blur-sm transition-all hover:shadow-lg ${getStatusColor(phase.status)}`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">{getStatusIcon(phase.status)}</div>

                  <div className="flex-1">
                    <div className="mb-3">
                      <p className="text-sm font-medium text-muted-foreground mb-1">{phase.phase}</p>
                      <h3 className="text-xl font-bold mb-1">{phase.title}</h3>
                      <p className="text-sm text-muted-foreground">{phase.quarter}</p>
                    </div>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-3 ${
                        phase.status === "completed"
                          ? "bg-green-500/20 text-green-500"
                          : phase.status === "in-progress"
                            ? "bg-secondary/20 text-secondary"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {phase.status === "completed"
                        ? "Completed"
                        : phase.status === "in-progress"
                          ? "In Progress"
                          : "Upcoming"}
                    </span>

                    <ul className="space-y-2">
                      {phase.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-2 text-sm">
                          <div
                            className={`mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0 ${
                              phase.status === "completed" ? "bg-green-500" : "bg-primary"
                            }`}
                          />
                          <span className="text-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Desktop View - Left/Right Timeline with Center Line */}
          <div className="hidden lg:block relative">
            {/* Center vertical line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2" />

            <div className="space-y-12">
              {roadmapPhases.map((phase, index) => {
                const isLeft = index % 2 === 0;

                return (
                  <div key={index} className="relative flex items-center">
                    {/* Timeline dot */}
                    <div className="absolute left-1/2 -translate-x-1/2 z-10">
                      <div
                        className={`p-2 rounded-full bg-background border-2 ${
                          phase.status === "completed"
                            ? "border-green-500"
                            : phase.status === "in-progress"
                              ? "border-secondary"
                              : "border-border"
                        }`}
                      >
                        {getStatusIcon(phase.status)}
                      </div>
                    </div>

                    {/* Content Card */}
                    <Card
                      className={`w-[calc(50%-3rem)] backdrop-blur-sm transition-all hover:shadow-lg ${getStatusColor(phase.status)} ${
                        isLeft ? "mr-auto" : "ml-auto"
                      }`}
                    >
                      <div className="p-6">
                        <div className="mb-4">
                          <p className="text-sm font-medium text-muted-foreground mb-1">{phase.phase}</p>
                          <h3 className="text-2xl font-bold mb-1">{phase.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{phase.quarter}</p>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                              phase.status === "completed"
                                ? "bg-green-500/20 text-green-500"
                                : phase.status === "in-progress"
                                  ? "bg-secondary/20 text-secondary"
                                  : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {phase.status === "completed"
                              ? "Completed"
                              : phase.status === "in-progress"
                                ? "In Progress"
                                : "Upcoming"}
                          </span>
                        </div>

                        <ul className="space-y-2">
                          {phase.items.map((item, itemIndex) => (
                            <li key={itemIndex} className="flex items-start gap-2">
                              <div
                                className={`mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0 ${
                                  phase.status === "completed" ? "bg-green-500" : "bg-primary"
                                }`}
                              />
                              <span className="text-foreground text-sm">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Future Vision */}
          <Card className="mt-12 p-8 bg-gradient-to-br from-primary/10 to-secondary/10 backdrop-blur-sm border-primary/20">
            <h3 className="text-2xl font-bold mb-4">Long-Term Vision</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Beyond 2025, we envision PerfectMoney becoming the leading decentralized payment infrastructure,
              supporting millions of daily transactions and serving as the bridge between traditional finance and the
              decentralized economy.
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Multi-chain expansion beyond BSC</li>
              <li>• Layer 2 scaling solutions for reduced fees</li>
              <li>• DeFi protocol integrations</li>
              <li>• NFT marketplace integration</li>
              <li>• DAO governance implementation</li>
            </ul>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Roadmap;
