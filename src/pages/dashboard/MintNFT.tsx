import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Header } from "@/components/Header";
import { TradingViewTicker } from "@/components/TradingViewTicker";
import { HeroBanner } from "@/components/HeroBanner";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Footer } from "@/components/Footer";
import { WalletCard } from "@/components/WalletCard";
import { ArrowLeft, Upload, Sparkles, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { useNFTMarketplace, useTokenApproval, useNFTStats } from "@/hooks/useNFTMarketplace";
import { formatEther, parseEther } from "viem";
import pmLogo from "@/assets/pm-logo-new.png";
import { uploadToIPFS, ipfsToHttp } from "@/utils/ipfsService";

const MintNFTPage = () => {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const { mintNFT } = useNFTMarketplace();
  const { balance, nftAllowance } = useTokenApproval();
  const { mintingFee: contractMintingFee } = useNFTStats();
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [royalty, setRoyalty] = useState("5");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [isUploadingToIPFS, setIsUploadingToIPFS] = useState(false);
  const [approvalStep, setApprovalStep] = useState<"idle" | "approving" | "minting">("idle");

  const mintingFee = contractMintingFee ? parseFloat(contractMintingFee) : 10000;
  const hasEnoughBalance = balance ? parseFloat(formatEther(balance)) >= mintingFee : false;
  const hasApproval = nftAllowance ? nftAllowance >= parseEther(mintingFee.toString()) : false;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMint = async () => {
    if (!name || !description || !category || !price) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!isConnected || !address) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!hasEnoughBalance) {
      toast.error(`Insufficient PM balance. Need ${mintingFee.toLocaleString()} PM for minting fee`);
      return;
    }

    setIsMinting(true);

    try {
      let tokenURI: string;
      let ipfsImageUri: string | undefined;

      // Upload to IPFS if there's an image
      if (imagePreview) {
        setIsUploadingToIPFS(true);
        toast.info("Uploading to IPFS...");
        
        const ipfsResult = await uploadToIPFS(imagePreview, {
          name,
          description,
          category,
          royalty: parseFloat(royalty),
          price: parseFloat(price),
          creator: address,
          attributes: [
            { trait_type: "Category", value: category },
            { trait_type: "Royalty", value: `${royalty}%` },
            { trait_type: "Price", value: `${price} PM` }
          ]
        });

        setIsUploadingToIPFS(false);

        if (!ipfsResult.success) {
          toast.error(ipfsResult.error || "Failed to upload to IPFS");
          setIsMinting(false);
          return;
        }

        tokenURI = ipfsResult.tokenUri!;
        ipfsImageUri = ipfsResult.imageUri;
        toast.success("Uploaded to IPFS successfully!");
      } else {
        // Fallback to base64 if no image
        tokenURI = `data:application/json;base64,${btoa(JSON.stringify({
          name,
          description,
          image: "",
          category,
          attributes: [
            { trait_type: "Category", value: category },
            { trait_type: "Royalty", value: `${royalty}%` },
            { trait_type: "Price", value: `${price} PM` }
          ]
        }))}`;
      }

      // Call blockchain mint function (handles approval internally)
      await mintNFT(tokenURI, name, description, category, parseFloat(royalty));

      // Also save to localStorage for UI display
      const mintedNFT = {
        id: Date.now(),
        name,
        description,
        category,
        price: parseFloat(price),
        royalty: parseFloat(royalty),
        image: ipfsImageUri || imagePreview, // Use IPFS URI if available
        creator: address,
        mintedAt: new Date().toISOString(),
        isListed: true,
        isAuction: false,
      };

      const marketplaceItems = JSON.parse(localStorage.getItem("mintedNFTs") || "[]");
      marketplaceItems.push(mintedNFT);
      localStorage.setItem("mintedNFTs", JSON.stringify(marketplaceItems));

      const ownedNFTs = JSON.parse(localStorage.getItem("ownedNFTs") || "[]");
      ownedNFTs.push({
        id: mintedNFT.id,
        name: mintedNFT.name,
        purchasePrice: 0,
        category: mintedNFT.category,
        description: mintedNFT.description,
        image: mintedNFT.image,
        isMinted: true,
      });
      localStorage.setItem("ownedNFTs", JSON.stringify(ownedNFTs));

      window.dispatchEvent(new Event("balanceUpdate"));
      navigate("/dashboard/marketplace");
    } catch (error: any) {
      console.error("Minting error:", error);
    } finally {
      setIsMinting(false);
      setIsUploadingToIPFS(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 lg:pb-0">
      <Header />
      <TradingViewTicker />
      <HeroBanner title="Mint NFT" subtitle="Create and mint your unique digital assets" />

      <main className="container mx-auto px-4 pt-12 pb-12 flex-1">
        <div className="md:hidden mt-5 mb-6">
          <WalletCard showQuickFunctionsToggle={false} compact={true} />
        </div>

        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="max-w-2xl mx-auto">
          <Card className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-lg bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="font-bold text-xl">Create New NFT</h1>
                <p className="text-muted-foreground text-sm">Mint your digital artwork on BSC</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">NFT Image *</label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                  {imagePreview ? (
                    <div className="space-y-4">
                      <img src={imagePreview} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
                      <Button variant="outline" size="sm" onClick={() => setImagePreview(null)}>
                        Remove Image
                      </Button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 rounded-full bg-muted">
                          <Upload className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">Upload Image</p>
                          <p className="text-sm text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                        </div>
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  )}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-2">Name *</label>
                <Input placeholder="Enter NFT name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">Description *</label>
                <Textarea
                  placeholder="Describe your NFT..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-2">Category *</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PM Digital Card">PM Digital Card</SelectItem>
                    <SelectItem value="PM Voucher Card">PM Voucher Card</SelectItem>
                    <SelectItem value="PM Gift Cards">PM Gift Cards</SelectItem>
                    <SelectItem value="PM Partner Badge">PM Partner Badge</SelectItem>
                    <SelectItem value="PM Discount Card">PM Discount Card</SelectItem>
                    <SelectItem value="PM VIP Exclusive Card">PM VIP Exclusive Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium mb-2">Listing Price (PM) *</label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="Enter price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="pr-16"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <img src={pmLogo} alt="PM" className="h-4 w-4" />
                    <span className="text-sm font-medium">PM</span>
                  </div>
                </div>
              </div>

              {/* Royalty */}
              <div>
                <label className="block text-sm font-medium mb-2">Royalty (%)</label>
                <Select value={royalty} onValueChange={setRoyalty}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0%</SelectItem>
                    <SelectItem value="2.5">2.5%</SelectItem>
                    <SelectItem value="5">5%</SelectItem>
                    <SelectItem value="7.5">7.5%</SelectItem>
                    <SelectItem value="10">10%</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">Earn royalties on every secondary sale</p>
              </div>

              {/* Minting Fee Info */}
              <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Minting Fee</span>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{mintingFee.toLocaleString()}</span>
                    <img src={pmLogo} alt="PM" className="h-4 w-4" />
                    <span className="font-medium">PM</span>
                  </div>
                </div>
                
                {/* Wallet Balance */}
                {isConnected && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Your Balance</span>
                    <div className="flex items-center gap-1">
                      <span className={`font-medium ${hasEnoughBalance ? 'text-green-500' : 'text-destructive'}`}>
                        {balance ? parseFloat(formatEther(balance)).toLocaleString(undefined, { maximumFractionDigits: 2 }) : '0'}
                      </span>
                      <img src={pmLogo} alt="PM" className="h-4 w-4" />
                      <span className="font-medium">PM</span>
                    </div>
                  </div>
                )}
                
                {/* Approval Status */}
                {isConnected && (
                  <div className="flex items-start gap-2 pt-2 border-t border-border">
                    {hasApproval ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-green-600">
                          PM tokens approved for minting
                        </p>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-muted-foreground">
                          Token approval required before minting (one-time step)
                        </p>
                      </>
                    )}
                  </div>
                )}

                <div className="flex items-start gap-2 pt-2 border-t border-border">
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    Your NFT will be minted on BSC and listed on the marketplace
                  </p>
                </div>
              </div>

              {/* Connection Warning */}
              {!isConnected && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <p className="text-sm text-amber-600">Please connect your wallet to mint NFTs</p>
                </div>
              )}

              {/* Mint Button */}
              <Button
                variant="gradient"
                className="w-full"
                onClick={handleMint}
                disabled={isMinting || !name || !description || !category || !price || !isConnected || !hasEnoughBalance}
              >
                {isMinting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isUploadingToIPFS 
                      ? "Uploading to IPFS..." 
                      : !hasApproval 
                        ? "Approving & Minting..." 
                        : "Minting..."}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    {!hasApproval ? `Approve & Mint for ${mintingFee.toLocaleString()} PM` : `Mint NFT for ${mintingFee.toLocaleString()} PM`}
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default MintNFTPage;
