import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { RedisCacheService } from '../../Common/cache/redis-cache.service';
import { Request } from 'express';
import { Role } from 'src/Enums/roles.enum';

// Fonction personnalisée pour extraire le token JWT des cookies
const extractJWTFromCookies = (req: Request): string | null => {
  if (req.cookies && req.cookies.access_token) {
    return req.cookies.access_token;
  }

  // Fallback vers la méthode traditionnelle en cas de besoin (par exemple pour les appels API directs)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.split(' ')[0] === 'Bearer') {
    return authHeader.split(' ')[1];
  }

  return null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private redisCacheService: RedisCacheService,
  ) {
    super({
      jwtFromRequest: extractJWTFromCookies, // Utilise notre fonction personnalisée
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('SECRET_KEY'),
      passReqToCallback: true, // Pass request object to validate method
    });
  }

  async validate(req: Request, payload: any) {
    // Extraire le token brut depuis les cookies ou l'en-tête
    const token =
      req.cookies?.access_token || req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('Invalid token');
    }

    try {
      // Vérifier si le token est blacklisté dans Redis
      const isBlacklisted =
        await this.redisCacheService.isTokenBlacklisted(token);

      if (isBlacklisted) {
        this.logger.warn(
          `Attempt to use blacklisted token for user ${payload.sub}`,
        );
        throw new UnauthorizedException('Token has been invalidated');
      }

      // Trouver l'utilisateur
      const user = await this.userRepository.findOneBy({ id: payload.sub });
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Vérifier si c'est un token MFA
      if (payload.isMfaToken === true && payload.isMfaAuthenticated === false) {
        // Si c'est un token MFA, inclure seulement les informations minimales nécessaires
        return {
          id: user.id,
          email: user.email,
          isMfaToken: true,
          isMfaAuthenticated: false,
        };
      }

      // Vérifier si MFA est activé mais pas authentifié
      if (user.isMFAEnabled && !payload.isMfaAuthenticated) {
        throw new UnauthorizedException('MFA authentication required');
      }

      // Retourner l'utilisateur complet pour l'authentification par token normale
      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role as Role,
        isMFAEnabled: user.isMFAEnabled,
        imgUrl: user.imageUrl,
      };
    } catch (error) {
      this.logger.error(`JWT validation error: ${error.message}`);
      throw new UnauthorizedException(error.message || 'Authentication failed');
    }
  }
}
