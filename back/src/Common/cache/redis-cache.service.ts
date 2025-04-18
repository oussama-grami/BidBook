import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisCacheService {
  private readonly redis: Redis;
  private readonly logger = new Logger(RedisCacheService.name);

  constructor(private readonly configService: ConfigService) {
    // Initialize Redis client with fallback to localhost if not configured
    const redisHost = this.configService.get<string>('REDIS_HOST', 'localhost');
    const redisPort = this.configService.get<number>('REDIS_PORT', 6379);

    this.redis = new Redis({
      host: redisHost,
      port: redisPort,
      // Add reconnect logic and error handling
      retryStrategy: (times) => {
        if (times > 3) {
          this.logger.error(
            `Could not connect to Redis after ${times} attempts`,
          );
          return null; // stop trying to reconnect
        }
        return Math.min(times * 100, 3000); // reconnect after x ms
      },
    });

    this.redis.on('error', (error) => {
      this.logger.error(`Redis connection error: ${error.message}`);
    });

    this.redis.on('connect', () => {
      this.logger.log('Successfully connected to Redis');
    });
  }

  // Store token in blacklist with expiry matching the token's expiry time
  async blacklistToken(token: string, expiryInSeconds: number): Promise<void> {
    try {
      await this.redis.set(`bl_${token}`, '1', 'EX', expiryInSeconds);
      this.logger.debug(`Token blacklisted with expiry of ${expiryInSeconds}s`);
    } catch (error) {
      this.logger.error(`Failed to blacklist token: ${error.message}`);
      throw error;
    }
  }

  // Check if token is blacklisted (i.e., has been invalidated)
  async isTokenBlacklisted(token: string): Promise<boolean> {
    try {
      const result = await this.redis.get(`bl_${token}`);
      return result === '1';
    } catch (error) {
      this.logger.error(`Failed to check token blacklist: ${error.message}`);
      // Default to considering token as blacklisted if Redis fails
      return true;
    }
  }

  // Store a token with an associated userId for simplified tracking
  async storeUserToken(
    userId: number,
    tokenType: string,
    token: string,
    expiryInSeconds: number,
  ): Promise<void> {
    try {
      // Store token expiry mapping
      await this.redis.set(
        `${tokenType}_${token}`,
        userId,
        'EX',
        expiryInSeconds,
      );

      // Add to user's token set for easy revocation of all user tokens
      await this.redis.sadd(`user_${tokenType}s:${userId}`, token);

      this.logger.debug(`Stored ${tokenType} token for user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to store user token: ${error.message}`);
      throw error;
    }
  }

  // Invalidate all tokens for a specific user
  async invalidateAllUserTokens(userId: number): Promise<void> {
    try {
      // Get all access tokens for the user
      const accessTokens = await this.redis.smembers(
        `user_access_tokens:${userId}`,
      );
      const refreshTokens = await this.redis.smembers(
        `user_refresh_tokens:${userId}`,
      );

      // Add all tokens to blacklist with standard expiry
      const pipeline = this.redis.pipeline();

      // Blacklist access tokens (typically 15 min - 1 hr lifespan)
      accessTokens.forEach((token) => {
        pipeline.set(`bl_${token}`, '1', 'EX', 3600); // 1 hour expiry for blacklist
      });

      // Blacklist refresh tokens (typically days/weeks lifespan)
      refreshTokens.forEach((token) => {
        pipeline.set(`bl_${token}`, '1', 'EX', 2592000); // 30 days expiry for blacklist
      });

      // Clear the user's token sets
      pipeline.del(`user_access_tokens:${userId}`);
      pipeline.del(`user_refresh_tokens:${userId}`);

      await pipeline.exec();
      this.logger.debug(`Invalidated all tokens for user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to invalidate user tokens: ${error.message}`);
      throw error;
    }
  }

  // Store verification token with expiry date
  async storeVerificationToken(
    token: string,
    email: string,
    expiryInSeconds: number,
  ): Promise<void> {
    try {
      await this.redis.set(`verify_${token}`, email, 'EX', expiryInSeconds);
      this.logger.debug(
        `Stored verification token for ${email} with ${expiryInSeconds}s expiry`,
      );
    } catch (error) {
      this.logger.error(`Failed to store verification token: ${error.message}`);
      throw error;
    }
  }

  // Verify and get email from verification token
  async getEmailFromVerificationToken(token: string): Promise<string | null> {
    try {
      return await this.redis.get(`verify_${token}`);
    } catch (error) {
      this.logger.error(
        `Failed to get email from verification token: ${error.message}`,
      );
      return null;
    }
  }

  // Invalidate verification token after successful verification
  async invalidateVerificationToken(token: string): Promise<void> {
    try {
      await this.redis.del(`verify_${token}`);
      this.logger.debug(`Invalidated verification token ${token}`);
    } catch (error) {
      this.logger.error(
        `Failed to invalidate verification token: ${error.message}`,
      );
    }
  }

  // Store password reset token with expiry date
  async storePasswordResetToken(
    token: string,
    email: string,
    expiryInSeconds: number,
  ): Promise<void> {
    try {
      // Store the token with email mapping
      await this.redis.set(`pwreset_${token}`, email, 'EX', expiryInSeconds);

      // Store mapping of email to token for tracking purposes
      await this.redis.sadd(`email_pwreset_tokens:${email}`, token);

      this.logger.debug(
        `Stored password reset token for ${email} with ${expiryInSeconds}s expiry`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to store password reset token: ${error.message}`,
      );
      throw error;
    }
  }

  // Verify and get email from password reset token
  async getEmailFromPasswordResetToken(token: string): Promise<string | null> {
    try {
      return await this.redis.get(`pwreset_${token}`);
    } catch (error) {
      this.logger.error(
        `Failed to get email from password reset token: ${error.message}`,
      );
      return null;
    }
  }

  // Invalidate password reset token after successful reset
  async invalidatePasswordResetToken(token: string): Promise<void> {
    try {
      // Get the email associated with this token first
      const email = await this.getEmailFromPasswordResetToken(token);

      if (email) {
        // Remove this token from the user's token set
        await this.redis.srem(`email_pwreset_tokens:${email}`, token);
      }

      // Then delete the token itself
      await this.redis.del(`pwreset_${token}`);
      this.logger.debug(`Invalidated password reset token ${token}`);
    } catch (error) {
      this.logger.error(
        `Failed to invalidate password reset token: ${error.message}`,
      );
    }
  }

  // Invalidate all password reset tokens for a specific email
  async invalidateUserPasswordResetTokens(email: string): Promise<void> {
    try {
      // Get all active reset tokens for this email
      const tokens = await this.redis.smembers(`email_pwreset_tokens:${email}`);

      if (tokens && tokens.length > 0) {
        const pipeline = this.redis.pipeline();

        // Delete each token
        tokens.forEach((token) => {
          pipeline.del(`pwreset_${token}`);
        });

        // Execute the pipeline
        await pipeline.exec();

        // Then clear the set of tokens
        await this.redis.del(`email_pwreset_tokens:${email}`);

        this.logger.debug(
          `Invalidated ${tokens.length} password reset tokens for ${email}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to invalidate user password reset tokens: ${error.message}`,
      );
      throw error;
    }
  }

  // Delete a specific key from Redis
  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
      this.logger.debug(`Deleted key: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete key ${key}: ${error.message}`);
      throw error;
    }
  }

  // Generic method to store any value with expiry
  async set(
    key: string,
    value: string,
    expiryInSeconds: number,
  ): Promise<void> {
    try {
      await this.redis.set(key, value, 'EX', expiryInSeconds);
      this.logger.debug(
        `Stored value for key ${key} with ${expiryInSeconds}s expiry`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to store value for key ${key}: ${error.message}`,
      );
      throw error;
    }
  }

  // Generic method to get any stored value
  async get(key: string): Promise<string | null> {
    try {
      return await this.redis.get(key);
    } catch (error) {
      this.logger.error(`Failed to get value for key ${key}: ${error.message}`);
      return null;
    }
  }
}
