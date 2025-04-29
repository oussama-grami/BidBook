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

  private loadContacts() {
    this.http.get<{ userId: number; conversations: any[] }>(`${this.apiUrl}/conversations`)
      .subscribe((response) => {
        const currentUserId = response.userId;
  
        const contacts = response.conversations.map((convo) => {
          this.isBidder = convo.bid.bidder.id === currentUserId;

          const messages = convo.messages.map((msg: any) => ({
            id: msg.id,
            contactId: convo.id,
            text: msg.content,
            sent: this.isBidder ? msg.direction : !msg.direction,
            date: new Date(msg.timestamp),
            isRead: msg.isRead,
          })).sort((a: any, b: any) => a.date.getTime() - b.date.getTime());

          this.messagesMap.set(convo.id, messages); // Store messages for this conversation
  
          // Calculate unread messages count
          const unreadCount = messages.filter((msg: ChatMessage) => 
            !msg.isRead && !msg.sent
          ).length;

          const imageUrl = this.isBidder ? convo.bid.book.owner.imageUrl : convo.bid.bidder.imageUrl;
          const encodedFilename = encodeURIComponent(imageUrl);

          return {
            id: convo.id,
            name: this.isBidder ? convo.bid.book.owner.firstName : convo.bid.bidder.firstName,
            avatar: imageUrl,
            unreadCount: unreadCount,
            isActive: convo.isActive,
            lastMessage: convo.messages.length
              ? {
                  text: convo.messages[0].content,
                  date: convo.messages[0].timestamp,
                }
              : undefined,
          };
        });
  
        this.contacts = contacts;
        this.contactsSubject.next(contacts);
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
    const contact = this.contacts.find(c => c.id === contactId);
    //Join the room for this conversation
    console.log("Joining room for contact:", contactId);
    this.socketService.emit('joinRoom', contactId);
    if (contact) {
      // Mark messages as read via socket
      this.socketService.emit('markAsRead', { conversationId: contactId });
      // Reset unread count when selecting contact
      contact.unreadCount = 0;
      this.currentContactSubject.next(contact);
      const messages = this.messagesMap.get(contactId) || [];
      const updatedMessages = messages.map(msg => {
        if (!msg.sent) {
          return { ...msg, isRead: true };
        }
        return msg;
      });
      

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
  
  sendMessage(contactId: number, message: string): void {
    const contact = this.contacts.find((c) => c.id === contactId);
    if (!contact) return;
    this.socketService.emit('sendMessage', {
      conversationId: contactId,
      content: message,
    });  
    const messages = this.messagesMap.get(contactId) || [];
    // Create new message
    const newMessage: ChatMessage = {
      id: messages.length + 1,
      contactId: contactId,
      text: message,
      sent: true,
      date: new Date(),
      isRead: false,
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
      text: message,
      date: newMessage.date,
    };
    // Update contacts list
    this.contactsSubject.next([...this.contacts]);

  }

  private listenForIncomingMessages() {

    this.socketService.listen<any>('newMessage').subscribe((message) => {
      const currentMessages = [...(this.messagesMap.get(message.conversation.id) || [])];

      // Check if this message already exists (avoid duplicates)
      const messageExists = currentMessages.some(msg => 
      msg.text === message.content && 
      Math.abs(new Date(msg.date).getTime() - new Date(message.timestamp).getTime()) < 1000
    );
    if(!messageExists) {
      const newMessage = {
        id: message.id,
        contactId: message.conversation.id,
        text: message.content,
        sent: this.isBidder ? message.direction : !message.direction,
        date: new Date(message.timestamp),
        isRead: false,
      };
  
      currentMessages.push(newMessage);
      currentMessages.sort((a, b) => a.date.getTime() - b.date.getTime());
  
      const current = this.currentContactSubject.getValue();
      if (current && current.id === message.conversation.id) {
        this.currentMessagesSubject.next(currentMessages);
      }
    }
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



refreshContacts(): Promise<void> {
  return lastValueFrom(
    this.http.get<{ userId: number; conversations: any[] }>(`${this.apiUrl}/conversations`)
  )
    .then((response) => {
      if (!response) {
        throw new Error('Failed to fetch conversations: response is undefined');
      }

      const currentUserId = response.userId;
      this.isBidder = response.conversations[0].bid.bidder.id === currentUserId; // Assuming the first conversation is representative

      const contacts = response.conversations.map((convo) => {

        const messages = convo.messages.map((msg: any) => ({
          id: msg.id,
          contactId: convo.id,
          text: msg.content,
          sent: this.isBidder ? msg.direction : !msg.direction,
          date: new Date(msg.timestamp),
        })).sort((a: any, b: any) => b.date.getTime() - a.date.getTime()); 

        this.messagesMap.set(convo.id, [...messages].reverse()); 

        const imageUrl = this.isBidder ? convo.bid.book.owner.imageUrl : convo.bid.bidder.imageUrl;
        const encodedFilename = encodeURIComponent(imageUrl);

        return {
          id: convo.id,
          name: this.isBidder ? convo.bid.book.owner.firstName : convo.bid.bidder.firstName,
          avatar: imageUrl,
          isActive: convo.isActive,
          unreadCount: convo.messages.filter((msg: any) => 
            !msg.isRead && msg.direction === this.isBidder  // Only count messages from the other person
          ).length,
          lastMessage: convo.messages.length
            ? {
                text: convo.messages[0].content,
                date: convo.messages[0].timestamp,
              }
            : undefined,
        };
      });

      this.contacts = contacts;
      this.contactsSubject.next(contacts); // Emit updated contacts
    })
    .catch((error) => {
      console.error('Error refreshing contacts:', error);
    });
}
  
}
