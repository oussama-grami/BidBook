import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConversationService } from './conversation.service';
import { User } from '../auth/entities/user.entity';


@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'chat'
})
export class ConversationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private userSocketMap = new Map<string, string>();

  constructor(private readonly conversationService: ConversationService) {}

    async handleConnection(client: Socket) {
      const userId = client.handshake.query.userId as string;
      if (!userId) {
        client.disconnect();
        return;
      }
      
      client.data.userId = userId;
      this.userSocketMap.set(userId, client.id);
      
      // Send initial data
      const conversations = await this.conversationService.findConversationsForUser(Number(userId));
      
      // Get unread messages from all conversations
      const unreadMessages = await Promise.all(
        conversations.map(conversation => 
          this.conversationService.getUnreadMessages(Number(userId), conversation.id)
        )
      ).then(messages => messages.flat());
  
      if (unreadMessages.length > 0 || conversations.length > 0) {
        client.emit('initialData', { unreadMessages, conversations });
      }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      console.log(`Client disconnected: ${client.id}, User ID: ${userId}`);
      this.userSocketMap.delete(userId);
    }
  }

  private async verifyConversationAccess(conversationId: number, userId: number) {
    const conversation = await this.conversationService.findByBidId(conversationId);
    if (!conversation) {
      throw new WsException('Conversation not found');
    }

    const isUserBidder = conversation.bidder.id === userId;
    const isUserOwner = conversation.owner.id === userId;

    if (!isUserBidder && !isUserOwner) {
      throw new WsException('Not authorized for this conversation');
    }

    return conversation;
  }

  @SubscribeMessage('sendMessage')
  async sendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { 
      conversationId: number,
      content: string 
    }
  ) {
    const senderId = Number(client.data.userId);
    const conversation = await this.verifyConversationAccess(data.conversationId, senderId);
    
    if (!conversation.isActive) {
      throw new WsException('This conversation is no longer active');
    }

    const message = await this.conversationService.addMessage(
      data.conversationId,
      senderId,
      data.content
    );
    
    // Determine receiver based on sender role
    const isFromBidder = conversation.bidder.id === senderId;
    const receiverId = isFromBidder ? conversation.owner.id : conversation.bidder.id;
    
    // Deliver to receiver if online
    const receiverSocketId = this.userSocketMap.get(String(receiverId));
    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('newMessage', message);
    }
    
    return message;
  }

  @SubscribeMessage('getConversation')
  async getConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { withUserId?: number, bidId?: number }
  ) {
    const userId = Number(client.data.userId);
    let conversation;

    if (data.bidId) {
      conversation = await this.conversationService.findByBidId(data.bidId);
      if (!conversation) {
        throw new WsException('No conversation found for this bid');
      }
    } else if (data.withUserId) {
      conversation = await this.conversationService.findActiveConversation(
        userId, 
        data.withUserId
      );
    } else {
      throw new WsException('Must provide either withUserId or bidId');
    }

    await this.verifyConversationAccess(conversation.id, userId);
    const messages = await this.conversationService.getMessages(conversation.id);
    
    return { conversation, messages };
  }

  @SubscribeMessage('markAsRead')
  async markMessagesAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: number }
  ) {
    const userId = Number(client.data.userId);
    await this.verifyConversationAccess(data.conversationId, userId);
    
    await this.conversationService.markMessagesAsRead(data.conversationId, userId);
    return { success: true };
  }
}