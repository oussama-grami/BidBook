import { User } from 'src/auth/entities/user.entity';
import { Book } from 'src/books/entities/book.entity';
import { CommonEntity } from 'src/Common/Common.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
@Entity()
export class Comment extends CommonEntity {
  @Column()
  content: string;

  @ManyToOne(() => User, (user) => user.comments, { onDelete: 'SET NULL' })
  @JoinColumn()
  user: User;

  @ManyToOne(() => Book, (book) => book.comments, { onDelete: 'CASCADE' })
  @JoinColumn()
  book: Book;
}

