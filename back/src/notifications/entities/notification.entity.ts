import { User } from 'src/auth/entities/user.entity';
import { CommonEntity } from 'src/Common/Common.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
@Entity()
export class Notification extends CommonEntity {
  @Column()
  message: string;
  @Column({ default: false })
  isSent: boolean;

  @ManyToOne(() => User, (user) => user.notifications, { onDelete: 'CASCADE' })
  @JoinColumn()
  recipient: User;
}
