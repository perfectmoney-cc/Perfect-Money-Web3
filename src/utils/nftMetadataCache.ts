interface CachedMetadata {
  data: any;
  timestamp: number;
}

const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes
const CACHE_KEY_PREFIX = 'nft_metadata_';

class NFTMetadataCache {
  private memoryCache: Map<string, CachedMetadata> = new Map();

  private getCacheKey(uri: string): string {
    return `${CACHE_KEY_PREFIX}${uri}`;
  }

  get(uri: string): any | null {
    const key = this.getCacheKey(uri);
    
    // Check memory cache first
    const memCached = this.memoryCache.get(key);
    if (memCached && Date.now() - memCached.timestamp < CACHE_DURATION) {
      return memCached.data;
    }

    // Check localStorage
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed: CachedMetadata = JSON.parse(stored);
        if (Date.now() - parsed.timestamp < CACHE_DURATION) {
          // Restore to memory cache
          this.memoryCache.set(key, parsed);
          return parsed.data;
        } else {
          // Clean up expired cache
          localStorage.removeItem(key);
        }
      }
    } catch (e) {
      console.warn('Failed to read from cache:', e);
    }

    return null;
  }

  set(uri: string, data: any): void {
    const key = this.getCacheKey(uri);
    const cached: CachedMetadata = {
      data,
      timestamp: Date.now()
    };

    // Store in memory
    this.memoryCache.set(key, cached);

    // Store in localStorage
    try {
      localStorage.setItem(key, JSON.stringify(cached));
    } catch (e) {
      console.warn('Failed to write to cache:', e);
      // If localStorage is full, clear old entries
      this.clearOldEntries();
    }
  }

  private clearOldEntries(): void {
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_KEY_PREFIX)) {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            const parsed: CachedMetadata = JSON.parse(stored);
            if (Date.now() - parsed.timestamp >= CACHE_DURATION) {
              keysToRemove.push(key);
            }
          }
        } catch {
          keysToRemove.push(key!);
        }
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  clearAll(): void {
    this.memoryCache.clear();
    
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_KEY_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }
}

export const nftMetadataCache = new NFTMetadataCache();

/**
 * Fetch NFT metadata with caching
 */
export async function fetchNFTMetadata(uri: string): Promise<any> {
  // Check cache first
  const cached = nftMetadataCache.get(uri);
  if (cached) {
    return cached;
  }

  // Handle different URI formats
  let fetchUrl = uri;
  
  if (uri.startsWith('ipfs://')) {
    fetchUrl = `https://nftstorage.link/ipfs/${uri.replace('ipfs://', '')}`;
  } else if (uri.startsWith('data:application/json;base64,')) {
    // Handle base64 encoded JSON
    try {
      const base64Data = uri.replace('data:application/json;base64,', '');
      const jsonString = atob(base64Data);
      const data = JSON.parse(jsonString);
      nftMetadataCache.set(uri, data);
      return data;
    } catch (e) {
      console.error('Failed to parse base64 metadata:', e);
      return null;
    }
  }

  try {
    const response = await fetch(fetchUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.status}`);
    }
    
    const data = await response.json();
    nftMetadataCache.set(uri, data);
    return data;
  } catch (error) {
    console.error('Error fetching NFT metadata:', error);
    return null;
  }
}
