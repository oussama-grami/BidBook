import { CommonEntity } from '../../Common/Common.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Bid } from 'src/bid/entities/bid.entity'

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
  @OneToMany(() => Bid, (bid) => bid.bidder)
  bids: Bid[];
}
