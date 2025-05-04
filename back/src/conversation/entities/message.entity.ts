import { Entity, Column, ManyToOne } from 'typeorm';
import { CommonEntity } from 'src/Common/Common.entity';
import { Conversation } from './conversation.entity';

@Entity()
export class Message extends CommonEntity {
  @Column()
  content: string;

  @Column()
  timestamp: Date;

  @Column({ default: false })
  isRead: boolean;

  @Column()
  direction: boolean;

  @ManyToOne(() => Conversation, conversation => conversation.messages, { onDelete: 'CASCADE' })
  conversation: Conversation;
}
