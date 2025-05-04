import { User } from 'src/auth/entities/user.entity';
import { Book } from 'src/books/entities/book.entity';
import { CommonEntity } from 'src/Common/Common.entity';
import { Entity, ManyToOne, JoinColumn } from 'typeorm';
@Entity()
export class Favorite extends CommonEntity {
  @ManyToOne(() => User, (user) => user.favorites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Book, (book) => book.favorites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bookId' })
  book: Book;
}

