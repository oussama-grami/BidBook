import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bid } from 'src/bids/entities/bid.entity';
import { Book } from 'src/books/entities/book.entity';
import { Notification } from 'src/notifications/entities/notification.entity';
import { NotificationSchedulerService } from './notification-scheduler/notification-scheduler.service';
import { NotificationsModule } from '../notifications/notifications.module';
import {BidsModule} from "../bids/bids.module";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Book, Bid, Notification]),
    NotificationsModule,
    TypeOrmModule.forFeature([Bid]),
     BidsModule,
  ],
  providers: [NotificationSchedulerService],
  exports: [NotificationSchedulerService],
})
export class NotificationSchedulerModule {}
