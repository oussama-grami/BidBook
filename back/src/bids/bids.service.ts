import { Injectable } from '@nestjs/common';
import { CreateBidDto } from './dto/create-bid.dto';
import { UpdateBidDto } from './dto/update-bid.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Bid } from './entities/bid.entity'; // Assuming your Bid entity is here
import { Repository } from 'typeorm';
import {Book} from "../books/entities/book.entity";

@Injectable()
export class BidsService {
  constructor(
      @InjectRepository(Bid)
      private readonly bidRepository: Repository<Bid>,
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
}
