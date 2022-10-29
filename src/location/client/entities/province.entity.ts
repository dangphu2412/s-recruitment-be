import {
  Column,
  Entity,
  JoinColumn,
  PrimaryGeneratedColumn,
  Tree,
  TreeChildren,
  TreeParent,
} from 'typeorm';
import { ProvinceType } from '../constants';

@Entity({
  name: 'provinces',
})
@Tree('materialized-path')
export class Province {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({
    name: 'name',
    nullable: false,
  })
  name: string;

  @Column({
    name: 'code',
    nullable: false,
    unique: true,
  })
  code: string;

  @Column({
    type: 'enum',
    enum: ProvinceType,
  })
  type: ProvinceType;

  @TreeChildren()
  districts: Province[];

  @TreeParent()
  @JoinColumn({
    name: 'parent_id',
  })
  city: Province;
}
