import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Mail } from "lucide-react";
import { toast } from "sonner";

export const TokenInfo = () => {
  const [email, setEmail] = useState("");
  const contractAddress = "0x181108f76d9910569203b5d59eb14Bc31961a989";
  const bscScanUrl = `https://bscscan.com/address/${contractAddress}`;
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    toast.success("Successfully subscribed to newsletter!");
    setEmail("");
  };

  return (
    <section id="about" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Token Info Column */}
            <div>
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Perfect Money Token
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground">
              BEP-20 token on Binance Smart Chain
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 bg-card/50 backdrop-blur-sm">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Token Name</h3>
              <p className="text-2xl font-bold">Perfect Money</p>
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur-sm">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Symbol</h3>
              <p className="text-2xl font-bold">PM</p>
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur-sm">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Supply</h3>
              <p className="text-2xl font-bold">100,000,000,000</p>
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur-sm">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Decimals</h3>
              <p className="text-2xl font-bold">18</p>
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur-sm md:col-span-2">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Contract Address</h3>
              <div className="flex items-center gap-2">
                <a 
                  href={bscScanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm sm:text-base font-mono flex-1 truncate hover:text-primary transition-colors"
                >
                  {contractAddress}
                </a>
                <button
                  onClick={() => copyToClipboard(contractAddress)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                  title="Copy address"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </Card>
          </div>

              <div className="mt-8 p-6 rounded-xl bg-primary/5 border border-primary/20">
                <h3 className="text-lg font-bold mb-3">Tokenomics</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Fixed supply of 100 billion tokens</li>
                  <li>• Disabled minting mechanisms</li>
                  <li>• Fully decentralized on BSC</li>
                  <li>• Smart contract audited for security</li>
                </ul>
              </div>
            </div>

            {/* Newsletter Column */}
            <div className="lg:sticky lg:top-24">
              <Card className="p-8 bg-card/50 backdrop-blur-sm border-primary/20">
                <div className="text-center mb-6">
                  <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4">
                    <Mail className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">
                    Subscribe to Our Newsletter
                  </h2>
                  <p className="text-muted-foreground">
                    Get the latest updates, news, and exclusive offers delivered to your inbox
                  </p>
                </div>

                <form onSubmit={handleSubscribe} className="space-y-4">
                  <div>
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12"
                    />
                  </div>
                  <Button type="submit" className="w-full h-12" size="lg">
                    Subscribe Now
                  </Button>
                </form>

                <div className="mt-6 pt-6 border-t border-border">
                  <h3 className="font-bold mb-3 text-sm">What you'll receive:</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>Weekly market updates and analysis</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>Exclusive airdrop announcements</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>Product updates and new features</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>Early access to token sales</span>
                    </li>
                  </ul>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
