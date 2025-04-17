import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

export class UpdateBookDto {
    @IsOptional()
    @IsString({ message: 'Title must be a string' })
    @IsNotEmpty({ message: 'Title cannot be empty' })
    @ApiPropertyOptional()
    title?: string;

    @IsOptional()
    @IsString({ message: 'Author must be a string' })
    @IsNotEmpty({ message: 'Author cannot be empty' })
    @ApiPropertyOptional()
    author?: string;

    @IsOptional()
    @IsEnum(Category, { message: 'Category must be a valid enum value' })
    @ApiPropertyOptional({ enum: Category })
    category?: Category;

    @IsOptional()
    @IsEnum(Language, { message: 'Language must be a valid enum value' })
    @ApiPropertyOptional({ enum: Language })
    language?: Language;

    @IsOptional()
    @IsString({ message: 'Editor must be a string' })
    @IsNotEmpty({ message: 'Editor cannot be empty' })
    @ApiPropertyOptional()
    editor?: string;

    @IsOptional()
    @IsNumber({}, { message: 'Edition must be a number' })
    @Min(0, { message: 'Edition must be at least one' })
    @Type(() => Number)
    @ApiPropertyOptional()
    edition?: number;

    @IsOptional()
    @IsNumber({}, { message: 'Total pages must be a number' })
    @Min(0, { message: 'Total pages cannot be negative' })
    @Type(() => Number)
    @ApiPropertyOptional()
    totalPages?: number;

    @IsOptional()
    @IsNumber({}, { message: 'Damaged pages must be a number' })
    @Min(0, { message: 'Damaged pages cannot be negative' })
    @Type(() => Number)
    @ApiPropertyOptional()
    damagedPages?: number;

    @IsOptional()
    @IsNumber({}, { message: 'Age must be a number' })
    @Min(0, { message: 'Age cannot be negative' })
    @Type(() => Number)
    @ApiPropertyOptional()
    age?: number;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    @ApiPropertyOptional()
    ownerId?: number;

    @IsOptional()
    @ValidateIf(() => false)
    @ApiPropertyOptional({ type: 'string', format: 'binary' })
    pictureFile?: any;
}