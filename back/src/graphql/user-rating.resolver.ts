
import { Resolver, Mutation, Args, Int, Float, Query } from '@nestjs/graphql';

import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { UserRatingService } from 'src/user-rating/user-rating.service';
import { UserRating } from 'src/user-rating/entities/user-rating.entity';


@Resolver()
export class RatingsResolver {
  constructor(
    private readonly ratingsService: UserRatingService,
  ) {}

  @Mutation('addRate') 
  async addRate(
    @Args('userId', { type: () => Int }) userId: number,
    @Args('bookId', { type: () => Int }) bookId: number,
    @Args('rate', { type: () =>Float}) rate: number,
  ): Promise<UserRating> {
    try {
      if (rate < 0 || rate > 5) { 
         throw new Error('Rate must be between 0 and 5.');
      }
      return await this.ratingsService.addRate(userId, bookId, rate);

    } catch (error) {
      console.error('Error in addRate mutation:', error);
      throw new InternalServerErrorException('Failed to add rating.');
    }
  }

  @Mutation('updateRate') 
  async updateRate(
    @Args('userId', { type: () => Int }) userId: number,
    @Args('bookId', { type: () => Int }) bookId: number,
    @Args('rate', { type: () => Float }) rate: number,
  ): Promise<UserRating> {
    try {
      if (rate < 0 || rate > 5) { 
         throw new Error('Rate must be between 0 and 5.');
      }
      return await this.ratingsService.updateRate(userId, bookId, rate);

    } catch (error) {
      console.error('Error in updateRate mutation:', error);
      if (error instanceof NotFoundException) {
          throw error;
      }
      throw new InternalServerErrorException('Failed to update rating.');
    }
  }


  @Query('userBookRating') 
  async userBookRating(
    @Args('userId', { type: () => Int }) userId: number,
    @Args('bookId', { type: () => Int }) bookId: number,
  ): Promise<UserRating | null> { 
    try {
      return await this.ratingsService.getRatingForBook(userId, bookId);
    } catch (error) {
      console.error('Error fetching userBookRating:', error);

      throw new InternalServerErrorException('Failed to fetch the rating.');
    }
  }
 
}