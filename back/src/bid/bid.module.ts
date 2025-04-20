import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BidService } from './bid.service';
import { BidController } from './bid.controller';
import { Bid } from './entities/bid.entity';
import { EventEmitterModule } from '@nestjs/event-emitter';



@Module({
  imports: [
    TypeOrmModule.forFeature([Bid]),
    EventEmitterModule.forRoot()
  ],
  controllers: [BidController],
  providers: [BidService],
  exports: [BidService]
})
export class BidModule {}