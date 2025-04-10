import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgClass, NgForOf} from '@angular/common';

interface ChatMessage {
  id: number;
  text: string;
  sent: boolean;
}



@Component({
  selector: 'app-discussion',
  imports: [
    FormsModule,
    NgClass,
    NgForOf
  ],
  templateUrl: './discussion.component.html',
  styleUrl: './discussion.component.css'
})

export class DiscussionComponent implements OnInit, OnChanges {
  @Input() selectedMessageId: number | null = null;

  username: string = 'Helga.Khatib';
  messages: ChatMessage[] = [];
  newMessage: string = '';

  constructor() { }

  ngOnInit(): void {
    this.loadChatMessages();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedMessageId']) {
      // Ici vous pourriez charger les messages de chat correspondant à l'ID sélectionné
      this.loadChatMessages();
    }
  }

  loadChatMessages(): void {
    // Simuler le chargement des messages de chat
    this.messages = [
      {
        id: 1,
        text: 'Lorem Ipsum is simply dummy text of the p',
        sent: false
      },
      {
        id: 2,
        text: 'Lorem Ipsum is simply dummy text of',
        sent: true
      },
      {
        id: 3,
        text: 'Lorem Ipsum is simply dummy text of the p',
        sent: false
      },
      {
        id: 4,
        text: 'Lorem Ipsum is simply dummy text of',
        sent: true
      }
    ];
  }

  sendMessage(): void {
    if (this.newMessage.trim()) {
      this.messages.push({
        id: this.messages.length + 1,
        text: this.newMessage,
        sent: true
      });
      this.newMessage = '';

      // Faites défiler vers le bas après l'envoi
      setTimeout(() => {
        const messageContainer = document.querySelector('.message-bubbles');
        if (messageContainer) {
          messageContainer.scrollTop = messageContainer.scrollHeight;
        }
      }, 0);
    }
  }
}
