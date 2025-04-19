import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from 'src/conversation/entities/message.entity';
import { User } from '../auth/entities/user.entity';

// **** change userRepository instances to queries
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

  /**
   * Create conversation linked to a bid (for won bids)
   */
  async createBidConversation(bidId: string, participants: string[]) {
    const users = await this.userRepository.findByIds(participants);
    
    return this.conversationRepository.save({
      isActive: true,
      bid: { id: bidId }, // Link to the bid
      participants: users
    });
  }

  /**
   * Find conversation by bid ID
   */
  async findByBidId(bidId: string) {
    return this.conversationRepository.findOne({
      where: { bid: { id: bidId } },
      relations: ['participants', 'bid']
    });
  }

  /**
   * Update conversation active status
   */
  async setConversationStatus(id: string, isActive: boolean) {
    await this.conversationRepository.update(id, { isActive });
    return this.conversationRepository.findOneBy({ id });
  }

  /**
   * Find active conversations between two users
   * (Modified from getOrCreateConversation)
   */
  async findActiveConversation(userId1: string, userId2: string) {
    return this.conversationRepository
      .createQueryBuilder('conversation')
      .innerJoin('conversation.participants', 'participant1')
      .innerJoin('conversation.participants', 'participant2')
      .where('participant1.id = :userId1', { userId1 })
      .andWhere('participant2.id = :userId2', { userId2 })
      .andWhere('conversation.isActive = true')
      .getOne();
  }

  async getOrCreateConversation(userId1: string, userId2: string) {
    // First check for existing ACTIVE conversation
    const existing = await this.findActiveConversation(userId1, userId2);
    if (existing) return existing;
  
    // Then check for any bid-linked conversations
    const bidConversation = await this.conversationRepository
      .createQueryBuilder('conversation')
      .innerJoin('conversation.bid', 'bid')
      .innerJoin('bid.user', 'user')
      .where('user.id IN (:...userIds)', { userIds: [userId1, userId2] })
      .andWhere('conversation.isActive = true')
      .getOne();
  
    if (bidConversation) return bidConversation;
  
    // Fallback to creating new conversation
    const users = await this.userRepository.findByIds([userId1, userId2]);
    return this.conversationRepository.save({
      participants: users,
      isActive: true
    });
  }

  async findByConversationId(id: string) {
    return this.conversationRepository.findOne({
      where: { id },
      relations: ['participants', 'bid']
    });
  }
  
  async getActiveBidConversations(userId: string) {
    return this.conversationRepository.find({
      where: {
        participants: { id: userId },
        isActive: true,
        bid: Not(IsNull())
      },
      relations: ['bid']
    });
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