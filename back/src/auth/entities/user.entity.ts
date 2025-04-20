import { Comment } from '../../comments/entities/comment.entity';
import { Book } from 'src/books/entities/book.entity';
import { CommonEntity } from '../../Common/Common.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Favorite } from 'src/favorites/entities/favorite.entity';
import { Bid } from 'src/bids/entities/bid.entity';
import { Notification } from 'src/notifications/entities/notification.entity';
import { UserRating } from 'src/user-rating/entities/user-rating.entity';
import { Article } from '../../article/entities/article.entity';
import { Role } from '../../Enums/roles.enum';

@Entity('_user')
export class User extends CommonEntity {
  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true, type: 'varchar' })
  verificationToken: string | null;

  @Column({ default: false })
  isMFAEnabled: boolean;
  @OneToMany(() => Article, (article) => article.author)
  articles: Article[];

  @Column({ nullable: true, type: 'varchar' })
  mfaSecret: string | null;

  @Column('simple-array', { nullable: true })
  recoveryCodes: string[] | null;

  @Column({ nullable: true })
  googleId: string;

  @Column({ nullable: true })
  githubId: string;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

  @Column({ nullable: true })
  refreshToken?: string;


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
