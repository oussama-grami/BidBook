import { 
  WebSocketGateway, 
  SubscribeMessage, 
  MessageBody, 
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect
} from '@nestjs/websockets';
import { ConversationService } from './conversation.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { Server, Socket } from 'socket.io';

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
    console.log(`Client connected: ${client.id}, User ID: ${userId}`);
    
    // Store user connection info (only for message routing)
    client.data.userId = userId;
    this.userSocketMap.set(userId, client.id);
    
    // Send any pending messages to the user
    const pendingMessages = await this.conversationService.getPendingMessages(userId);
    if (pendingMessages.length > 0) {
      client.emit('pendingMessages', pendingMessages);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    console.log(`Client disconnected: ${client.id}, User ID: ${userId}`);
    
    this.userSocketMap.delete(userId);
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

    // **** check if the conversation is active first
    
    // Store the message in the database
    const message = await this.conversationService.addMessage(
      data.conversationId,
      senderId,
      data.content
    );
    
    // Check if receiver is online (for real-time delivery only)
    const receiverSocketId = this.userSocketMap.get(data.receiverId);
    
    if (receiverSocketId) {
      // Receiver is online, send the message directly
      this.server.to(receiverSocketId).emit('newMessage', message);
    } else {
      // Receiver is offline, mark message as pending (optional)
      await this.conversationService.markMessagePending(message.id);
    }
    
    // Confirm to sender that message was sent
    return message;
  }

  @SubscribeMessage('getConversation')
  async getConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { withUserId: string }
  ) {
    const userId = client.data.userId;
    
    // Get or create conversation between these users
    const conversation = await this.conversationService.getOrCreateConversation(
      userId, 
      data.withUserId
    );
    
    // Get messages for this conversation
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
    
    // Mark messages as read
    await this.conversationService.markMessagesAsRead(data.conversationId, userId);
    
    return { success: true };
  }

}
