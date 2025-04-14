import { Component, OnInit } from '@angular/core';
import { MessageComponent } from '../message/message.component';
import { DiscussionComponent } from '../discussion/discussion.component';
import { NgClass } from '@angular/common';
import { ChatService } from '../../services/chat/chat.service';

@Component({
  selector: 'app-chat',
  imports: [MessageComponent, DiscussionComponent, NgClass],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
})
export class ChatComponent implements OnInit {
  selectedMessageId: number | null = null; // Don't set default value - wait for explicit selection
  isCollapsed = false; // Track if the users panel is collapsed
  searchQuery: string = ''; // To pass search query between components

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    // On init, we just load the contacts list with the lastMessage
    // We don't pre-select any contact on load to avoid loading all messages
    console.log(
      'Chat component initialized - contacts loaded with last messages only'
    );
  }

  onMessageSelected(messageId: number): void {
    this.selectedMessageId = messageId;
    // The actual loading of messages will be handled by the Discussion component
    // when it detects the change in selectedMessageId
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  // Handle search queries from the message component
  onSearchQueryChanged(query: string): void {
    this.searchQuery = query;
  }
}
