import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, CreateDateColumn, OneToOne, ManyToOne, JoinColumn } from 'typeorm';
import { Conversation } from 'src/conversation/entities/conversation.entity';
import { User } from 'src/auth/entities/user.entity'

@Entity()
export class Bid {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToOne(() => Conversation, (conversation) => conversation.bid)
    conversation: Conversation;

    @ManyToOne(() => User, (user) => user.bids)
    @JoinColumn({ name: 'user_id' }) 
    bidder: User;
}