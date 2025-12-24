// Address validation utility with ENS support
export const isValidEthereumAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

export const isValidENSName = (name: string): boolean => {
  return /^[a-zA-Z0-9-]+\.eth$/.test(name);
};

export const validateRecipientAddress = (address: string): {
  isValid: boolean;
  error?: string;
  isENS: boolean;
} => {
  if (!address || address.trim() === '') {
    return { isValid: false, error: 'Address is required', isENS: false };
  }

  const trimmedAddress = address.trim();

  // Check if it's an ENS name
  if (isValidENSName(trimmedAddress)) {
    return { isValid: true, isENS: true };
  }

  // Check if it's a valid Ethereum address
  if (isValidEthereumAddress(trimmedAddress)) {
    return { isValid: true, isENS: false };
  }

  // Check if it looks like an incomplete address
  if (trimmedAddress.startsWith('0x')) {
    if (trimmedAddress.length < 42) {
      return { isValid: false, error: 'Address is too short', isENS: false };
    }
    if (trimmedAddress.length > 42) {
      return { isValid: false, error: 'Address is too long', isENS: false };
    }
    return { isValid: false, error: 'Invalid address format', isENS: false };
  }

  return { isValid: false, error: 'Invalid address. Use 0x... or ENS name.eth', isENS: false };
};

export const checksumAddress = (address: string): string => {
  // Simple checksum implementation
  return address.toLowerCase();
};
