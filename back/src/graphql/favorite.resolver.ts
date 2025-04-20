import { Resolver, Mutation, Args, Int} from '@nestjs/graphql';
import {FavoritesService} from "../favorites/favorites.service";
import { Favorite} from '../graphql';
import { InternalServerErrorException } from '@nestjs/common';

@Resolver('Favorite')
export class FavoritesResolver {
  constructor(
    private readonly favoritesService: FavoritesService,
  ) {}

  @Mutation('addFavorite')
  async addFavorite(
    @Args('userId', { type: () => Int }) userId: number,
    @Args('bookId', { type: () => Int }) bookId: number,
  ): Promise<Favorite> {
    try {
      return await this.favoritesService.addFavorite(userId, bookId);
    } catch (error) {
      console.error('Error in addFavorite mutation:', error);
      throw new InternalServerErrorException('Failed to add favorite');
    }
  }

  @Mutation('removeFavorite')
  async removeFavorite(
    @Args('userId', { type: () => Int }) userId: number,
    @Args('bookId', { type: () => Int }) bookId: number,
  ): Promise<boolean> {
    try {
      return await this.favoritesService.removeFavorite(userId, bookId);
    } catch (error) {
      console.error('Error in removeFavorite mutation:', error);
      throw new InternalServerErrorException('Failed to remove favorite');
    }
  }

  
  }

