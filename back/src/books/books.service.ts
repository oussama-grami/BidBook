import {BadRequestException, Injectable, InternalServerErrorException, NotFoundException} from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { Book } from './entities/book.entity';
import * as fs from 'fs/promises';

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

  async findAll(limit?: number, offset?: number): Promise<Book[]> {
    try {
      console.log(`Finding books with limit: ${limit}, offset: ${offset}`);
      const books = await this.bookRepository.find({
        take: limit,
        skip: offset,
        relations: ['owner'],
      });
      console.log(`Found ${books?.length || 0} books`);
      return books || [];
    } catch (error) {
      console.error('Error in bookService.findAll:', error);
      return [];
    }
  }

  async findOne(id: number): Promise<Book> {
    const book = await this.bookRepository.findOne({
      where: { id },
      relations: ['owner', 'comments', 'bids','favorites'],
    });

    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    return book;
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

    const dataToPredict: Partial<UpdateBookDto> = {};
    if (updateBookDto.title !== undefined) dataToPredict.title = updateBookDto.title;
    if (updateBookDto.author !== undefined) dataToPredict.author = updateBookDto.author;
    if (updateBookDto.category !== undefined) dataToPredict.category = updateBookDto.category;
    if (updateBookDto.language !== undefined) dataToPredict.language = updateBookDto.language;
    if (updateBookDto.editor !== undefined) dataToPredict.editor = updateBookDto.editor;
    if (updateBookDto.edition !== undefined) dataToPredict.edition = updateBookDto.edition;
    if (updateBookDto.totalPages !== undefined) dataToPredict.totalPages = updateBookDto.totalPages;
    if (updateBookDto.damagedPages !== undefined) dataToPredict.damagedPages = updateBookDto.damagedPages;
    if (updateBookDto.age !== undefined) dataToPredict.age = updateBookDto.age;

    let predictedPrice: number;
    try {
      const response = await axios.post(
          'http://localhost:5000/predict',
          { ...book, ...dataToPredict },
      );
      predictedPrice = response.data.prediction;
    } catch (error) {
      throw new InternalServerErrorException(
          'Price prediction service unavailable',
      );
    }

    this.bookRepository.merge(book, updateBookDto);
    book.price = predictedPrice;

    if (newPicturePath) {
      if (book.picture) {
        try {
          await fs.unlink(book.picture);
        } catch (error) {
          console.error('Failed to delete old picture:', error);
        }
      }
      book.picture = newPicturePath;
    }

    return await this.bookRepository.save(book);
  }


  remove(id: number) {
    return `This action removes a #${id} book`;
  }

  async rateBook(bookId: number, userId: number, rating: number): Promise<Book> {
    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be an integer between 1 and 5.');
    }
    const book = await this.bookRepository.findOne({ where: { id: bookId } });

    if (!book) {
      throw new NotFoundException(`Book with ID ${bookId} not found.`);
    }
    const currentTotalRating = (book.rating || 0) * (book.votes || 0); 
    const newVotes = (book.votes || 0) + 1;
    const newTotalRating = currentTotalRating + rating;
    const newAverageRating = newTotalRating / newVotes;
    book.rating = newAverageRating;
    book.votes = newVotes;

    try {
        return await this.bookRepository.save(book);
    } catch (error) {
        console.error('Error saving book rating:', error);
        throw new InternalServerErrorException('Failed to save book rating.');
    }
  }
}
