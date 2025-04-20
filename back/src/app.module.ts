import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
import { StripeModule } from './stripe/stripe.module';
import { PaymentsController } from './payments/payments.controller';
import { User } from './auth/entities/user.entity'; 
import { Bid } from './bid/entities/bid.entity';
import { Transaction } from './transaction/entities/transaction.entity';
import { Book } from './book/entities/book.entity';
import { Conversation } from './conversation/entities/conversation.entity';
import { CommonEntity } from './Common/Common.entity'; // Assuming this is the correct path for CommonEntity
import { Message } from './conversation/entities/message.entity'; // Assuming this is the correct path for Message entity


config({ path: `${process.cwd()}/Config/.env.dev` });

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASS'),
        database: configService.get('DB_NAME'),
        entities: [User, Bid, Transaction, Book, Conversation, Message, CommonEntity],
        synchronize: configService.get('NODE_ENV') === 'development', // Auto-sync in dev
        logging: true,
      }),
    }),
    GlobalModule,
    AuthModule,
    ConversationModule,
    BidModule,
    TransactionModule,
    BookModule,
    EventEmitterModule.forRoot(),
    StripeModule
  ],
  controllers: [AppController, PaymentsController],
  providers: [AppService],
})
export class AppModule {}
