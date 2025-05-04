import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(JwtAuthGuard)
  @Get('conversations')
  async getConversations(@Request() req) {
    const userId = req.user.id;
    const conversations = await this.chatService.getConversations(userId);
    return {
        userId,
        conversations,
    };
  }
}
