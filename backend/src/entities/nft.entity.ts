import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { NftCollection } from '@/entities/nft-collection.entity';
import { NftMarketListing } from './nft-market-listing.entity';
import { NftMetadata } from './nft-metadata.entity';
import { NftMarketDeal } from './nft-market-deal.entity';

@Entity()
export class Nft {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'timestamptz', nullable: true })
  created_timestamp: Date;

  @Column({nullable: true})
  account_id?: string | null;

  @Column({nullable: true})
  token_id?: string | null;

  @Column({nullable: true})
  serial_number?: string | null;

  @OneToOne(() => NftMetadata, {cascade: true, onDelete: 'CASCADE'})
  @JoinColumn()
  metadata: NftMetadata;
  
  @OneToOne(() => NftMarketListing, {cascade: true, onDelete: 'CASCADE'})
  @JoinColumn()
  marketListing: NftMarketListing;

  @ManyToOne(() => NftCollection, (nftCollection) => nftCollection.nfts)
  token?: NftCollection;

  @OneToMany(() => NftMarketDeal, (nftMarketDeal) => nftMarketDeal.nft)
  marketDeals?: NftMarketDeal[];

  @CreateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP(6)" })
  created_at?: Date;

  @UpdateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
  updated_at?: Date;
}