import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

@Injectable()
export class FullAuthGuard extends JwtAuthGuard {
  canActivate(context: ExecutionContext) {
    // We'll call the parent JWT AuthGuard first
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    // If there's an error or no user, throw an exception
    if (err || !user) {
      throw err || new UnauthorizedException();
    }

    // Check if the token is an MFA-only token
    if (user.isMfaToken === true) {
      throw new UnauthorizedException(
        'This endpoint requires full authentication. Please complete MFA verification first.',
      );
    }

    // Return the user information
    return user;
  }
}
