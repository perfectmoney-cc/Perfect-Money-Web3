import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Store, Search, Loader2, CreditCard, Gift, ExternalLink, Star, MapPin, Clock, RefreshCw } from 'lucide-react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { bsc } from 'wagmi/chains';
import { parseEther } from 'viem';
import { toast } from 'sonner';
import { CONTRACT_ADDRESSES } from '@/contracts/addresses';
import { VIRTUAL_CARD_ABI } from '@/contracts/virtualCardABI';
import { useMerchantRegistry, BlockchainMerchant } from '@/hooks/useMerchantRegistry';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CardSpendingMerchantProps {
  cardBalance: number;
  cashbackRate: number;
  onSuccess?: () => void;
}

const CardSpendingMerchant = ({ cardBalance, cashbackRate, onSuccess }: CardSpendingMerchantProps) => {
  const { address, isConnected } = useAccount();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMerchant, setSelectedMerchant] = useState<BlockchainMerchant | null>(null);
  const [spendAmount, setSpendAmount] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const { 
    merchants, 
    isLoading: loadingMerchants, 
    refetch: refetchMerchants,
    categories,
    getMerchantsByCategory,
    searchMerchants,
    getTopMerchants
  } = useMerchantRegistry();

  const VIRTUAL_CARD_CONTRACT = CONTRACT_ADDRESSES[56]?.PMVirtualCard || '0x0000000000000000000000000000000000000000';

  // Contract write for spending
  const { writeContract: spendAtMerchant, data: spendHash, isPending: isSpending } = useWriteContract();

  // Transaction receipt
  const { isSuccess: spendSuccess } = useWaitForTransactionReceipt({ hash: spendHash });

  // Handle successful spend
  useEffect(() => {
    if (spendSuccess) {
      toast.success(`Payment successful! You earned ${calculateCashback()} PM cashback.`);
      setShowPaymentModal(false);
      setSpendAmount('');
      setSelectedMerchant(null);
      onSuccess?.();
    }
  }, [spendSuccess]);

  const calculateCashback = () => {
    const amount = parseFloat(spendAmount) || 0;
    const bonusRate = selectedMerchant?.cashbackBonus || 0;
    const totalRate = cashbackRate + bonusRate;
    return (amount * totalRate / 100).toFixed(2);
  };

  const calculateTotal = () => {
    const amount = parseFloat(spendAmount) || 0;
    const cashback = parseFloat(calculateCashback());
    return (amount - cashback).toFixed(2);
  };

  const handleSpend = () => {
    if (!spendAmount || parseFloat(spendAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (parseFloat(spendAmount) > cardBalance) {
      toast.error('Insufficient card balance');
      return;
    }
    if (!selectedMerchant || !address) {
      toast.error('Please select a merchant');
      return;
    }

    spendAtMerchant({
      address: VIRTUAL_CARD_CONTRACT as `0x${string}`,
      abi: VIRTUAL_CARD_ABI,
      functionName: 'spend',
      account: address,
      chain: bsc,
      args: [parseEther(spendAmount)],
    });
  };

  const openPaymentModal = (merchant: BlockchainMerchant) => {
    setSelectedMerchant(merchant);
    setShowPaymentModal(true);
  };

  // Filter merchants based on search and category
  const filteredMerchants = searchQuery 
    ? searchMerchants(searchQuery).filter(m => selectedCategory === 'All' || m.category === selectedCategory)
    : getMerchantsByCategory(selectedCategory);

  const topMerchants = getTopMerchants(3);

  return (
    <>
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" />
              Spend with Merchants
              <Badge variant="secondary" className="text-xs">{merchants.length}</Badge>
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => refetchMerchants()}
              disabled={loadingMerchants}
            >
              <RefreshCw className={`h-4 w-4 ${loadingMerchants ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search merchants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Categories */}
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-2 pb-2">
              {['All', ...categories.filter(c => c !== 'General')].map(cat => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                  className="shrink-0"
                >
                  {cat}
                </Button>
              ))}
            </div>
          </ScrollArea>

          {/* Merchant List */}
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {loadingMerchants ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin text-primary" />
                  <p className="text-muted-foreground">Loading merchants...</p>
                </div>
              ) : filteredMerchants.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Store className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>No merchants found</p>
                </div>
              ) : (
                filteredMerchants.map((merchant) => (
                  <div
                    key={merchant.address}
                    className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => openPaymentModal(merchant)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Store className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{merchant.name}</p>
                            {merchant.cashbackBonus > 0 && (
                              <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-500">
                                <Gift className="h-3 w-3 mr-1" />
                                +{merchant.cashbackBonus}% bonus
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{merchant.description}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                              {merchant.rating.toFixed(1)}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {merchant.category}
                            </Badge>
                            <span className="text-xs">
                              {merchant.totalTransactions} sales
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Pay
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Pay at {selectedMerchant?.name}
            </DialogTitle>
            <DialogDescription>
              Enter the amount to pay with your virtual card
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Merchant Info */}
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Store className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{selectedMerchant?.name}</p>
                <p className="text-xs text-muted-foreground">{selectedMerchant?.category}</p>
              </div>
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <Label>Amount (PM)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={spendAmount}
                onChange={(e) => setSpendAmount(e.target.value)}
                className="text-lg"
              />
              <p className="text-xs text-muted-foreground">
                Available: {cardBalance.toLocaleString()} PM
              </p>
            </div>

            {/* Cashback Preview */}
            {spendAmount && parseFloat(spendAmount) > 0 && (
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Base cashback ({cashbackRate}%)</span>
                  <span>{(parseFloat(spendAmount) * cashbackRate / 100).toFixed(2)} PM</span>
                </div>
                {selectedMerchant && selectedMerchant.cashbackBonus > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Merchant bonus (+{selectedMerchant.cashbackBonus}%)</span>
                    <span>{(parseFloat(spendAmount) * selectedMerchant.cashbackBonus / 100).toFixed(2)} PM</span>
                  </div>
                )}
                <div className="flex justify-between font-medium pt-2 border-t border-green-500/20">
                  <span className="text-green-500">Total cashback</span>
                  <span className="text-green-500">{calculateCashback()} PM</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-green-500/20">
                  <span className="text-muted-foreground">Net cost</span>
                  <span className="font-bold">{calculateTotal()} PM</span>
                </div>
              </div>
            )}

            {/* Pay Button */}
            <Button
              onClick={handleSpend}
              disabled={isSpending || !spendAmount || parseFloat(spendAmount) <= 0 || parseFloat(spendAmount) > cardBalance}
              className="w-full"
            >
              {isSpending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CreditCard className="h-4 w-4 mr-2" />
              )}
              Confirm Payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CardSpendingMerchant;
