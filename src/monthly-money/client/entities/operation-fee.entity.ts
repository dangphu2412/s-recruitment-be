import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MonthlyMoneyConfig } from './monthly-money-config.entity';
import { User } from '../../../user';

@Entity({
  name: 'operation_fees',
})
export class OperationFee {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({
    name: 'paid_money',
    nullable: false,
    type: 'int',
  })
  paidMoney: number;

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
