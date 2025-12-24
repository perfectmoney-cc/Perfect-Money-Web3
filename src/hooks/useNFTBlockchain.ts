import { useReadContract, useAccount, usePublicClient } from 'wagmi';
import { PMNFTABI, PMMarketplaceABI } from '@/contracts/nftABI';
import { getContractAddress } from '@/contracts/addresses';
import { formatEther } from 'viem';
import { useState, useEffect, useCallback, useMemo } from 'react';

const PMNFT_ADDRESS = getContractAddress(56, 'PMNFT') as `0x${string}`;
const PMMARKETPLACE_ADDRESS = getContractAddress(56, 'PMMarketplace') as `0x${string}`;

export interface BlockchainNFT {
  id: number;
  name: string;
  description: string;
  category: string;
  royalty: number;
  creator: string;
  mintedAt: number;
  tokenURI: string;
  owner: string;
  listing: {
    seller: string;
    price: string;
    isAuction: boolean;
    endTime: number;
    highestBidder: string;
    highestBid: string;
    isActive: boolean;
  } | null;
}

export interface NFTActivity {
  id: string;
  type: 'mint' | 'list' | 'delist' | 'sale' | 'bid' | 'auction_end' | 'transfer';
  tokenId: number;
  from: string;
  to?: string;
  price?: string;
  timestamp: number;
  txHash: string;
  blockNumber: number;
}

export interface NFTHolder {
  address: string;
  nftsOwned: number;
  totalValue: number;
}

export interface NFTCollection {
  category: string;
  count: number;
  volume: number;
  floorPrice: number;
  listed: number;
}

export function useBlockchainStats() {
  // NFT contract stats
  const { data: totalMinted, isLoading: mintLoading, refetch: refetchMint } = useReadContract({
    address: PMNFT_ADDRESS,
    abi: PMNFTABI,
    functionName: 'tMint',
  });

  const { data: mintFee } = useReadContract({
    address: PMNFT_ADDRESS,
    abi: PMNFTABI,
    functionName: 'mFee',
  });

  const { data: nftPaused } = useReadContract({
    address: PMNFT_ADDRESS,
    abi: PMNFTABI,
    functionName: 'paused',
  });

  const { data: nftCollector } = useReadContract({
    address: PMNFT_ADDRESS,
    abi: PMNFTABI,
    functionName: 'col',
  });

  const { data: nftOwner } = useReadContract({
    address: PMNFT_ADDRESS,
    abi: PMNFTABI,
    functionName: 'owner',
  });

  const { data: categories } = useReadContract({
    address: PMNFT_ADDRESS,
    abi: PMNFTABI,
    functionName: 'getCats',
  });

  // Marketplace contract stats
  const { data: marketplaceStats, isLoading: marketLoading, refetch: refetchMarket } = useReadContract({
    address: PMMARKETPLACE_ADDRESS,
    abi: PMMarketplaceABI,
    functionName: 'getSt',
  });

  const { data: platformFee } = useReadContract({
    address: PMMARKETPLACE_ADDRESS,
    abi: PMMarketplaceABI,
    functionName: 'pFee',
  });

  const { data: marketplacePaused } = useReadContract({
    address: PMMARKETPLACE_ADDRESS,
    abi: PMMarketplaceABI,
    functionName: 'paused',
  });

  const { data: marketplaceCollector } = useReadContract({
    address: PMMARKETPLACE_ADDRESS,
    abi: PMMarketplaceABI,
    functionName: 'col',
  });

  const { data: marketplaceOwner } = useReadContract({
    address: PMMARKETPLACE_ADDRESS,
    abi: PMMarketplaceABI,
    functionName: 'owner',
  });

  const parsedStats = useMemo(() => {
    if (!marketplaceStats) return null;
    const s = marketplaceStats as readonly [bigint, bigint, bigint];
    return {
      totalMinted: totalMinted ? Number(totalMinted) : 0,
      totalListings: Number(s[0]),
      totalSales: Number(s[1]),
      totalVolume: formatEther(s[2]),
    };
  }, [marketplaceStats, totalMinted]);

  const refetch = useCallback(() => {
    refetchMint();
    refetchMarket();
  }, [refetchMint, refetchMarket]);

  return {
    stats: parsedStats,
    mintFee: mintFee ? formatEther(mintFee as bigint) : '10000',
    platformFee: platformFee ? Number(platformFee) : 2,
    isPaused: (nftPaused as boolean) || (marketplacePaused as boolean) || false,
    nftPaused: (nftPaused as boolean) ?? false,
    marketplacePaused: (marketplacePaused as boolean) ?? false,
    collector: (nftCollector as string) ?? '',
    marketplaceCollector: (marketplaceCollector as string) ?? '',
    owner: (nftOwner as string) ?? '',
    marketplaceOwner: (marketplaceOwner as string) ?? '',
    categories: (categories as string[]) ?? [],
    isLoading: mintLoading || marketLoading,
    refetch,
  };
}

export function useMarketplaceNFTs() {
  const publicClient = usePublicClient();
  const { stats } = useBlockchainStats();
  const [allNFTs, setAllNFTs] = useState<BlockchainNFT[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNFTs = useCallback(async () => {
    if (!publicClient || !stats) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const totalMinted = stats.totalMinted;
      if (totalMinted === 0) {
        setAllNFTs([]);
        setIsLoading(false);
        return;
      }

      const nfts: BlockchainNFT[] = [];
      const client = publicClient as any;

      for (let tokenId = 0; tokenId < totalMinted; tokenId++) {
        try {
          // Fetch metadata from NFT contract
          const metadata = await client.readContract({
            address: PMNFT_ADDRESS,
            abi: PMNFTABI,
            functionName: 'getMs',
            args: [BigInt(tokenId)],
          }) as { n: string; d: string; c: string; r: bigint; cr: `0x${string}`; t: bigint };

          const owner = await client.readContract({
            address: PMNFT_ADDRESS,
            abi: PMNFTABI,
            functionName: 'ownerOf',
            args: [BigInt(tokenId)],
          }) as `0x${string}`;

          const tokenURI = await client.readContract({
            address: PMNFT_ADDRESS,
            abi: PMNFTABI,
            functionName: 'tokenURI',
            args: [BigInt(tokenId)],
          }) as string;

          // Fetch listing from Marketplace contract
          const listing = await client.readContract({
            address: PMMARKETPLACE_ADDRESS,
            abi: PMMarketplaceABI,
            functionName: 'getLs',
            args: [BigInt(tokenId)],
          }) as { s: `0x${string}`; p: bigint; a: boolean; e: bigint; b: `0x${string}`; h: bigint; x: boolean };

          nfts.push({
            id: tokenId,
            name: metadata.n,
            description: metadata.d,
            category: metadata.c,
            royalty: Number(metadata.r),
            creator: metadata.cr,
            mintedAt: Number(metadata.t),
            tokenURI,
            owner,
            listing: listing.x ? {
              seller: listing.s,
              price: formatEther(listing.p),
              isAuction: listing.a,
              endTime: Number(listing.e),
              highestBidder: listing.b,
              highestBid: formatEther(listing.h),
              isActive: listing.x,
            } : null,
          });
        } catch (e) {
          console.error(`Error fetching NFT ${tokenId}:`, e);
        }
      }

      setAllNFTs(nfts);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [publicClient, stats]);

  useEffect(() => {
    fetchNFTs();
  }, [fetchNFTs]);

  const listedNFTs = useMemo(() => allNFTs.filter(nft => nft.listing?.isActive), [allNFTs]);

  return { allNFTs, listedNFTs, isLoading, error, refetch: fetchNFTs };
}

export function useNFTActivity(limit: number = 50) {
  const publicClient = usePublicClient();
  const [activities, setActivities] = useState<NFTActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    if (!publicClient) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const blockNumber = await publicClient.getBlockNumber();
      const fromBlock = blockNumber > 10000n ? blockNumber - 10000n : 0n;
      const client = publicClient as any;

      // Fetch mint events from NFT contract
      const mintLogs = await client.getLogs({
        address: PMNFT_ADDRESS,
        event: { type: 'event', name: 'Mint', inputs: [
          { indexed: true, name: 'i', type: 'uint256' },
          { indexed: true, name: 'c', type: 'address' },
          { indexed: false, name: 'n', type: 'string' },
          { indexed: false, name: 'ct', type: 'string' },
          { indexed: false, name: 'r', type: 'uint256' },
        ]},
        fromBlock,
        toBlock: 'latest',
      }).catch(() => []);

      // Fetch sale and bid events from Marketplace contract
      const [saleLogs, bidLogs] = await Promise.all([
        client.getLogs({
          address: PMMARKETPLACE_ADDRESS,
          event: { type: 'event', name: 'Sale', inputs: [
            { indexed: true, name: 'i', type: 'uint256' },
            { indexed: true, name: 's', type: 'address' },
            { indexed: true, name: 'b', type: 'address' },
            { indexed: false, name: 'p', type: 'uint256' },
          ]},
          fromBlock,
          toBlock: 'latest',
        }).catch(() => []),
        client.getLogs({
          address: PMMARKETPLACE_ADDRESS,
          event: { type: 'event', name: 'Bid', inputs: [
            { indexed: true, name: 'i', type: 'uint256' },
            { indexed: true, name: 'b', type: 'address' },
            { indexed: false, name: 'a', type: 'uint256' },
          ]},
          fromBlock,
          toBlock: 'latest',
        }).catch(() => []),
      ]);

      const allActivities: NFTActivity[] = [
        ...mintLogs.map((log: any) => ({
          id: `mint-${log.transactionHash}-${log.logIndex}`,
          type: 'mint' as const,
          tokenId: Number(log.args?.i || 0),
          from: log.args?.c || '',
          timestamp: 0,
          txHash: log.transactionHash || '',
          blockNumber: Number(log.blockNumber || 0),
        })),
        ...saleLogs.map((log: any) => ({
          id: `sale-${log.transactionHash}-${log.logIndex}`,
          type: 'sale' as const,
          tokenId: Number(log.args?.i || 0),
          from: log.args?.s || '',
          to: log.args?.b || '',
          price: log.args?.p ? formatEther(log.args.p) : undefined,
          timestamp: 0,
          txHash: log.transactionHash || '',
          blockNumber: Number(log.blockNumber || 0),
        })),
        ...bidLogs.map((log: any) => ({
          id: `bid-${log.transactionHash}-${log.logIndex}`,
          type: 'bid' as const,
          tokenId: Number(log.args?.i || 0),
          from: log.args?.b || '',
          price: log.args?.a ? formatEther(log.args.a) : undefined,
          timestamp: 0,
          txHash: log.transactionHash || '',
          blockNumber: Number(log.blockNumber || 0),
        })),
      ];

      allActivities.sort((a, b) => b.blockNumber - a.blockNumber);
      setActivities(allActivities.slice(0, limit));
    } catch (e) {
      console.error('Error fetching events:', e);
      const stored = localStorage.getItem('nftActivityHistory');
      if (stored) {
        try { setActivities(JSON.parse(stored).slice(0, limit)); } catch { setActivities([]); }
      }
    } finally {
      setIsLoading(false);
    }
  }, [publicClient, limit]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const addActivity = useCallback((activity: Omit<NFTActivity, 'id' | 'timestamp' | 'blockNumber'>) => {
    const newActivity: NFTActivity = {
      ...activity,
      id: `${activity.type}-${Date.now()}`,
      timestamp: Math.floor(Date.now() / 1000),
      blockNumber: 0,
    };
    setActivities(prev => {
      const updated = [newActivity, ...prev].slice(0, limit);
      localStorage.setItem('nftActivityHistory', JSON.stringify(updated));
      return updated;
    });
  }, [limit]);

  return { activities, isLoading, addActivity, refetch: fetchEvents };
}

export function useUserBlockchainNFTs(address: `0x${string}` | undefined) {
  const { allNFTs } = useMarketplaceNFTs();
  const [ownedNFTs, setOwnedNFTs] = useState<BlockchainNFT[]>([]);

  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: PMNFT_ADDRESS,
    abi: PMNFTABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  useEffect(() => {
    if (address && allNFTs.length > 0) {
      setOwnedNFTs(allNFTs.filter(nft => nft.owner.toLowerCase() === address.toLowerCase()));
    } else {
      setOwnedNFTs([]);
    }
  }, [address, allNFTs]);

  return {
    ownedNFTs,
    balance: balance ? Number(balance) : 0,
    isLoading: false,
    refetch: refetchBalance,
  };
}

export function useNFTHolders() {
  const { allNFTs } = useMarketplaceNFTs();

  const holders = useMemo(() => {
    const holderMap = new Map<string, NFTHolder>();
    
    allNFTs.forEach(nft => {
      const addr = nft.owner.toLowerCase();
      const existing = holderMap.get(addr);
      const nftValue = nft.listing?.price ? parseFloat(nft.listing.price) : 0;
      
      if (existing) {
        existing.nftsOwned += 1;
        existing.totalValue += nftValue;
      } else {
        holderMap.set(addr, { address: nft.owner, nftsOwned: 1, totalValue: nftValue });
      }
    });

    return Array.from(holderMap.values()).sort((a, b) => b.nftsOwned - a.nftsOwned);
  }, [allNFTs]);

  return { holders };
}

export function useNFTCollections() {
  const { allNFTs } = useMarketplaceNFTs();
  const { activities } = useNFTActivity(1000);

  const collections = useMemo(() => {
    const collectionMap = new Map<string, NFTCollection>();

    allNFTs.forEach(nft => {
      const existing = collectionMap.get(nft.category);
      if (existing) {
        existing.count += 1;
        if (nft.listing?.isActive) {
          existing.listed += 1;
          const price = parseFloat(nft.listing.price);
          if (existing.floorPrice === 0 || price < existing.floorPrice) {
            existing.floorPrice = price;
          }
        }
      } else {
        const price = nft.listing?.isActive ? parseFloat(nft.listing.price) : 0;
        collectionMap.set(nft.category, {
          category: nft.category,
          count: 1,
          volume: 0,
          floorPrice: price,
          listed: nft.listing?.isActive ? 1 : 0,
        });
      }
    });

    activities.filter(a => a.type === 'sale' && a.price).forEach(sale => {
      const nft = allNFTs.find(n => n.id === sale.tokenId);
      if (nft) {
        const collection = collectionMap.get(nft.category);
        if (collection) collection.volume += parseFloat(sale.price || '0');
      }
    });

    return Array.from(collectionMap.values()).sort((a, b) => b.volume - a.volume);
  }, [allNFTs, activities]);

  return { collections };
}

export function useFilteredNFTs(options: {
  searchQuery?: string;
  category?: string;
  creatorAddress?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price-low' | 'price-high' | 'date' | 'trending';
}) {
  const { listedNFTs, isLoading } = useMarketplaceNFTs();

  const filteredNFTs = useMemo(() => {
    let result = [...listedNFTs];

    if (options.searchQuery?.trim()) {
      const query = options.searchQuery.toLowerCase();
      result = result.filter(nft => 
        nft.name.toLowerCase().includes(query) ||
        nft.description.toLowerCase().includes(query) ||
        nft.category.toLowerCase().includes(query)
      );
    }

    if (options.category && options.category !== 'all') {
      result = result.filter(nft => nft.category === options.category);
    }

    if (options.creatorAddress?.trim()) {
      const creatorQuery = options.creatorAddress.toLowerCase();
      result = result.filter(nft => nft.creator.toLowerCase().includes(creatorQuery));
    }

    if (options.minPrice !== undefined) {
      result = result.filter(nft => {
        const price = nft.listing ? parseFloat(nft.listing.price) : 0;
        return price >= options.minPrice!;
      });
    }

    if (options.maxPrice !== undefined) {
      result = result.filter(nft => {
        const price = nft.listing ? parseFloat(nft.listing.price) : 0;
        return price <= options.maxPrice!;
      });
    }

    if (options.sortBy) {
      result.sort((a, b) => {
        const priceA = a.listing ? parseFloat(a.listing.price) : 0;
        const priceB = b.listing ? parseFloat(b.listing.price) : 0;
        
        switch (options.sortBy) {
          case 'price-low': return priceA - priceB;
          case 'price-high': return priceB - priceA;
          case 'date': return b.mintedAt - a.mintedAt;
          default: return 0;
        }
      });
    }

    return result;
  }, [listedNFTs, options]);

  return { filteredNFTs, isLoading };
}
