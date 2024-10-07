export type NftMarketBid = {
  owner: string;
  amount: bigint;
  token: string;
  serialNumber: bigint;
}

export type NftMarketItemInfo = {
  owner: string;
  price: bigint;
  token: string;
  serialNumber: bigint;
  isListed: boolean;
  listingEndTimestamp?: number;
}