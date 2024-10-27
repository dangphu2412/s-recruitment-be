import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { OperationFee } from '../../../monthly-money';
import { RecruitmentEvent } from '../../../recruitment/domain/entities/recruitment-event.entity';
import { EmployeeEventPoint } from '../../../recruitment/domain/entities/employee-event-point.entity';
import { Role } from './role.entity';
import { Post } from '../../../posts-service/domain/entities/posts.entity';
import { MasterDataCommon } from '../../../master-data/entities/master-data.entity';
import { Payment } from '../../../monthly-money/client/entities/payment.entity';
import { UserGroup } from './user-group.entity';

@Entity({
  name: 'users',
})
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'username',
    nullable: false,
    unique: true,
  })
  username: string;

  @Column({
    name: 'email',
    type: 'varchar',
    nullable: true,
    unique: true,
  })
  email: string;

  @Column({
    name: 'full_name',
    nullable: true,
  })
  fullName: string;

  @Column({
    name: 'password',
    type: 'varchar',
    nullable: true,
  })
  @Exclude({ toPlainOnly: true })
  password: string;

  @Column({
    name: 'birthday',
    nullable: true,
  })
  birthday?: Date;

  @Column({
    name: 'phone_number',
    nullable: true,
  })
  phoneNumber: string;

  @Column({
    name: 'domain_id',
  })
  domainId: number;

  @Column({
    name: 'period_id',
  })
  periodId: number;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @Column({
    name: 'joined_at',
    default: 'now()',
  })
  joinedAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
  })
  deletedAt: Date;

  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable({
    name: 'users_roles',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
  })
  roles?: Role[];

  @ManyToMany(() => UserGroup, (userGroups) => userGroups.users)
  @JoinTable({
    name: 'users_user_groups',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'group_id',
      referencedColumnName: 'id',
    },
  })
  userGroups?: UserGroup[];

  @ManyToMany(() => RecruitmentEvent, (event) => event.examiners)
  joinedRecruitEvents?: RecruitmentEvent[];

  @OneToOne(() => OperationFee, (operationFee) => operationFee.user)
  operationFee?: OperationFee;

  @OneToOne(() => Payment, (payment) => payment.user)
  payments?: Payment;

  @OneToMany(() => EmployeeEventPoint, (point) => point.author)
  markedEventPoints: EmployeeEventPoint[];

  @OneToMany(() => Post, (post) => post.author)
  posts?: Post[];

  @ManyToOne(() => MasterDataCommon, (common) => common.domainUser)
  @JoinColumn({ name: 'domain_id' })
  domain: MasterDataCommon;

  @ManyToOne(() => MasterDataCommon, (common) => common.periodUser)
  @JoinColumn({ name: 'period_id' })
  period: MasterDataCommon;
}
