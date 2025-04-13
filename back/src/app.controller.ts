import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { MailService } from './Common/Emailing/mail.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly mailService: MailService,
  ) {}

  @Get()
  async getHello(): Promise<string> {
    await this.mailService.sendWelcomingEmail('qadg199@gmail.com');
    return this.appService.getHello();
  }
}
