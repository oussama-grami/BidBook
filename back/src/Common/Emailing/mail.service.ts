import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendWelcomingEmail(email: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Welcome to Nice App!',
      template: 'welcoming', // Just use the template name without any path prefix
      context: {
        logoUrl: '/public/images/img.png',
        userName: 'Sarah Johnson',
        userEmail: 'sarah.johnson@email.com',
        exploreUrl: 'https://yoursite.com/explore',
        supportEmail: 'support@bookcommunity.com',
        bookRecommendations: [
          {
            title: 'The Silent Pages',
            author: 'Emma Roberts',
            genre: 'Mystery',
          },
          {
            title: 'Echoes of Tomorrow',
            author: 'Michael Chen',
            genre: 'Science Fiction',
          },
          {
            title: 'The Lost Library',
            author: 'Jessica Williams',
            genre: 'Historical Fiction',
          },
        ],
        facebookUrl: 'https://facebook.com/bookcommunity',
        twitterUrl: 'https://twitter.com/bookcommunity',
        instagramUrl: 'https://instagram.com/bookcommunity',
        currentYear: '2025',
        unsubscribeUrl:
          'https://yoursite.com/unsubscribe?email=sarah.johnson@email.com',
      },
    });
  }
}
