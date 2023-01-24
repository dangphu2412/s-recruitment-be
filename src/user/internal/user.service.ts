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
  EmailExistedException,
  ExcelUserCreationPayload,
  InsertUserFailedException,
  NotFoundSheetNameException,
  NotFoundUserException,
  User,
  UserService,
} from '../client';
import { MyProfile } from '../../authentication';
import { In } from 'typeorm';
import { BcryptService } from '@shared/services';
import { read, utils } from 'xlsx';
import xor from 'lodash/xor';
import uniq from 'lodash/uniq';
import {
  MonthlyMoneyConfigService,
  MonthlyMoneyConfigServiceToken,
  MonthlyMoneyOperationService,
  MonthlyMoneyOperationServiceToken,
} from '../../monthly-money';
import { CreateUserType } from '../client/constants';
import { FileCreateUsersDto } from '../client/dtos/file-create-users.dto';

@Injectable()
export class UserServiceImpl implements UserService {
  private cacheDefaultPassword: string | undefined;

  constructor(
    private readonly userRepository: UserRepository,
    @Inject(MonthlyMoneyConfigServiceToken)
    private readonly monthlyConfigService: MonthlyMoneyConfigService,
    @Inject(MonthlyMoneyOperationServiceToken)
    private readonly moneyOperationService: MonthlyMoneyOperationService,
    private readonly bcryptService: BcryptService,
  ) {}

  async findMyProfile(id: string): Promise<MyProfile | null> {
    return this.userRepository.findOne(id, {
      select: ['id', 'username'],
    });
  }

  findByUsername(username: string, relations?: string[]): Promise<User> {
    return this.userRepository.findOne({
      where: {
        username,
      },
      relations,
    });
  }

  async toggleUserIsActive(id: string): Promise<void> {
    const user = await this.userRepository.findOne(id, {
      withDeleted: true,
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

  findById(id: string, relations?: string[]): Promise<User | null> {
    return this.userRepository.findOne(id, {
      relations,
    });
  }

  async extractNewUserEmails(emails: string[]): Promise<string[]> {
    const uniqueEmails = uniq(emails);

    const users = await this.userRepository.find({
      where: {
        email: In(uniqueEmails),
      },
      select: ['id', 'email'],
    });

    const existedEmails = users.map(({ email }) => email);

    return xor(uniqueEmails, existedEmails);
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
      Logger.error(error.message, error.stack, UserServiceImpl.name);
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
      this.monthlyConfigService.findById(monthlyConfigId),
      this.userRepository.findOne({
        where: { email },
      }),
    ]);

    if (user) {
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
}
