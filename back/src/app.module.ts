import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { config } from 'dotenv';
import { GlobalModule } from './Common/global.module';
import { AuthModule } from './auth/auth.module';

config({ path: `${process.cwd()}/Config/.env` });

@Module({
  imports: [GlobalModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
