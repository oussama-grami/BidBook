import { Injectable } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { Repository } from 'typeorm';

interface NotificationPayload {
  userId: number;
  type: string;
  message: string;
  data?: any;
}

@Injectable()
export class NotificationsService {
  private clients: Map<number, Subject<MessageEvent>> = new Map();

  constructor(
      @InjectRepository(Notification)
      private readonly notificationRepository: Repository<Notification>,
  ) {}

  subscribe(userId: number): Observable<MessageEvent> {
    const subject = new Subject<MessageEvent>();
    this.clients.set(userId, subject);
    console.log(`User ${userId} subscribed to SSE`);
    return subject.pipe(
        map(payload => new MessageEvent('message', { data: JSON.stringify(payload) }))
    );
  }

  async notify(payload: NotificationPayload): Promise<void> {
    const client = this.clients.get(payload.userId);
    if (client) {
      client.next(
          new MessageEvent('message', {
            data: JSON.stringify({
              type: payload.type,
              message: payload.message,
              data: payload.data,
            }),
          })
      );
      console.log(`Notification sent to user ${payload.userId}: ${payload.message}`);
    }

    // Store the notification in the database
    await this.storeNotification(payload);
  }

  async storeNotification(payload: NotificationPayload): Promise<Notification> {
    const notification = this.notificationRepository.create({
      userId: payload.userId,
      type: payload.type,
      message: payload.message,
      data: payload.data ? JSON.stringify(payload.data) : null,
      read: false,
    });
    return this.notificationRepository.save(notification);
  }

  async getUserNotifications(userId: number): Promise<Notification[]> {
    return this.notificationRepository.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async markNotificationAsRead(id: number): Promise<void> {
    await this.notificationRepository.update(id, { read: true });
  }
  async deleteNotification(id: number): Promise<void> {
    await this.notificationRepository.delete(id);
    console.log(`Notification ${id} deleted from the database.`);
  }
}