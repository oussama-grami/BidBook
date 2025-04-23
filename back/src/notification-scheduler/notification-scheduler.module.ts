import { Module } from '@nestjs/common';

import { ScheduleModule } from '@nestjs/schedule';  // Pour la gestion des crons
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bid } from 'src/bids/entities/bid.entity';
import { Book } from 'src/books/entities/book.entity';
import { Notification } from 'src/notifications/entities/notification.entity';
import { NotificationSchedulerService } from './notification-scheduler/notification-scheduler.service';


@Module({
  imports: [
    ScheduleModule.forRoot(),  
    TypeOrmModule.forFeature([Book, Bid, Notification]),  
  ],
  providers: [NotificationSchedulerService],  
  exports: [NotificationSchedulerService],
})
export class NotificationSchedulerModule {}

