import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { User } from '../auth/entities/user.entity';

// ****change looking for participants by using the linked bid
@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getPendingMessages(userId: string) {
    return this.messageRepository.find({
      where: {
        receiver: { id: userId },
        isRead: false
      },
      relations: ['sender', 'conversation']
    });
  }

  async getOrCreateConversation(userId1: string, userId2: string) {
    // Check if conversation already exists
    // **** look for a winning bid between the two users
    const existingConversation = await this.conversationRepository
      .createQueryBuilder('conversation')
      .innerJoin('conversation.participants', 'participant1')
      .innerJoin('conversation.participants', 'participant2')
      .where('participant1.id = :userId1', { userId1 })
      .andWhere('participant2.id = :userId2', { userId2 })
      .getOne();

    if (existingConversation) {
      return existingConversation;
    }

    // Create a new conversation
    const user1 = await this.userRepository.findOne({ where: { id: userId1 } });
    const user2 = await this.userRepository.findOne({ where: { id: userId2 } });
    
    const newConversation = this.conversationRepository.create({
      participants: [user1, user2]
    });
    
    return this.conversationRepository.save(newConversation);
  }

  async addMessage(conversationId: string, senderId: string, content: string) {
    const conversation = await this.conversationRepository.findOne({ 
      where: { id: conversationId },
      relations: ['participants']
    });
    
    const sender = await this.userRepository.findOne({ where: { id: senderId } });
    
    // Find the receiver (the other participant)
    const receiver = conversation.participants.find(p => p.id !== senderId);
    
    const message = this.messageRepository.create({
      content,
      conversation,
      sender,
      receiver,
      isRead: false,
      timestamp: new Date()
    });
    
    return this.messageRepository.save(message);
  }

  async markMessagePending(messageId: string) {
    await this.messageRepository.update(messageId, { isPending: true });
  }

  async markMessagesAsRead(conversationId: string, userId: string) {
    await this.messageRepository.update(
      { 
        conversation: { id: conversationId },
        receiver: { id: userId },
        isRead: false
      },
      { isRead: true }
    );
  }

  async getMessages(conversationId: string) {
    return this.messageRepository.find({
      where: { conversation: { id: conversationId } },
      relations: ['sender', 'receiver'],
      order: { timestamp: 'ASC' }
    });
  }
}