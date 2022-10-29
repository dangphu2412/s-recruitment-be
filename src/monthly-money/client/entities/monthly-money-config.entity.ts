import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}
