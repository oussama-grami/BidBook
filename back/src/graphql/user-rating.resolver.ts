import { Resolver, Mutation, Args, Int, Float, Query, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { UserRatingService } from "../user-rating/user-rating.service";
import { UserRating } from "../user-rating/entities/user-rating.entity";
import { BooksService } from "../books/books.service";
import { Book } from '../graphql';

const pubSub = new PubSub();
const BOOK_RATING_UPDATED_EVENT = 'bookRatingUpdated';

@Resolver()
export class RatingsResolver {
  constructor(
      private readonly ratingsService: UserRatingService,
      private readonly booksService: BooksService,
  ) {}

  @Mutation('addRate')
  async addRate(
      @Args('userId', { type: () => Int }) userId: number,
      @Args('bookId', { type: () => Int }) bookId: number,
      @Args('rate', { type: () => Float }) rate: number,
  ): Promise<UserRating> {
    try {
      if (rate < 0 || rate > 5) {
        throw new Error('Rate must be between 0 and 5.');
      }
      const newUserRating = await this.ratingsService.addRate(userId, bookId, rate);
      const updatedBook = await this.booksService.findOne(bookId);
      if (updatedBook) {
        pubSub.publish(BOOK_RATING_UPDATED_EVENT, { bookRatingUpdated: updatedBook });
      }
      return newUserRating;
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
      const updatedUserRating = await this.ratingsService.updateRate(userId, bookId, rate);
      const updatedBook = await this.booksService.findOne(bookId);
      if (updatedBook) {
        pubSub.publish(BOOK_RATING_UPDATED_EVENT, { bookRatingUpdated: updatedBook });
      }
      return updatedUserRating;
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

  @Subscription(() => Book, {
    filter: (payload, variables) => payload.bookRatingUpdated.id === variables.bookId,
  })
  bookRatingUpdated(
      @Args('bookId', { type: () => Int }) bookId: number,
  ): AsyncIterator<Book> {
    return pubSub.asyncIterableIterator(BOOK_RATING_UPDATED_EVENT);
  }
}