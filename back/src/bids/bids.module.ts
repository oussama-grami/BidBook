import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bid } from './entities/bid.entity';
import { BidsService } from './bids.service';
import { BidsController } from './bids.controller'; // Add controller
import { BooksService } from '../books/books.service';
import { Book } from '../books/entities/book.entity';
import { ConversationModule } from '../conversation/conversation.module';
import { Conversation } from '../conversation/entities/conversation.entity';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bid, Book, Conversation]), // Ensure Conversation is included
    ConversationModule,
    NotificationsModule,
  ],
  controllers: [BidsController], // Add controller
  providers: [BidsService, BooksService],
  exports: [BidsService],
})
export class BidsModule {}