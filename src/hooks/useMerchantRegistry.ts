import { useState, useEffect, useCallback } from 'react';
import { CONTRACT_ADDRESSES } from '@/contracts/addresses';

export interface BlockchainMerchant {
  address: string;
  name: string;
  category: string;
  description: string;
  tier: number;
  isActive: boolean;
  totalRevenue: string;
  totalTransactions: number;
  registeredAt: Date;
  cashbackBonus: number;
  rating: number;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://xldptgnlmwpfcvnpvkbx.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsZHB0Z25sbXdwZmN2bnB2a2J4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyNDI4NjMsImV4cCI6MjA2MDgxODg2M30.cUNkPBxNBV1LjNHdaASPjYzGyjjLmvUe3CcDj9RjWbg";

// Category mapping based on merchant type
const CATEGORY_NAMES = ['General', 'Retail', 'Food & Dining', 'Entertainment', 'Travel', 'Services', 'Gaming'];

// Mock additional merchants to supplement blockchain data
const FEATURED_MERCHANTS: BlockchainMerchant[] = [
  { 
    address: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef12', 
    name: 'CryptoMart', 
    category: 'Retail', 
    description: 'Premium electronics & crypto merchandise',
    tier: 2,
    isActive: true,
    totalRevenue: '150000',
    totalTransactions: 1250,
    registeredAt: new Date('2024-01-15'),
    cashbackBonus: 3,
    rating: 4.8
  },
  { 
    address: '0x2b3c4d5e6f7890abcdef1234567890abcdef1234', 
    name: 'GameHub Pro', 
    category: 'Gaming', 
    description: 'Digital games, gift cards & gaming credits',
    tier: 2,
    isActive: true,
    totalRevenue: '89000',
    totalTransactions: 2100,
    registeredAt: new Date('2024-02-20'),
    cashbackBonus: 5,
    rating: 4.7
  },
  { 
    address: '0x3c4d5e6f7890abcdef1234567890abcdef123456', 
    name: 'FoodExpress', 
    category: 'Food & Dining', 
    description: 'Restaurant delivery & meal subscriptions',
    tier: 1,
    isActive: true,
    totalRevenue: '45000',
    totalTransactions: 890,
    registeredAt: new Date('2024-03-10'),
    cashbackBonus: 2,
    rating: 4.5
  },
  { 
    address: '0x4d5e6f7890abcdef1234567890abcdef12345678', 
    name: 'TravelChain', 
    category: 'Travel', 
    description: 'Flights, hotels & crypto travel packages',
    tier: 2,
    isActive: true,
    totalRevenue: '320000',
    totalTransactions: 450,
    registeredAt: new Date('2024-01-05'),
    cashbackBonus: 4,
    rating: 4.9
  },
  { 
    address: '0x5e6f7890abcdef1234567890abcdef1234567890', 
    name: 'StreamVault', 
    category: 'Entertainment', 
    description: 'Streaming subscriptions & digital content',
    tier: 1,
    isActive: true,
    totalRevenue: '28000',
    totalTransactions: 1800,
    registeredAt: new Date('2024-04-01'),
    cashbackBonus: 1,
    rating: 4.4
  },
  { 
    address: '0x6f7890abcdef1234567890abcdef123456789012', 
    name: 'CloudStack', 
    category: 'Services', 
    description: 'Cloud hosting, domains & developer tools',
    tier: 2,
    isActive: true,
    totalRevenue: '178000',
    totalTransactions: 620,
    registeredAt: new Date('2024-02-15'),
    cashbackBonus: 3,
    rating: 4.9
  },
  { 
    address: '0x7890abcdef1234567890abcdef12345678901234', 
    name: 'NFT Gallery', 
    category: 'Entertainment', 
    description: 'Digital art & NFT marketplace',
    tier: 1,
    isActive: true,
    totalRevenue: '56000',
    totalTransactions: 340,
    registeredAt: new Date('2024-03-25'),
    cashbackBonus: 2,
    rating: 4.6
  },
  { 
    address: '0x890abcdef1234567890abcdef1234567890123456', 
    name: 'CryptoFashion', 
    category: 'Retail', 
    description: 'Designer clothing accepting crypto',
    tier: 1,
    isActive: true,
    totalRevenue: '67000',
    totalTransactions: 520,
    registeredAt: new Date('2024-04-10'),
    cashbackBonus: 2,
    rating: 4.5
  },
  { 
    address: '0x90abcdef1234567890abcdef123456789012345678', 
    name: 'HealthPlus', 
    category: 'Services', 
    description: 'Health supplements & wellness products',
    tier: 1,
    isActive: true,
    totalRevenue: '34000',
    totalTransactions: 280,
    registeredAt: new Date('2024-05-01'),
    cashbackBonus: 1,
    rating: 4.3
  },
  { 
    address: '0xabcdef1234567890abcdef12345678901234567890', 
    name: 'EduLearn', 
    category: 'Services', 
    description: 'Online courses & educational content',
    tier: 1,
    isActive: true,
    totalRevenue: '42000',
    totalTransactions: 380,
    registeredAt: new Date('2024-04-20'),
    cashbackBonus: 2,
    rating: 4.7
  },
];

export const useMerchantRegistry = () => {
  const [merchants, setMerchants] = useState<BlockchainMerchant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const MERCHANT_CONTRACT = CONTRACT_ADDRESSES[56]?.PMMerchant;

  const fetchMerchants = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Try to fetch from blockchain events
      const response = await fetch(`${SUPABASE_URL}/functions/v1/fetch-merchant-events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          contractAddress: MERCHANT_CONTRACT,
          eventTypes: ['SubscriptionPurchased', 'SubscriptionRenewed'],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.merchants && data.merchants.length > 0) {
          // Map blockchain events to merchant objects
          const blockchainMerchants: BlockchainMerchant[] = data.merchants.map((m: any) => ({
            address: m.address,
            name: m.name || `Merchant ${m.address.slice(0, 8)}`,
            category: CATEGORY_NAMES[m.category || 0] || 'General',
            description: m.description || 'Verified merchant accepting PM payments',
            tier: m.tier || 0,
            isActive: m.isActive !== false,
            totalRevenue: m.totalRevenue || '0',
            totalTransactions: m.totalTransactions || 0,
            registeredAt: new Date(m.registeredAt || Date.now()),
            cashbackBonus: Math.min(5, Math.floor(Math.random() * 5) + 1), // Random bonus 1-5%
            rating: 4 + Math.random() * 1, // Random rating 4-5
          }));

          // Combine with featured merchants, avoiding duplicates
          const existingAddresses = new Set(blockchainMerchants.map(m => m.address.toLowerCase()));
          const combinedMerchants = [
            ...blockchainMerchants,
            ...FEATURED_MERCHANTS.filter(m => !existingAddresses.has(m.address.toLowerCase()))
          ];

          setMerchants(combinedMerchants);
        } else {
          // Use featured merchants if no blockchain data
          setMerchants(FEATURED_MERCHANTS);
        }
      } else {
        // Fallback to featured merchants
        console.log('Using featured merchants (edge function not available)');
        setMerchants(FEATURED_MERCHANTS);
      }
    } catch (err) {
      console.error('Error fetching merchants:', err);
      // Fallback to featured merchants on error
      setMerchants(FEATURED_MERCHANTS);
    } finally {
      setIsLoading(false);
    }
  }, [MERCHANT_CONTRACT]);

  useEffect(() => {
    fetchMerchants();
  }, [fetchMerchants]);

  const getMerchantsByCategory = useCallback((category: string) => {
    if (category === 'All') return merchants.filter(m => m.isActive);
    return merchants.filter(m => m.category === category && m.isActive);
  }, [merchants]);

  const searchMerchants = useCallback((query: string) => {
    const lowerQuery = query.toLowerCase();
    return merchants.filter(m => 
      m.isActive && (
        m.name.toLowerCase().includes(lowerQuery) ||
        m.description.toLowerCase().includes(lowerQuery) ||
        m.category.toLowerCase().includes(lowerQuery)
      )
    );
  }, [merchants]);

  const getTopMerchants = useCallback((limit: number = 5) => {
    return [...merchants]
      .filter(m => m.isActive)
      .sort((a, b) => b.totalTransactions - a.totalTransactions)
      .slice(0, limit);
  }, [merchants]);

  return {
    merchants: merchants.filter(m => m.isActive),
    allMerchants: merchants,
    isLoading,
    error,
    refetch: fetchMerchants,
    getMerchantsByCategory,
    searchMerchants,
    getTopMerchants,
    categories: CATEGORY_NAMES,
  };
};
