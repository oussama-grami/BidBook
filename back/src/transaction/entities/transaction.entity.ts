import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { Bid } from 'src/bid/entities/bid.entity';

@Entity()
export class Transaction {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    currency: string;

    @Column()
    paid: boolean;

    @Column()
    paymentIntentId: string;

    @Column()
    receiptUrl: string;

    @Column()
    status: string;

    @CreateDateColumn()
    timestamp: Date;

    @OneToOne(() => Bid, (bid) => bid.transaction, { cascade: true })
    @JoinColumn()
    bid: Bid;
}