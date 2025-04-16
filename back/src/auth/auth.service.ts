import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from './dto/sign-up.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { MfaEnableDto } from './dto/mfa-enable.dto';
import { MfaVerifyDto } from './dto/mfa-verify.dto';
import { authenticator } from 'otplib';
import { ConfigService } from '@nestjs/config';
import * as QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import { MailService } from '../Common/Emailing/mail.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  // Sign up function with automatic email verification
  async signUp(signUpDto: SignUpDto): Promise<{ message: string }> {
    const { email, password, firstName, lastName } = signUpDto;

    // Check if user already exists
    const userExists = await this.userRepository.findOneBy({ email });
    if (userExists) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password);

    // Generate verification token
    const verificationToken = uuidv4();

    // Create new user
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      verificationToken,
      isEmailVerified: false,
      isMFAEnabled: false,
    });

    await this.userRepository.save(user);

    try {
      // Send verification email
      await this.sendVerificationEmail(email, verificationToken);
    } catch (error) {
      // Log the error but don't prevent user creation
      this.logger.error(`Failed to send verification email: ${error.message}`);
    }

    return {
      message: 'User registered successfully. Please verify your email.',
    };
  }

  // Verify email function
  async verifyEmail(
    verifyEmailDto: VerifyEmailDto,
  ): Promise<{ message: string }> {
    const { token } = verifyEmailDto;

    // Find user with this verification token
    const user = await this.userRepository.findOneBy({
      verificationToken: token,
    });
    if (!user) {
      throw new NotFoundException('Invalid verification token');
    }

    // Update user as verified
    user.isEmailVerified = true;
    user.verificationToken = null;
    await this.userRepository.save(user);

    return {
      message: 'Email verified successfully',
    };
  }

  // Login function with email verification and MFA check
  async login(loginDto: LoginDto): Promise<any> {
    const { email, password } = loginDto;

    // Find user
    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      // For testing purposes, you can temporarily skip this check or
      // resend the verification email instead of throwing an exception
      try {
        if (user.verificationToken) {
          await this.sendVerificationEmail(email, user.verificationToken);
        } else {
          // Generate a new token if the old one is missing
          const newToken = uuidv4();
          user.verificationToken = newToken;
          await this.userRepository.save(user);
          await this.sendVerificationEmail(email, newToken);
        }
      } catch (error) {
        this.logger.error(
          `Failed to resend verification email: ${error.message}`,
        );
      }

      throw new ForbiddenException(
        'Email not verified. Please verify your email first. A new verification email has been sent.',
      );
    }

    // Check if MFA is enabled
    if (user.isMFAEnabled) {
      // Return a temporary token that will be used to complete the MFA verification
      const mfaToken = this.jwtService.sign(
        { sub: user.id, email: user.email, isMfaAuthenticated: false },
        { expiresIn: '5m' },
      );

      return {
        message: 'MFA verification required',
        mfaToken,
        isMfaRequired: true,
      };
    }

    // Generate full access token
    const token = this.generateAccessToken(user);

    return {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      },
    };
  }

  // Verify MFA code during login
  async verifyMfaLogin(mfaVerifyDto: MfaVerifyDto, user: User): Promise<any> {
    const { code } = mfaVerifyDto;

    // Verify code
    const isCodeValid = authenticator.verify({
      token: code,
      secret: user.mfaSecret || '',
    });

    if (!isCodeValid) {
      throw new UnauthorizedException('Invalid MFA code');
    }

    // Generate full access token
    const token = this.generateAccessToken(user);

    return {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isMFAEnabled: user.isMFAEnabled,
      },
    };
  }

  // Initiate MFA setup by generating QR code
  async generateMfaSecret(user: User): Promise<any> {
    // Generate a secret
    const secret = authenticator.generateSecret();

    // Generate the OTP authentication URL
    const appName = this.configService.get<string>('APP_NAME') || 'BookApp';
    const otpAuthUrl = authenticator.keyuri(user.email, appName, secret);

    // Generate QR code
    const qrCode = await QRCode.toDataURL(otpAuthUrl);

    // Update user with the secret
    await this.userRepository.update(user.id, {
      mfaSecret: secret,
    });

    return {
      secret,
      qrCode,
      otpAuthUrl,
    };
  }

  // Enable MFA after verifying code
  async enableMfa(mfaEnableDto: MfaEnableDto, user: User): Promise<any> {
    const { code } = mfaEnableDto;

    // Check if user has a secret
    if (!user.mfaSecret) {
      throw new BadRequestException('MFA setup not initiated');
    }

    // Verify code
    const isCodeValid = authenticator.verify({
      token: code,
      secret: user.mfaSecret,
    });

    if (!isCodeValid) {
      throw new UnauthorizedException('Invalid MFA code');
    }

    // Generate recovery codes
    const recoveryCodes = this.generateRecoveryCodes();

    // Update user with MFA enabled and recovery codes
    user.isMFAEnabled = true;
    user.recoveryCodes = recoveryCodes;
    await this.userRepository.save(user);

    return {
      message: 'MFA enabled successfully',
      recoveryCodes,
    };
  }

  // Disable MFA
  async disableMfa(user: User): Promise<any> {
    // Update user
    user.isMFAEnabled = false;
    user.mfaSecret = null;
    user.recoveryCodes = null;
    await this.userRepository.save(user);

    return {
      message: 'MFA disabled successfully',
    };
  }

  // Handle Google OAuth authentication
  async googleLogin(user: any): Promise<any> {
    if (!user) {
      throw new UnauthorizedException('No user from Google');
    }

    let dbUser = await this.userRepository.findOneBy({ email: user.email });

    if (!dbUser) {
      // Create a new user with Google info
      dbUser = this.userRepository.create({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.picture,
        googleId: user.googleId,
        isEmailVerified: true, // Google accounts already have verified emails
      });

      await this.userRepository.save(dbUser);
    } else if (!dbUser.googleId) {
      // Link Google account to existing user
      dbUser.googleId = user.googleId;
      dbUser.isEmailVerified = true;
      await this.userRepository.save(dbUser);
    }

    // Generate token
    const token = this.generateAccessToken(dbUser);

    return {
      accessToken: token,
      user: {
        id: dbUser.id,
        email: dbUser.email,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
      },
    };
  }

  // Handle GitHub OAuth authentication
  async githubLogin(user: any): Promise<any> {
    if (!user) {
      throw new UnauthorizedException('No user from GitHub');
    }

    let dbUser = await this.userRepository.findOneBy({ email: user.email });

    if (!dbUser) {
      // Create a new user with GitHub info
      dbUser = this.userRepository.create({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.picture,
        githubId: user.githubId,
        isEmailVerified: true, // GitHub accounts already have verified emails
      });

      await this.userRepository.save(dbUser);
    } else if (!dbUser.githubId) {
      // Link GitHub account to existing user
      dbUser.githubId = user.githubId;
      dbUser.isEmailVerified = true;
      await this.userRepository.save(dbUser);
    }

    // Generate token
    const token = this.generateAccessToken(dbUser);

    return {
      accessToken: token,
      user: {
        id: dbUser.id,
        email: dbUser.email,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
      },
    };
  }

  // Helper method to hash passwords
  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  // Helper method to generate JWT token
  private generateAccessToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      isMfaAuthenticated: true,
    };

    return this.jwtService.sign(payload);
  }

  // Helper method to generate recovery codes
  private generateRecoveryCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      codes.push(uuidv4().substring(0, 8));
    }
    return codes;
  }

  // Helper method to send verification email
  private async sendVerificationEmail(
    email: string,
    token: string,
  ): Promise<void> {
    try {
      // Use the enhanced verification email method from our mail service
      await this.mailService.sendVerificationEmail(email, token);
    } catch (error) {
      this.logger.error(`Email sending failed: ${error.message}`);
      // Rethrow the error to let the caller decide how to handle it
      throw error;
    }
  }
}
