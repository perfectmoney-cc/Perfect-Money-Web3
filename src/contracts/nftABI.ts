// PMNFT Contract ABI - NFT Minting
export const PMNFTABI = [
  // Read
  {inputs:[],name:"name",outputs:[{type:"string"}],stateMutability:"view",type:"function"},
  {inputs:[],name:"symbol",outputs:[{type:"string"}],stateMutability:"view",type:"function"},
  {inputs:[],name:"pm",outputs:[{type:"address"}],stateMutability:"view",type:"function"},
  {inputs:[],name:"mFee",outputs:[{type:"uint256"}],stateMutability:"view",type:"function"},
  {inputs:[],name:"col",outputs:[{type:"address"}],stateMutability:"view",type:"function"},
  {inputs:[],name:"owner",outputs:[{type:"address"}],stateMutability:"view",type:"function"},
  {inputs:[],name:"paused",outputs:[{type:"bool"}],stateMutability:"view",type:"function"},
  {inputs:[],name:"tMint",outputs:[{type:"uint256"}],stateMutability:"view",type:"function"},
  
  // Token queries
  {inputs:[{name:"tokenId",type:"uint256"}],name:"ownerOf",outputs:[{type:"address"}],stateMutability:"view",type:"function"},
  {inputs:[{name:"owner",type:"address"}],name:"balanceOf",outputs:[{type:"uint256"}],stateMutability:"view",type:"function"},
  {inputs:[{name:"tokenId",type:"uint256"}],name:"tokenURI",outputs:[{type:"string"}],stateMutability:"view",type:"function"},
  {inputs:[{name:"minter",type:"address"}],name:"mCnt",outputs:[{type:"uint256"}],stateMutability:"view",type:"function"},
  {inputs:[{name:"category",type:"string"}],name:"vCat",outputs:[{type:"bool"}],stateMutability:"view",type:"function"},
  {inputs:[],name:"getCats",outputs:[{type:"string[]"}],stateMutability:"view",type:"function"},
  {inputs:[],name:"getTotalMinted",outputs:[{type:"uint256"}],stateMutability:"view",type:"function"},
  {inputs:[],name:"getNextTokenId",outputs:[{type:"uint256"}],stateMutability:"view",type:"function"},
  
  // Metadata
  {inputs:[{name:"tokenId",type:"uint256"}],name:"getMs",outputs:[{components:[
    {name:"n",type:"string"},{name:"d",type:"string"},{name:"c",type:"string"},
    {name:"r",type:"uint256"},{name:"cr",type:"address"},{name:"t",type:"uint256"}
  ],type:"tuple"}],stateMutability:"view",type:"function"},
  
  {inputs:[{name:"tokenId",type:"uint256"}],name:"ms",outputs:[
    {name:"n",type:"string"},{name:"d",type:"string"},{name:"c",type:"string"},
    {name:"r",type:"uint256"},{name:"cr",type:"address"},{name:"t",type:"uint256"}
  ],stateMutability:"view",type:"function"},
  
  // Write
  {inputs:[{name:"u",type:"string"},{name:"n",type:"string"},{name:"d",type:"string"},{name:"c",type:"string"},{name:"r",type:"uint256"}],name:"mint",outputs:[{type:"uint256"}],stateMutability:"nonpayable",type:"function"},
  
  // ERC721
  {inputs:[{name:"to",type:"address"},{name:"tokenId",type:"uint256"}],name:"approve",outputs:[],stateMutability:"nonpayable",type:"function"},
  {inputs:[{name:"from",type:"address"},{name:"to",type:"address"},{name:"tokenId",type:"uint256"}],name:"transferFrom",outputs:[],stateMutability:"nonpayable",type:"function"},
  {inputs:[{name:"from",type:"address"},{name:"to",type:"address"},{name:"tokenId",type:"uint256"}],name:"safeTransferFrom",outputs:[],stateMutability:"nonpayable",type:"function"},
  {inputs:[{name:"tokenId",type:"uint256"}],name:"getApproved",outputs:[{type:"address"}],stateMutability:"view",type:"function"},
  {inputs:[{name:"owner",type:"address"},{name:"operator",type:"address"}],name:"isApprovedForAll",outputs:[{type:"bool"}],stateMutability:"view",type:"function"},
  {inputs:[{name:"operator",type:"address"},{name:"approved",type:"bool"}],name:"setApprovalForAll",outputs:[],stateMutability:"nonpayable",type:"function"},
  
  // Admin
  {inputs:[{name:"f",type:"uint256"}],name:"setMFee",outputs:[],stateMutability:"nonpayable",type:"function"},
  {inputs:[{name:"c",type:"address"}],name:"setCol",outputs:[],stateMutability:"nonpayable",type:"function"},
  {inputs:[{name:"c",type:"string"}],name:"addCat",outputs:[],stateMutability:"nonpayable",type:"function"},
  {inputs:[{name:"a",type:"uint256"}],name:"wd",outputs:[],stateMutability:"nonpayable",type:"function"},
  {inputs:[{name:"p",type:"bool"}],name:"setPause",outputs:[],stateMutability:"nonpayable",type:"function"},
  
  // Events
  {anonymous:false,inputs:[{indexed:true,name:"i",type:"uint256"},{indexed:true,name:"c",type:"address"},{indexed:false,name:"n",type:"string"},{indexed:false,name:"ct",type:"string"},{indexed:false,name:"r",type:"uint256"}],name:"Mint",type:"event"},
  {anonymous:false,inputs:[{indexed:true,name:"from",type:"address"},{indexed:true,name:"to",type:"address"},{indexed:true,name:"tokenId",type:"uint256"}],name:"Transfer",type:"event"},
] as const;

// PMMarketplace Contract ABI - Marketplace Operations
export const PMMarketplaceABI = [
  // Read
  {inputs:[],name:"pm",outputs:[{type:"address"}],stateMutability:"view",type:"function"},
  {inputs:[],name:"nft",outputs:[{type:"address"}],stateMutability:"view",type:"function"},
  {inputs:[],name:"pFee",outputs:[{type:"uint256"}],stateMutability:"view",type:"function"},
  {inputs:[],name:"col",outputs:[{type:"address"}],stateMutability:"view",type:"function"},
  {inputs:[],name:"owner",outputs:[{type:"address"}],stateMutability:"view",type:"function"},
  {inputs:[],name:"paused",outputs:[{type:"bool"}],stateMutability:"view",type:"function"},
  {inputs:[],name:"tList",outputs:[{type:"uint256"}],stateMutability:"view",type:"function"},
  {inputs:[],name:"tSale",outputs:[{type:"uint256"}],stateMutability:"view",type:"function"},
  {inputs:[],name:"tVol",outputs:[{type:"uint256"}],stateMutability:"view",type:"function"},
  
  // Listing queries
  {inputs:[{name:"tokenId",type:"uint256"}],name:"aEnd",outputs:[{type:"bool"}],stateMutability:"view",type:"function"},
  {inputs:[{name:"tokenId",type:"uint256"}],name:"tLeft",outputs:[{type:"uint256"}],stateMutability:"view",type:"function"},
  {inputs:[],name:"getSt",outputs:[{type:"uint256"},{type:"uint256"},{type:"uint256"}],stateMutability:"view",type:"function"},
  
  // Listing
  {inputs:[{name:"tokenId",type:"uint256"}],name:"getLs",outputs:[{components:[
    {name:"s",type:"address"},{name:"p",type:"uint256"},{name:"a",type:"bool"},
    {name:"e",type:"uint256"},{name:"b",type:"address"},{name:"h",type:"uint256"},{name:"x",type:"bool"}
  ],type:"tuple"}],stateMutability:"view",type:"function"},
  
  {inputs:[{name:"tokenId",type:"uint256"}],name:"ls",outputs:[
    {name:"s",type:"address"},{name:"p",type:"uint256"},{name:"a",type:"bool"},
    {name:"e",type:"uint256"},{name:"b",type:"address"},{name:"h",type:"uint256"},{name:"x",type:"bool"}
  ],stateMutability:"view",type:"function"},
  
  // Write
  {inputs:[{name:"i",type:"uint256"},{name:"p",type:"uint256"}],name:"listSale",outputs:[],stateMutability:"nonpayable",type:"function"},
  {inputs:[{name:"i",type:"uint256"},{name:"p",type:"uint256"},{name:"dur",type:"uint256"}],name:"listAuct",outputs:[],stateMutability:"nonpayable",type:"function"},
  {inputs:[{name:"i",type:"uint256"}],name:"delist",outputs:[],stateMutability:"nonpayable",type:"function"},
  {inputs:[{name:"i",type:"uint256"}],name:"buy",outputs:[],stateMutability:"nonpayable",type:"function"},
  {inputs:[{name:"i",type:"uint256"},{name:"a",type:"uint256"}],name:"bid",outputs:[],stateMutability:"nonpayable",type:"function"},
  {inputs:[{name:"i",type:"uint256"}],name:"endAuct",outputs:[],stateMutability:"nonpayable",type:"function"},
  
  // Admin
  {inputs:[{name:"p",type:"uint256"}],name:"setPFee",outputs:[],stateMutability:"nonpayable",type:"function"},
  {inputs:[{name:"c",type:"address"}],name:"setCol",outputs:[],stateMutability:"nonpayable",type:"function"},
  {inputs:[{name:"a",type:"uint256"}],name:"wd",outputs:[],stateMutability:"nonpayable",type:"function"},
  {inputs:[{name:"p",type:"bool"}],name:"setPause",outputs:[],stateMutability:"nonpayable",type:"function"},
  
  // Events
  {anonymous:false,inputs:[{indexed:true,name:"i",type:"uint256"},{indexed:true,name:"s",type:"address"},{indexed:false,name:"p",type:"uint256"},{indexed:false,name:"a",type:"bool"},{indexed:false,name:"e",type:"uint256"}],name:"List",type:"event"},
  {anonymous:false,inputs:[{indexed:true,name:"i",type:"uint256"},{indexed:true,name:"s",type:"address"}],name:"Delist",type:"event"},
  {anonymous:false,inputs:[{indexed:true,name:"i",type:"uint256"},{indexed:true,name:"s",type:"address"},{indexed:true,name:"b",type:"address"},{indexed:false,name:"p",type:"uint256"}],name:"Sale",type:"event"},
  {anonymous:false,inputs:[{indexed:true,name:"i",type:"uint256"},{indexed:true,name:"b",type:"address"},{indexed:false,name:"a",type:"uint256"}],name:"Bid",type:"event"},
  {anonymous:false,inputs:[{indexed:true,name:"i",type:"uint256"},{indexed:true,name:"w",type:"address"},{indexed:false,name:"a",type:"uint256"}],name:"AEnd",type:"event"},
] as const;

// NFT Categories
export const NFT_CATEGORIES = [
  "PM Digital Card",
  "PM Voucher Card", 
  "PM Gift Cards",
  "PM Partner Badge",
  "PM Discount Card",
  "PM VIP Exclusive Card",
] as const;

export type NFTCategory = typeof NFT_CATEGORIES[number];
