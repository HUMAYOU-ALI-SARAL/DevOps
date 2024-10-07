import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { NftAttribute } from '@/entities/nft-attribute.entity';
import { Nft } from './nft.entity';

@Entity()
export class NftMetadata {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  name: string;

  @Column()
  image: string;

  @Column()
  type: string;

  @Column()
  description: string;

  @OneToMany(() => NftAttribute, (nftAttribute) => nftAttribute.nftMetadata, { cascade: true })
  attributes: NftAttribute[];

  @CreateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP(6)" })
  created_at?: Date;

  @UpdateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
  updated_at?: Date;
}