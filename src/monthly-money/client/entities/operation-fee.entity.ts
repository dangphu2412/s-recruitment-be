import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}
