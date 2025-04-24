import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bid } from 'src/bids/entities/bid.entity';
import { Book } from 'src/books/entities/book.entity';
import { Notification } from 'src/notifications/entities/notification.entity';

@Injectable()
export class NotificationSchedulerService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,

    @InjectRepository(Bid)
    private readonly bidRepository: Repository<Bid>,

    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  @Cron('0 * * * *')  
  async handleCron() {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const books = await this.bookRepository.find();

    for (const book of books) {
      const bid = await this.bidRepository.findOne({
        where: { book: { id: book.id } },
        order: { createdAt: 'DESC' },
        relations: ['bidder'],
      });
     
      if (bid?.bidder && bid.createdAt > twentyFourHoursAgo) {
        const message = `Congratulations! You have won the auction for the book "${book.title}"`;

        await this.notificationRepository.manager.transaction(async transactionalEntityManager => {
          const notificationExists = await transactionalEntityManager.findOne(Notification, {
            where: {
              recipient: { id: bid.bidder.id },
              message: message,
              isSent: true,
            }
          });
          
          if (!notificationExists) {
            const notification = this.notificationRepository.create({
              recipient: { id: bid.bidder.id },
              message,
              isSent: true,
            });
            await transactionalEntityManager.save(Notification, notification);
            console.log('Hiba');
            console.log(`Notification sent to user ${bid.bidder.id} for the book "${book.title}"`);
          } else {
            console.log(`Notification already sent to user ${bid.bidder.id} for the book "${book.title}"`);
          }
        });
      }
    }
  }
}