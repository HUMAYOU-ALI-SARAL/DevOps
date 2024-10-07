import { Module } from '@nestjs/common';
import { DBService } from '@/common/modules/db/db.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/entities/user.entity';
import { UserLink } from '@/entities/user-link.entity';
import { NftCollection } from '@/entities/nft-collection.entity';
import { NftAttribute } from '@/entities/nft-attribute.entity';
import { NftMetadata } from '@/entities/nft-metadata.entity';
import { Nft } from '@/entities/nft.entity';
import { NftMarketListing } from '@/entities/nft-market-listing.entity';
import { NftMarketDeal } from '@/entities/nft-market-deal.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserLink,
      NftCollection,
      Nft,
      NftAttribute,
      NftMetadata,
      NftMarketListing,
      NftMarketDeal
    ]),
  ],
  providers: [DBService],
  exports: [DBService],
})
export class DBModule {}
