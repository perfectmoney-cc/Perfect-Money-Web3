import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, ShoppingCart, Plus, Minus, Trash2, CreditCard, 
  Package, Receipt, CheckCircle, Loader2, Home, 
  Search, Grid3X3, List, Coins, Wallet
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useBalance } from "wagmi";
import { formatEther, parseEther, parseUnits } from "viem";
import pmTokenLogo from "@/assets/pm-token-logo.png";
import usdtLogo from "@/assets/usdt-logo.png";
import usdcLogo from "@/assets/usdc-logo.png";
import bnbLogo from "@/assets/bnb-logo.png";
import { Header } from "@/components/Header";
import { TradingViewTicker } from "@/components/TradingViewTicker";
import { HeroBanner } from "@/components/HeroBanner";
import { Footer } from "@/components/Footer";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { CONTRACT_ADDRESSES, TOKEN_METADATA } from "@/contracts/addresses";
import { PMStoreABI } from "@/contracts/storeABI";
import { paymentABI, PaymentCurrency } from "@/contracts/paymentABI";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STORE_CONTRACT_ADDRESS = CONTRACT_ADDRESSES[56].PMStore as `0x${string}`;
const PAYMENT_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000" as `0x${string}`;

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
  imageUri: string;
}

interface CartItem extends Product {
  quantity: number;
}

type PaymentToken = "PM" | "USDT" | "USDC" | "BNB" | "PYUSD";

const paymentTokens: { id: PaymentToken; name: string; logo: string; address: string }[] = [
  { id: "PM", name: "PM Token", logo: pmTokenLogo, address: CONTRACT_ADDRESSES[56].PMToken },
  { id: "USDT", name: "Tether USDT", logo: usdtLogo, address: CONTRACT_ADDRESSES[56].USDT },
  { id: "USDC", name: "USD Coin", logo: usdcLogo, address: CONTRACT_ADDRESSES[56].USDC },
  { id: "BNB", name: "BNB", logo: bnbLogo, address: CONTRACT_ADDRESSES[56].WBNB },
  { id: "PYUSD", name: "PayPal USD", logo: usdtLogo, address: "0x0000000000000000000000000000000000000000" },
];

// Mock exchange rates (in production, fetch from oracle or DEX)
const exchangeRates: Record<PaymentToken, number> = {
  PM: 1,
  USDT: 10000, // 1 USDT = 10000 PM
  USDC: 10000,
  BNB: 6000000, // 1 BNB = 6000000 PM (~$600)
  PYUSD: 10000,
};

const POSTerminal = () => {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showCheckout, setShowCheckout] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedPaymentToken, setSelectedPaymentToken] = useState<PaymentToken>("PM");
  const [customerAddress, setCustomerAddress] = useState("");

  // Read products from contract
  const { data: activeProductsData, refetch: refetchProducts } = useReadContract({
    address: STORE_CONTRACT_ADDRESS,
    abi: PMStoreABI,
    functionName: "getActiveProducts",
    chainId: 56,
  });

  // Get balances
  const { data: bnbBalance } = useBalance({
    address: address,
    chainId: 56,
  });

  // Parse products from contract data
  useEffect(() => {
    if (activeProductsData) {
      const parsed = (activeProductsData as any[]).map((p: any) => ({
        id: Number(p.id),
        name: p.name,
        price: Number(formatEther(p.price)),
        stock: Number(p.stock),
        category: getCategoryName(Number(p.category)),
        imageUri: p.imageUri || "/placeholder.svg",
      }));
      setProducts(parsed);
    } else {
      // Fallback mock products if contract not deployed
      setProducts([
        { id: 1, name: "PM Merchandise T-Shirt", price: 100, stock: 50, category: "Apparel", imageUri: "/placeholder.svg" },
        { id: 2, name: "PM Coffee Mug", price: 25, stock: 100, category: "Accessories", imageUri: "/placeholder.svg" },
        { id: 3, name: "PM Hoodie", price: 200, stock: 30, category: "Apparel", imageUri: "/placeholder.svg" },
        { id: 4, name: "PM Sticker Pack", price: 10, stock: 500, category: "Accessories", imageUri: "/placeholder.svg" },
        { id: 5, name: "PM Cap", price: 50, stock: 75, category: "Apparel", imageUri: "/placeholder.svg" },
        { id: 6, name: "PM Mousepad", price: 35, stock: 60, category: "Accessories", imageUri: "/placeholder.svg" },
      ]);
    }
  }, [activeProductsData]);

  const getCategoryName = (category: number): string => {
    const categories = ["Apparel", "Accessories", "Digital", "Services", "Other"];
    return categories[category] || "Other";
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          toast.error("Not enough stock");
          return prev;
        }
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    toast.success(`Added ${product.name} to cart`);
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === productId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return item;
          if (newQty > item.stock) {
            toast.error("Not enough stock");
            return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  // Cart total in PM
  const cartTotalPM = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Convert to selected payment token
  const getConvertedAmount = () => {
    const rate = exchangeRates[selectedPaymentToken];
    return cartTotalPM / rate;
  };

  const getTokenLogo = (token: PaymentToken) => {
    return paymentTokens.find(t => t.id === token)?.logo || pmTokenLogo;
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }

    setIsProcessing(true);
    
    try {
      // Simulate processing - in production, this would call the PMPayment contract
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Record sale in localStorage for now
      const sales = JSON.parse(localStorage.getItem("posSales") || "[]");
      const sale = {
        id: Date.now(),
        items: cart,
        totalPM: cartTotalPM,
        paymentToken: selectedPaymentToken,
        paymentAmount: getConvertedAmount(),
        timestamp: Date.now(),
        cashier: address,
        customer: customerAddress || "Walk-in",
      };
      sales.push(sale);
      localStorage.setItem("posSales", JSON.stringify(sales));
      
      toast.success(`Payment of ${getConvertedAmount().toFixed(6)} ${selectedPaymentToken} successful!`);
      setCart([]);
      setShowCheckout(false);
      setCustomerAddress("");
      refetchProducts();
    } catch (error: any) {
      toast.error(error?.message || "Payment failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 lg:pb-0">
      <Header />
      <TradingViewTicker />
      <HeroBanner 
        title="POS Terminal" 
        subtitle="Accept multi-token payments for your business"
      />
      
      <main className="container mx-auto px-4 pt-6 pb-12 flex-1">
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
              <BreadcrumbPage>POS Terminal</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Products Section */}
          <div className="lg:col-span-2 space-y-4">
            {/* Search and View Toggle */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-1 bg-muted rounded-lg p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Products Grid/List */}
            <div className={viewMode === "grid" 
              ? "grid grid-cols-2 md:grid-cols-3 gap-4" 
              : "space-y-2"
            }>
              {filteredProducts.map((product) => (
                <Card 
                  key={product.id}
                  className={`cursor-pointer hover:border-primary/50 transition-colors ${
                    viewMode === "list" ? "flex items-center p-3" : ""
                  }`}
                  onClick={() => addToCart(product)}
                >
                  {viewMode === "grid" ? (
                    <CardContent className="p-4">
                      <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                        <img 
                          src={product.imageUri} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
                        />
                      </div>
                      <h3 className="font-medium text-sm truncate">{product.name}</h3>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1">
                          <span className="font-bold">{product.price}</span>
                          <img src={pmTokenLogo} alt="PM" className="w-4 h-4" />
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {product.stock} left
                        </Badge>
                      </div>
                    </CardContent>
                  ) : (
                    <div className="flex items-center gap-4 w-full">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{product.name}</h3>
                        <p className="text-xs text-muted-foreground">{product.category}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 font-bold">
                          {product.price} <img src={pmTokenLogo} alt="PM" className="w-4 h-4" />
                        </div>
                        <p className="text-xs text-muted-foreground">{product.stock} in stock</p>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>

          {/* Cart Section */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Cart ({cart.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Cart is empty</p>
                    <p className="text-sm">Click products to add</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[250px] pr-4">
                    <div className="space-y-3">
                      {cart.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.price} PM × {item.quantity}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, -1); }}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-6 text-center text-sm">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, 1); }}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive"
                              onClick={(e) => { e.stopPropagation(); removeFromCart(item.id); }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}

                {/* Payment Token Selection */}
                {cart.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <Label className="text-sm font-medium mb-2 block">Payment Token</Label>
                    <Select value={selectedPaymentToken} onValueChange={(v) => setSelectedPaymentToken(v as PaymentToken)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentTokens.map((token) => (
                          <SelectItem key={token.id} value={token.id}>
                            <div className="flex items-center gap-2">
                              <img src={token.logo} alt={token.id} className="w-5 h-5 rounded-full" />
                              <span>{token.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Cart Total */}
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Subtotal (PM)</span>
                    <div className="flex items-center gap-1 font-medium">
                      {cartTotalPM.toLocaleString()}
                      <img src={pmTokenLogo} alt="PM" className="w-4 h-4" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4 p-3 bg-primary/10 rounded-lg">
                    <span className="font-medium">Pay with {selectedPaymentToken}</span>
                    <div className="flex items-center gap-1 text-xl font-bold text-primary">
                      {getConvertedAmount().toFixed(selectedPaymentToken === "BNB" ? 6 : 2)}
                      <img src={getTokenLogo(selectedPaymentToken)} alt={selectedPaymentToken} className="w-5 h-5 rounded-full" />
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    disabled={cart.length === 0 || !isConnected}
                    onClick={() => setShowCheckout(true)}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Checkout
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Checkout Dialog */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Confirm Payment
            </DialogTitle>
            <DialogDescription>
              Review your order and confirm payment
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Customer Address (Optional) */}
            <div>
              <Label className="text-sm">Customer Wallet (Optional)</Label>
              <div className="flex items-center gap-2 mt-1">
                <Wallet className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="0x..."
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="max-h-[150px] overflow-y-auto space-y-2">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.name} × {item.quantity}</span>
                  <span className="font-medium">{(item.price * item.quantity).toLocaleString()} PM</span>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{cartTotalPM.toLocaleString()} PM</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">Total</span>
                <div className="flex items-center gap-2 text-xl font-bold text-primary">
                  {getConvertedAmount().toFixed(selectedPaymentToken === "BNB" ? 6 : 2)}
                  <img src={getTokenLogo(selectedPaymentToken)} alt={selectedPaymentToken} className="w-6 h-6 rounded-full" />
                  <span className="text-sm">{selectedPaymentToken}</span>
                </div>
              </div>
            </div>

            {/* Payment Token Badges */}
            <div className="flex flex-wrap gap-2 justify-center">
              {paymentTokens.map((token) => (
                <Badge 
                  key={token.id}
                  variant={selectedPaymentToken === token.id ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedPaymentToken(token.id)}
                >
                  <img src={token.logo} alt={token.id} className="w-4 h-4 mr-1 rounded-full" />
                  {token.id}
                </Badge>
              ))}
            </div>

            <Button
              className="w-full"
              onClick={handleCheckout}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm Payment
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default POSTerminal;
