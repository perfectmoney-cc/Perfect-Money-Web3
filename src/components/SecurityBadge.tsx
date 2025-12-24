import { Shield, CheckCircle } from "lucide-react";
import pmLogo from "@/assets/pm-logo-new.png";

interface SecurityBadgeProps {
  variant?: "light" | "dark" | "inline" | "full";
  size?: "sm" | "md" | "lg";
}

export const SecurityBadge = ({ variant = "dark", size = "md" }: SecurityBadgeProps) => {
  const sizeClasses = {
    sm: "px-3 py-2 text-xs",
    md: "px-4 py-3 text-sm",
    lg: "px-6 py-4 text-base",
  };

  const iconSize = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  if (variant === "inline") {
    return (
      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-900 via-black to-green-600 text-white px-3 py-1 rounded-full border border-green-500/30">
        <img src={pmLogo} alt="PM" className="h-4 w-4" />
        <span className="font-semibold text-sm">AAA Verified</span>
      </div>
    );
  }

  if (variant === "full") {
    return (
      <div className="bg-gradient-to-br from-[#0a0e1a] to-[#1a1f3c] border border-green-500/30 rounded-xl p-6 max-w-sm">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center border border-green-500/30">
            <img src={pmLogo} alt="PM" className="h-10 w-10" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">Perfect Money</h3>
            <p className="text-green-400 text-sm font-medium">AAA Security Rating</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Verified Smart Contract</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Multi-Audit Certified</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>0% Buy/Sell Tax</span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-between">
          <span className="text-xs text-gray-500">Score: 94.83/100</span>
          <div className="flex items-center gap-1">
            <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-bold rounded">AAA</span>
          </div>
        </div>
      </div>
    );
  }

  const bgClass = variant === "light" 
    ? "bg-gradient-to-r from-blue-900 via-black to-green-600" 
    : "bg-gradient-to-r from-blue-900 via-black to-red-600";

  const logoSize = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  return (
    <div className={`inline-flex items-center gap-3 ${bgClass} text-white ${sizeClasses[size]} rounded-lg shadow-lg`}>
      <img src={pmLogo} alt="Perfect Money" className={logoSize[size]} />
      <div className="text-left">
        <p className="font-bold leading-tight">Perfect Money Verified</p>
        <p className="text-xs opacity-90">AAA Security Rating</p>
      </div>
    </div>
  );
};
