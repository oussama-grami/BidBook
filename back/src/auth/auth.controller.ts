import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
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
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('mfa/verify')
  @UseGuards(MfaAuthGuard)
  @HttpCode(HttpStatus.OK)
  async verifyMfaToken(@Body() mfaVerifyDto: MfaVerifyDto, @Req() req) {
    return this.authService.verifyMfaLogin(mfaVerifyDto, req.user);
  }

  @Get('mfa/generate')
  @UseGuards(JwtAuthGuard)
  async generateMfaSecret(@Req() req) {
    return this.authService.generateMfaSecret(req.user);
  }

  @Post('mfa/enable')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async enableMfa(@Body() mfaEnableDto: MfaEnableDto, @Req() req) {
    return this.authService.enableMfa(mfaEnableDto, req.user);
  }

  @Post('mfa/disable')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async disableMfa(@Req() req) {
    return this.authService.disableMfa(req.user);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {
    // This route initiates Google OAuth flow
    // The guard handles the authentication
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req) {
    return this.authService.googleLogin(req.user);
  }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  githubAuth() {
    // This route initiates GitHub OAuth flow
    // The guard handles the authentication
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubAuthCallback(@Req() req) {
    return this.authService.githubLogin(req.user);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getProfile(@Req() req) {
    return req.user;
  }
}
