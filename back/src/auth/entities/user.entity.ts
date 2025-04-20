import { CommonEntity } from '../../Common/Common.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Article } from '../../article/entities/article.entity';
import { Column, Entity } from 'typeorm';
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

}
