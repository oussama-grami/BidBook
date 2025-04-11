import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
  OnDestroy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';
import { DatePipe } from '@angular/common';
import {
  ChatService,
  ChatMessage,
  Contact,
} from '../../services/chat/chat.service';
import { Subscription } from 'rxjs';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-discussion',
  imports: [
    FormsModule,
    NgClass,
    NgForOf,
    NgIf,
    TooltipModule,
    DatePipe,
    SkeletonModule,
  ],
  templateUrl: './discussion.component.html',
  styleUrl: './discussion.component.css',
})
export class DiscussionComponent implements OnInit, OnChanges, OnDestroy {
  @Input() selectedMessageId: number | null = null;
  @Input() searchQuery: string = '';

  currentContact: Contact | null = null;
  messages: ChatMessage[] = [];
  filteredMessages: ChatMessage[] = [];
  newMessage: string = '';
  isSearching: boolean = false;
  messagesLoaded: boolean = false;

  private subscriptions: Subscription[] = [];

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    // Subscribe to current contact
    this.subscriptions.push(
      this.chatService.currentContact$.subscribe((contact) => {
        this.currentContact = contact;
        // When a new contact is selected, set messagesLoaded to false to show skeletons
        if (contact) {
          this.messagesLoaded = false;
        }
      })
    );

    // Subscribe to messages for current contact
    this.subscriptions.push(
      this.chatService.currentMessages$.subscribe((messages) => {
        // Only set messages and mark as loaded if we actually have messages
        // This ensures skeletons remain visible until messages are actually loaded
        if (messages && messages.length > 0) {
          this.messages = messages;
          this.applySearchToMessages();
          this.messagesLoaded = true;

          // Scroll to bottom when messages are loaded or updated
          setTimeout(() => {
            this.scrollToBottom();
          }, 0);
        } else if (messages && messages.length === 0 && this.currentContact) {
          // If we get an empty array and have a selected contact,
          // it means the messages were just cleared for loading
          this.messagesLoaded = false;
          this.messages = [];
          this.filteredMessages = [];
        }
      })
    );
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Handle search query changes from parent component
    if (changes['searchQuery']) {
      this.handleSearchQueryChange();
    }

    // Handle selected message ID changes from parent component
    if (changes['selectedMessageId'] && this.selectedMessageId) {
      // When changing contacts, show loading state immediately
      this.messagesLoaded = false;
      this.chatService.setCurrentContact(this.selectedMessageId);
    }
  }

  // Handle search query changes coming from the message component
  handleSearchQueryChange(): void {
    this.isSearching = !!this.searchQuery.trim();
    this.applySearchToMessages();
  }

  applySearchToMessages(): void {
    if (!this.isSearching || !this.searchQuery.trim()) {
      this.filteredMessages = [...this.messages];
    } else if (this.currentContact) {
      this.filteredMessages = this.chatService.searchMessages(
        this.currentContact.id,
        this.searchQuery
      );
    }
  }

  sendMessage(): void {
    if (this.newMessage.trim() && this.currentContact) {
      this.chatService.sendMessage(this.currentContact.id, this.newMessage);
      this.newMessage = '';

      // Scroll to bottom after sending
      setTimeout(() => {
        this.scrollToBottom();
      }, 0);
    }
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.isSearching = false;
    this.filteredMessages = [...this.messages];
  }

  // Helper method to scroll to bottom of messages container
  private scrollToBottom(): void {
    const messageContainer = document.querySelector('.message-bubbles');
    if (messageContainer) {
      messageContainer.scrollTop = messageContainer.scrollHeight;
    }
  }
}
