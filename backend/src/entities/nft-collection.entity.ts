import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Nft } from '@/entities/nft.entity';

@Entity()
export class NftCollection {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  token_id: string;

  @Column({nullable: true})
  max_supply?: string;

  @Column({nullable: true})
  total_supply?: string;

  @Column({nullable: true})
  royalty_fee?: string;

  @Column({nullable: true})
  royalty_fee_collector?: string;

  @Column({nullable: true, type: 'timestamptz' })
  created_timestamp?: Date;

  @Column({nullable: true})
  symbol?: string;

  // sphera_world for example
  @Column({nullable: true})
  creator: string;

  @OneToMany(() => Nft, (nft) => nft.token)
  nfts?: string;
  
  @CreateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP(6)" })
  created_at?: Date;

  @UpdateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
  updated_at?: Date;
}