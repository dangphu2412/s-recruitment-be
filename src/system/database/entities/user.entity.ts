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
import { Role } from './role.entity';
import { Payment } from './payment.entity';
import { OperationFee } from './operation-fee.entity';
import { Department } from './department.entity';
import { Period } from './period.entity';
import { ActivityRequest } from './activity-request.entity';
import { ActivityLog } from './activity-log.entity';
import { Activity } from './activity.entity';

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

  @OneToOne(() => OperationFee, (operationFee) => operationFee.user)
  @JoinColumn({
    name: 'operation_fee_id',
    referencedColumnName: 'id',
  })
  operationFee?: OperationFee;

  @OneToMany(() => Payment, (payment) => payment.user)
  payments?: Payment[];

  @ManyToOne(() => Department, (department) => department.users)
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @ManyToOne(() => Period, (period) => period.users)
  @JoinColumn({ name: 'period_id' })
  period: Period;

  @OneToMany(() => ActivityRequest, (activityRequest) => activityRequest.author)
  activityRequests?: ActivityRequest[];

  @ManyToMany(() => Activity, (activity) => activity.attendees)
  sessions?: Activity[];

  @OneToMany(() => ActivityLog, (activityLog) => activityLog.author)
  activityLogs: ActivityLog[];
}
