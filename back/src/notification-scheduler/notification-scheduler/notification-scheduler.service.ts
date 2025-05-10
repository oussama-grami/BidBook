import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import {Not, Repository} from 'typeorm';
import { Bid } from 'src/bids/entities/bid.entity';
import { Book } from 'src/books/entities/book.entity';
import { Notification } from 'src/notifications/entities/notification.entity';
import { NotificationsService } from "../../notifications/notifications.service";
import { NotificationType } from 'src/Enums/notification-type.enum';
import { BidStatus } from "../../Enums/bidstatus.enum";

@Injectable()
export class NotificationSchedulerService {
  private readonly logger = new Logger(NotificationSchedulerService.name);

  constructor(
      @InjectRepository(Book)
      private readonly bookRepository: Repository<Book>,
      @InjectRepository(Bid)
      private readonly bidRepository: Repository<Bid>,
      @InjectRepository(Notification)
      private readonly notificationsService: NotificationsService,
  ) {}

  @Cron('* * * * *')
  async handleCron() {
    this.logger.log('Running notification scheduler every minute');
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const books = await this.bookRepository.find({
      relations: ['owner'],
      where: { isBiddingOpen: true },
    });

    for (const book of books) {
      const highestBid = await this.bidRepository.findOne({
        where: {
          book: { id: book.id },
          bidStatus: BidStatus.PENDING
        },
        order: { createdAt: 'DESC' },
        relations: ['bidder'],
      });

      if (highestBid?.bidder && highestBid.createdAt < twentyFourHoursAgo) {
        highestBid.bidStatus = BidStatus.ACCEPTED;
        await this.bidRepository.save(highestBid);
        this.logger.log(`Bid ${highestBid.id} for book "${book.title}" set to ACCEPTED.`);
        book.isBiddingOpen = false;
        await this.bookRepository.save(book);
        this.logger.log(`Bidding closed for book "${book.title}".`);
        const message = `Congratulations! You have won the auction for the book "${book.title}"`;
        const messageToOwner = `The auction for your book "${book.title}" has ended. The winning bid was $${highestBid.amount} by user ${highestBid.bidder.firstName} ${highestBid.bidder.lastName}.`;
        const userId = highestBid.bidder.id;
        const ownerId = book.owner.id;
        await this.notificationsService.notify({
          userId: userId,
          type: NotificationType.AUCTION_WON,
          message: message,
          data: { bookId: book.id },
        });
        this.logger.log(`Notification sent to winner (user ${userId}) for book "${book.title}"`);

        await this.notificationsService.notify({
          userId: ownerId,
          type: NotificationType.AUCTION_ENDED_OWNER,
          message: messageToOwner,
          data: { bookId: book.id, winningBidAmount: highestBid.amount, winnerId: highestBid.bidder.id },
        });
        this.logger.log(`Notification sent to owner (user ${ownerId}) for book "${book.title}"`)
        const otherBids = await this.bidRepository.find({
          where: {
            book: { id: book.id },
            bidStatus: BidStatus.PENDING,
            id: Not(highestBid.id)
          }
        });
        for (const bid of otherBids) {
          bid.bidStatus = BidStatus.REJECTED;
          await this.bidRepository.save(bid);
          this.logger.log(`Bid ${bid.id} for book "${book.title}" set to REJECTED.`);
        }
      }
    }
  }
}

