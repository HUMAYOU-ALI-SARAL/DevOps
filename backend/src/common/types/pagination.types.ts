export interface PagePagination {
  page?: number;
  pageSize?: number;
}

export interface DefaultPaginationFilter {
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface NftsFilter {
  nftCreator?: string;
  accountId?: string;
  tokenId?: string;
  serialNumber?: number;
  searchQuery?: string;
}