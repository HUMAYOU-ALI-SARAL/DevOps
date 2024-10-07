import { BlockchainDataService } from '@/common/modules/blockchain-data/blockchain-data.service';
import { BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException, HttpException, OnModuleInit } from '@nestjs/common';
import { NftsDTO, GetNFTsDTO, NftCollectionsDTO, GetTransactionsDTO, TransactionsDTO, GetAccountEvmDTO, AccountEvmDTO, NftMarketItemInfoDTO, GetNftMarketItemInfoDTO, GetNftMarketBidsDTO, NftMarketBidsDTO, GetNftMarketBidDTO, NftMarketBidDTO, GetNftAllowanceDTO, NftAllowanceDTO, GetTokenAssociationDTO, TokenAssociationDTO, GetNftMarketAccountBidsDTO, PostNftMarketItemsDTO, PostNftMarketDealDTO, GetNftMarketPriceHistoryDTO, NftMarketPriceHistoryDTO, NftMarketPriceHistoryChunk, GetNftActivitiesDTO, NftActivitiesDTO } from '@/dtos/blockchain.dto';
import { DBService } from '@/common/modules/db/db.service';
import { NftMarketDeal as NftMarketDealEntity } from '@/entities/nft-market-deal.entity';
import { TokenId } from '@hashgraph/sdk';
import { Web3Service } from '@/common/modules/web3/web3.service';
import { REQUEST } from '@nestjs/core';
import { User } from '@/entities/user.entity';
import { Between } from 'typeorm';
import { NodeCacheService } from '@/common/modules/node-cache/node-cache.service';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { MarketTimersJob } from '@/queue-consumers/market-timers/market-timers.types';
import { MirrorNodeDelayJob } from '@/queue-consumers/mirror-node-delay/mirror-node-delay.types';


@Injectable()
export class BlockchainService {
  constructor(
    private readonly blockchainDataService: BlockchainDataService,
    private readonly web3Service: Web3Service,
    private readonly dbService: DBService,
    private readonly nodeCacheService: NodeCacheService,
    @Inject(REQUEST) private readonly request: Request & {user: User},
    @InjectQueue(`${process.env.REDIS_QUEUES_PREFIX}-market-timers`) private marketTimersQueue: Queue<MarketTimersJob>,
    @InjectQueue(`${process.env.REDIS_QUEUES_PREFIX}-mirror-node-delay`) private mirrorNodeDelayQueue: Queue<MirrorNodeDelayJob>,
  ) {}

  async getAccountBalance(accountId: string) {
    try {
      return await this.blockchainDataService.getAccountBalance(accountId);
    } catch (error) {
      console.error('Error during getAccountBalance:', error);
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async getNFTs(getNFTsDTO: GetNFTsDTO) {
    try {
      const {
        isLastPage,
        nfts,
        error: nftsError
      } = await this.blockchainDataService.getNFTs(getNFTsDTO);

      if (nftsError) {
        return nftsError;
      }

      return new NftsDTO(nfts, isLastPage); 
    } catch (error) {
      console.error('Error during getNFTs:', error);
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async getNftCollections(getNFTsDTO: GetNFTsDTO) {
    try {
      const {
        isLastPage,
        collections,
        error: collectionsError
      } = await this.blockchainDataService.getNftCollections(getNFTsDTO);

      if (collectionsError) {
        return collectionsError;
      }

      return new NftCollectionsDTO(collections, isLastPage); 
    } catch (error) {
      console.error('Error during getNftCollections:', error);
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async getNftActivities(getNftActivitiesDTO: GetNftActivitiesDTO) {
    try {
      const nftActivities = await this.blockchainDataService.getNftActivities(getNftActivitiesDTO);

      return nftActivities;
    } catch (error) {
      console.error('Error during getNftActivities:', error);
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async getTransactions(getTransactionsDTO: GetTransactionsDTO) {
    try {
      const {
        isLastPage,
        transactions,
        error,
      } = await this.blockchainDataService.getTransactions(getTransactionsDTO);

      if (error) {
        return error;
      }

      return new TransactionsDTO(transactions, isLastPage);
    } catch (error) {
      console.error('Error during getTransactions:', error);
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async getAccountEVM(getAccountEvmDTO: GetAccountEvmDTO) {
    try {
      const {
        evmAddress,
        error
      } = await this.blockchainDataService.getAccountEVM(getAccountEvmDTO);

      if (error) {
        return error;
      }

      return new AccountEvmDTO(evmAddress); 
    } catch (error) {
      console.error('Error during getAccountEVM:', error);
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async getNftMarketBids(getNftMarketBidsDto: GetNftMarketBidsDTO) {
    try {
      const {
        bids,
        error
      } = await this.blockchainDataService.getNftMarketBids(getNftMarketBidsDto);

      if (error) {
        return error;
      }

      return new NftMarketBidsDTO(bids); 
    } catch (error) {
      console.error('Error during getNftMarketBids:', error);
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async queueNftMarketDeal(postNftMarketDealDto: PostNftMarketDealDTO) {
    const user = this.request.user;
    const acceptBidTimeout = this.nodeCacheService.checkAcceptBidTimeout(user.id);

    if (acceptBidTimeout) {
      return new HttpException(`Too many. Try again later.`, 429);
    }

    await this.mirrorNodeDelayQueue.add({
      type: 'saveNftMarketDeal',
      params: postNftMarketDealDto,
    }, {
      attempts: 4,
      delay: 5000,
      backoff: {
        type: 'fixed',
        delay: 5000,
      },
      timeout: 15000,
    });

    this.nodeCacheService.setAcceptBidTimeout(user.id);

    return {message: 'Success'};
  }

  async saveNftMarketDeal({
    ownerId,
    buyerId,
    transactionId,
    price,
    tokenId,
    serialNumber,
  }: PostNftMarketDealDTO) {
    try {
      const {
        evmAddress: buyerEvmAddress,
        error: buyerEvmAddressError,
      } = await this.blockchainDataService.getAccountEVM({accountId: buyerId});
      if (buyerEvmAddressError) {
        return buyerEvmAddressError;
      }

      const {
        evmAddress: ownerEvmAddress,
        error: ownerEvmAddressError,
      } = await this.blockchainDataService.getAccountEVM({accountId: ownerId});
      if (buyerEvmAddressError) {
        return ownerEvmAddressError;
      }

      const nft = await this.dbService.getNft({
        searchOptions: {
          token_id: tokenId,
          serial_number: String(serialNumber),
        }
      });
      if (!nft) {
        return new BadRequestException(`There is no nft '${tokenId}/${serialNumber}'.`);
      }

      const nftMarketDealWithSameTransactionId = await this.dbService.getNftMarketDeal({
        transactionId
      });

      if (nftMarketDealWithSameTransactionId) {
        return new BadRequestException(`Deal with transactionId '${transactionId}' was already saved.`);
      }

      const record = await this.blockchainDataService.getTransactionRecord(transactionId);
      if (record instanceof Error) {
        return new BadRequestException(`Can't get transaction record. Wrong transactionId: ${transactionId}.`);
      }

      const eventsPromises = record.logs.map(async log => {
        // decode the event data
        return await this.web3Service.decodeEvent('AcceptBid', log.data, log.topics.slice(1));
      });
      
      const events = await Promise.all(eventsPromises);
      const event: {
        token: string;
        serialNumber: bigint;
        owner: string;
        buyer: string;
        acceptedBidAmount: bigint;
      } = events.find(event => event !== null);

      if (!event) {
        return new BadRequestException(`Transaction '${transactionId}' is not a bid accept transaction.`);
      }

      const eventOwnerEvmAddress = (event.owner as string).toLowerCase();
      if (eventOwnerEvmAddress !== ownerEvmAddress.toLowerCase()) {
        return new BadRequestException(`Event Owner '${eventOwnerEvmAddress}' is NOT equal to your passed owner address '${ownerEvmAddress.toLowerCase()} (${ownerId})'`);
      }

      const eventBuyerEvmAddress = (event.buyer as string).toLowerCase()
      if (eventBuyerEvmAddress !== buyerEvmAddress.toLowerCase()) {
        return new BadRequestException(`Event Buyer '${eventBuyerEvmAddress}' is NOT equal to your passed buyer address '${buyerEvmAddress.toLowerCase()} (${buyerId})'`);
      }

      if (event.acceptedBidAmount !== BigInt(price)) {
        return new BadRequestException(`Event Accepted Bid Amount '${event.acceptedBidAmount}' is NOT equal to your passed price '${BigInt(price)}'`);
      }

      const eventTokenId = TokenId.fromSolidityAddress(event.token as string);
      if (eventTokenId.toString() !== tokenId) {
        return new BadRequestException(`Event TokenId '${eventTokenId.toString()}' is NOT equal to your passed tokenId '${tokenId}'`);
      }

      if (event.serialNumber !== BigInt(serialNumber)) {
        return new BadRequestException(`Event serialNumber '${event.serialNumber}' is NOT equal to your passed serialNumber '${BigInt(serialNumber)}'`);
      }

      const buyer = await this.dbService.getUserByAccountId(buyerId);
      const owner = await this.dbService.getUserByAccountId(ownerId);

      if (!buyer) {
        return new BadRequestException(`The User with id '${buyerId} isn't registered'`);
      }
      if (!owner) {
        return new BadRequestException(`The User with id '${ownerId} isn't registered'`);
      }

      const nftMarketDeal: NftMarketDealEntity = {
        buyer,
        owner,
        price: price.toString(),
        transactionId,
        consensusTimestamp: transactionId.split('@')?.[1]?.split('.')?.join(''),
        nft,
      };
      await this.dbService.saveNftMarketDeal(nftMarketDeal);
      
      nft.account_id = buyerId;
      this.dbService.updateNft(nft);

      return {message: 'Success'}; 
    } catch (error) {
      console.error('Error during saveNftMarketDeal:', error);
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  formatPriceHistory(deals: NftMarketDealEntity[]) {
    const priceHistory: NftMarketPriceHistoryChunk[] = [];
    let dailyPrices: { total: bigint; count: number } = { total: 0n, count: 0 };
  
    // Group deals by day
    const groupedDeals = deals.reduce((acc, deal) => {
      const dayKey = deal.created_at.toISOString().split('T')[0]; // Use ISO date string as key
      acc[dayKey] = acc[dayKey] || [];
      acc[dayKey].push(deal);
      return acc;
    }, {} as Record<string, NftMarketDealEntity[]>);
  
    // Calculate average price for each day
    for (const dayKey in groupedDeals) {
      const dealsForDay = groupedDeals[dayKey];
      
      for (const deal of dealsForDay) {
        dailyPrices.total += BigInt(deal.price);
        dailyPrices.count++;
      }
  
      const averageDayPrice = dailyPrices.count > 0 ? dailyPrices.total / BigInt(dailyPrices.count) : 0n;
      const dayTimestamp = new Date(dayKey);

      priceHistory.push({
        price: averageDayPrice,
        timestamp: dayTimestamp.getTime(),
      });
  
      // Reset dailyPrices for the next day
      dailyPrices = { total: 0n, count: 0 };
    }
  
    return priceHistory
      .sort((chunkA, chunkB) => chunkA.timestamp - chunkB.timestamp);
  }

  async getNftMarketPriceHistory({serialNumber, timestamp, tokenId}: GetNftMarketPriceHistoryDTO) {
    try {
      const targetDate = new Date(timestamp);
      const targetYear = targetDate.getUTCFullYear();
      const targetMonth = targetDate.getUTCMonth();
    
      const startMonthTimestamp = new Date(targetYear, targetMonth, 1);
      const endMonthTimestamp = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);

      const deals = await this.dbService.getNftMarketDeals({
        created_at: Between(startMonthTimestamp, endMonthTimestamp),
        nft: {
          token_id: tokenId,
          serial_number: String(serialNumber),
        },
      });

      const priceHistory = this.formatPriceHistory(deals);

      return new NftMarketPriceHistoryDTO(priceHistory); 
    } catch (error) {
      console.error('Error during getNftMarketAccountBids:', error);
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async getNftMarketAccountBids(getNftMarketAccountBidsDTO: GetNftMarketAccountBidsDTO) {
    try {
      const {
        bids,
        error
      } = await this.blockchainDataService.getNftMarketAccountBids(getNftMarketAccountBidsDTO);

      if (error) {
        return error;
      }

      return new NftMarketBidsDTO(bids); 
    } catch (error) {
      console.error('Error during getNftMarketAccountBids:', error);
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async getNftMarketBid(getNftMarketBidDto: GetNftMarketBidDTO) {
    try {
      const {
        bid,
        error
      } = await this.blockchainDataService.getNftMarketBid(getNftMarketBidDto);

      if (error) {
        return error;
      }

      return new NftMarketBidDTO(bid); 
    } catch (error) {
      console.error('Error during getNftMarketBid:', error);
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async getNftMarketItemInfo(getNftMarketItemInfoDto: GetNftMarketItemInfoDTO) {
    try {
      const {
        info,
        error
      } = await this.blockchainDataService.getNftMarketItemInfo(getNftMarketItemInfoDto);

      if (error) {
        return error;
      }

      const nft = await this.dbService.getNft({
        searchOptions: {
          token_id: getNftMarketItemInfoDto.tokenId,
          serial_number: String(getNftMarketItemInfoDto.serialNumber)
        },
        relations: {
          marketListing: true
        },
      });

      if (!nft) {
        return new NotFoundException('NFT not found.');
      }

      if (nft.marketListing) {
        const job = await this.marketTimersQueue.getJob(nft.marketListing.jobId);

        nft.marketListing.is_listed = info.isListed;
        nft.marketListing.desired_price = info.price.toString();

        if (job && !info.isListed) {
          await job.remove();
          nft.marketListing.jobId = null;
        }
      }

      await this.dbService.updateNft(nft);

      info.listingEndTimestamp = nft.marketListing?.listing_end_timestamp?.getTime();
      return new NftMarketItemInfoDTO(info); 
    } catch (error) {
      console.error('Error during getNftMarketItemInfo:', error);
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async listOrUnlistMarketNFT(postNftMarketItemsDto: PostNftMarketItemsDTO) {
    try {
      const {
        nfts,
        isListed,
        listingEndTimestamp
      } = postNftMarketItemsDto;

      const user = this.request.user;

      const currentTimestamp = Date.now();
      const delay = listingEndTimestamp - currentTimestamp;

      if (isListed && delay <= 0) {
        return new BadRequestException(`Wrong listingEndTimestamp.`);
      }

      const nftsWithJobIdPromises = nfts.map(async nft => {
        const dbNft = await this.dbService.getNft({
          searchOptions: {
            token_id: nft.token_id,
            serial_number: String(nft.serial_number),
          },
          relations: {
            marketListing: true,
          }
        });
        
        if (dbNft.account_id !== user.account_id) {
          throw new BadRequestException('You are not the owner of this NFT');
        }

        const isAlreadyListed = dbNft.marketListing?.is_listed ?? false;
  
        if (isAlreadyListed) {
          const job = await this.marketTimersQueue.getJob(dbNft.marketListing.jobId);

          if (job) {
            await job.remove();    
          }
        }

        if (isListed) {
          const newJob = await this.marketTimersQueue.add({
            type: 'unlistNFT',
            serialNumber: Number(nft.serial_number),
            tokenEvmAddress: TokenId.fromString(nft.token_id).toSolidityAddress(),
          }, {
            delay,
          });
          nft.listingTimerJobId = newJob.id.toString();
        } else {
          nft.listingTimerJobId = null;
        }
  
        return nft;
      })
      
      try {
        const nftsWithJobId = await Promise.all(nftsWithJobIdPromises);

        await this.blockchainDataService.saveNftToDb(new PostNftMarketItemsDTO({
          ...postNftMarketItemsDto,
          nfts: nftsWithJobId,
        }));
      } catch(err) {
        console.log(err);
        return err;
      }
    } catch (error) {
      console.error('Error during listMarketNFT:', error);
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async checkNftAllowance(getNftAllowanceDTO: GetNftAllowanceDTO) {
    try {
      const hasAllowance = await this.blockchainDataService.checkNftAllowance(getNftAllowanceDTO)

      return new NftAllowanceDTO(hasAllowance); 
    } catch (error) {
      console.error('Error during checkNftAllowance:', error);
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async checkTokenAssociation(getTokenAssociationDTO: GetTokenAssociationDTO) {
    try {
      const isAssociated = await this.blockchainDataService.chechTokenAssociation(getTokenAssociationDTO)

      return new TokenAssociationDTO(isAssociated); 
    } catch (error) {
      console.error('Error during checkTokenAssociation:', error);
      throw new InternalServerErrorException('Internal Server Error');
    }
  }
}
