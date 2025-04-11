import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import {NgClass, NgForOf} from '@angular/common';

interface Message {
  id: number;
  username: string;
  date: string;
  text: string;
  isActive: boolean;
}

@Component({
  selector: 'app-message',
  imports: [
    NgClass,
    NgForOf
  ],
  templateUrl: './message.component.html',
  styleUrl: './message.component.css'
})
export class MessageComponent implements OnInit {
  @Output() messageSelected = new EventEmitter<number>();

  messages: Message[] = [];

  constructor() { }

  ngOnInit(): void {
    // Simuler des données de messages
    this.messages = [
      {
        id: 1,
        username: 'Helga.Khatib',
        date: 'Date',
        text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the i',
        isActive: true
      },
      {
        id: 2,
        username: 'Helga.Khatib',
        date: 'Date',
        text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the i',
        isActive: false
      },
      {
        id: 3,
        username: 'Helga.Khatib',
        date: 'Date',
        text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the i',
        isActive: false
      },
      {
        id: 4,
        username: 'Helga.Khatib',
        date: 'Date',
        text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the i',
        isActive: false
      }
    ];
  }

  selectMessage(messageId: number): void {
    // Mettre à jour l'état actif
    this.messages.forEach(message => {
      message.isActive = message.id === messageId;
    });

    // Émettre l'événement de sélection
    this.messageSelected.emit(messageId);
  }
}
