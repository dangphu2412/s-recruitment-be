import { ForbiddenException, Inject, Injectable, Logger } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { Page, PageRequest } from 'src/system/query-shape/dto';
import { omit, xor } from 'lodash';
import { In, InsertResult, IsNull } from 'typeorm';
import uniq from 'lodash/uniq';
import { PasswordManager } from './password-manager';
import {
  FileCreateUsersDto,
  FileRow,
} from '../domain/dtos/file-create-users.dto';
import { read, utils } from 'xlsx';
import {
  RoleService,
  RoleServiceToken,
} from '../domain/core/services/role.service';
import { UserService } from '../domain/core/services/user-service';
import { MyProfile, UserDetail } from '../domain/dtos/my-profile';
import {
  EmailExistedException,
  InsertUserFailedException,
  NotFoundUserException,
} from '../domain/core/exceptions';
import { GetUserDTO } from '../domain/core/dto/get-users.dto';
import { User } from '../domain/data-access/entities/user.entity';
import { UserManagementQueryDto } from '../domain/dtos/user-management-query.dto';
import {
  UserManagementQuery,
  UserManagementViewDTO,
} from '../domain/core/dto/users.dto';
import { Transactional } from 'typeorm-transactional';
import { UpdateUserRolesDto } from '../domain/dtos/update-user-roles.dto';
import { addMonths, differenceInMonths } from 'date-fns';
import { PaginatedUserProbationDTO } from '../domain/core/dto/user-probation.dto';
import { UserProbationQueryDTO } from '../domain/core/dto/user-probation-query.dto';
import { SystemRoles } from '../domain/constants/role-def.enum';
import { BadRequestFileCreationFormatException } from '../domain/core/exceptions/bad-request-file-creation-format.exception';
import {
  MonthlyMoneyOperationService,
  MonthlyMoneyOperationServiceToken,
} from '../../monthly-money/domain/core/services/monthly-money-operation.service';
import { UpgradeUserMemberDTO } from '../domain/core/dto/upgrade-user-member.dto';
import { CreateUserDTO } from '../domain/core/dto/create-user.dto';
import { UpdateUserDTO } from '../domain/core/dto/update-user.dto';

@Injectable()
export class UserServiceImpl implements UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordManager: PasswordManager,
    @Inject(MonthlyMoneyOperationServiceToken)
    private readonly moneyOperationService: MonthlyMoneyOperationService,
    @Inject(RoleServiceToken)
    private readonly roleService: RoleService,
  ) {}

  async searchOverviewUsers(
    query: UserManagementQueryDto,
  ): Promise<Page<UserManagementViewDTO>> {
    const { search, joinedIn, userStatus, departmentIds, periodIds } = query;
    const { offset, size } = PageRequest.of(query);

    const [data, totalRecords] =
      await this.userRepository.findUsersForManagement({
        search,
        joinedIn,
        userStatus: userStatus,
        offset,
        size,
        departmentIds,
        periodIds,
      } as UserManagementQuery);

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
        domain,
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
        domain,
        period,
      };
    });

    return Page.of({
      query,
      totalRecords,
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

    withRoles && relations.push('roles');
    withRights && relations.push('roles', 'roles.permissions');

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
    const { domainId, periodId } = dto;
    const { offset, size } = PageRequest.of(dto);

    const [users, totalRecords] = await this.userRepository.findAndCount({
      where: {
        ...(domainId ? { domainId } : {}),
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
      relations: ['domain', 'period', 'roles', 'operationFee'],
    });

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      birthday: user.birthday,
      phoneNumber: user.phoneNumber,
      domain: user.domain,
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
    const isEmailDuplicated = await this.userRepository.exist({
      where: {
        email: payload.email,
      },
    });

    if (isEmailDuplicated) {
      throw new EmailExistedException();
    }

    const newUser = this.userRepository.create({
      ...payload,
      username: payload.email,
      password: await this.passwordManager.getDefaultPassword(),
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
  createUsersByFile(dto: FileCreateUsersDto) {
    const workbook = read(dto.file.buffer, { type: 'buffer', cellDates: true });

    return Promise.all(
      workbook.SheetNames.map(async (name) => {
        const sheet = workbook.Sheets[name];

        const rows = utils.sheet_to_json<FileRow>(sheet);
        // Validate file columns
        const requiredColumns = ['Họ và Tên:', 'Email', 'Username', 'Join At'];
        const columns = Object.keys(rows[0]);

        if (xor(requiredColumns, columns).length) {
          throw new BadRequestFileCreationFormatException();
        }
        const usernames = rows.map((row) => row['Username']);
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

        const insertResult = await this.createUsersBySheetRow(
          rows,
          dto.periodId,
        );

        if (dto.monthlyConfigId !== undefined) {
          await this.moneyOperationService.createOperationFee({
            userIds: insertResult.identifiers.map((item) => item.id),
            monthlyConfigId: dto.monthlyConfigId,
          });
        }
      }),
    );
  }

  private async createUsersBySheetRow(
    rows: FileRow[],
    periodId: number,
  ): Promise<InsertResult> {
    const defaultPwd = await this.passwordManager.getDefaultPassword();

    const entities = rows.map((row) => {
      const user = new User();

      user.username = row['Username'];
      user.email = row['Email'];
      user.fullName = row['Họ và Tên:'];
      user.joinedAt = row['Join At'] ? new Date(row['Join At']) : new Date();
      user.periodId = periodId;
      user.password = defaultPwd;

      return user;
    });

    return this.userRepository.insert(entities);
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

  upgradeToMembers(dto: UpgradeUserMemberDTO): Promise<void> {
    return this.moneyOperationService.createOperationFee({
      userIds: dto.ids,
      monthlyConfigId: dto.monthlyConfigId,
    });
  }

  isIdExist(id: string): Promise<boolean> {
    return this.userRepository.exist({
      where: {
        id,
      },
    });
  }
}
