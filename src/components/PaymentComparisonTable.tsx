import { Card } from "@/components/ui/card";
import { CheckCircle, XCircle, Clock, DollarSign, Globe, Shield, Zap, Users } from "lucide-react";

interface ComparisonItem {
  feature: string;
  icon: React.ReactNode;
  perfectMoney: string | React.ReactNode;
  traditional: string | React.ReactNode;
  crypto: string | React.ReactNode;
}

export const PaymentComparisonTable = () => {
  const comparisons: ComparisonItem[] = [
    {
      feature: "Transaction Fees",
      icon: <DollarSign className="h-4 w-4" />,
      perfectMoney: <span className="text-green-500 font-semibold">0% - 0.1%</span>,
      traditional: <span className="text-red-500">2% - 3.5%</span>,
      crypto: <span className="text-yellow-500">0.5% - 2%</span>,
    },
    {
      feature: "Settlement Time",
      icon: <Clock className="h-4 w-4" />,
      perfectMoney: <span className="text-green-500 font-semibold">&lt; 5 seconds</span>,
      traditional: <span className="text-red-500">2-5 business days</span>,
      crypto: <span className="text-yellow-500">10-60 minutes</span>,
    },
    {
      feature: "Global Accessibility",
      icon: <Globe className="h-4 w-4" />,
      perfectMoney: <div className="flex flex-col items-center"><CheckCircle className="h-5 w-5 text-green-500" /><span className="text-xs text-green-500 mt-1">Available</span></div>,
      traditional: <div className="flex flex-col items-center"><XCircle className="h-5 w-5 text-red-500" /><span className="text-xs text-red-500 mt-1">Limited</span></div>,
      crypto: <div className="flex flex-col items-center"><CheckCircle className="h-5 w-5 text-green-500" /><span className="text-xs text-green-500 mt-1">Available</span></div>,
    },
    {
      feature: "No Bank Account Required",
      icon: <Users className="h-4 w-4" />,
      perfectMoney: <div className="flex flex-col items-center"><CheckCircle className="h-5 w-5 text-green-500" /><span className="text-xs text-green-500 mt-1">No Bank Needed</span></div>,
      traditional: <div className="flex flex-col items-center"><XCircle className="h-5 w-5 text-red-500" /><span className="text-xs text-red-500 mt-1">Required</span></div>,
      crypto: <div className="flex flex-col items-center"><CheckCircle className="h-5 w-5 text-green-500" /><span className="text-xs text-green-500 mt-1">No Bank Needed</span></div>,
    },
    {
      feature: "24/7 Availability",
      icon: <Zap className="h-4 w-4" />,
      perfectMoney: <div className="flex flex-col items-center"><CheckCircle className="h-5 w-5 text-green-500" /><span className="text-xs text-green-500 mt-1">Always Open</span></div>,
      traditional: <div className="flex flex-col items-center"><XCircle className="h-5 w-5 text-red-500" /><span className="text-xs text-red-500 mt-1">Business Hours</span></div>,
      crypto: <div className="flex flex-col items-center"><CheckCircle className="h-5 w-5 text-green-500" /><span className="text-xs text-green-500 mt-1">Always Open</span></div>,
    },
    {
      feature: "Smart Contract Security",
      icon: <Shield className="h-4 w-4" />,
      perfectMoney: <span className="text-green-500 font-semibold">AAA Audited</span>,
      traditional: <span className="text-muted-foreground">N/A</span>,
      crypto: <span className="text-yellow-500">Varies</span>,
    },
    {
      feature: "Chargeback Risk",
      icon: <XCircle className="h-4 w-4" />,
      perfectMoney: <span className="text-green-500 font-semibold">None</span>,
      traditional: <span className="text-red-500">High</span>,
      crypto: <span className="text-green-500">None</span>,
    },
    {
      feature: "Merchant Integration",
      icon: <Zap className="h-4 w-4" />,
      perfectMoney: <span className="text-green-500 font-semibold">Simple API</span>,
      traditional: <span className="text-yellow-500">Complex</span>,
      crypto: <span className="text-yellow-500">Moderate</span>,
    },
    {
      feature: "Privacy",
      icon: <Shield className="h-4 w-4" />,
      perfectMoney: <span className="text-green-500 font-semibold">High</span>,
      traditional: <span className="text-red-500">Low</span>,
      crypto: <span className="text-green-500">High</span>,
    },
    {
      feature: "Currency Conversion",
      icon: <DollarSign className="h-4 w-4" />,
      perfectMoney: <span className="text-green-500 font-semibold">Instant</span>,
      traditional: <span className="text-red-500">3-5% fees</span>,
      crypto: <span className="text-yellow-500">Exchange needed</span>,
    },
  ];

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm overflow-hidden">
      <h2 className="text-xl font-bold mb-6 text-center">Payment Systems Comparison</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-4 px-4 font-semibold">Feature</th>
              <th className="text-center py-4 px-4">
                <div className="inline-flex flex-col items-center">
                  <span className="font-bold text-primary">Perfect Money</span>
                  <span className="text-xs text-muted-foreground">PM Token</span>
                </div>
              </th>
              <th className="text-center py-4 px-4">
                <div className="inline-flex flex-col items-center">
                  <span className="font-semibold">Traditional</span>
                  <span className="text-xs text-muted-foreground">Visa/PayPal</span>
                </div>
              </th>
              <th className="text-center py-4 px-4">
                <div className="inline-flex flex-col items-center">
                  <span className="font-semibold">Other Crypto</span>
                  <span className="text-xs text-muted-foreground">BTC/ETH</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {comparisons.map((item, idx) => (
              <tr 
                key={idx} 
                className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${
                  idx % 2 === 0 ? 'bg-muted/5' : ''
                }`}
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">{item.icon}</span>
                    <span className="font-medium">{item.feature}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-center bg-primary/5">{item.perfectMoney}</td>
                <td className="py-4 px-4 text-center">{item.traditional}</td>
                <td className="py-4 px-4 text-center">{item.crypto}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
        <p className="text-sm text-center text-muted-foreground">
          Perfect Money combines the best of traditional finance reliability with cryptocurrency innovation, 
          offering <span className="text-primary font-semibold">zero fees</span>, <span className="text-primary font-semibold">instant settlements</span>, 
          and <span className="text-primary font-semibold">AAA-rated security</span>.
        </p>
      </div>
    </Card>
  );
};
