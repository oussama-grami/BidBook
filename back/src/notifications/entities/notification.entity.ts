import { User } from 'src/auth/entities/user.entity';
import { CommonEntity } from 'src/Common/Common.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
@Entity()
export class Notification extends CommonEntity {
  @Column()
  title: string;

  @Column()
  message: string;

  @Column()
  dateTime: Date;

  @Column({ default: false })
  isRead: boolean;

  @ManyToOne(() => User, (user) => user.notifications, { onDelete: 'CASCADE' })
  @JoinColumn()
  recipient: User;
}
