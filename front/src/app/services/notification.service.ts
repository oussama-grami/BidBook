import { MessageService } from 'primeng/api';
import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { UserIdService } from './userid.service';
import { EventSourcePolyfill } from 'event-source-polyfill';

export interface SSENotification {
  id: number;
  type: string;
  message: string;
  data?: any;
}

export interface StoredNotification {
  original: SSENotification;
  id: number;
  userId: number;
  type: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
}

export const NotificationType = {
  BID_PLACED_ON_YOUR_BOOK: 'BID_PLACED_ON_YOUR_BOOK',
  AUCTION_WON: 'AUCTION_WON',
  AUCTION_LOST: 'AUCTION_LOST',
};

@Injectable({
  providedIn: 'root',
})
export class NotificationService implements OnDestroy {
  private sseSource: EventSource | null = null;
  private notificationsSubject = new Subject<SSENotification>();
  notifications$: Observable<SSENotification> = this.notificationsSubject.asObservable();
  private subscriptions: Subscription[] = [];
  constructor(private messageService: MessageService, private ngZone: NgZone, private http: HttpClient, private userIdService: UserIdService) {}

  showSuccess(message: string, title: string = 'Success') {
    this.messageService.add({
      severity: 'success',
      summary: title,
      detail: message,
    });
  }

  showError(message: string, title: string = 'Error') {
    this.messageService.add({
      severity: 'error',
      summary: title,
      detail: message,
    });
  }

  showInfo(message: string, title: string = 'Info') {
    this.messageService.add({
      severity: 'info',
      summary: title,
      detail: message,
    });
  }

  showWarning(message: string, title: string = 'Warning') {
    this.messageService.add({
      severity: 'warn',
      summary: title,
      detail: message,
    });
  }

  clear() {
    this.messageService.clear();
  }
  connect(): void {
    const userId = this.userIdService.getUserId();

    if (userId && !this.sseSource) {
      const sseUrl = `http://localhost:3000/notifications/sse`;

      console.log('Connecting to SSE URL:', sseUrl);
      this.sseSource = new EventSourcePolyfill(sseUrl, {
        withCredentials: true,
      });

      this.sseSource.onmessage = (event) => {
        this.ngZone.run(() => {
          try {
            const payload = JSON.parse(event.data);
            this.notificationsSubject.next(payload);
          } catch (error) {
            console.error('Error parsing SSE event:', error, event.data);
          }
        });
      };

      this.sseSource.onerror = (error) => {
        console.error('SSE error:', error);
        this.disconnect();
      };
    }
  }
  disconnect(): void {
    if (this.sseSource) {
      this.sseSource.close();
      this.sseSource = null;
      console.log('SSE disconnected');
    }
  }

  getUserNotifications(): Observable<StoredNotification[]> {
    const userId = this.userIdService.getUserId();
    console.log('NotificationService - User ID:', userId);
    if (userId) {
      return this.http.get<StoredNotification[]>(`http://localhost:3000/notifications/user`);
    }
    return new Observable<StoredNotification[]>();
  }

  markAsRead(notificationId: number): Observable<void> {
    return this.http.patch<void>(`http://localhost:3000/notifications/${notificationId}/read`, {});
  }
  deleteNotification(notificationId: number): Observable<void> {
    return this.http.delete<void>(`http://localhost:3000/notifications/${notificationId}`);
  }

  ngOnDestroy(): void {
    this.disconnect();
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
