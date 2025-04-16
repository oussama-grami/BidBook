import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { config } from 'dotenv';
import { GlobalModule } from './Common/global.module';
import { AuthModule } from './auth/auth.module';
import { TestMiddlewareMiddleware } from './test-middleware/test-middleware.middleware';

config({ path: `${process.cwd()}/Config/.env` });

@Module({
  imports: [GlobalModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer.apply(TestMiddlewareMiddleware).forRoutes('*');
  }
}
