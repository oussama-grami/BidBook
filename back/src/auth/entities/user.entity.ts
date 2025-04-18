import { CommonEntity } from '../../Common/Common.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Article } from '../../article/entities/article.entity';

@Entity('_user')
export class User extends CommonEntity {
  @Column()
  firstName: string;
  @Column()
  lastName: string;
  @Column()
  email: string;
  @Column()
  password: string;
  @Column()
  imageUrl: string;
  @Column()
  isMFAEnabled: boolean;
  @OneToMany(() => Article, (article) => article.author)
  articles: Article[];
}
