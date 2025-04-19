import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, CreateDateColumn, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { Message } from './message.entity';
import { Bid } from 'src/bid/entities/bid.entity'
import { User } from 'src/auth/entities/user.entity';
import { CommonEntity } from 'src/Common/Common.entity';

@Entity()
export class Conversation extends CommonEntity {

  @CreateDateColumn({ type: 'timestamp' })
  startDate: Date;
  @Column({ type: 'timestamp', nullable: true })
  endDate: Date | null;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[];

  @OneToOne(() => Bid, (bid) => bid.conversation) 
  @JoinColumn()
  bid: Bid;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'bidder_id' })
  bidder: User;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'owner_id' })
  owner: User;
  
}