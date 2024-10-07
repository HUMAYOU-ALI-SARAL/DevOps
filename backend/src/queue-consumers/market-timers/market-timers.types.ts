export type MarketTimersJob = {
  type: 'unlistNFT' | 'deleteBid',
  tokenEvmAddress: string;
  serialNumber: number;
  buyerEvmAddress?: string;
};