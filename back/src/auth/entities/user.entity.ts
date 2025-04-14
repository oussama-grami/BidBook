import { CommonEntity } from '../../Common/Common.entity';
import { Column, Entity } from 'typeorm';

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
}
