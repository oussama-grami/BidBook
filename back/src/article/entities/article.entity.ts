import { Column, Entity, ManyToOne } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { CommonEntity } from '../../Common/Common.entity';
import { CategoryEnum } from '../enums/Category.enum';

@Entity()
export class Article extends CommonEntity {
  @Column()
  title: string;
  @Column()
  content: string;
  @Column({
    type: 'enum',
    enum: CategoryEnum,
    default: CategoryEnum.DIVERS,
  })
  category: string;
  @Column()
  pictureUrl: string;
  @ManyToOne(() => User, (author) => author.articles, {
    onDelete: 'CASCADE',
    cascade: ['insert'],
  })
  author: User;
}
