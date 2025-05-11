import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateStripeDto } from './dto/create-stripe.dto';
import { UpdateStripeDto } from './dto/update-stripe.dto';
import Stripe from 'stripe';
import { TransactionDetailsDto } from './dto/transaction-details.dto';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import {Bid} from "../bids/entities/bid.entity";
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../Enums/notification-type.enum';
import { Conversation } from '../conversation/entities/conversation.entity'; // Import Conversation entity


@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
      @InjectRepository(Transaction)
      private transactionRepository: Repository<Transaction>,
      @InjectRepository(Bid)
      private bidRepository: Repository<Bid>,
      private readonly notificationsService: NotificationsService,
      @InjectRepository(Conversation)
      private conversationRepository: Repository<Conversation>,

  ) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
    }
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-04-30.basil',
    });
  }

  async createPaymentIntent(amount: number, currency: string) {
    return await this.stripe.paymentIntents.create({
      amount,
      currency,
    });
  }

  async createTransactionForBid(bidId: number): Promise<number> {
    const bid = await this.bidRepository.findOne({
      where: { id: bidId },
      relations: ['book'],
    });

    if (!bid) {
      throw new NotFoundException(`Bid with ID ${bidId} not found`);
    }
    const transaction = this.transactionRepository.create({
      bid: bid,
      amount: bid.amount,
      status: 'pending',
    });
    const savedTransaction = await this.transactionRepository.save(transaction);
    return savedTransaction.id;
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
      relations: ['bid', 'bid.book', 'bid.bidder', 'bid.book.owner'], // Updated relations to match your schema
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    transaction.status = status;
    if (status === 'succeeded') {
      transaction.completionDate = new Date();

      // Find and deactivate the conversation related to the bid
      const conversation = await this.conversationRepository.findOne({
        where: { bid: { id: transaction.bid.id } },
      });

      if (conversation) {
        conversation.isActive = false;
        await this.conversationRepository.save(conversation);
      } else {
        console.warn(`No conversation found for bid ID: ${transaction.bid.id}`);
      }

      // Notify bidder: Payment succeeded
      await this.notificationsService.notify({
        userId: transaction.bid.bidder.id,
        type: NotificationType.BOOK_SOLD, // Use PAYMENT_SUCCEEDED instead of BOOK_SOLD for bidder
        message: `Your payment for "${transaction.bid.book.title}" was successful!`,
        data: { transactionId, bookId: transaction.bid.book.id },
      });

      // Notify book owner: Book sold
      await this.notificationsService.notify({
        userId: transaction.bid.book.owner.id,
        type: NotificationType.BOOK_SOLD,
        message: `Your book "${transaction.bid.book.title}" has been sold!`,
        data: { transactionId, bookId: transaction.bid.book.id },
      });
    }

    return this.transactionRepository.save(transaction);
  }


  create(createStripeDto: CreateStripeDto) {
    return 'This action adds a new stripe';
  }

  async findAll(userId: number): Promise<{ transactions: any[] }> {
    const transactions = await this.transactionRepository.find({
      where: [
        {
          status: 'succeeded',
          bid: {
            bidder: {
              id: userId
            }
          }
        },
        {
          status: 'succeeded',
          bid: {
            book: {
              owner: {
                id: userId
              }
            }
          }
        }
      ],
      relations: ['bid', 'bid.book', 'bid.bidder', 'bid.book.owner']
    });

    if (!transactions || transactions.length === 0) {
      console.log("no transactions found for this user!");
    } else {
      console.log(transactions.length, "transactions found for this user!");
    }

    return {
      transactions: transactions.map(transaction => ({
        transaction: {
          id: transaction.id,
          buyerId: transaction.bid.bidder.id,
          amount: transaction.bid.amount,
          seller: transaction.bid.book.owner.firstName + ' ' + transaction.bid.book.owner.lastName,
          buyer: transaction.bid.bidder.firstName + ' ' + transaction.bid.bidder.lastName,
          completionDate: transaction.completionDate,
        }
      }))
    };
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