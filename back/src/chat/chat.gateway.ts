import {
  WebSocketGateway,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/auth/entities/user.entity';
import { RedisCacheService } from 'src/Common/cache/redis-cache.service';
import { JwtService } from '@nestjs/jwt';
import { Conversation } from 'src/conversation/entities/conversation.entity';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: { 
    origin: 'http://localhost:4200',
    credentials: true,
  }, 
  namespace: 'chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,  // Add this
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Conversation) private conversationRepo: Repository<Conversation>,
    private readonly redisCacheService: RedisCacheService,
  ) {}

  async handleConnection(client: Socket) {
    console.log('received websockets:', client.id);
    try{
      const cookies = client.handshake.headers.cookie;
      if (!cookies) {
        console.log('ChatGateway: No cookies found');
        client.disconnect();
        return;
      }

      // Parse the access token from cookies
      const accessToken = cookies
        .split(';')
        .find(cookie => cookie.trim().startsWith('access_token='))
        ?.split('=')[1];

      if (!accessToken) {
        console.log('ChatGateway: No access token found in cookies');
        client.disconnect();
        return;
      }

      // Verify the token
      const payload = this.jwtService.verify(accessToken, {
        secret: this.configService.get<string>('SECRET_KEY')
      });
      const user = await this.userRepo.findOne({ where: { id: payload.sub } });
      
      if (!user) {
        console.log('ChatGateway: User not found');
        client.disconnect();
        return;
      }

      client.data.userId = user.id;
      console.log(`ChatGateway: User ${user.id} connected successfully`);
      
    } catch (err) {
      console.error('ChatGateway: Connection error:', err.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data?.userId;
    console.log(`User ${userId || 'unknown'} disconnected from chat`);
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() conversationId: number,
    @ConnectedSocket() client: Socket
  ) {
    console.log('Received joinRoom request:', { conversationId, userId: client.data.userId });
    const userId = client.data.userId;
    if (!userId) {
      console.log('Unauthorized join attempt');
      client.emit('error', 'Unauthorized');
      return;
    }

    // Optional: Validate if user is part of the conversation
    const convo = await this.conversationRepo.findOne({
      where: { id: conversationId },
      relations: ['bid', 'bid.bidder', 'bid.book', 'bid.book.owner'],
    });

    if (!convo || (convo.bid.bidder.id !== userId && convo.bid.book.owner.id !== userId)) {
      client.emit('error', 'Forbidden');
      return;
    }

    // Join the room
    client.join(`conversation-${conversationId}`);
    console.log(`User ${userId} joined room conversation-${conversationId}`);
  }



  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() data: { conversationId: number; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId;

    const { conversationId, content } = data;

    if (!userId || !conversationId || !content?.trim()) {
      client.emit('error', { message: 'Invalid message data.' });
      return;
    }

    try {
      const conversation = await this.conversationRepo.findOne({
        where: { id: conversationId },
        relations: ['bid', 'bid.bidder'],
      });

      if (!conversation) {
        client.emit('error', { message: 'Conversation not found' });
        return;
      }

      const direction = conversation.bid.bidder.id === userId;
      // Save the message to DB
      const message = await this.chatService.saveMessage({
        conversationId,
        direction: direction,
        content,
      });
      const room = `conversation-${conversationId}`;
      this.server.to(room).emit('newMessage', message);

    } catch (error) {
      console.error('Error saving message:', error);
      client.emit('error', { message: 'Failed to send message.' });
    }
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @MessageBody() data: { conversationId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId;
    await this.chatService.markMessagesAsRead(data.conversationId, userId);
  }
}
