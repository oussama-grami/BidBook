import { BidStatus } from './../../Enums/bidstatus.enum';
import { User } from 'src/auth/entities/user.entity';
import { Book } from 'src/books/entities/book.entity';
import { CommonEntity } from 'src/Common/Common.entity';
import { Entity, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { Conversation } from 'src/conversation/entities/conversation.entity';

@Entity()
export class Bid extends CommonEntity {
  @Column({ type: 'float' })
  amount: number;

  @Column({
    type: 'enum',
    enum: BidStatus,
    default: BidStatus.PENDING,
  })
  bidStatus: BidStatus;

  @ManyToOne(() => Book, (book) => book.bids, { onDelete: 'CASCADE' })
  @JoinColumn()
  book: Book;

  // Relation avec l'utilisateur qui a placé l'enchère
  @ManyToOne(() => User, (user) => user.bids, { onDelete: 'SET NULL' }) // Virgule ajoutée ici
  @JoinColumn()
  bidder: User;

  @OneToOne(() => Conversation)
  @JoinColumn()
  conversation : Conversation;
}
