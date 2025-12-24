import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const NFT_STORAGE_API_KEY = Deno.env.get("NFT_STORAGE_API_KEY");
    
    if (!NFT_STORAGE_API_KEY) {
      throw new Error("NFT_STORAGE_API_KEY not configured");
    }

    const { image, metadata } = await req.json();

    if (!image || !metadata) {
      throw new Error("Image and metadata are required");
    }

    // Upload image to NFT.Storage
    let imageUrl = image;
    
    // If image is base64, upload it
    if (image.startsWith("data:")) {
      const base64Data = image.split(",")[1];
      const mimeType = image.split(";")[0].split(":")[1];
      const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      
      const imageResponse = await fetch("https://api.nft.storage/upload", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${NFT_STORAGE_API_KEY}`,
          "Content-Type": mimeType,
        },
        body: imageBuffer,
      });

      if (!imageResponse.ok) {
        const error = await imageResponse.text();
        throw new Error(`Failed to upload image: ${error}`);
      }

      const imageData = await imageResponse.json();
      imageUrl = `ipfs://${imageData.value.cid}`;
    }

    // Create NFT metadata with IPFS image URL
    const nftMetadata = {
      name: metadata.name,
      description: metadata.description,
      image: imageUrl,
      attributes: metadata.attributes || [],
      properties: {
        category: metadata.category,
        royalty: metadata.royalty,
        price: metadata.price,
        creator: metadata.creator,
        createdAt: new Date().toISOString(),
      },
    };

    // Upload metadata to NFT.Storage
    const metadataBlob = new Blob([JSON.stringify(nftMetadata)], { type: "application/json" });
    
    const metadataResponse = await fetch("https://api.nft.storage/upload", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NFT_STORAGE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(nftMetadata),
    });

    if (!metadataResponse.ok) {
      const error = await metadataResponse.text();
      throw new Error(`Failed to upload metadata: ${error}`);
    }

    const metadataResult = await metadataResponse.json();
    const metadataUri = `ipfs://${metadataResult.value.cid}`;
    
    // Also provide HTTP gateway URL for easy viewing
    const gatewayUrl = `https://nftstorage.link/ipfs/${metadataResult.value.cid}`;
    const imageGatewayUrl = imageUrl.startsWith("ipfs://") 
      ? `https://nftstorage.link/ipfs/${imageUrl.replace("ipfs://", "")}`
      : imageUrl;

    return new Response(
      JSON.stringify({
        success: true,
        tokenUri: metadataUri,
        imageUri: imageUrl,
        gatewayUrl,
        imageGatewayUrl,
        cid: metadataResult.value.cid,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("IPFS upload error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});