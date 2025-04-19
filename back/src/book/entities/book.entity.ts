import { Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Bid } from 'src/bid/entities/bid.entity';

@Entity()
export class Book {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToMany(() => Bid, (bid) => bid.book, { cascade: true })
    bids: Bid[];
}