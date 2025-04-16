import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { ApiConsumes, ApiBody, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

import * as fs from 'fs/promises';
@Controller('books')
@ApiTags('Books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}
  @Post('/add')
  @ApiConsumes('multipart/form-data')
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
        fileSize: 5 * 1024 * 1024,
      },
      fileFilter: (req, file, callback) => {
        const allowedMimeTypes = ['image/png', 'image/jpeg'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
          return callback(new Error('The file must be a PNG or JPEG image.'), false);
        }
        callback(null, true);
      },
    })
  )
  async createBook(
    @UploadedFile() file: Express.Multer.File,
    @Body() bookData: CreateBookDto,
  ) {
    if (!file) {
      throw new BadRequestException('No file was uploaded.');
    }
  
    try {
      return await this.booksService.create(bookData, file.path);
    } catch (error) {
      if (file?.path) {
        try {
          await fs.unlink(file.path);
        } catch (fsError) {
          console.error('Failed to delete uploaded file:', fsError);
        }
      }
      throw error;
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
  update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
    return this.booksService.update(+id, updateBookDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.booksService.remove(+id);
  }
}