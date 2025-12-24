import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Header } from "@/components/Header";
import { TradingViewTicker } from "@/components/TradingViewTicker";
import { HeroBanner } from "@/components/HeroBanner";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Footer } from "@/components/Footer";
import { WalletCard } from "@/components/WalletCard";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { 
  ArrowLeft, 
  Store, 
  ShoppingBag, 
  Gift, 
  Ticket, 
  Star, 
  Search,
  Shirt,
  Package,
  Wallet,
  CreditCard,
  MapPin,
  CheckCircle2,
  Loader2,
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  Percent,
  Zap,
  Trophy,
  Heart,
  Clock,
  History,
  ExternalLink,
  Coins,
  Home
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId } from "wagmi";
import { parseUnits, formatUnits, formatEther } from "viem";
import confetti from "canvas-confetti";
import { PM_TOKEN_ADDRESS, CONTRACT_ADDRESSES } from "@/contracts/addresses";
import { PMTokenABI } from "@/contracts/abis";
import { PMStoreABI } from "@/contracts/storeABI";
import { useOrderHistory } from "@/hooks/useOrderHistory";
import { ProductReviewsModal } from "@/components/store/ProductReviewsModal";

// Product Card Skeleton Component
const ProductCardSkeleton = () => (
  <Card className="overflow-hidden">
    <Skeleton className="aspect-square" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
  </Card>
);

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  discount: number;
  image: string;
  rating: number;
  totalRatings: number;
  sales: number;
  description: string;
  sizes?: string[];
  colors?: string[];
  stock: number;
}

interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

// Store wallet address for payments
const STORE_WALLET_ADDRESS = "0x2a09e2f78032e9e0e4b1a0da4e787c0e7a11b8c3";

const categoryMap: { [key: number]: string } = {
  0: "apparel",
  1: "accessories",
  2: "collectibles",
  3: "digital",
  4: "limited"
};

const categoryImages: { [key: string]: string } = {
  apparel: "👕",
  accessories: "🎒",
  collectibles: "🏆",
  digital: "💎",
  limited: "⭐",
  merchandise: "📦"
};

const StorePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCartModal, setShowCartModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [reviewProductId, setReviewProductId] = useState<number | null>(null);
  const [reviewProductName, setReviewProductName] = useState("");
  const [reviewProductImage, setReviewProductImage] = useState("");
  const [ratingProductId, setRatingProductId] = useState<number | null>(null);
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRating, setIsRating] = useState(false);
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discount: number } | null>(null);
  const [orderNumber, setOrderNumber] = useState("");
  const [txHash, setTxHash] = useState("");
  
  const { address, isConnected } = useAccount();
  const { addOrder } = useOrderHistory();
  
  const storeAddress = CONTRACT_ADDRESSES[56]?.PMStore as `0x${string}` | undefined;

  // Read blockchain products
  const { data: blockchainProducts, refetch: refetchProducts } = useReadContract({
    address: storeAddress,
    abi: PMStoreABI,
    functionName: "getActiveProducts",
  });

  // Read store stats
  const { data: storeStats } = useReadContract({
    address: storeAddress,
    abi: PMStoreABI,
    functionName: "getStoreStats",
  });

  // Read rating reward amount
  const { data: ratingReward } = useReadContract({
    address: storeAddress,
    abi: PMStoreABI,
    functionName: "ratingReward",
  });

  // Rate product contract call
  const { writeContractAsync: rateProductAsync } = useWriteContract();

  // Read PM token balance
  const { data: pmBalance } = useReadContract({
    address: PM_TOKEN_ADDRESS as `0x${string}`,
    abi: PMTokenABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  // Read allowance for store wallet
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: PM_TOKEN_ADDRESS as `0x${string}`,
    abi: PMTokenABI,
    functionName: 'allowance',
    args: address ? [address, STORE_WALLET_ADDRESS as `0x${string}`] : undefined,
  });

  // Approve PM tokens
  const { writeContract: approveTokens, data: approveHash, isPending: isApprovePending } = useWriteContract();

  // Transfer PM tokens
  const { writeContract: transferTokens, data: transferHash, isPending: isTransferPending } = useWriteContract();

  // Wait for approve transaction
  const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  // Wait for transfer transaction
  const { isLoading: isTransferConfirming, isSuccess: isTransferSuccess } = useWaitForTransactionReceipt({
    hash: transferHash,
  });

  // Handle successful approval
  useEffect(() => {
    if (isApproveSuccess) {
      setIsApproving(false);
      refetchAllowance();
      toast.success("PM tokens approved! Proceeding with payment...");
      executePayment();
    }
  }, [isApproveSuccess]);

  // Handle successful transfer
  useEffect(() => {
    if (isTransferSuccess && transferHash) {
      completeOrder(transferHash);
    }
  }, [isTransferSuccess, transferHash]);

  const formattedBalance = pmBalance ? Number(formatUnits(pmBalance as bigint, 18)).toFixed(2) : "0";

  const [shippingInfo, setShippingInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: ""
  });

  const categories = [
    { id: "all", name: "All", icon: ShoppingBag },
    { id: "apparel", name: "Apparel", icon: Shirt },
    { id: "accessories", name: "Accessories", icon: Gift },
    { id: "collectibles", name: "Collectibles", icon: Trophy },
    { id: "merchandise", name: "Merchandise", icon: Package },
  ];

  const mockProducts: Product[] = [
    { id: 1, name: "PM Logo T-Shirt", category: "apparel", price: 250, originalPrice: 300, discount: 17, image: "👕", rating: 4.9, totalRatings: 45, sales: 450, description: "Premium cotton t-shirt with Perfect Money logo embroidered", sizes: ["S", "M", "L", "XL", "XXL"], colors: ["Black", "White", "Red"], stock: 100 },
    { id: 2, name: "PM Hoodie Premium", category: "apparel", price: 500, originalPrice: 600, discount: 17, image: "🧥", rating: 4.8, totalRatings: 32, sales: 320, description: "Warm fleece hoodie with PM branding, perfect for crypto enthusiasts", sizes: ["S", "M", "L", "XL", "XXL"], colors: ["Black", "Navy", "Gray"], stock: 75 },
    { id: 3, name: "PM Baseball Cap", category: "accessories", price: 150, originalPrice: 180, discount: 17, image: "🧢", rating: 4.7, totalRatings: 89, sales: 890, description: "Adjustable baseball cap with embroidered PM logo", colors: ["Black", "White", "Red"], stock: 200 },
    { id: 4, name: "PM Crypto Mug", category: "merchandise", price: 100, originalPrice: 120, discount: 17, image: "☕", rating: 4.9, totalRatings: 125, sales: 1250, description: "Ceramic mug with PM logo, perfect for your morning coffee", colors: ["Black", "White"], stock: 500 },
    { id: 5, name: "PM Founder Badge (NFT)", category: "collectibles", price: 1000, originalPrice: 1500, discount: 33, image: "🏆", rating: 5.0, totalRatings: 5, sales: 50, description: "Exclusive NFT badge for early supporters, limited to 100 pieces", stock: 10 },
    { id: 6, name: "PM Laptop Sticker Pack", category: "accessories", price: 50, originalPrice: 60, discount: 17, image: "🎨", rating: 4.6, totalRatings: 210, sales: 2100, description: "Pack of 10 high-quality vinyl stickers with PM designs", stock: 1000 },
    { id: 7, name: "PM Backpack", category: "accessories", price: 400, originalPrice: 480, discount: 17, image: "🎒", rating: 4.8, totalRatings: 18, sales: 180, description: "Premium laptop backpack with PM branding and USB charging port", colors: ["Black", "Gray"], stock: 50 },
    { id: 8, name: "PM Polo Shirt", category: "apparel", price: 300, originalPrice: 350, discount: 14, image: "👔", rating: 4.7, totalRatings: 29, sales: 290, description: "Business casual polo with subtle PM logo", sizes: ["S", "M", "L", "XL", "XXL"], colors: ["Black", "White", "Navy"], stock: 120 },
    { id: 9, name: "PM Phone Case", category: "accessories", price: 80, originalPrice: 100, discount: 20, image: "📱", rating: 4.5, totalRatings: 75, sales: 750, description: "Durable phone case with PM design for iPhone & Android", stock: 300 },
    { id: 10, name: "PM Limited Edition Coin", category: "collectibles", price: 500, originalPrice: 600, discount: 17, image: "🪙", rating: 4.9, totalRatings: 10, sales: 100, description: "Physical commemorative coin with certificate of authenticity", stock: 25 },
    { id: 11, name: "PM Lanyard & Card Holder", category: "accessories", price: 75, originalPrice: 90, discount: 17, image: "🔖", rating: 4.6, totalRatings: 56, sales: 560, description: "Professional lanyard with ID card holder featuring PM branding", colors: ["Black", "Red"], stock: 400 },
    { id: 12, name: "PM Water Bottle", category: "merchandise", price: 120, originalPrice: 150, discount: 20, image: "🍶", rating: 4.8, totalRatings: 68, sales: 680, description: "Stainless steel insulated bottle with PM logo, 750ml", colors: ["Black", "White", "Red"], stock: 250 }
  ];

  // Transform blockchain products or use fallback mock products
  const products: Product[] = blockchainProducts && (blockchainProducts as any[]).length > 0
    ? (blockchainProducts as any[]).map((p: any) => ({
        id: Number(p.id),
        name: p.name,
        category: categoryMap[p.category] || "merchandise",
        price: Number(formatEther(p.price)),
        originalPrice: Number(formatEther(p.price)) * 1.2,
        discount: 17,
        image: categoryImages[categoryMap[p.category]] || "📦",
        rating: p.totalRatings > 0 ? Number(p.ratingSum) / Number(p.totalRatings) : 0,
        totalRatings: Number(p.totalRatings),
        sales: Number(p.totalSold),
        description: p.description,
        stock: Number(p.stock),
      }))
    : mockProducts;

  const vouchers = [
    { code: "PM10OFF", discount: 10 },
    { code: "NEWUSER", discount: 15 },
    { code: "HODLER20", discount: 20 },
    { code: "VIP25", discount: 25 },
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: Product, size?: string, color?: string) => {
    const existingItem = cart.find(
      item => item.id === product.id && item.selectedSize === size && item.selectedColor === color
    );

    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id && item.selectedSize === size && item.selectedColor === color
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1, selectedSize: size, selectedColor: color }]);
    }
    toast.success(`${product.name} added to cart!`);
  };

  const removeFromCart = (productId: number, size?: string, color?: string) => {
    setCart(cart.filter(
      item => !(item.id === productId && item.selectedSize === size && item.selectedColor === color)
    ));
  };

  const updateQuantity = (productId: number, size: string | undefined, color: string | undefined, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === productId && item.selectedSize === size && item.selectedColor === color) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const applyVoucher = () => {
    const voucher = vouchers.find(v => v.code.toUpperCase() === voucherCode.toUpperCase());
    if (voucher) {
      setAppliedVoucher(voucher);
      toast.success(`Voucher ${voucher.code} applied! ${voucher.discount}% discount`);
    } else {
      toast.error("Invalid voucher code");
    }
  };

  const getSubtotal = () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  const getDiscount = () => appliedVoucher ? (getSubtotal() * appliedVoucher.discount) / 100 : 0;
  
  const getTotal = () => getSubtotal() - getDiscount();

  const handleBuyNow = (product: Product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const handleAddFromModal = () => {
    if (selectedProduct) {
      const size = selectedProduct.sizes?.[0];
      const color = selectedProduct.colors?.[0];
      addToCart(selectedProduct, size, color);
      setShowProductModal(false);
      setShowCartModal(true);
    }
  };

  const executePayment = () => {
    const totalAmount = getTotal();
    const amountInWei = parseUnits(totalAmount.toString(), 18);

    try {
      transferTokens({
        address: PM_TOKEN_ADDRESS as `0x${string}`,
        abi: PMTokenABI,
        functionName: 'transfer',
        args: [STORE_WALLET_ADDRESS as `0x${string}`, amountInWei],
      } as any);
    } catch (error) {
      console.error("Transfer error:", error);
      toast.error("Payment failed. Please try again.");
      setIsProcessing(false);
    }
  };

  const completeOrder = (hash: string) => {
    const newOrderNumber = `PM${Date.now().toString().slice(-8)}`;
    setOrderNumber(newOrderNumber);
    setTxHash(hash);

    // Save order to history
    addOrder({
      orderNumber: newOrderNumber,
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
        image: item.image
      })),
      subtotal: getSubtotal(),
      discount: getDiscount(),
      total: getTotal(),
      voucherCode: appliedVoucher?.code,
      shippingInfo,
      status: 'confirmed',
      txHash: hash
    });
    
    setIsProcessing(false);
    setShowCheckoutModal(false);
    setShowSuccessModal(true);
    
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    setCart([]);
    setAppliedVoucher(null);
    setVoucherCode("");
    setShippingInfo({
      fullName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: ""
    });
  };

  const handleCheckout = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet to checkout");
      return;
    }

    if (!shippingInfo.fullName || !shippingInfo.email || !shippingInfo.address || !shippingInfo.city || !shippingInfo.country) {
      toast.error("Please fill in all required shipping details");
      return;
    }

    const totalAmount = getTotal();
    const amountInWei = parseUnits(totalAmount.toString(), 18);
    const currentBalance = pmBalance ? (pmBalance as bigint) : BigInt(0);

    if (currentBalance < amountInWei) {
      toast.error(`Insufficient PM balance. You need ${totalAmount} PM tokens.`);
      return;
    }

    setIsProcessing(true);

    const currentAllowance = allowance ? (allowance as bigint) : BigInt(0);

    if (currentAllowance < amountInWei) {
      setIsApproving(true);
      toast.info("Approving PM tokens for payment...");
      
      try {
        approveTokens({
          address: PM_TOKEN_ADDRESS as `0x${string}`,
          abi: PMTokenABI,
          functionName: 'approve',
          args: [STORE_WALLET_ADDRESS as `0x${string}`, amountInWei],
        } as any);
      } catch (error) {
        console.error("Approval error:", error);
        toast.error("Token approval failed. Please try again.");
        setIsProcessing(false);
        setIsApproving(false);
      }
    } else {
      executePayment();
    }
  };

  const handleOpenRatingModal = (productId: number) => {
    if (!isConnected) {
      toast.error("Please connect your wallet to rate products");
      return;
    }
    setRatingProductId(productId);
    setSelectedRating(0);
    setShowRatingModal(true);
  };

  const handleSubmitRating = async () => {
    if (!storeAddress || ratingProductId === null || selectedRating === 0) return;
    
    setIsRating(true);
    try {
      await rateProductAsync({
        address: storeAddress,
        abi: PMStoreABI,
        functionName: "rateProduct",
        args: [BigInt(ratingProductId), BigInt(selectedRating)]
      } as any);
      
      toast.success(`Thank you for rating! You earned PM tokens as a reward!`);
      setShowRatingModal(false);
      setSelectedRating(0);
      setRatingProductId(null);
      refetchProducts();
    } catch (error: any) {
      console.error("Rating error:", error);
      toast.error(error.message || "Failed to submit rating");
    } finally {
      setIsRating(false);
    }
  };

  const handleOpenReviewsModal = (product: Product) => {
    setReviewProductId(product.id);
    setReviewProductName(product.name);
    setReviewProductImage(product.image);
    setShowReviewsModal(true);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 lg:pb-0">
      <Header />
      <TradingViewTicker />
      <HeroBanner 
        title="PM Store" 
        subtitle="Official Perfect Money Merchandise" 
      />
      
      <main className="container mx-auto px-4 pt-12 pb-12 flex-1">
        {/* Mobile Wallet Card */}
        <div className="md:hidden mt-5 mb-6">
          <WalletCard showQuickFunctionsToggle={false} compact={true} />
        </div>

        {/* Breadcrumb Navigation */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/dashboard" className="flex items-center gap-1">
                  <Home className="h-4 w-4" />
                  Dashboard
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Store</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Link to="/dashboard/store/admin">
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                Admin
              </Button>
            </Link>
            <Link to="/dashboard/store/orders">
              <Button variant="outline" size="sm">
                <History className="h-4 w-4 mr-2" />
                Orders
              </Button>
            </Link>
            <Button 
              variant="outline" 
              className="relative"
              onClick={() => setShowCartModal(true)}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Cart
              {cart.length > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-lg bg-gradient-to-r from-primary/20 to-rose-500/20">
              <Store className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-xl">PM Merchandise Store</h1>
              <p className="text-muted-foreground text-sm">Official Perfect Money branded products</p>
            </div>
          </div>

          {/* Search and Categories */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="whitespace-nowrap"
                >
                  <category.icon className="h-4 w-4 mr-1" />
                  {category.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-4 bg-card/50 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{products.length}</p>
                  <p className="text-xs text-muted-foreground">Products</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-card/50 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Zap className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">5K+</p>
                  <p className="text-xs text-muted-foreground">Orders</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-card/50 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <Star className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">4.8</p>
                  <p className="text-xs text-muted-foreground">Rating</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-card/50 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Percent className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">20%</p>
                  <p className="text-xs text-muted-foreground">Avg Savings</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <Card 
                key={product.id} 
                className="p-4 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all group"
              >
                <div className="relative mb-4">
                  <div className="w-full h-32 rounded-lg bg-muted/30 flex items-center justify-center text-5xl">
                    {product.image}
                  </div>
                  {product.discount > 0 && (
                    <Badge className="absolute top-2 right-2 bg-red-500 text-white">
                      -{product.discount}%
                    </Badge>
                  )}
                  {product.stock < 20 && (
                    <Badge variant="secondary" className="absolute top-2 left-2 text-xs">
                      Low Stock
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-1">{product.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleOpenReviewsModal(product)}
                      className="flex items-center gap-1 hover:opacity-80 transition-opacity"
                    >
                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs">{product.rating.toFixed(1)}</span>
                    </button>
                    <button
                      onClick={() => handleOpenReviewsModal(product)}
                      className="text-xs text-primary hover:underline"
                    >
                      ({product.totalRatings} reviews)
                    </button>
                    <span className="text-xs text-muted-foreground">• {product.sales} sold</span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <span className="text-lg font-bold text-primary">{product.price} PM</span>
                      {product.discount > 0 && (
                        <span className="text-xs text-muted-foreground line-through ml-2">
                          {product.originalPrice} PM
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenRatingModal(product.id)}
                        className="px-2"
                      >
                        <Star className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => handleBuyNow(product)}
                        className="bg-primary hover:bg-primary/90"
                      >
                        Buy
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">No products found</p>
              <p className="text-sm text-muted-foreground mt-2">Try adjusting your search or filter</p>
            </div>
          )}

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <Card className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
              <div className="flex items-center gap-3">
                <Wallet className="h-8 w-8 text-green-500" />
                <div>
                  <h3 className="font-semibold">Pay with PM Tokens</h3>
                  <p className="text-xs text-muted-foreground">Use your tokens for purchases</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
              <div className="flex items-center gap-3">
                <Zap className="h-8 w-8 text-blue-500" />
                <div>
                  <h3 className="font-semibold">Fast Shipping</h3>
                  <p className="text-xs text-muted-foreground">Worldwide delivery available</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
              <div className="flex items-center gap-3">
                <Heart className="h-8 w-8 text-purple-500" />
                <div>
                  <h3 className="font-semibold">Premium Quality</h3>
                  <p className="text-xs text-muted-foreground">Official licensed merchandise</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Product Detail Modal */}
      <Dialog open={showProductModal} onOpenChange={setShowProductModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedProduct?.name}</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="w-full h-40 rounded-lg bg-muted/30 flex items-center justify-center text-7xl">
                {selectedProduct.image}
              </div>
              <p className="text-sm text-muted-foreground">{selectedProduct.description}</p>
              
              {selectedProduct.sizes && (
                <div>
                  <Label className="text-sm font-medium">Size</Label>
                  <div className="flex gap-2 mt-2">
                    {selectedProduct.sizes.map(size => (
                      <Badge key={size} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                        {size}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedProduct.colors && (
                <div>
                  <Label className="text-sm font-medium">Color</Label>
                  <div className="flex gap-2 mt-2">
                    {selectedProduct.colors.map(color => (
                      <Badge key={color} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                        {color}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between pt-4">
                <div>
                  <span className="text-2xl font-bold text-primary">{selectedProduct.price} PM</span>
                  {selectedProduct.discount > 0 && (
                    <span className="text-sm text-muted-foreground line-through ml-2">
                      {selectedProduct.originalPrice} PM
                    </span>
                  )}
                </div>
                <Button onClick={handleAddFromModal} className="bg-primary">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cart Modal */}
      <Dialog open={showCartModal} onOpenChange={setShowCartModal}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Shopping Cart ({cart.length} items)
            </DialogTitle>
          </DialogHeader>
          
          {cart.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item, index) => (
                <Card key={`${item.id}-${item.selectedSize}-${item.selectedColor}-${index}`} className="p-4">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-lg bg-muted/30 flex items-center justify-center text-3xl shrink-0">
                      {item.image}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{item.name}</h4>
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                        {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <span className="font-bold text-primary">{item.price * item.quantity} PM</span>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}

              {/* Voucher */}
              <div className="flex gap-2">
                <Input 
                  placeholder="Enter voucher code"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                />
                <Button variant="outline" onClick={applyVoucher}>
                  <Ticket className="h-4 w-4 mr-1" />
                  Apply
                </Button>
              </div>
              
              {appliedVoucher && (
                <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                  <span className="text-sm text-green-500 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Voucher {appliedVoucher.code} applied
                  </span>
                  <span className="text-green-500 font-medium">-{appliedVoucher.discount}%</span>
                </div>
              )}

              {/* Summary */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{getSubtotal()} PM</span>
                </div>
                {appliedVoucher && (
                  <div className="flex justify-between text-sm text-green-500">
                    <span>Discount</span>
                    <span>-{getDiscount().toFixed(0)} PM</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">{getTotal().toFixed(0)} PM</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCartModal(false)}>
              Continue Shopping
            </Button>
            <Button 
              onClick={() => {
                setShowCartModal(false);
                setShowCheckoutModal(true);
              }}
              disabled={cart.length === 0}
              className="bg-primary"
            >
              Proceed to Checkout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Checkout Modal */}
      <Dialog open={showCheckoutModal} onOpenChange={setShowCheckoutModal}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Checkout - Shipping Details
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Full Name *</Label>
                <Input 
                  value={shippingInfo.fullName}
                  onChange={(e) => setShippingInfo({...shippingInfo, fullName: e.target.value})}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label>Email *</Label>
                <Input 
                  type="email"
                  value={shippingInfo.email}
                  onChange={(e) => setShippingInfo({...shippingInfo, email: e.target.value})}
                  placeholder="john@example.com"
                />
              </div>
            </div>
            
            <div>
              <Label>Phone Number</Label>
              <Input 
                value={shippingInfo.phone}
                onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
                placeholder="+1 234 567 890"
              />
            </div>
            
            <div>
              <Label>Shipping Address *</Label>
              <Textarea 
                value={shippingInfo.address}
                onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                placeholder="123 Main Street, Apt 4B"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>City *</Label>
                <Input 
                  value={shippingInfo.city}
                  onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                  placeholder="New York"
                />
              </div>
              <div>
                <Label>State/Province</Label>
                <Input 
                  value={shippingInfo.state}
                  onChange={(e) => setShippingInfo({...shippingInfo, state: e.target.value})}
                  placeholder="NY"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>ZIP/Postal Code</Label>
                <Input 
                  value={shippingInfo.zipCode}
                  onChange={(e) => setShippingInfo({...shippingInfo, zipCode: e.target.value})}
                  placeholder="10001"
                />
              </div>
              <div>
                <Label>Country *</Label>
                <Input 
                  value={shippingInfo.country}
                  onChange={(e) => setShippingInfo({...shippingInfo, country: e.target.value})}
                  placeholder="United States"
                />
              </div>
            </div>

            {/* Order Summary */}
            <Card className="p-4 bg-muted/30">
              <h4 className="font-semibold mb-3">Order Summary</h4>
              <div className="space-y-2 text-sm">
                {cart.map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{item.name} x{item.quantity}</span>
                    <span>{item.price * item.quantity} PM</span>
                  </div>
                ))}
                {appliedVoucher && (
                  <div className="flex justify-between text-green-500">
                    <span>Discount ({appliedVoucher.code})</span>
                    <span>-{getDiscount().toFixed(0)} PM</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-primary">{getTotal().toFixed(0)} PM</span>
                </div>
              </div>
            </Card>

            {/* Payment Method */}
            <Card className="p-4 border-primary/30 bg-primary/5">
              <div className="flex items-center gap-3">
                <Wallet className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-semibold">Pay with PM Tokens</p>
                  <p className="text-xs text-muted-foreground">
                    {address ? `Connected: ${address.slice(0, 6)}...${address.slice(-4)}` : "Please connect wallet"}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCheckoutModal(false)}>
              Back to Cart
            </Button>
            <Button 
              onClick={handleCheckout}
              disabled={isProcessing || !isConnected}
              className="bg-gradient-to-r from-primary to-rose-600"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay {getTotal().toFixed(0)} PM
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="max-w-md text-center">
          <div className="py-6">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Order Confirmed!</h2>
            <p className="text-muted-foreground mb-4">
              Your payment has been processed on the blockchain.
            </p>
            
            <Card className="p-4 bg-muted/30 mb-4">
              <p className="text-sm text-muted-foreground">Order Number</p>
              <p className="text-xl font-bold font-mono text-primary">{orderNumber}</p>
            </Card>

            {txHash && (
              <Card className="p-3 bg-muted/30 mb-4">
                <p className="text-xs text-muted-foreground mb-1">Transaction Hash</p>
                <div className="flex items-center justify-center gap-2">
                  <p className="text-xs font-mono truncate max-w-[200px]">{txHash}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2"
                    onClick={() => window.open(`https://bscscan.com/tx/${txHash}`, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </Card>
            )}
            
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center justify-center gap-2">
                <Clock className="h-4 w-4" />
                Estimated delivery: 7-14 business days
              </p>
              <p>A confirmation email has been sent to your email address.</p>
            </div>
          </div>
          
          <DialogFooter className="flex-col sm:flex-row gap-2 justify-center">
            <Link to="/dashboard/store/orders">
              <Button variant="outline">
                <History className="h-4 w-4 mr-2" />
                View Orders
              </Button>
            </Link>
            <Button onClick={() => setShowSuccessModal(false)} className="bg-primary">
              Continue Shopping
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rating Modal */}
      <Dialog open={showRatingModal} onOpenChange={setShowRatingModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              Rate This Product
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-6 space-y-6">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                How would you rate this product?
              </p>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setSelectedRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-10 w-10 ${
                        star <= selectedRating
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="mt-2 text-lg font-semibold">
                {selectedRating > 0 ? `${selectedRating} Star${selectedRating > 1 ? 's' : ''}` : 'Select a rating'}
              </p>
            </div>

            <Card className="p-4 bg-gradient-to-r from-primary/10 to-rose-500/10 border-primary/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Coins className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-primary">Earn PM Token Reward!</p>
                  <p className="text-xs text-muted-foreground">
                    Receive {ratingReward ? formatUnits(ratingReward as bigint, 18) : '10'} PM tokens for rating
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowRatingModal(false);
              setSelectedRating(0);
              setRatingProductId(null);
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitRating}
              disabled={selectedRating === 0 || isRating || !isConnected}
              className="bg-gradient-to-r from-primary to-rose-600"
            >
              {isRating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Star className="h-4 w-4 mr-2" />
                  Submit Rating
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reviews Modal */}
      {reviewProductId !== null && (
        <ProductReviewsModal
          isOpen={showReviewsModal}
          onClose={() => {
            setShowReviewsModal(false);
            setReviewProductId(null);
          }}
          productId={reviewProductId}
          productName={reviewProductName}
          productImage={reviewProductImage}
        />
      )}

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default StorePage;