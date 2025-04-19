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
  private userSocketMap = new Map<string, string>(); // userId -> socketId

  constructor(private readonly conversationService: ConversationService) {}

  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (!userId) {
      client.disconnect();
      return;
    }

    console.log(`Client connected: ${client.id}, User ID: ${userId}`);
    
    // Store user connection info
    client.data.userId = userId;
    this.userSocketMap.set(userId, client.id);
    
    // Send initial data (pending messages and active bid conversations)
    const [pendingMessages, bidConversations] = await Promise.all([
      this.conversationService.getPendingMessages(userId),
      this.conversationService.getActiveBidConversations(userId)
    ]);

    if (pendingMessages.length > 0 || bidConversations.length > 0) {
      client.emit('initialData', { pendingMessages, bidConversations });
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      console.log(`Client disconnected: ${client.id}, User ID: ${userId}`);
      this.userSocketMap.delete(userId);
    }
  }

  private async verifyConversationAccess(conversationId: string, userId: string) {
    const conversation = await this.conversationService.findByConversationId(conversationId);
    const isParticipant = conversation.participants.some((p: User) => p.id === userId);
    if (!isParticipant) throw new WsException('Not authorized for this conversation');
    return conversation;
  }

  @SubscribeMessage('sendMessage')
  async sendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { 
      conversationId: string, 
      receiverId: string,
      content: string 
    }
  ) {
    const senderId = client.data.userId;

    // Verify conversation is active and user has access
    const conversation = await this.verifyConversationAccess(data.conversationId, senderId);
    if (!conversation.isActive) {
      throw new WsException('This conversation is no longer active');
    }

    // Store the message
    const message = await this.conversationService.addMessage(
      data.conversationId,
      senderId,
      data.content
    );
    
    // Deliver to receiver if online
    const receiverSocketId = this.userSocketMap.get(data.receiverId);
    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('newMessage', message);
    } else {
      await this.conversationService.markMessagePending(message.id);
    }
    
    return message;
  }

  @SubscribeMessage('getConversation')
  async getConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { withUserId?: string, bidId?: string }
  ) {
    const userId = client.data.userId;
    let conversation;

    if (data.bidId) {
      conversation = await this.conversationService.findByBidId(data.bidId);
      if (!conversation) throw new WsException('No conversation found for this bid');
    } else if (data.withUserId) {
      conversation = await this.conversationService.getOrCreateConversation(
        userId, 
        data.withUserId
      );
    } else {
      throw new WsException('Must provide either withUserId or bidId');
    }

    // Verify participation
    await this.verifyConversationAccess(conversation.id, userId);

    const messages = await this.conversationService.getMessages(conversation.id);
    
    return {
      conversation,
      messages
    };
  }

  @SubscribeMessage('getBidConversation')
  async getBidConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { bidId: string }
  ) {
    const userId = client.data.userId;
    const conversation = await this.conversationService.findByBidId(data.bidId);
    
    if (!conversation) {
      throw new WsException('No conversation found for this bid');
    }

    await this.verifyConversationAccess(conversation.id, userId);

    const messages = await this.conversationService.getMessages(conversation.id);
    
    return {
      conversation,
      messages
    };
  }

  @SubscribeMessage('markAsRead')
  async markMessagesAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string }
  ) {
    const userId = client.data.userId;
    await this.verifyConversationAccess(data.conversationId, userId);
    
    await this.conversationService.markMessagesAsRead(data.conversationId, userId);
    return { success: true };
  }
}