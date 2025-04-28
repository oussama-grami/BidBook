import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bid } from 'src/bids/entities/bid.entity';
import { Book } from 'src/books/entities/book.entity';
import { Notification } from 'src/notifications/entities/notification.entity';
import { NotificationsService } from "../../notifications/notifications.service";
import { NotificationType } from 'src/Enums/notification-type.enum';

@Injectable()
export class NotificationSchedulerService {
  constructor(
      @InjectRepository(Book)
      private readonly bookRepository: Repository<Book>,
      @InjectRepository(Bid)
      private readonly bidRepository: Repository<Bid>,
      @InjectRepository(Notification)
      private readonly notificationRepository: Repository<Notification>,
      private readonly notificationsService: NotificationsService,
  ) {}

  @Cron('* * * * *')
  async handleCron() {
    console.log('Running notification scheduler every minute');
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const books = await this.bookRepository.find({
      relations: ['owner'], // Add this line to load the 'owner' relation
    });

    for (const book of books) {
      const highestBid = await this.bidRepository.findOne({
        where: { book: { id: book.id } },
        order: { createdAt: 'DESC' },
        relations: ['bidder'],
      });

      if (highestBid?.bidder && highestBid.createdAt < twentyFourHoursAgo) { // Check if there *is* a highest bid, and it's old
        const message = `Congratulations! You have won the auction for the book "${book.title}"`;
        const messageToOwner = `The auction for your book "${book.title}" has ended. The winning bid was $${highestBid.amount} by user ${highestBid.bidder.id}.`;
        const userId = highestBid.bidder.id;
        console.log(`User ID: ${userId}`);
        const ownerId = book.owner.id;
        book.isBiddingOpen = false;
        await this.bookRepository.save(book);
        await this.notificationsService.notify({
          userId: userId,
          type: NotificationType.AUCTION_WON,
          message: message,
          data: { bookId: book.id },
        });
        console.log(`Notification sent to user ${userId} for the book "${book.title}"`);
        await this.notificationsService.notify({ // Await here
          userId: ownerId,
          type: NotificationType.AUCTION_ENDED_OWNER,
          message: messageToOwner,
          data: { bookId: book.id, winningBidAmount: highestBid.amount, winnerId: highestBid.bidder.id },
        });
        console.log(`Notification sent to owner (user ${book.owner.id}) for book "${book.title}"`);
      }
      }
      //  Else do nothing.  Bidding remains open.
    }

}