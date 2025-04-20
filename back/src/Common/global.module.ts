import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from 'dotenv';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { MailService } from './Emailing/mail.service';
import { RedisCacheModule } from './cache/redis-cache.module';

config({ path: `${process.cwd()}/Config/.env` });

@Global()
@Module({
  imports: [
    /*JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          global: true,
          secret: configService.get<string>('SECRET_KEY'),
          signOptions: {
            expiresIn: configService.get<string>('EXPIRES_IN'),
          },
          verifyOptions: {
            ignoreExpiration: false,
            maxAge: configService.get<string>('EXPIRES_IN'),
          },
        };
      },
    }),*/
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        `${process.cwd()}/Config/.env`,
        `${process.cwd()}/Config/.env.${process.env.NODE_ENV}`,
      ],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'mysql',
          host: configService.get('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          username: configService.get<string>('DB_USER'),
          password: configService.get<string>('DB_PASS'),
          database: configService.get<string>('DB_NAME'),
          autoLoadEntities: true,
          synchronize: configService.get<string>('NODE_ENV') === 'dev',
          logging: true,
        };
      },
    }),
    MailerModule.forRootAsync({
      inject: [ConfigService],
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('EMAIL_HOST'),
          port: configService.get<number>('EMAIL_PORT'),
          secure: false,
          auth: {
            user: configService.get<string>('EMAIL_USERNAME'),
            pass: configService.get<string>('EMAIL_PASSWORD'),
          },
        },
        defaults: {
          from: '"No Reply" <noreply@booksproject.com>',
        },
        template: {
          dir: join(__dirname, 'Emailing', 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
    RedisCacheModule,
  ],
  exports: [TypeOrmModule, ConfigModule, MailService, RedisCacheModule],
  providers: [MailService],
})
export class GlobalModule {}
