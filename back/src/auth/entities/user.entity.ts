import { CommonEntity } from '../../Common/Common.entity';
import { Column, Entity, OneToMany, ManyToMany } from 'typeorm';
import { Bid } from 'src/bid/entities/bid.entity';
import { Book } from 'src/book/entities/book.entity';
import { Conversation } from 'src/conversation/entities/conversation.entity';

@Entity('_user')
export class User extends CommonEntity {
  @Column()
  firstName: string;
  @Column()
  lastName: string;
  @Column()
  email: string;
  @Column()
  password: string;
  @Column()
  imageUrl: string;
  @Column()
  isMFAEnabled: boolean;
  @OneToMany(() => Bid, (bid) => bid.bidder)
  bids: Bid[];

  @OneToMany(() => Book, (book) => book.owner)
  books: Book[];

  @OneToMany(() => Conversation, (conversation) => conversation.bidder)
  bidderConversations: Conversation[];

  @OneToMany(() => Conversation, (conversation) => conversation.owner)
  ownerConversations: Conversation[];

}
