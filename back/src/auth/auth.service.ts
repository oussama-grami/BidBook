import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
  Res,
  InternalServerErrorException,
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
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SignUpResponseDto } from './dto/responses/sign-up-response.dto';
import { VerifyEmailResponseDto } from './dto/responses/verify-email-response.dto';
import {
  LoginResponseDto,
  MfaRequiredResponseDto,
} from './dto/responses/login-response.dto';
import { RefreshTokenResponseDto } from './dto/responses/refresh-token-response.dto';
import { LogoutResponseDto } from './dto/responses/logout-response.dto';
import { MfaVerifyResponseDto } from './dto/responses/mfa-verify-response.dto';
import { MfaGenerateResponseDto } from './dto/responses/mfa-generate-response.dto';
import { MfaEnableResponseDto } from './dto/responses/mfa-enable-response.dto';
import { MfaDisableResponseDto } from './dto/responses/mfa-disable-response.dto';
import { OAuthResponseDto } from './dto/responses/oauth-response.dto';
import { RedisCacheService } from '../Common/cache/redis-cache.service';
import { Response } from 'express';
import { DisableMfaDto } from './dto/disable-mfa.dto';
import { Role } from 'src/Enums/roles.enum';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ForgotPasswordResponseDto } from './dto/responses/forgot-password-response.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResetPasswordResponseDto } from './dto/responses/reset-password-response.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  // Email verification token expiry in seconds (24 hours)
  private readonly EMAIL_VERIFICATION_EXPIRY = 24 * 60 * 60;
  // Password reset token expiry in seconds (30 minutes)
  private readonly PASSWORD_RESET_EXPIRY = 30 * 60;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    private readonly redisCacheService: RedisCacheService,
  ) {}

  // Sign up function with automatic email verification
  async signUp(signUpDto: SignUpDto): Promise<SignUpResponseDto> {
    const { email, password, firstName, lastName, imageUrl } = signUpDto;

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
      imageUrl
    });

    await this.userRepository.save(user);

    try {
      // Store verification token in Redis with expiry
      await this.redisCacheService.storeVerificationToken(
        verificationToken,
        email,
        this.EMAIL_VERIFICATION_EXPIRY,
      );

      // Send verification email
      await this.sendVerificationEmail(email, verificationToken);
    } catch (error) {
      // Log the error but don't prevent user creation
      this.logger.error(
        `Failed to handle verification process: ${error.message}`,
      );
    }

    return {
      message: 'User registered successfully. Please verify your email.',
    };
  }

  // Verify email function
  async verifyEmail(
    verifyEmailDto: VerifyEmailDto,
  ): Promise<VerifyEmailResponseDto> {
    const { token } = verifyEmailDto;

    // Check if token exists in Redis and is valid
    const email =
      await this.redisCacheService.getEmailFromVerificationToken(token);

    if (!email) {
      // If not in Redis, check if it's an old token in the database
      const user = await this.userRepository.findOneBy({
        verificationToken: token,
      });

      if (!user) {
        throw new NotFoundException('Invalid or expired verification token');
      }

      // Update user as verified
      user.isEmailVerified = true;
      user.verificationToken = null;
      await this.userRepository.save(user);
    } else {
      // Token found in Redis - it's valid and not expired
      const user = await this.userRepository.findOneBy({ email });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Update user as verified
      user.isEmailVerified = true;
      user.verificationToken = null;
      await this.userRepository.save(user);

      // Invalidate the verification token in Redis
      await this.redisCacheService.invalidateVerificationToken(token);
    }

    return {
      message: 'Email verified successfully',
    };
  }

  // Login function with email verification and MFA check
  async login(
    loginDto: LoginDto,
  ): Promise<LoginResponseDto | MfaRequiredResponseDto> {
    const { email, password, rememberMe = false } = loginDto;

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
      // Resend verification email
      try {
        // Generate a new token
        const newToken = uuidv4();

        // Store the new token in Redis with expiry
        await this.redisCacheService.storeVerificationToken(
          newToken,
          email,
          this.EMAIL_VERIFICATION_EXPIRY,
        );

        // Update user in database
        user.verificationToken = newToken;
        await this.userRepository.save(user);

        // Send verification email
        await this.sendVerificationEmail(email, newToken);
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
      // Return a temporary token specifically for MFA verification with a special claim
      const mfaToken = this.generateMfaToken(user);

      return {
        message: 'MFA verification required',
        mfaToken,
        isMfaRequired: true,
      };
    }

    // Generate access token
    const accessToken = await this.generateAccessToken(user);

    // Generate refresh token if rememberMe is true
    let refreshToken;
    if (rememberMe) {
      refreshToken = await this.generateRefreshToken(user);
    }

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  // Verify MFA code during login
  async verifyMfaLogin(
    mfaVerifyDto: MfaVerifyDto,
    user: User,
  ): Promise<MfaVerifyResponseDto> {
    const { code, rememberMe = false } = mfaVerifyDto;

    // Check if input is a 6-digit OTP or an 8-character recovery code
    const isOtpFormat = /^\d{6}$/.test(code);
    const isRecoveryCodeFormat = /^[a-zA-Z0-9]{8}$/.test(code);

    let isValid = false;

    if (isOtpFormat) {
      // Verify OTP code
      isValid = authenticator.verify({
        token: code,
        secret: user.mfaSecret || '',
      });
    } else if (isRecoveryCodeFormat && user.recoveryCodes) {
      // Verify recovery code
      const recoveryCodeIndex = user.recoveryCodes.findIndex(
        (rc) => rc === code,
      );

      if (recoveryCodeIndex !== -1) {
        isValid = true;

        // Remove the used recovery code
        user.recoveryCodes.splice(recoveryCodeIndex, 1);
        await this.userRepository.save(user);

        // If all recovery codes are used, generate new ones
        if (user.recoveryCodes.length === 0) {
          this.logger.warn(`User ${user.email} has used all recovery codes`);
        }
      }
    }

    if (!isValid) {
      throw new UnauthorizedException('Invalid authentication code');
    }

    // Generate full access token
    const accessToken = await this.generateAccessToken(user);

    // Generate refresh token only if rememberMe is true
    let refreshToken;
    if (rememberMe) {
      refreshToken = await this.generateRefreshToken(user);
    }

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isMFAEnabled: user.isMFAEnabled,
        imgUrl: user.imageUrl,
        role: user.role as Role,
      },
    };
  }

  // Refresh access token using refresh token
  async refreshToken(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<RefreshTokenResponseDto> {
    const { refreshToken } = refreshTokenDto;

    // First check if token is blacklisted
    const isBlacklisted =
      await this.redisCacheService.isTokenBlacklisted(refreshToken);
    if (isBlacklisted) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Verify refresh token
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret:
          this.configService.get<string>('REFRESH_SECRET_KEY') ||
          this.configService.get<string>('SECRET_KEY'),
      });

      // Find user with this ID
      const user = await this.userRepository.findOneBy({ id: payload.sub });
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Generate new access token
      const accessToken = await this.generateAccessToken(user);

      // Generate new refresh token
      const newRefreshToken = await this.generateRefreshToken(user);

      // Invalidate the old refresh token
      await this.redisCacheService.blacklistToken(
        refreshToken,
        30 * 24 * 60 * 60, // 30 days expiry for blacklist
      );

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(`Failed to refresh token: ${error.message}`);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  // Logout and invalidate both access and refresh tokens
  async logout(user: User): Promise<LogoutResponseDto> {
    try {
      // Invalidate all user tokens in Redis
      await this.redisCacheService.invalidateAllUserTokens(user.id);

      // Also clear refresh token in the database for extra security
      user.refreshToken = undefined;
      await this.userRepository.save(user);

      return {
        message: 'Logged out successfully',
      };
    } catch (error) {
      this.logger.error(`Logout failed: ${error.message}`);
      throw error;
    }
  }

  // Initiate MFA setup by generating QR code
  async generateMfaSecret(user: User): Promise<MfaGenerateResponseDto> {
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
  async enableMfa(
    mfaEnableDto: MfaEnableDto,
    user: User,
  ): Promise<MfaEnableResponseDto> {
    const { code } = mfaEnableDto;

    const foundUser = await this.userRepository.findOneBy({ id: user.id });
    if (!foundUser) {
      throw new NotFoundException('User not found');
    }
    user.mfaSecret = foundUser.mfaSecret;
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
  async disableMfa(
    disableMfaDto: DisableMfaDto,
    user: User,
  ): Promise<MfaDisableResponseDto> {
    const { password } = disableMfaDto;

    // Find user to get the current password hash
    const currentUser = await this.userRepository.findOneBy({ id: user.id });
    if (!currentUser) {
      throw new NotFoundException('User not found');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      password,
      currentUser.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    // Update user to disable MFA
    currentUser.isMFAEnabled = false;
    currentUser.mfaSecret = null;
    currentUser.recoveryCodes = null;
    await this.userRepository.save(currentUser);

    return {
      message: 'MFA disabled successfully',
    };
  }

  // Handle Google OAuth authentication
  async googleLogin(user: any): Promise<OAuthResponseDto> {
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
        isEmailVerified: true,
      });

      await this.userRepository.save(dbUser);
    } else if (!dbUser.googleId) {
      // Link Google account to existing user
      dbUser.googleId = user.googleId;
      dbUser.isEmailVerified = true;
      await this.userRepository.save(dbUser);
    }

    // Generate access token
    const accessToken = await this.generateAccessToken(dbUser);

    // Generate refresh token for social login (assuming we want long sessions for social logins)
    const refreshToken = await this.generateRefreshToken(dbUser);

    return {
      accessToken,
      refreshToken,
      user: {
        id: dbUser.id,
        email: dbUser.email,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        isMFAEnabled: dbUser.isMFAEnabled,
        imgUrl: dbUser.imageUrl,
        role: dbUser.role as Role,
      },
    };
  }

  // Handle GitHub OAuth authentication
  async githubLogin(user: any): Promise<OAuthResponseDto> {
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

    // Generate access token
    const accessToken = await this.generateAccessToken(dbUser);

    // Generate refresh token for social login
    const refreshToken = await this.generateRefreshToken(dbUser);

    return {
      accessToken,
      refreshToken,
      user: {
        id: dbUser.id,
        email: dbUser.email,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        isMFAEnabled: dbUser.isMFAEnabled,
        imgUrl: dbUser.imageUrl,
        role: dbUser.role as Role,
      },
    };
  }

  // Request password reset
  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<ForgotPasswordResponseDto> {
    const { email } = forgotPasswordDto;

    // Check if user exists
    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      // For security reasons, always return success even if email doesn't exist
      return {
        message: 'If your email exists in our system, you will receive a password reset link',
      };
    }

    // Generate a random token
    const token = uuidv4();

    try {
      // Store token in Redis with expiry
      await this.redisCacheService.storePasswordResetToken(
        token,
        email,
        this.PASSWORD_RESET_EXPIRY,
      );

      // Send password reset email
      await this.mailService.sendPasswordResetEmail(
        email,
        token,
        this.PASSWORD_RESET_EXPIRY / 60, // Convert seconds to minutes
      );

      return {
        message: 'Password reset instructions have been sent to your email',
      };
    } catch (error) {
      this.logger.error(`Failed to send password reset email: ${error.message}`);
      throw new InternalServerErrorException('Error sending reset email');
    }
  }

  // Reset password with token
  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<ResetPasswordResponseDto> {
    const { token, password } = resetPasswordDto;

    // Check if token exists in Redis and is valid
    const email =
      await this.redisCacheService.getEmailFromPasswordResetToken(token);

    if (!email) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Find the user
    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Hash the new password
    const hashedPassword = await this.hashPassword(password);

    // Update the user's password
    user.password = hashedPassword;
    await this.userRepository.save(user);

    // Invalidate all existing sessions for this user
    await this.redisCacheService.invalidateAllUserTokens(user.id);

    // Invalidate the password reset token
    await this.redisCacheService.invalidatePasswordResetToken(token);

    return {
      message: 'Password has been reset successfully',
    };
  }

  // Helper method to hash passwords
  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  // Helper method to generate access JWT token and store in Redis
  private async generateAccessToken(user: User): Promise<string> {
    const payload = {
      sub: user.id,
      email: user.email,
      isMfaAuthenticated: true,
    };

    const expiresIn = this.configService.get<string>('EXPIRES_IN') || '1h';
    const expiryInSeconds = this.parseExpiryToSeconds(expiresIn);

    // Create the token
    const token = this.jwtService.sign(payload, { expiresIn });

    // Store token in Redis for tracking and future invalidation
    await this.redisCacheService.storeUserToken(
      user.id,
      'access',
      token,
      expiryInSeconds,
    );

    return token;
  }

  // Helper method to generate refresh token and store in Redis
  private async generateRefreshToken(user: User): Promise<string> {
    const payload = {
      sub: user.id,
      email: user.email,
      type: 'refresh',
    };

    const expiresIn =
      this.configService.get<string>('REFRESH_EXPIRES_IN') || '30d';
    const expiryInSeconds = this.parseExpiryToSeconds(expiresIn);

    // Create refresh token with longer expiry
    const refreshToken = this.jwtService.sign(payload, {
      secret:
        this.configService.get<string>('REFRESH_SECRET_KEY') ||
        this.configService.get<string>('SECRET_KEY'),
      expiresIn,
    });

    // Store refresh token in Redis
    await this.redisCacheService.storeUserToken(
      user.id,
      'refresh',
      refreshToken,
      expiryInSeconds,
    );

    // Also save refresh token to user in database as fallback
    user.refreshToken = refreshToken;
    await this.userRepository.save(user);

    return refreshToken;
  }

  // Helper method to generate limited JWT token for MFA authentication
  private generateMfaToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      isMfaAuthenticated: false,
      isMfaToken: true,
    };

    // Set a shorter expiration time for MFA tokens
    return this.jwtService.sign(payload, {
      expiresIn: '5m', // Short expiration time for security
    });
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

  // Helper function to parse JWT expiry strings to seconds
  private parseExpiryToSeconds(expiry: string): number {
    const match = expiry.match(/^(\d+)([smhdy])$/);
    if (!match) return 3600; // Default 1 hour

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 24 * 60 * 60;
      case 'y':
        return value * 365 * 24 * 60 * 60;
      default:
        return 3600;
    }
  }

  // Méthodes privées pour gérer les cookies JWT
  public setAccessTokenCookie(
    res: Response,
    token: string,
    options?: { shortLived?: boolean },
  ): void {
    // Configuration pour le cookie Access Token
    res.cookie('access_token', token, {
      httpOnly: true, // Non accessible par JavaScript côté client
      secure: this.configService.get('NODE_ENV') !== 'dev', // HTTPS en production
      sameSite: 'strict',
      maxAge: options?.shortLived
        ? 5 * 60 * 1000 // 5 minutes for MFA tokens
        : this.parseExpiryToSeconds(
            this.configService.get<string>('EXPIRES_IN') || '1h',
          ) * 1000,
      path: '/', // Cookie accessible sur toutes les routes
    });
  }

  public setRefreshTokenCookie(res: Response, token: string): void {
    // Configuration pour le cookie Refresh Token
    res.cookie('refresh_token', token, {
      httpOnly: true, // Non accessible par JavaScript côté client
      secure: this.configService.get('NODE_ENV') !== 'dev', // HTTPS en production
      sameSite: 'strict',
      maxAge:
        this.parseExpiryToSeconds(
          this.configService.get<string>('REFRESH_EXPIRES_IN') || '30d',
        ) * 1000,
      path: '/auth', // Cookie accessible sur toutes les routes d'authentification
    });
  }

  public clearAuthCookies(res: Response): void {
    // Suppression des cookies d'authentification
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/auth' });
  }
}
