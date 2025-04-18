import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { config } from 'dotenv';
import { GlobalModule } from './Common/global.module';
import { AuthModule } from './auth/auth.module';
import { ConversationModule } from './conversation/conversation.module';
import { BidModule } from './bid/bid.module';

config({ path: `${process.cwd()}/Config/.env` });

@Module({
  imports: [GlobalModule, AuthModule, ConversationModule, BidModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
