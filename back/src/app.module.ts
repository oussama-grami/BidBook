import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { config } from 'dotenv';
import { GlobalModule } from './Common/global.module';
import { AuthModule } from './auth/auth.module';
import { ConversationModule } from './conversation/conversation.module';
import { BidModule } from './bid/bid.module';
import { TransactionModule } from './transaction/transaction.module';
import { BookModule } from './book/book.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

config({ path: `${process.cwd()}/Config/.env` });

@Module({
  imports: [GlobalModule, AuthModule, ConversationModule, BidModule, TransactionModule, BookModule, EventEmitterModule.forRoot()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
