import { Header } from "@/components/Header";
import { TradingViewTicker } from "@/components/TradingViewTicker";
import { HeroBanner } from "@/components/HeroBanner";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const distributionData = [
  { name: "Public Sale", value: 20, color: "hsl(0, 85%, 50%)" },
  { name: "Community", value: 20, color: "hsl(150, 75%, 45%)" },
  { name: "Team & Advisors", value: 15, color: "hsl(0, 0%, 20%)" },
  { name: "Development", value: 20, color: "hsl(0, 70%, 40%)" },
  { name: "Marketing", value: 10, color: "hsl(0, 0%, 30%)" },
  { name: "Liquidity Pool", value: 10, color: "hsl(0, 80%, 45%)" },
  { name: "Reserve Fund", value: 5, color: "hsl(0, 0%, 40%)" }
];

const allocationSchedule = [
  {
    category: "Public Sale",
    percentage: "20%",
    tokens: "20,000,000,000 PM",
    vesting: "No lock-up period",
    description: "Available for community members during token generation event"
  },
  {
    category: "Community",
    percentage: "20%",
    tokens: "20,000,000,000 PM",
    vesting: "Released for community rewards and airdrops",
    description: "Reserved for community growth, rewards programs, and ecosystem development"
  },
  {
    category: "Team & Advisors",
    percentage: "15%",
    tokens: "15,000,000,000 PM",
    vesting: "4-year vesting with 1-year cliff",
    description: "Allocated to core team members and strategic advisors"
  },
  {
    category: "Development",
    percentage: "20%",
    tokens: "20,000,000,000 PM",
    vesting: "Released quarterly over 3 years",
    description: "Reserved for platform development, audits, and technical infrastructure"
  },
  {
    category: "Marketing",
    percentage: "10%",
    tokens: "10,000,000,000 PM",
    vesting: "Released monthly over 2 years",
    description: "Dedicated to marketing campaigns, partnerships, and community growth"
  },
  {
    category: "Liquidity Pool",
    percentage: "10%",
    tokens: "10,000,000,000 PM",
    vesting: "Locked for 6 months, then gradual release",
    description: "Ensures sufficient liquidity on DEX platforms"
  },
  {
    category: "Reserve Fund",
    percentage: "5%",
    tokens: "5,000,000,000 PM",
    vesting: "Locked for 2 years",
    description: "Emergency fund for unforeseen circumstances and opportunities"
  }
];

const Tokenomics = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <TradingViewTicker />
      <HeroBanner 
        title="Token Economics" 
        subtitle="Comprehensive breakdown of PM token distribution and sustainability"
      />
      
      <main className="container mx-auto px-4 pt-12 pb-12">
        <div className="max-w-6xl mx-auto">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
            <Card className="p-6 bg-card/50 backdrop-blur-sm text-center">
              <p className="text-sm text-muted-foreground mb-2">Total Supply</p>
              <p className="text-3xl font-bold">100B PM</p>
            </Card>
            <Card className="p-6 bg-card/50 backdrop-blur-sm text-center">
              <p className="text-sm text-muted-foreground mb-2">Initial Price</p>
              <p className="text-3xl font-bold">0.0001 BNB</p>
            </Card>
            <Card className="p-6 bg-card/50 backdrop-blur-sm text-center">
              <p className="text-sm text-muted-foreground mb-2">Market Cap (Initial)</p>
              <p className="text-3xl font-bold">$1M</p>
            </Card>
            <Card className="p-6 bg-card/50 backdrop-blur-sm text-center">
              <p className="text-sm text-muted-foreground mb-2">Token Type</p>
              <p className="text-3xl font-bold">BEP-20</p>
            </Card>
          </div>

          {/* Token Distribution Chart */}
          <Card className="p-8 mb-12 bg-card/50 backdrop-blur-sm">
            <h2 className="text-3xl font-bold mb-8 text-center">Token Distribution</h2>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Token Allocation & Utility - Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Allocation Schedule */}
            <div>
              <h2 className="text-3xl font-bold mb-8 text-center">Allocation Schedule</h2>
              <div className="space-y-6">
                {allocationSchedule.map((allocation, index) => (
                  <Card key={index} className="p-6 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all">
                    <div className="flex flex-col gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div 
                            className="h-4 w-4 rounded-full"
                            style={{ backgroundColor: distributionData[index].color }}
                          />
                          <h3 className="text-xl font-bold">{allocation.category}</h3>
                        </div>
                        <p className="text-muted-foreground mb-3">{allocation.description}</p>
                        <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-sm">
                          <span className="font-medium">Vesting:</span> {allocation.vesting}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-primary mb-1">{allocation.percentage}</p>
                        <p className="text-sm text-muted-foreground">{allocation.tokens}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Token Utility */}
            <div>
              <h2 className="text-3xl font-bold mb-8 text-center">Token Utility</h2>
              <Card className="p-8 bg-gradient-to-br from-primary/10 to-secondary/10 backdrop-blur-sm border-primary/20 h-full">
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-bold mb-4">Primary Uses</h3>
                    <ul className="space-y-3 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Payment medium for peer-to-peer transactions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Staking rewards up to 25% APY</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Governance voting and platform decisions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Merchant subscription and payment settlement</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Referral program rewards (10% commission)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>NFT marketplace purchases and transactions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Liquidity provision on DEX platforms</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Yield farming and DeFi protocol participation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Airdrop eligibility and community rewards</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Partnership access and premium features</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Cross-border remittances with minimal fees</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>E-commerce integration for online merchants</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-4">Economic Model</h3>
                    <ul className="space-y-3 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Fixed supply (no inflation)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Transaction fee burning mechanism</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Staking rewards from fee pool</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Buyback and burn from profits</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Deflationary tokenomics</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Tokenomics;
