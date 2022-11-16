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
  InsertUserFailedException,
  NotFoundUserException,
  User,
  UserService,
} from '../client';
import { MyProfile } from '../../authentication';
import { In } from 'typeorm';
import xor from 'lodash/xor';
import uniq from 'lodash/uniq';
import {
  MonthlyMoneyConfigService,
  MonthlyMoneyConfigServiceToken,
  MonthlyMoneyOperationService,
  MonthlyMoneyOperationServiceToken,
} from '../../monthly-money';
import uniqBy from 'lodash/uniqBy';
import map from 'lodash/map';
import { CreateUserType } from '../client/constants';
import { BcryptService } from '../../shared/services/bcrypt.service';

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

  async createUserUseCase(dto: CreateUsersDto): Promise<void> {
    switch (dto.createUserType) {
      case CreateUserType.NEWBIE:
        await this.createNewbies(dto);
        break;
      case CreateUserType.NEW_MEMBERS:
        await this.createMembers(dto);
        break;
      default:
        throw new InternalServerErrorException(
          `Non support create user type: ${dto.createUserType}`,
        );
    }
  }

  async createNewbies({
    emails,
    isSilentCreate,
  }: CreateUsersDto): Promise<void> {
    const newEmails = isSilentCreate
      ? await this.extractNewUserEmails(emails)
      : emails;

    await this.create(
      newEmails.map((email) => {
        return {
          email,
        };
      }),
    );
  }

  private async create(payload: CreateUserPayload[]): Promise<void> {
    const uniqueDtos = uniqBy(payload, 'email');
    const emails = map(uniqueDtos, 'email');

    await this.assertEmailsNotExist(emails);

    const password = await this.getDefaultPassword();

    const newUsers = uniqueDtos.map((dto: CreateUserPayload): User => {
      return this.userRepository.create({
        ...dto,
        username: dto.email,
        password,
        birthday: dto.birthday ? new Date(dto.birthday) : null,
      });
    });

    try {
      await this.userRepository.insert(newUsers);
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

  private async assertEmailsNotExist(emails: string[]): Promise<void> {
    const emailCount = await this.userRepository.count({
      where: {
        email: In(emails),
      },
    });

    if (emailCount > 0) {
      throw new EmailExistedException();
    }
  }

  async createMembers({
    emails,
    monthlyConfigId,
    isSilentCreate,
  }: CreateUsersDto): Promise<void> {
    const uniqueEmails = uniq(emails);

    const [monthlyConfig, users] = await Promise.all([
      this.monthlyConfigService.findById(monthlyConfigId),
      this.userRepository.find({
        where: { email: In(uniqueEmails) },
      }),
    ]);

    const toComparedEmails = isSilentCreate
      ? map(users, 'email')
      : uniqueEmails;

    if (!users.length || users.length !== toComparedEmails.length) {
      throw new NotFoundUserException(
        xor(uniqueEmails, map(users, 'email')).toString(),
      );
    }

    await this.moneyOperationService.createOperationFee({
      monthlyConfigId: monthlyConfig.id,
      userIds: map(users, 'id'),
    });
  }
}
