export type QueryBuildOptions = {
  filterQuery: string,
  orderBy: string,
  orderDirection: 'asc' | 'desc',
  pageSize: number,
  page: number,
}

////////////////////////
///////// NFT //////////
////////////////////////

type AccountNftHistory = {
  account_id: number;
  start_timestamp: string;
  end_timestamp: string;
}[]

export type NftCollection = {
  token_id: number;
  name: string;
  symbol?: string;
  created_timestamp?: string;
  total_supply: number;
  max_supply: number;
  custom_fee?: {
    royalty_fees?: {
      numerator?: number,
      denominator?: number,
      fallback_fee?: number,
      collector_account_id?: number,
      all_collectors_are_exempt?: boolean,
    }[];
    fixed_fees?: string;
    fractional_fees?: string;
  }[],
  entity?: {
    memo: string;
  },
}

export interface Nft {
  token_id: number;
  account_id: number;
  serial_number: number;
  metadata?: string;
  created_timestamp: string;
  history: AccountNftHistory;
  token: NftCollection;
}

export type NftQueryResponse = {
  nft: Nft[];
}

type NftMetadataAttribute = {
  trait_type: string;
  value: string;
}

export type NftMetadata = {
  name: string;
  image: string;
  type: string;
  description: string;
  attributes: NftMetadataAttribute[];
}

export type NftTransfer = {
    is_approval: boolean;
    receiver_account_id: string;
    sender_account_id: string;
    serial_number: number;
    token_id: string;
}

export type CryptoTransfer = {
  account: string;
  amount: number;
  is_approval: boolean;
}

export enum TransactionType {
  RECEIVED_NFT = "received_nft",
  TRANSFERRED_NFT = "transferred_nft",
  RECEIVED_HBAR = "received_hbar",
  TRANSFERRED_HBAR = "transferred_hbar",
}

export type GraphqlTransferHistoryChunk = {
  account_id: number;
  start_timestamp: string;
  end_timestamp: string;
}

export type GraphqlNftTransferHistory = {
  account_id: number;
  created_timestamp: string;
  history: GraphqlTransferHistoryChunk[];
}