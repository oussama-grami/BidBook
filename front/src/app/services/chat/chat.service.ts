import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ChatMessage {
  id: number;
  contactId: number;
  text: string;
  sent: boolean;
  date: Date;
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
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
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

  constructor() {
    this.initializeMockData();
  }

  // Initialize mock data for demonstration
  private initializeMockData(): void {
    // Create mock contacts
    const contacts: Contact[] = [
      {
        id: 1,
        name: 'Helga Khatib',
        avatar: '/images/person.png',
        unreadCount: 2,
      },
      {
        id: 2,
        name: 'John Doe',
        avatar: '/images/person.png',
        unreadCount: 0,
      },
      {
        id: 3,
        name: 'Emily Smith',
        avatar: '/images/person.png',
        unreadCount: 1,
      },
      {
        id: 4,
        name: 'Michael Johnson',
        avatar: '/images/person.png',
        unreadCount: 0,
      },
    ];

    // Create mock messages for each contact
    const messagesMap = new Map<number, ChatMessage[]>();

    // Messages for contact 1
    messagesMap.set(1, [
      {
        id: 1,
        contactId: 1,
        text: 'Hello! How are you doing today?',
        sent: false,
        date: new Date(2025, 3, 10, 9, 30),
      },
      {
        id: 2,
        contactId: 1,
        text: "I'm doing great, thanks for asking. How about you?",
        sent: true,
        date: new Date(2025, 3, 10, 9, 35),
      },
      {
        id: 3,
        contactId: 1,
        text: 'Pretty good! I was wondering if you had time to review that proposal?',
        sent: false,
        date: new Date(2025, 3, 10, 9, 40),
      },
      {
        id: 4,
        contactId: 1,
        text: "Yes, I've reviewed it. It looks excellent!",
        sent: true,
        date: new Date(2025, 3, 10, 9, 45),
      },
    ]);

    // Messages for contact 2
    messagesMap.set(2, [
      {
        id: 1,
        contactId: 2,
        text: 'Hey, do you have time to meet today?',
        sent: false,
        date: new Date(2025, 3, 11, 8, 0),
      },
      {
        id: 2,
        contactId: 2,
        text: 'Sure, how about 2pm?',
        sent: true,
        date: new Date(2025, 3, 11, 8, 10),
      },
      {
        id: 3,
        contactId: 2,
        text: 'That works for me. See you then!',
        sent: false,
        date: new Date(2025, 3, 11, 8, 15),
      },
    ]);

    // Messages for contact 3
    messagesMap.set(3, [
      {
        id: 1,
        contactId: 3,
        text: 'When is the next team meeting scheduled?',
        sent: false,
        date: new Date(2025, 3, 9, 15, 30),
      },
      {
        id: 2,
        contactId: 3,
        text: "It's on Friday at 10am",
        sent: true,
        date: new Date(2025, 3, 9, 15, 45),
      },
      {
        id: 3,
        contactId: 3,
        text: 'Thanks! I need to prepare my presentation.',
        sent: false,
        date: new Date(2025, 3, 10, 10, 5),
      },
    ]);

    // Messages for contact 4
    messagesMap.set(4, [
      {
        id: 1,
        contactId: 4,
        text: 'Could you send me those project files?',
        sent: false,
        date: new Date(2025, 3, 8, 14, 0),
      },
      {
        id: 2,
        contactId: 4,
        text: 'Just sent them via email',
        sent: true,
        date: new Date(2025, 3, 8, 14, 15),
      },
      {
        id: 3,
        contactId: 4,
        text: 'I just sent you the files you requested. Let me know if you need anything else.',
        sent: false,
        date: new Date(2025, 3, 9, 14, 22),
      },
    ]);

    // Update contacts with last message
    for (const contact of contacts) {
      const messages = messagesMap.get(contact.id);
      if (messages && messages.length > 0) {
        const lastMsg = messages[messages.length - 1];
        contact.lastMessage = {
          text: lastMsg.text,
          date: lastMsg.date,
        };
      }
    }

    this.contacts = contacts;
    this.messagesMap = messagesMap;
    this.contactsSubject.next(this.contacts);

    // Don't set initial contact here anymore - we'll let the component decide when to load
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

  // Set current contact and update messages
  setCurrentContact(contactId: number): void {
    const contact = this.contacts.find((c) => c.id === contactId);
    if (contact) {
      // Reset unread count when selecting contact
      contact.unreadCount = 0;
      this.currentContactSubject.next(contact);

      // First clear current messages and show skeleton loading
      this.currentMessagesSubject.next([]);

      // Simulate network delay for loading messages (remove in production)
      setTimeout(() => {
        // Get messages for this contact - only now do we load the messages
        const messages = this.getMessagesForContact(contactId);
        this.currentMessagesSubject.next(messages);

        // Update contacts list to reflect the read status
        this.contactsSubject.next([...this.contacts]);
      }, 1000); // Simulate a 1 second loading delay
    }
  }

  // Add a new message
  sendMessage(contactId: number, text: string): void {
    const contact = this.contacts.find((c) => c.id === contactId);
    if (!contact) return;

    const messages = this.messagesMap.get(contactId) || [];

    // Create new message
    const newMessage: ChatMessage = {
      id: messages.length + 1,
      contactId: contactId,
      text: text,
      sent: true,
      date: new Date(),
    };

    // Add to messages list
    messages.push(newMessage);
    this.messagesMap.set(contactId, messages);

    // Update current messages if this is the selected contact
    const currentContact = this.currentContactSubject.getValue();
    if (currentContact && currentContact.id === contactId) {
      this.currentMessagesSubject.next([...messages]);
    }

    // Update last message for contact
    contact.lastMessage = {
      text: text,
      date: newMessage.date,
    };

    // Update contacts list
    this.contactsSubject.next([...this.contacts]);
  }

  // Search contacts by name or message content
  searchContacts(query: string): Contact[] {
    if (!query.trim()) return this.contacts;

    const lowerQuery = query.toLowerCase().trim();
    return this.contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(lowerQuery) ||
        (contact.lastMessage &&
          contact.lastMessage.text.toLowerCase().includes(lowerQuery))
    );
  }

  // Search messages by content
  searchMessages(contactId: number, query: string): ChatMessage[] {
    if (!query.trim()) return this.getMessagesForContact(contactId);

    const messages = this.getMessagesForContact(contactId);
    const lowerQuery = query.toLowerCase().trim();

    return messages.filter((message) =>
      message.text.toLowerCase().includes(lowerQuery)
    );
  }

  // Refresh contacts - simulates fetching fresh data
  refreshContacts(): Promise<Contact[]> {
    // In a real application, you would make an HTTP request here
    return new Promise((resolve) => {
      // Simulate network delay
      setTimeout(() => {
        // Re-initialize data (in a real app, this would be a network request)
        this.initializeMockData();
        // Return fresh contacts
        resolve(this.contacts);
      }, 1000);
    });
  }
}
