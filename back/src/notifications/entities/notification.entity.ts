import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import {NotificationType} from "../../Enums/notification-type.enum";


@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column()
  message: string;

  @Column({ type: 'json', nullable: true })
  data: any;

  @Column({ default: false })
  read: boolean;

  @CreateDateColumn()
  createdAt: Date;
}