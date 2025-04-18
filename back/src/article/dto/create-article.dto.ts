import { IsNotEmpty } from 'class-validator';

export class CreateArticleDto {
  @IsNotEmpty()
  title: string;
  @IsNotEmpty()
  content: string;
  @IsNotEmpty()
  category: string;
  @IsNotEmpty()
  pictureUrl: string;
  @IsNotEmpty()
  authorId: number;
}
