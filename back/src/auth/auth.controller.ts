import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
  Res,
  UnauthorizedException,
  InternalServerErrorException,
  Logger,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { MfaEnableDto } from './dto/mfa-enable.dto';
import { MfaVerifyDto } from './dto/mfa-verify.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { MfaAuthGuard } from './guards/mfa-auth.guard';
import { ConfigService } from '@nestjs/config';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiBearerAuth,
  ApiCookieAuth,
  ApiConsumes,
  ApiResponse,
} from '@nestjs/swagger';
import { FullAuthGuard } from './guards/full-auth.guard';
import { SignUpResponseDto } from './dto/responses/sign-up-response.dto';
import { VerifyEmailResponseDto } from './dto/responses/verify-email-response.dto';
import {
  LoginResponseDto,
  MfaRequiredResponseDto,
} from './dto/responses/login-response.dto';
import { RefreshTokenResponseDto } from './dto/responses/refresh-token-response.dto';
import { LogoutResponseDto } from './dto/responses/logout-response.dto';
import {
  MfaVerifyResponseDto,
  UserDto,
} from './dto/responses/mfa-verify-response.dto';
import { MfaGenerateResponseDto } from './dto/responses/mfa-generate-response.dto';
import { MfaEnableResponseDto } from './dto/responses/mfa-enable-response.dto';
import { MfaDisableResponseDto } from './dto/responses/mfa-disable-response.dto';
import { OAuthResponseDto } from './dto/responses/oauth-response.dto';
import { User } from './entities/user.entity';
import { Response } from 'express';
import { DisableMfaDto } from './dto/disable-mfa.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { RefresResponse } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ForgotPasswordResponseDto } from './dto/responses/forgot-password-response.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResetPasswordResponseDto } from './dto/responses/reset-password-response.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: SignUpDto })
  @ApiCreatedResponse({
    description: 'User has been successfully registered',
    type: SignUpResponseDto,
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('imageUrl', {
      storage: diskStorage({
        destination: './public/uploads/users',
        filename: (req, file, cb) => {
          const name = file.originalname.split('.')[0];
          const ext = file.originalname.split('.')[1];
          cb(null, `${name}-${Date.now()}.${ext}`);
        },
      }),
    }),
  )
  async signUp(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1000000 }),
          new FileTypeValidator({ fileType: 'image/jpeg|image/jpg|image/png' }),
        ],
        fileIsRequired: true,
        exceptionFactory: () => {
          return new BadRequestException(
            'Le fichier est requis et ne doit pas dépasser 1Mo',
          );
        },
      }),
    )
    imageUrl: Express.Multer.File,
    @Body() signUpDto: SignUpDto,
  ): Promise<SignUpResponseDto> {
    try {
      // Ensure filename is properly encoded to handle spaces and special characters
      const encodedFilename = encodeURIComponent(imageUrl.filename);
      signUpDto.imageUrl = `http://localhost:3000/uploads/users/${encodedFilename}`;
      return this.authService.signUp(signUpDto);
    } catch {
      await unlink(join(imageUrl.path));
      throw new BadRequestException(
        "Une erreur est survenue lors de l'inscription. Veuillez réessayer.",
      );
    }
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify user email address' })
  @ApiBody({ type: VerifyEmailDto })
  @ApiOkResponse({
    description: 'Email has been verified successfully',
    type: VerifyEmailResponseDto,
  })
  async verifyEmail(
    @Body() verifyEmailDto: VerifyEmailDto,
  ): Promise<VerifyEmailResponseDto> {
    return this.authService.verifyEmail(verifyEmailDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    description: 'User has been authenticated successfully',
    type: LoginResponseDto,
  })
  @ApiOkResponse({
    description: 'MFA verification required',
    type: MfaRequiredResponseDto,
  })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(loginDto);
    // If MFA is required, store the temporary token in an HTTP-only cookie
    if ('isMfaRequired' in result && result.mfaToken) {
      this.authService.setAccessTokenCookie(res, result.mfaToken, {
        shortLived: true,
      });
      // Create a copy to return in the response (without compromising security)
      const responseCopy = { ...result };
      return responseCopy;
    }

    // For standard connections, set authentication cookies
    // Store the access token in an HTTP-only cookie
    // At this point, we know it's a LoginResponseDto with accessToken
    if ('accessToken' in result && result.accessToken) {
      this.authService.setAccessTokenCookie(res, result.accessToken);
      // Don't include the token in the response
      delete result.accessToken;
    }

    // Store the refresh token in an HTTP-only cookie if available
    if ('refreshToken' in result && result.refreshToken) {
      this.authService.setRefreshTokenCookie(res, result.refreshToken);
      // Don't include the token in the response
      delete result.refreshToken;
    }

    // Return only the user data
    return result;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiCookieAuth('refresh_token')
  @ApiOkResponse({
    description: 'Access token has been refreshed',
    type: RefresResponse,
  })
  async refreshToken(@Req() req, @Res({ passthrough: true }) res: Response) {
    // Get the refresh token from the cookie
    const refreshToken = req.cookies['refresh_token'];
    console.log('Refresh token:', refreshToken);
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const result = await this.authService.refreshToken({ refreshToken });
    if (result.refreshToken) {
      this.authService.setRefreshTokenCookie(res, result.refreshToken);
    }
    // Set new cookies
    this.authService.setAccessTokenCookie(res, result.accessToken);

    // Return a success message (without tokens)
    return { message: 'Token refreshed successfully' };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'User logout' })
  @ApiOkResponse({
    description: 'User has been logged out successfully',
    type: LogoutResponseDto,
  })
  async logout(
    @Req() req,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LogoutResponseDto> {
    // Invalidate tokens in database and Redis
    const result = await this.authService.logout(req.user);

    // Clear cookies
    this.authService.clearAuthCookies(res);

    return result;
  }

  @Post('mfa/verify')
  @UseGuards(MfaAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Verify MFA code during login' })
  @ApiBody({ type: MfaVerifyDto })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'MFA code has been verified successfully',
    type: MfaVerifyResponseDto,
  })
  async verifyMfaToken(
    @Body() mfaVerifyDto: MfaVerifyDto,
    @Req() req,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.verifyMfaLogin(
      mfaVerifyDto,
      req.user,
    );
    // Set authentication cookies
    if (result.refreshToken) {
      this.authService.setRefreshTokenCookie(res, result.refreshToken);
      delete result.refreshToken;
    }

    if (result.accessToken) {
      this.authService.setAccessTokenCookie(res, result.accessToken);
      delete result.accessToken;
    }
    // Return only the user data
    return { user: result.user };
  }

  @Get('mfa/generate')
  @UseGuards(FullAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Generate MFA secret and QR code' })
  @ApiOkResponse({
    description: 'MFA setup information has been generated',
    type: MfaGenerateResponseDto,
  })
  async generateMfaSecret(@Req() req): Promise<MfaGenerateResponseDto> {
    return this.authService.generateMfaSecret(req.user);
  }

  @Post('mfa/enable')
  @UseGuards(FullAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Enable MFA for user account' })
  @ApiBody({ type: MfaEnableDto })
  @ApiOkResponse({
    description: 'MFA has been enabled successfully',
    type: MfaEnableResponseDto,
  })
  async enableMfa(
    @Body() mfaEnableDto: MfaEnableDto,
    @Req() req,
  ): Promise<MfaEnableResponseDto> {
    return this.authService.enableMfa(mfaEnableDto, req.user);
  }

  @Post('mfa/disable')
  @UseGuards(FullAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Disable MFA for user account' })
  @ApiBody({ type: DisableMfaDto })
  @ApiOkResponse({
    description: 'MFA has been disabled successfully',
    type: MfaDisableResponseDto,
  })
  async disableMfa(
    @Body() disableMfaDto: DisableMfaDto,
    @Req() req,
  ): Promise<MfaDisableResponseDto> {
    return this.authService.disableMfa(disableMfaDto, req.user);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Initiate Google OAuth login flow' })
  googleAuth() {
    // The guard redirects to Google OAuth page
    return { msg: 'Google Authentication' };
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Handle Google OAuth callback' })
  @ApiOkResponse({
    description: 'User has been authenticated via Google OAuth',
    type: OAuthResponseDto,
  })
  async googleAuthCallback(@Req() req, @Res() res) {
    await this.handleOAuthCallback(req, res, 'google');
  }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  @ApiOperation({ summary: 'Initiate GitHub OAuth login flow' })
  githubAuth() {
    // The guard redirects to GitHub OAuth page
    return { msg: 'GitHub Authentication' };
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  @ApiOperation({ summary: 'Handle GitHub OAuth callback' })
  @ApiOkResponse({
    description: 'User has been authenticated via GitHub OAuth',
    type: OAuthResponseDto,
  })
  async githubAuthCallback(@Req() req, @Res() res) {
    await this.handleOAuthCallback(req, res, 'github');
  }

  @Get('profile')
  @UseGuards(FullAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Get authenticated user profile' })
  @ApiOkResponse({
    description: 'User profile retrieved successfully',
    type: UserDto,
  })
  getProfile(@Req() req): User {
    return req.user;
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset email' })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent',
    type: ForgotPasswordResponseDto,
  })
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<ForgotPasswordResponseDto> {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({
    status: 200,
    description: 'Password reset successful',
    type: ResetPasswordResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired token',
  })
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<ResetPasswordResponseDto> {
    return this.authService.resetPassword(resetPasswordDto);
  }

  /**
   * Common handler for OAuth callbacks (Google and GitHub)
   */
  private async handleOAuthCallback(req, res, provider: 'google' | 'github') {
    try {
      // Get the frontend URL from config or use a default
      const frontendUrl =
        this.configService.get<string>('FRONTEND_URL') ||
        'http://localhost:4200';

      let result: OAuthResponseDto;

      // Call the appropriate auth service method based on provider
      if (provider === 'google') {
        result = await this.authService.googleLogin(req.user);
      } else if (provider === 'github') {
        result = await this.authService.githubLogin(req.user);
      } else {
        throw new InternalServerErrorException(
          `Unsupported provider: ${provider}`,
        );
      }

      // Set cookies
      if (result.accessToken) {
        this.authService.setAccessTokenCookie(res, result.accessToken);
      }

      if (result.refreshToken) {
        this.authService.setRefreshTokenCookie(res, result.refreshToken);
      }

      // Redirect to the Angular frontend callback page with provider information
      res.redirect(`${frontendUrl}/auth/callback?provider=${provider}`);
    } catch (error) {
      this.logger.error(
        `OAuth authentication failed: ${error.message}`,
        error.stack,
      );

      // Redirect to error page in case of failure
      const frontendUrl =
        this.configService.get<string>('FRONTEND_URL') ||
        'http://localhost:4200';
      res.redirect(
        `${frontendUrl}/auth/callback?error=${encodeURIComponent(error.message || 'Authentication failed')}&provider=${provider}`,
      );
    }
  }
}
