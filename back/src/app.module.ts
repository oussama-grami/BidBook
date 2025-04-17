

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { config } from 'dotenv';
import { GlobalModule } from './Common/global.module';
import { AuthModule } from './auth/auth.module';
import { Book } from './books/entities/book.entity';
import { User } from './auth/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Favorite } from './favorites/entities/favorite.entity';
import { Bid } from './bids/entities/bid.entity';
import { Comment } from './comments/entities/comment.entity';
import { Notification } from './notifications/entities/notification.entity';
import { ConfigModule, ConfigService } from '@nestjs/config'; // Ajout de ConfigService
import { BooksService } from './books/books.service';
import { BooksController } from './books/books.controller';

config({ path: `${process.cwd()}/Config/.env.dev` });

@Module({
  imports: [
    ConfigModule.forRoot({ // Configuration de ConfigModule
      isGlobal: true,
      envFilePath: [
        `${process.cwd()}/Config/.env`,
        `${process.cwd()}/Config/.env.${process.env.NODE_ENV}`,
      ],
    }),
    TypeOrmModule.forRootAsync({ // Configuration de TypeOrmModule
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
    GlobalModule,
    AuthModule,

    TypeOrmModule.forFeature([
      User,
      Book,
      Favorite,
      Comment,
      Bid,
      Notification
    ]),
  ],
  controllers: [AppController,BooksController],
  providers: [AppService,BooksService],
})
export class AppModule {}