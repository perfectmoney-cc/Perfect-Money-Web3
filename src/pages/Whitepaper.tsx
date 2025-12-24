import { useState } from "react";
import { Header } from "@/components/Header";
import { TradingViewTicker } from "@/components/TradingViewTicker";
import { HeroBanner } from "@/components/HeroBanner";
import { Footer } from "@/components/Footer";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, FileText, Menu, X } from "lucide-react";
import html2pdf from "html2pdf.js";
import pmLogo from "@/assets/pm-logo.png";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, AreaChart, Area, Legend } from "recharts";
import { toast } from "sonner";
interface TableData {
  title: string;
  rows: {
    label: string;
    value: string;
  }[];
}
interface Section {
  title: string;
  content: string;
  tables?: TableData[];
  chart?: string;
}
const tokenDistributionData = [{
  name: "Public Sale",
  value: 20,
  color: "#E53E3E"
}, {
  name: "Community",
  value: 20,
  color: "#22c55e"
}, {
  name: "Development",
  value: 20,
  color: "#3b82f6"
}, {
  name: "Team & Advisors",
  value: 15,
  color: "#f59e0b"
}, {
  name: "Marketing",
  value: 10,
  color: "#8b5cf6"
}, {
  name: "Liquidity Pool",
  value: 10,
  color: "#06b6d4"
}, {
  name: "Reserve Fund",
  value: 5,
  color: "#ec4899"
}];
const marketGrowthData = [{
  year: "2023",
  market: 7.5
}, {
  year: "2024",
  market: 9.2
}, {
  year: "2025",
  market: 11.0
}, {
  year: "2026",
  market: 12.8
}, {
  year: "2027",
  market: 15.0
}];
const roadmapData = [{
  phase: "Q4 2025",
  progress: 100,
  milestone: "Launch"
}, {
  phase: "Q1 2026",
  progress: 75,
  milestone: "DEX Listing"
}, {
  phase: "Q2 2026",
  progress: 50,
  milestone: "Merchant"
}, {
  phase: "Q3 2026",
  progress: 25,
  milestone: "DeFi"
}, {
  phase: "Q4 2026",
  progress: 10,
  milestone: "Global"
}];
const transactionVolumeData = [{
  month: "Jan",
  volume: 120
}, {
  month: "Feb",
  volume: 180
}, {
  month: "Mar",
  volume: 250
}, {
  month: "Apr",
  volume: 320
}, {
  month: "May",
  volume: 480
}, {
  month: "Jun",
  volume: 620
}];
const sections: Section[] = [{
  title: "Executive Summary",
  content: "PerfectMoney (PM) is a decentralized payment platform built on Binance Smart Chain, designed to provide instant, secure, and borderless financial transactions. By leveraging blockchain technology, we aim to create a transparent and efficient alternative to traditional payment systems."
}, {
  title: "1. Introduction",
  content: "The financial industry has been dominated by centralized institutions that control access, impose high fees, and lack transparency. PerfectMoney represents a paradigm shift toward decentralized finance, empowering users with full control over their assets while maintaining the convenience of modern payment systems."
}, {
  title: "2. Problem Statement",
  content: "Traditional centralized payment systems face critical challenges: High transaction fees (2-3% per transaction), Slow settlement times (2-5 business days), Limited accessibility for unbanked populations (1.7 billion adults globally), Single points of failure and security vulnerabilities, Lack of transparency in fee structures, Geographic restrictions and currency conversion costs, Censorship and account freezing risks, Dependence on intermediaries reducing user control."
}, {
  title: "3. Solution Statement",
  content: "PerfectMoney addresses these challenges through decentralization: Near-zero transaction fees (< 0.1%), Instant settlements (< 5 seconds), Global accessibility with just an internet connection, Distributed network eliminating single points of failure, Complete transparency through blockchain technology, Borderless transactions without currency conversion, Censorship-resistant peer-to-peer transfers, Full user control over assets without intermediaries."
}, {
  title: "4. Market Analysis",
  content: "The global digital payment market is projected to reach $12 trillion by 2025, with cryptocurrency adoption growing at 63% annually. Key market opportunities include: E-commerce merchants seeking lower fees, Cross-border remittance market ($700B annually), DeFi ecosystem integration, Emerging markets with limited banking infrastructure, Gaming and NFT marketplaces, Freelance and gig economy payments.",
  chart: "marketGrowth"
}, {
  title: "5. Technical Architecture",
  content: "PerfectMoney is built on the Binance Smart Chain, utilizing the BEP-20 token standard. Our smart contract infrastructure includes: Token Contract for PM token management, Staking Contract for reward distribution, Payment Gateway Contract for merchant integration, and Referral Contract for program automation. The architecture ensures scalability, security, and seamless integration with existing DeFi protocols."
}, {
  title: "6. Token Economics",
  content: "The PM token has a fixed supply of 100 billion tokens with no inflationary mechanisms. Our tokenomics are designed to ensure long-term sustainability and value appreciation for holders.",
  chart: "tokenDistribution",
  tables: [{
    title: "Token Information",
    rows: [{
      label: "Token Name",
      value: "PerfectMoney"
    }, {
      label: "Token Symbol",
      value: "PM"
    }, {
      label: "Blockchain",
      value: "Binance Smart Chain (BSC)"
    }, {
      label: "Token Standard",
      value: "BEP-20"
    }, {
      label: "Total Supply",
      value: "100,000,000,000 PM"
    }, {
      label: "Decimals",
      value: "18"
    }, {
      label: "Contract Address",
      value: "0x181108f76d9910569203b5d59eb14Bc31961a989"
    }, {
      label: "Initial Price",
      value: "$0.001 USD"
    }]
  }, {
    title: "Token Distribution",
    rows: [{
      label: "Public Sale",
      value: "20% (20,000,000,000 PM)"
    }, {
      label: "Community",
      value: "20% (20,000,000,000 PM)"
    }, {
      label: "Development",
      value: "20% (20,000,000,000 PM)"
    }, {
      label: "Team & Advisors",
      value: "15% (15,000,000,000 PM)"
    }, {
      label: "Marketing",
      value: "10% (10,000,000,000 PM)"
    }, {
      label: "Liquidity Pool",
      value: "10% (10,000,000,000 PM)"
    }, {
      label: "Reserve Fund",
      value: "5% (5,000,000,000 PM)"
    }]
  }]
}, {
  title: "7. Platform Features",
  content: "Our comprehensive platform offers multiple feature containers designed for different user types and use cases. Each container provides specialized functionality while maintaining seamless integration with the core payment infrastructure.",
  chart: "transactionVolume",
  tables: [{
    title: "User Container Features",
    rows: [{
      label: "Web3 Wallet Integration",
      value: "MetaMask, WalletConnect, Trust Wallet support"
    }, {
      label: "Instant P2P Transfers",
      value: "Send/receive PM tokens in < 5 seconds"
    }, {
      label: "QR Code Payments",
      value: "Scan to pay for quick transactions"
    }, {
      label: "Transaction History",
      value: "Complete on-chain transaction tracking"
    }, {
      label: "Multi-Currency Support",
      value: "BNB, USDT, USDC, PM tokens"
    }, {
      label: "Portfolio Dashboard",
      value: "Real-time balance and analytics"
    }]
  }, {
    title: "Merchant Container Features",
    rows: [{
      label: "Payment Gateway API",
      value: "RESTful API for e-commerce integration"
    }, {
      label: "Payment Link Generator",
      value: "Create shareable payment links"
    }, {
      label: "QR Code Generator",
      value: "Generate payment QR codes"
    }, {
      label: "Subscription Billing",
      value: "Automated recurring payments"
    }, {
      label: "Settlement Options",
      value: "Auto-convert to stablecoin or hold PM"
    }, {
      label: "Analytics Dashboard",
      value: "Sales tracking and reporting"
    }]
  }]
}, {
  title: "8. Security Measures",
  content: "Security is paramount. Our approach includes: comprehensive smart contract audits by leading firms (CertiK, GoPlus, SolidityScan), multi-signature wallet requirements for treasury, regular security assessments and penetration testing, bug bounty program for community involvement, and optional KYC/AML compliance for enhanced features. Our combined security score is AAA (94.83/100)."
}, {
  title: "9. Governance Model",
  content: "PerfectMoney will transition to a DAO (Decentralized Autonomous Organization) governance model, allowing PM token holders to vote on key platform decisions including feature priorities, fee structures, partnership approvals, and treasury management."
}, {
  title: "10. Roadmap & Milestones",
  content: "Our comprehensive development roadmap spans 24 months, focusing on systematic feature rollout, ecosystem growth, and enterprise adoption. Each phase builds upon previous achievements while maintaining security and stability.",
  chart: "roadmap",
  tables: [{
    title: "Phase 1: Foundation & Launch (Q4 2025)",
    rows: [{
      label: "Smart Contract Development",
      value: "Complete BEP-20 token contract with security features"
    }, {
      label: "Security Audits",
      value: "Third-party audits by CertiK and Hacken"
    }, {
      label: "Token Generation Event",
      value: "Public sale and initial distribution"
    }, {
      label: "Website & Documentation",
      value: "Launch official website and whitepaper"
    }, {
      label: "Community Building",
      value: "Social media channels and Discord community"
    }]
  }, {
    title: "Phase 2: Core Features & DEX Listing (Q1 2026)",
    rows: [{
      label: "DEX Listing",
      value: "PancakeSwap liquidity pool launch"
    }, {
      label: "Wallet Integration",
      value: "MetaMask, WalletConnect, Trust Wallet"
    }, {
      label: "P2P Transfer System",
      value: "Send/receive functionality with QR codes"
    }, {
      label: "Staking Platform",
      value: "Launch staking with 20% APY"
    }, {
      label: "Mobile App (Beta)",
      value: "iOS and Android beta release"
    }]
  }, {
    title: "Phase 3: Merchant Features (Q2 2026)",
    rows: [{
      label: "Payment Gateway API",
      value: "RESTful API for merchant integration"
    }, {
      label: "QR Payment System",
      value: "Generate and scan QR codes for payments"
    }, {
      label: "Merchant Dashboard",
      value: "Analytics and transaction management"
    }, {
      label: "Payment Links",
      value: "Shareable payment link generator"
    }, {
      label: "Plugin Development",
      value: "WooCommerce, Shopify plugins"
    }]
  }]
}, {
  title: "11. Team & Advisors",
  content: "Our team comprises blockchain developers, financial experts, and industry veterans with combined experience of over 50 years in fintech and cryptocurrency sectors. Advisory board includes former executives from major payment processors and DeFi protocols."
}, {
  title: "12. Legal & Compliance",
  content: "We are committed to operating within regulatory frameworks while maintaining decentralization principles. Our approach includes optional KYC verification, AML monitoring systems, legal entity establishment in crypto-friendly jurisdictions, and ongoing dialogue with regulatory bodies."
}, {
  title: "13. Conclusion",
  content: "PerfectMoney represents the future of digital payments—decentralized, transparent, and accessible to everyone. By combining the best aspects of traditional payment systems with blockchain innovation, we aim to revolutionize how value is transferred globally."
}];
const TokenDistributionChart = () => <div className="my-6">
    <h4 className="text-lg font-semibold mb-4 text-center">Token Distribution</h4>
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={tokenDistributionData} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value" label={({
          name,
          percent
        }) => `${name} ${(percent * 100).toFixed(0)}%`}>
            {tokenDistributionData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
          </Pie>
          <Tooltip formatter={value => [`${value}%`, "Allocation"]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </div>;
const MarketGrowthChart = () => <div className="my-6">
    <h4 className="text-lg font-semibold mb-4 text-center">Global Digital Payment Market (Trillion USD)</h4>
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={marketGrowthData}>
          <defs>
            <linearGradient id="colorMarket" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#E53E3E" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#E53E3E" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" />
          <YAxis stroke="hsl(var(--muted-foreground))" />
          <Tooltip contentStyle={{
          background: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))'
        }} formatter={value => [`$${value}T`, "Market Size"]} />
          <Area type="monotone" dataKey="market" stroke="#E53E3E" fillOpacity={1} fill="url(#colorMarket)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>;
const TransactionVolumeChart = () => <div className="my-6">
    <h4 className="text-lg font-semibold mb-4 text-center">Projected Transaction Volume (Thousands)</h4>
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={transactionVolumeData}>
          <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
          <YAxis stroke="hsl(var(--muted-foreground))" />
          <Tooltip contentStyle={{
          background: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))'
        }} formatter={value => [`${value}K`, "Transactions"]} />
          <Bar dataKey="volume" fill="#E53E3E" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>;
const RoadmapChart = () => <div className="my-6">
    <h4 className="text-lg font-semibold mb-4 text-center">Development Progress</h4>
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={roadmapData} layout="vertical">
          <XAxis type="number" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" />
          <YAxis type="category" dataKey="phase" stroke="hsl(var(--muted-foreground))" width={80} />
          <Tooltip contentStyle={{
          background: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))'
        }} formatter={(value, name, props) => [`${value}%`, props.payload.milestone]} />
          <Bar dataKey="progress" fill="#22c55e" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>;
const Whitepaper = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const handleDownloadPDF = () => {
    const element = document.getElementById("whitepaper-content");
    if (!element) return;
    toast.info("Generating whitepaper PDF...");
    const opt = {
      margin: [15, 15, 15, 15] as [number, number, number, number],
      filename: "PerfectMoney-Whitepaper.pdf",
      image: {
        type: "jpeg" as const,
        quality: 0.98
      },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true
      },
      jsPDF: {
        unit: "mm" as const,
        format: "a4" as const,
        orientation: "portrait" as const
      },
      pagebreak: {
        mode: ["avoid-all", "css", "legacy"]
      }
    };
    html2pdf().set(opt).from(element).save().then(() => {
      toast.success("Whitepaper downloaded successfully!");
    });
  };
  const scrollToSection = (index: number) => {
    setActiveSection(index);
    const element = document.getElementById(`section-${index}`);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
    setSidebarOpen(false);
  };
  const renderChart = (chartType: string | undefined) => {
    switch (chartType) {
      case "tokenDistribution":
        return <TokenDistributionChart />;
      case "marketGrowth":
        return <MarketGrowthChart />;
      case "transactionVolume":
        return <TransactionVolumeChart />;
      case "roadmap":
        return <RoadmapChart />;
      default:
        return null;
    }
  };
  // Front Cover Component
  const FrontCover = () => <div className="min-h-[600px] bg-gradient-to-br from-[#0a0a1a] via-[#1a0510] to-[#2d0a0a] rounded-2xl p-8 md:p-12 flex flex-col justify-between border border-primary/30 mb-8">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 rounded-full border border-primary/30 mb-8">
          <span className="text-primary text-sm font-semibold">Official Documentation</span>
        </div>
      </div>
      
      <div className="text-center flex-1 flex flex-col items-center justify-center">
        <img alt="Perfect Money" className="h-24 w-24 mx-auto mb-6" src="/lovable-uploads/7b5fd6b8-d8da-4c74-8293-111cf452fe53.png" />
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">PerfectMoney</h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-2">Whitepaper</p>
        <p className="text-primary text-lg">Version 1.0</p>
      </div>
      
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm border border-green-500/30">AAA Security Rating</span>
          <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm border border-blue-500/30">BSC Network</span>
          <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm border border-yellow-500/30">Multi-Audited</span>
        </div>
        <p className="text-gray-400 text-sm">December 2024</p>
      </div>
    </div>;

  // Back Cover Component
  const BackCover = () => <div className="min-h-[500px] bg-gradient-to-br from-[#0a0a1a] via-[#1a0510] to-[#2d0a0a] rounded-2xl p-8 md:p-12 flex flex-col justify-between border border-primary/30 mt-8">
      <div className="text-center flex-1 flex flex-col items-center justify-center">
        <img alt="Perfect Money" className="h-20 w-20 mx-auto mb-6 opacity-80" src="/lovable-uploads/23c2c067-8ba4-445e-bdb8-be4c8e2b7073.png" />
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Join the Future of Payments</h2>
        <p className="text-gray-300 max-w-md mx-auto mb-8">
          Be part of the decentralized payment revolution. Fast, secure, and borderless transactions for everyone.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 w-full max-w-2xl">
          <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
            <p className="text-2xl font-bold text-primary">100B</p>
            <p className="text-xs text-gray-400">Total Supply</p>
          </div>
          <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
            <p className="text-2xl font-bold text-green-400">AAA</p>
            <p className="text-xs text-gray-400">Security Rating</p>
          </div>
          <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
            <p className="text-2xl font-bold text-blue-400">0%</p>
            <p className="text-xs text-gray-400">Transaction Tax</p>
          </div>
          <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
            <p className="text-2xl font-bold text-yellow-400">&lt;5s</p>
            <p className="text-xs text-gray-400">Settlement Time</p>
          </div>
        </div>
      </div>
      
      <div className="text-center space-y-3">
        <p className="text-gray-300 font-semibold">Connect With Us</p>
        <div className="flex items-center justify-center gap-4 text-gray-400 text-sm">
          <span>perfectmoney.io</span>
          <span>•</span>
          <span>t.me/perfectmoney</span>
          <span>•</span>
          <span>@perfectmoney</span>
        </div>
        <p className="text-gray-500 text-xs pt-4">© 2024 PerfectMoney. All rights reserved.</p>
      </div>
    </div>;
  return <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <TradingViewTicker />
      <HeroBanner title="Whitepaper" subtitle="Technical documentation and comprehensive overview of the PerfectMoney ecosystem" />

      <main className="container mx-auto px-4 pt-12 pb-12">
        {/* Front Cover */}
        <FrontCover />
        <div className="flex gap-6 relative">
          {/* Mobile Sidebar Toggle */}
          <Button variant="outline" size="icon" className="fixed top-24 left-4 z-40 lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>

          {/* Sidebar */}
          <aside className={`fixed lg:sticky lg:top-24 lg:h-[calc(100vh-6rem)] w-64 bg-card/95 backdrop-blur-sm border-r border-border overflow-y-auto z-30 transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} top-0 left-0 h-screen pt-20 lg:pt-0`}>
            <div className="p-4 sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border z-10">
              <div className="flex items-center gap-2 mb-4">
                <img alt="PM Logo" className="h-8 w-8" src="/lovable-uploads/8d6b7189-77e6-4567-916b-77801109a823.png" />
                <h3 className="font-bold">Contents</h3>
              </div>
              <Button variant="gradient" size="sm" className="w-full gap-2" onClick={handleDownloadPDF}>
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            </div>

            <nav className="p-4 space-y-1">
              {sections.map((section, index) => <button key={index} onClick={() => scrollToSection(index)} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${activeSection === index ? "bg-primary/20 text-primary font-medium" : "hover:bg-muted text-muted-foreground"}`}>
                  {section.title}
                </button>)}
            </nav>
          </aside>

          {/* Overlay for mobile */}
          {sidebarOpen && <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}

          {/* Main Content */}
          <div className="flex-1 max-w-4xl">
            {/* PDF Content */}
            <div id="whitepaper-content" className="space-y-8">
              {sections.map((section, index) => <Card key={index} id={`section-${index}`} className="p-6 md:p-8 bg-card/50 backdrop-blur-sm scroll-mt-24 border-l-4 border-primary/50 hover:border-primary transition-colors">
                  <h2 className="text-2xl font-bold mb-4 text-primary">{section.title}</h2>
                  <p className="text-muted-foreground leading-relaxed text-justify mb-6">{section.content}</p>

                  {/* Render chart if specified */}
                  {section.chart && renderChart(section.chart)}

                  {section.tables && section.tables.map((table, tableIndex) => <div key={tableIndex} className="mt-6">
                        <h3 className="text-lg font-semibold mb-3 text-foreground">{table.title}</h3>
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-1/2">Item</TableHead>
                                <TableHead>Details</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {table.rows.map((row, rowIndex) => <TableRow key={rowIndex}>
                                  <TableCell className="font-medium">{row.label}</TableCell>
                                  <TableCell className="text-muted-foreground">{row.value}</TableCell>
                                </TableRow>)}
                            </TableBody>
                          </Table>
                        </div>
                      </div>)}
                </Card>)}

              {/* Additional Stats Card */}
              <Card className="p-6 md:p-8 bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-sm border-primary/30">
                <h2 className="text-2xl font-bold mb-6 text-center">Key Metrics at a Glance</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-card/50 rounded-lg">
                    <p className="text-3xl font-bold text-primary">100B</p>
                    <p className="text-sm text-muted-foreground">Total Supply</p>
                  </div>
                  <div className="text-center p-4 bg-card/50 rounded-lg">
                    <p className="text-3xl font-bold text-green-500">0%</p>
                    <p className="text-sm text-muted-foreground">Transaction Fee</p>
                  </div>
                  <div className="text-center p-4 bg-card/50 rounded-lg">
                    <p className="text-3xl font-bold text-blue-500">&lt;5s</p>
                    <p className="text-sm text-muted-foreground">Settlement Time</p>
                  </div>
                  <div className="text-center p-4 bg-card/50 rounded-lg">
                    <p className="text-3xl font-bold text-cyan-500">94.83</p>
                    <p className="text-sm text-muted-foreground">Security Score</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
        
        {/* Back Cover */}
        <BackCover />
      </main>

      <Footer />
      <MobileBottomNav />
    </div>;
};
export default Whitepaper;