import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { TradingViewTicker } from "@/components/TradingViewTicker";
import { HeroBanner } from "@/components/HeroBanner";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Footer } from "@/components/Footer";
import { WalletCard } from "@/components/WalletCard";
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Filter, 
  RefreshCw,
  ExternalLink,
  TrendingUp,
  DollarSign,
  Activity,
  CheckCircle2,
  Download,
  CalendarIcon,
  Home
} from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useMerchantTransactions, TransactionFilters } from "@/hooks/useMerchantTransactions";
import { TransactionAnalyticsChart } from "@/components/merchant/TransactionAnalyticsChart";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const MerchantTransactions = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const transactionsPerPage = 10;

  // Filters state
  const [filters, setFilters] = useState<TransactionFilters>({
    searchQuery: '',
    status: 'all',
    minAmount: '',
    maxAmount: '',
    dateFrom: undefined,
    dateTo: undefined,
  });

  const { transactions, isLoading, refetch, filterTransactions, getStats } = useMerchantTransactions();
  const stats = getStats();

  // Apply filters
  const filteredTransactions = useMemo(() => {
    return filterTransactions(filters);
  }, [filterTransactions, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);
  const startIndex = (currentPage - 1) * transactionsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + transactionsPerPage);

  const truncateAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  const exportToCSV = useCallback(() => {
    if (filteredTransactions.length === 0) {
      toast.error('No transactions to export');
      return;
    }

    // CSV headers
    const headers = ['Transaction ID', 'TX Hash', 'Customer Address', 'Amount (PM)', 'Status', 'Date', 'Time'];
    
    // CSV rows
    const rows = filteredTransactions.map(tx => [
      tx.id,
      tx.txHash,
      tx.customer,
      parseFloat(tx.amount).toFixed(4),
      tx.status,
      tx.timestamp.toLocaleDateString(),
      tx.timestamp.toLocaleTimeString(),
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `merchant-transactions-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Exported ${filteredTransactions.length} transactions to CSV`);
  }, [filteredTransactions]);

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 lg:pb-0">
      <Header />
      <TradingViewTicker />
      <HeroBanner 
        title="Transaction History" 
        subtitle="View and filter all your merchant transactions"
      />
      
      <main className="container mx-auto px-4 pt-6 lg:pt-12 pb-12 flex-1">
        <div className="md:hidden mb-6">
          <WalletCard showQuickFunctionsToggle={false} compact={true} />
        </div>

        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/dashboard" className="flex items-center gap-1">
                  <Home className="h-3.5 w-3.5" />
                  Dashboard
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/dashboard/merchant">Merchant</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Transactions</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="max-w-6xl mx-auto space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Transactions</p>
                    <p className="text-xl font-bold">{stats.totalTransactions}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <DollarSign className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Volume</p>
                    <p className="text-xl font-bold">{stats.totalVolume} PM</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <CheckCircle2 className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-xl font-bold">{stats.completedTransactions}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <TrendingUp className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Amount</p>
                    <p className="text-xl font-bold">{stats.averageAmount} PM</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analytics Chart */}
          <TransactionAnalyticsChart transactions={transactions} />

          {/* Transactions Table */}
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle>All Transactions</CardTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportToCSV}
                    disabled={filteredTransactions.length === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isLoading}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Search and Filters */}
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by transaction ID, address, or amount..."
                    value={filters.searchQuery}
                    onChange={(e) => setFilters(f => ({ ...f, searchQuery: e.target.value }))}
                    className="pl-9"
                  />
                </div>

                {showFilters && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 p-4 border border-border rounded-lg bg-muted/20">
                    {/* Date From */}
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">From Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !filters.dateFrom && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {filters.dateFrom ? format(filters.dateFrom, "PP") : "Pick date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={filters.dateFrom}
                            onSelect={(date) => setFilters(f => ({ ...f, dateFrom: date }))}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Date To */}
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">To Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !filters.dateTo && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {filters.dateTo ? format(filters.dateTo, "PP") : "Pick date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={filters.dateTo}
                            onSelect={(date) => setFilters(f => ({ ...f, dateTo: date }))}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Status */}
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Status</label>
                      <Select
                        value={filters.status}
                        onValueChange={(value) => setFilters(f => ({ ...f, status: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Min Amount */}
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Min Amount</label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={filters.minAmount}
                        onChange={(e) => setFilters(f => ({ ...f, minAmount: e.target.value }))}
                      />
                    </div>
                    
                    {/* Max Amount */}
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Max Amount</label>
                      <Input
                        type="number"
                        placeholder="∞"
                        value={filters.maxAmount}
                        onChange={(e) => setFilters(f => ({ ...f, maxAmount: e.target.value }))}
                      />
                    </div>
                    
                    {/* Clear Button */}
                    <div className="flex items-end">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setFilters({
                          searchQuery: '',
                          status: 'all',
                          minAmount: '',
                          maxAmount: '',
                          dateFrom: undefined,
                          dateTo: undefined,
                        })}
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Loading State */}
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                      <Skeleton className="h-6 w-24" />
                    </div>
                  ))}
                </div>
              ) : paginatedTransactions.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No transactions found</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {filters.searchQuery || filters.status !== 'all' || filters.minAmount || filters.maxAmount
                      ? 'Try adjusting your filters'
                      : 'Transactions will appear here when customers make payments'}
                  </p>
                </div>
              ) : (
                <>
                  {/* Transactions List */}
                  <div className="space-y-3">
                    {paginatedTransactions.map((transaction) => (
                      <div 
                        key={transaction.id} 
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors gap-3"
                      >
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium">
                              TX: {truncateAddress(transaction.txHash)}
                            </p>
                            {getStatusBadge(transaction.status)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                            <span>From: {truncateAddress(transaction.customer)}</span>
                            <span>•</span>
                            <span>{formatDistanceToNow(transaction.timestamp, { addSuffix: true })}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-primary text-lg">
                            +{parseFloat(transaction.amount).toFixed(2)} PM
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => window.open(`https://bscscan.com/tx/${transaction.txHash}`, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t">
                      <p className="text-sm text-muted-foreground">
                        Showing {startIndex + 1}-{Math.min(startIndex + transactionsPerPage, filteredTransactions.length)} of {filteredTransactions.length}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        
                        <span className="text-sm text-muted-foreground px-2">
                          Page {currentPage} of {totalPages}
                        </span>

                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default MerchantTransactions;
