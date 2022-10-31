import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MonthlyMoneyConfig } from './monthly-money-config.entity';

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

  @ManyToOne(() => MonthlyMoneyConfig)
  @JoinColumn({
    name: 'monthly_money_config_id',
    referencedColumnName: 'id',
  })
  monthlyConfig: MonthlyMoneyConfig;
}
