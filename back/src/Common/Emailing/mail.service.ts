import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendWelcomingEmail(email: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Welcome to Nice App!',
        template: './welcoming', // Add ./ prefix to make it relative to the template directory
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
          currentYear: new Date().getFullYear().toString(),
          unsubscribeUrl:
            'https://yoursite.com/unsubscribe?email=sarah.johnson@email.com',
        },
      });
    } catch (error) {
      console.error('Error sending welcome email:', error.message);
      // Don't throw the error to avoid breaking the signup flow
    }
  }

  async sendVerificationEmail(email: string, token: string) {
    const verificationUrl = `http://localhost:3000/api/auth/verify-email?token=${token}`;

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Verify Your Email Address',
        template: './welcoming',
        context: {
          logoUrl: '/public/images/img.png',
          userName: 'New User',
          userEmail: email,
          verificationUrl: verificationUrl,
          supportEmail: 'support@bookcommunity.com',
          message:
            'Please verify your email address by clicking the button below:',
          buttonText: 'Verify Email',
          buttonUrl: verificationUrl,
          facebookUrl: 'https://facebook.com/bookcommunity',
          twitterUrl: 'https://twitter.com/bookcommunity',
          instagramUrl: 'https://instagram.com/bookcommunity',
          currentYear: new Date().getFullYear().toString(),
          // Add empty bookRecommendations to prevent template errors
          bookRecommendations: [],
          exploreUrl: verificationUrl,
          unsubscribeUrl: '#',
        },
      });
    } catch (error) {
      console.error('Error sending verification email:', error.message);
    }
  }
}
