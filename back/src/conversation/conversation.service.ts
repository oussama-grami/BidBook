import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from 'src/conversation/entities/message.entity';
import { User } from '../auth/entities/user.entity';
import { Bid } from 'src/bid/entities/bid.entity';


@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Bid)
    private bidRepository: Repository<Bid>,
  ) {}

  async getUnreadMessages(userId: number, conversationId: number) {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['bidder', 'owner']
    });
  
    if (!conversation) {
      throw new Error('Conversation not found');
    }
  
    const isUserBidder = conversation.bidder.id === userId;
    const isUserOwner = conversation.owner.id === userId;
  
    if (!isUserBidder && !isUserOwner) {
      throw new Error('User is not part of this conversation');
    }
  
    // fetch unread messages sent by the other user
    return this.messageRepository.find({
      where: {
        isRead: false,
        conversation: { id: conversationId },
        isFromBidder: isUserOwner
      },
      relations: ['conversation']
    });
  }

  /**
 * Create conversation linked to a bid
 */
  async createBidConversation(bid: Bid) {
    if (!bid.bidder || !bid.book?.owner) {
      throw new Error('Bid parameter must include bidder, book, and book.owner');
    }
  
    return this.conversationRepository.save({
      isActive: true,
      bid: bid,
      bidder: bid.bidder,
      owner: bid.book.owner
    });
  }

  /**
 * Find conversation by bid ID
 */
async findByBidId(bidId: number) {
  return this.conversationRepository.findOne({
    where: { bid: { id: bidId } },
    relations: ['bidder', 'owner', 'bid']
  });
}

  /**
   * Update conversation active status
   */
  async setConversationStatus(id: number, isActive: boolean) {
    await this.conversationRepository.update(id, { isActive });
    return this.conversationRepository.findOneBy({ id });
  }

  /**
 * Find active conversation between two users
 */
async findActiveConversation(userId1: number, userId2: number) {
  return this.conversationRepository.findOne({
    where: [
      // Case 1: userId1 is bidder, userId2 is owner
      {
        bidder: { id: userId1 },
        owner: { id: userId2 },
        isActive: true
      },
      // Case 2: userId1 is owner, userId2 is bidder
      {
        bidder: { id: userId2 },
        owner: { id: userId1 },
        isActive: true
      }
    ],
    relations: ['bidder', 'owner']
  });
}
/**
 * returns all the conversations for a user
 * @param userId - ID of the user
 */
async findConversationsForUser(userId: number) {
  return this.conversationRepository.find({
    where: [
      // Case 1: user is bidder
      {
        bidder: { id: userId }
      },
      // Case 2: user is owner
      {
        owner: { id: userId }
      }
    ],
    relations: ['bidder', 'owner', 'bid'],
    order: {
      startDate: 'DESC' // Most recent conversations first
    }
  });
}

async addMessage(conversationId: number, senderId: number, content: string) {
  const conversation = await this.conversationRepository.findOne({ 
    where: { id: conversationId },
    relations: ['bidder', 'owner']
  });

  if (!conversation) {
    throw new Error('Conversation not found');
  }

  // Verify sender is part of conversation
  const isFromBidder = conversation.bidder.id === senderId;
  if (!isFromBidder && conversation.owner.id !== senderId) {
    throw new Error('Sender is not part of this conversation');
  }

  const message = this.messageRepository.create({
    content,
    conversation,
    isFromBidder,
    isRead: false,
    timestamp: new Date()
  });

  return this.messageRepository.save(message);
}

  async markMessagesAsRead(conversationId: number, userId: number) {
  // First verify the user is part of the conversation
  const conversation = await this.conversationRepository.findOne({
    where: { id: conversationId },
    relations: ['bidder', 'owner']
  });

  if (!conversation) {
    throw new Error('Conversation not found');
  }

  const isUserBidder = conversation.bidder.id === userId;
  const isUserOwner = conversation.owner.id === userId;

  if (!isUserBidder && !isUserOwner) {
    throw new Error('User is not part of this conversation');
  }

  // Mark messages as read based on whether the user is bidder or owner
  await this.messageRepository.update(
    {
      conversation: { id: conversationId },
      isFromBidder: !isUserBidder, // Messages FROM the other user
      isRead: false
    },
    { isRead: true }
  );
}

async getMessages(conversationId: number) {
  return this.messageRepository.find({
    where: { 
      conversation: { id: conversationId } 
    },
    relations: ['conversation', 'conversation.bidder', 'conversation.owner'],
    order: { 
      timestamp: 'ASC' 
    }
  });
  }
}