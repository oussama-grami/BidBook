import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MessagesModule } from 'primeng/messages';
import { Message } from 'primeng/message';
import {NgOptimizedImage} from '@angular/common';

@Component({
  selector: 'app-notification-element',
  imports:[MessagesModule],
  templateUrl: './notification-element.component.html',
  styleUrls: ['./notification-element.component.css'],
})
export class NotificationElementComponent {
  @Input() notification!: { title: string; time: string; message: string };
  @Output() close = new EventEmitter<void>();

  closeNotification() {
    this.close.emit();
  }
}
