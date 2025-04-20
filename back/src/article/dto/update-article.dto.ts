import { IsOptional } from 'class-validator';

export class UpdateArticleDto {
  @IsOptional()
  title: string;
  @IsOptional()
  content: string;
  @IsOptional()
  category: string;
  @IsOptional()
  pictureUrl: string;
}
