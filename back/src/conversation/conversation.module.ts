import { Module } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { ConversationController } from './conversation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from './entities/conversation.entity';
import { Bid } from '../bids/entities/bid.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Conversation, Bid])],
  controllers: [ConversationController],
  providers: [ConversationService],
  exports: [ConversationService, TypeOrmModule],
})
export class ConversationModule {}
