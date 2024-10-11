import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { OperationFee } from './operation-fee.entity';
import { Payment } from './payment.entity';

@Entity({
  name: 'monthly_money_configs',
})
export class MonthlyMoneyConfig {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({
    name: 'amount',
    nullable: false,
    type: 'int',
  })
  amount: number;

  @Column({
    name: 'month_range',
    nullable: false,
    type: 'smallint',
  })
  monthRange: number;

  @OneToMany(() => OperationFee, (operationFee) => operationFee.monthlyConfig)
  operationFees: OperationFee[];

  @OneToMany(() => Payment, (payment) => payment.monthlyConfig)
  payments: Payment[];
}
