import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsEnum,
  IsNumber,
  IsBoolean,
  Min,
  IsNotEmpty,
  Length,
  Matches,
} from 'class-validator';
import { Category } from '../../Enums/category.enum';
import { Language } from '../../Enums/language.enum';
import { State } from '../../Enums/state.enum';

export class CreateBookDto {
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  @ApiProperty()
  title: string;

  @IsString({ message: 'Author must be a string' })
  @IsNotEmpty({ message: 'Author is required' })
  @ApiProperty()
  author: string;

  @IsString({ message: 'Editor must be a string' })
  @IsNotEmpty({ message: 'Editor is required' })
  @ApiProperty()
  editor: string;

  @IsEnum(Category, { message: 'Category must be a valid enum value' })
  @ApiProperty({ enum: Category })
  category: Category;

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

  @IsString({ message: 'Edition must be a string' })
  @Length(4, 4, { message: 'Edition must be a 4-digit year' })
  @Matches(/^\d{4}$/, { message: 'Edition must be a valid year (e.g., 2021)' })
  @ApiProperty()
  edition: string;

  @IsEnum(Language, { message: 'Language must be a valid enum value' })
  @ApiProperty({ enum: Language })
  language: Language;

  @IsEnum(State, { message: 'State must be a valid enum value' })
  @ApiProperty({ enum: State })
  state: State;

  @IsBoolean({ message: 'Original must be a boolean' })
  @Type(() => Boolean)
  @ApiProperty()
  original: boolean;

  @IsBoolean({ message: 'Dedication must be a boolean' })
  @Type(() => Boolean)
  @ApiProperty()
  dedication: boolean;

  @IsNumber({}, { message: 'Number of copies must be a number' })
  @Min(1, { message: 'Number of copies must be at least 1' })
  @Type(() => Number)
  @ApiProperty()
  numberOfCopies: number;

  @IsBoolean({ message: 'Leather binding must be a boolean' })
  @Type(() => Boolean)
  @ApiProperty()
  leatherBinding: boolean;
  
}