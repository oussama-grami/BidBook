import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsEnum,
  IsNumber,
  IsNotEmpty,
  Min,
  IsOptional,
  IsInt,
  ValidateIf,
} from 'class-validator';
import { Category } from '../../Enums/category.enum';
import { Language } from '../../Enums/language.enum';

export class CreateBookDto {
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  @ApiProperty()
  title: string;
  @IsString({ message: 'Author must be a string' })
  @IsNotEmpty({ message: 'Author is required' })
  @ApiProperty()
  author: string;

  @IsEnum(Category, { message: 'Category must be a valid enum value' })
  @ApiProperty({ enum: Category })
  category: Category;

  @IsEnum(Language, { message: 'Language must be a valid enum value' })
  @ApiProperty({ enum: Language })
  language: Language;

  @IsString({ message: 'Editor must be a string' })
  @IsNotEmpty({ message: 'Editor is required' })
  @ApiProperty()
  editor: string;


  @IsNumber({}, { message: 'Edition must be a number' })
  @Min(0, { message: 'Edition must be at least one' })
  @ApiProperty()
  @Type(() => Number)
  edition: number;


  @IsNumber({}, { message: 'Total pages must be a number' })
  @Min(0, { message: 'Total pages cannot be negative' })
  @Type(() => Number)
  @ApiProperty()
  totalPages: number;

  @IsNumber({}, { message: 'Damaged pages must be a number' })
  @Min(0, { message: 'Damaged pages cannot be negative' })
  @Type(() => Number)
  @ApiProperty()
  damagedPages: number;

  @IsNumber({}, { message: 'Age must be a number' })
  @Min(0, { message: 'Age cannot be negative' })
  @Type(() => Number)
  @ApiProperty()
  age: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  ownerId?: number;

  @IsOptional()
  @ValidateIf(() => false)
  @ApiProperty({ type: 'string', format: 'binary' })
  pictureFile?: any;
}
