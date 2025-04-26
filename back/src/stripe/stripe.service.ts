import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateStripeDto } from './dto/create-stripe.dto';
import { UpdateStripeDto } from './dto/update-stripe.dto';
import Stripe from 'stripe';
import { TransactionDetailsDto } from './dto/transaction-details.dto';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>
  ) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
    }
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-03-31.basil',
    });
  }

  async createPaymentIntent(amount: number, currency: string) {
    return await this.stripe.paymentIntents.create({
      amount,
      currency,
    });
  }

  async getTransactionDetails(transactionId: number): Promise<TransactionDetailsDto> {
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId },
      relations: ['bid', 'bid.book'],
    });
  
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }
  
    const book = transaction.bid.book;
  
    return {
      transaction: {
        id: transaction.id,
        amount: transaction.bid.amount,
        bookid: book.id,
        title: book.title,
        imageUrl: book.picture,
      }
      
    };
  }

  async updateTransactionStatus(
    transactionId: number,
    status: 'succeeded' | 'failed'
): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
        where: { id: transactionId },
        relations: ['bid', 'bid.book'],
    });

    if (!transaction) {
        throw new NotFoundException('Transaction not found');
    }

    transaction.status = status;
    return this.transactionRepository.save(transaction);
  }
  

  create(createStripeDto: CreateStripeDto) {
    return 'This action adds a new stripe';
  }  

  findAll() {
    return `This action returns all stripe`;
  }

  findOne(id: number) {
    return `This action returns a #${id} stripe`;
  }

  update(id: number, updateStripeDto: UpdateStripeDto) {
    return `This action updates a #${id} stripe`;
  }

  remove(id: number) {
    return `This action removes a #${id} stripe`;
  }
}
