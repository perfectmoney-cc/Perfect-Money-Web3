import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { toast } from 'sonner';
import {
  PMTokenABI,
  PMStakingABI,
  PMPaymentABI,
  PMReferralABI,
  PMMerchantABI
} from '@/contracts/abis';
import { getContractAddress } from '@/contracts/addresses';

export const useContracts = () => {
  const { address, chainId } = useAccount();
  const { writeContractAsync } = useWriteContract();

  // Get contract addresses for current chain
  const getAddress = (contract: string) => {
    if (!chainId) return undefined;
    return getContractAddress(chainId as any, contract as any);
  };

  // Token operations
  const useTokenBalance = () => {
    const tokenAddress = getAddress('PMToken');
    return useReadContract({
      address: tokenAddress as `0x${string}` | undefined,
      abi: PMTokenABI,
      functionName: 'balanceOf',
      args: address ? [address] : undefined,
      query: {
        enabled: !!tokenAddress && !!address,
      }
    });
  };

  const approveToken = async (spender: string, amount: string) => {
    try {
      const tokenAddress = getAddress('PMToken');
      if (!tokenAddress) throw new Error('Contract not deployed on this network');
      
      const hash = await writeContractAsync({
        address: tokenAddress as `0x${string}`,
        abi: PMTokenABI,
        functionName: 'approve',
        args: [spender as `0x${string}`, parseEther(amount)],
      } as any);
      toast.success('Approval successful!');
      return hash;
    } catch (error: any) {
      toast.error(error?.message || 'Approval failed');
      throw error;
    }
  };

  const transferToken = async (to: string, amount: string) => {
    try {
      const tokenAddress = getAddress('PMToken');
      if (!tokenAddress) throw new Error('Contract not deployed on this network');
      
      const hash = await writeContractAsync({
        address: tokenAddress as `0x${string}`,
        abi: PMTokenABI,
        functionName: 'transfer',
        args: [to as `0x${string}`, parseEther(amount)],
      } as any);
      toast.success('Transfer successful!');
      return hash;
    } catch (error: any) {
      toast.error(error?.message || 'Transfer failed');
      throw error;
    }
  };

  // Staking operations
  const useStakingInfo = () => {
    const stakingAddress = getAddress('PMStaking');
    return useReadContract({
      address: stakingAddress as `0x${string}` | undefined,
      abi: PMStakingABI,
      functionName: 'getUserStakes',
      args: address ? [address] : undefined,
      query: {
        enabled: !!stakingAddress && !!address,
      }
    });
  };

  const stakeTokens = async (amount: string, planId: number) => {
    try {
      const stakingAddress = getAddress('PMStaking');
      if (!stakingAddress) throw new Error('Contract not deployed on this network');
      
      // First approve
      await approveToken(stakingAddress, amount);
      
      // Then stake
      const hash = await writeContractAsync({
        address: stakingAddress as `0x${string}`,
        abi: PMStakingABI,
        functionName: 'stake',
        args: [parseEther(amount), BigInt(planId)],
      } as any);
      toast.success('Staking successful!');
      return hash;
    } catch (error: any) {
      toast.error(error?.message || 'Staking failed');
      throw error;
    }
  };

  const unstakeTokens = async (stakeId: number) => {
    try {
      const stakingAddress = getAddress('PMStaking');
      if (!stakingAddress) throw new Error('Contract not deployed on this network');
      
      const hash = await writeContractAsync({
        address: stakingAddress as `0x${string}`,
        abi: PMStakingABI,
        functionName: 'unstake',
        args: [BigInt(stakeId)],
      } as any);
      toast.success('Unstaking successful!');
      return hash;
    } catch (error: any) {
      toast.error(error?.message || 'Unstaking failed');
      throw error;
    }
  };

  const claimStakingRewards = async (stakeId: number) => {
    try {
      const stakingAddress = getAddress('PMStaking');
      if (!stakingAddress) throw new Error('Contract not deployed on this network');
      
      const hash = await writeContractAsync({
        address: stakingAddress as `0x${string}`,
        abi: PMStakingABI,
        functionName: 'claimRewards',
        args: [BigInt(stakeId)],
      } as any);
      toast.success('Rewards claimed!');
      return hash;
    } catch (error: any) {
      toast.error(error?.message || 'Claim failed');
      throw error;
    }
  };

  // Payment operations
  const sendPayment = async (to: string, amount: string, memo: string) => {
    try {
      const paymentAddress = getAddress('PMPayment');
      if (!paymentAddress) throw new Error('Contract not deployed on this network');
      
      const hash = await writeContractAsync({
        address: paymentAddress as `0x${string}`,
        abi: PMPaymentABI,
        functionName: 'sendPayment',
        args: [to as `0x${string}`, parseEther(amount), memo],
      } as any);
      toast.success('Payment sent!');
      return hash;
    } catch (error: any) {
      toast.error(error?.message || 'Payment failed');
      throw error;
    }
  };

  const createPaymentLink = async (amount: string, description: string, expiresInDays: number) => {
    try {
      const paymentAddress = getAddress('PMPayment');
      if (!paymentAddress) throw new Error('Contract not deployed on this network');
      
      const expiresIn = BigInt(expiresInDays * 24 * 60 * 60);
      const hash = await writeContractAsync({
        address: paymentAddress as `0x${string}`,
        abi: PMPaymentABI,
        functionName: 'createPaymentLink',
        args: [parseEther(amount), description, expiresIn],
      } as any);
      toast.success('Payment link created!');
      return hash;
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create link');
      throw error;
    }
  };

  // Referral operations
  const registerReferral = async (referrerAddress: string) => {
    try {
      const referralAddress = getAddress('PMReferral');
      if (!referralAddress) throw new Error('Contract not deployed on this network');
      
      const hash = await writeContractAsync({
        address: referralAddress as `0x${string}`,
        abi: PMReferralABI,
        functionName: 'registerReferral',
        args: [referrerAddress as `0x${string}`],
      } as any);
      toast.success('Referral registered!');
      return hash;
    } catch (error: any) {
      toast.error(error?.message || 'Registration failed');
      throw error;
    }
  };

  const claimReferralRewards = async () => {
    try {
      const referralAddress = getAddress('PMReferral');
      if (!referralAddress) throw new Error('Contract not deployed on this network');
      
      const hash = await writeContractAsync({
        address: referralAddress as `0x${string}`,
        abi: PMReferralABI,
        functionName: 'claimRewards',
      } as any);
      toast.success('Referral rewards claimed!');
      return hash;
    } catch (error: any) {
      toast.error(error?.message || 'Claim failed');
      throw error;
    }
  };

  // Merchant operations
  const subscribe = async (tier: number) => {
    try {
      const merchantAddress = getAddress('PMMerchant');
      if (!merchantAddress) throw new Error('Contract not deployed on this network');

      // Use fixed tier prices
      const tierPrices = ['100', '500', '2000'];
      await approveToken(merchantAddress, tierPrices[tier]);

      const hash = await writeContractAsync({
        address: merchantAddress as `0x${string}`,
        abi: PMMerchantABI,
        functionName: 'subscribe',
        args: [BigInt(tier)],
      } as any);
      toast.success('Subscription successful!');
      return hash;
    } catch (error: any) {
      toast.error(error?.message || 'Subscription failed');
      throw error;
    }
  };

  const renewSubscription = async () => {
    try {
      const merchantAddress = getAddress('PMMerchant');
      if (!merchantAddress) throw new Error('Contract not deployed on this network');
      
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

  return {
    // Token
    useTokenBalance,
    approveToken,
    transferToken,
    
    // Staking
    useStakingInfo,
    stakeTokens,
    unstakeTokens,
    claimStakingRewards,
    
    // Payments
    sendPayment,
    createPaymentLink,
    
    // Referral
    registerReferral,
    claimReferralRewards,
    
    // Merchant
    subscribe,
    renewSubscription,
    
    // Utils
    getAddress,
  };
};
