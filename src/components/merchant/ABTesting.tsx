import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  FlaskConical, 
  Plus, 
  TrendingUp, 
  TrendingDown,
  Eye,
  MousePointerClick,
  Trophy,
  BarChart3
} from "lucide-react";
import { toast } from "sonner";
import { useMerchant } from "@/hooks/useMerchant";
import { useAccount } from "wagmi";

interface ABTest {
  id: number;
  name: string;
  variantA: {
    name: string;
    impressions: number;
    conversions: number;
  };
  variantB: {
    name: string;
    impressions: number;
    conversions: number;
  };
  status: "running" | "completed" | "paused";
  startDate: string;
  winner?: "A" | "B" | null;
}

export const ABTesting = () => {
  const { address, isConnected } = useAccount();
  const { createABTest, useABTestCount } = useMerchant();
  const { data: abTestCount } = useABTestCount();
  
  const [isCreating, setIsCreating] = useState(false);
  const [newTestName, setNewTestName] = useState("");
  const [variantAName, setVariantAName] = useState("");
  const [variantBName, setVariantBName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock data for UI display (will be replaced with contract data when deployed)
  const [tests, setTests] = useState<ABTest[]>([
    {
      id: 1,
      name: "Checkout Button Color",
      variantA: { name: "Blue Button", impressions: 1250, conversions: 87 },
      variantB: { name: "Green Button", impressions: 1180, conversions: 102 },
      status: "running",
      startDate: "2024-01-15",
      winner: null
    },
    {
      id: 2,
      name: "Payment Page Layout",
      variantA: { name: "Single Column", impressions: 2340, conversions: 198 },
      variantB: { name: "Two Column", impressions: 2280, conversions: 156 },
      status: "completed",
      startDate: "2024-01-10",
      winner: "A"
    }
  ]);

  const calculateConversionRate = (conversions: number, impressions: number) => {
    if (impressions === 0) return 0;
    return ((conversions / impressions) * 100).toFixed(2);
  };

  const handleCreateTest = async () => {
    if (!newTestName || !variantAName || !variantBName) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      // Try blockchain first
      try {
        await createABTest(variantAName, variantBName);
      } catch (e) {
        // Contract not deployed, use local state
        console.log("Using local state for A/B test");
      }

      const newTest: ABTest = {
        id: tests.length + 1,
        name: newTestName,
        variantA: { name: variantAName, impressions: 0, conversions: 0 },
        variantB: { name: variantBName, impressions: 0, conversions: 0 },
        status: "running",
        startDate: new Date().toISOString().split('T')[0],
        winner: null
      };
      
      setTests([...tests, newTest]);
      setNewTestName("");
      setVariantAName("");
      setVariantBName("");
      setIsCreating(false);
      toast.success("A/B Test created successfully!");
    } catch (error: any) {
      toast.error(error?.message || "Failed to create test");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWinnerBadge = (test: ABTest) => {
    if (test.status !== "completed" || !test.winner) return null;
    return (
      <Badge className="bg-green-500/20 text-green-500">
        <Trophy className="h-3 w-3 mr-1" />
        Variant {test.winner} Wins
      </Badge>
    );
  };

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/20">
            <FlaskConical className="h-5 w-5 text-purple-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold">A/B Testing</h2>
            <p className="text-sm text-muted-foreground">Optimize payment page conversions</p>
          </div>
        </div>
        <Button 
          variant="gradient" 
          size="sm"
          onClick={() => setIsCreating(true)}
          disabled={isCreating}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Test
        </Button>
      </div>

      {isCreating && (
        <Card className="p-4 mb-6 border-2 border-dashed border-primary/30 bg-primary/5">
          <h3 className="font-semibold mb-4">Create New A/B Test</h3>
          <div className="space-y-4">
            <div>
              <Label>Test Name</Label>
              <Input
                placeholder="e.g., Checkout Button Color"
                value={newTestName}
                onChange={(e) => setNewTestName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Variant A Name</Label>
                <Input
                  placeholder="e.g., Blue Button"
                  value={variantAName}
                  onChange={(e) => setVariantAName(e.target.value)}
                />
              </div>
              <div>
                <Label>Variant B Name</Label>
                <Input
                  placeholder="e.g., Green Button"
                  value={variantBName}
                  onChange={(e) => setVariantBName(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
              <Button 
                variant="gradient" 
                onClick={handleCreateTest}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Test"}
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {tests.map((test) => {
          const rateA = parseFloat(calculateConversionRate(test.variantA.conversions, test.variantA.impressions) as string);
          const rateB = parseFloat(calculateConversionRate(test.variantB.conversions, test.variantB.impressions) as string);
          const totalImpressions = test.variantA.impressions + test.variantB.impressions;
          const aPercentage = totalImpressions > 0 ? (test.variantA.impressions / totalImpressions) * 100 : 50;

          return (
            <Card key={test.id} className="p-4 bg-muted/30">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-semibold">{test.name}</h4>
                  <p className="text-xs text-muted-foreground">Started: {test.startDate}</p>
                </div>
                <div className="flex items-center gap-2">
                  {getWinnerBadge(test)}
                  <Badge 
                    variant={test.status === "running" ? "default" : "secondary"}
                    className={test.status === "running" ? "bg-green-500/20 text-green-500" : ""}
                  >
                    {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Variant A */}
                <div className={`p-3 rounded-lg border ${test.winner === "A" ? "border-green-500 bg-green-500/10" : "border-border"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Variant A</span>
                    {rateA > rateB && test.status === "running" && (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{test.variantA.name}</p>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" /> Impressions
                      </span>
                      <span>{test.variantA.impressions.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1">
                        <MousePointerClick className="h-3 w-3" /> Conversions
                      </span>
                      <span>{test.variantA.conversions.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm font-semibold mt-2">
                      <span>Rate</span>
                      <span className="text-primary">{rateA}%</span>
                    </div>
                  </div>
                </div>

                {/* Variant B */}
                <div className={`p-3 rounded-lg border ${test.winner === "B" ? "border-green-500 bg-green-500/10" : "border-border"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Variant B</span>
                    {rateB > rateA && test.status === "running" && (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{test.variantB.name}</p>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" /> Impressions
                      </span>
                      <span>{test.variantB.impressions.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1">
                        <MousePointerClick className="h-3 w-3" /> Conversions
                      </span>
                      <span>{test.variantB.conversions.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm font-semibold mt-2">
                      <span>Rate</span>
                      <span className="text-primary">{rateB}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Traffic Split */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span>Traffic Split</span>
                  <span>{aPercentage.toFixed(0)}% / {(100 - aPercentage).toFixed(0)}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden flex">
                  <div 
                    className="bg-blue-500 transition-all"
                    style={{ width: `${aPercentage}%` }}
                  />
                  <div 
                    className="bg-purple-500 transition-all"
                    style={{ width: `${100 - aPercentage}%` }}
                  />
                </div>
              </div>
            </Card>
          );
        })}

        {tests.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No A/B tests yet</p>
            <p className="text-sm">Create your first test to optimize conversions</p>
          </div>
        )}
      </div>
    </Card>
  );
};
