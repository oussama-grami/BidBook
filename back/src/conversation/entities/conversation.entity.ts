import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, CreateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { Message } from './message.entity';
import { Bid } from 'src/bid/entities/bid.entity'

@Entity()
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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
}