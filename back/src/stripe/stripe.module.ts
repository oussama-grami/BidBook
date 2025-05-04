import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { Transaction } from './entities/transaction.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [StripeController],
  providers: [StripeService],
  imports: [
    TypeOrmModule.forFeature([Transaction]),
  ],
})
export class StripeModule {}
