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
import { RecruitmentEvent } from '../../../../recruitment/domain/data-access/entities/recruitment-event.entity';
import { EmployeeEventPoint } from '../../../../recruitment/domain/data-access/entities/employee-event-point.entity';
import { Role } from './role.entity';
import { Post } from '../../../../posts-service/domain/data-access/entities/posts.entity';
import { Payment } from '../../../../monthly-money/domain/data-access/entities/payment.entity';
import { UserGroup } from './user-group.entity';
import { OperationFee } from '../../../../monthly-money/domain/data-access/entities/operation-fee.entity';
import { Department } from '../../../../master-data-service/departments/department.entity';
import { Period } from '../../../../master-data-service/periods/period.entity';
import { ActivityRequest } from '../../../../activities/domain/data-access/activity-request.entity';
import { ActivityLog } from '../../../../activities/domain/data-access/activity-log.entity';

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
    name: 'department_id',
  })
  departmentId: string;

  @Column({
    name: 'period_id',
  })
  periodId: string;

  @Column({
    name: 'operation_fee_id',
  })
  operationFeeId: number;

  @Column({
    name: 'tracking_id',
  })
  trackingId: string;

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
  @JoinColumn({
    name: 'operation_fee_id',
    referencedColumnName: 'id',
  })
  operationFee?: OperationFee;

  @OneToMany(() => Payment, (payment) => payment.user)
  payments?: Payment[];

  @OneToMany(() => EmployeeEventPoint, (point) => point.author)
  markedEventPoints: EmployeeEventPoint[];

  @OneToMany(() => Post, (post) => post.author)
  posts?: Post[];

  @ManyToOne(() => Department, (department) => department.users)
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @ManyToOne(() => Period, (period) => period.users)
  @JoinColumn({ name: 'period_id' })
  period: Period;

  @OneToMany(() => ActivityRequest, (activityRequest) => activityRequest.author)
  activityRequests?: ActivityRequest[];

  @OneToMany(() => ActivityLog, (activityLog) => activityLog.author)
  activityLogs: ActivityLog[];
}
