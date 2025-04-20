import { User } from '../../auth/entities/user.entity';

export class ArticleDto {
  title: string;
  content: string;
  category: string;
  pictureUrl: string;
  author: User;
}
