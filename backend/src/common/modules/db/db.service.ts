import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOptionsOrder, FindOptionsRelations, FindOptionsWhere, ILike, Repository } from 'typeorm';
import { User } from '@/entities/user.entity';
import { UserLink } from '@/entities/user-link.entity';
import { NftCollection } from '@/entities/nft-collection.entity';
import { Nft } from '@/entities/nft.entity';
import { NftMetadata } from '@/entities/nft-metadata.entity';
import { NftAttribute } from '@/entities/nft-attribute.entity';
import { NftMarketListing } from '@/entities/nft-market-listing.entity';
import { NftMarketDeal } from '@/entities/nft-market-deal.entity';

@Injectable()
export class DBService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserLink)
    private readonly userLinkRepository: Repository<UserLink>,
    @InjectRepository(NftCollection)
    private readonly nftCollectionRepository: Repository<NftCollection>,
    @InjectRepository(Nft)
    private readonly nftRepository: Repository<Nft>,
    @InjectRepository(NftMetadata)
    private readonly nftMetadataRepository: Repository<NftMetadata>,
    @InjectRepository(NftAttribute)
    private readonly nftAttributeRepository: Repository<NftAttribute>,
    @InjectRepository(NftMarketListing)
    private readonly nftMarketListingRepository: Repository<NftMarketListing>,
    @InjectRepository(NftMarketDeal)
    private readonly nftMarketDealRepository: Repository<NftMarketDeal>,
  ) {}

  async getUserByEmail(email: string): Promise<User | undefined> {
    return await this.userRepository.findOne({ where: { email }, relations: ['links'] });
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return await this.userRepository.findOne({ where: { username }, relations: ['links'] });
  }

  async getUserByAccountId(accountId: string): Promise<User | undefined> {
    return await this.userRepository.findOne({ where: { account_id: accountId }, relations: ['links'] });
  }

  async getUserById(id: number): Promise<User | undefined> {
    return await this.userRepository.findOne({ where: { id }, relations: ['links'] });
  }

  async getUserByEvmAddress(evmAddress: string): Promise<User | undefined> {
    return await this.userRepository.findOne({ where: { evm_address: evmAddress }, relations: ['links'] });
  }

  async createUser(userData: User): Promise<User> {
    const user = this.userRepository.create(userData);
    return await this.userRepository.save(user);
  }

  async updateUser(userData: User) {
    const userToUpdate = await this.userRepository.findOne({where: {id: userData.id}, relations: ['links']});

    if (!userToUpdate) {
      throw new NotFoundException('User not found');
    }

    await this.userLinkRepository.remove(userToUpdate.links);

    const {links, ...updatedUser} = userData;

    const newUserLinks = links.map(userLinkData => {
      return this.userLinkRepository.create({...userLinkData, user: userToUpdate});
    });
    await this.userLinkRepository.save(newUserLinks);

    await this.userRepository.update(userData.id, updatedUser);

    return {...updatedUser, links};
  }

  async getNftCollections(collectionCreator: string | null = null) {
    const searchOptions: FindManyOptions<NftCollection> = {};

    if (collectionCreator !== null) {
      searchOptions.where = {
        creator: collectionCreator.toLowerCase(),
      };
    }

    return await this.nftCollectionRepository.find(searchOptions)
  }

  async getNftCollectionById(token_id: string) {
    return await this.nftCollectionRepository.findOne({where: {token_id}})
  }

  async saveNftCollection(collection: NftCollection) {
    return await this.nftCollectionRepository.save(collection);
  }

  async saveNft(nft: Nft) {
    const existingNft  = await this.nftRepository.findOne({
      where: {
        token_id: nft.token_id,
        serial_number: nft.serial_number,
      },
      relations: {
        marketListing: true,
      }
    });

    if (existingNft) {
      existingNft.account_id = nft.account_id;

      if (nft?.marketListing?.desired_price !== null) {
        existingNft.marketListing = {
          ...existingNft.marketListing,
          ...nft.marketListing
        }
      }
      
      return await this.nftRepository.save(existingNft);
    } else {
      const newNft = this.nftRepository.create(nft);
      return await this.nftRepository.save(newNft);
    }
  }

  async updateNft(nft: Nft) {
    return await this.nftRepository.save(nft);
  }

  async getNfts({
    page = 1,
    pageSize= 10,
    searchOptions = {},
    order = {},
    relations = {
      marketListing: true,
      token: true,
      metadata: {
        attributes: true
      },
    },
  }: {
    page?: number,
    pageSize?: number,
    searchOptions?: FindOptionsWhere<Nft> | FindOptionsWhere<Nft>[],
    order?: FindOptionsOrder<Nft>,
    relations?: FindOptionsRelations<Nft>
  }) {
    const skip = (page - 1) * pageSize;

    let nfts = await this.nftRepository.find({
      relations,
      order,
      skip,
      take: (pageSize + 1),
      where: searchOptions,
    })
  
    const isLastPage = nfts.length <= pageSize;

    if (!isLastPage) {
      nfts = nfts.slice(0, -1);
    }
  
    return {
      nfts,
      isLastPage,
    };
  }

  async getNft({
    searchOptions = {},
    order = {},
    relations = {
      marketListing: true,
      token: true,
      metadata: {
        attributes: true
      },
    },
  }: {
    searchOptions?: FindOptionsWhere<Nft> | FindOptionsWhere<Nft>[],
    order?: FindOptionsOrder<Nft>,
    relations?: FindOptionsRelations<Nft>
  }) {
    return this.nftRepository.findOne({
      where: searchOptions,
      order,
      relations
    })
  }

  async saveNftMarketDeal(nftMarketDealData: NftMarketDeal) {
    const deal = this.nftMarketDealRepository.create(nftMarketDealData);
    return await this.nftMarketDealRepository.save(deal);
  }

  async getNftMarketDeals(
    searchOptions: FindOptionsWhere<NftMarketDeal> | FindOptionsWhere<NftMarketDeal>[],
    relations: FindOptionsRelations<NftMarketDeal> = {},
  ) {
    return this.nftMarketDealRepository.find({
      where: searchOptions,
      relations,
    });
  }

  async getNftMarketDeal(
    searchOptions: FindOptionsWhere<NftMarketDeal>,
  ) {
    return this.nftMarketDealRepository.findOne({
      where: searchOptions,
    });
  }
}