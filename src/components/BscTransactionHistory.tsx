import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle2, XCircle, ExternalLink, Loader2, Filter, Calendar, ChevronDown, Download } from "lucide-react";
import { useBscTransactions, BscTransaction } from "@/hooks/useBscTransactions";
import { format, formatDistanceToNow, subDays, subMonths, isAfter, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import bnbLogo from "@/assets/bnb-logo.png";
import pmLogo from "@/assets/pm-logo-new.png";
import usdtLogo from "@/assets/usdt-logo.png";
import usdcLogo from "@/assets/usdc-logo.png";
import pyusdLogo from "@/assets/pyusd-logo.png";

const TOKEN_ICONS: Record<string, string> = {
  BNB: bnbLogo,
  PM: pmLogo,
  USDT: usdtLogo,
  USDC: usdcLogo,
  PYUSD: pyusdLogo,
};

const formatAmount = (value: string): string => {
  return parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const BscTransactionHistory = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { transactions, isLoading, error } = useBscTransactions();
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

  const getIcon = (type: BscTransaction['type']) => {
    switch (type) {
      case 'send':
        return <ArrowUpRight className="h-4 w-4 text-red-400" />;
      case 'receive':
        return <ArrowDownLeft className="h-4 w-4 text-green-400" />;
      default:
        return <ArrowUpRight className="h-4 w-4 text-blue-400" />;
    }
  };

  const getStatusIcon = (status: BscTransaction['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-3.5 w-3.5 text-yellow-400 animate-pulse" />;
      case 'completed':
        return <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />;
      case 'failed':
        return <XCircle className="h-3.5 w-3.5 text-red-400" />;
    }
  };

  const getStatusBadge = (status: BscTransaction['status']) => {
    const variants = {
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      completed: 'bg-green-500/20 text-green-400 border-green-500/30',
      failed: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return variants[status];
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(parseInt(timestamp) * 1000);
    return format(date, "MMM d, yyyy h:mm a");
  };

  const exportToCSV = () => {
    if (filteredTransactions.length === 0) {
      toast.error("No transactions to export");
      return;
    }
    
    const headers = ["Type", "From", "To", "Amount", "Token", "Status", "Date", "Hash"];
    const rows = filteredTransactions.map(tx => [
      tx.type,
      tx.from,
      tx.to,
      formatAmount(tx.value),
      tx.tokenSymbol,
      tx.status,
      format(new Date(parseInt(tx.timeStamp) * 1000), "MMM d, yyyy h:mm a"),
      tx.hash
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions_${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Transactions exported to CSV");
  };

  const exportToPDF = async () => {
    if (filteredTransactions.length === 0) {
      toast.error("No transactions to export");
      return;
    }

    const html2pdf = (await import("html2pdf.js")).default;
    
    const content = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h1 style="color: #dc2626; margin-bottom: 20px;">Transaction History</h1>
        <p style="color: #666; margin-bottom: 20px;">Generated on ${format(new Date(), "MMMM d, yyyy")}</p>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <thead>
            <tr style="background: #1a1a2e; color: white;">
              <th style="padding: 10px; text-align: left;">Type</th>
              <th style="padding: 10px; text-align: left;">Address</th>
              <th style="padding: 10px; text-align: right;">Amount</th>
              <th style="padding: 10px; text-align: center;">Status</th>
              <th style="padding: 10px; text-align: right;">Date</th>
            </tr>
          </thead>
          <tbody>
            ${filteredTransactions.map((tx, i) => `
              <tr style="background: ${i % 2 === 0 ? '#f8f9fa' : '#ffffff'};">
                <td style="padding: 10px; text-transform: capitalize;">${tx.type}</td>
                <td style="padding: 10px;">${tx.type === 'send' ? tx.to.slice(0, 10) + '...' : tx.from.slice(0, 10) + '...'}</td>
                <td style="padding: 10px; text-align: right; color: ${tx.type === 'receive' ? '#22c55e' : '#ef4444'};">
                  ${tx.type === 'receive' ? '+' : '-'}${formatAmount(tx.value)} ${tx.tokenSymbol}
                </td>
                <td style="padding: 10px; text-align: center;">${tx.status}</td>
                <td style="padding: 10px; text-align: right;">${format(new Date(parseInt(tx.timeStamp) * 1000), "MMM d, yyyy h:mm a")}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
    
    const element = document.createElement("div");
    element.innerHTML = content;
    
    html2pdf().from(element).set({
      margin: 10,
      filename: `transactions_${format(new Date(), "yyyy-MM-dd")}.pdf`,
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
    }).save();
    
    toast.success("Transactions exported to PDF");
  };

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    // Type filter
    if (typeFilter !== "all" && tx.type !== typeFilter) {
      return false;
    }

    // Date filter
    if (dateFilter !== "all") {
      const txDate = new Date(parseInt(tx.timeStamp) * 1000);
      const now = new Date();
      
      switch (dateFilter) {
        case "today":
          if (!isAfter(txDate, subDays(now, 1))) return false;
          break;
        case "week":
          if (!isAfter(txDate, subDays(now, 7))) return false;
          break;
        case "month":
          if (!isAfter(txDate, subMonths(now, 1))) return false;
          break;
        case "3months":
          if (!isAfter(txDate, subMonths(now, 3))) return false;
          break;
      }
    }

    return true;
  });

  // Skeleton loading component
  const TransactionSkeleton = () => (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <div className="text-right space-y-2">
            <Skeleton className="h-4 w-20 ml-auto" />
            <Skeleton className="h-3 w-16 ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );

  if (isLoading && transactions.length === 0) {
    return (
      <Card className="p-6 bg-card border-border">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Transaction History (BSC)
        </h3>
        <TransactionSkeleton />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 bg-card border-border">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Transaction History (BSC)
        </h3>
        <div className="text-center py-8 text-muted-foreground">
          <XCircle className="h-8 w-8 mx-auto mb-2 text-red-400" />
          <p>{error}</p>
        </div>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card className="p-6 bg-card border-border">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Transaction History (BSC)
        </h3>
        <div className="text-center py-8 text-muted-foreground">
          <p>No transactions yet</p>
          <p className="text-sm mt-1">Your BSC transactions will appear here</p>
        </div>
      </Card>
    );
  }

  const TransactionList = () => (
    <>
      {/* Filter summary */}
      {(typeFilter !== "all" || dateFilter !== "all") && (
        <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
          <span>Showing {filteredTransactions.length} of {transactions.length} transactions</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => {
              setTypeFilter("all");
              setDateFilter("all");
            }}
          >
            Clear filters
          </Button>
        </div>
      )}

      <ScrollArea className="h-[300px] md:h-[350px]">
        <div className="overflow-x-auto">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No transactions match your filters</p>
              <Button
                variant="link"
                size="sm"
                onClick={() => {
                  setTypeFilter("all");
                  setDateFilter("all");
                }}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="space-y-2 min-w-[500px] md:min-w-0 pr-4">
              {filteredTransactions.map((tx) => (
                <div
                  key={tx.hash}
                  className="flex items-center justify-between p-2 md:p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
                >
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="p-1.5 md:p-2 rounded-full bg-background">
                      {getIcon(tx.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1 md:gap-2">
                        <span className="font-medium capitalize text-sm md:text-base">{tx.type}</span>
                        <Badge variant="outline" className={`text-[8px] md:text-[10px] ${getStatusBadge(tx.status)}`}>
                          {getStatusIcon(tx.status)}
                          <span className="ml-1">{tx.status}</span>
                        </Badge>
                      </div>
                      <p className="text-[10px] md:text-xs text-muted-foreground">
                        {tx.type === 'send' ? 'To: ' : 'From: '}
                        {truncateAddress(tx.type === 'send' ? tx.to : tx.from)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={`font-semibold text-xs md:text-base flex items-center justify-end gap-1 ${tx.type === 'receive' ? 'text-green-400' : 'text-red-400'}`}>
                      <img src={TOKEN_ICONS[tx.tokenSymbol] || pmLogo} alt={tx.tokenSymbol} className="h-4 w-4 md:h-5 md:w-5" />
                      <span className="whitespace-nowrap">{tx.type === 'receive' ? '+' : '-'}{formatAmount(tx.value)}</span>
                      <span className="hidden md:inline">{tx.tokenSymbol}</span>
                    </div>
                    <div className="flex items-center justify-end gap-1 md:gap-2">
                      <p className="text-[10px] md:text-xs text-muted-foreground">
                        {formatTimestamp(tx.timeStamp)}
                      </p>
                      <a 
                        href={`https://bscscan.com/tx/${tx.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </>
  );

  // Mobile collapsible view
  const MobileView = () => (
    <Card className="md:hidden p-4 bg-card border-border">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full">
          <h3 className="font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Transaction History
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </h3>
          <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4">
          {/* Filters and Export - Single horizontal line */}
          <div className="flex items-center gap-2 mb-4">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[80px] h-8 text-xs">
                <Filter className="h-3 w-3 mr-1" />
                <SelectValue placeholder="All..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All...</SelectItem>
                <SelectItem value="send">Send</SelectItem>
                <SelectItem value="receive">Receive</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[80px] h-8 text-xs">
                <Calendar className="h-3 w-3 mr-1" />
                <SelectValue placeholder="All..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All...</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">7 Days</SelectItem>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="3months">3 Mo.</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-1 ml-auto">
              <Button variant="outline" size="sm" className="h-8 px-2 text-xs" onClick={exportToCSV}>
                <Download className="h-3 w-3" />
              </Button>
              <Button variant="outline" size="sm" className="h-8 px-2 text-xs" onClick={exportToPDF}>
                PDF
              </Button>
            </div>
          </div>
          <TransactionList />
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );

  // Desktop view
  const DesktopView = () => (
    <Card className="hidden md:block p-6 bg-card border-border">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Transaction History (BSC)
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </h3>
        
        {/* Filters and Export */}
        <div className="flex items-center gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[120px] h-8 text-xs">
              <Filter className="h-3 w-3 mr-1" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="send">Send</SelectItem>
              <SelectItem value="receive">Receive</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[130px] h-8 text-xs">
              <Calendar className="h-3 w-3 mr-1" />
              <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={exportToCSV}>
            <Download className="h-3 w-3 mr-1" />
            CSV
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={exportToPDF}>
            <Download className="h-3 w-3 mr-1" />
            PDF
          </Button>
        </div>
      </div>
      <TransactionList />
    </Card>
  );

  return (
    <>
      <MobileView />
      <DesktopView />
    </>
  );
};