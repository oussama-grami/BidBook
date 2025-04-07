import { Component } from '@angular/core';
import {NgClass} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {InputTextModule} from 'primeng/inputtext';

@Component({
  selector: 'app-messages',
  imports: [
    NgClass,
    FormsModule,
    InputTextModule
  ],
  templateUrl: './messages.component.html',
  standalone: true,
  styleUrl: './messages.component.css'
})
export class MessagesComponent {
  messages = [
    {
      sender: 'Helga.Khatib',
      date: 'Date',
      preview: 'Lorem Ipsum is simply dummy text of the printing...'
    },
    // Duplicate if needed
  ];

  selectedChat = {
    sender: 'Helga.Khatib'
  };

  chatMessages = [
    { from: 'Helga', text: 'Lorem Ipsum is simply dummy text of the p' },
    { from: 'me', text: 'Lorem Ipsum is simply dummy text of' },
    { from: 'Helga', text: 'Lorem Ipsum is simply dummy text of the p' },
    { from: 'me', text: 'Lorem Ipsum is simply dummy text of' }
  ];

  newMessage = '';

}
