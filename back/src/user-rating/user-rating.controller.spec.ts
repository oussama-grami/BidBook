import { Test, TestingModule } from '@nestjs/testing';
import { UserRatingController } from './user-rating.controller';
import { UserRatingService } from './user-rating.service';

describe('UserRatingController', () => {
  let controller: UserRatingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserRatingController],
      providers: [UserRatingService],
    }).compile();

    controller = module.get<UserRatingController>(UserRatingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
