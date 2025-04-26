
import { Controller, Sse, Param, UseGuards, Req, Get, Patch, Delete, UnauthorizedException } from '@nestjs/common';
import { Observable, interval, map } from 'rxjs';
import { NotificationsService } from './notifications.service';
import { User } from 'src/Decorator/user.decorator';
import { Request } from 'express';
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { JwtService } from "@nestjs/jwt";

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService, private jwtService: JwtService) {}

  @Sse('sse')
  async sse(@User('id') userId: number, @Req() req: Request): Promise<Observable<MessageEvent>> {
    return this.notificationsService.subscribe(userId);
  }
  @UseGuards(JwtAuthGuard)
  @Get('user')
  async getUserNotifications(@User('id') userId: number) {
    return this.notificationsService.getUserNotifications(userId);
  }

  @Patch(':notificationId/read')
  async markNotificationAsRead(@Param('notificationId') notificationId: string) {
    await this.notificationsService.markNotificationAsRead(parseInt(notificationId, 10));
    return { message: 'Notification marked as read' };
  }

  @Delete(':id')
  async deleteNotification(@Param('id') id: string) {
    await this.notificationsService.deleteNotification(parseInt(id, 10));
    return { message: `Notification ${id} deleted successfully` };
  }
}


