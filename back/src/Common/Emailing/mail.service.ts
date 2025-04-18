import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}

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
      this.logger.error('Error sending welcome email:', error.message);
      // Don't throw the error to avoid breaking the signup flow
    }
  }

  async sendVerificationEmail(email: string, token: string) {
    // Calculate expiry date for verification link - 24 hours from now
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 24);

    // Format the expiry date in a user-friendly way
    const expiryDateFormatted = expiryDate.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    });

    // Generate the verification URL with base URL from config
    const baseUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    );
    const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${token}`;

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
          expiryDate: expiryDateFormatted,
          expiryWarning:
            'This verification link will expire on ' + expiryDateFormatted,
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

      this.logger.log(
        `Verification email sent to ${email} with expiry date ${expiryDateFormatted}`,
      );
    } catch (error) {
      this.logger.error('Error sending verification email:', error.message);
      throw error; // Rethrow to allow caller to handle
    }
  }
}
