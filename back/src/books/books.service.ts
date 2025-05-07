import {Injectable, InternalServerErrorException, NotFoundException} from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { InjectRepository } from '@nestjs/typeorm';
import {In, Repository} from 'typeorm';
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
      owner: bookData.ownerId ? { id: bookData.ownerId } : undefined,
    });
  
    return await this.bookRepository.save(bookToSave);
  }

  async findAll(limit?: number, offset?: number): Promise<Book[]> {
    try {
      console.log(`Finding available books with limit: ${limit}, offset: ${offset}`);
      const books = await this.bookRepository.find({
        where: { isSold: false },
        take: limit,
        skip: offset,
        relations: ['owner', 'comments', 'bids', 'favorites', 'ratings'],
        select: [
          'id',
          'title',
          'author',
          'picture',
          'editor',
          'category',
          'totalPages',
          'damagedPages',
          'age',
          'edition',
          'price',
          'language',
          'createdAt',
          'isSold',
          'isBiddingOpen'
        ],
      });
      console.log(`Found ${books?.length || 0} available books`);
      return books || [];
    } catch (error) {
      console.error('Error in bookService.findAll:', error);
      return [];
    }
  }

  async findOne(id: number): Promise<Book> {
    const book = await this.bookRepository.findOne({
      where: { id },
      relations: ['owner', 'comments', 'bids','favorites','ratings', 'ratings.user', 'favorites.user'],
    });

    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }
    if(book.bids.length==0)
    {
      book.isBiddingOpen=true;
    }

    return book;
  }

  async findMyBooks(ownerId: number, limit?: number, offset?: number): Promise<Book[]> {
    try {
      console.log(`Finding books for owner ID: ${ownerId} with limit: ${limit}, offset: ${offset}`);
      const books = await this.bookRepository.find({
        where: { owner: { id: ownerId } },
        take: limit,
        skip: offset,
        relations: ['owner', 'comments', 'bids', 'favorites', 'ratings'],
        select: [
          'id',
          'title',
          'author',
          'picture',
          'editor',
          'category',
          'totalPages',
          'damagedPages',
          'age',
          'edition',
          'price',
          'language',
          'createdAt',
          'isSold',
        ],
      });
      console.log(`Found ${books?.length || 0} books for owner ID: ${ownerId}`);
      return books || [];
    } catch (error) {
      console.error('Error in bookService.findMyBooks:', error);
      return [];
    }
  }
  async findManyByIds(ids: number[]): Promise<Book[]> {
    return await this.bookRepository.find({
      where: {
        id: In(ids),
      },
      relations: ['owner', 'comments', 'bids', 'favorites', 'ratings'],
      select: [
        'id',
        'title',
        'author',
        'picture',
        'editor',
        'category',
        'totalPages',
        'damagedPages',
        'age',
        'edition',
        'price',
        'language',
        'createdAt',
      ],
    });
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

  async successfulPayment(id: number): Promise<Book> {
    const book = await this.bookRepository.findOne({ where: { id } });
    if (!book) {
        throw new NotFoundException(`Book with ID ${id} not found`);
    }

    book.isSold = true;
    return this.bookRepository.save(book);
  }
}
