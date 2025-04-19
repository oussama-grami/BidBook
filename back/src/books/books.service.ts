import {Injectable, InternalServerErrorException, NotFoundException} from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { Book } from './entities/book.entity';
import * as fs from "node:fs";

@Injectable()
export class BooksService {
 
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
   
  ) {}
   
  async create(bookData: CreateBookDto, picturePath: string) {
    const bookToSave = this.bookRepository.create({
      title: bookData.title,
      author: bookData.author,
      category: bookData.category,
      language: bookData.language,
      editor: bookData.editor,
      edition: bookData.edition,
      totalPages: bookData.totalPages,
      damagedPages: bookData.damagedPages,
      age: bookData.age,
      price: bookData.price,
      picture: picturePath,
      rating: 0,
      votes: 0,
      owner: bookData.ownerId ? { id: bookData.ownerId } : undefined,
    });
  
    return await this.bookRepository.save(bookToSave);
  }
  
  findAll() {
    return `This action returns all books`;
  }

  findOne(id: number) {
    return `This action returns a #${id} book`;
  }

  async update(
      id: number,
      updateBookDto: UpdateBookDto,
      newPicturePath?: string,
  ) {
    const book = await this.bookRepository.findOneBy({ id });
    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    const dataToPredict = {
      title: updateBookDto.title !== undefined ? updateBookDto.title : book.title,
      author: updateBookDto.author !== undefined ? updateBookDto.author : book.author,
      category: updateBookDto.category !== undefined ? updateBookDto.category : book.category,
      language: updateBookDto.language !== undefined ? updateBookDto.language : book.language,
      editor: updateBookDto.editor !== undefined ? updateBookDto.editor : book.editor,
      edition: updateBookDto.edition !== undefined ? updateBookDto.edition : book.edition,
      totalPages: updateBookDto.totalPages !== undefined ? updateBookDto.totalPages : book.totalPages,
      damagedPages:
          updateBookDto.damagedPages !== undefined
              ? updateBookDto.damagedPages
              : book.damagedPages,
      age: updateBookDto.age !== undefined ? updateBookDto.age : book.age,
    };

    let predictedPrice: number;
    try {
      const response = await axios.post(
          'http://localhost:5000/predict',
          dataToPredict,
      );
      predictedPrice = response.data.prediction;
    } catch (error) {
      throw new InternalServerErrorException(
          'Price prediction service unavailable',
      );
    }


    if (newPicturePath) {
      if (book.picture) {
        try {
          await fs.promises.unlink(book.picture);
        } catch (error) {
          console.error('Failed to delete old picture:', error);

        }
      }
      book.picture = newPicturePath;
    }


    this.bookRepository.merge(book, { ...updateBookDto, price: predictedPrice });
    return await this.bookRepository.save(book);
  }


  remove(id: number) {
    return `This action removes a #${id} book`;
  }
}
