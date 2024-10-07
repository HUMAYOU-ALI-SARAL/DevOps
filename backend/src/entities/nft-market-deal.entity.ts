import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { NftCollection } from '@/entities/nft-collection.entity';
import { NftMarketListing } from './nft-market-listing.entity';
import { NftMetadata } from './nft-metadata.entity';
import { Nft } from './nft.entity';
import { User } from './user.entity';

@Entity()
export class NftMarketDeal {
  @PrimaryGeneratedColumn()
  id?: number;

  @ManyToOne(() => User)
  @JoinColumn()
  owner?: User;

  @ManyToOne(() => User)
  @JoinColumn()
  buyer?: User;

  @Column()
  price?: string;

  @Column()
  transactionId?: string;

  @Column()
  consensusTimestamp?: string;

  @ManyToOne(() => Nft, (nft) => nft.marketDeals)
  nft?: Nft;

  @CreateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP(6)" })
  created_at?: Date;

  @UpdateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
  updated_at?: Date;
}