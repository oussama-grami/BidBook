import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { Transaction } from './entities/transaction.entity';
import { Bid } from '../bid/entities/bid.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, Bid])
  ],
  controllers: [TransactionController],
  providers: [TransactionService],
  exports: [TransactionService]
})
export class TransactionModule {}