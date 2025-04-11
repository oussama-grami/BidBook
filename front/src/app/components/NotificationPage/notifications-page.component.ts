import { Component } from '@angular/core';
import { NotificationElementComponent } from './notification-element/notification-element.component';
import { NgForOf } from '@angular/common';

@Component({
  selector: 'app-notifications-page',
  templateUrl: './notifications-page.component.html',
  styleUrls: ['./notifications-page.component.css'],
  imports: [NotificationElementComponent, NgForOf],
})
export class NotificationsPageComponent {
  notifications = [
    {
      title: 'Notification 1',
      time: '5 mins ago',
      message: 'This is the first notification.',
    },
    {
      title: 'Notification 2',
      time: '10 mins ago',
      message: 'This is the second notification.',
    },
    {
      title: 'Notification 3',
      time: '15 mins ago',
      message: 'This is the third notification.',
    },
  ];

  removeNotification(index: number) {
    this.notifications.splice(index, 1);
  }
}
