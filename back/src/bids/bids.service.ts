import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateBidDto } from './dto/create-bid.dto';
import { UpdateBidDto } from './dto/update-bid.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Bid } from './entities/bid.entity';
import { Repository } from 'typeorm';
import { BidStatus } from 'src/Enums/bidstatus.enum';
import { BooksService } from 'src/books/books.service';
import {NotificationsService} from "../notifications/notifications.service";
import {NotificationType} from "../Enums/notification-type.enum";

@Injectable()
export class BidsService {
  constructor(
      @InjectRepository(Bid)
      private readonly bidRepository: Repository<Bid>,
      private readonly bookService: BooksService,
      private readonly notificationsService: NotificationsService,
  ) {}

  getBidDate(bid: Bid): Date {
    return bid.createdAt;
  }

  create(createBidDto: CreateBidDto) {
    return 'This action adds a new bid';
  }

  findAll() {
    return `This action returns all bids`;
  }

  findOne(id: number) {
    return `This action returns a #${id} bid`;
  }

  update(id: number, updateBidDto: UpdateBidDto) {
    return `This action updates a #${id} bid`;
  }

  remove(id: number) {
    return `This action removes a #${id} bid`;
  }

  async findByBookId(bookId: number): Promise<Bid[]> {
    return this.bidRepository.find({
      where: { book: { id: bookId } },
      relations: ['bidder'],
    });
  }

  async findBidsByUser(userId: number, { limit = 10, offset = 0 }): Promise<Bid[]> {
    return await this.bidRepository.find({
      where: {
        bidder: { id: userId },
      },
      relations: ['book', 'bidder'],
      take: limit,
      skip: offset,
      order: { createdAt: 'DESC' },
    });
  }

  async findHighestBidForBook(bookId: number): Promise<Bid | null> {
    return this.bidRepository.findOne({
      where: { book: { id: bookId } },
      order: { amount: 'DESC' },
      relations: ['book'],
    });
  }

  async createBid(userId: number, bookId: number, amount: number): Promise<Bid> {
    const book = await this.bookService.findOne(bookId);
    if (!book) {
      throw new BadRequestException(`Book with ID ${bookId} not found.`);
    }

    const highestBid = await this.findHighestBidForBook(bookId);
    if (highestBid) {
      const lastBidDate = this.getBidDate(highestBid);
      const now = new Date();
      const timeDifference = now.getTime() - lastBidDate.getTime();
      const hoursDifference = timeDifference / (1000 * 60 * 60);

      if (hoursDifference > 24) {
        throw new BadRequestException('Cannot place a new bid: The bidding period has ended (last bid was over 24 hours ago).');
      }

      if (amount <= highestBid.amount) {
        throw new BadRequestException(
            `Bid amount (${amount}) must be greater than the current highest bid (${highestBid.amount}).`
        );
      }
    } else {
      if (amount <= book.price) {
        throw new BadRequestException(
            `Your first bid (${amount}) must be greater than book's starting price (${book.price}).`
        );
      }
    }

    const newBid = this.bidRepository.create({
      amount,
      bidStatus: BidStatus.PENDING,
      bidder: { id: userId },
      book: { id: bookId },
      createdAt: new Date(),
    });

    const savedBid = await this.bidRepository.save(newBid);

    // Send notification to the book owner (if the bidder is not the owner)
    if (book.owner.id !== userId) {
      this.notificationsService.notify({
        userId: book.owner.id,
        type: NotificationType.BID_PLACED_ON_YOUR_BOOK,
        message: `A new bid of $${amount} was placed on your book "${book.title}" by user ${userId}.`,
        data: { bookId: book.id, bidAmount: amount, bidderId: userId },
      });
    }

    return savedBid;
  }

  async updateBid(userId: number, bookId: number, amount: number): Promise<Bid> {
    const highestBid = await this.findHighestBidForBook(bookId);
    if (!highestBid) {
      throw new BadRequestException('Cannot update bid: No bids have been placed on this book yet. Use createBid for the first bid.');
    }

    const lastBidDate = this.getBidDate(highestBid);
    const now = new Date();
    const timeDifference = now.getTime() - lastBidDate.getTime();
    const hoursDifference = timeDifference / (1000 * 60 * 60);

    if (hoursDifference > 24) {
      throw new BadRequestException('Cannot update bid: The bidding period has ended (last bid was over 24 hours ago).');
    }

    if (amount <= highestBid.amount) {
      throw new BadRequestException(
          `Bid amount (${amount}) must be strictly greater than the current highest bid (${highestBid.amount}).`
      );
    }

    const newBid = this.bidRepository.create({
      amount,
      bidStatus: BidStatus.PENDING,
      bidder: { id: userId },
      book: { id: bookId },
      createdAt: new Date(),
    });

    const savedBid = await this.bidRepository.save(newBid);

    // Send notification to the book owner (if the bidder is not the owner)
    if (highestBid.bidder.id !== userId) { // Assuming the highest bidder is the one updating
      const book = await this.bookService.findOne(bookId); // Need to fetch the book again for owner info
      this.notificationsService.notify({
        userId: book.owner.id,
        type: NotificationType.BID_PLACED_ON_YOUR_BOOK, // You might want a different type for updates
        message: `A bid on your book "${book.title}" was updated to $${amount} by user ${userId}.`,
        data: { bookId: book.id, bidAmount: amount, bidderId: userId },
      });
    }

    return savedBid;
  }
}