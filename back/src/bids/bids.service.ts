import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateBidDto } from './dto/create-bid.dto';
import { UpdateBidDto } from './dto/update-bid.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Bid } from './entities/bid.entity';
import { Repository } from 'typeorm';
import { BidStatus } from 'src/Enums/bidstatus.enum';
import { BooksService } from 'src/books/books.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../Enums/notification-type.enum';
import { Book } from '../books/entities/book.entity';
import { Conversation } from '../conversation/entities/conversation.entity';
import { ConversationService } from '../conversation/conversation.service';

@Injectable()
export class BidsService {
  constructor(
    @InjectRepository(Bid)
    private readonly bidRepository: Repository<Bid>,
    private readonly bookService: BooksService,
    private readonly notificationsService: NotificationsService,
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    private readonly conversationService: ConversationService,
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

  async update(id: number, updateBidDto: UpdateBidDto): Promise<Bid> {
    const { amount, bidStatus } = updateBidDto;

    // Load the bid with relations
    const bid = await this.bidRepository.findOne({
      where: { id },
      relations: ['book', 'book.owner', 'bidder', 'conversation'],
    });

    if (!bid) {
      throw new BadRequestException(`Bid with ID ${id} not found.`);
    }

    // Validate amount if provided
    if (amount !== undefined) {
      const highestBid = await this.findHighestBidForBook(bid.book.id);
      if (highestBid && amount <= highestBid.amount) {
        throw new BadRequestException(
          `Bid amount (${amount}) must be strictly greater than the current highest bid (${highestBid.amount}).`,
        );
      }

      const lastBidDate = highestBid ? this.getBidDate(highestBid) : bid.createdAt;
      const now = new Date();
      const timeDifference = now.getTime() - lastBidDate.getTime();
      const hoursDifference = timeDifference / (1000 * 60 * 60);

      if (hoursDifference > 24) {
        bid.book.isBiddingOpen = false;
        await this.bookRepository.save(bid.book);
        throw new BadRequestException(
          'Cannot update bid: The bidding period has ended (last bid was over 24 hours ago).',
        );
      }

      bid.amount = amount;
      bid.createdAt = new Date();
    }

    // Update bid status if provided
    if (bidStatus !== undefined && bidStatus !== bid.bidStatus) {
      bid.bidStatus = bidStatus;

      // Create a conversation if status is ACCEPTED and no conversation exists
      if (bidStatus === BidStatus.ACCEPTED && !bid.conversation) {
        const conversation = await this.conversationService.createConversation(bid.id);
        bid.conversation = conversation;
      }
    }

    const savedBid = await this.bidRepository.save(bid);

    // Send notification to the book owner if amount was updated
    if (amount !== undefined && bid.bidder.id !== bid.book.owner.id) {
      this.notificationsService.notify({
        userId: bid.book.owner.id,
        type: NotificationType.BID_PLACED_ON_YOUR_BOOK,
        message: `A bid on your book "${bid.book.title}" was updated to $${amount} by user ${bid.bidder.id}.`,
        data: { bookId: bid.book.id, bidAmount: amount, bidderId: bid.bidder.id },
      });
    }

    return savedBid;
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

    if (book.owner.id === userId) {
      throw new BadRequestException('You cannot bid on your own book.');
    }

    const highestBid = await this.findHighestBidForBook(bookId);
    if (highestBid) {
      const lastBidDate = this.getBidDate(highestBid);
      const now = new Date();
      const timeDifference = now.getTime() - lastBidDate.getTime();
      const hoursDifference = timeDifference / (1000 * 60 * 60);

      if (hoursDifference > 24) {
        book.isBiddingOpen = false;
        await this.bookRepository.save(book);
        throw new BadRequestException(
          'Cannot place a new bid: The bidding period has ended (last bid was over 24 hours ago).',
        );
      }

      if (amount <= highestBid.amount) {
        throw new BadRequestException(
          `Bid amount (${amount}) must be greater than the current highest bid (${highestBid.amount}).`,
        );
      }
    } else {
      if (amount <= book.price) {
        throw new BadRequestException(
          `Your first bid (${amount}) must be greater than book's starting price (${book.price}).`,
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

    this.notificationsService.notify({
      userId: book.owner.id,
      type: NotificationType.BID_PLACED_ON_YOUR_BOOK,
      message: `A new bid of $${amount} was placed on your book "${book.title}" by user ${userId}.`,
      data: { bookId: book.id, bidAmount: amount, bidderId: userId },
    });

    return savedBid;
  }

  async updateBid(userId: number, bookId: number, amount: number): Promise<Bid> {
    const book = await this.bookService.findOne(bookId);
    if (!book) {
      throw new BadRequestException(`Book with ID ${bookId} not found.`);
    }

    if (book.owner.id === userId) {
      throw new BadRequestException('You cannot update a bid on your own book.');
    }

    const highestBid = await this.findHighestBidForBook(bookId);
    if (!highestBid) {
      throw new BadRequestException(
        'Cannot update bid: No bids have been placed on this book yet. Use createBid for the first bid.',
      );
    }

    const lastBidDate = this.getBidDate(highestBid);
    const now = new Date();
    const timeDifference = now.getTime() - lastBidDate.getTime();
    const hoursDifference = timeDifference / (1000 * 60 * 60);

    if (hoursDifference > 24) {
      book.isBiddingOpen = false;
      await this.bookRepository.save(book);
      throw new BadRequestException(
        'Cannot update bid: The bidding period has ended (last bid was over 24 hours ago).',
      );
    }

    if (amount <= highestBid.amount) {
      throw new BadRequestException(
        `Bid amount (${amount}) must be strictly greater than the current highest bid (${highestBid.amount}).`,
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

    if (highestBid.bidder.id !== userId) {
      this.notificationsService.notify({
        userId: book.owner.id,
        type: NotificationType.BID_PLACED_ON_YOUR_BOOK,
        message: `A bid on your book "${book.title}" was updated to $${amount} by user ${userId}.`,
        data: { bookId: book.id, bidAmount: amount, bidderId: userId },
      });
    }

    return savedBid;
  }
}