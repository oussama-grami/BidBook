import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MessagesModule } from 'primeng/messages';
import {NgStyle} from '@angular/common';

@Component({
  selector: 'app-notification-element',
  imports: [MessagesModule, NgStyle],
  templateUrl: './notification-element.component.html',
  styleUrls: ['./notification-element.component.css'],
  standalone: true
})
export class NotificationElementComponent {
  @Input() notification!: { title: string; time: string; message: string };
  @Output() close = new EventEmitter<void>();
  @Input() isRealTime: boolean=true;
  ngOnInit() {
    console.log(this.isRealTime);
  }


  closeNotification() {
    this.close.emit();
  }
}
