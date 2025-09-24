import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MonthlyMoneyConfig } from './monthly-money-config.entity';
import { User } from './user.entity';

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
    name: 'paid_months',
  })
  paidMonths: number;

  @Column({
    name: 'remain_months',
  })
  remainMonths: number;

  @Column({
    name: 'temporary_leave_start',
  })
  temporaryLeaveStart: Date;

  @Column({
    name: 'estimated_return_date',
  })
  estimatedReturnDate: Date;

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
  user: User;
}
