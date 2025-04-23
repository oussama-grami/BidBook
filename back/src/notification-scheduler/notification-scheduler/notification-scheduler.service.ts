import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
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

    const books = await this.bookRepository.find({
      where: {
        createdAt: Between(
          new Date(twentyFourHoursAgo.getTime() - 60 * 60 * 1000),
          twentyFourHoursAgo,
        ),
      },
    });

    for (const book of books) {
      const bid = await this.bidRepository.findOne({
        where: { book: { id: book.id } },
        relations: ['bidder'],
      });

      if (bid?.bidder) {
        const message = `Congratulations! You have won the auction for the book "${book.title}"`;

        const existingNotification = await this.notificationRepository.findOne({
          where: {
            recipient: bid.bidder,
            message,
            isSent: true,
          },
        });

        if (!existingNotification) {
          const notification = this.notificationRepository.create({
            recipient: bid.bidder,
            message,
            isSent: true,
          });

          await this.notificationRepository.save(notification);
          console.log(`Notification sent to user ${bid.bidder.id} for the book "${book.title}"`);
        } else {
          console.log(`Notification already sent to user ${bid.bidder.id} for the book "${book.title}"`);
        }
      }
    }
  }
}
