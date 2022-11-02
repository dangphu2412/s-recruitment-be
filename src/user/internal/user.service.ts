import { Role } from '../../authorization';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { UserRepository } from './user.repository';
import {
  CreateUserDto,
  EmailExistedException,
  InsertUserFailedException,
  NotFoundUserException,
  TurnToMembersDto,
  User,
  UserManagementQuery,
  UserManagementView,
  UserService,
} from '../client';
import { MyProfile } from '../../authentication';
import { In, InsertResult } from 'typeorm';
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

@Injectable()
export class UserServiceImpl implements UserService {
  constructor(
    private readonly userRepository: UserRepository,
    @Inject(MonthlyMoneyConfigServiceToken)
    private readonly monthlyConfigService: MonthlyMoneyConfigService,
    @Inject(MonthlyMoneyOperationServiceToken)
    private readonly moneyOperationService: MonthlyMoneyOperationService,
  ) {}

  async assertEmailsNotExist(emails: string[]): Promise<void> {
    const emailCount = await this.userRepository.count({
      where: {
        email: In(emails),
      },
    });

    if (emailCount > 0) {
      throw new EmailExistedException();
    }
  }

  async findMyProfile(id: string): Promise<MyProfile | null> {
    return this.userRepository.findOne(id, {
      select: ['id', 'username'],
    });
  }

  find(query: UserManagementQuery): Promise<UserManagementView> {
    const offset = (query.page - 1) * query.size;

    return this.userRepository.find({
      skip: offset,
      take: query.size,
      withDeleted: true,
    });
  }

  findByUsername(username: string): Promise<User>;
  findByUsername(username: string, relations: string[]): Promise<User>;
  findByUsername(username: string, relations?: string[]): Promise<User> {
    return this.userRepository.findOne({
      where: {
        username,
      },
      relations,
    });
  }

  async create(dto: CreateUserDto | CreateUserDto[]): Promise<InsertResult> {
    const uniqueDtos = Array.isArray(dto) ? uniqBy(dto, 'email') : [dto];
    const emails = map(uniqueDtos, 'email');

    await this.assertEmailsNotExist(emails);

    const newUsers = uniqueDtos.map(this.toUser);

    try {
      return await this.userRepository.insert(newUsers);
    } catch (error) {
      Logger.error(error.message, error.stack, UserServiceImpl.name);
      throw new InsertUserFailedException();
    }
  }

  private toUser = (dto: CreateUserDto): User => {
    return this.userRepository.create({
      ...dto,
      username: dto.email,
      password: '',
      birthday: dto.birthday ? new Date(dto.birthday) : null,
    });
  };

  async updateRolesForUser(user: User, roles: Role[]) {
    user.roles = roles;
    await this.userRepository.save(user, { reload: false });
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

  findById(id: string): Promise<User | null>;
  findById(id: string, relations?: string[]): Promise<User | null>;
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

    const existedEmails = users.map((user) => user.email);

    return xor(uniqueEmails, existedEmails);
  }

  async turnToMembers(turnToMembersDto: TurnToMembersDto): Promise<void> {
    turnToMembersDto.memberEmails = uniq(turnToMembersDto.memberEmails);

    const [monthlyConfig, users] = await Promise.all([
      this.monthlyConfigService.findById(turnToMembersDto.monthlyConfigId),
      this.userRepository.find({
        where: { email: In(turnToMembersDto.memberEmails) },
      }),
    ]);

    if (!users.length) {
      throw new NotFoundUserException(
        xor(
          turnToMembersDto.memberEmails,
          users.map((user) => user.email),
        ).toString(),
      );
    }

    await this.moneyOperationService.createOperationFee({
      monthlyConfigId: monthlyConfig.id,
      userIds: map(users, 'id'),
    });
  }
}
