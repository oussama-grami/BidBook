import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateBidDto } from './dto/create-bid.dto';
import { UpdateBidDto } from './dto/update-bid.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Bid } from './entities/bid.entity'; // Assuming your Bid entity is here
import { Repository } from 'typeorm';
import {Book} from "../books/entities/book.entity";
import { BidStatus } from 'src/Enums/bidstatus.enum';
import { BooksService } from 'src/books/books.service';

@Injectable()
export class BidsService {
  constructor(
      @InjectRepository(Bid)
      private readonly bidRepository: Repository<Bid>,
      private readonly bookService: BooksService, 
  ) {}

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
  async findBooksBidByUser(userId: number, { limit = 10, offset = 0 }): Promise<Book[]> {
    const bids = await this.bidRepository.find({
      where: { bidder: { id: userId } },
      relations: ['book'],
      take: limit,
      skip: offset,
    });
    // Extract the unique books from the bids
    const books = bids.map(bid => bid.book);
    return [...new Set(books)]; // Use Set to get unique books
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
  const now = new Date();
  const bookCreationTime = book.createdAt;
  const timeElapsed = now.getTime() - bookCreationTime.getTime();
  const twentyFourHoursInMillis = 24 * 60 * 60 * 1000;

  if (timeElapsed > twentyFourHoursInMillis) {
      throw new BadRequestException('Auction for this book has ended.');
  }

  const highestBid = await this.findHighestBidForBook(bookId);

  if (highestBid) {
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
  });

  return this.bidRepository.save(newBid);
}

async updateBid(userId: number, bookId: number, amount: number): Promise<Bid> {
  const book = await this.bookService.findOne(bookId);
  const now = new Date();
  const bookCreationTime = book.createdAt;
  
  if (!bookCreationTime) {
      throw new Error("Book creation time is not available for validation.");
  }
  
  const timeElapsed = now.getTime() - bookCreationTime.getTime();
  const twentyFourHoursInMillis = 24 * 60 * 60 * 1000;

  if (timeElapsed > twentyFourHoursInMillis) {
      throw new BadRequestException('Auction for this book has ended (more than 24 hours since creation).');
  }

  const highestBid = await this.findHighestBidForBook(bookId);

  if (!highestBid) {
      throw new BadRequestException('Cannot update bid: No bids have been placed on this book yet. Use createBid for the first bid.');
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
  });

  return this.bidRepository.save(newBid);
}



}
