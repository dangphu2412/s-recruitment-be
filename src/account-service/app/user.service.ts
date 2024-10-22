import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { UserRepository } from './user.repository';
import { Page, PageRequest } from 'src/system/query-shape/dto';
import { omit } from 'lodash';
import { In, IsNull } from 'typeorm';
import uniq from 'lodash/uniq';
import { PasswordManager } from './password-manager';
import {
  MonthlyMoneyOperationService,
  MonthlyMoneyOperationServiceToken,
} from '../../monthly-money';
import {
  FieldMappingsRequest,
  FileCreateUsersDto,
  FileRow,
  PublicUserFields,
} from '../domain/dtos/file-create-users.dto';
import { read, utils } from 'xlsx';
import {
  RoleService,
  RoleServiceToken,
} from '../domain/interfaces/role.service';
import { UserService } from '../domain/interfaces/user-service';
import { MyProfile, UserDetail } from '../domain/dtos/my-profile';
import {
  EmailExistedException,
  InsertUserFailedException,
  NotFoundUserException,
} from '../domain/exceptions';
import { CreateUserPayload, UserQuery } from '../domain/vos/user-service.vo';
import { User } from '../domain/entities/user.entity';
import { UserManagementQueryDto } from '../domain/dtos/user-management-query.dto';
import {
  UserManagementQuery,
  UserManagementView,
} from '../domain/vos/user-management-view.vo';
import { Transactional } from 'typeorm-transactional';
import { UpdateUserRolesDto } from '../domain/dtos/update-user-roles.dto';
import { addMonths, differenceInMonths } from 'date-fns';
import { UserProbationOutput } from '../domain/output/user-probation.output';
import { UserProbationQueryInput } from '../domain/inputs/user-probation-query.input';
import { UpgradeUserMemberInput } from '../domain/inputs/upgrade-user-member.input';
import { SystemRoles } from '../domain/constants/role-def.enum';

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

  upgradeToMembers(
    upgradeUserMemberInput: UpgradeUserMemberInput,
  ): Promise<void> {
    return this.moneyOperationService.createOperationFee({
      userIds: upgradeUserMemberInput.ids,
      monthlyConfigId: upgradeUserMemberInput.monthlyConfigId,
    });
  }

  async findProbationUsers(
    userProbationQueryInput: UserProbationQueryInput,
  ): Promise<UserProbationOutput> {
    const { domainId, periodId } = userProbationQueryInput;
    const { offset, size } = PageRequest.of(userProbationQueryInput);

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
      query: userProbationQueryInput,
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

  async createUserUseCase(payload: CreateUserPayload): Promise<void> {
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
  async createUsersByFile(dto: FileCreateUsersDto) {
    const workbook = read(dto.file.buffer, { type: 'buffer' });

    await Promise.all(
      workbook.SheetNames.map(async (name) => {
        const sheet = workbook.Sheets[name];

        const rows = utils.sheet_to_json<FileRow>(sheet);
        const users = await this.createEntitiesByFieldRequest(
          rows,
          dto.fieldMappings,
          dto.periodId,
        );

        const insertResult = await this.userRepository.insertIgnoreDuplicated(
          users,
        );

        if (dto.monthlyConfigId) {
          await this.moneyOperationService.createOperationFee({
            userIds: insertResult.identifiers.map((item) => item.id),
            monthlyConfigId: dto.monthlyConfigId,
          });
        }
      }),
    );
  }

  private getMappingsRequest(input: string): FieldMappingsRequest {
    try {
      return JSON.parse(input) as FieldMappingsRequest;
    } catch {
      throw new BadRequestException('Invalid field mappings format');
    }
  }

  private getDirectMapping(
    fieldMappingRaw: string,
  ): Record<string, keyof User> {
    const mappings = this.getMappingsRequest(fieldMappingRaw);
    const mappingPublicToEntity: Record<PublicUserFields, keyof User> = {
      email: 'email',
      birthday: 'birthday',
      fullName: 'fullName',
      username: 'username',
    };

    return Object.keys(mappings).reduce((acc, key) => {
      acc[key] = mappingPublicToEntity[mappings[key]] as keyof User;
      return acc;
    }, {} as Record<string, keyof User>);
  }

  private async createEntitiesByFieldRequest(
    rows: FileRow[],
    rawMapping: string,
    periodId: number,
  ): Promise<User[]> {
    const directMappingToEntity: Record<string, keyof User> =
      this.getDirectMapping(rawMapping);

    const defaultPwd = await this.passwordManager.getDefaultPassword();

    return rows.map((row) => {
      const user = new User();

      Object.keys(row).forEach((key) => {
        const entityField = directMappingToEntity[key];

        user[entityField as any] = row[key];
        user.periodId = periodId;
      });

      user.password = defaultPwd;

      return user;
    });
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

  async searchOverviewUsers(
    query: UserManagementQueryDto,
  ): Promise<Page<UserManagementView>> {
    const { search, joinedIn, memberType } = query;
    const { offset, size } = PageRequest.of(query);

    const [data, totalRecords] =
      await this.userRepository.findUsersForManagement({
        search,
        joinedIn,
        memberType,
        offset,
        size,
      } as UserManagementQuery);

    const items = data.map<UserManagementView>((user) => {
      const { username, id, email, createdAt, deletedAt, roles, operationFee } =
        user;

      // Subtract today with created date to get estimated paid months using date-fns
      const estimatedPaidMonths = operationFee
        ? Math.min(
            differenceInMonths(new Date(), createdAt),
            operationFee.monthlyConfig.monthRange,
          )
        : 0;

      return {
        username,
        id,
        email,
        createdAt,
        deletedAt,
        roles,
        remainMonths: operationFee?.remainMonths ?? 0,
        paidMonths: operationFee?.paidMonths ?? 0,
        estimatedPaidMonths,
        isProbation: !operationFee,
      };
    });

    return Page.of({
      query,
      totalRecords,
      items,
    });
  }

  find(query: UserQuery | string[]): Promise<User[]> {
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

  async findOne(query: UserQuery): Promise<User> {
    const records = await this.find(query);

    if (!records.length) {
      return {} as User;
    }

    return records[0];
  }

  isIdExist(id: string): Promise<boolean> {
    return this.userRepository.exist({
      where: {
        id,
      },
    });
  }
}
