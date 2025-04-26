import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserRatingDto } from './dto/create-user-rating.dto';
import { UpdateUserRatingDto } from './dto/update-user-rating.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRating } from './entities/user-rating.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserRatingService {

  constructor(
    @InjectRepository(UserRating)
    private userRatingRepository: Repository<UserRating>,
  ) {}

  async addRate(userId: number, bookId: number, rate: number): Promise<UserRating> {
    const newRating = this.userRatingRepository.create({
      user: { id: userId } , 
      book: { id: bookId } ,
      rate,
    });

    return await this.userRatingRepository.save(newRating);
  }

  async updateRate(userId: number, bookId: number, rate: number): Promise<UserRating> {
    const existingRating = await this.userRatingRepository.findOne({
      where: {
        user: { id: userId },
        book: { id: bookId },
      },
      relations: ['user', 'book'],
    });
    if (! existingRating) {
      throw new NotFoundException(`Rating for user ${userId} and book ${bookId} not found.`);
    }
    existingRating.rate = rate;
    return await this.userRatingRepository.save( existingRating); 
  }

  async getRatingForBook(userId: number, bookId: number): Promise<UserRating | null> {
    return this.userRatingRepository.findOne({
       where: {
         user: { id: userId }, 
         book: { id: bookId }, 
       },
      relations: ['user', 'book'],
    });
  }

 
  create(createUserRatingDto: CreateUserRatingDto) {
    return 'This action adds a new userRating';
  }

  findAll() {
    return `This action returns all userRating`;
  }

  findOne(id: number) {
    return `This action returns a #${id} userRating`;
  }

  update(id: number, updateUserRatingDto: UpdateUserRatingDto) {
    return `This action updates a #${id} userRating`;
  }

  remove(id: number) {
    return `This action removes a #${id} userRating`;
  }
}
