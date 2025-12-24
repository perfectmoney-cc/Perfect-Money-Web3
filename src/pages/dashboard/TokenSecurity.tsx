import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { TradingViewTicker } from "@/components/TradingViewTicker";
import { HeroBanner } from "@/components/HeroBanner";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Footer } from "@/components/Footer";
import { WalletCard } from "@/components/WalletCard";
import { HexagonAuditScore } from "@/components/HexagonAuditScore";
import { SecurityBadge } from "@/components/SecurityBadge";
import { PaymentComparisonTable } from "@/components/PaymentComparisonTable";
import { ArrowLeft, CheckCircle, AlertTriangle, ExternalLink, XCircle, AlertCircle, Download, FileText, Shield, Copy } from "lucide-react";
import { Link } from "react-router-dom";
import { PM_TOKEN_ADDRESS } from "@/contracts/addresses";
import certikLogo from "@/assets/certik-logo.png";
import goplusLogo from "@/assets/goplus-logo.png";
import solidityscanLogo from "@/assets/solidityscan-logo.png";
import pmLogo from "@/assets/pm-logo-new.png";
import html2pdf from "html2pdf.js";
import { toast } from "sonner";
const auditCategories = [{
  name: "Code Security",
  value: 95,
  maxValue: 100
}, {
  name: "Operational",
  value: 92,
  maxValue: 100
}, {
  name: "Market",
  value: 98,
  maxValue: 100
}, {
  name: "Community",
  value: 88,
  maxValue: 100
}, {
  name: "Governance",
  value: 90,
  maxValue: 100
}, {
  name: "Fundamental",
  value: 96,
  maxValue: 100
}];
const TokenSecurityPage = () => {
  const pdfContentRef = useRef<HTMLDivElement>(null);
  const certikScanItems = [{
    item: "Major Holder Ratio",
    result: "100.00%",
    status: "attention",
    description: "Major holders ratio (excluding exchanges and locked addresses)"
  }, {
    item: "Ownership Not Renounced",
    result: "Owner privilege has not been renounced",
    status: "attention",
    description: "Centralization"
  }, {
    item: "Buy Tax",
    result: "0%",
    status: "passed",
    description: "Market"
  }, {
    item: "Can Modify Balance",
    result: "Token balance cannot be modified",
    status: "passed",
    description: "Centralization"
  }, {
    item: "Can Modify Tax",
    result: "Token tax cannot be modified",
    status: "passed",
    description: "Centralization"
  }, {
    item: "Can Regain Ownership",
    result: "Backdoor not found",
    status: "passed",
    description: "Centralization"
  }, {
    item: "Can Self Destruct",
    result: "Self-destruct function not found",
    status: "passed",
    description: "Rugpull"
  }, {
    item: "Cannot Buy",
    result: "Buy restriction not detected",
    status: "passed",
    description: "Market"
  }, {
    item: "Cannot Sell All",
    result: "Sell all restriction not detected",
    status: "passed",
    description: "Market"
  }, {
    item: "Has Blacklist",
    result: "Token blacklist not found",
    status: "passed",
    description: "Centralization"
  }, {
    item: "Has External Calls",
    result: "External calls not found",
    status: "passed",
    description: "General"
  }, {
    item: "Has Hidden Owner",
    result: "Hidden owner not found",
    status: "passed",
    description: "Centralization"
  }, {
    item: "Has Whitelist",
    result: "Token whitelist not found",
    status: "passed",
    description: "Centralization"
  }, {
    item: "Is Anti Whale",
    result: "Anti whale mechanisms not found",
    status: "passed",
    description: "Market"
  }, {
    item: "Is Honeypot",
    result: "Honeypot risk not found",
    status: "passed",
    description: "Rugpull"
  }, {
    item: "Is Mintable",
    result: "Mintable function not found",
    status: "passed",
    description: "Centralization"
  }, {
    item: "Is Proxy Contract",
    result: "Token is not a proxy contract",
    status: "passed",
    description: "Centralization"
  }, {
    item: "Is Transfer Cooldown",
    result: "Transfer cooldown not found",
    status: "passed",
    description: "Centralization"
  }, {
    item: "Is Transfer Pausable",
    result: "Transfer pausable not found",
    status: "passed",
    description: "Centralization"
  }, {
    item: "Open Source",
    result: "Token is open source",
    status: "passed",
    description: "Transparency"
  }, {
    item: "Sell Tax",
    result: "0%",
    status: "passed",
    description: "Market"
  }];
  const goplusScanItems = [{
    item: "Contract Source Code Verified",
    result: "Open source verified",
    status: "passed"
  }, {
    item: "No Proxy",
    result: "No proxy in the contract",
    status: "passed"
  }, {
    item: "No Mint Function",
    result: "Mint function transparent or non-existent",
    status: "passed"
  }, {
    item: "No Ownership Retrieval",
    result: "Cannot regain ownership",
    status: "passed"
  }, {
    item: "Owner Can't Change Balance",
    result: "Cannot modify balance at other addresses",
    status: "passed"
  }, {
    item: "No Hidden Owner",
    result: "No hidden owner address found",
    status: "passed"
  }, {
    item: "No Self Destruct",
    result: "No self-destruct function found",
    status: "passed"
  }, {
    item: "No External Call Risk",
    result: "No external calls found",
    status: "passed"
  }, {
    item: "Not a Gas Abuser",
    result: "No gas abuse activity found",
    status: "passed"
  }, {
    item: "Buy Tax",
    result: "0.00%",
    status: "passed"
  }, {
    item: "Sell Tax",
    result: "0.00%",
    status: "passed"
  }, {
    item: "Not a Honeypot",
    result: "No malicious code found",
    status: "passed"
  }, {
    item: "No Trading Suspension",
    result: "No suspendable code included",
    status: "passed"
  }, {
    item: "Can Sell All Tokens",
    result: "No maximum sell ratio",
    status: "passed"
  }, {
    item: "Token Can Be Bought",
    result: "No buy restriction",
    status: "passed"
  }, {
    item: "No Trading Cooldown",
    result: "No cooldown function",
    status: "passed"
  }, {
    item: "No Anti Whale Limit",
    result: "Unlimited transactions",
    status: "passed"
  }, {
    item: "Anti Whale Not Modifiable",
    result: "Cannot be modified",
    status: "passed"
  }, {
    item: "Tax Cannot Be Modified",
    result: "Owner cannot change tax",
    status: "passed"
  }, {
    item: "No Blacklist",
    result: "Blacklist function not included",
    status: "passed"
  }, {
    item: "No Whitelist",
    result: "Whitelist function not included",
    status: "passed"
  }, {
    item: "No Personal Tax Changes",
    result: "No address-specific tax changes",
    status: "passed"
  }];
  const solidityScanItems = [{
    item: "Source Code Verified",
    result: "Verified",
    status: "passed",
    description: "Contract source code is verified on block explorer"
  }, {
    item: "No Mint Function",
    result: "Not detected",
    status: "passed",
    description: "Token supply is fixed"
  }, {
    item: "Presence of Burn Function",
    result: "Detected",
    status: "attention",
    description: "Tokens can be burned in this contract"
  }, {
    item: "Solidity Pragma Version",
    result: "Safe",
    status: "passed",
    description: "Cannot be compiled with older vulnerable versions"
  }, {
    item: "Proxy-Based Upgradable",
    result: "Not upgradable",
    status: "passed",
    description: "This is not an upgradable contract"
  }, {
    item: "Blacklist Function",
    result: "Not found",
    status: "passed",
    description: "Owners cannot blacklist tokens or users"
  }, {
    item: "ERC-20 Standard",
    result: "Compliant",
    status: "passed",
    description: "Contract follows ERC-20 standard"
  }, {
    item: "Pausable Contract",
    result: "Not pausable",
    status: "passed",
    description: "This is not a Pausable contract"
  }, {
    item: "Self Destruct",
    result: "Not found",
    status: "passed",
    description: "Contract cannot be self-destructed"
  }, {
    item: "ERC20 Race Condition",
    result: "Vulnerable",
    status: "warning",
    description: "Approve function race condition vulnerability"
  }, {
    item: "Renounced Ownership",
    result: "Not renounced",
    status: "attention",
    description: "Administrator has not renounced ownership"
  }, {
    item: "Major Holder Ratio",
    result: ">20%",
    status: "attention",
    description: "Some addresses hold more than 20% of supply"
  }, {
    item: "Overpowered Owners",
    result: "2 functions",
    status: "warning",
    description: "Contracts use 2 owner-only functions"
  }, {
    item: "No Cooldown Function",
    result: "Not found",
    status: "passed",
    description: "No trading cooldown mechanism"
  }, {
    item: "Whitelist Function",
    result: "Not found",
    status: "passed",
    description: "Owners cannot whitelist tokens/users"
  }, {
    item: "Fee Modification",
    result: "Cannot modify",
    status: "passed",
    description: "Owners cannot set or update fees"
  }, {
    item: "Hardcoded Addresses",
    result: "Not found",
    status: "passed",
    description: "Contract does not hardcode addresses"
  }, {
    item: "Owner Balance Modification",
    result: "Cannot modify",
    status: "passed",
    description: "No owner-controlled balance modification"
  }, {
    item: "Hidden Owner",
    result: "Not found",
    status: "passed",
    description: "No hidden owner roles detected"
  }, {
    item: "External Call Risk",
    result: "Not found",
    status: "passed",
    description: "No external call risks in critical functions"
  }];
  const contractAddress = PM_TOKEN_ADDRESS;
  const deployerAddress = "0x326d35Cc6634C0532925a3b844Bc9e7595f0b90B";
  const ownerAddress = "0x326d35Cc6634C0532925a3b844Bc9e7595f0b90B";
  const handleDownloadPDF = () => {
    const element = pdfContentRef.current;
    if (!element) return;
    toast.info("Generating PDF report...");
    const clonedElement = element.cloneNode(true) as HTMLElement;
    clonedElement.style.display = 'block';
    document.body.appendChild(clonedElement);
    const opt = {
      margin: 0,
      filename: 'PerfectMoney-Security-Audit-Report.pdf',
      image: {
        type: 'jpeg' as const,
        quality: 0.98
      },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true
      },
      jsPDF: {
        unit: 'mm' as const,
        format: 'a4' as const,
        orientation: 'portrait' as const
      },
      pagebreak: {
        mode: ['avoid-all', 'css', 'legacy']
      }
    };
    html2pdf().set(opt).from(clonedElement).save().then(() => {
      document.body.removeChild(clonedElement);
      toast.success("Audit report downloaded successfully!");
    });
  };
  return <div className="min-h-screen bg-background flex flex-col pb-20 lg:pb-0">
      <Header />
      <TradingViewTicker />
      <HeroBanner title="Token Security" subtitle="Comprehensive security audit and contract verification" />
      
      <main className="container mx-auto px-4 pt-12 pb-12 flex-1">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 text-sm">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="max-w-6xl mx-auto space-y-8">
          {/* Wallet Card */}
          <WalletCard compact={true} />

          {/* Security Scores Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Skynet Certik Score */}
            <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border-slate-600/30">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img src={certikLogo} alt="CertiK" className="h-12 w-12 rounded-lg" />
                  <div>
                    <h3 className="text-lg font-bold">Skynet CertiK</h3>
                    <p className="text-sm text-muted-foreground">Token Scanner</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-400">95/100</div>
                  <p className="text-xs text-muted-foreground">Score</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs mb-4">
                <span className="flex items-center gap-1 text-red-500"><XCircle className="h-3 w-3" /> 0 Alerts</span>
                <span className="flex items-center gap-1 text-yellow-500"><AlertCircle className="h-3 w-3" /> 2 Attentions</span>
                <span className="flex items-center gap-1 text-green-500"><CheckCircle className="h-3 w-3" /> 20 Passed</span>
              </div>
              <a href="https://skynet.certik.com/tools/token-scan/bsc/0x181108f76d9910569203b5d59eb14Bc31961a989" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium">
                View Full Report <ExternalLink className="h-4 w-4" />
              </a>
            </Card>

            {/* GoPlus Score */}
            <Card className="p-6 bg-gradient-to-br from-green-500/10 to-green-500/5 backdrop-blur-sm border-green-500/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img src={goplusLogo} alt="GoPlus" className="h-12 w-12 rounded-xl" />
                  <div>
                    <h3 className="font-bold text-lg">GoPlus Labs</h3>
                    <p className="text-muted-foreground text-xs">Security Scanner</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-500">100/100</div>
                  <p className="text-xs text-muted-foreground">Score</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs mb-4">
                <span className="flex items-center gap-1 text-green-500"><CheckCircle className="h-3 w-3" /> 0 Risky Items</span>
                <span className="flex items-center gap-1 text-green-500"><CheckCircle className="h-3 w-3" /> 0 Attention Items</span>
              </div>
              <a href="https://gopluslabs.io/token-security/56/0x181108f76d9910569203b5d59eb14Bc31961a989" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium">
                View Full Report <ExternalLink className="h-4 w-4" />
              </a>
            </Card>

            {/* SolidityScan Score */}
            <Card className="p-6 bg-gradient-to-br from-cyan-500/10 to-emerald-500/10 backdrop-blur-sm border-cyan-500/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img src={solidityscanLogo} alt="SolidityScan" className="h-12 w-12 rounded-lg" />
                  <div>
                    <h3 className="font-bold text-lg my-0">Solidity
Scan</h3>
                    <p className="text-muted-foreground text-xs">Security Analysis</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-cyan-400">89/100</div>
                  <p className="text-xs text-muted-foreground">Score</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs mb-4">
                <span className="flex items-center gap-1 text-red-500"><XCircle className="h-3 w-3" /> 0 Critical</span>
                <span className="flex items-center gap-1 text-orange-500"><AlertCircle className="h-3 w-3" /> 2 Medium</span>
                <span className="flex items-center gap-1 text-yellow-500"><AlertCircle className="h-3 w-3" /> 3 Low</span>
              </div>
              <a href="https://solidityscan.com/quickscan/0x181108f76d9910569203b5d59eb14Bc31961a989/bsc" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium">
                View Full Report <ExternalLink className="h-4 w-4" />
              </a>
            </Card>
          </div>

          {/* Token Overview */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm">
            <h2 className="text-xl font-bold mb-4">Token Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 border border-border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Token Name</p>
                <p className="font-bold">Perfect Money (PM)</p>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Network</p>
                <p className="font-bold">BSC (BEP-20)</p>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Lines of Code</p>
                <p className="font-bold">127</p>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Contract Verified</p>
                <p className="font-bold text-green-500 flex items-center gap-1"><CheckCircle className="h-4 w-4" /> Yes</p>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-border rounded-lg gap-2">
                <span className="text-muted-foreground">Token Address</span>
                <code className="font-mono text-sm break-all">{contractAddress}</code>
              </div>
              <div className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-border rounded-lg gap-2">
                <span className="text-muted-foreground">Deployer Address</span>
                <code className="font-mono text-sm break-all">{deployerAddress}</code>
              </div>
              <div className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-border rounded-lg gap-2">
                <span className="text-muted-foreground">Owner Address</span>
                <code className="font-mono text-sm break-all">{ownerAddress}</code>
              </div>
            </div>
          </Card>

          {/* CertiK Scan Results */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Skynet CertiK Scan Results</h2>
              <a href="https://skynet.certik.com/tools/token-scan/bsc/0x181108f76d9910569203b5d59eb14Bc31961a989" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm flex items-center gap-1">
                View Report <ExternalLink className="h-4 w-4" />
              </a>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {certikScanItems.map((item, idx) => <div key={idx} className="flex items-center justify-between p-3 border border-border rounded-lg hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-3">
                    {item.status === "passed" ? <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" /> : <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0" />}
                    <div>
                      <p className="font-medium text-sm">{item.item}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                  <span className={`text-sm ${item.status === "passed" ? "text-green-500" : "text-yellow-500"}`}>
                    {item.result}
                  </span>
                </div>)}
            </div>
          </Card>

          {/* GoPlus Scan Results */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">GoPlus Labs Scan Results</h2>
              <a href="https://gopluslabs.io/token-security/56/0x181108f76d9910569203b5d59eb14Bc31961a989" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm flex items-center gap-1">
                View Report <ExternalLink className="h-4 w-4" />
              </a>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {goplusScanItems.map((item, idx) => <div key={idx} className="flex items-center justify-between p-3 border border-border rounded-lg hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <p className="font-medium text-sm">{item.item}</p>
                  </div>
                  <span className="text-sm text-green-500">{item.result}</span>
                </div>)}
            </div>
          </Card>

          {/* SolidityScan Results */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">SolidityScan Results</h2>
              <a href="https://solidityscan.com/quickscan/0x181108f76d9910569203b5d59eb14Bc31961a989/bsc" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm flex items-center gap-1">
                View Report <ExternalLink className="h-4 w-4" />
              </a>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-4">
              <div className="p-3 border border-red-500/30 rounded-lg bg-red-500/5 text-center">
                <p className="text-xs text-muted-foreground">Critical</p>
                <p className="text-xl font-bold text-red-500">0</p>
              </div>
              <div className="p-3 border border-orange-500/30 rounded-lg bg-orange-500/5 text-center">
                <p className="text-xs text-muted-foreground">High</p>
                <p className="text-xl font-bold text-orange-500">0</p>
              </div>
              <div className="p-3 border border-yellow-500/30 rounded-lg bg-yellow-500/5 text-center">
                <p className="text-xs text-muted-foreground">Medium</p>
                <p className="text-xl font-bold text-yellow-500">2</p>
              </div>
              <div className="p-3 border border-blue-500/30 rounded-lg bg-blue-500/5 text-center">
                <p className="text-xs text-muted-foreground">Low</p>
                <p className="text-xl font-bold text-blue-500">3</p>
              </div>
              <div className="p-3 border border-slate-500/30 rounded-lg bg-slate-500/5 text-center">
                <p className="text-xs text-muted-foreground">Info</p>
                <p className="text-xl font-bold text-slate-400">80</p>
              </div>
              <div className="p-3 border border-gray-500/30 rounded-lg bg-gray-500/5 text-center">
                <p className="text-xs text-muted-foreground">Gas</p>
                <p className="text-xl font-bold text-gray-400">18</p>
              </div>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {solidityScanItems.map((item, idx) => <div key={idx} className="flex items-center justify-between p-3 border border-border rounded-lg hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-3">
                    {item.status === "passed" ? <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" /> : item.status === "warning" ? <XCircle className="h-5 w-5 text-orange-500 flex-shrink-0" /> : <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0" />}
                    <div>
                      <p className="font-medium text-sm">{item.item}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                  <span className={`text-sm ${item.status === "passed" ? "text-green-500" : item.status === "warning" ? "text-orange-500" : "text-yellow-500"}`}>
                    {item.result}
                  </span>
                </div>)}
            </div>
          </Card>

          {/* Threat Analysis */}
          

          {/* Honeypot Risk Section */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm">
            <h2 className="text-xl font-bold mb-4">Honeypot Risk Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border border-green-500/30 rounded-lg bg-green-500/5 text-center">
                <p className="text-sm text-muted-foreground mb-2">Buy Tax</p>
                <p className="text-2xl font-bold text-green-500">0.00%</p>
              </div>
              <div className="p-4 border border-green-500/30 rounded-lg bg-green-500/5 text-center">
                <p className="text-sm text-muted-foreground mb-2">Sell Tax</p>
                <p className="text-2xl font-bold text-green-500">0.00%</p>
              </div>
              <div className="p-4 border border-green-500/30 rounded-lg bg-green-500/5 text-center">
                <p className="text-sm text-muted-foreground mb-2">Transfer Tax</p>
                <p className="text-2xl font-bold text-green-500">0.00%</p>
              </div>
              <div className="p-4 border border-green-500/30 rounded-lg bg-green-500/5 text-center">
                <p className="text-sm text-muted-foreground mb-2">Honeypot Status</p>
                <p className="text-lg font-bold text-green-500 flex items-center justify-center gap-1">
                  <CheckCircle className="h-5 w-5" /> Not Detected
                </p>
              </div>
            </div>
          </Card>

          {/* Overall Audit Analysis with Hexagon Score */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-sm">Overall Audit Analysis</h2>
              <Button onClick={handleDownloadPDF} variant="gradient" className="gap-2">
                <Download className="h-4 w-4" />
                Download Report  
              </Button>
            </div>
            <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
              {/* Hexagon Audit Score */}
              <HexagonAuditScore score={95.33} grade="AAA" categories={auditCategories} />

              {/* Score Breakdown */}
              <div className="space-y-4 max-w-md">
                {/* Score Categories with Progress Bars */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">CertiK Score</span>
                      <span className="font-semibold text-blue-600">95/100</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div style={{
                      width: '95%'
                    }} className="h-full rounded-full animate-[slideIn_1.5s_ease-out] bg-primary" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">GoPlus Score</span>
                      <span className="font-semibold text-blue-600">100/100</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-blue-800 rounded-full animate-[slideIn_1.8s_ease-out]" style={{
                      width: '100%'
                    }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">SolidityScan Score</span>
                      <span className="font-semibold text-yellow-500">89.49/100</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-500 rounded-full animate-[slideIn_2s_ease-out]" style={{
                      width: '89.49%'
                    }} />
                    </div>
                  </div>
                </div>

                {/* Issue Summary */}
                <div className="flex flex-wrap items-center mt-4 text-sm gap-0">
                  <span className="flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-500 rounded text-xs">
                    <XCircle className="h-3 w-3" /> 0 Critical
                  </span>
                  <span className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-500 rounded text-xs">
                    <AlertCircle className="h-3 w-3" /> 4 Warnings
                  </span>
                  <span className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-500 rounded text-xs">
                    <CheckCircle className="h-3 w-3" /> 58 Passed
                  </span>
                </div>

                {/* Grade Scale */}
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2">Grade Scale</p>
                  <div className="flex flex-wrap text-xs gap-0">
                    <span className="px-2 py-0.5 bg-green-500/30 text-green-400 rounded">AAA+</span>
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-500 rounded font-bold border border-green-500">AAA</span>
                    <span className="px-2 py-0.5 bg-green-600/20 text-green-600 rounded">AAA-</span>
                    <span className="px-2 py-0.5 bg-lime-500/20 text-lime-500 rounded">AA</span>
                    <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-500 rounded">A</span>
                    <span className="px-2 py-0.5 bg-orange-500/20 text-orange-500 rounded">B</span>
                    <span className="px-2 py-0.5 bg-red-500/20 text-red-500 rounded">C</span>
                    <span className="px-2 py-0.5 bg-red-700/20 text-red-700 rounded">D</span>
                    <span className="px-2 py-0.5 bg-gray-500/20 text-gray-500 rounded">E</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Security Badge for Merchants */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">Security Badge</h2>
                <p className="text-sm text-muted-foreground">Embed on your merchant website</p>
              </div>
              <Shield className="h-8 w-8 text-green-500" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center gap-4 p-4 border border-border rounded-lg">
                <SecurityBadge variant="light" size="md" />
                <span className="text-xs text-muted-foreground">Light Badge</span>
              </div>
              <div className="flex flex-col items-center gap-4 p-4 bg-[#0a0e1a] border border-border rounded-lg">
                <SecurityBadge variant="dark" size="md" />
                <span className="text-xs text-muted-foreground">Dark Badge</span>
              </div>
              <div className="flex flex-col items-center gap-4 p-4 border border-border rounded-lg">
                <SecurityBadge variant="inline" />
                <span className="text-xs text-muted-foreground">Inline Badge</span>
              </div>
            </div>
            <div className="mt-6 p-4 bg-muted/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Embed Code:</p>
                <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => {
                navigator.clipboard.writeText(`<a href="${window.location.origin}/dashboard/token-security"><img src="${window.location.origin}/pm-token-logo-new.png" alt="Perfect Money AAA Verified" style="height:40px" /></a>`);
                toast.success("Embed code copied!");
              }}>
                  <Copy className="h-3 w-3" /> Copy
                </Button>
              </div>
              <code className="text-xs bg-muted px-3 py-2 rounded block overflow-x-auto">
                {`<a href="${window.location.origin}/dashboard/token-security"><img src="${window.location.origin}/pm-token-logo-new.png" alt="Perfect Money AAA Verified" style="height:40px" /></a>`}
              </code>
            </div>
          </Card>

          {/* Payment Comparison Table */}
          <PaymentComparisonTable />
        </div>

        {/* Hidden PDF Content for Export */}
        <div ref={pdfContentRef} className="hidden">
          <div style={{
          fontFamily: 'Arial, sans-serif',
          color: '#333'
        }}>
            {/* Front Cover */}
            <div style={{
            height: '297mm',
            background: 'linear-gradient(135deg, #1a1f3c 0%, #E53E3E 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '40px',
            pageBreakAfter: 'always'
          }}>
              <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '30px'
            }}>
                <img src={pmLogo} alt="PM Logo" style={{
                width: '80px',
                height: '80px'
              }} />
              </div>
              <h1 style={{
              color: 'white',
              fontSize: '48px',
              fontWeight: 'bold',
              marginBottom: '10px',
              textAlign: 'center'
            }}>
                PERFECT MONEY
              </h1>
              <p style={{
              color: 'rgba(255,255,255,0.9)',
              fontSize: '24px',
              marginBottom: '60px'
            }}>
                Security Audit Report
              </p>
              <div style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '20px',
              padding: '40px 60px',
              textAlign: 'center'
            }}>
                <p style={{
                color: 'rgba(255,255,255,0.8)',
                fontSize: '16px',
                marginBottom: '10px'
              }}>Overall Score</p>
                <p style={{
                color: 'white',
                fontSize: '72px',
                fontWeight: 'bold',
                marginBottom: '5px'
              }}>94.83</p>
                <p style={{
                color: '#22c55e',
                fontSize: '36px',
                fontWeight: 'bold',
                background: 'rgba(34,197,94,0.2)',
                padding: '5px 30px',
                borderRadius: '20px',
                display: 'inline-block'
              }}>AAA</p>
              </div>
              <div style={{
              marginTop: '60px',
              color: 'rgba(255,255,255,0.7)',
              textAlign: 'center'
            }}>
                <p style={{
                fontSize: '14px'
              }}>Contract Address</p>
                <p style={{
                fontSize: '12px',
                fontFamily: 'monospace'
              }}>{PM_TOKEN_ADDRESS}</p>
                <p style={{
                fontSize: '14px',
                marginTop: '20px'
              }}>Report Date: {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            {/* Executive Summary Page */}
            <div style={{
            padding: '40px',
            pageBreakAfter: 'always'
          }}>
              <h2 style={{
              color: '#E53E3E',
              fontSize: '28px',
              borderBottom: '2px solid #E53E3E',
              paddingBottom: '10px',
              marginBottom: '30px'
            }}>
                Executive Summary
              </h2>
              <div style={{
              background: '#f8f9fa',
              padding: '20px',
              borderRadius: '10px',
              marginBottom: '30px'
            }}>
                <p style={{
                fontSize: '14px',
                lineHeight: '1.8'
              }}>
                  This security audit report provides a comprehensive analysis of the Perfect Money (PM) token smart contract 
                  deployed on the Binance Smart Chain. The audit was conducted using multiple industry-leading security 
                  analysis tools to ensure thorough coverage of potential vulnerabilities.
                </p>
              </div>
              
              <h3 style={{
              fontSize: '20px',
              marginBottom: '15px'
            }}>Audit Providers</h3>
              <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginBottom: '30px'
            }}>
                <thead>
                  <tr style={{
                  background: '#1a1f3c',
                  color: 'white'
                }}>
                    <th style={{
                    padding: '12px',
                    textAlign: 'left',
                    border: '1px solid #ddd'
                  }}>Provider</th>
                    <th style={{
                    padding: '12px',
                    textAlign: 'center',
                    border: '1px solid #ddd'
                  }}>Score</th>
                    <th style={{
                    padding: '12px',
                    textAlign: 'center',
                    border: '1px solid #ddd'
                  }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{
                    padding: '12px',
                    border: '1px solid #ddd'
                  }}>Skynet CertiK</td>
                    <td style={{
                    padding: '12px',
                    textAlign: 'center',
                    border: '1px solid #ddd',
                    color: '#3b82f6',
                    fontWeight: 'bold'
                  }}>95/100</td>
                    <td style={{
                    padding: '12px',
                    textAlign: 'center',
                    border: '1px solid #ddd',
                    color: '#22c55e'
                  }}>✓ Passed</td>
                  </tr>
                  <tr style={{
                  background: '#f8f9fa'
                }}>
                    <td style={{
                    padding: '12px',
                    border: '1px solid #ddd'
                  }}>GoPlus Labs</td>
                    <td style={{
                    padding: '12px',
                    textAlign: 'center',
                    border: '1px solid #ddd',
                    color: '#22c55e',
                    fontWeight: 'bold'
                  }}>100/100</td>
                    <td style={{
                    padding: '12px',
                    textAlign: 'center',
                    border: '1px solid #ddd',
                    color: '#22c55e'
                  }}>✓ Passed</td>
                  </tr>
                  <tr>
                    <td style={{
                    padding: '12px',
                    border: '1px solid #ddd'
                  }}>SolidityScan</td>
                    <td style={{
                    padding: '12px',
                    textAlign: 'center',
                    border: '1px solid #ddd',
                    color: '#06b6d4',
                    fontWeight: 'bold'
                  }}>89.49/100</td>
                    <td style={{
                    padding: '12px',
                    textAlign: 'center',
                    border: '1px solid #ddd',
                    color: '#22c55e'
                  }}>✓ Passed</td>
                  </tr>
                </tbody>
              </table>

              <h3 style={{
              fontSize: '20px',
              marginBottom: '15px'
            }}>Token Information</h3>
              <table style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}>
                <tbody>
                  <tr><td style={{
                    padding: '10px',
                    border: '1px solid #ddd',
                    fontWeight: 'bold'
                  }}>Token Name</td><td style={{
                    padding: '10px',
                    border: '1px solid #ddd'
                  }}>Perfect Money (PM)</td></tr>
                  <tr style={{
                  background: '#f8f9fa'
                }}><td style={{
                    padding: '10px',
                    border: '1px solid #ddd',
                    fontWeight: 'bold'
                  }}>Network</td><td style={{
                    padding: '10px',
                    border: '1px solid #ddd'
                  }}>BSC (BEP-20)</td></tr>
                  <tr><td style={{
                    padding: '10px',
                    border: '1px solid #ddd',
                    fontWeight: 'bold'
                  }}>Contract Address</td><td style={{
                    padding: '10px',
                    border: '1px solid #ddd',
                    fontFamily: 'monospace',
                    fontSize: '12px'
                  }}>{PM_TOKEN_ADDRESS}</td></tr>
                  <tr style={{
                  background: '#f8f9fa'
                }}><td style={{
                    padding: '10px',
                    border: '1px solid #ddd',
                    fontWeight: 'bold'
                  }}>Total Supply</td><td style={{
                    padding: '10px',
                    border: '1px solid #ddd'
                  }}>100,000,000,000 PM</td></tr>
                  <tr><td style={{
                    padding: '10px',
                    border: '1px solid #ddd',
                    fontWeight: 'bold'
                  }}>Decimals</td><td style={{
                    padding: '10px',
                    border: '1px solid #ddd'
                  }}>18</td></tr>
                  <tr style={{
                  background: '#f8f9fa'
                }}><td style={{
                    padding: '10px',
                    border: '1px solid #ddd',
                    fontWeight: 'bold'
                  }}>Contract Verified</td><td style={{
                    padding: '10px',
                    border: '1px solid #ddd',
                    color: '#22c55e'
                  }}>✓ Yes</td></tr>
                </tbody>
              </table>
            </div>

            {/* Detailed Analysis Page */}
            <div style={{
            padding: '40px',
            pageBreakAfter: 'always'
          }}>
              <h2 style={{
              color: '#E53E3E',
              fontSize: '28px',
              borderBottom: '2px solid #E53E3E',
              paddingBottom: '10px',
              marginBottom: '30px'
            }}>
                Detailed Security Analysis
              </h2>

              <h3 style={{
              fontSize: '18px',
              marginBottom: '15px',
              color: '#1a1f3c'
            }}>Vulnerability Summary</h3>
              <div style={{
              display: 'flex',
              gap: '15px',
              marginBottom: '30px',
              flexWrap: 'wrap'
            }}>
                <div style={{
                flex: 1,
                minWidth: '100px',
                background: '#fef2f2',
                border: '1px solid #fca5a5',
                borderRadius: '8px',
                padding: '15px',
                textAlign: 'center'
              }}>
                  <p style={{
                  fontSize: '12px',
                  color: '#b91c1c'
                }}>Critical</p>
                  <p style={{
                  fontSize: '28px',
                  fontWeight: 'bold',
                  color: '#dc2626'
                }}>0</p>
                </div>
                <div style={{
                flex: 1,
                minWidth: '100px',
                background: '#fff7ed',
                border: '1px solid #fed7aa',
                borderRadius: '8px',
                padding: '15px',
                textAlign: 'center'
              }}>
                  <p style={{
                  fontSize: '12px',
                  color: '#c2410c'
                }}>High</p>
                  <p style={{
                  fontSize: '28px',
                  fontWeight: 'bold',
                  color: '#ea580c'
                }}>0</p>
                </div>
                <div style={{
                flex: 1,
                minWidth: '100px',
                background: '#fefce8',
                border: '1px solid #fde047',
                borderRadius: '8px',
                padding: '15px',
                textAlign: 'center'
              }}>
                  <p style={{
                  fontSize: '12px',
                  color: '#a16207'
                }}>Medium</p>
                  <p style={{
                  fontSize: '28px',
                  fontWeight: 'bold',
                  color: '#eab308'
                }}>2</p>
                </div>
                <div style={{
                flex: 1,
                minWidth: '100px',
                background: '#eff6ff',
                border: '1px solid #93c5fd',
                borderRadius: '8px',
                padding: '15px',
                textAlign: 'center'
              }}>
                  <p style={{
                  fontSize: '12px',
                  color: '#1d4ed8'
                }}>Low</p>
                  <p style={{
                  fontSize: '28px',
                  fontWeight: 'bold',
                  color: '#3b82f6'
                }}>3</p>
                </div>
                <div style={{
                flex: 1,
                minWidth: '100px',
                background: '#f0fdf4',
                border: '1px solid #86efac',
                borderRadius: '8px',
                padding: '15px',
                textAlign: 'center'
              }}>
                  <p style={{
                  fontSize: '12px',
                  color: '#15803d'
                }}>Passed</p>
                  <p style={{
                  fontSize: '28px',
                  fontWeight: 'bold',
                  color: '#22c55e'
                }}>58</p>
                </div>
              </div>

              <h3 style={{
              fontSize: '18px',
              marginBottom: '15px',
              color: '#1a1f3c'
            }}>Security Checks Passed</h3>
              <ul style={{
              listStyle: 'none',
              padding: 0
            }}>
                {['No Honeypot Detected', 'No Mint Function', 'No Self-Destruct', 'No Hidden Owner', 'No Blacklist Function', 'No External Call Risk', 'No Trading Suspension', 'Open Source Verified', 'Buy Tax: 0%', 'Sell Tax: 0%'].map((item, idx) => <li key={idx} style={{
                padding: '8px 0',
                borderBottom: '1px solid #eee',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                    <span style={{
                  color: '#22c55e',
                  fontWeight: 'bold'
                }}>✓</span> {item}
                  </li>)}
              </ul>
            </div>

            {/* CertiK Analysis Page */}
            <div style={{
            padding: '40px',
            pageBreakAfter: 'always'
          }}>
              <h2 style={{
              color: '#E53E3E',
              fontSize: '28px',
              borderBottom: '2px solid #E53E3E',
              paddingBottom: '10px',
              marginBottom: '30px'
            }}>
                Skynet CertiK Analysis
              </h2>
              <div style={{
              background: '#f0f4ff',
              padding: '20px',
              borderRadius: '10px',
              marginBottom: '30px'
            }}>
                <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                  <h3 style={{
                  fontSize: '24px',
                  color: '#3b82f6'
                }}>Score: 95/100</h3>
                  <span style={{
                  background: '#22c55e',
                  color: 'white',
                  padding: '5px 15px',
                  borderRadius: '20px'
                }}>PASSED</span>
                </div>
              </div>
              
              <h3 style={{
              fontSize: '18px',
              marginBottom: '15px'
            }}>Scan Results</h3>
              <table style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}>
                <thead>
                  <tr style={{
                  background: '#1a1f3c',
                  color: 'white'
                }}>
                    <th style={{
                    padding: '10px',
                    textAlign: 'left',
                    border: '1px solid #ddd'
                  }}>Check</th>
                    <th style={{
                    padding: '10px',
                    textAlign: 'center',
                    border: '1px solid #ddd'
                  }}>Result</th>
                    <th style={{
                    padding: '10px',
                    textAlign: 'center',
                    border: '1px solid #ddd'
                  }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[{
                  check: 'Major Holder Ratio',
                  result: '100.00%',
                  status: 'attention'
                }, {
                  check: 'Buy Tax',
                  result: '0%',
                  status: 'passed'
                }, {
                  check: 'Sell Tax',
                  result: '0%',
                  status: 'passed'
                }, {
                  check: 'Can Modify Balance',
                  result: 'No',
                  status: 'passed'
                }, {
                  check: 'Can Modify Tax',
                  result: 'No',
                  status: 'passed'
                }, {
                  check: 'Can Regain Ownership',
                  result: 'No',
                  status: 'passed'
                }, {
                  check: 'Can Self Destruct',
                  result: 'No',
                  status: 'passed'
                }, {
                  check: 'Cannot Buy',
                  result: 'No Restriction',
                  status: 'passed'
                }, {
                  check: 'Cannot Sell All',
                  result: 'No Restriction',
                  status: 'passed'
                }, {
                  check: 'Has Blacklist',
                  result: 'No',
                  status: 'passed'
                }].map((item, idx) => <tr key={idx} style={{
                  background: idx % 2 === 0 ? '#fff' : '#f8f9fa'
                }}>
                      <td style={{
                    padding: '10px',
                    border: '1px solid #ddd'
                  }}>{item.check}</td>
                      <td style={{
                    padding: '10px',
                    textAlign: 'center',
                    border: '1px solid #ddd'
                  }}>{item.result}</td>
                      <td style={{
                    padding: '10px',
                    textAlign: 'center',
                    border: '1px solid #ddd',
                    color: item.status === 'passed' ? '#22c55e' : '#eab308'
                  }}>
                        {item.status === 'passed' ? '✓ Passed' : '⚠ Attention'}
                      </td>
                    </tr>)}
                </tbody>
              </table>
            </div>

            {/* CertiK Analysis Page 2 */}
            <div style={{
            padding: '40px',
            pageBreakAfter: 'always'
          }}>
              <h2 style={{
              color: '#E53E3E',
              fontSize: '28px',
              borderBottom: '2px solid #E53E3E',
              paddingBottom: '10px',
              marginBottom: '30px'
            }}>
                Skynet CertiK Analysis (Continued)
              </h2>
              <table style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}>
                <thead>
                  <tr style={{
                  background: '#1a1f3c',
                  color: 'white'
                }}>
                    <th style={{
                    padding: '10px',
                    textAlign: 'left',
                    border: '1px solid #ddd'
                  }}>Check</th>
                    <th style={{
                    padding: '10px',
                    textAlign: 'center',
                    border: '1px solid #ddd'
                  }}>Result</th>
                    <th style={{
                    padding: '10px',
                    textAlign: 'center',
                    border: '1px solid #ddd'
                  }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[{
                  check: 'Has External Calls',
                  result: 'No',
                  status: 'passed'
                }, {
                  check: 'Has Hidden Owner',
                  result: 'No',
                  status: 'passed'
                }, {
                  check: 'Has Whitelist',
                  result: 'No',
                  status: 'passed'
                }, {
                  check: 'Is Anti Whale',
                  result: 'No',
                  status: 'passed'
                }, {
                  check: 'Is Honeypot',
                  result: 'No',
                  status: 'passed'
                }, {
                  check: 'Is Mintable',
                  result: 'No',
                  status: 'passed'
                }, {
                  check: 'Is Proxy Contract',
                  result: 'No',
                  status: 'passed'
                }, {
                  check: 'Is Transfer Cooldown',
                  result: 'No',
                  status: 'passed'
                }, {
                  check: 'Is Transfer Pausable',
                  result: 'No',
                  status: 'passed'
                }, {
                  check: 'Open Source',
                  result: 'Yes',
                  status: 'passed'
                }].map((item, idx) => <tr key={idx} style={{
                  background: idx % 2 === 0 ? '#fff' : '#f8f9fa'
                }}>
                      <td style={{
                    padding: '10px',
                    border: '1px solid #ddd'
                  }}>{item.check}</td>
                      <td style={{
                    padding: '10px',
                    textAlign: 'center',
                    border: '1px solid #ddd'
                  }}>{item.result}</td>
                      <td style={{
                    padding: '10px',
                    textAlign: 'center',
                    border: '1px solid #ddd',
                    color: '#22c55e'
                  }}>✓ Passed</td>
                    </tr>)}
                </tbody>
              </table>
            </div>

            {/* GoPlus Analysis Page */}
            <div style={{
            padding: '40px',
            pageBreakAfter: 'always'
          }}>
              <h2 style={{
              color: '#E53E3E',
              fontSize: '28px',
              borderBottom: '2px solid #E53E3E',
              paddingBottom: '10px',
              marginBottom: '30px'
            }}>
                GoPlus Labs Security Analysis
              </h2>
              <div style={{
              background: '#f0fdf4',
              padding: '20px',
              borderRadius: '10px',
              marginBottom: '30px'
            }}>
                <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                  <h3 style={{
                  fontSize: '24px',
                  color: '#22c55e'
                }}>Score: 100/100</h3>
                  <span style={{
                  background: '#22c55e',
                  color: 'white',
                  padding: '5px 15px',
                  borderRadius: '20px'
                }}>PERFECT</span>
                </div>
              </div>
              
              <h3 style={{
              fontSize: '18px',
              marginBottom: '15px'
            }}>Security Assessment</h3>
              <table style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}>
                <thead>
                  <tr style={{
                  background: '#1a1f3c',
                  color: 'white'
                }}>
                    <th style={{
                    padding: '10px',
                    textAlign: 'left',
                    border: '1px solid #ddd'
                  }}>Security Check</th>
                    <th style={{
                    padding: '10px',
                    textAlign: 'center',
                    border: '1px solid #ddd'
                  }}>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {['Contract Source Code Verified', 'No Proxy Contract', 'No Mint Function', 'No Ownership Retrieval', 'Owner Cannot Change Balance', 'No Hidden Owner', 'No Self Destruct', 'No External Call Risk', 'Not a Gas Abuser', 'Buy Tax: 0.00%'].map((check, idx) => <tr key={idx} style={{
                  background: idx % 2 === 0 ? '#fff' : '#f8f9fa'
                }}>
                      <td style={{
                    padding: '10px',
                    border: '1px solid #ddd'
                  }}>{check}</td>
                      <td style={{
                    padding: '10px',
                    textAlign: 'center',
                    border: '1px solid #ddd',
                    color: '#22c55e'
                  }}>✓ Passed</td>
                    </tr>)}
                </tbody>
              </table>
            </div>

            {/* GoPlus Analysis Page 2 */}
            <div style={{
            padding: '40px',
            pageBreakAfter: 'always'
          }}>
              <h2 style={{
              color: '#E53E3E',
              fontSize: '28px',
              borderBottom: '2px solid #E53E3E',
              paddingBottom: '10px',
              marginBottom: '30px'
            }}>
                GoPlus Labs Security Analysis (Continued)
              </h2>
              <table style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}>
                <thead>
                  <tr style={{
                  background: '#1a1f3c',
                  color: 'white'
                }}>
                    <th style={{
                    padding: '10px',
                    textAlign: 'left',
                    border: '1px solid #ddd'
                  }}>Security Check</th>
                    <th style={{
                    padding: '10px',
                    textAlign: 'center',
                    border: '1px solid #ddd'
                  }}>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {['Sell Tax: 0.00%', 'Not a Honeypot', 'No Trading Suspension', 'Can Sell All Tokens', 'Token Can Be Bought', 'No Trading Cooldown', 'No Anti Whale Limit', 'Anti Whale Not Modifiable', 'Tax Cannot Be Modified', 'No Blacklist Function', 'No Whitelist Function', 'No Personal Tax Changes'].map((check, idx) => <tr key={idx} style={{
                  background: idx % 2 === 0 ? '#fff' : '#f8f9fa'
                }}>
                      <td style={{
                    padding: '10px',
                    border: '1px solid #ddd'
                  }}>{check}</td>
                      <td style={{
                    padding: '10px',
                    textAlign: 'center',
                    border: '1px solid #ddd',
                    color: '#22c55e'
                  }}>✓ Passed</td>
                    </tr>)}
                </tbody>
              </table>
            </div>

            {/* SolidityScan Analysis Page */}
            <div style={{
            padding: '40px',
            pageBreakAfter: 'always'
          }}>
              <h2 style={{
              color: '#E53E3E',
              fontSize: '28px',
              borderBottom: '2px solid #E53E3E',
              paddingBottom: '10px',
              marginBottom: '30px'
            }}>
                SolidityScan Security Analysis
              </h2>
              <div style={{
              background: '#ecfeff',
              padding: '20px',
              borderRadius: '10px',
              marginBottom: '30px'
            }}>
                <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                  <h3 style={{
                  fontSize: '24px',
                  color: '#06b6d4'
                }}>Score: 89.49/100</h3>
                  <span style={{
                  background: '#22c55e',
                  color: 'white',
                  padding: '5px 15px',
                  borderRadius: '20px'
                }}>PASSED</span>
                </div>
              </div>

              <h3 style={{
              fontSize: '18px',
              marginBottom: '15px'
            }}>Issue Breakdown</h3>
              <div style={{
              display: 'flex',
              gap: '10px',
              marginBottom: '30px',
              flexWrap: 'wrap'
            }}>
                <div style={{
                background: '#fef2f2',
                padding: '10px 20px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                  <p style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#dc2626'
                }}>0</p>
                  <p style={{
                  fontSize: '12px',
                  color: '#b91c1c'
                }}>Critical</p>
                </div>
                <div style={{
                background: '#fff7ed',
                padding: '10px 20px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                  <p style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#ea580c'
                }}>0</p>
                  <p style={{
                  fontSize: '12px',
                  color: '#c2410c'
                }}>High</p>
                </div>
                <div style={{
                background: '#fefce8',
                padding: '10px 20px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                  <p style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#eab308'
                }}>2</p>
                  <p style={{
                  fontSize: '12px',
                  color: '#a16207'
                }}>Medium</p>
                </div>
                <div style={{
                background: '#eff6ff',
                padding: '10px 20px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                  <p style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#3b82f6'
                }}>3</p>
                  <p style={{
                  fontSize: '12px',
                  color: '#1d4ed8'
                }}>Low</p>
                </div>
                <div style={{
                background: '#f1f5f9',
                padding: '10px 20px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                  <p style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#64748b'
                }}>80</p>
                  <p style={{
                  fontSize: '12px',
                  color: '#475569'
                }}>Informational</p>
                </div>
              </div>
              
              <table style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}>
                <thead>
                  <tr style={{
                  background: '#1a1f3c',
                  color: 'white'
                }}>
                    <th style={{
                    padding: '10px',
                    textAlign: 'left',
                    border: '1px solid #ddd'
                  }}>Check</th>
                    <th style={{
                    padding: '10px',
                    textAlign: 'center',
                    border: '1px solid #ddd'
                  }}>Result</th>
                    <th style={{
                    padding: '10px',
                    textAlign: 'center',
                    border: '1px solid #ddd'
                  }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[{
                  check: 'Source Code Verified',
                  result: 'Yes',
                  status: 'passed'
                }, {
                  check: 'No Mint Function',
                  result: 'Confirmed',
                  status: 'passed'
                }, {
                  check: 'Presence of Burn Function',
                  result: 'Detected',
                  status: 'attention'
                }, {
                  check: 'Solidity Pragma Version',
                  result: 'Safe',
                  status: 'passed'
                }, {
                  check: 'Proxy-Based Upgradable',
                  result: 'No',
                  status: 'passed'
                }, {
                  check: 'Blacklist Function',
                  result: 'Not Found',
                  status: 'passed'
                }].map((item, idx) => <tr key={idx} style={{
                  background: idx % 2 === 0 ? '#fff' : '#f8f9fa'
                }}>
                      <td style={{
                    padding: '10px',
                    border: '1px solid #ddd'
                  }}>{item.check}</td>
                      <td style={{
                    padding: '10px',
                    textAlign: 'center',
                    border: '1px solid #ddd'
                  }}>{item.result}</td>
                      <td style={{
                    padding: '10px',
                    textAlign: 'center',
                    border: '1px solid #ddd',
                    color: item.status === 'passed' ? '#22c55e' : '#eab308'
                  }}>
                        {item.status === 'passed' ? '✓ Passed' : '⚠ Attention'}
                      </td>
                    </tr>)}
                </tbody>
              </table>
            </div>

            {/* SolidityScan Analysis Page 2 */}
            <div style={{
            padding: '40px',
            pageBreakAfter: 'always'
          }}>
              <h2 style={{
              color: '#E53E3E',
              fontSize: '28px',
              borderBottom: '2px solid #E53E3E',
              paddingBottom: '10px',
              marginBottom: '30px'
            }}>
                SolidityScan Security Analysis (Continued)
              </h2>
              <table style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}>
                <thead>
                  <tr style={{
                  background: '#1a1f3c',
                  color: 'white'
                }}>
                    <th style={{
                    padding: '10px',
                    textAlign: 'left',
                    border: '1px solid #ddd'
                  }}>Check</th>
                    <th style={{
                    padding: '10px',
                    textAlign: 'center',
                    border: '1px solid #ddd'
                  }}>Result</th>
                    <th style={{
                    padding: '10px',
                    textAlign: 'center',
                    border: '1px solid #ddd'
                  }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[{
                  check: 'ERC-20 Standard',
                  result: 'Compliant',
                  status: 'passed'
                }, {
                  check: 'Pausable Contract',
                  result: 'No',
                  status: 'passed'
                }, {
                  check: 'Self Destruct',
                  result: 'Not Found',
                  status: 'passed'
                }, {
                  check: 'ERC20 Race Condition',
                  result: 'Vulnerable',
                  status: 'warning'
                }, {
                  check: 'Renounced Ownership',
                  result: 'Not Renounced',
                  status: 'attention'
                }, {
                  check: 'Major Holder Ratio',
                  result: '>20%',
                  status: 'attention'
                }, {
                  check: 'Overpowered Owners',
                  result: '2 Functions',
                  status: 'warning'
                }, {
                  check: 'No Cooldown Function',
                  result: 'Confirmed',
                  status: 'passed'
                }, {
                  check: 'Whitelist Function',
                  result: 'Not Found',
                  status: 'passed'
                }, {
                  check: 'Fee Modification',
                  result: 'Cannot Modify',
                  status: 'passed'
                }, {
                  check: 'Hardcoded Addresses',
                  result: 'Not Found',
                  status: 'passed'
                }, {
                  check: 'Hidden Owner',
                  result: 'Not Found',
                  status: 'passed'
                }].map((item, idx) => <tr key={idx} style={{
                  background: idx % 2 === 0 ? '#fff' : '#f8f9fa'
                }}>
                      <td style={{
                    padding: '10px',
                    border: '1px solid #ddd'
                  }}>{item.check}</td>
                      <td style={{
                    padding: '10px',
                    textAlign: 'center',
                    border: '1px solid #ddd'
                  }}>{item.result}</td>
                      <td style={{
                    padding: '10px',
                    textAlign: 'center',
                    border: '1px solid #ddd',
                    color: item.status === 'passed' ? '#22c55e' : item.status === 'warning' ? '#ea580c' : '#eab308'
                  }}>
                        {item.status === 'passed' ? '✓ Passed' : item.status === 'warning' ? '⚠ Warning' : '⚠ Attention'}
                      </td>
                    </tr>)}
                </tbody>
              </table>
            </div>

            {/* Honeypot Analysis Page */}
            <div style={{
            padding: '40px',
            pageBreakAfter: 'always'
          }}>
              <h2 style={{
              color: '#E53E3E',
              fontSize: '28px',
              borderBottom: '2px solid #E53E3E',
              paddingBottom: '10px',
              marginBottom: '30px'
            }}>
                Honeypot Risk Analysis
              </h2>
              <div style={{
              background: '#f0fdf4',
              padding: '30px',
              borderRadius: '15px',
              marginBottom: '30px',
              textAlign: 'center'
            }}>
                <h3 style={{
                fontSize: '32px',
                color: '#22c55e',
                marginBottom: '10px'
              }}>✓ NOT A HONEYPOT</h3>
                <p style={{
                color: '#15803d',
                fontSize: '16px'
              }}>This token has passed all honeypot detection tests</p>
              </div>

              <h3 style={{
              fontSize: '18px',
              marginBottom: '15px'
            }}>Tax Analysis</h3>
              <div style={{
              display: 'flex',
              gap: '20px',
              marginBottom: '30px',
              flexWrap: 'wrap'
            }}>
                <div style={{
                flex: 1,
                minWidth: '200px',
                background: '#f0fdf4',
                padding: '20px',
                borderRadius: '10px',
                textAlign: 'center',
                border: '1px solid #86efac'
              }}>
                  <p style={{
                  fontSize: '14px',
                  color: '#15803d'
                }}>Buy Tax</p>
                  <p style={{
                  fontSize: '36px',
                  fontWeight: 'bold',
                  color: '#22c55e'
                }}>0.00%</p>
                </div>
                <div style={{
                flex: 1,
                minWidth: '200px',
                background: '#f0fdf4',
                padding: '20px',
                borderRadius: '10px',
                textAlign: 'center',
                border: '1px solid #86efac'
              }}>
                  <p style={{
                  fontSize: '14px',
                  color: '#15803d'
                }}>Sell Tax</p>
                  <p style={{
                  fontSize: '36px',
                  fontWeight: 'bold',
                  color: '#22c55e'
                }}>0.00%</p>
                </div>
                <div style={{
                flex: 1,
                minWidth: '200px',
                background: '#f0fdf4',
                padding: '20px',
                borderRadius: '10px',
                textAlign: 'center',
                border: '1px solid #86efac'
              }}>
                  <p style={{
                  fontSize: '14px',
                  color: '#15803d'
                }}>Transfer Tax</p>
                  <p style={{
                  fontSize: '36px',
                  fontWeight: 'bold',
                  color: '#22c55e'
                }}>0.00%</p>
                </div>
              </div>

              <h3 style={{
              fontSize: '18px',
              marginBottom: '15px'
            }}>Trading Restrictions</h3>
              <table style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}>
                <tbody>
                  {[{
                  check: 'Can Buy',
                  result: 'Yes - No Restrictions'
                }, {
                  check: 'Can Sell',
                  result: 'Yes - No Restrictions'
                }, {
                  check: 'Can Sell All Holdings',
                  result: 'Yes - No Limits'
                }, {
                  check: 'Trading Cooldown',
                  result: 'None'
                }, {
                  check: 'Anti-Whale Mechanism',
                  result: 'None'
                }, {
                  check: 'Maximum Transaction',
                  result: 'Unlimited'
                }].map((item, idx) => <tr key={idx} style={{
                  background: idx % 2 === 0 ? '#fff' : '#f8f9fa'
                }}>
                      <td style={{
                    padding: '12px',
                    border: '1px solid #ddd',
                    fontWeight: 'bold'
                  }}>{item.check}</td>
                      <td style={{
                    padding: '12px',
                    border: '1px solid #ddd',
                    color: '#22c55e'
                  }}>✓ {item.result}</td>
                    </tr>)}
                </tbody>
              </table>
            </div>

            {/* Contract Code Analysis Page */}
            <div style={{
            padding: '40px',
            pageBreakAfter: 'always'
          }}>
              <h2 style={{
              color: '#E53E3E',
              fontSize: '28px',
              borderBottom: '2px solid #E53E3E',
              paddingBottom: '10px',
              marginBottom: '30px'
            }}>
                Smart Contract Code Analysis
              </h2>
              
              <h3 style={{
              fontSize: '18px',
              marginBottom: '15px'
            }}>Contract Overview</h3>
              <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginBottom: '30px'
            }}>
                <tbody>
                  <tr><td style={{
                    padding: '10px',
                    border: '1px solid #ddd',
                    fontWeight: 'bold',
                    width: '40%'
                  }}>Contract Name</td><td style={{
                    padding: '10px',
                    border: '1px solid #ddd'
                  }}>PerfectMoney</td></tr>
                  <tr style={{
                  background: '#f8f9fa'
                }}><td style={{
                    padding: '10px',
                    border: '1px solid #ddd',
                    fontWeight: 'bold'
                  }}>Compiler Version</td><td style={{
                    padding: '10px',
                    border: '1px solid #ddd'
                  }}>Solidity ^0.8.20</td></tr>
                  <tr><td style={{
                    padding: '10px',
                    border: '1px solid #ddd',
                    fontWeight: 'bold'
                  }}>License</td><td style={{
                    padding: '10px',
                    border: '1px solid #ddd'
                  }}>MIT</td></tr>
                  <tr style={{
                  background: '#f8f9fa'
                }}><td style={{
                    padding: '10px',
                    border: '1px solid #ddd',
                    fontWeight: 'bold'
                  }}>Lines of Code</td><td style={{
                    padding: '10px',
                    border: '1px solid #ddd'
                  }}>127</td></tr>
                  <tr><td style={{
                    padding: '10px',
                    border: '1px solid #ddd',
                    fontWeight: 'bold'
                  }}>Optimization</td><td style={{
                    padding: '10px',
                    border: '1px solid #ddd'
                  }}>Enabled (200 runs)</td></tr>
                  <tr style={{
                  background: '#f8f9fa'
                }}><td style={{
                    padding: '10px',
                    border: '1px solid #ddd',
                    fontWeight: 'bold'
                  }}>EVM Version</td><td style={{
                    padding: '10px',
                    border: '1px solid #ddd'
                  }}>Paris</td></tr>
                </tbody>
              </table>

              <h3 style={{
              fontSize: '18px',
              marginBottom: '15px'
            }}>Dependencies</h3>
              <ul style={{
              listStyle: 'none',
              padding: 0
            }}>
                <li style={{
                padding: '10px',
                background: '#f8f9fa',
                borderRadius: '5px',
                marginBottom: '10px'
              }}>
                  <strong>OpenZeppelin Contracts</strong> - Industry standard security library
                </li>
                <li style={{
                padding: '10px',
                background: '#f8f9fa',
                borderRadius: '5px',
                marginBottom: '10px'
              }}>
                  <strong>ERC20 Standard</strong> - Fully compliant token implementation
                </li>
                <li style={{
                padding: '10px',
                background: '#f8f9fa',
                borderRadius: '5px',
                marginBottom: '10px'
              }}>
                  <strong>Ownable</strong> - Access control mechanism
                </li>
              </ul>
            </div>

            {/* Token Distribution Page */}
            <div style={{
            padding: '40px',
            pageBreakAfter: 'always'
          }}>
              <h2 style={{
              color: '#E53E3E',
              fontSize: '28px',
              borderBottom: '2px solid #E53E3E',
              paddingBottom: '10px',
              marginBottom: '30px'
            }}>
                Token Distribution Analysis
              </h2>
              
              <h3 style={{
              fontSize: '18px',
              marginBottom: '15px'
            }}>Supply Distribution</h3>
              <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginBottom: '30px'
            }}>
                <thead>
                  <tr style={{
                  background: '#1a1f3c',
                  color: 'white'
                }}>
                    <th style={{
                    padding: '12px',
                    textAlign: 'left',
                    border: '1px solid #ddd'
                  }}>Allocation</th>
                    <th style={{
                    padding: '12px',
                    textAlign: 'center',
                    border: '1px solid #ddd'
                  }}>Percentage</th>
                    <th style={{
                    padding: '12px',
                    textAlign: 'right',
                    border: '1px solid #ddd'
                  }}>Amount (PM)</th>
                  </tr>
                </thead>
                <tbody>
                  {[{
                  name: 'Public Sale',
                  percentage: '20%',
                  amount: '20,000,000,000'
                }, {
                  name: 'Community',
                  percentage: '20%',
                  amount: '20,000,000,000'
                }, {
                  name: 'Development',
                  percentage: '20%',
                  amount: '20,000,000,000'
                }, {
                  name: 'Team & Advisors',
                  percentage: '15%',
                  amount: '15,000,000,000'
                }, {
                  name: 'Marketing',
                  percentage: '10%',
                  amount: '10,000,000,000'
                }, {
                  name: 'Liquidity Pool',
                  percentage: '10%',
                  amount: '10,000,000,000'
                }, {
                  name: 'Reserve Fund',
                  percentage: '5%',
                  amount: '5,000,000,000'
                }].map((item, idx) => <tr key={idx} style={{
                  background: idx % 2 === 0 ? '#fff' : '#f8f9fa'
                }}>
                      <td style={{
                    padding: '12px',
                    border: '1px solid #ddd'
                  }}>{item.name}</td>
                      <td style={{
                    padding: '12px',
                    textAlign: 'center',
                    border: '1px solid #ddd',
                    fontWeight: 'bold'
                  }}>{item.percentage}</td>
                      <td style={{
                    padding: '12px',
                    textAlign: 'right',
                    border: '1px solid #ddd'
                  }}>{item.amount}</td>
                    </tr>)}
                </tbody>
                <tfoot>
                  <tr style={{
                  background: '#1a1f3c',
                  color: 'white'
                }}>
                    <td style={{
                    padding: '12px',
                    border: '1px solid #ddd',
                    fontWeight: 'bold'
                  }}>Total Supply</td>
                    <td style={{
                    padding: '12px',
                    textAlign: 'center',
                    border: '1px solid #ddd',
                    fontWeight: 'bold'
                  }}>100%</td>
                    <td style={{
                    padding: '12px',
                    textAlign: 'right',
                    border: '1px solid #ddd',
                    fontWeight: 'bold'
                  }}>100,000,000,000</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Comparison vs Traditional Page */}
            <div style={{
            padding: '40px',
            pageBreakAfter: 'always'
          }}>
              <h2 style={{
              color: '#E53E3E',
              fontSize: '28px',
              borderBottom: '2px solid #E53E3E',
              paddingBottom: '10px',
              marginBottom: '30px'
            }}>
                Perfect Money vs Traditional Payments
              </h2>
              
              <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginBottom: '30px'
            }}>
                <thead>
                  <tr style={{
                  background: '#1a1f3c',
                  color: 'white'
                }}>
                    <th style={{
                    padding: '12px',
                    textAlign: 'left',
                    border: '1px solid #ddd'
                  }}>Feature</th>
                    <th style={{
                    padding: '12px',
                    textAlign: 'center',
                    border: '1px solid #ddd',
                    background: '#E53E3E'
                  }}>Perfect Money</th>
                    <th style={{
                    padding: '12px',
                    textAlign: 'center',
                    border: '1px solid #ddd'
                  }}>Visa/PayPal</th>
                    <th style={{
                    padding: '12px',
                    textAlign: 'center',
                    border: '1px solid #ddd'
                  }}>Other Crypto</th>
                  </tr>
                </thead>
                <tbody>
                  {[{
                  feature: 'Transaction Fees',
                  pm: '0% - 0.1%',
                  traditional: '2% - 3.5%',
                  crypto: '0.5% - 2%'
                }, {
                  feature: 'Settlement Time',
                  pm: '< 5 seconds',
                  traditional: '2-5 days',
                  crypto: '10-60 min'
                }, {
                  feature: 'Global Access',
                  pm: '✓ Yes',
                  traditional: '✗ Limited',
                  crypto: '✓ Yes'
                }, {
                  feature: '24/7 Availability',
                  pm: '✓ Yes',
                  traditional: '✗ No',
                  crypto: '✓ Yes'
                }, {
                  feature: 'Security Audit',
                  pm: 'AAA Rating',
                  traditional: 'N/A',
                  crypto: 'Varies'
                }, {
                  feature: 'Chargeback Risk',
                  pm: 'None',
                  traditional: 'High',
                  crypto: 'None'
                }, {
                  feature: 'Privacy Level',
                  pm: 'High',
                  traditional: 'Low',
                  crypto: 'High'
                }].map((item, idx) => <tr key={idx} style={{
                  background: idx % 2 === 0 ? '#fff' : '#f8f9fa'
                }}>
                      <td style={{
                    padding: '12px',
                    border: '1px solid #ddd',
                    fontWeight: 'bold'
                  }}>{item.feature}</td>
                      <td style={{
                    padding: '12px',
                    textAlign: 'center',
                    border: '1px solid #ddd',
                    color: '#22c55e',
                    fontWeight: 'bold',
                    background: '#f0fdf4'
                  }}>{item.pm}</td>
                      <td style={{
                    padding: '12px',
                    textAlign: 'center',
                    border: '1px solid #ddd',
                    color: '#dc2626'
                  }}>{item.traditional}</td>
                      <td style={{
                    padding: '12px',
                    textAlign: 'center',
                    border: '1px solid #ddd',
                    color: '#eab308'
                  }}>{item.crypto}</td>
                    </tr>)}
                </tbody>
              </table>
            </div>

            {/* Risk Assessment Page */}
            <div style={{
            padding: '40px',
            pageBreakAfter: 'always'
          }}>
              <h2 style={{
              color: '#E53E3E',
              fontSize: '28px',
              borderBottom: '2px solid #E53E3E',
              paddingBottom: '10px',
              marginBottom: '30px'
            }}>
                Risk Assessment Summary
              </h2>

              <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              marginBottom: '30px'
            }}>
                <div style={{
                background: '#f0fdf4',
                padding: '20px',
                borderRadius: '10px',
                border: '1px solid #86efac'
              }}>
                  <h4 style={{
                  color: '#15803d',
                  marginBottom: '10px'
                }}>Low Risk Factors</h4>
                  <ul style={{
                  margin: 0,
                  paddingLeft: '20px',
                  color: '#166534'
                }}>
                    <li>No honeypot mechanism</li>
                    <li>Zero buy/sell tax</li>
                    <li>Open source verified</li>
                    <li>No mint function</li>
                    <li>No blacklist capability</li>
                  </ul>
                </div>
                <div style={{
                background: '#fefce8',
                padding: '20px',
                borderRadius: '10px',
                border: '1px solid #fde047'
              }}>
                  <h4 style={{
                  color: '#a16207',
                  marginBottom: '10px'
                }}>Points of Attention</h4>
                  <ul style={{
                  margin: 0,
                  paddingLeft: '20px',
                  color: '#854d0e'
                }}>
                    <li>Ownership not renounced</li>
                    <li>Major holder concentration</li>
                    <li>Some owner-only functions</li>
                    <li>Burn function present</li>
                  </ul>
                </div>
              </div>

              <h3 style={{
              fontSize: '18px',
              marginBottom: '15px'
            }}>Overall Risk Level</h3>
              <div style={{
              background: '#f0fdf4',
              padding: '30px',
              borderRadius: '15px',
              textAlign: 'center',
              border: '2px solid #22c55e'
            }}>
                <h3 style={{
                fontSize: '36px',
                color: '#22c55e',
                marginBottom: '10px'
              }}>LOW RISK</h3>
                <p style={{
                color: '#15803d'
              }}>Based on comprehensive multi-provider security analysis</p>
              </div>
            </div>

            {/* Audit Methodology Page */}
            <div style={{
            padding: '40px',
            pageBreakAfter: 'always'
          }}>
              <h2 style={{
              color: '#E53E3E',
              fontSize: '28px',
              borderBottom: '2px solid #E53E3E',
              paddingBottom: '10px',
              marginBottom: '30px'
            }}>
                Audit Methodology
              </h2>
              
              <h3 style={{
              fontSize: '18px',
              marginBottom: '15px'
            }}>Analysis Approach</h3>
              <div style={{
              marginBottom: '30px'
            }}>
                <p style={{
                lineHeight: '1.8',
                marginBottom: '20px'
              }}>
                  This comprehensive security audit employed a multi-layered approach using three industry-leading 
                  security analysis platforms. Each platform utilizes different methodologies and focuses on 
                  various aspects of smart contract security.
                </p>
              </div>

              <h3 style={{
              fontSize: '18px',
              marginBottom: '15px'
            }}>Security Providers Used</h3>
              <div style={{
              marginBottom: '30px'
            }}>
                <div style={{
                background: '#f8f9fa',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '15px'
              }}>
                  <h4 style={{
                  marginBottom: '10px'
                }}>1. Skynet CertiK</h4>
                  <p style={{
                  fontSize: '14px',
                  color: '#666'
                }}>
                    Industry-leading security platform specializing in blockchain security audits, 
                    penetration testing, and formal verification.
                  </p>
                </div>
                <div style={{
                background: '#f8f9fa',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '15px'
              }}>
                  <h4 style={{
                  marginBottom: '10px'
                }}>2. GoPlus Labs</h4>
                  <p style={{
                  fontSize: '14px',
                  color: '#666'
                }}>
                    Real-time security detection platform focusing on token security, 
                    honeypot detection, and malicious contract identification.
                  </p>
                </div>
                <div style={{
                background: '#f8f9fa',
                padding: '15px',
                borderRadius: '8px'
              }}>
                  <h4 style={{
                  marginBottom: '10px'
                }}>3. SolidityScan</h4>
                  <p style={{
                  fontSize: '14px',
                  color: '#666'
                }}>
                    Automated smart contract security scanner that performs static analysis, 
                    vulnerability detection, and code quality assessment.
                  </p>
                </div>
              </div>
            </div>

            {/* Recommendations Page */}
            <div style={{
            padding: '40px',
            pageBreakAfter: 'always'
          }}>
              <h2 style={{
              color: '#E53E3E',
              fontSize: '28px',
              borderBottom: '2px solid #E53E3E',
              paddingBottom: '10px',
              marginBottom: '30px'
            }}>
                Recommendations
              </h2>
              
              <h3 style={{
              fontSize: '18px',
              marginBottom: '15px'
            }}>For Token Holders</h3>
              <ul style={{
              lineHeight: '2',
              marginBottom: '30px'
            }}>
                <li>✓ Always verify the contract address before interacting</li>
                <li>✓ Use hardware wallets for large holdings</li>
                <li>✓ Monitor official channels for updates</li>
                <li>✓ Diversify your portfolio appropriately</li>
                <li>✓ Stay informed about project developments</li>
              </ul>

              <h3 style={{
              fontSize: '18px',
              marginBottom: '15px'
            }}>For Merchants</h3>
              <ul style={{
              lineHeight: '2',
              marginBottom: '30px'
            }}>
                <li>✓ Integrate using official API documentation</li>
                <li>✓ Display the AAA security badge on your website</li>
                <li>✓ Implement proper wallet security practices</li>
                <li>✓ Monitor transactions for anomalies</li>
                <li>✓ Keep integration libraries updated</li>
              </ul>

              <h3 style={{
              fontSize: '18px',
              marginBottom: '15px'
            }}>For Developers</h3>
              <ul style={{
              lineHeight: '2'
            }}>
                <li>✓ Follow the official integration guides</li>
                <li>✓ Use checksummed addresses</li>
                <li>✓ Implement proper error handling</li>
                <li>✓ Test thoroughly on testnet first</li>
                <li>✓ Stay updated with security patches</li>
              </ul>
            </div>

            {/* Conclusion Page */}
            <div style={{
            padding: '40px',
            pageBreakAfter: 'always'
          }}>
              <h2 style={{
              color: '#E53E3E',
              fontSize: '28px',
              borderBottom: '2px solid #E53E3E',
              paddingBottom: '10px',
              marginBottom: '30px'
            }}>
                Conclusion
              </h2>
              
              <div style={{
              background: '#f8f9fa',
              padding: '30px',
              borderRadius: '15px',
              marginBottom: '30px'
            }}>
                <p style={{
                fontSize: '16px',
                lineHeight: '1.8',
                marginBottom: '20px'
              }}>
                  Based on comprehensive analysis using multiple industry-leading security platforms, 
                  the Perfect Money (PM) token smart contract demonstrates a high level of security 
                  and compliance with best practices in smart contract development.
                </p>
                <p style={{
                fontSize: '16px',
                lineHeight: '1.8'
              }}>
                  With a combined score of <strong>94.83/100</strong> and an <strong>AAA rating</strong>, 
                  the contract shows no critical vulnerabilities, no honeypot mechanisms, and maintains 
                  transparency through its open-source, verified code.
                </p>
              </div>

              <h3 style={{
              fontSize: '20px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>Final Verdict</h3>
              <div style={{
              background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
              padding: '40px',
              borderRadius: '15px',
              textAlign: 'center',
              border: '2px solid #22c55e'
            }}>
                <h2 style={{
                fontSize: '48px',
                color: '#22c55e',
                marginBottom: '10px'
              }}>AAA</h2>
                <p style={{
                fontSize: '24px',
                color: '#15803d',
                fontWeight: 'bold',
                marginBottom: '10px'
              }}>CERTIFIED SECURE</p>
                <p style={{
                color: '#166534'
              }}>Score: 94.83 / 100</p>
              </div>
            </div>

            {/* Disclaimer Page */}
            <div style={{
            padding: '40px',
            pageBreakAfter: 'always'
          }}>
              <h2 style={{
              color: '#E53E3E',
              fontSize: '28px',
              borderBottom: '2px solid #E53E3E',
              paddingBottom: '10px',
              marginBottom: '30px'
            }}>
                Disclaimer
              </h2>
              
              <div style={{
              background: '#fefce8',
              padding: '20px',
              borderRadius: '10px',
              marginBottom: '30px',
              border: '1px solid #fde047'
            }}>
                <h4 style={{
                color: '#a16207',
                marginBottom: '15px'
              }}>Important Notice</h4>
                <p style={{
                fontSize: '14px',
                lineHeight: '1.8',
                color: '#854d0e'
              }}>
                  This security audit report is provided for informational purposes only and does not constitute 
                  financial advice, investment recommendation, or guarantee of security. While this audit has been 
                  conducted using industry-standard tools and methodologies, no audit can guarantee the absolute 
                  security of a smart contract.
                </p>
              </div>

              <h3 style={{
              fontSize: '18px',
              marginBottom: '15px'
            }}>Limitations</h3>
              <ul style={{
              lineHeight: '2',
              marginBottom: '30px',
              fontSize: '14px'
            }}>
                <li>Security audits cannot detect all possible vulnerabilities</li>
                <li>New attack vectors may emerge after the audit date</li>
                <li>External factors may affect contract behavior</li>
                <li>User error and phishing attacks are outside audit scope</li>
                <li>This audit reflects the contract state at the time of analysis</li>
              </ul>

              <h3 style={{
              fontSize: '18px',
              marginBottom: '15px'
            }}>Liability</h3>
              <p style={{
              fontSize: '14px',
              lineHeight: '1.8',
              color: '#666'
            }}>
                The auditors, platforms, and report generators disclaim all liability for any losses, 
                damages, or claims arising from the use of or reliance on this report. Users should 
                conduct their own due diligence and consult with qualified professionals before making 
                any investment decisions.
              </p>
            </div>

            {/* Back Cover */}
            <div style={{
            height: '297mm',
            background: 'linear-gradient(135deg, #1a1f3c 0%, #E53E3E 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '40px'
          }}>
              <div style={{
              textAlign: 'center',
              color: 'white'
            }}>
                <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 30px'
              }}>
                  <img src={pmLogo} alt="PM Logo" style={{
                  width: '60px',
                  height: '60px'
                }} />
                </div>
                <h2 style={{
                fontSize: '36px',
                marginBottom: '10px'
              }}>Perfect Money</h2>
                <p style={{
                fontSize: '18px',
                marginBottom: '40px',
                opacity: 0.9
              }}>Just Made It Perfect</p>
                
                <div style={{
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '15px',
                padding: '30px 50px',
                marginBottom: '40px'
              }}>
                  <p style={{
                  fontSize: '14px',
                  marginBottom: '10px',
                  opacity: 0.8
                }}>Verified Contract</p>
                  <p style={{
                  fontSize: '12px',
                  fontFamily: 'monospace'
                }}>{PM_TOKEN_ADDRESS}</p>
                </div>

                <div style={{
                display: 'flex',
                gap: '40px',
                justifyContent: 'center',
                marginBottom: '50px',
                flexWrap: 'wrap'
              }}>
                  <div>
                    <p style={{
                    fontSize: '12px',
                    opacity: 0.7
                  }}>Website</p>
                    <p style={{
                    fontSize: '14px'
                  }}>perfectmoney.io</p>
                  </div>
                  <div>
                    <p style={{
                    fontSize: '12px',
                    opacity: 0.7
                  }}>Network</p>
                    <p style={{
                    fontSize: '14px'
                  }}>Binance Smart Chain</p>
                  </div>
                  <div>
                    <p style={{
                    fontSize: '12px',
                    opacity: 0.7
                  }}>Standard</p>
                    <p style={{
                    fontSize: '14px'
                  }}>BEP-20</p>
                  </div>
                </div>

                <div style={{
                background: 'rgba(34,197,94,0.2)',
                borderRadius: '10px',
                padding: '15px 30px',
                display: 'inline-block',
                marginBottom: '30px'
              }}>
                  <p style={{
                  fontSize: '14px',
                  marginBottom: '5px',
                  opacity: 0.9
                }}>Security Rating</p>
                  <p style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#22c55e'
                }}>AAA</p>
                </div>

                <p style={{
                fontSize: '12px',
                opacity: 0.6,
                maxWidth: '400px',
                margin: '0 auto'
              }}>
                  This audit report was generated on {new Date().toLocaleDateString()} and reflects 
                  the security status at that time. For the latest information, please visit our website.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>;
};
export default TokenSecurityPage;