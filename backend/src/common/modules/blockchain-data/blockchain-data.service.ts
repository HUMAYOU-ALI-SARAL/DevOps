/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import {
  AccountBalanceDTO,
  GetAccountEvmDTO,
  GetNFTsDTO,
  GetNftMarketItemInfoDTO,
  GetNftMarketBidsDTO,
  GetTransactionsDTO,
  GetNftMarketBidDTO,
  GetNftAllowanceDTO,
  GetTokenAssociationDTO,
  GetNftMarketAccountBidsDTO,
  PostNftMarketItemsDTO,
  GetNftActivitiesDTO,
} from '@/dtos/blockchain.dto';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  FormattedNft,
  FormattedNftCollection,
  FormattedNftMarketBid,
  FormattedTransaction,
  GraphqlTransaction,
  NftActivity,
  NftActivityEventTypes,
} from '@/common/modules/blockchain-data/blockchain-data.types';
import { NftCollection as DbNftCollection } from '@/entities/nft-collection.entity';
import { DBService } from '@/common/modules/db/db.service';
import { IpfsService } from '@/common/services/ipfs/ipfs.service';
import { GraphqlService } from '@/common/services/graphql/graphql.service';
import { AccountId, Hbar, HbarUnit, TokenId } from '@hashgraph/sdk';
import { MirrorNodeApiService } from '@/common/services/mirror-node-api/mirror-node-api.service';
import {
  GraphqlNftTransferHistory,
  Nft,
  NftCollection,
  TransactionType,
} from '@/common/services/graphql/graphql.types';
import { REQUEST } from '@nestjs/core';
import { User } from '@/entities/user.entity';
import { NftMarketBid } from '@/common/modules/web3/web3.types';
import { Nft as NftEntity } from '@/entities/nft.entity';
import { NftMetadata as NftMetadataEntity } from '@/entities/nft-metadata.entity';
import { FindOptionsWhere, ILike } from 'typeorm';
import { Web3Service } from '@/common/modules/web3/web3.service';
import { NftMarketDeal as NftMarketDealEntity } from '@/entities/nft-market-deal.entity';
import { NftMarketListing as NftMarketListingEntity } from '@/entities/nft-market-listing.entity';

@Injectable()
export class BlockchainDataService {
  private readonly trashCollectorContractId: string;
  private readonly validatedNftCollections: {
    token_id: string;
    creator: string;
  }[];

  constructor(
    private readonly dbService: DBService,
    private readonly ipfsService: IpfsService,
    private readonly graphqlService: GraphqlService,
    private readonly mirrorNodeApiService: MirrorNodeApiService,
    private readonly web3Service: Web3Service,
    @Inject(REQUEST) private readonly request: Request & { user: User },
  ) {
    this.trashCollectorContractId =
      process.env.NEXT_PUBLIC_TRASH_COLLECTOR_CONTRACT_ID!;
    this.validatedNftCollections =
      process.env.VALIDATED_NFT_COLLECTIONS?.split(',')?.map((collection) => {
        const [token_id, creator] = collection.split('/');

        return { token_id: token_id.trim(), creator: creator.trim() };
      }) ?? [];

    this.cacheNftCollection();
  }

  async cacheNftCollection() {
    const collections = await this.dbService.getNftCollections();

    if (
      !collections ||
      collections.length < this.validatedNftCollections.length
    ) {
      this.validatedNftCollections.forEach(async (collection) => {
        await this.dbService.saveNftCollection(collection);
      });
    }
  }

  convertHbarToUSD(
    hbarBalance: number,
    hbarPriceInUSD: number,
    precision: number = 2,
  ) {
    const result = hbarBalance * hbarPriceInUSD;
    return (
      Math.round(result * Math.pow(10, precision)) / Math.pow(10, precision)
    );
  }

  async getAccountBalance(accountId: string) {
    const { balance: tinybarBalance, error: balanceError } =
      await this.graphqlService.getAccountBalance(accountId);

    if (balanceError) {
      return balanceError;
    }

    const hbarBalance = Hbar.fromTinybars(tinybarBalance).to(HbarUnit.Hbar);

    const hbarPriceInUSD = await this.mirrorNodeApiService.getHbarPriceInUSD();

    const balanceInUSD = hbarBalance.multipliedBy(hbarPriceInUSD).toFixed(2);

    return new AccountBalanceDTO(hbarBalance.toString(), balanceInUSD);
  }

  async getTransactionRecord(transactionId: string) {
    return this.mirrorNodeApiService.getTranasctionRecord(transactionId);
  }

  private async formatNfts(nftTokens: Nft[]) {
    const requestUser = this.request.user;

    const promises = nftTokens.map(async (nft) => {
      const accountId = this.graphqlService.formatHederaIdFromNumber(
        nft.account_id,
      );
      const user = await this.dbService.getUserByAccountId(accountId);

      const owner = {
        accountId,
        firstName: user?.first_name ?? null,
        lastName: user?.last_name ?? null,
        id: user?.id ?? null,
        username: user?.username ?? null,
        evmAddress: user?.evm_address ?? null,
      };

      const royalty_fees =
        nft.token.custom_fee?.[nft.token.custom_fee.length - 1].royalty_fees;
      let feeCollectorAccountId: number | null = null;
      let royaltyFeeNumber: number | null = null;

      if (royalty_fees && royalty_fees.length) {
        const royaltyObject = royalty_fees[royalty_fees.length - 1];
        feeCollectorAccountId = royaltyObject.collector_account_id;
        royaltyFeeNumber = royaltyObject.numerator / royaltyObject.denominator;
      }

      const formattedNft: FormattedNft = {
        created_timestamp: this.formatTimestamp(nft.created_timestamp),
        token_id: this.graphqlService.formatHederaIdFromNumber(nft.token_id),
        serial_number: nft.serial_number ? BigInt(nft.serial_number) : null,
        youAreOwner: requestUser?.account_id === user?.account_id,
        owner,
        metadata: nft.metadata,
        token: {
          max_supply: nft.token.max_supply,
          name: nft.token.name,
          token_id: this.graphqlService.formatHederaIdFromNumber(
            nft.token.token_id,
          ),
          total_supply: nft.token.total_supply,
          created_timestamp: this.formatTimestamp(nft.token.created_timestamp),
          royalty_fee: royaltyFeeNumber,
          symbol: nft.token.symbol,
          royalty_fee_collector: this.graphqlService.formatHederaIdFromNumber(
            feeCollectorAccountId,
          ),
        },
      };

      if (typeof formattedNft.metadata === 'string') {
        formattedNft.metadata = await this.ipfsService.populateNftMetadata(
          formattedNft.metadata,
          true,
        );
      }

      return formattedNft;
    });

    return await Promise.all(promises);
  }

  private async formatDbNfts(dbNfts: NftEntity[]) {
    const requestUser = this.request.user;

    const promises = dbNfts.map(async (nft) => {
      const accountId = nft.account_id;
      const user = await this.dbService.getUserByAccountId(accountId);

      let owner;
      if (user) {
        owner = {
          accountId,
          firstName: user?.first_name,
          lastName: user?.last_name,
          id: user?.id,
          username: user?.username,
        };
      }

      const feeCollectorAccountId = nft.token?.royalty_fee_collector ?? null;
      const royaltyFeeNumber = nft.token?.royalty_fee ?? null;

      const formattedNft: FormattedNft = {
        created_timestamp: nft.created_timestamp?.getTime() ?? null,
        token_id: nft.token_id,
        serial_number: nft.serial_number ? BigInt(nft.serial_number) : null,
        youAreOwner: requestUser?.account_id === user?.account_id,
        owner,
        metadata: nft.metadata,
        token: {
          max_supply: parseInt(nft.token?.max_supply),
          name: nft.token?.name,
          token_id: nft.token?.token_id,
          total_supply: parseInt(nft.token?.total_supply),
          created_timestamp: nft.token?.created_timestamp?.getTime() ?? null,
          royalty_fee: Number(royaltyFeeNumber),
          symbol: nft.token?.symbol,
          royalty_fee_collector: feeCollectorAccountId,
        },
        price: nft?.marketListing?.is_listed
          ? BigInt(nft?.marketListing?.desired_price ?? 0)
          : null,
      };

      return formattedNft;
    });

    return await Promise.all(promises);
  }

  private async formatNftCollection(nftCollections: NftCollection[]) {
    const formattedCollections = nftCollections.map((collection) => {
      const royalty_fees =collection.custom_fee?.[collection.custom_fee.length - 1].royalty_fees;
      let feeCollectorAccountId: number | null = null;
      let royaltyFeeNumber: number | null = null;

      if (royalty_fees && royalty_fees.length) {
        const royaltyObject = royalty_fees[royalty_fees.length - 1];
        feeCollectorAccountId = royaltyObject.collector_account_id;
        royaltyFeeNumber = royaltyObject.numerator / royaltyObject.denominator;
      }

      const formattedCollection: FormattedNftCollection & { entity?: any } = {
        max_supply: collection.max_supply,
        name: collection.name,
        total_supply: collection.total_supply,
        created_timestamp: this.formatTimestamp(collection.created_timestamp),
        symbol: collection.symbol,
        token_id: this.graphqlService.formatHederaIdFromNumber(
          collection.token_id,
        ),
        metadata: collection?.entity?.memo,
        royalty_fee_collector: this.graphqlService.formatHederaIdFromNumber(
          feeCollectorAccountId,
        ),
        royalty_fee: royaltyFeeNumber,
      };

      delete formattedCollection.entity;

      return formattedCollection as FormattedNftCollection;
    });

    const promises = formattedCollections.map(async (collection) => {
      try {
        if (typeof collection.metadata === 'string') {
          collection.metadata = await this.ipfsService.populateNftMetadata(
            collection.metadata,
          );
        }
        return collection;
      } catch (err) {
        console.log(err.message);
        return collection;
      }
    });

    return await Promise.all(promises);
  }

  formatTimestamp(timestampInNanosec: string) {
    if (!timestampInNanosec) return 0;

    const timestamp = Math.round(
      parseInt(timestampInNanosec.slice(0, -5)) / 10,
    );
    return timestamp;
  }

  formatTransactions(
    graphqlTransactions: GraphqlTransaction[],
    accountId: string,
  ) {
    const formattedTransactions: FormattedTransaction[] =
      graphqlTransactions.map((tx) => {
        const lastTransfer =
          tx.transaction.transfers[tx.transaction.transfers.length - 1];
        let transactionType: TransactionType = TransactionType.TRANSFERRED_HBAR;

        if (
          this.graphqlService.formatHederaIdFromNumber(
            lastTransfer.receiver_account_id,
          ) === accountId
        ) {
          if (lastTransfer.nft === null) {
            transactionType = TransactionType.RECEIVED_HBAR;
          } else {
            transactionType = TransactionType.RECEIVED_NFT;
          }
        } else {
          if (lastTransfer.nft === null) {
            transactionType = TransactionType.TRANSFERRED_HBAR;
          } else {
            transactionType = TransactionType.TRANSFERRED_NFT;
          }
        }

        return {
          amount: tx.amount,
          transaction: {
            charged_tx_fee: tx.transaction.charged_tx_fee,
            id: tx.transaction.id,
            type: transactionType,
            payer_account_id: this.graphqlService.formatHederaIdFromNumber(
              tx.transaction.payer_account_id,
            ),
            result: tx.transaction.result,
            transfers: tx.transaction.transfers,
            consensus_timestamp: this.formatTimestamp(
              tx.transaction.consensus_timestamp,
            ),
          },
        };
      });

    return formattedTransactions;
  }

  private async formatNftMarketBids(
    nftMarketBids: NftMarketBid[],
  ): Promise<FormattedNftMarketBid[]> {
    const hbarPriceInUSD = await this.mirrorNodeApiService.getHbarPriceInUSD();

    const formattedBidsPromises = nftMarketBids.map(async (bid: any) => {
      const user = await this.dbService.getUserByEvmAddress(
        bid.owner.toLowerCase(),
      );
      const hbarBidAmount = Hbar.fromTinybars(bid.amount)
        .toBigNumber()
        .toNumber();
      const amountInUsd = this.convertHbarToUSD(hbarBidAmount, hbarPriceInUSD);

      const { nfts } = await this.dbService.getNfts({
        pageSize: 1,
        searchOptions: {
          token_id: TokenId.fromSolidityAddress(bid.token).toString(),
          serial_number: bid.serialNumber.toString(),
        },
      });

      const formattedNfts = await this.formatDbNfts(nfts);

      const formattedBid: FormattedNftMarketBid = {
        amount: bid.amount,
        amountInUsd,
        ownerEvmAddress: bid.owner.toLowerCase(),
        tokenId: bid.token,
        serialNumber: bid.serialNumber,
        ownerAccountId: user?.account_id || null,
        username: user?.username || null,
        active: bid.amount !== BigInt(0),
        nft: formattedNfts?.[0],
      };

      return formattedBid;
    });

    return await Promise.all(formattedBidsPromises);
  }

  private buildValidTokenIds(validCollections: DbNftCollection[]) {
    return validCollections.map((collection) =>
      this.graphqlService.formatHederaIdForQuery(collection.token_id),
    );
  }

  async getNFTs({
    nftCreator,
    accountId,
    tokenId,
    serialNumber,
    searchQuery,
    isMarketListed,
    page,
    pageSize,
    orderBy,
    orderDirection,
  }: GetNFTsDTO) {
    if (searchQuery) {
      const groupRegex = /^([\d.]+)(?:\/(\d+))?$/;
      const [_, searchTokenId, searchSerialNumber] = searchQuery.match(
        groupRegex,
      ) ?? [null, null, null];
      const where: FindOptionsWhere<NftEntity>[] = [];

      const addSearchChunk = (whereChunk: FindOptionsWhere<NftEntity>) => {
        if (accountId) whereChunk.account_id = accountId;
        if (tokenId) whereChunk.token_id = tokenId;
        if (isMarketListed) whereChunk.marketListing = { is_listed: true };
        if (nftCreator) whereChunk.token = { creator: nftCreator };
        where.push(whereChunk);
      };

      addSearchChunk({ token: { name: ILike(`%${searchQuery}%`) } });

      if (searchTokenId && searchSerialNumber) {
        addSearchChunk({
          token_id: searchTokenId,
          serial_number: searchSerialNumber,
        });
      } else if (searchTokenId) {
        addSearchChunk({
          token_id: searchTokenId,
        });
      } else if (searchTokenId) {
        addSearchChunk({
          serial_number: searchSerialNumber,
        });
      }

      const { nfts: dbNfts, isLastPage } = await this.dbService.getNfts({
        page,
        pageSize,
        searchOptions: where,
      });
      const formattedNfts = await this.formatDbNfts(dbNfts);

      return {
        nfts: formattedNfts,
        isLastPage,
        error: !formattedNfts ? new NotFoundException(`Not Found`) : null,
      };
    }

    if (isMarketListed) {
      const searchOptions: FindOptionsWhere<NftEntity> = {
        marketListing: {
          is_listed: true,
        },
        account_id: accountId,
      };

      if (tokenId) {
        searchOptions.token_id = tokenId;
      }
      if (serialNumber) {
        searchOptions.serial_number = String(serialNumber);
      }

      const { nfts: dbNfts, isLastPage } = await this.dbService.getNfts({
        page,
        pageSize,
        searchOptions,
        order: {
          updated_at: orderDirection,
        },
      });
      const formattedNfts = await this.formatDbNfts(dbNfts);

      return {
        nfts: formattedNfts,
        isLastPage,
        error: !formattedNfts ? new NotFoundException(`Not Found`) : null,
      };
    }

    const tokenIds = this.validatedNftCollections
      .filter((collection) => !nftCreator || collection.creator === nftCreator)
      .map((collection) =>
        this.graphqlService.formatHederaIdForQuery(collection.token_id),
      );
    const trashCollectorContractId = this.graphqlService.formatHederaIdForQuery(
      this.trashCollectorContractId,
    );

    const filters: string[] = [];

    if (accountId !== null) {
      accountId = this.graphqlService.formatHederaIdForQuery(accountId);

      const accountIdFilter = `
        _and: [
          {account_id: {_eq: ${accountId}}},
          {account_id: {_neq: ${trashCollectorContractId}}},
        ],
      `;
      filters.push(accountIdFilter);
    } else {
      const accountIdFilter = `
        account_id: {_neq: ${trashCollectorContractId}},
      `;
      filters.push(accountIdFilter);
    }

    if (tokenId !== null) {
      const formattedTokenId =
        this.graphqlService.formatHederaIdForQuery(tokenId);

      if (!tokenIds.includes(formattedTokenId)) {
        return {
          error: new NotFoundException(
            `Invalid TokenId ${this.graphqlService.formatHederaIdFromNumber(Number(tokenId))}. TokenId is not validated.`,
          ),
        };
      }

      const tokenIdFilter = `token_id: {_eq: ${formattedTokenId}}`;
      filters.push(tokenIdFilter);
    }

    if (!tokenId) {
      const tokenIdsFilter = `
        _or: [
          ${tokenIds.map((tokenId) => `{token_id: {_eq: ${tokenId}}}`)}
        ],
      `;
      filters.push(tokenIdsFilter);
    }

    if (serialNumber !== null) {
      const serialNumberFilter = `serial_number: {_eq: ${serialNumber}}`;
      filters.push(serialNumberFilter);
    }

    const filterQuery = this.graphqlService.buildFilterQuery(...filters);

    let { nft } = await this.graphqlService.queryNfts({
      filterQuery,
      orderBy,
      orderDirection,
      pageSize,
      page,
    });

    if (!nft) {
      return {
        error: new NotFoundException(`Not Found`),
      };
    }

    const isLastPage = nft.length < pageSize + 1;

    if (nft.length > pageSize) {
      nft = nft.slice(0, -1);
    }

    const formattedNfts = await this.formatNfts(nft);
    const saveToDbResponse = this.saveNftToDb({
      nfts: formattedNfts,
    });

    if (saveToDbResponse instanceof Error) {
      return {
        error: saveToDbResponse,
      };
    }

    return {
      nfts: formattedNfts,
      isLastPage,
      error: !nft ? new NotFoundException(`Not Found`) : null,
    };
  }

  async cacheNftCollections(tokens: FormattedNftCollection[]) {
    const dbCollections = await this.dbService.getNftCollections();

    const cachePromises = dbCollections.map(async (dbToken) => {
      const token = tokens.find(
        (_token) => _token.token_id === dbToken.token_id,
      );

      if (!token) return;

      dbToken.created_timestamp = token.created_timestamp
        ? new Date(token.created_timestamp)
        : dbToken.created_timestamp;
      dbToken.max_supply = token.max_supply?.toString() ?? dbToken.max_supply;
      dbToken.name = token.name ?? dbToken.name;
      dbToken.royalty_fee = token.royalty_fee
        ? String(token.royalty_fee)
        : dbToken.royalty_fee;
      dbToken.total_supply =
        token.total_supply?.toString() ?? dbToken.total_supply;
      dbToken.symbol = token.symbol ?? dbToken.symbol;
      dbToken.royalty_fee_collector =
        token.royalty_fee_collector ?? dbToken.royalty_fee_collector;

      await this.dbService.saveNftCollection(dbToken);
    });

    await Promise.all(cachePromises);
  }

  async getNftCollections({
    nftCreator,
    accountId,
    tokenId,
    orderBy,
    orderDirection,
    page,
    pageSize,
  }: GetNFTsDTO) {
    const validCollections = await this.dbService.getNftCollections(nftCreator);

    const filters: string[] = [];
    const tokenIds = this.buildValidTokenIds(validCollections);

    if (accountId !== null) {
      accountId = this.graphqlService.formatHederaIdForQuery(accountId);

      const accountIdFilter = `nft: {account_id: {_eq: ${accountId}}},`;
      filters.push(accountIdFilter);
    }

    if (tokenId !== null) {
      tokenId = this.graphqlService.formatHederaIdForQuery(tokenId);

      const tokenIdFilter = `_or: [
        {nft: {token_id: {_eq: ${tokenId}}}}
      ],`;
      filters.push(tokenIdFilter);
    }

    if (tokenIds.length && !tokenId) {
      const tokenIdsFilter = `
        _or: [
          ${tokenIds.map((tokenId) => `{nft: {token_id: {_eq: ${tokenId}}}}`)}
        ],
      `;
      filters.push(tokenIdsFilter);
    }

    const filterQuery = this.graphqlService.buildFilterQuery(...filters);

    let { token: collections } = await this.graphqlService.queryNftCollections({
      filterQuery,
      orderBy,
      orderDirection,
      page,
      pageSize,
    });

    const isLastPage = collections.length < pageSize + 1;

    if (collections.length > pageSize) {
      collections = collections.slice(0, -1);
    }

    const formattedCollections = await this.formatNftCollection(collections);
    await this.cacheNftCollections(formattedCollections);

    return {
      collections: formattedCollections,
      isLastPage,
      error: !collections
        ? new NotFoundException(`Account Id ${accountId} Not Found`)
        : null,
    };
  }

  async formatTransferHistoryToActivities(
    transferHistory: GraphqlNftTransferHistory,
  ) {
    const activities: NftActivity[] = [];
    const { history } = transferHistory;

    if (history.length === 0) {
      return [];
    }

    let receiverAccountId = this.graphqlService.formatHederaIdFromNumber(
      transferHistory.account_id,
    );
    let senderAccountId = this.graphqlService.formatHederaIdFromNumber(
      history?.[0]?.account_id,
    );
    let receiver = await this.dbService.getUserByAccountId(receiverAccountId);
    let sender = await this.dbService.getUserByAccountId(senderAccountId);

    // last transfer
    activities.push({
      eventType: NftActivityEventTypes.TRANSFER,
      price: null,
      timestamp: this.formatTimestamp(history[0].end_timestamp),
      to: {
        accountId: receiverAccountId ?? null,
        username: receiver?.username ?? null,
      },
      from: {
        accountId: senderAccountId ?? null,
        username: sender?.username ?? null,
      },
    });

    transferHistory.history.forEach(async (transfer, index, history) => {
      if (index === history.length - 1) {
        receiverAccountId = this.graphqlService.formatHederaIdFromNumber(
          transfer.account_id,
        );
        receiver = await this.dbService.getUserByAccountId(receiverAccountId);

        activities.push({
          eventType: NftActivityEventTypes.MINT,
          price: null,
          timestamp: this.formatTimestamp(transfer.start_timestamp),
          to: {
            accountId: receiverAccountId ?? null,
            username: receiver?.username ?? null,
          },
          from: {
            accountId: null,
            username: null,
          },
        });

        return;
      }

      receiverAccountId = this.graphqlService.formatHederaIdFromNumber(
        transfer.account_id,
      );
      senderAccountId = this.graphqlService.formatHederaIdFromNumber(
        history[index + 1].account_id,
      );
      receiver = await this.dbService.getUserByAccountId(receiverAccountId);
      sender = await this.dbService.getUserByAccountId(senderAccountId);

      if (senderAccountId === receiverAccountId) {
        return;
      }

      activities.push({
        eventType: NftActivityEventTypes.TRANSFER,
        price: null,
        timestamp: this.formatTimestamp(transfer.start_timestamp),
        to: {
          accountId: receiverAccountId ?? null,
          username: receiver?.username ?? null,
        },
        from: {
          accountId: senderAccountId ?? null,
          username: sender?.username ?? null,
        },
      });
    });

    return activities;
  }

  async formatNftMarketDealsToActivities(nftDeals: NftMarketDealEntity[]) {
    const activities: NftActivity[] = nftDeals.map((deal) => {
      return {
        eventType: NftActivityEventTypes.SALE,
        from: {
          accountId: deal?.owner?.account_id ?? null,
          username: deal?.owner?.username ?? null,
        },
        to: {
          accountId: deal?.buyer?.account_id ?? null,
          username: deal?.buyer?.username ?? null,
        },
        price: deal?.price ? BigInt(deal.price) : null,
        timestamp: deal.created_at.getTime() ?? null,
      };
    });

    return activities;
  }

  async getNftTransferActivities(getNftActivitiesDto: GetNftActivitiesDTO) {
    const { nft_history } =
      await this.graphqlService.queryNftTransferHistory(getNftActivitiesDto);

    const historyChunk = nft_history?.[0];
    if (!historyChunk || !historyChunk.history) {
      return [];
    }

    return this.formatTransferHistoryToActivities(historyChunk);
  }

  async getNftActivities(getNftActivitiesDto: GetNftActivitiesDTO) {
    // const transferActivities = await this.getNftTransferActivities(getNftActivitiesDto);
    const transferActivities = [];

    if (transferActivities instanceof Error) {
      return transferActivities;
    }

    const { nfts } = await this.dbService.getNfts({
      pageSize: 10,
      page: 1,
      searchOptions: {
        token_id: getNftActivitiesDto.tokenId,
        serial_number: String(getNftActivitiesDto.serialNumber),
      },
      relations: {
        marketDeals: {
          buyer: true,
          owner: true,
        },
      },
    });

    const nft = nfts?.[0];

    if (!nft) {
      return new NotFoundException('NFT not found');
    }

    const marketActivities = await this.formatNftMarketDealsToActivities(
      nft.marketDeals,
    );
    let activities = transferActivities
      .concat(marketActivities)
      .sort((a, b) => b.timestamp - a.timestamp);

    if (activities.length > 10) {
      activities = activities.slice(0, 10);
    }

    return activities;
  }

  async getTransactions(getTransactionsDTO: GetTransactionsDTO) {
    const response =
      await this.graphqlService.queryTransactions(getTransactionsDTO);
    const transactions = response?.account?.transactions;
    let formattedTransactions = this.formatTransactions(
      transactions,
      getTransactionsDTO.accountId,
    );

    const isLastPage =
      formattedTransactions.length <= getTransactionsDTO.pageSize;

    if (!isLastPage) {
      formattedTransactions = formattedTransactions.slice(0, -1);
    }

    return {
      isLastPage,
      transactions: formattedTransactions,
      error: !formattedTransactions
        ? new NotFoundException('Can`t get a valid response from GraphQL')
        : null,
    };
  }

  async getAccountEVM({ accountId }: GetAccountEvmDTO) {
    let evmAddress: string;
    const user = await this.dbService.getUserByAccountId(accountId);
    evmAddress = user?.evm_address;

    if (!evmAddress) {
      const queryResponse =
        await this.graphqlService.queryAccountEvm(accountId);
      evmAddress = queryResponse?.account?.evm_address?.replace('\\', '0');
    }

    if (!evmAddress) {
      evmAddress = `0x${AccountId.fromString(accountId)?.toSolidityAddress()}`;
    }

    return {
      evmAddress: evmAddress.toLowerCase(),
      error: !evmAddress
        ? new NotFoundException(`Account Id '${accountId}' not found`)
        : null,
    };
  }

  async getNftMarketBids(getNftMarketBidsDto: GetNftMarketBidsDTO) {
    const bids = await this.web3Service.getNftMarketBids(getNftMarketBidsDto);
    const formattedBids = await this.formatNftMarketBids(bids);

    return {
      bids: formattedBids,
      error: !bids
        ? new NotFoundException(
            `Bids for ${getNftMarketBidsDto.tokenId}/${getNftMarketBidsDto.serialNumber} not found`,
          )
        : null,
    };
  }

  async getNftMarketAccountBids({
    accountId,
    page,
    pageSize,
    type,
  }: GetNftMarketAccountBidsDTO) {
    const user = await this.dbService.getUserByAccountId(accountId);

    if (!user) {
      return {
        bids: null,
        error: new NotFoundException(
          `User with accountId '${accountId} not found'`,
        ),
      };
    }

    let bids: NftMarketBid[];

    if (type === 'received') {
      bids = await this.web3Service.getNftMarketReceivedBids(
        user.evm_address,
        page,
        pageSize,
      );
    } else if (type === 'sent') {
      bids = await this.web3Service.getNftMarketSentBids(
        user.evm_address,
        page,
        pageSize,
      );
    }

    const formattedBids = await this.formatNftMarketBids(bids);

    return {
      bids: formattedBids,
      error: !bids
        ? new NotFoundException(`${type} bids for '${accountId}' not found`)
        : null,
    };
  }

  async getNftMarketBid({
    tokenId,
    serialNumber,
    accountId,
  }: GetNftMarketBidDTO) {
    const { evmAddress, error: evmAddressError } = await this.getAccountEVM(
      new GetAccountEvmDTO(accountId),
    );

    if (evmAddressError) {
      return {
        bid: null,
        error: evmAddress,
      };
    }

    const bid = await this.web3Service.getNftMarketBid(
      tokenId,
      serialNumber,
      evmAddress,
    );
    const formattedBid = (await this.formatNftMarketBids([bid]))?.[0];

    return {
      bid: formattedBid,
      error: !bid
        ? new NotFoundException(
            `Bid from accountId '${accountId}' for '${tokenId}/${serialNumber}' not found`,
          )
        : null,
    };
  }

  async getNftMarketItemInfo(getNftMarketItemInfoDto: GetNftMarketItemInfoDTO) {
    const nftInfo = await this.web3Service.getNftMarketContractItemInfo(
      getNftMarketItemInfoDto,
    );
    const { nfts } = await this.getNFTs(
      new GetNFTsDTO({
        tokenId: getNftMarketItemInfoDto.tokenId,
        serialNumber: getNftMarketItemInfoDto.serialNumber,
      }),
    );

    const nft = nfts?.[0];

    if (nft?.owner?.evmAddress && nft?.owner?.evmAddress !== nftInfo.owner) {
      nftInfo.owner = nft.owner.evmAddress;
      nftInfo.serialNumber = BigInt(getNftMarketItemInfoDto.serialNumber);
      nftInfo.token = TokenId.fromString(
        getNftMarketItemInfoDto.tokenId,
      ).toSolidityAddress();
      nftInfo.isListed = false;
    }

    return {
      info: nftInfo,
      error: !nftInfo ? new NotFoundException('Nft info not found.') : null,
    };
  }

  async saveNftToDb({
    isListed,
    nfts,
    price,
    listingEndTimestamp,
  }: PostNftMarketItemsDTO) {
    const dbFormattedNftsPromises = nfts.map(async (nft) => {
      const dbNftMetadata: NftMetadataEntity =
        typeof nft.metadata === 'object'
          ? {
              attributes: nft.metadata.attributes.map((attribute) => ({
                trait_type: attribute.trait_type,
                value: attribute.value,
              })),
              description: nft.metadata.description,
              image: nft.metadata.image,
              name: nft.metadata.name,
              type: nft.metadata.type,
            }
          : null;

      let token = await this.dbService.getNftCollectionById(nft.token_id);
      if (!token) {
        const validatedToken = this.validatedNftCollections.find(
          (collection) => collection.token_id === nft.token_id,
        );
        if (!validatedToken) {
          return new NotFoundException(
            `Token with id '${nft.token_id}' not found!`,
          );
        }

        token = {
          creator: validatedToken.creator,
          token_id: validatedToken.token_id,
        };
      }

      // TODO: remove it later maybe
      token.created_timestamp = nft?.token?.created_timestamp
        ? new Date(nft.token.created_timestamp)
        : token.created_timestamp;
      token.max_supply = nft.token?.max_supply?.toString() ?? token.max_supply;
      token.name = nft.token?.name ?? token.name;
      token.royalty_fee = nft.token?.royalty_fee
        ? String(nft.token?.royalty_fee)
        : token.royalty_fee;
      token.total_supply =
        nft.token?.total_supply?.toString() ?? token.total_supply;
      token.symbol = nft.token?.symbol ?? token.symbol;
      token.royalty_fee_collector =
        nft.token?.royalty_fee_collector ?? token.royalty_fee_collector;
      await this.dbService.saveNftCollection(token);

      const marketListing: NftMarketListingEntity = {
        desired_price: price ? String(price) : null,
        is_listed: isListed ?? false,
        listing_end_timestamp: listingEndTimestamp
          ? new Date(listingEndTimestamp)
          : new Date(0),
        jobId: nft.listingTimerJobId ?? null,
      };

      const dbFormattedNft: NftEntity = {
        account_id: nft.owner.accountId,
        created_timestamp: new Date(nft.created_timestamp),
        serial_number: nft.serial_number.toString(),
        token_id: nft.token_id,
        marketListing: marketListing,
        token,
        metadata: dbNftMetadata,
      };

      await this.dbService.saveNft(dbFormattedNft);
    });

    await Promise.all(dbFormattedNftsPromises);
  }

  async checkNftAllowance(getNftAllowanceDTO: GetNftAllowanceDTO) {
    return await this.mirrorNodeApiService.chechNftAllowance(
      getNftAllowanceDTO,
    );
  }

  async chechTokenAssociation(getTokenAssociationDTO: GetTokenAssociationDTO) {
    return await this.mirrorNodeApiService.chechTokenAssociation(
      getTokenAssociationDTO,
    );
  }
}
