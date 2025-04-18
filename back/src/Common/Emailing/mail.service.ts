import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import * as path from 'path';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  // Helper method to get the logo CID for email templates
  private getLogoCid(): string {
    return 'logo';
  }

  async sendWelcomingEmail(email: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Welcome to Nice App!',
        template: './welcoming',
        attachments: [
          {
            filename: 'logo.jpeg',
            path: path.join(process.cwd(), 'public', 'images', 'logo.jpeg'),
            cid: this.getLogoCid(),
          },
        ],
        context: {
          logoUrl: `cid:${this.getLogoCid()}`,
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
    const verificationUrl = `${baseUrl}/verify-email?token=${token}`;

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Verify Your Email Address - Book Community',
        template: './verification-email',
        attachments: [
          {
            filename: 'logo.jpeg',
            path: path.join(process.cwd(), 'public', 'images', 'logo.jpeg'),
            cid: this.getLogoCid(),
          },
        ],
        context: {
          logoUrl: `cid:${this.getLogoCid()}`,
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

  async sendPasswordResetEmail(
    email: string,
    token: string,
    expiryMinutes: number,
    isResend: boolean = false,
  ) {
    // Calculate expiry date for the reset link
    const expiryDate = new Date();
    expiryDate.setMinutes(expiryDate.getMinutes() + expiryMinutes);

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

    // Generate the reset password URL with base URL from config
    const baseUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    );
    const resetUrl = `${baseUrl}/forget-password/reset?token=${token}`;

    // Customize the subject based on whether this is a new request or a resend
    const subject = isResend
      ? 'Your New Password Reset Link - Book Community'
      : 'Reset Your Password - Book Community';

    // Customize the message for resend cases
    const message = isResend
      ? 'You recently requested another password reset link. Please use this new link to set your password:'
      : 'You requested a password reset. Click the button below to set a new password:';

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: subject,
        template: './reset-password',
        attachments: [
          {
            filename: 'logo.jpeg',
            path: path.join(process.cwd(), 'public', 'images', 'logo.jpeg'),
            cid: this.getLogoCid(),
          },
        ],
        context: {
          logoUrl: `cid:${this.getLogoCid()}`,
          userName: 'User',
          userEmail: email,
          supportEmail: 'support@bookcommunity.com',
          message: message,
          buttonText: 'Reset Password',
          buttonUrl: resetUrl,
          expiryDate: expiryDateFormatted,
          expiryWarning:
            'This password reset link will expire on ' + expiryDateFormatted,
          securityNote:
            'For security reasons, this reset link can be used only once and will expire after the time shown above.',
          facebookUrl: 'https://facebook.com/bookcommunity',
          twitterUrl: 'https://twitter.com/bookcommunity',
          instagramUrl: 'https://instagram.com/bookcommunity',
          currentYear: new Date().getFullYear().toString(),
        },
      });

      this.logger.log(
        `Password reset email sent to ${email} with expiry date ${expiryDateFormatted}`,
      );
    } catch (error) {
      this.logger.error('Error sending password reset email:', error.message);
      throw error;
    }
  }
}
