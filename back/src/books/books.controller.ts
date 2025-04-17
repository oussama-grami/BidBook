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
  BadRequestException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import {ApiBody, ApiConsumes, ApiTags} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs/promises';
import { plainToClass, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@Controller('books')
@ApiTags('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

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
        return callback(new Error('The file must be a PNG or JPEG image.'), false);
      }
      callback(null, true);
    },
  }),
)
async createBook(
  @UploadedFile() file: Express.Multer.File,
    @Body() bookData: CreateBookDto,
) {
  if (!file) {
    throw new BadRequestException('No file was uploaded.');
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

    throw new BadRequestException('Failed to create book: ' + error.message);
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

  @Patch(':id')
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
          if (file) {
            const allowedMimeTypes = ['image/png', 'image/jpeg'];
            if (!allowedMimeTypes.includes(file.mimetype)) {
              return callback(
                  new Error('The file must be a PNG or JPEG image.'),
                  false,
              );
            }
          }
          callback(null, true);
        },
      }),
  )
  async update(
      @Param('id') id: string,
      @UploadedFile() file: Express.Multer.File,
      @Body() bookData: any,
  ) {
    let filePath: string | undefined = file?.path;

    try {
      const updateBookDto = plainToInstance(UpdateBookDto, bookData);
      const errors = await validate(updateBookDto);

      if (errors.length > 0) {
        const validationErrors = errors.map((error) => {
          const constraints = error.constraints
              ? Object.values(error.constraints)
              : [];
          return `${error.property}: ${constraints.join(', ')}`;
        });
        if (filePath) {
          await fs.unlink(filePath).catch((err) =>
              console.error('Failed to delete uploaded file:', err),
          );
        }
        throw new BadRequestException(validationErrors);
      }

      return this.booksService.update(+id, updateBookDto, filePath);
    } catch (error) {
      if (filePath) {
        await fs.unlink(filePath).catch((err) =>
            console.error('Failed to delete uploaded file:', err),
        );
      }
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to update book: ' + error.message);
    }
  }


  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.booksService.remove(+id);
  }
}
