import { ForbiddenException, Inject, Injectable, Logger } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { Page, PageRequest } from 'src/system/query-shape/dto';
import { omit } from 'lodash';
import { In, InsertResult, IsNull } from 'typeorm';
import uniq from 'lodash/uniq';
import { PasswordManager } from '../../registration/services/password-manager';
import {
  FileCreateUsersDto,
  FileRow,
} from '../controllers/file-create-users.dto';
import { read, utils } from 'xlsx';
import {
  RoleService,
  RoleServiceToken,
} from '../../authorization/interfaces/role-service.interface';
import { UserService } from '../interfaces/user-service.interface';
import { MyProfile, UserDetail } from '../dtos/core/my-profile';
import { GetUserDTO } from '../dtos/core/get-users.dto';
import { User } from '../../shared/entities/user.entity';
import { GetUsersQueryRequest } from '../controllers/get-users-query.request';
import { UserManagementViewDTO } from '../controllers/users.dto';
import { Transactional } from 'typeorm-transactional';
import { UpdateUserRolesDto } from '../controllers/update-user-roles.dto';
import { addMonths, differenceInMonths } from 'date-fns';
import { PaginatedUserProbationDTO } from '../dtos/core/user-probation.dto';
import { UserProbationQueryDTO } from '../dtos/core/user-probation-query.dto';
import { SystemRoles } from '../../authorization/access-definition.constant';
import {
  MonthlyMoneyOperationService,
  MonthlyMoneyOperationServiceToken,
} from '../../../monthly-money/domain/core/services/monthly-money-operation.service';
import { UpgradeUserMemberDTO } from '../dtos/core/upgrade-user-member.dto';
import { CreateUserDTO } from '../dtos/core/create-user.dto';
import { UpdateUserDTO } from '../dtos/core/update-user.dto';
import { CreatePaymentRequest } from '../controllers/create-payment.request';
import { PaymentService } from '../../../monthly-money/internal/payment.service';
import { ResourceCRUDService } from '../../../system/resource-templates/resource-service-template';
import { Period } from '../../../master-data-service/periods/period.entity';
import { PeriodCRUDService } from '../../../master-data-service/periods/period.controller';
import { NotFoundUserException } from '../exceptions/not-found-user.exception';
import { InsertUserFailedException } from '../exceptions/insert-user-failed.exception';
import { EmailExistedException } from '../exceptions/email-existed.exception';

@Injectable()
export class UserServiceImpl implements UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordManager: PasswordManager,
    @Inject(MonthlyMoneyOperationServiceToken)
    private readonly moneyOperationService: MonthlyMoneyOperationService,
    @Inject(RoleServiceToken)
    private readonly roleService: RoleService,
    private readonly paymentService: PaymentService,
    @Inject(PeriodCRUDService.token)
    private readonly periodService: ResourceCRUDService<Period>,
  ) {}

  findUserByFullname(fullName: string): Promise<User | null> {
    return this.userRepository.findOneBy({
      fullName,
    });
  }

  async findUsers(
    query: GetUsersQueryRequest,
  ): Promise<Page<UserManagementViewDTO>> {
    const { items: data, metadata } =
      await this.userRepository.findPaginatedOverviewUsers(query);

    const items = data.map<UserManagementViewDTO>((user) => {
      const {
        username,
        id,
        email,
        fullName,
        createdAt,
        deletedAt,
        roles,
        joinedAt,
        operationFee,
        department,
        period,
      } = user;

      // Subtract today with created date to get estimated paid months using date-fns
      const estimatedPaidMonths = operationFee
        ? Math.min(
            differenceInMonths(new Date(), joinedAt),
            operationFee.monthlyConfig.monthRange,
          )
        : 0;
      const paidMonths = operationFee?.paidMonths ?? 0;
      const debtMonths = estimatedPaidMonths - paidMonths;

      return {
        username,
        fullName,
        id,
        email,
        createdAt,
        deletedAt,
        joinedAt,
        roles,
        remainMonths: operationFee?.remainMonths ?? 0,
        paidMonths: operationFee?.paidMonths ?? 0,
        estimatedPaidMonths,
        isProbation: !operationFee,
        debtMonths,
        department,
        period,
      };
    });

    return Page.of({
      query,
      totalRecords: metadata.totalRecords,
      items,
    });
  }

  find(query: GetUserDTO | string[]): Promise<User[]> {
    if (Array.isArray(query)) {
      return this.userRepository.findBy({
        id: In(query),
      });
    }

    const {
      withDeleted,
      withRoles = false,
      withRights = false,
      ...userFields
    } = query;

    const relations = [];

    if (withRoles) {
      relations.push('roles');
    }

    if (withRights) {
      relations.push('roles', 'roles.permissions');
    }

    return this.userRepository.find({
      where: {
        ...userFields,
      },
      relations: uniq(relations),
      withDeleted,
    });
  }

  async findProbationUsers(
    dto: UserProbationQueryDTO,
  ): Promise<PaginatedUserProbationDTO> {
    const { departmentId, periodId } = dto;
    const { offset, size } = PageRequest.of(dto);

    const [users, totalRecords] = await this.userRepository.findAndCount({
      where: {
        ...(departmentId ? { departmentId: departmentId } : {}),
        periodId,
        operationFee: {
          id: IsNull(),
        },
      },
      relations: ['operationFee'],
      take: size,
      skip: offset,
    });

    const items = users.map((user) => {
      return {
        id: user.id,
        email: user.email,
        probationEndDate: addMonths(user.createdAt, 1),
        createdAt: user.createdAt,
      };
    });

    return Page.of({
      items,
      totalRecords,
      query: dto,
    });
  }

  async findUserDetail(id: string): Promise<UserDetail> {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
      relations: ['department', 'period', 'roles', 'operationFee'],
    });

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      birthday: user.birthday,
      trackingId: user.trackingId,
      phoneNumber: user.phoneNumber,
      department: user.department,
      period: user.period,
      roles: user.roles,
      createdAt: user.createdAt,
      isProbation: !user.operationFee,
    };
  }

  async findMyProfile(id: string): Promise<MyProfile | null> {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
    });

    if (!user) {
      return null;
    }

    return omit(user, 'password');
  }

  async findOne(query: GetUserDTO): Promise<User> {
    const records = await this.find(query);

    if (!records.length) {
      return {} as User;
    }

    return records[0];
  }

  async toggleUserIsActive(id: string): Promise<void> {
    const user = await this.userRepository.findOne({
      withDeleted: true,
      where: {
        id,
      },
      relations: ['roles'],
    });

    if (
      user.roles.some(
        (role) => role.name === (SystemRoles.SUPER_ADMIN as string),
      )
    ) {
      throw new ForbiddenException('Cannot deactivate super admin');
    }

    if (!user) {
      throw new NotFoundUserException();
    }

    if (user.deletedAt === null) {
      await this.userRepository.softDelete(id);
      return;
    }

    await this.userRepository.restore(id);
  }

  async createUser(payload: CreateUserDTO): Promise<void> {
    if (
      await this.userRepository.existsBy({
        email: payload.email,
      })
    ) {
      throw new EmailExistedException();
    }

    const newUser = this.userRepository.create({
      ...payload,
      username: payload.email,
      password: this.passwordManager.getDefaultPassword(),
      birthday: payload.birthday ? new Date(payload.birthday) : null,
    });

    try {
      await this.userRepository.insert(newUser);
    } catch (error) {
      Logger.error(error.message, error.stack, UserServiceImpl.name);
      throw new InsertUserFailedException();
    }
  }

  @Transactional()
  async createUsersByFile(dto: FileCreateUsersDto) {
    const workbook = read(dto.file.buffer, { type: 'buffer', cellDates: true });

    return Promise.all(
      workbook.SheetNames.map(async (name) => {
        const sheet = workbook.Sheets[name];

        const rows = utils.sheet_to_json<FileRow>(sheet);
        const usernames = rows.map((row) => row['Email']);
        await this.periodService.upsertMany(
          rows.map((row) => ({
            id: row['Khóa'],
            name: row['Khóa'],
            description: row['Khóa'],
          })),
        );

        const existedUsers = await this.userRepository.find({
          where: {
            username: In(usernames),
          },
        });
        if (existedUsers.length) {
          return {
            duplicatedEmails: existedUsers.map((user) => user.email),
          };
        }

        const insertResult = await this.createUsersBySheetRow(rows);

        if (dto.monthlyConfigId !== undefined) {
          await this.upgradeToMembers({
            ids: insertResult.identifiers.map((item) => item.id),
            monthlyConfigId: dto.monthlyConfigId,
          });
        }
      }),
    );
  }

  private async createUsersBySheetRow(rows: FileRow[]): Promise<InsertResult> {
    const defaultPwd = this.passwordManager.getDefaultPassword();

    const entities = rows.map((row) => {
      const user = new User();

      user.username = row['Email'];
      user.email = row['Email'];
      user.fullName = row['Họ và Tên'];
      user.joinedAt = row['Join At'] ? new Date(row['Join At']) : new Date();
      user.periodId = row['Khóa'];
      user.departmentId = row['Chuyên môn'];
      user.trackingId = row['Tracking'];
      user.birthday = row['Ngày sinh']
        ? new Date(row['Ngày sinh'])
        : new Date();
      user.password = defaultPwd;

      return user;
    });

    return this.userRepository.insert(entities);
  }

  async createUserPayment(
    id: string,
    dto: CreatePaymentRequest,
  ): Promise<void> {
    const user = await this.userRepository.findOneBy({
      id,
    });

    await this.paymentService.createPayment({
      ...dto,
      operationFeeId: user.operationFeeId,
      userId: id,
    });
  }

  async updateUser(dto: UpdateUserDTO): Promise<void> {
    await this.userRepository.update({ id: dto.id }, dto);
  }

  async updateUserRoles(
    id: string,
    payload: UpdateUserRolesDto,
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
      withDeleted: true,
    });

    if (!user) {
      throw new NotFoundUserException();
    }

    if (payload.roleIds) {
      user.roles = await this.roleService.findByIds(payload.roleIds);
    }

    await this.userRepository.save(user);
  }

  @Transactional()
  async upgradeToMembers(dto: UpgradeUserMemberDTO): Promise<void> {
    const users = await this.userRepository.findBy({
      id: In(dto.ids),
    });

    if (users.length !== dto.ids.length) {
      throw new NotFoundUserException();
    }
    const memberRole = await this.roleService.findByName(SystemRoles.MEMBER);

    const { items } = await this.moneyOperationService.createOperationFee({
      monthlyConfigId: dto.monthlyConfigId,
      userIds: dto.ids,
    });

    items.forEach((item) => {
      const user = users.find((u) => u.id === item.userId);
      user.operationFeeId = item.operationFeeId;

      if (!user.roles?.length) {
        user.roles = [];
        user.roles.push(memberRole);
      }
    });

    await this.userRepository.save(users, {
      chunk: 10,
    });
  }

  async assertIdExist(id: string): Promise<void> {
    if (
      !(await this.userRepository.exists({
        where: {
          id,
        },
      }))
    ) {
      throw new NotFoundUserException();
    }
  }
}
