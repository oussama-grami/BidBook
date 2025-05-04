import { Controller, Sse, Param, UseGuards, Req, Get, Patch, Delete, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Observable, interval, map, takeUntil, Subject } from 'rxjs';
import { NotificationsService } from './notifications.service';
import { User } from 'src/Decorator/user.decorator';
import { Request } from 'express';
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { JwtService } from "@nestjs/jwt";

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController implements OnModuleInit, OnModuleDestroy {
  private readonly heartbeatInterval = 30000; // Send heartbeat every 30 seconds
  private heartbeat$: Observable<MessageEvent>;
  private destroy$ = new Subject<void>();

  constructor(private readonly notificationsService: NotificationsService, private jwtService: JwtService) {
    this.heartbeat$ = interval(this.heartbeatInterval).pipe(
        map(() => new MessageEvent('heartbeat', { data: 'ping' })),
        takeUntil(this.destroy$)
    );
  }

  @Sse('sse')
  async sse(@User('id') userId: number, @Req() req: Request): Promise<Observable<MessageEvent>> {
    return this.notificationsService.subscribe(userId).pipe(
        takeUntil(this.destroy$),
        (notificationStream: Observable<MessageEvent>) => {
          return new Observable<MessageEvent>((subscriber) => {
            // Subscribe to notifications
            const notificationSubscription = notificationStream.subscribe({
              next: (notification) => subscriber.next(notification),
              error: (error) => subscriber.error(error),
              complete: () => subscriber.complete(),
            });

            // Subscribe to heartbeat
            const heartbeatSubscription = this.heartbeat$.subscribe({
              next: (heartbeat) => subscriber.next(heartbeat),
              error: (error) => subscriber.error(error),
              complete: () => {}, // Heartbeat should not complete when the main stream completes
            });

            // Cleanup: Unsubscribe from both streams when the subscriber unsubscribes
            return () => {
              notificationSubscription.unsubscribe();
              heartbeatSubscription.unsubscribe();
            };
          });
        }
    );
  }

  @Get('user')
  async getUserNotifications(@User('id') userId: number) {
    return this.notificationsService.getUserNotifications(userId);
  }

  @Patch(':notificationId/read')
  async markNotificationAsRead(@Param('notificationId') notificationId: string) {
    await this.notificationsService.markNotificationAsRead(parseInt(notificationId, 10));
    return { message: 'Notification marked as read' };
  }

  @Delete(':id')
  async deleteNotification(@Param('id') id: string) {
    await this.notificationsService.deleteNotification(parseInt(id, 10));
    return { message: `Notification ${id} deleted successfully` };
  }

  onModuleInit() {
  }

  onModuleDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
