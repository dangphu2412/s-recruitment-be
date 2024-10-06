import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { UserRepository } from './user.repository';
import { Page, PageRequest } from 'src/system/query-shape/dto';
import map from 'lodash/map';
import { omit } from 'lodash';
import { In } from 'typeorm';
import uniq from 'lodash/uniq';
import { PasswordManager } from './password-manager';
import {
  MonthlyMoneyConfigService,
  MonthlyMoneyConfigServiceToken,
  MonthlyMoneyOperationService,
  MonthlyMoneyOperationServiceToken,
} from '../../monthly-money';
import {
  FieldMappingsRequest,
  FileCreateUsersDto,
  FileRow,
  PublicUserFields,
} from '../domain/dtos/file-create-users.dto';
import { CreateUserType, MemberType } from '../domain/constants/user-constant';
import { read, utils } from 'xlsx';
import {
  RoleService,
  RoleServiceToken,
} from '../domain/interfaces/role.service';
import { DomainUser } from '../domain/interfaces/domain-user';
import { MyProfile, UserDetail } from '../domain/dtos/my-profile';
import {
  EmailExistedException,
  InsertUserFailedException,
  NotFoundUserException,
} from '../domain/exceptions';
import { CreateUsersDto } from '../domain/dtos/create-users.dto';
import {
  CreateUserPayload,
  UpdatableUserPayload,
  UserQuery,
} from '../domain/vos/user-service.vo';
import { User } from '../domain/entities/user.entity';
import { UserManagementQueryDto } from '../domain/dtos/user-management-query.dto';
import {
  UserManagementQuery,
  UserManagementView,
} from '../domain/vos/user-management-view.vo';
import { Transactional } from 'typeorm-transactional';

@Injectable()
export class DomainUserImpl implements DomainUser {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordManager: PasswordManager,
    @Inject(MonthlyMoneyConfigServiceToken)
    private readonly monthlyConfigService: MonthlyMoneyConfigService,
    @Inject(MonthlyMoneyOperationServiceToken)
    private readonly moneyOperationService: MonthlyMoneyOperationService,
    @Inject(RoleServiceToken)
    private readonly roleService: RoleService,
  ) {}

  findUserDetail(id: string): Promise<UserDetail> {
    return this.userRepository.findOne({
      where: {
        id,
      },
      relations: ['domain', 'period'],
    });
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
    });

    if (!user) {
      throw new NotFoundUserException();
    }

    if (user.deletedAt === null) {
      await this.userRepository.softDelete(id);
      return;
    }

    await this.userRepository.restore(id);
  }

  createUserUseCase(dto: FileCreateUsersDto): Promise<void>;
  createUserUseCase(dto: CreateUsersDto): Promise<void>;
  async createUserUseCase(
    dto: CreateUsersDto | FileCreateUsersDto,
  ): Promise<void> {
    switch (dto.createUserType) {
      case CreateUserType.NEWBIE:
        await this.create(dto as CreateUsersDto);
        break;
      case CreateUserType.NEW_MEMBERS:
        await this.createMember(dto as CreateUsersDto);
        break;
      case CreateUserType.EXCEL:
        await this.createUsersByFile(dto as FileCreateUsersDto);
        break;
      default:
        throw new InternalServerErrorException(
          `Non support create user type: ${dto.createUserType}`,
        );
    }
  }

  private async create(payload: CreateUserPayload): Promise<void> {
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
      Logger.error(error.message, error.stack, DomainUserImpl.name);
      throw new InsertUserFailedException();
    }
  }

  private async createMember({
    email,
    monthlyConfigId,
  }: CreateUsersDto): Promise<void> {
    const [monthlyConfig, user] = await Promise.all([
      this.monthlyConfigService.findById(+monthlyConfigId),
      this.userRepository.findOne({
        where: { email },
      }),
    ]);

    if (!user) {
      throw new NotFoundUserException(email);
    }

    await this.moneyOperationService.createOperationFee({
      monthlyConfigId: monthlyConfig.id,
      userIds: [user.id],
    });
  }

  @Transactional()
  private createUsersByFile(dto: FileCreateUsersDto) {
    const workbook = read(dto.file.buffer, { type: 'buffer' });

    return Promise.all(
      workbook.SheetNames.map(async (name) => {
        const sheet = workbook.Sheets[name];

        const rows = utils.sheet_to_json<FileRow>(sheet);
        const users = await this.createEntitiesByFieldRequest(
          rows,
          dto.fieldMappings,
        );

        await this.userRepository.insertIgnoreDuplicated(users);
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
  ): Promise<User[]> {
    const directMappingToEntity: Record<string, keyof User> =
      this.getDirectMapping(rawMapping);

    const defaultPwd = await this.passwordManager.getDefaultPassword();

    return rows.map((row) => {
      const user = new User();

      Object.keys(row).forEach((key) => {
        const entityField = directMappingToEntity[key];

        user[entityField as any] = row[key];
      });

      user.password = defaultPwd;

      return user;
    });
  }

  async update(id: string, payload: UpdatableUserPayload): Promise<void> {
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

  async search(
    query: UserManagementQueryDto,
  ): Promise<Page<UserManagementView>> {
    const { search, joinedIn, memberType } = query;
    const { offset, size } = PageRequest.of(query);

    if (MemberType.DEBTOR === memberType) {
      const memberOperationFees =
        await this.moneyOperationService.findDebtOperationFee({
          size,
          offset,
        });

      const userIds = map(memberOperationFees, 'userId');

      if (!userIds.length) {
        return Page.of({
          query,
          totalRecords: 0,
          items: [],
        });
      }

      const [items, totalRecords] =
        await this.userRepository.findDebtorForManagement({
          joinedIn,
          userIds,
          search,
          memberType,
        });

      return Page.of({
        query,
        totalRecords,
        items,
      });
    }

    const [items, totalRecords] =
      await this.userRepository.findUsersForManagement({
        ...query,
        offset,
        size,
      } as UserManagementQuery);

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
}
