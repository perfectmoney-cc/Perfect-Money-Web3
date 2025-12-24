import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Header } from "@/components/Header";
import { TradingViewTicker } from "@/components/TradingViewTicker";
import { HeroBanner } from "@/components/HeroBanner";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Footer } from "@/components/Footer";
import { WalletCard } from "@/components/WalletCard";
import { 
  ArrowLeft, 
  Package, 
  Search,
  Clock,
  CheckCircle2,
  Truck,
  MapPin,
  ExternalLink,
  ShoppingBag,
  Calendar,
  CreditCard,
  Copy,
  Filter
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useOrderHistory, Order } from "@/hooks/useOrderHistory";
import { format } from "date-fns";

const OrderHistoryPage = () => {
  const { orders } = useOrderHistory();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const statusFilters = [
    { id: "all", name: "All Orders" },
    { id: "pending", name: "Pending" },
    { id: "confirmed", name: "Confirmed" },
    { id: "processing", name: "Processing" },
    { id: "shipped", name: "Shipped" },
    { id: "delivered", name: "Delivered" },
  ];

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30';
      case 'confirmed': return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
      case 'processing': return 'bg-purple-500/10 text-purple-500 border-purple-500/30';
      case 'shipped': return 'bg-orange-500/10 text-orange-500 border-orange-500/30';
      case 'delivered': return 'bg-green-500/10 text-green-500 border-green-500/30';
      case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle2 className="h-4 w-4" />;
      case 'processing': return <Package className="h-4 w-4" />;
      case 'shipped': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle2 className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = selectedStatus === "all" || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 lg:pb-0">
      <Header />
      <TradingViewTicker />
      <HeroBanner 
        title="Order History" 
        subtitle="Track your merchandise orders" 
      />
      
      <main className="container mx-auto px-4 pt-12 pb-12 flex-1">
        <div className="md:hidden mt-5 mb-6">
          <WalletCard showQuickFunctionsToggle={false} compact={true} />
        </div>

        <div className="flex items-center justify-between mb-6">
          <Link to="/dashboard/store" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm">
            <ArrowLeft className="h-4 w-4" />
            Back to Store
          </Link>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-lg bg-gradient-to-r from-primary/20 to-blue-500/20">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-xl">My Orders</h1>
              <p className="text-muted-foreground text-sm">View and track your purchase history</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders by number or product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {statusFilters.map((filter) => (
                <Button
                  key={filter.id}
                  variant={selectedStatus === filter.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedStatus(filter.id)}
                  className="whitespace-nowrap"
                >
                  {filter.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-4 bg-card/50 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{orders.length}</p>
                  <p className="text-xs text-muted-foreground">Total Orders</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-card/50 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <Clock className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{orders.filter(o => o.status === 'pending' || o.status === 'processing').length}</p>
                  <p className="text-xs text-muted-foreground">In Progress</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-card/50 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <Truck className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{orders.filter(o => o.status === 'shipped').length}</p>
                  <p className="text-xs text-muted-foreground">Shipped</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-card/50 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{orders.filter(o => o.status === 'delivered').length}</p>
                  <p className="text-xs text-muted-foreground">Delivered</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <Card className="p-12 text-center bg-card/50 backdrop-blur-sm">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No orders found</h3>
              <p className="text-muted-foreground mb-4">
                {orders.length === 0 
                  ? "You haven't placed any orders yet." 
                  : "No orders match your search criteria."}
              </p>
              <Link to="/dashboard/store">
                <Button className="bg-primary">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Start Shopping
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <Card key={order.id} className="p-4 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="flex -space-x-2">
                        {order.items.slice(0, 3).map((item, idx) => (
                          <div 
                            key={idx} 
                            className="w-12 h-12 rounded-lg bg-muted/30 flex items-center justify-center text-2xl border-2 border-background"
                          >
                            {item.image}
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-xs font-semibold border-2 border-background">
                            +{order.items.length - 3}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{order.orderNumber}</h3>
                          <Badge className={getStatusColor(order.status)}>
                            {getStatusIcon(order.status)}
                            <span className="ml-1 capitalize">{order.status}</span>
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {order.items.length} item{order.items.length > 1 ? 's' : ''} • {order.total} PM
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3" />
                          {format(order.createdAt, 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {order.txHash && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`https://bscscan.com/tx/${order.txHash}`, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View TX
                        </Button>
                      )}
                      <Button
                        size="sm"
                        onClick={() => viewOrderDetails(order)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Order Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4">
              {/* Order Info */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Order Number</p>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{selectedOrder.orderNumber}</p>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => copyToClipboard(selectedOrder.orderNumber)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <Badge className={getStatusColor(selectedOrder.status)}>
                  {getStatusIcon(selectedOrder.status)}
                  <span className="ml-1 capitalize">{selectedOrder.status}</span>
                </Badge>
              </div>

              {/* Transaction Hash */}
              {selectedOrder.txHash && (
                <Card className="p-3 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Transaction Hash</p>
                      <p className="text-sm font-mono truncate max-w-[200px]">{selectedOrder.txHash}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`https://bscscan.com/tx/${selectedOrder.txHash}`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              )}

              {/* Items */}
              <div>
                <p className="text-sm font-medium mb-2">Items</p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                    <Card key={idx} className="p-3">
                      <div className="flex gap-3">
                        <div className="w-12 h-12 rounded-lg bg-muted/30 flex items-center justify-center text-2xl shrink-0">
                          {item.image}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.name}</p>
                          <div className="flex gap-2 text-xs text-muted-foreground">
                            {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                            {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-muted-foreground">Qty: {item.quantity}</span>
                            <span className="font-semibold text-primary">{item.price * item.quantity} PM</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Shipping */}
              <div>
                <p className="text-sm font-medium mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Shipping Address
                </p>
                <Card className="p-3 bg-muted/30">
                  <p className="font-medium">{selectedOrder.shippingInfo.fullName}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.shippingInfo.address}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedOrder.shippingInfo.city}, {selectedOrder.shippingInfo.state} {selectedOrder.shippingInfo.zipCode}
                  </p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.shippingInfo.country}</p>
                  <p className="text-sm text-muted-foreground mt-2">{selectedOrder.shippingInfo.email}</p>
                  {selectedOrder.shippingInfo.phone && (
                    <p className="text-sm text-muted-foreground">{selectedOrder.shippingInfo.phone}</p>
                  )}
                </Card>
              </div>

              {/* Payment Summary */}
              <div>
                <p className="text-sm font-medium mb-2 flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Payment Summary
                </p>
                <Card className="p-3 bg-muted/30">
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{selectedOrder.subtotal} PM</span>
                    </div>
                    {selectedOrder.discount > 0 && (
                      <div className="flex justify-between text-green-500">
                        <span>Discount {selectedOrder.voucherCode && `(${selectedOrder.voucherCode})`}</span>
                        <span>-{selectedOrder.discount} PM</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold pt-2 border-t">
                      <span>Total</span>
                      <span className="text-primary">{selectedOrder.total} PM</span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Timeline */}
              <div>
                <p className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Order Timeline
                </p>
                <Card className="p-3 bg-muted/30">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span>Order placed</span>
                      <span className="text-muted-foreground ml-auto">
                        {format(selectedOrder.createdAt, 'MMM dd, HH:mm')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${selectedOrder.status !== 'pending' ? 'bg-green-500' : 'bg-muted'}`} />
                      <span>Payment confirmed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${['processing', 'shipped', 'delivered'].includes(selectedOrder.status) ? 'bg-green-500' : 'bg-muted'}`} />
                      <span>Processing</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${['shipped', 'delivered'].includes(selectedOrder.status) ? 'bg-green-500' : 'bg-muted'}`} />
                      <span>Shipped</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${selectedOrder.status === 'delivered' ? 'bg-green-500' : 'bg-muted'}`} />
                      <span>Delivered</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default OrderHistoryPage;
