import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationService } from './conversation.service';
import { ConversationGateway } from './conversation.gateway';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { User } from '../auth/entities/user.entity';
import { Bid } from '../bid/entities/bid.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([
      Conversation,
      Message,
      User,
      Bid
    ])
  ],
  providers: [ConversationGateway, ConversationService],
  exports: [ConversationService]
})
export class ConversationModule {}