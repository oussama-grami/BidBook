import { Module } from '@nestjs/common';
import { BidsService } from './bids.service';
import { BidsController } from './bids.controller';
import { Bid } from './entities/bid.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BooksModule } from 'src/books/books.module';
import {Book} from "../books/entities/book.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Bid, Book]), BooksModule],
  controllers: [BidsController],
  providers: [BidsService],
  exports: [BidsService],
})
export class BidsModule {}
