import { FormattedNft, FormattedNftCollection, FormattedNftMarketBid, FormattedTransaction, NftActivity } from "@/common/modules/blockchain-data/blockchain-data.types";
import { NftMarketItemInfo, NftMarketBid } from "@/common/modules/web3/web3.types";
import { DefaultPaginationFilter, NftsFilter, PagePagination } from "@/common/types/pagination.types";

////////////////////////
///////// INFO /////////
////////////////////////

export class AccountBalanceDTO {
  constructor(
    readonly hbarBalance: string,
    readonly balanceInUSD: string,
  ) {}
}

export class GetAccountEvmDTO {
  constructor(
    readonly accountId: string,
  ) {}
}

export class AccountEvmDTO {
  constructor(
    readonly evmAddress: string,
  ) {}
}

////////////////////////
///////// NFT //////////
////////////////////////

export class GetNFTsDTO implements PagePagination, DefaultPaginationFilter, NftsFilter  {
  readonly nftCreator?: string | null;
  readonly accountId?: string | null;
  readonly tokenId?: string | null;
  readonly serialNumber?: number | null;
  readonly searchQuery?: string;
  readonly isMarketListed?: boolean;

  readonly page?: number;
  readonly pageSize?: number;
  readonly orderBy?: string;
  readonly orderDirection?: 'asc' | 'desc';

  constructor(options: GetNFTsDTO) {
    const {
      nftCreator = null,
      accountId = null,
      tokenId = null,
      serialNumber = null,
      searchQuery = null,
      isMarketListed = false,
      page = 0,
      pageSize = 10,
      orderBy = 'created_timestamp',
      orderDirection = 'desc',
    } = options;

    this.nftCreator = nftCreator;
    this.accountId = accountId;
    this.tokenId = tokenId;
    this.serialNumber = serialNumber;
    this.searchQuery = searchQuery;
    this.isMarketListed = isMarketListed;
    this.page = Math.max(1, page);
    this.pageSize = Math.min(Math.max(0, pageSize), 20);
    this.orderBy = orderBy;
    this.orderDirection = orderDirection;
  }
}

export class NftsDTO {
  constructor(
    readonly nfts: FormattedNft[],
    readonly isLastPage: boolean,
  ) {}
}

export class NftCollectionsDTO {
  constructor(
    readonly collections: FormattedNftCollection[],
    readonly isLastPage: boolean,
  ) {}
}

////////////////////////
///// TRANSACTIONS /////
////////////////////////

export class GetTransactionsDTO implements PagePagination, DefaultPaginationFilter  {
  readonly accountId: string;

  readonly page: number;
  readonly pageSize: number;
  readonly orderBy: string;
  readonly orderDirection: 'asc' | 'desc';


  constructor(options: GetTransactionsDTO) {
    const {
      accountId = null,
      page = 0,
      pageSize = 10,
      orderBy = 'consensus_timestamp',
      orderDirection = 'desc',
    } = options;

    this.accountId = accountId;
    this.page = Math.max(1, page);
    this.pageSize = Math.min(Math.max(0, pageSize), 20);
    this.orderBy = orderBy;
    this.orderDirection = orderDirection;
  }
}


export class GetTransactionsMirrorNodeDTO  {
  readonly limit?: number;
  readonly order?: 'asc' | 'desc'; 
  readonly accountId?: string | null;
  readonly timestamp?: string | null;

  constructor(options: GetTransactionsMirrorNodeDTO) {
    const {
      accountId = null,
      limit = 10,
      timestamp = null,
      order = 'desc',
    } = options;

    this.accountId = accountId;
    this.limit = Math.min(Math.max(limit, 0), 20);
    this.order = order;
    this.timestamp = timestamp;
  }
}

export class TransactionsDTO {
  constructor(
    readonly transactions: FormattedTransaction[],
    readonly isLastPage: boolean,
  ) {}
}


////////////////////////
///// MARKET BIDS //////
////////////////////////

export class GetNftMarketBidsDTO implements PagePagination {
  readonly tokenId: string;
  readonly serialNumber: number;
  readonly page: number;
  readonly pageSize: number;

  constructor(options: GetNftMarketBidsDTO) {
    const {
      tokenId,
      serialNumber,
      page = 1,
      pageSize = 10,
    } = options;

    this.tokenId = tokenId;
    this.serialNumber = serialNumber;
    this.page = Math.max(1, page);
    this.pageSize = Math.min(Math.max(0, pageSize), 20);
  }
}

export class NftMarketBidsDTO {
  constructor(
    readonly bids: FormattedNftMarketBid[],
    readonly isLastPage?: boolean,
  ) {}
}

export class GetNftMarketItemInfoDTO {
  readonly tokenId: string;
  readonly serialNumber: number;

  constructor(options: GetNftMarketItemInfoDTO) {
    const {
      tokenId,
      serialNumber,
    } = options;

    this.tokenId = tokenId;
    this.serialNumber = serialNumber;
  }
}

export class NftMarketItemInfoDTO implements NftMarketItemInfo {
  readonly owner: string;
  readonly price: bigint;
  readonly token: string;
  readonly serialNumber: bigint;
  readonly isListed: boolean;
  readonly listingEndTimestamp: number;

  constructor(options: NftMarketItemInfo) {
    const {
      owner,
      price,
      token,
      serialNumber,
      isListed,
      listingEndTimestamp,
    } = options;

    this.owner = owner;
    this.price = price;
    this.token = token;
    this.serialNumber = serialNumber;
    this.isListed = isListed;
    this.listingEndTimestamp = listingEndTimestamp;
  }
}


export class GetNftMarketBidDTO {
  readonly tokenId: string;
  readonly serialNumber: number;
  readonly accountId: string;

  constructor(options: GetNftMarketBidDTO) {
    const {
      tokenId,
      serialNumber,
      accountId,
    } = options;

    this.tokenId = tokenId;
    this.serialNumber = serialNumber;
    this.accountId = accountId;
  }
}

export class NftMarketBidDTO {
  constructor(
    readonly bid: FormattedNftMarketBid,
  ) {}
}

export class GetNftMarketAccountBidsDTO implements PagePagination {
  readonly accountId: string;
  readonly type: 'received' | 'sent';
  readonly page: number;
  readonly pageSize: number;

  constructor(options: GetNftMarketAccountBidsDTO) {
    const {
      accountId,
      type = 'received',
      page = 1,
      pageSize = 10,
    } = options;

    this.accountId = accountId;
    this.type = type;
    this.page = Math.max(1, page);
    this.pageSize = Math.min(Math.max(0, pageSize), 20);
  }
}

///////////////////////////
///// MARKET-LISTING //////
//////////////////////////
export class PostNftMarketItemsDTO {
  readonly nfts: FormattedNft[];
  readonly price?: number;
  readonly isListed?: boolean;
  readonly listingEndTimestamp?: number;

  constructor(options: PostNftMarketItemsDTO) {
    const {
      nfts,
      price = 0,
      isListed = false,
      listingEndTimestamp = 0,
    } = options;

    this.nfts = nfts;
    this.price = price;
    this.isListed = isListed;
    this.listingEndTimestamp = listingEndTimestamp;
  }
}

////////////////////////
//// NFT ACTIVITIES ////
////////////////////////

export class GetNftActivitiesDTO {
  readonly tokenId: string;
  readonly serialNumber: number;

  constructor(options: GetNftActivitiesDTO) {
    const {
      tokenId,
      serialNumber,
    } = options;

    this.tokenId = tokenId;
    this.serialNumber = serialNumber;
  }
}

export class NftActivitiesDTO {
  constructor(readonly history: NftActivity[]) {}
}

////////////////////////
///// NFT ALLOWANCE ////
////////////////////////

export class GetNftAllowanceDTO {
  readonly ownerId: string;
  readonly spenderId: string;
  readonly tokenId: string;
  readonly serialNumber: number;

  constructor(options: GetNftAllowanceDTO) {
    const {
      ownerId,
      spenderId,
      tokenId,
      serialNumber,
    } = options;

    this.ownerId = ownerId;
    this.spenderId = spenderId;
    this.tokenId = tokenId;
    this.serialNumber = serialNumber;
  }
}

export class NftAllowanceDTO {
  constructor(
    readonly hasAllowance: boolean,
  ) {}
}

////////////////////////
/// NFT ASSOCIATION ////
////////////////////////

export class GetTokenAssociationDTO {
  readonly accountId: string;
  readonly tokenId: string;

  constructor(options: GetTokenAssociationDTO) {
    const {
      accountId,
      tokenId,
    } = options;

    this.accountId = accountId;
    this.tokenId = tokenId;
  }
}

export class TokenAssociationDTO {
  constructor(
    readonly isAssociated: boolean,
  ) {}
}

////////////////////////
/// NFT-MARKET DEAL ////
////////////////////////

export class PostNftMarketDealDTO {
  readonly ownerId: string;
  readonly buyerId: string;
  readonly transactionId: string;
  readonly price: bigint;
  readonly tokenId: string;
  readonly serialNumber: number;

  constructor(options: PostNftMarketDealDTO) {
    const {
      ownerId,
      buyerId,
      transactionId,
      price,
      tokenId,
      serialNumber,
    } = options;

    this.ownerId = ownerId;
    this.buyerId = buyerId;
    this.transactionId = transactionId;
    this.price = price;
    this.tokenId = tokenId;
    this.serialNumber = serialNumber;
  }
}

export class GetNftMarketPriceHistoryDTO {
  readonly timestamp: number;
  readonly tokenId: string;
  readonly serialNumber: number;

  constructor(options: GetNftMarketPriceHistoryDTO) {
    const {
      timestamp,
      tokenId,
      serialNumber,
    } = options;

    this.timestamp = timestamp;
    this.tokenId = tokenId;
    this.serialNumber = serialNumber;
  }
}

export type NftMarketPriceHistoryChunk = {
  timestamp: number;
  price: bigint;
}

export class NftMarketPriceHistoryDTO {
  constructor(readonly history: NftMarketPriceHistoryChunk[]) {}
}