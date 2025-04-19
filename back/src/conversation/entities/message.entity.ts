import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Conversation } from './conversation.entity';
import { CommonEntity } from 'src/Common/Common.entity';

@Entity()
export class Message extends CommonEntity{
  @Column('text')
  content: string;

  @CreateDateColumn()
  timestamp: Date;

  @ManyToOne(() => Conversation, conversation => conversation.messages)
  conversation: Conversation;

  @Column({ default: true })
  isFromBidder: boolean;

  @Column({ default: false })
  isRead: boolean;
}