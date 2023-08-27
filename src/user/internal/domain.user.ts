import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { UserRepository } from './user.repository';
import {
  CreateUserPayload,
  CreateUsersDto,
  DomainUser,
  EmailExistedException,
  ExcelUserCreationPayload,
  InsertUserFailedException,
  NotFoundSheetNameException,
  NotFoundUserException,
  UpdatableUserPayload,
  User,
  UserManagementQuery,
  UserManagementQueryDto,
  UserManagementView,
} from '../client';
import { MyProfile } from '../../authentication';
import { BcryptService } from 'src/system/services';
import { read, utils } from 'xlsx';
import {
  MonthlyMoneyConfigService,
  MonthlyMoneyConfigServiceToken,
  MonthlyMoneyOperationService,
  MonthlyMoneyOperationServiceToken,
} from '../../monthly-money';
import { CreateUserType, MemberType } from '../client/constants';
import { FileCreateUsersDto } from '../client/dtos/file-create-users.dto';
import { RoleService, RoleServiceToken } from 'src/authorization/client';
import { Page, PageRequest } from 'src/system/query-shape/pagination/entities';
import map from 'lodash/map';

@Injectable()
export class DomainUserImpl implements DomainUser {
  private cacheDefaultPassword: string | undefined;

  constructor(
    private readonly userRepository: UserRepository,
    private readonly bcryptService: BcryptService,
    @Inject(MonthlyMoneyConfigServiceToken)
    private readonly monthlyConfigService: MonthlyMoneyConfigService,
    @Inject(MonthlyMoneyOperationServiceToken)
    private readonly moneyOperationService: MonthlyMoneyOperationService,
    @Inject(RoleServiceToken)
    private readonly roleService: RoleService,
  ) {}

  async findMyProfile(id: string): Promise<MyProfile | null> {
    return this.userRepository.findOne({
      where: {
        id,
      },
      select: ['id', 'username'],
    });
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
    const isEmailDuplicated =
      (await this.userRepository.count({
        where: {
          email: payload.email,
        },
      })) > 0;

    if (isEmailDuplicated) {
      throw new EmailExistedException();
    }

    const password = await this.getDefaultPassword();

    const newUser = this.userRepository.create({
      ...payload,
      username: payload.email,
      password,
      birthday: payload.birthday ? new Date(payload.birthday) : null,
    });

    try {
      await this.userRepository.insert(newUser);
    } catch (error) {
      Logger.error(error.message, error.stack, DomainUserImpl.name);
      throw new InsertUserFailedException();
    }
  }

  private async getDefaultPassword(): Promise<string> {
    if (!this.cacheDefaultPassword) {
      this.cacheDefaultPassword = await this.bcryptService.hash('Test12345@@');
    }

    return this.cacheDefaultPassword;
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

  private async createUsersByFile(dto: FileCreateUsersDto) {
    const workbook = read(dto.file.buffer, { type: 'buffer' });

    const sheetName = workbook.SheetNames.find(
      (sheetName) => sheetName === dto.processSheetName,
    );

    if (!sheetName) {
      throw new NotFoundSheetNameException();
    }

    const sheet = workbook.Sheets[sheetName];

    const fileCreateUserPayloads =
      utils.sheet_to_json<ExcelUserCreationPayload>(sheet);
    const isUpgradingToMember = dto.monthlyConfigId;

    if (isUpgradingToMember) {
      // Do stuff
      return;
    }
    const password = await this.getDefaultPassword();
    const users = fileCreateUserPayloads.map(this.mapExcelFileToUser(password));

    await this.userRepository.insertIgnoreDuplicated(users);
  }

  private mapExcelFileToUser =
    (password: string) =>
    (payload: ExcelUserCreationPayload): User => {
      const user = this.userRepository.create();

      user.username = payload.Email;
      user.email = payload.Email;
      user.fullName = payload['Họ và Tên:'];
      user.birthday = new Date(payload['Ngày sinh']); // There are more complex case
      user.phoneNumber = `${payload['SĐT']}`;
      user.password = password;

      return user;
    };

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

    if (memberType === MemberType.DEBTOR) {
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
}
