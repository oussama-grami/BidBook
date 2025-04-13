import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  OnDestroy,
} from '@angular/core';
import { NgClass, NgForOf, NgIf, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, Contact } from '../../services/chat/chat.service';
import { Subscription } from 'rxjs';
import { BadgeModule } from 'primeng/badge';

@Component({
  selector: 'app-message',
  imports: [NgClass, NgForOf, NgIf, FormsModule, BadgeModule],
  templateUrl: './message.component.html',
  styleUrl: './message.component.css',
  standalone: true,
})
export class MessageComponent implements OnInit, OnDestroy {
  @Output() messageSelected = new EventEmitter<number>();
  @Output() searchQueryChanged = new EventEmitter<string>();

  contacts: Contact[] = [];
  filteredContacts: Contact[] = [];
  isCollapsed = false;
  activeContactId: number | null = null;
  searchQuery: string = '';
  loading: boolean = true; // Add loading state

  private subscriptions: Subscription[] = [];

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    // Show loading state
    this.loading = true;

    // Subscribe to contacts
    this.subscriptions.push(
      this.chatService.contacts$.subscribe((contacts) => {
        this.contacts = contacts;
        this.applySearch();

        // Short timeout to ensure skeleton is shown for at least a moment
        // This gives users visual feedback of loading process
        setTimeout(() => {
          this.loading = false;
        }, 800);
      })
    );

    // Subscribe to current contact
    this.subscriptions.push(
      this.chatService.currentContact$.subscribe((contact) => {
        if (contact) {
          this.activeContactId = contact.id;
        }
      })
    );
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  selectContact(contactId: number): void {
    // If the same contact is clicked again, do nothing
    if (this.activeContactId === contactId) {
      return;
    }

    // Set the current contact in the chat service - this will also reset the unread count
    this.chatService.setCurrentContact(contactId);
    this.messageSelected.emit(contactId);

    // Ensure the unread count is visually updated immediately
    const contact = this.contacts.find((c) => c.id === contactId);
    if (contact) {
      contact.unreadCount = 0;
    }
  }

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  // Search functionality
  search(): void {
    this.applySearch();
    // Emit search query for discussion component to also filter messages
    this.searchQueryChanged.emit(this.searchQuery);
  }

  applySearch(): void {
    if (!this.searchQuery.trim()) {
      this.filteredContacts = [...this.contacts];
    } else {
      this.filteredContacts = this.chatService.searchContacts(this.searchQuery);
    }
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.filteredContacts = [...this.contacts];
    this.searchQueryChanged.emit('');
  }

  // Force reload of contacts (useful for manual refresh)
  refreshContacts(): void {
    this.loading = true;
    this.chatService.refreshContacts().then(() => {
      setTimeout(() => {
        this.loading = false;
      }, 800);
    });
  }

  // Format the relative time for messages
  formatRelativeTime(date: Date | undefined): string {
    if (!date) return '';

    const now = new Date();
    const msgDate = new Date(date);
    const diffDays = Math.floor(
      (now.getTime() - msgDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      const days = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ];
      return days[msgDate.getDay()];
    } else {
      return msgDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  }
}
