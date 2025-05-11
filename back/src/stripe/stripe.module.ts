import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { Transaction } from './entities/transaction.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import {Bid} from "../bids/entities/bid.entity";
import { NotificationsModule } from 'src/notifications/notifications.module';
import { ConversationModule } from '../conversation/conversation.module';
import { Conversation } from '../conversation/entities/conversation.entity';

@Module({
  controllers: [StripeController],
  providers: [StripeService],
  imports: [
    TypeOrmModule.forFeature([Transaction]),
    TypeOrmModule.forFeature([Bid]),
    NotificationsModule,
    ConversationModule,
  ],
  exports: [StripeService],
})
export class StripeModule {}
