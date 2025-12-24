import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useReadContract } from "wagmi";
import { PMPresaleABI } from "@/contracts/abis";
import { CONTRACT_ADDRESSES } from "@/contracts/addresses";

const PRESALE_ADDRESS = CONTRACT_ADDRESSES[56].PMPresale as `0x${string}`;

interface PromoBannerProps {
  text?: string;
  endDate?: string;
  bonusPercentage?: number;
}

export const PromoBanner = ({
  endDate,
  bonusPercentage = 10,
}: PromoBannerProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Fetch presale round info to get actual end time
  const { data: activeRoundData } = useReadContract({
    address: PRESALE_ADDRESS,
    abi: PMPresaleABI,
    functionName: "getActiveRound",
    chainId: 56,
  });

  const { data: seedRoundData } = useReadContract({
    address: PRESALE_ADDRESS,
    abi: PMPresaleABI,
    functionName: "getRoundInfo",
    args: [0],
    chainId: 56,
  });

  const { data: privateRoundData } = useReadContract({
    address: PRESALE_ADDRESS,
    abi: PMPresaleABI,
    functionName: "getRoundInfo",
    args: [1],
    chainId: 56,
  });

  const { data: publicRoundData } = useReadContract({
    address: PRESALE_ADDRESS,
    abi: PMPresaleABI,
    functionName: "getRoundInfo",
    args: [2],
    chainId: 56,
  });

  // Mouse drag handlers for horizontal scroll
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollRef.current) return;
    setStartX(e.touches[0].pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!scrollRef.current) return;
    const x = e.touches[0].pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  // Get the presale end time from contract data
  const getPresaleEndTime = () => {
    const activeRound = activeRoundData !== undefined ? Number(activeRoundData) : -1;
    
    // Pick the current or next active round's end time
    const rounds = [seedRoundData, privateRoundData, publicRoundData];
    
    if (activeRound >= 0 && activeRound < 3 && rounds[activeRound]) {
      const roundData = rounds[activeRound] as any;
      return Number(roundData[4]) * 1000; // end timestamp in milliseconds
    }
    
    // If no active round, try to find the next upcoming round
    for (const roundData of rounds) {
      if (roundData) {
        const data = roundData as any;
        const endTime = Number(data[4]) * 1000;
        if (endTime > Date.now()) {
          return endTime;
        }
      }
    }
    
    // Fallback: use endDate prop or default 90 days from now
    if (endDate) {
      return new Date(endDate).getTime();
    }
    return Date.now() + (90 * 24 * 60 * 60 * 1000);
  };

  // Calculate time left based on presale contract data
  useEffect(() => {
    const calculateTimeLeft = () => {
      const targetTime = getPresaleEndTime();
      const now = Date.now();
      const difference = targetTime - now;

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate, activeRoundData, seedRoundData, privateRoundData, publicRoundData]);

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-[#E53E3E] via-[#d63030] to-[#E53E3E] text-white py-2.5 px-4 sticky top-0 z-50">
      <div
        ref={scrollRef}
        className="container mx-auto flex items-center justify-between gap-2 md:gap-4 overflow-x-auto md:overflow-hidden scrollbar-hide cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <div className="flex items-center gap-2 text-xs md:text-sm font-medium whitespace-nowrap flex-shrink-0">
          <span>🚀 Token Sale is now Open: Buy PM Token & Get {bonusPercentage}% Bonus!</span>
        </div>

        <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm font-mono font-bold shrink-0">
          <span className="bg-black/20 px-1.5 py-0.5 rounded">{timeLeft.days}d</span>
          <span>:</span>
          <span className="bg-black/20 px-1.5 py-0.5 rounded">{String(timeLeft.hours).padStart(2, "0")}h</span>
          <span>:</span>
          <span className="bg-black/20 px-1.5 py-0.5 rounded">{String(timeLeft.minutes).padStart(2, "0")}m</span>
          <span className="hidden md:inline">:</span>
          <span className="hidden md:inline bg-black/20 px-1.5 py-0.5 rounded">
            {String(timeLeft.seconds).padStart(2, "0")}s
          </span>
        </div>

        <div className="flex items-center gap-1 md:gap-2 shrink-0">
          <Button
            variant="default"
            size="sm"
            className="bg-black hover:bg-black/90 text-white font-medium text-xs md:text-sm px-2 md:px-4 h-7 md:h-8"
            onClick={() => navigate("/dashboard/buy")}
          >
            Buy Now
          </Button>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-white/10 rounded transition-colors"
            aria-label="Close banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
