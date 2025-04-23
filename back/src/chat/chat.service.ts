import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from '../conversation/entities/conversation.entity';
import { Message } from '../conversation/entities/message.entity';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepo: Repository<Conversation>,

    @InjectRepository(Message)
    private messageRepo: Repository<Message>,
  ) {}

  async saveMessage({
    conversationId,
    direction,
    content,
  }: {
    conversationId: number;
    direction: boolean;
    content: string;
  }): Promise<Message> {
    const conversation = await this.conversationRepo.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const message = this.messageRepo.create({
      content,
      timestamp: new Date(),
      isRead: false,
      direction,
      conversation,
    });

    return this.messageRepo.save(message);
  }

  async markMessagesAsRead(conversationId: number, userId: number): Promise<void> {
    const conversation = await this.conversationRepo.findOne({
      where: { id: conversationId },
      relations: ['bid', 'bid.bidder'],
    });
  
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }
  
    const isBidder = conversation.bid.bidder.id === userId;
    const senderDirection = !isBidder;
  
    try {
      await this.messageRepo
        .createQueryBuilder()
        .update(Message)
        .set({ isRead: true })
        .where(
          'conversationId = :conversationId AND direction = :direction AND isRead = :isRead',
          {
            conversationId,
            direction: senderDirection,
            isRead: false,
          }
        )
        .execute();
        console.log(`Messages marked as read for conversation ${conversationId}`);
      } catch (error) {
        console.error('Error marking messages as read:', error);
        throw error;
      }
  }

  async getConversations(userId: number): Promise<Conversation[]> {
    // Get conversations where user is the bidder
    const conversationsAsBidder = await this.conversationRepo
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.bid', 'bid')
      .leftJoinAndSelect('bid.bidder', 'bidder')
      .leftJoinAndSelect('bid.book', 'book')
      .leftJoinAndSelect('book.owner', 'owner')
      .leftJoinAndSelect('conversation.messages', 'messages')
      .where('bid.bidder.id = :userId', { userId })
      .andWhere('bid.bidStatus = :status', { status: 'ACCEPTED' })
      .getMany();
  
    // Get conversations where user is the book owner
    const conversationsAsOwner = await this.conversationRepo
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.bid', 'bid')
      .leftJoinAndSelect('bid.bidder', 'bidder')
      .leftJoinAndSelect('bid.book', 'book')
      .leftJoinAndSelect('book.owner', 'owner')
      .leftJoinAndSelect('conversation.messages', 'messages')
      .where('book.owner.id = :userId', { userId })
      .andWhere('bid.bidStatus = :status', { status: 'ACCEPTED' })
      .getMany();
  
    // Combine and remove duplicates
    const allConversations = [...conversationsAsBidder, ...conversationsAsOwner];
    return allConversations;
  }
  
}
