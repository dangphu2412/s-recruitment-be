import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MonthlyMoneyConfig } from './monthly-money-config.entity';
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

  @Column({
    name: 'monthly_config_id',
    nullable: false,
  })
  monthlyConfigId: number;

  @ManyToOne(() => MonthlyMoneyConfig)
  @JoinColumn({
    name: 'monthly_config_id',
    referencedColumnName: 'id',
  })
  monthlyConfig: MonthlyMoneyConfig;

  @OneToOne(() => User, (user) => user.operationFee)
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
  })
  user: User;
}
