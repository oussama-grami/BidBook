import { Comment } from './../../comments/entities/comment.entity';
import { Book } from 'src/books/entities/book.entity';
import { CommonEntity } from '../../Common/Common.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Favorite } from 'src/favorites/entities/favorite.entity';
import { Bid } from 'src/bids/entities/bid.entity';
import { Notification } from 'src/notifications/entities/notification.entity';
import { UserRating } from 'src/user-rating/entities/user-rating.entity';
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

  @OneToMany(() => UserRating, (rating) => rating.user)
  ratings: UserRating[];

  // Relation inverse : un utilisateur peut posséder plusieurs livres
  @OneToMany(() => Book, (book) => book.owner)
  books: Book[];

  // Relation inverse : un utilisateur peut avoir plusieurs favoris
  @OneToMany(() => Favorite, (favorite) => favorite.user, { cascade: true })
  favorites: Favorite[];

  // Relation inverse : un utilisateur peut recevoir plusieurs notifications
  @OneToMany(() => Notification, (notification) => notification.recipient, { cascade: true })
  notifications: Notification[];

  // Relation inverse : un utilisateur peut placer plusieurs enchères
  @OneToMany(() => Bid, (bid) => bid.bidder, { cascade: true })
  bids: Bid[];

  // Relation inverse : un utilisateur peut écrire plusieurs commentaires
  @OneToMany(() => Comment, (comment) => comment.user, { cascade: true })
  comments: Comment[];
}