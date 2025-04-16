import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { Book } from './entities/book.entity';
@Injectable()
export class BooksService {
 
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
  ) {}
  
  async create(bookData: CreateBookDto, picturePath: string) {
    let predictedPrice: number;

    try {
      const response = await axios.post('http://localhost:5000/predict', bookData);
      predictedPrice = response.data.prediction;
    } catch (error) {
      throw new InternalServerErrorException('Price prediction service unavailable');
    }

    const bookToSave = this.bookRepository.create({
      ...bookData,
      price: predictedPrice,
      picture: picturePath,
    });

    return await this.bookRepository.save(bookToSave);
  }
 









  findAll() {
    return `This action returns all books`;
  }

  findOne(id: number) {
    return `This action returns a #${id} book`;
  }

  update(id: number, updateBookDto: UpdateBookDto) {
    return `This action updates a #${id} book`;
  }

  remove(id: number) {
    return `This action removes a #${id} book`;
  }
}
