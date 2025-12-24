import { useState, useEffect, useCallback } from 'react';

const FAVORITES_STORAGE_KEY = 'nft_favorites';

export interface FavoriteNFT {
  id: number;
  name: string;
  price: number;
  category: string;
  image?: string | null;
  addedAt: number;
}

export function useNFTFavorites() {
  const [favorites, setFavorites] = useState<FavoriteNFT[]>([]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch {
        setFavorites([]);
      }
    }
  }, []);

  // Save favorites to localStorage whenever they change
  const saveFavorites = useCallback((newFavorites: FavoriteNFT[]) => {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(newFavorites));
    setFavorites(newFavorites);
  }, []);

  const addToFavorites = useCallback((nft: Omit<FavoriteNFT, 'addedAt'>) => {
    const newFavorite: FavoriteNFT = {
      ...nft,
      addedAt: Date.now(),
    };
    const updated = [...favorites.filter(f => f.id !== nft.id), newFavorite];
    saveFavorites(updated);
  }, [favorites, saveFavorites]);

  const removeFromFavorites = useCallback((nftId: number) => {
    const updated = favorites.filter(f => f.id !== nftId);
    saveFavorites(updated);
  }, [favorites, saveFavorites]);

  const toggleFavorite = useCallback((nft: Omit<FavoriteNFT, 'addedAt'>) => {
    const exists = favorites.some(f => f.id === nft.id);
    if (exists) {
      removeFromFavorites(nft.id);
      return false;
    } else {
      addToFavorites(nft);
      return true;
    }
  }, [favorites, addToFavorites, removeFromFavorites]);

  const isFavorite = useCallback((nftId: number) => {
    return favorites.some(f => f.id === nftId);
  }, [favorites]);

  const clearAllFavorites = useCallback(() => {
    saveFavorites([]);
  }, [saveFavorites]);

  return {
    favorites,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    clearAllFavorites,
    favoritesCount: favorites.length,
  };
}
