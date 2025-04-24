import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  BadRequestException, ParseIntPipe,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs/promises';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import axios from 'axios';

@Controller('books')
@ApiTags('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post('/predict')
  async predictPrice(@Body() bookData: CreateBookDto) {
    try {
      const response = await axios.post('http://localhost:5000/predict', {
        title: bookData.title,
        author: bookData.author,
        category: bookData.category,
        language: bookData.language,
        editor: bookData.editor,
        edition: bookData.edition,
        totalPages: bookData.totalPages,
        damagedPages: bookData.damagedPages,
        age: bookData.age,
      });

      return { predictedPrice: response.data.prediction };
    } catch (error) {
      throw new BadRequestException('Failed to get predicted price from model.');
    }
  }

  @Post('/add')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        author: { type: 'string' },
        category: { type: 'string' },
        language: { type: 'string' },
        editor: { type: 'string' },
        edition: { type: 'string' },
        totalPages: { type: 'number' },
        damagedPages: { type: 'number' },
        age: { type: 'number' },
        ownerId: { type: 'number' },
        price: { type: 'number' },
        pictureFile: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('pictureFile', {
      storage: diskStorage({
        destination: './public/upload/book',
        filename: (req, file, callback) => {
          const ext = extname(file.originalname).toLowerCase();
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, `book-${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB
      },
      fileFilter: (req, file, callback) => {
        const allowedMimeTypes = ['image/png', 'image/jpeg'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
          return callback(new Error('Only PNG and JPEG images are allowed.'), false);
        }
        callback(null, true);
      },
    }),
  )
  async createBook(
    @UploadedFile() file: Express.Multer.File,
    @Body() bookData: any,
  ) {
    if (!file) {
      throw new BadRequestException('No image file was uploaded.');
    }

    let filePath = file.path;

    try {
      const bookDto = plainToInstance(CreateBookDto, bookData);
      const errors = await validate(bookDto);

      if (errors.length > 0) {
        const validationErrors = errors.map(error => {
          const constraints = error.constraints ? Object.values(error.constraints) : [];
          return `${error.property}: ${constraints.join(', ')}`;
        });

        throw new BadRequestException(validationErrors);
      }


      return await this.booksService.create(bookDto, filePath);
    } catch (error) {
      if (filePath) {
        await fs.unlink(filePath).catch(err =>
          console.error('Failed to delete uploaded file:', err),
        );
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException('An error occurred while creating the book: ' + error.message);
    }
  }

  @Get()
  findAll() {
    return this.booksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.booksService.findOne(+id);
  }

  @Patch('/update/:id')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', nullable: true },
        author: { type: 'string', nullable: true },
        category: { type: 'string', nullable: true },
        language: { type: 'string', nullable: true },
        editor: { type: 'string', nullable: true },
        edition: { type: 'string', nullable: true },
        totalPages: { type: 'number', nullable: true },
        damagedPages: { type: 'number', nullable: true },
        age: { type: 'number', nullable: true },
        ownerId: { type: 'number', nullable: true },
        pictureFile: {
          type: 'string',
          format: 'binary',
          nullable: true,
        },
      },
    },
  })
  @UseInterceptors(
      FileInterceptor('pictureFile', {
        storage: diskStorage({
          destination: './public/upload/book',
          filename: (req, file, callback) => {
            const ext = extname(file.originalname).toLowerCase();
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            callback(null, `book-${uniqueSuffix}${ext}`);
          },
        }),
        limits: {
          fileSize: 5 * 1024 * 1024, // 5 MB
        },
        fileFilter: (req, file, callback) => {
          if (file) {
            const allowedMimeTypes = ['image/png', 'image/jpeg'];
            if (!allowedMimeTypes.includes(file.mimetype)) {
              return callback(
                  new Error('Only PNG and JPEG images are allowed.'),
                  false,
              );
            }
          }
          callback(null, true);
        },
      }),
  )
  async updateBook(
      @Param('id', ParseIntPipe) id: number,
      @UploadedFile() file: Express.Multer.File,
      @Body() bookData: any,
  ) {
    let newPicturePath: string | undefined;
    if (file) {
      newPicturePath = file.path;
    }

    try {
      const updateBookDto = plainToInstance(UpdateBookDto, bookData);
      const errors = await validate(updateBookDto);

      if (errors.length > 0) {
        const validationErrors = errors.map(error => {
          const constraints = error.constraints
              ? Object.values(error.constraints)
              : [];
          return `${error.property}: ${constraints.join(', ')}`;
        });
        throw new BadRequestException(validationErrors);
      }

      return await this.booksService.update(id, updateBookDto, newPicturePath);
    } catch (error) {
      if (newPicturePath) {
        await fs
            .unlink(newPicturePath)
            .catch(err =>
                console.error('Failed to delete newly uploaded file:', err),
            );
      }
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
          `An error occurred while updating the book with ID ${id}: ${error.message}`,
      );
    }
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.booksService.remove(+id);
  }

  @Patch('/successfulpayment/:id')
  async successfulPayment(@Param('id') id: string) {
    return this.booksService.successfulPayment(+id);
  }
}
