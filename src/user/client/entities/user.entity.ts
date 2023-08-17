import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '@authorization/client';
import { Exclude } from 'class-transformer';
import { OperationFee } from '../../../monthly-money';
import { RecruitmentEvent } from '../../../recruitment/client/entities/recruitment-event.entity';

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

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

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

  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable({
    name: 'recruitment_events_examiners',
    joinColumn: {
      name: 'examiner_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'recruitment_event_id',
      referencedColumnName: 'id',
    },
  })
  joinedRecruitEvents?: RecruitmentEvent[];

  @OneToOne(() => OperationFee, (operationFee) => operationFee.user)
  operationFee?: OperationFee;
}
