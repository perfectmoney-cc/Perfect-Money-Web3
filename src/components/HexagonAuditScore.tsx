import { useState, useEffect, useRef } from "react";
import pmLogo from "@/assets/pm-logo-new.png";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
interface CategoryInfo {
  name: string;
  value: number;
  maxValue: number;
  description?: string;
}
interface HexagonAuditScoreProps {
  score: number;
  grade: string;
  categories: CategoryInfo[];
}
const categoryDescriptions: Record<string, string> = {
  "Code Quality": "Measures code structure, readability, and adherence to best practices. Higher scores indicate cleaner, more maintainable code.",
  "Security": "Evaluates protection against common vulnerabilities like reentrancy, overflow, and access control issues.",
  "Gas Efficiency": "Assesses optimization of transaction costs and computational efficiency of smart contract operations.",
  "Documentation": "Reviews completeness of code comments, NatSpec documentation, and technical specifications.",
  "Testing": "Analyzes test coverage, edge case handling, and quality of unit and integration tests.",
  "Architecture": "Examines contract design patterns, modularity, and upgrade mechanisms."
};
export const HexagonAuditScore = ({
  score,
  grade,
  categories
}: HexagonAuditScoreProps) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [animatedCategories, setAnimatedCategories] = useState(categories.map(() => 0));
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setIsVisible(true);
      }
    }, {
      threshold: 0.3
    });
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (isVisible) {
      // Animate score
      const duration = 2000;
      const steps = 60;
      const increment = score / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= score) {
          setAnimatedScore(score);
          clearInterval(timer);
        } else {
          setAnimatedScore(current);
        }
      }, duration / steps);

      // Animate categories
      categories.forEach((cat, idx) => {
        const catIncrement = cat.value / steps;
        let catCurrent = 0;
        const catTimer = setInterval(() => {
          catCurrent += catIncrement;
          if (catCurrent >= cat.value) {
            setAnimatedCategories(prev => {
              const newArr = [...prev];
              newArr[idx] = cat.value;
              return newArr;
            });
            clearInterval(catTimer);
          } else {
            setAnimatedCategories(prev => {
              const newArr = [...prev];
              newArr[idx] = catCurrent;
              return newArr;
            });
          }
        }, duration / steps);
      });
      return () => clearInterval(timer);
    }
  }, [isVisible, score, categories]);

  // Calculate hexagon points based on category values
  const centerX = 150;
  const centerY = 150;
  const maxRadius = 100;
  const getHexagonPoints = (values: number[]) => {
    const points: string[] = [];
    values.forEach((value, idx) => {
      const angle = Math.PI * 2 * idx / 6 - Math.PI / 2;
      const radius = value / 100 * maxRadius;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      points.push(`${x},${y}`);
    });
    return points.join(' ');
  };
  const getOuterHexagonPoints = () => {
    const points: string[] = [];
    for (let i = 0; i < 6; i++) {
      const angle = Math.PI * 2 * i / 6 - Math.PI / 2;
      const x = centerX + maxRadius * Math.cos(angle);
      const y = centerY + maxRadius * Math.sin(angle);
      points.push(`${x},${y}`);
    }
    return points.join(' ');
  };
  const categoryLabels = categories.map((cat, idx) => {
    const angle = Math.PI * 2 * idx / 6 - Math.PI / 2;
    const labelRadius = maxRadius + 35;
    const x = centerX + labelRadius * Math.cos(angle);
    const y = centerY + labelRadius * Math.sin(angle);
    return {
      ...cat,
      x,
      y
    };
  });
  return <div ref={containerRef} className="relative">
      {/* Header */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <span className="font-semibold text-foreground text-base">Perfect Money Audit Score</span>
        <img src={pmLogo} alt="PM" className="h-6 w-6" />
      </div>

      {/* Score Display */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <span className="text-5xl font-bold text-primary">{animatedScore.toFixed(2)}</span>
        <span className={`text-3xl font-bold px-4 py-1 rounded-lg ${grade === 'AAA' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
          {grade}
        </span>
      </div>

      {/* Hexagon Chart */}
      <div className="relative w-[300px] h-[300px] mx-auto">
        <svg viewBox="0 0 300 300" className="w-full h-full">
          <defs>
            <linearGradient id="hexGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(220, 80%, 30%)" stopOpacity="0.9" />
              <stop offset="50%" stopColor="hsl(0, 0%, 10%)" stopOpacity="0.85" />
              <stop offset="100%" stopColor="hsl(0, 70%, 45%)" stopOpacity="0.8" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Grid lines */}
          {[20, 40, 60, 80, 100].map((level, idx) => <polygon key={idx} points={getHexagonPoints(Array(6).fill(level))} fill="none" stroke="hsl(var(--border))" strokeWidth="1" opacity={0.3} />)}

          {/* Axis lines */}
          {Array(6).fill(0).map((_, idx) => {
          const angle = Math.PI * 2 * idx / 6 - Math.PI / 2;
          const x = centerX + maxRadius * Math.cos(angle);
          const y = centerY + maxRadius * Math.sin(angle);
          return <line key={idx} x1={centerX} y1={centerY} x2={x} y2={y} stroke="hsl(var(--border))" strokeWidth="1" opacity={0.3} />;
        })}

          {/* Outer hexagon border */}
          <polygon points={getOuterHexagonPoints()} fill="none" stroke="hsl(var(--border))" strokeWidth="2" opacity={0.5} />

          {/* Data hexagon */}
          <polygon points={getHexagonPoints(animatedCategories)} fill="url(#hexGradient)" stroke="hsl(220, 80%, 40%)" strokeWidth="2" filter="url(#glow)" className="transition-all duration-300" />

        </svg>
        
        {/* Category labels with tooltips */}
        <TooltipProvider>
          {categoryLabels.map((label, idx) => {
          const description = categoryDescriptions[label.name] || `Score: ${animatedCategories[idx]?.toFixed(1) || 0}/100`;
          return <Tooltip key={idx}>
                <TooltipTrigger asChild>
                  <div className="absolute cursor-help text-xs font-medium text-muted-foreground hover:text-primary transition-colors" style={{
                left: `${label.x / 300 * 100}%`,
                top: `${label.y / 300 * 100}%`,
                transform: 'translate(-50%, -50%)'
              }}>
                    {label.name}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[200px] text-center">
                  <p className="font-semibold mb-1">{label.name}: {animatedCategories[idx]?.toFixed(1) || 0}/100</p>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </TooltipContent>
              </Tooltip>;
        })}
        </TooltipProvider>
      </div>

      {/* Stats Row */}
      <div className="flex items-center justify-center gap-4 mt-6 text-sm">
        <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 rounded-lg">
          <div className="w-4 h-4 rounded bg-red-500 flex items-center justify-center text-white text-xs">✓</div>
          <span className="text-red-400">15</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 rounded-lg">
          <div className="w-4 h-4 rounded bg-blue-500 flex items-center justify-center text-white text-xs">i</div>
          <span className="text-blue-400">1</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-gray-500/20 rounded-lg">
          <div className="w-4 h-4 rounded bg-gray-500 flex items-center justify-center text-white text-xs">0</div>
          <span className="text-gray-400">0</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/20 rounded-lg">
          <div className="w-4 h-4 rounded bg-yellow-500 flex items-center justify-center text-white text-xs">⚠</div>
          <span className="text-yellow-400">0</span>
        </div>
      </div>
    </div>;
};