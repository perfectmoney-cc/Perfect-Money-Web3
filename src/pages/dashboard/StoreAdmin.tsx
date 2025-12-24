import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Package, ShoppingCart, BarChart3, Ticket, Plus, Edit, Trash2, Eye, EyeOff, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { parseEther, formatEther } from "viem";
import { PMStoreABI } from "@/contracts/storeABI";
import { CONTRACT_ADDRESSES } from "@/contracts/addresses";

const categories = ["Apparel", "Accessories", "Collectibles", "Digital", "Limited"];
const orderStatuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

const StoreAdmin = () => {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  
  const storeAddress = CONTRACT_ADDRESSES[56]?.PMStore as `0x${string}` | undefined;
  
  // Form states
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    imageUri: "",
    price: "",
    stock: "",
    category: "0"
  });
  
  const [voucherForm, setVoucherForm] = useState({
    code: "",
    discountPercent: "",
    maxUses: "",
    expiresInDays: "30"
  });
  
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [newOrderStatus, setNewOrderStatus] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [sendEmailNotification, setSendEmailNotification] = useState(true);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  
  // Read contract data
  const { data: ownerAddress } = useReadContract({
    address: storeAddress,
    abi: PMStoreABI,
    functionName: "owner",
  });
  
  const { data: storeStats } = useReadContract({
    address: storeAddress,
    abi: PMStoreABI,
    functionName: "getStoreStats",
  });
  
  const { data: activeProducts, refetch: refetchProducts } = useReadContract({
    address: storeAddress,
    abi: PMStoreABI,
    functionName: "getActiveProducts",
  });
  
  const { data: productCount } = useReadContract({
    address: storeAddress,
    abi: PMStoreABI,
    functionName: "productCount",
  });
  
  const { data: orderCount } = useReadContract({
    address: storeAddress,
    abi: PMStoreABI,
    functionName: "orderCount",
  });
  
  const isOwner = address && ownerAddress && address.toLowerCase() === ownerAddress.toLowerCase();
  
  const handleAddProduct = async () => {
    if (!storeAddress) {
      toast.error("Store contract not deployed");
      return;
    }
    
    try {
      await writeContractAsync({
        address: storeAddress,
        abi: PMStoreABI,
        functionName: "addProduct",
        args: [
          productForm.name,
          productForm.description,
          productForm.imageUri,
          parseEther(productForm.price),
          BigInt(productForm.stock),
          parseInt(productForm.category)
        ]
      } as any);
      
      toast.success("Product added successfully!");
      setProductForm({ name: "", description: "", imageUri: "", price: "", stock: "", category: "0" });
      refetchProducts();
    } catch (error: any) {
      toast.error(error.message || "Failed to add product");
    }
  };
  
  const handleUpdateProduct = async () => {
    if (!storeAddress || !editingProduct) return;
    
    try {
      await writeContractAsync({
        address: storeAddress,
        abi: PMStoreABI,
        functionName: "updateProduct",
        args: [
          BigInt(editingProduct.id),
          productForm.name,
          productForm.description,
          productForm.imageUri,
          parseEther(productForm.price),
          BigInt(productForm.stock)
        ]
      } as any);
      
      toast.success("Product updated successfully!");
      setEditingProduct(null);
      refetchProducts();
    } catch (error: any) {
      toast.error(error.message || "Failed to update product");
    }
  };
  
  const handleToggleProductStatus = async (productId: number, currentStatus: boolean) => {
    if (!storeAddress) return;
    
    try {
      await writeContractAsync({
        address: storeAddress,
        abi: PMStoreABI,
        functionName: "setProductStatus",
        args: [BigInt(productId), !currentStatus]
      } as any);
      
      toast.success(`Product ${currentStatus ? "deactivated" : "activated"}`);
      refetchProducts();
    } catch (error: any) {
      toast.error(error.message || "Failed to update product status");
    }
  };
  
  const handleCreateVoucher = async () => {
    if (!storeAddress) {
      toast.error("Store contract not deployed");
      return;
    }
    
    const expiresAt = Math.floor(Date.now() / 1000) + (parseInt(voucherForm.expiresInDays) * 24 * 60 * 60);
    
    try {
      await writeContractAsync({
        address: storeAddress,
        abi: PMStoreABI,
        functionName: "createVoucher",
        args: [
          voucherForm.code,
          BigInt(voucherForm.discountPercent),
          BigInt(voucherForm.maxUses),
          BigInt(expiresAt)
        ]
      } as any);
      
      toast.success("Voucher created successfully!");
      setVoucherForm({ code: "", discountPercent: "", maxUses: "", expiresInDays: "30" });
    } catch (error: any) {
      toast.error(error.message || "Failed to create voucher");
    }
  };
  
  const handleUpdateOrderStatus = async () => {
    if (!storeAddress || !selectedOrderId || !newOrderStatus) return;
    
    try {
      await writeContractAsync({
        address: storeAddress,
        abi: PMStoreABI,
        functionName: "updateOrderStatus",
        args: [BigInt(selectedOrderId), parseInt(newOrderStatus)]
      } as any);
      
      toast.success("Order status updated!");
      
      // Send email notification if enabled and email provided
      if (sendEmailNotification && customerEmail) {
        setIsSendingEmail(true);
        try {
          const response = await fetch(
            'https://ihuqvxvcqnrdxphqxpqr.supabase.co/functions/v1/send-order-status-email',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: customerEmail,
                customerName: customerName || 'Valued Customer',
                orderNumber: `PM${selectedOrderId.padStart(8, '0')}`,
                newStatus: newOrderStatus,
              }),
            }
          );
          
          const data = await response.json();
          
          if (!response.ok) {
            console.error("Email error:", data);
            toast.error("Order updated but failed to send email notification");
          } else {
            toast.success("Email notification sent to customer!");
          }
        } catch (emailError) {
          console.error("Email error:", emailError);
          toast.error("Order updated but failed to send email notification");
        } finally {
          setIsSendingEmail(false);
        }
      }
      
      setSelectedOrderId("");
      setNewOrderStatus("");
      setCustomerEmail("");
      setCustomerName("");
    } catch (error: any) {
      toast.error(error.message || "Failed to update order status");
    }
  };
  
  const handleWithdrawFunds = async () => {
    if (!storeAddress || !storeStats) return;
    
    try {
      await writeContractAsync({
        address: storeAddress,
        abi: PMStoreABI,
        functionName: "withdrawFunds",
        args: [storeStats[2]] // totalRevenue
      } as any);
      
      toast.success("Funds withdrawn successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to withdraw funds");
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background p-4">
        <Card className="max-w-md mx-auto mt-20">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Please connect your wallet to access admin panel</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-background p-4">
        <Card className="max-w-md mx-auto mt-20">
          <CardContent className="pt-6 text-center">
            <p className="text-destructive">Access denied. Only contract owner can access this panel.</p>
            <Button onClick={() => navigate("/dashboard/store")} className="mt-4">
              Back to Store
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/store")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Store Admin</h1>
                <p className="text-sm text-muted-foreground">Manage products, orders & analytics</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Package className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{storeStats ? Number(storeStats[0]) : 0}</p>
                  <p className="text-sm text-muted-foreground">Products</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <ShoppingCart className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{storeStats ? Number(storeStats[3]) : 0}</p>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {storeStats ? parseFloat(formatEther(storeStats[2])).toFixed(2) : "0"} PM
                  </p>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Button onClick={handleWithdrawFunds} className="w-full" disabled={!storeStats || storeStats[2] === BigInt(0)}>
                Withdraw Funds
              </Button>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="products" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="vouchers">Vouchers</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Product Name</Label>
                    <Input
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      placeholder="PM Hoodie"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={productForm.category}
                      onValueChange={(v) => setProductForm({ ...productForm, category: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat, idx) => (
                          <SelectItem key={cat} value={idx.toString()}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Price (PM)</Label>
                    <Input
                      type="number"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      placeholder="100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Stock</Label>
                    <Input
                      type="number"
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                      placeholder="50"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Image URL</Label>
                    <Input
                      value={productForm.imageUri}
                      onChange={(e) => setProductForm({ ...productForm, imageUri: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Description</Label>
                    <Textarea
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      placeholder="Product description..."
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={editingProduct ? handleUpdateProduct : handleAddProduct}>
                    {editingProduct ? "Update Product" : "Add Product"}
                  </Button>
                  {editingProduct && (
                    <Button variant="outline" onClick={() => {
                      setEditingProduct(null);
                      setProductForm({ name: "", description: "", imageUri: "", price: "", stock: "", category: "0" });
                    }}>
                      Cancel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Product List</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Sold</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeProducts && (activeProducts as any[]).map((product: any) => (
                      <TableRow key={product.id.toString()}>
                        <TableCell>{product.id.toString()}</TableCell>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{categories[product.category]}</TableCell>
                        <TableCell>{formatEther(product.price)} PM</TableCell>
                        <TableCell>{product.stock.toString()}</TableCell>
                        <TableCell>{product.totalSold.toString()}</TableCell>
                        <TableCell>
                          <Badge variant={product.isActive ? "default" : "secondary"}>
                            {product.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                setEditingProduct(product);
                                setProductForm({
                                  name: product.name,
                                  description: product.description,
                                  imageUri: product.imageUri,
                                  price: formatEther(product.price),
                                  stock: product.stock.toString(),
                                  category: product.category.toString()
                                });
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleToggleProductStatus(Number(product.id), product.isActive)}
                            >
                              {product.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Update Order Status & Notify Customer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Order ID</Label>
                    <Input
                      value={selectedOrderId}
                      onChange={(e) => setSelectedOrderId(e.target.value)}
                      placeholder="Enter order ID"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>New Status</Label>
                    <Select value={newOrderStatus} onValueChange={setNewOrderStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {orderStatuses.map((status, idx) => (
                          <SelectItem key={status} value={idx.toString()}>{status}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Customer Name (optional)</Label>
                    <Input
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Customer Email</Label>
                    <Input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="customer@email.com"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox 
                    id="sendEmail" 
                    checked={sendEmailNotification}
                    onCheckedChange={(checked) => setSendEmailNotification(checked as boolean)}
                  />
                  <label
                    htmlFor="sendEmail"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Send email notification to customer
                  </label>
                </div>
                
                <Button 
                  onClick={handleUpdateOrderStatus} 
                  disabled={!selectedOrderId || !newOrderStatus || isSendingEmail}
                  className="w-full md:w-auto"
                >
                  {isSendingEmail ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Update Status {sendEmailNotification && customerEmail ? "& Send Email" : ""}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-2xl font-bold text-yellow-500">{orderCount ? Number(orderCount) : 0}</p>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-2xl font-bold text-blue-500">
                      {storeStats ? parseFloat(formatEther(storeStats[2])).toFixed(2) : "0"}
                    </p>
                    <p className="text-sm text-muted-foreground">Revenue (PM)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vouchers Tab */}
          <TabsContent value="vouchers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ticket className="h-5 w-5" />
                  Create Voucher Code
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Voucher Code</Label>
                    <Input
                      value={voucherForm.code}
                      onChange={(e) => setVoucherForm({ ...voucherForm, code: e.target.value.toUpperCase() })}
                      placeholder="SUMMER25"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Discount Percent (max 50%)</Label>
                    <Input
                      type="number"
                      max={50}
                      value={voucherForm.discountPercent}
                      onChange={(e) => setVoucherForm({ ...voucherForm, discountPercent: e.target.value })}
                      placeholder="25"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Uses</Label>
                    <Input
                      type="number"
                      value={voucherForm.maxUses}
                      onChange={(e) => setVoucherForm({ ...voucherForm, maxUses: e.target.value })}
                      placeholder="100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Expires In (days)</Label>
                    <Input
                      type="number"
                      value={voucherForm.expiresInDays}
                      onChange={(e) => setVoucherForm({ ...voucherForm, expiresInDays: e.target.value })}
                      placeholder="30"
                    />
                  </div>
                </div>
                <Button onClick={handleCreateVoucher}>Create Voucher</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Sales Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span className="text-muted-foreground">Total Products</span>
                      <span className="font-bold">{storeStats ? Number(storeStats[0]) : 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span className="text-muted-foreground">Total Orders</span>
                      <span className="font-bold">{storeStats ? Number(storeStats[3]) : 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span className="text-muted-foreground">Total Revenue</span>
                      <span className="font-bold text-green-500">
                        {storeStats ? parseFloat(formatEther(storeStats[2])).toFixed(2) : "0"} PM
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span className="text-muted-foreground">Avg Order Value</span>
                      <span className="font-bold">
                        {storeStats && Number(storeStats[3]) > 0
                          ? (parseFloat(formatEther(storeStats[2])) / Number(storeStats[3])).toFixed(2)
                          : "0"} PM
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {activeProducts && (activeProducts as any[])
                      .sort((a: any, b: any) => Number(b.totalSold) - Number(a.totalSold))
                      .slice(0, 5)
                      .map((product: any, idx: number) => (
                        <div key={product.id.toString()} className="flex justify-between items-center p-2 bg-muted rounded">
                          <span className="flex items-center gap-2">
                            <span className="text-muted-foreground">#{idx + 1}</span>
                            <span>{product.name}</span>
                          </span>
                          <Badge variant="outline">{product.totalSold.toString()} sold</Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default StoreAdmin;
