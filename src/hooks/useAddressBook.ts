import { useState, useEffect } from 'react';

export interface SavedAddress {
  id: string;
  address: string;
  label: string;
  network?: string;
  createdAt: Date;
  lastUsed?: Date;
}

const STORAGE_KEY = 'pm_address_book';

export const useAddressBook = () => {
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);

  // Load addresses from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAddresses(parsed.map((addr: any) => ({
          ...addr,
          createdAt: new Date(addr.createdAt),
          lastUsed: addr.lastUsed ? new Date(addr.lastUsed) : undefined
        })));
      } catch (error) {
        console.error('Failed to parse address book:', error);
      }
    }
  }, []);

  // Save to localStorage whenever addresses change
  const saveToStorage = (newAddresses: SavedAddress[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newAddresses));
    setAddresses(newAddresses);
  };

  const addAddress = (address: string, label: string, network?: string): SavedAddress => {
    const newAddress: SavedAddress = {
      id: `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      address: address.trim(),
      label: label.trim(),
      network,
      createdAt: new Date()
    };

    const updated = [newAddress, ...addresses];
    saveToStorage(updated);
    return newAddress;
  };

  const removeAddress = (id: string) => {
    const updated = addresses.filter(addr => addr.id !== id);
    saveToStorage(updated);
  };

  const updateAddress = (id: string, updates: Partial<Pick<SavedAddress, 'label' | 'network'>>) => {
    const updated = addresses.map(addr => 
      addr.id === id ? { ...addr, ...updates } : addr
    );
    saveToStorage(updated);
  };

  const markAsUsed = (id: string) => {
    const updated = addresses.map(addr => 
      addr.id === id ? { ...addr, lastUsed: new Date() } : addr
    );
    saveToStorage(updated);
  };

  const searchAddresses = (query: string): SavedAddress[] => {
    const lowerQuery = query.toLowerCase();
    return addresses.filter(addr => 
      addr.label.toLowerCase().includes(lowerQuery) ||
      addr.address.toLowerCase().includes(lowerQuery)
    );
  };

  const getRecentAddresses = (limit: number = 5): SavedAddress[] => {
    return [...addresses]
      .sort((a, b) => {
        const aTime = a.lastUsed?.getTime() || a.createdAt.getTime();
        const bTime = b.lastUsed?.getTime() || b.createdAt.getTime();
        return bTime - aTime;
      })
      .slice(0, limit);
  };

  const addressExists = (address: string): boolean => {
    return addresses.some(addr => addr.address.toLowerCase() === address.toLowerCase());
  };

  return {
    addresses,
    addAddress,
    removeAddress,
    updateAddress,
    markAsUsed,
    searchAddresses,
    getRecentAddresses,
    addressExists
  };
};
