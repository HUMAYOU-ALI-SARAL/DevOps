import { NftCollection, NftMetadata, TransactionType } from "@/common/services/graphql/graphql.types";

////////////////////////
///////// NFT //////////
////////////////////////

export type FormattedNft = {
  token_id: string;
  serial_number: bigint;
  created_timestamp: number;
  token?: FormattedNftCollection;
  metadata?: NftMetadata | string | null,
  youAreOwner: boolean,
  owner?: {
    id?: number;
    firstName?: string;
    lastName?: string;
    username?: string;
    accountId?: string;
    evmAddress?: string;
  },
  price?: bigint;
  listingTimerJobId?: string;
};

export type NftCollectionQueryResponse = {
  token: NftCollection[],
}

export type NftCollectionMetadata = {
  name: string;
  image: string;
  description: string;
}

export type FormattedNftCollection = Omit<NftCollection, 'entity' | 'created_timestamp' | 'token_id' | 'custom_fee'> & {
  metadata?: string | NftCollectionMetadata,
  created_timestamp?: number,
  token_id: string;
  royalty_fee?: number;
  royalty_fee_collector?: string;
};


////////////////////////
///// TRANSACTIONS /////
////////////////////////

export type GraphqlTransfer = {
  type: string;
  sender_account_id: number;
  receiver_account_id: number;
  amount: number;
  token: {
    symbol: string;
    decimals: number;
    name: string;
    token_id: number;
  } | null,
  nft: {
    serial_number: number;
  } | null
}

export type GraphqlTransaction = {
  amount: number;
  transaction: {
    payer_account_id: number;
    result: number;
    type: number;
    id: string;
    charged_tx_fee: number;
    consensus_timestamp: string;
    transfers: GraphqlTransfer[];
  }
}

export type FormattedTransaction = {
  amount: number;
  transaction: {
    payer_account_id: string;
    result: number;
    type?: TransactionType;
    id: string;
    charged_tx_fee: number;
    consensus_timestamp: number;
    transfers: GraphqlTransfer[];
  }
}


////////////////////////
///// MARKET BIDS //////
////////////////////////

export type FormattedNftMarketBid = {
  amount: bigint;
  amountInUsd: number;
  ownerEvmAddress: string;
  tokenId: string;
  serialNumber: bigint;
  active: boolean;

  ownerAccountId: string | null;
  username: string | null;
  nft: FormattedNft,
}

//////////////////////////
// NFT TRANSFER HISTORY //
//////////////////////////

export enum NftActivityEventTypes {
  SALE = "sale",
  PURCHASE = "purchase",
  TRANSFER = "transfer",
  MINT = "mint",
}

export type NftActivity = {
  eventType: NftActivityEventTypes;
  price?: bigint | null;
  from: {
    accountId: string;
    username: string;
  };
  to: {
    accountId: string;
    username: string;
  };
  timestamp: number;
}