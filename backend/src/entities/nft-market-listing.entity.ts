import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, JoinColumn, ManyToOne, OneToOne } from 'typeorm';

@Entity()
export class NftMarketListing {
  @PrimaryGeneratedColumn()
  id?: string;

  @Column({nullable: true})
  is_listed?: boolean | null;

  @Column({nullable: true})
  desired_price?: string | null;

  @Column({nullable: true})
  jobId?: string | null;

  @Column({type: "timestamptz"})
  listing_end_timestamp: Date;

  @CreateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP(6)" })
  created_at?: Date;

  @UpdateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
  updated_at?: Date;
}