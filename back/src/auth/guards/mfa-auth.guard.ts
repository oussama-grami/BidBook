import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class MfaAuthGuard extends AuthGuard('jwt') {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.cookies['access_token'];
    try {
      const payload = this.jwtService.verify(token);

      // Ensure this is actually an MFA token
      if (!payload.isMfaToken) {
        throw new UnauthorizedException(
          'This endpoint requires a specific token for MFA verification',
        );
      }

      // Find the user
      const user = await this.userRepository.findOneBy({ id: payload.sub });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Check if MFA is enabled for the user
      if (!user.isMFAEnabled) {
        throw new UnauthorizedException('MFA is not enabled for this user');
      }

      // Attach user to request
      request.user = user;

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid MFA token');
    }
  }
}
