import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, JoinColumn, ManyToOne } from 'typeorm';
import {NftMetadata} from '@/entities/nft-metadata.entity';

@Entity()
export class NftAttribute {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  trait_type: string;

  @Column()
  value: string;

  @ManyToOne(() => NftMetadata, (nftMetadata) => nftMetadata.attributes)
  nftMetadata?: NftMetadata;

  @CreateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP(6)" })
  created_at?: Date;

  @UpdateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
  updated_at?: Date;
}