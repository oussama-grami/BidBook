import { Module } from '@nestjs/common';
import { UserRatingService } from './user-rating.service';
import { UserRatingController } from './user-rating.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRating } from './entities/user-rating.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserRating])],
  controllers: [UserRatingController],
  providers: [UserRatingService],
  exports: [UserRatingService],
})
export class UserRatingModule {}
