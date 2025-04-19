import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, ManyToOne, JoinColumn } from 'typeorm';
import { Conversation } from 'src/conversation/entities/conversation.entity';
import { User } from 'src/auth/entities/user.entity';
import { Transaction } from 'src/transaction/entities/transaction.entity';
import { Book } from 'src/book/entities/book.entity';
import { BidStatus } from 'src/Enums/bidstatus.enum';
import { CommonEntity } from 'src/Common/Common.entity';

@Entity()
export class Bid extends CommonEntity {
    @Column({ type: 'float' })
    amount: number;

    @OneToOne(() => Conversation, (conversation) => conversation.bid)
    conversation: Conversation;

    @ManyToOne(() => User, (user) => user.bids, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' }) 
    bidder: User;

    @CreateDateColumn()
    timestamp: Date;

    @OneToOne(() => Transaction, (transaction) => transaction.bid)
    transaction: Transaction;

    @ManyToOne(() => Book, (book) => book.bids, { onDelete: 'CASCADE' })
    book: Book;

    @Column({
        type: 'enum',
        enum: BidStatus,
        default: BidStatus.PENDING,
    })
    bidStatus: BidStatus;
}