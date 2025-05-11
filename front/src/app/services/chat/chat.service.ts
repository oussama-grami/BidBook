import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { SocketService } from '../../socket/socket.service';
import { lastValueFrom } from 'rxjs';

export interface ChatMessage {
  id: number;
  contactId: number;
  text: string;
  sent: boolean;
  date: Date;
  isRead: boolean;
}

export interface Contact {
  id: number;
  name: string;
  avatar?: string;
  unreadCount: number;
  lastMessage?: {
    text: string;
    date: Date;
  };
  isActive: boolean;
}


@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private apiUrl = 'http://localhost:3000/chat';

  private contacts: Contact[] = [];
  private messagesMap: Map<number, ChatMessage[]> = new Map();
  private loadedContacts: Set<number> = new Set(); // Track which contact messages have been loaded

  private contactsSubject = new BehaviorSubject<Contact[]>([]);
  private currentContactSubject = new BehaviorSubject<Contact | null>(null);
  private currentMessagesSubject = new BehaviorSubject<ChatMessage[]>([]);

  // Observables that components can subscribe to
  public contacts$ = this.contactsSubject.asObservable();
  public currentContact$ = this.currentContactSubject.asObservable();
  public currentMessages$ = this.currentMessagesSubject.asObservable();
  private isBidder: boolean = false;

  constructor(private http: HttpClient, private socketService: SocketService) {
    this.loadContacts();
    this.listenForIncomingMessages(); 
  }

  private fetchAndProcessContacts(): Promise<Contact[]> {
    return lastValueFrom(
      this.http.get<{ userId: number; conversations: any[] }>(`${this.apiUrl}/conversations`)
    ).then((response) => {
      if (!response) {
        throw new Error('Failed to fetch conversations: response is undefined');
      }

      const currentUserId = response.userId;
      this.isBidder = response.conversations[0]?.bid.bidder.id === currentUserId;

      const contacts = response.conversations.map((convo) => {
        const messages = convo.messages
          .map((msg: any) => ({
            id: msg.id,
            contactId: convo.id,
            text: msg.content,
            sent: this.isBidder ? msg.direction : !msg.direction,
            date: new Date(msg.timestamp),
            isRead: msg.isRead,
          }))
          .sort((a: any, b: any) => a.date.getTime() - b.date.getTime());

        this.messagesMap.set(convo.id, messages);

        const unreadCount = messages.filter(
          (msg: ChatMessage) => !msg.isRead && !msg.sent
        ).length;

        const imageUrl = this.isBidder
          ? convo.bid.book.owner.imageUrl
          : convo.bid.bidder.imageUrl;
        const encodedFilename = encodeURIComponent(imageUrl);

        return {
          id: convo.id,
          name: this.isBidder
            ? convo.bid.book.owner.firstName
            : convo.bid.bidder.firstName,
          avatar: imageUrl,
          unreadCount: unreadCount,
          isActive: convo.isActive,
          lastMessage: convo.messages.length
            ? {
                text: convo.messages[convo.messages.length - 1].content,
                date: new Date(convo.messages[convo.messages.length - 1].timestamp),
              }
            : {
                text: 'no messages yet',
                date: new Date(),
              },
        };
      });

      return contacts;
    });
  }

  private loadContacts() {
    this.fetchAndProcessContacts()
      .then((contacts) => {
        this.contacts = contacts;
        this.contactsSubject.next(contacts);
      })
      .catch((error) => {
        console.error('Error loading contacts:', error);
      });
  }

  refreshContacts(): Promise<void> {
    return this.fetchAndProcessContacts()
      .then((contacts) => {
        this.contacts = contacts;
        this.contactsSubject.next(contacts);
      })
      .catch((error) => {
        console.error('Error refreshing contacts:', error);
      });
  }

  // Get all contacts
  getContacts(): Contact[] {
    return this.contacts;
  }

  // Get messages for a specific contact
  getMessagesForContact(contactId: number): ChatMessage[] {
    // If we haven't loaded messages for this contact yet, mark them as loaded now
    if (!this.loadedContacts.has(contactId)) {
      this.loadedContacts.add(contactId);
      console.log(`Lazy loading messages for contact ${contactId}`);
    }
    return this.messagesMap.get(contactId) || [];
  }


  setCurrentContact(contactId: number) {
    const contact = this.contacts.find((c) => c.id === contactId);
    if (!contact) return;

    console.log('Joining room for contact:', contactId);
    this.socketService.emit('joinRoom', contactId);

    // Mark all messages as read for this contact
    this.socketService.emit('markAsRead', { conversationId: contactId });

    // Update messages in messagesMap to mark as read
    const messages = this.messagesMap.get(contactId) || [];
    const updatedMessages = messages.map((msg) => ({
      ...msg,
      isRead: true, // Mark all messages as read
    }));
    this.messagesMap.set(contactId, [...updatedMessages]);

    // Reset unread count
    const updatedContacts = this.contacts.map((c) =>
      c.id === contactId ? { ...c, unreadCount: 0 } : c
    );
    this.contacts = updatedContacts;
    this.contactsSubject.next([...updatedContacts]);

    // Set current contact and update messages immediately
    this.currentContactSubject.next(contact);
    this.currentMessagesSubject.next([...updatedMessages]);

    // Mark contact as loaded
    if (!this.loadedContacts.has(contactId)) {
      this.loadedContacts.add(contactId);
      console.log(`Lazy loading messages for contact ${contactId}`);
    }
  }
  
  sendMessage(contactId: number, message: string): void {
    const contact = this.contacts.find((c) => c.id === contactId);
    if (!contact) return;

    // Optimistic update: Add the message locally for instant UI feedback
    const messages = [...(this.messagesMap.get(contactId) || [])]; // Create a copy to avoid mutating directly
    const tempMessageId = -Date.now(); // Temporary negative ID to avoid conflicts with real IDs
    const newMessage: ChatMessage = {
      id: tempMessageId, // Temporary ID until backend confirms
      contactId: contactId,
      text: message,
      sent: true,
      date: new Date(),
      isRead: false,
    };
    messages.push(newMessage);
    this.messagesMap.set(contactId, messages);

    // Update UI immediately for the current contact
    const currentContact = this.currentContactSubject.getValue();
    if (currentContact && currentContact.id === contactId) {
      this.currentMessagesSubject.next([...messages]);
    }

    // Update last message for contact
    contact.lastMessage = {
      text: message,
      date: newMessage.date,
    };
    this.contactsSubject.next([...this.contacts]);

    // Send message to backend via socket
    this.socketService.emit('sendMessage', {
      conversationId: contactId,
      content: message,
    });

    // Listen for backend confirmation
    this.socketService.listen<any>('messageSentConfirmation').subscribe({
      next: (confirmedMessage) => {
        if (confirmedMessage.conversationId === contactId && confirmedMessage.content === message) {
          // Replace temporary message with confirmed message
          const updatedMessages = this.messagesMap.get(contactId)!.map((msg) =>
            msg.id === tempMessageId
              ? {
                  id: confirmedMessage.id, // Use real ID from backend
                  contactId: contactId,
                  text: confirmedMessage.content,
                  sent: true,
                  date: new Date(confirmedMessage.timestamp),
                  isRead: confirmedMessage.isRead || false,
                }
              : msg
          );
          this.messagesMap.set(contactId, updatedMessages);
          if (currentContact && currentContact.id === contactId) {
            this.currentMessagesSubject.next([...updatedMessages]);
          }
        }
      },
      error: (error) => {
        console.error('Failed to send message:', error);
        // Roll back optimistic update
        const rolledBackMessages = this.messagesMap.get(contactId)!.filter((msg) => msg.id !== tempMessageId);
        this.messagesMap.set(contactId, rolledBackMessages);
        if (currentContact && currentContact.id === contactId) {
          this.currentMessagesSubject.next([...rolledBackMessages]);
        }
      },
    });
  }

  private listenForIncomingMessages() {
    this.socketService.listen<any>('newMessage').subscribe({
      next: (message) => {
        console.log('Received newMessage event:', message); // Debug: Log incoming message

        const contactId = message.conversation?.id;
        if (!contactId) {
          console.error('Invalid message: missing conversation.id', message);
          return;
        }

        // Trigger refreshContacts to fetch latest state from backend
        this.refreshContacts().then(() => {
          console.log(`Contacts refreshed after new message for contact ${contactId}`); // Debug

          const currentContact = this.currentContactSubject.getValue();
          const isConversationOpen = currentContact && currentContact.id === contactId;

          // If the conversation is open, mark the message as read
          if (isConversationOpen) {
            console.log(`Marking message as read for open conversation ${contactId}`); // Debug
            this.socketService.emit('markAsRead', { conversationId: contactId, messageId: message.id });

            // Ensure messages in messagesMap are marked as read
            const messages = this.messagesMap.get(contactId) || [];
            const updatedMessages = messages.map((msg) => ({
              ...msg,
              isRead: true,
            }));
            this.messagesMap.set(contactId, [...updatedMessages]);
            this.currentMessagesSubject.next([...updatedMessages]);
          }

          // Log current state for debugging
          console.log('Current contacts:', this.contacts); // Debug
          console.log(`Messages for contact ${contactId}:`, this.messagesMap.get(contactId)); // Debug
        }).catch((error) => {
          console.error('Failed to refresh contacts:', error); // Debug
        });
      },
      error: (error) => {
        console.error('Socket error in newMessage:', error);
      },
    });
  }


  searchMessages(contactId: number, query: string): ChatMessage[] {
    if (!query.trim()) {
      // If the query is empty, return all messages for the contact
      return this.messagesMap.get(contactId) || [];
    }
  
    // Get all messages for the contact
    const messages = this.messagesMap.get(contactId) || [];
  
    // Filter messages based on the query
    return messages.filter((message) =>
      message.text.toLowerCase().includes(query.toLowerCase())
    );
  }

  searchContacts(query: string): Contact[] {
    if (!query.trim()) {
      return this.contacts;
    }

    return this.contacts.filter((contact) =>
      contact.name.toLowerCase().includes(query.toLowerCase())
    );
  }
  
}
