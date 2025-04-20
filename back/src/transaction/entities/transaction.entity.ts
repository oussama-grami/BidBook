import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { Bid } from 'src/bid/entities/bid.entity';
import { CommonEntity } from 'src/Common/Common.entity';

@Entity()
export class Transaction extends CommonEntity {
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

    @OneToOne(() => Bid)
    @JoinColumn()
    bid: Bid;
}