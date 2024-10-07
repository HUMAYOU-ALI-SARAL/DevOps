import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, JoinColumn } from 'typeorm';
import { UserLink } from '@/entities/user-link.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  first_name?: string | null;

  @Column({ nullable: true })
  last_name?: string | null;

  @Column({ nullable: true })
  bio?: string | null;

  @Column({ nullable: true })
  otp?: string | null;

  @Column()
  password: string;

  @Column({ nullable: true, unique: true })
  username?: string | null;

  @Column({ default: false })
  verified?: boolean;

  @Column({ nullable: true })
  account_id?: string | null;

  @Column({ nullable: true })
  evm_address?: string | null;

  @Column({ nullable: true })
  bg_img_url?: string | null;

  @Column({ nullable: true })
  profile_img_url?: string | null;

  @OneToMany(() => UserLink, userLink => userLink.user, { cascade: true })
  links?: UserLink[]

  @CreateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP(6)" })
  created_at?: Date;

  @UpdateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
  updated_at?: Date;
}