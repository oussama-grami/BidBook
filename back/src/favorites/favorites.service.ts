import { Injectable } from '@nestjs/common';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { UpdateFavoriteDto } from './dto/update-favorite.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Favorite } from './entities/favorite.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FavoritesService {

  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
) {}

async addFavorite(userId: number, bookId: number): Promise<Favorite> {
  const favorite = this.favoriteRepository.create({ user: { id: userId }, book: { id: bookId } });
  return await this.favoriteRepository.save(favorite);
}

async removeFavorite(userId: number, bookId: number): Promise<boolean> {
  const result = await this.favoriteRepository.delete({ user: { id: userId }, book: { id: bookId } });
  return result.affected !== null && result.affected !== undefined && result.affected > 0;
}
async getFavoriteCountForBook(bookId: number): Promise<number> {
  return await this.favoriteRepository.count({
    where: {
      book: { id: bookId },
    },
  });
}


  create(createFavoriteDto: CreateFavoriteDto) {
    return 'This action adds a new favorite';
  }

  findAll() {
    return `This action returns all favorites`;
  }

  findOne(id: number) {
    return `This action returns a #${id} favorite`;
  }

  update(id: number, updateFavoriteDto: UpdateFavoriteDto) {
    return `This action updates a #${id} favorite`;
  }

  remove(id: number) {
    return `This action removes a #${id} favorite`;
  }
}
