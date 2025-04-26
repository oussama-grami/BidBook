import { Component, OnInit, OnDestroy } from '@angular/core';
import { NotificationElementComponent } from './notification-element/notification-element.component';
import { NgForOf, NgIf } from '@angular/common';
import { NotificationService, SSENotification, StoredNotification } from '../../services/notification.service'; // Adjust the import path
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notifications-page',
  templateUrl: './notifications-page.component.html',
  styleUrls: ['./notifications-page.component.css'],
  imports: [NotificationElementComponent, NgForOf, NgIf],
  standalone: true,
})
export class NotificationsPageComponent implements OnInit, OnDestroy {
  realTimeNotifications: { title: string; time: string; message: string }[] = [];
  storedNotifications: { title: string; time: string; message: string; id: number }[] = [];
  private originalStoredNotifications: StoredNotification[] = [];
  private sseSubscription?: Subscription;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService.connect();
    this.loadStoredNotifications();
    this.subscribeToRealTimeNotifications();
  }

  loadStoredNotifications(): void {
    this.notificationService.getUserNotifications().subscribe((notifications) => {
      this.originalStoredNotifications = [...notifications];
      this.storedNotifications = notifications.map((n) => ({
        title: this.getTitleByType(n.type),
        time: new Date(n.createdAt).toLocaleTimeString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        message: n.message,
        id: n.id,
      }));
    });
  }

  subscribeToRealTimeNotifications(): void {
    this.sseSubscription = this.notificationService.notifications$.subscribe((notification) => {
      this.realTimeNotifications.unshift({
        title: this.getTitleByType(notification.type),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        message: notification.message,
      });
    });
  }

  removeNotification(index: number, isRealTime: boolean): void {
    if (isRealTime) {
      this.realTimeNotifications.splice(index, 1);
    } else {
      const notificationToRemove = this.storedNotifications[index];
      if (notificationToRemove?.id) {
        this.notificationService.deleteNotification(notificationToRemove.id).subscribe({
          next: () => {
            this.storedNotifications.splice(index, 1);
            this.originalStoredNotifications.splice(
              this.originalStoredNotifications.findIndex(
                (n) => n.id === notificationToRemove.id
              ),
              1
            );
            this.notificationService.showSuccess('Notification deleted');
          },
          error: (error) => {
            console.error('Error deleting notification:', error);
            this.notificationService.showError('Failed to delete notification');
          },
        });
      } else {
        console.warn('Notification ID is missing, cannot delete from backend.');
        this.storedNotifications.splice(index, 1); // Still remove from UI
        this.originalStoredNotifications.splice(
          this.originalStoredNotifications.findIndex(
            (n) => n.id === notificationToRemove.id
          ),
          1
        );
      }
    }
  }

  getTitleByType(type: string): string {
    switch (type) {
      case 'BID_PLACED_ON_YOUR_BOOK':
        return 'New Bid!';
      case 'AUCTION_WON':
        return 'Auction Won!';
      default:
        return 'Notification';
    }
  }

  ngOnDestroy(): void {
    if (this.sseSubscription) {
      this.sseSubscription.unsubscribe();
    }
  }
}
