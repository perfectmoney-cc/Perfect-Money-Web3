import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { toast } from 'sonner';
import { PMMerchantABI } from '@/contracts/merchantABI';
import { PMTokenABI } from '@/contracts/abis';
import { getContractAddress, ChainId } from '@/contracts/addresses';

export const useMerchant = () => {
  const { address, chainId } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const getTokenAddress = () => {
    if (!chainId) return undefined;
    return getContractAddress(chainId as ChainId, 'PMToken');
  };

  const getMerchantAddress = () => {
    if (!chainId) return undefined;
    return getContractAddress(chainId as ChainId, 'PMMerchant');
  };

  const isContractReady = () => {
    const addr = getMerchantAddress();
    return !!addr && addr !== "0x0000000000000000000000000000000000000000";
  };

  // Check if subscription is active
  const useIsSubscriptionActive = () => {
    const merchantAddress = getMerchantAddress();
    return useReadContract({
      address: merchantAddress as `0x${string}`,
      abi: PMMerchantABI,
      functionName: 'isSubscriptionActive',
      args: address ? [address] : undefined,
      query: {
        enabled: isContractReady() && !!address,
      }
    });
  };

  // Get subscription info
  const useSubscriptionInfo = () => {
    const merchantAddress = getMerchantAddress();
    return useReadContract({
      address: merchantAddress as `0x${string}`,
      abi: PMMerchantABI,
      functionName: 'getSubscriptionInfo',
      args: address ? [address] : undefined,
      query: {
        enabled: isContractReady() && !!address,
      }
    });
  };

  // Get merchant stats
  const useMerchantStats = () => {
    const merchantAddress = getMerchantAddress();
    return useReadContract({
      address: merchantAddress as `0x${string}`,
      abi: PMMerchantABI,
      functionName: 'getMerchantStats',
      args: address ? [address] : undefined,
      query: {
        enabled: isContractReady() && !!address,
      }
    });
  };

  // Get merchant revenue
  const useMerchantRevenue = () => {
    const merchantAddress = getMerchantAddress();
    return useReadContract({
      address: merchantAddress as `0x${string}`,
      abi: PMMerchantABI,
      functionName: 'merchantRevenue',
      args: address ? [address] : undefined,
      query: {
        enabled: isContractReady() && !!address,
      }
    });
  };

  // Get merchant transactions count
  const useMerchantTransactionCount = () => {
    const merchantAddress = getMerchantAddress();
    return useReadContract({
      address: merchantAddress as `0x${string}`,
      abi: PMMerchantABI,
      functionName: 'merchantTransactions',
      args: address ? [address] : undefined,
      query: {
        enabled: isContractReady() && !!address,
      }
    });
  };

  // Get merchant API calls count
  const useMerchantApiCalls = () => {
    const merchantAddress = getMerchantAddress();
    return useReadContract({
      address: merchantAddress as `0x${string}`,
      abi: PMMerchantABI,
      functionName: 'merchantApiCalls',
      args: address ? [address] : undefined,
      query: {
        enabled: isContractReady() && !!address,
      }
    });
  };

  // Get tier config
  const useTierConfig = (tier: number) => {
    const merchantAddress = getMerchantAddress();
    return useReadContract({
      address: merchantAddress as `0x${string}`,
      abi: PMMerchantABI,
      functionName: 'getTierConfig',
      args: [tier],
      query: {
        enabled: isContractReady(),
      }
    });
  };

  // Get global stats
  const useGlobalStats = () => {
    const merchantAddress = getMerchantAddress();
    return useReadContract({
      address: merchantAddress as `0x${string}`,
      abi: PMMerchantABI,
      functionName: 'getGlobalStats',
      query: {
        enabled: isContractReady(),
      }
    });
  };

  // Get total subscribers
  const useTotalSubscribers = () => {
    const merchantAddress = getMerchantAddress();
    return useReadContract({
      address: merchantAddress as `0x${string}`,
      abi: PMMerchantABI,
      functionName: 'totalSubscribers',
      query: {
        enabled: isContractReady(),
      }
    });
  };

  // Get total revenue
  const useTotalRevenue = () => {
    const merchantAddress = getMerchantAddress();
    return useReadContract({
      address: merchantAddress as `0x${string}`,
      abi: PMMerchantABI,
      functionName: 'totalRevenue',
      query: {
        enabled: isContractReady(),
      }
    });
  };

  // Get total active links
  const useTotalActiveLinks = () => {
    const merchantAddress = getMerchantAddress();
    return useReadContract({
      address: merchantAddress as `0x${string}`,
      abi: PMMerchantABI,
      functionName: 'totalActiveLinks',
      query: {
        enabled: isContractReady(),
      }
    });
  };

  // Get A/B test count
  const useABTestCount = () => {
    const merchantAddress = getMerchantAddress();
    return useReadContract({
      address: merchantAddress as `0x${string}`,
      abi: PMMerchantABI,
      functionName: 'getABTestCount',
      args: address ? [address] : undefined,
      query: {
        enabled: isContractReady() && !!address,
      }
    });
  };

  // Subscribe to a tier
  const subscribe = async (tier: number) => {
    try {
      const merchantAddress = getMerchantAddress();
      const tokenAddress = getTokenAddress();
      
      if (!isContractReady()) {
        throw new Error('Merchant contract not deployed');
      }
      if (!tokenAddress) throw new Error('Token contract not found');

      // Tier prices: Starter = 10000 PM, Professional = 25000 PM
      const tierPrices = ['10000', '25000'];
      const price = tierPrices[tier];

      // Approve tokens first
      toast.info('Approving tokens...');
      await writeContractAsync({
        address: tokenAddress as `0x${string}`,
        abi: PMTokenABI,
        functionName: 'approve',
        args: [merchantAddress as `0x${string}`, parseEther(price)],
      } as any);

      // Subscribe
      toast.info('Subscribing...');
      const hash = await writeContractAsync({
        address: merchantAddress as `0x${string}`,
        abi: PMMerchantABI,
        functionName: 'subscribe',
        args: [tier],
      } as any);
      
      toast.success('Subscription successful!');
      return hash;
    } catch (error: any) {
      toast.error(error?.message || 'Subscription failed');
      throw error;
    }
  };

  // Renew subscription
  const renewSubscription = async () => {
    try {
      const merchantAddress = getMerchantAddress();
      if (!isContractReady()) {
        throw new Error('Merchant contract not deployed');
      }

      const hash = await writeContractAsync({
        address: merchantAddress as `0x${string}`,
        abi: PMMerchantABI,
        functionName: 'renewSubscription',
      } as any);
      
      toast.success('Subscription renewed!');
      return hash;
    } catch (error: any) {
      toast.error(error?.message || 'Renewal failed');
      throw error;
    }
  };

  // Cancel subscription
  const cancelSubscription = async () => {
    try {
      const merchantAddress = getMerchantAddress();
      if (!isContractReady()) {
        throw new Error('Merchant contract not deployed');
      }

      const hash = await writeContractAsync({
        address: merchantAddress as `0x${string}`,
        abi: PMMerchantABI,
        functionName: 'cancelSubscription',
      } as any);
      
      toast.success('Subscription cancelled');
      return hash;
    } catch (error: any) {
      toast.error(error?.message || 'Cancellation failed');
      throw error;
    }
  };

  // Create A/B Test
  const createABTest = async (variantAName: string, variantBName: string) => {
    try {
      const merchantAddress = getMerchantAddress();
      if (!isContractReady()) {
        throw new Error('Merchant contract not deployed');
      }

      const hash = await writeContractAsync({
        address: merchantAddress as `0x${string}`,
        abi: PMMerchantABI,
        functionName: 'createABTest',
        args: [variantAName, variantBName],
      } as any);
      
      toast.success('A/B Test created!');
      return hash;
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create A/B test');
      throw error;
    }
  };

  // Record A/B Test conversion
  const recordABTestConversion = async (testId: number) => {
    try {
      const merchantAddress = getMerchantAddress();
      if (!isContractReady()) {
        throw new Error('Merchant contract not deployed');
      }

      const hash = await writeContractAsync({
        address: merchantAddress as `0x${string}`,
        abi: PMMerchantABI,
        functionName: 'recordABTestConversion',
        args: [BigInt(testId)],
      } as any);
      
      return hash;
    } catch (error: any) {
      throw error;
    }
  };

  return {
    useIsSubscriptionActive,
    useSubscriptionInfo,
    useMerchantStats,
    useMerchantRevenue,
    useMerchantTransactionCount,
    useMerchantApiCalls,
    useTierConfig,
    useGlobalStats,
    useTotalSubscribers,
    useTotalRevenue,
    useTotalActiveLinks,
    useABTestCount,
    subscribe,
    renewSubscription,
    cancelSubscription,
    createABTest,
    recordABTestConversion,
    getMerchantAddress,
    isContractReady,
  };
};
