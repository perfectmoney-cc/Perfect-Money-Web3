const SUPABASE_URL = "https://hxfyxlbkghxnepwwabme.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4Znl4bGJrZ2h4bmVwd3dhYm1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMjg3OTQsImV4cCI6MjA2MzYwNDc5NH0.vnU5bBBGt15cHV3wB6NnkPz8xwcFjFJWvNi6F7bsjZ8";

export interface NFTMetadata {
  name: string;
  description: string;
  category: string;
  royalty: number;
  price: number;
  creator: string;
  attributes?: Array<{ trait_type: string; value: string }>;
}

export interface IPFSUploadResult {
  success: boolean;
  tokenUri?: string;
  imageUri?: string;
  gatewayUrl?: string;
  imageGatewayUrl?: string;
  cid?: string;
  error?: string;
}

/**
 * Upload NFT image and metadata to IPFS via NFT.Storage
 */
export async function uploadToIPFS(
  image: string | null,
  metadata: NFTMetadata
): Promise<IPFSUploadResult> {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/upload-to-ipfs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ image, metadata }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to upload to IPFS');
    }

    const data = await response.json();
    return data as IPFSUploadResult;
  } catch (error: any) {
    console.error("IPFS upload error:", error);
    return {
      success: false,
      error: error.message || "Failed to upload to IPFS",
    };
  }
}

/**
 * Convert IPFS URI to HTTP gateway URL
 */
export function ipfsToHttp(ipfsUri: string): string {
  if (!ipfsUri) return "";
  if (ipfsUri.startsWith("ipfs://")) {
    return `https://nftstorage.link/ipfs/${ipfsUri.replace("ipfs://", "")}`;
  }
  return ipfsUri;
}

/**
 * Convert HTTP gateway URL back to IPFS URI
 */
export function httpToIpfs(httpUrl: string): string {
  if (!httpUrl) return "";
  const match = httpUrl.match(/\/ipfs\/(.+)$/);
  if (match) {
    return `ipfs://${match[1]}`;
  }
  return httpUrl;
}
