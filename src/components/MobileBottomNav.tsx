import { Send, ArrowDownToLine, Home, Wallet, TrendingUp } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export const MobileBottomNav = () => {
  const location = useLocation();

  const navItems = [
    { icon: Send, label: "Send", path: "/dashboard/send" },
    { icon: ArrowDownToLine, label: "Receive", path: "/dashboard/receive" },
    { icon: Home, label: "Dashboard", path: "/dashboard" },
    { icon: Wallet, label: "Buy", path: "/dashboard/buy" },
    { icon: TrendingUp, label: "Stake", path: "/dashboard/stake" },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-colors",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "text-primary")} />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
