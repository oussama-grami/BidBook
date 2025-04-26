import { Resolver, Mutation, Args, Int, Float, Query, Subscription, Context } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { InternalServerErrorException, NotFoundException, UseGuards } from '@nestjs/common';
import { UserRatingService } from "../user-rating/user-rating.service";
import { UserRating } from "../user-rating/entities/user-rating.entity";
import { BooksService } from "../books/books.service";
import { Book } from '../graphql';
import { GqlAuthGuard } from 'src/auth/guards/gql.guard';

const pubSub = new PubSub();
const BOOK_RATING_UPDATED_EVENT = 'bookRatingUpdated';

@Resolver()
export class RatingsResolver {
  constructor(
      private readonly ratingsService: UserRatingService,
      private readonly booksService: BooksService,
  ) {}

@UseGuards(GqlAuthGuard)
@Mutation('addRate')
async addRate(
    @Args('bookId', { type: () => Int }) bookId: number,
    @Args('rate', { type: () => Float }) rate: number,
    @Context() context: any
): Promise<UserRating> {
    try {
        const user = context.req.user;

        if (!user) {
            throw new InternalServerErrorException('Informations utilisateur non disponibles après authentification.');
        }

        const userId = user.id;

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

        if (error.message === 'Rate must be between 0 and 5.') {
            throw error;
        }
        throw new InternalServerErrorException('Failed to add rating.');
    }
}

@UseGuards(GqlAuthGuard)
@Mutation('updateRate')
async updateRate(
    @Args('bookId', { type: () => Int }) bookId: number,
    @Args('rate', { type: () => Float }) rate: number,
    @Context() context: any
): Promise<UserRating> {
    try {
        const user = context.req.user;

        if (!user) {
             throw new InternalServerErrorException('Informations utilisateur non disponibles après authentification.');
        }

        const userId = user.id;

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

        if (error.message === 'Rate must be between 0 and 5.') {
             throw error;
        }
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