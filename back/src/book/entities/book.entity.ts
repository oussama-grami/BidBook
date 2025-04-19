import { Entity, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Bid } from 'src/bid/entities/bid.entity';
import { User } from 'src/auth/entities/user.entity';

@Entity()
export class Book {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToMany(() => Bid, (bid) => bid.book, { cascade: true })
    bids: Bid[];

    @ManyToOne(() => User, (user) => user.books, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'ownerId' })
    owner: User;
}