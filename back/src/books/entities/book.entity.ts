import { Comment } from '../../comments/entities/comment.entity';
import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { CommonEntity } from '../../Common/Common.entity';
import { User } from '../../auth/entities/user.entity';
import { Category } from '../../Enums/category.enum';
import { Language } from '../../Enums/language.enum';
import { Favorite } from 'src/favorites/entities/favorite.entity';
import { Bid } from 'src/bids/entities/bid.entity';
import { UserRating } from 'src/user-rating/entities/user-rating.entity';

@Entity()
export class Book extends CommonEntity {
  @Column()
  title: string;
  @Column()
  author: string;

  @Column()
  editor: string;

  
  @Column({
    type: 'enum',
    enum: Category,
    default: Category.OTHER,
  })
  category: Category;

  @Column({ default: 0 })
  totalPages: number;

  @Column({ default: 0 })
  damagedPages: number;

  @Column({ default: 0 })
  age: number;

  @Column({ default: 1 })
  edition: number;

  @Column({ type: 'float', default: 0 })
  price: number;

  @Column()
  picture: string;
 
  @OneToMany(() => UserRating, (rating) => rating.book)
  ratings: UserRating[];

  // New attribute for bidding status
  @Column({ default: true })
  isBiddingOpen: boolean;

  @Column({
    type: 'enum',
    enum: Language,
    default: Language.ENGLISH,
  })
  language: Language;

  
  @Column({ default: false })
  isSold: boolean;
  

  // Un livre appartient à un utilisateur
  @ManyToOne(() => User, (user) => user.books, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  // Un livre peut avoir plusieurs favoris
  @OneToMany(() => Favorite, (favorite) => favorite.book, { cascade: true })
  favorites: Favorite[];

  // Un livre peut recevoir plusieurs commentaires
  @OneToMany(() => Comment, (comment) => comment.book, { cascade: true })
  comments: Comment[];

  // Un livre peut recevoir plusieurs enchères
  @OneToMany(() => Bid, (bid) => bid.book, { cascade: true })
  bids: Bid[];

  @Column({ default: false })
  isSold: boolean;
}