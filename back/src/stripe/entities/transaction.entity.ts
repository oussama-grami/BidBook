import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
  } from 'typeorm';
  import { Bid } from 'src/bids/entities/bid.entity';
import { CommonEntity } from 'src/Common/Common.entity';
  
@Entity()
export class Transaction extends CommonEntity {
  @Column({nullable : true})
  stripePaymentIntentId: string;

  @Column({nullable : true})
  amount: number;

  @Column({nullable : true})
  currency: string;

  @Column({ default: 'pending' })
  status: 'pending' | 'succeeded' | 'failed';

  @ManyToOne(() => Bid, (bid) => bid.transactions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  bid: Bid;

  @Column({ type: 'timestamp', nullable: true })
  completionDate: Date;
}