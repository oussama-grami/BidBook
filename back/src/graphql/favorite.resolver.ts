import { Resolver, Mutation, Args, Int, Subscription, Context } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { FavoritesService } from "../favorites/favorites.service";
import { BooksService } from "../books/books.service";
import { Favorite, Book } from '../graphql';
import { InternalServerErrorException, NotFoundException, UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/guards/gql.guard';

const pubSub = new PubSub();
const BOOK_FAVORITES_UPDATED_EVENT = 'bookFavoritesUpdated';

@Resolver('Favorite')
export class FavoritesResolver {
  constructor(
      private readonly favoritesService: FavoritesService,
      private readonly booksService: BooksService,
  ) {}

 // Mutation addFavorite
@UseGuards(GqlAuthGuard)
@Mutation('addFavorite')
async addFavorite(
    @Args('bookId', { type: () => Int }) bookId: number,
    @Context() context: any
): Promise<Favorite> {
    try {
        const user = context.req.user;

        if (!user) {
            throw new InternalServerErrorException('Informations utilisateur non disponibles après authentification.');
        }

        const userId = user.id;

        const favorite = await this.favoritesService.addFavorite(userId, bookId);
        const updatedBook = await this.booksService.findOne(bookId);

        if (!updatedBook) {
            throw new NotFoundException(`Book with ID ${bookId} not found after adding favorite.`);
        }

        console.log(`Publishing "${BOOK_FAVORITES_UPDATED_EVENT}" for bookId ${bookId} after adding favorite.`);
        await pubSub.publish(BOOK_FAVORITES_UPDATED_EVENT, {
            [BOOK_FAVORITES_UPDATED_EVENT]: updatedBook,
        });

        return favorite;
    } catch (error) {
        console.error('Error in addFavorite mutation:', error);
        if (error instanceof NotFoundException) {
            throw error;
        }
        throw new InternalServerErrorException('Failed to add favorite');
    }
}

// Mutation removeFavorite
@UseGuards(GqlAuthGuard)
@Mutation('removeFavorite')
async removeFavorite(
    @Args('bookId', { type: () => Int }) bookId: number,
    @Context() context: any
): Promise<boolean> {
        
    try {
        const user = context.req.user;

        if (!user) {
            throw new InternalServerErrorException('Informations utilisateur non disponibles après authentification.');
        }

        const userId = user.id;

        const success = await this.favoritesService.removeFavorite(userId, bookId);

        if (success) {
            const updatedBook = await this.booksService.findOne(bookId);

            if (!updatedBook) {
                console.warn(`Book with ID ${bookId} not found after removing favorite. Cannot publish update.`);
            } else {
                console.log(`Publishing "${BOOK_FAVORITES_UPDATED_EVENT}" after removing favorite for bookId ${bookId}`);
                await pubSub.publish(BOOK_FAVORITES_UPDATED_EVENT, {
                    [BOOK_FAVORITES_UPDATED_EVENT]: updatedBook,
                });
            }
        }

        return success;
    } catch (error) {
        console.error('Error in removeFavorite mutation:', error);
        throw new InternalServerErrorException('Failed to remove favorite');
    }
}

  @Subscription(() => Book, {
    filter: (payload, variables) => {
      const updatedBook = payload[BOOK_FAVORITES_UPDATED_EVENT];
      const requestedBookId = variables.bookId;
      const updatedBookId = updatedBook?.id;

      console.log(`Subscription filter "${BOOK_FAVORITES_UPDATED_EVENT}": payload bookId=${updatedBookId}, requested bookId=${requestedBookId}`);
      return updatedBookId != null && updatedBookId === requestedBookId;
    },
  })
  bookFavoritesUpdated(
      @Args('bookId', { type: () => Int }) bookId: number,
  ): AsyncIterator<Book> {
    console.log(`Subscription "${BOOK_FAVORITES_UPDATED_EVENT}" established for bookId ${bookId}.`);
    return pubSub.asyncIterableIterator(BOOK_FAVORITES_UPDATED_EVENT);
  }
}
