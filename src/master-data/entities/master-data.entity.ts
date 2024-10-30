import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { User } from '../../account-service/domain/data-access/entities/user.entity';

@Entity({
  name: 'mdm_common',
})
export class MasterDataCommon {
  @PrimaryColumn({
    name: 'id',
    type: 'varchar',
  })
  id: number;

  @Column({
    name: 'name',
    nullable: false,
    type: 'varchar',
  })
  name: string;

  @Column({
    name: 'code',
    nullable: false,
    type: 'varchar',
    unique: true,
  })
  code: string;

  @Column({
    name: 'description',
    nullable: true,
    type: 'varchar',
  })
  description: string;

  @OneToMany(() => User, (user) => user.domain)
  domainUser: User;

  @OneToMany(() => User, (user) => user.period)
  periodUser: User;
}
