import {Component, OnInit} from '@angular/core';
import {MessageComponent} from '../message/message.component';
import {DiscussionComponent} from '../discussion/discussion.component';

@Component({
  selector: 'app-chat',
  imports: [
    MessageComponent,
    DiscussionComponent
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit {
  selectedMessageId: number | null = 1; // Par défaut, sélectionnez le premier message

  constructor() { }

  ngOnInit(): void {
  }

  onMessageSelected(messageId: number): void {
    this.selectedMessageId = messageId;
  }
}
