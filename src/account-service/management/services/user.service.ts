import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { OffsetPaginationResponse } from 'src/system/pagination';
import { identity, omit, pickBy } from 'lodash';
import { In, InsertResult, IsNull } from 'typeorm';
import { PasswordManager } from '../../registration/services/password-manager';
import {
  FileCreateUsersDto,
  FileRow,
} from '../dtos/presentations/file-create-users.dto';
import { read, utils } from 'xlsx';
import {
  RoleService,
  RoleServiceToken,
} from '../../authorization/interfaces/role-service.interface';
import { UserService } from '../interfaces/user-service.interface';
import { MyProfile, UserDetail } from '../dtos/core/my-profile';
import { GetUserDTO } from '../dtos/core/get-users.dto';
import { User } from '../../shared/entities/user.entity';
import {
  GetUsersQueryRequest,
  UserManagementViewDTO,
} from '../dtos/presentations/get-users-query.request';
import { Transactional } from 'typeorm-transactional';
import { UpdateUserRolesDto } from '../dtos/presentations/update-user-roles.dto';
import { addMonths, differenceInMonths, parse } from 'date-fns';
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
import { CreatePaymentRequest } from '../dtos/presentations/create-payment.request';
import { PaymentService } from '../../../monthly-money/internal/payment.service';
import { ResourceCRUDService } from '../../../system/resource-templates/resource-service-template';
import { Period } from '../../../master-data-service/periods/period.entity';
import { PeriodCRUDService } from '../../../master-data-service/periods/period.controller';
import { OffsetPaginationRequest } from '../../../system/pagination/offset-pagination-request';

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

  findUsersByFullNames(fullNames: string[]): Promise<User[]> {
    return this.userRepository.findBy({
      fullName: In(fullNames),
    });
  }

  async findUsers(
    query: GetUsersQueryRequest,
  ): Promise<OffsetPaginationResponse<UserManagementViewDTO>> {
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

    return OffsetPaginationResponse.of({
      query,
      totalRecords: metadata.totalRecords,
      items,
    });
  }

  async findProbationUsers(
    dto: UserProbationQueryDTO,
  ): Promise<PaginatedUserProbationDTO> {
    const { departmentId, periodId, size } = dto;
    const offset = OffsetPaginationRequest.getOffset(dto.page, dto.size);

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

    return OffsetPaginationResponse.of({
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
      joinedAt: user.joinedAt,
    };
  }

  async findMyProfile(id: string): Promise<MyProfile | null> {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
      relations: ['department', 'period'],
    });

    if (!user) {
      return null;
    }

    return omit(user, 'password');
  }

  async findOne({ withRoles, ...query }: GetUserDTO): Promise<User> {
    const user = await this.userRepository.findOne({
      where: query,
      relations: withRoles ? ['roles'] : undefined,
    });

    if (!user) {
      return {} as User;
    }

    return user;
  }

  findById(id: string): Promise<User> {
    return this.userRepository.findOneBy({ id });
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
      throw new NotFoundException();
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
      throw new ConflictException();
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
      throw new ConflictException('User existed');
    }
  }

  @Transactional()
  async createUsersByFile(dto: FileCreateUsersDto) {
    const workbook = read(dto.file.buffer, { type: 'buffer', cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = utils.sheet_to_json<FileRow>(sheet);

    await Promise.all([
      this.upsertPeriodsByFileRows(rows),
      this.upsertUsersByFileRows(rows),
    ]);
  }

  private upsertPeriodsByFileRows(rows: FileRow[]) {
    const periods = rows.map((row) => ({
      id: row['Khóa'],
      name: row['Khóa'],
      description: row['Khóa'],
    }));

    return this.periodService.upsertMany(periods);
  }

  private async upsertUsersByFileRows(rows: FileRow[]): Promise<InsertResult> {
    const defaultPwd = this.passwordManager.getDefaultPassword();

    const entities = rows.map((row) => {
      const user = new User();

      user.username = row['Email'];
      user.email = row['Email'];
      user.fullName = row['Họ và Tên'];
      user.joinedAt = row['Join At']
        ? new Date(row['Join At'])
        : this.calculateJoinDate(row['Khóa']);
      user.periodId = row['Khóa'];
      user.departmentId = row['Chuyên môn'];
      user.trackingId = row['Tracking'] ? row['Tracking'] : user.trackingId;
      user.birthday = row['Ngày sinh']
        ? new Date(row['Ngày sinh'])
        : new Date();
      user.password = defaultPwd;
      user.phoneNumber = row['SĐT'];

      return user;
    });

    return this.userRepository.saveUsersIgnoreConflict(entities);
  }

  /**
   * Calculates the join date based on a Vietnamese season and year string.
   *
   * @param {string} yearSeasonString - The input string in the format "Season Year" (e.g., "Đông 2017", "Xuân 2021").
   * @returns {string | null} The calculated date string in "dd-MM-yyyy" format, or null if the input is invalid.
   */
  private calculateJoinDate(yearSeasonString: string): Date {
    // 1. Validate Input
    if (!yearSeasonString || typeof yearSeasonString !== 'string') {
      Logger.error('Invalid input: Please provide a non-empty string.');
      return null;
    }

    const trimmedInput = yearSeasonString.trim();
    // 2. Find the delimiter index
    const delimiterIndex = trimmedInput.indexOf('-');

    // Check if hyphen exists and is not at the very start or end
    if (delimiterIndex <= 0 || delimiterIndex === trimmedInput.length - 1) {
      Logger.error(
        `Invalid format: "${yearSeasonString}". Delimiter '-' not found or incorrectly placed. Expected 'YYYY - Season'.`,
      );
      return null;
    }

    // 3. Split using substring and trim parts
    const yearString = trimmedInput.substring(0, delimiterIndex).trim();
    const seasonName = trimmedInput.substring(delimiterIndex + 1).trim();

    // 3. Validate Year (same logic as before)
    const year = parseInt(yearString, 10);
    if (isNaN(year) || !/^\d{4}$/.test(yearString)) {
      Logger.error(`Invalid year: "${yearString}". Expected a 4-digit year.`);
      return null;
    }

    // 4. Map Season to End Date (DD/MM) - Map remains the same
    const seasonEndDateMap = {
      xuân: '30-04', // Spring -> End of April
      hè: '31-08', // Summer -> End of August
      thu: '30-11', // Autumn -> End of November
      đông: '30-12', // Winter -> End of December (Matching your example: 30/12/2017)
    };

    const dayMonth = seasonEndDateMap[seasonName.toLowerCase()];

    // 5. Validate Season Name (same logic as before)
    if (!dayMonth) {
      Logger.error(
        `Unknown season: "${seasonName}". Expected 'Xuân', 'Hè', 'Thu', or 'Đông'.`,
      );
      return null;
    }

    // 6. Construct and Return Final Date String (same logic as before)
    return parse(`${dayMonth}-${year}`, 'dd-MM-yyyy', new Date());
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
    await this.userRepository.update({ id: dto.id }, pickBy(dto, identity));
  }

  async updateMyProfile({ id, ...dto }: UpdateUserDTO): Promise<void> {
    await this.userRepository.update({ id: id }, pickBy(dto, identity));
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
      throw new NotFoundException();
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
      throw new NotFoundException();
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
}
