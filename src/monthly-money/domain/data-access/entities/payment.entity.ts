import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../../../account-service/domain/data-access/entities/user.entity';

@Entity({
  name: 'payments',
})
export class Payment {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({
    name: 'amount',
    nullable: false,
    type: 'int',
  })
  amount: number;

  @Column({
    name: 'paid_at',
    // default: 'now()',
    type: 'timetz',
  })
  paidAt: Date;

  @Column({
    name: 'note',
    type: 'varchar',
    default: '',
  })
  note: string;

  @Column({
    name: 'user_id',
    nullable: false,
  })
  userId: string;

  @ManyToOne(() => User, (user) => user.payments)
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
  })
  user: User;
}
