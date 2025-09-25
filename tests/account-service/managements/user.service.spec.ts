import { Test, TestingModule } from '@nestjs/testing';
import { RoleService } from '../../../src/account-service/authorization/interfaces/role-service.interface';
import { UserServiceImpl } from '../../../src/account-service/management/services/user.service';
import { UserRepository } from '../../../src/account-service/management/repositories/user.repository';
import { PasswordManager } from '../../../src/account-service/registration/services/password-manager';
import { PaymentService } from '../../../src/monthly-money/internal/payment.service';
import { ResourceCRUDService } from '../../../src/system/resource-templates/resource-service-template';
import { Period } from '../../../src/system/database/entities/period.entity';
import {
  MonthlyMoneyOperationService,
  MonthlyMoneyOperationServiceToken,
} from '../../../src/monthly-money/domain/core/services/monthly-money-operation.service';
import { PeriodCRUDService } from '../../../src/master-data-service/periods/period.controller';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { SystemRoles } from '../../../src/account-service/authorization/access-definition.constant';
import { UserService } from '../../../src/account-service/management/interfaces/user-service.interface';
import { CreateUserDTO } from '../../../src/account-service/management/dtos/core/create-user.dto';
import { User } from '../../../src/system/database/entities/user.entity';
import { read, utils } from 'xlsx';
import { FileCreateUsersDto } from '../../../src/account-service/management/dtos/presentations/file-create-users.dto';

jest.mock('typeorm-transactional', () => ({
  Transactional: () => () => {},
}));

jest.mock('xlsx', () => ({
  read: jest.fn(),
  utils: {
    sheet_to_json: jest.fn(),
  },
}));

describe('UserServiceImpl', () => {
  let service: UserService;

  let userRepository: UserRepository;
  let passwordManager: PasswordManager;
  let roleService: RoleService;
  let paymentService: PaymentService;
  let periodService: ResourceCRUDService<Period>;
  let moneyOperationService: MonthlyMoneyOperationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: UserService,
          useClass: UserServiceImpl,
        },
        {
          provide: UserRepository,
          useValue: {
            findOne: jest.fn(),
            findOneBy: jest.fn(),
            findBy: jest.fn(),
            findAndCount: jest.fn(),
            save: jest.fn(),
            saveUsersIgnoreConflict: jest.fn(),
            insert: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            existsBy: jest.fn(),
            softDelete: jest.fn(),
            restore: jest.fn(),
            findPaginatedOverviewUsers: jest.fn(),
          },
        },
        {
          provide: PasswordManager,
          useValue: { getDefaultPassword: jest.fn() },
        },
        {
          provide: RoleService,
          useValue: {
            findByIds: jest.fn(),
            findByName: jest.fn(),
          },
        },
        {
          provide: PaymentService,
          useValue: { createPayment: jest.fn() },
        },
        {
          provide: PeriodCRUDService.token,
          useValue: { upsertMany: jest.fn() },
        },
        {
          provide: MonthlyMoneyOperationServiceToken,
          useValue: { createOperationFee: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(UserService);

    userRepository = module.get(UserRepository);
    passwordManager = module.get(PasswordManager);
    roleService = module.get(RoleService);
    paymentService = module.get(PaymentService);
    periodService = module.get<ResourceCRUDService<Period>>(
      PeriodCRUDService.token,
    );
    moneyOperationService = module.get<MonthlyMoneyOperationService>(
      MonthlyMoneyOperationServiceToken,
    );
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      // Arrange
      const dto = {
        email: 'new@example.com',
        fullName: 'New User',
      } as CreateUserDTO;
      jest.spyOn(userRepository, 'existsBy').mockResolvedValue(false);
      jest
        .spyOn(passwordManager, 'getDefaultPassword')
        .mockReturnValue('hashedPwd');
      jest
        .spyOn(userRepository, 'create')
        .mockImplementation((data) => data as unknown as User);
      jest.spyOn(userRepository, 'insert').mockResolvedValue(undefined);

      // Act
      await service.createUser(dto);

      // Assert
      expect(userRepository.existsBy).toHaveBeenCalledWith({
        email: dto.email,
      });
      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: dto.email,
          username: dto.email,
          password: 'hashedPwd',
        }),
      );
      expect(userRepository.insert).toHaveBeenCalled();
    });

    it('should throw ConflictException if user exists', async () => {
      // Arrange
      jest.spyOn(userRepository, 'existsBy').mockResolvedValue(true);

      // Act & Assert
      await expect(
        service.createUser({ email: 'dup@example.com' } as any),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('toggleUserIsActive', () => {
    const userStub = {
      id: 'u1',
      email: 'test@example.com',
      username: 'test@example.com',
      fullName: 'Test User',
      createdAt: new Date('2023-01-01'),
      joinedAt: new Date('2023-01-01'),
      deletedAt: null,
      roles: [],
      operationFee: null,
    };

    it('should soft delete an active user', async () => {
      // Arrange
      jest.spyOn(userRepository, 'findOne').mockResolvedValue({
        ...userStub,
        deletedAt: null,
      } as User);

      // Act
      await service.toggleUserIsActive(userStub.id);

      // Assert
      expect(userRepository.softDelete).toHaveBeenCalledWith(userStub.id);
    });

    it('should restore a deleted user', async () => {
      // Arrange
      (userRepository.findOne as jest.Mock).mockResolvedValue({
        ...userStub,
        deletedAt: new Date(),
      });

      // Act
      await service.toggleUserIsActive(userStub.id);

      // Assert
      expect(userRepository.restore).toHaveBeenCalledWith(userStub.id);
    });

    it('should throw ForbiddenException for SUPER_ADMIN', async () => {
      // Arrange
      (userRepository.findOne as jest.Mock).mockResolvedValue({
        ...userStub,
        roles: [{ name: SystemRoles.SUPER_ADMIN }],
      });

      // Act & Assert
      await expect(
        service.toggleUserIsActive(userStub.id),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('should throw NotFoundException if user not found', async () => {
      // Arrange
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.toggleUserIsActive('invalid'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('should return user when found without roles', async () => {
      // Arrange
      const user = { id: 'u1', email: 'test@example.com' } as User;
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      // Act
      const result = await service.findOne({ id: 'u1', withRoles: false });

      // Assert
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'u1' },
        relations: undefined,
      });
      expect(result).toEqual(user);
    });

    it('should return user with roles when withRoles is true', async () => {
      // Arrange
      const user = {
        id: 'u2',
        email: 'withroles@example.com',
        roles: [{ id: 'r1', name: 'ADMIN' }],
      } as unknown as User;
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      // Act
      const result = await service.findOne({ id: 'u2', withRoles: true });

      // Assert
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'u2' },
        relations: ['roles'],
      });
      expect(result).toEqual(user);
    });

    it('should return empty user object if not found', async () => {
      // Arrange
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      // Act
      const result = await service.findOne({ id: 'bad-id', withRoles: true });

      // Assert
      expect(result).toEqual({} as User);
    });
  });

  describe('findMyProfile', () => {
    it('should return profile without password when user exists', async () => {
      // Arrange
      const user = {
        id: 'u3',
        email: 'me@example.com',
        username: 'me',
        fullName: 'Me Myself',
        department: { id: 'd1', name: 'Dept' },
        period: { id: 'p1', name: 'Period' },
        password: 'secret',
      } as unknown as User;
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      // Act
      const result = await service.findMyProfile('u3');

      // Assert
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'u3' },
        relations: ['department', 'period'],
      });
      expect(result).toEqual({
        id: 'u3',
        email: 'me@example.com',
        username: 'me',
        fullName: 'Me Myself',
        department: { id: 'd1', name: 'Dept' },
        period: { id: 'p1', name: 'Period' },
      });
      expect((result as any).password).toBeUndefined();
    });

    it('should return null when user not found', async () => {
      // Arrange
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      // Act
      const result = await service.findMyProfile('invalid');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findUserDetail', () => {
    it('should return user detail with relations when found', async () => {
      // Arrange
      const user = {
        id: 'u10',
        email: 'detail@example.com',
        roles: [{ id: 'r1', name: 'ADMIN' }],
        department: { id: 'd1', name: 'Engineering' },
        period: { id: 'p1', name: '2023' },
        operationFee: { id: 'f1', amount: 100 },
      } as unknown as User;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      // Act
      const result = await service.findUserDetail('u10');

      // Assert
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'u10' },
        relations: ['department', 'period', 'roles', 'operationFee'],
      });
      expect(result).toEqual({
        department: {
          id: 'd1',
          name: 'Engineering',
        },
        email: 'detail@example.com',
        id: 'u10',
        isProbation: false,
        period: {
          id: 'p1',
          name: '2023',
        },
        roles: [
          {
            id: 'r1',
            name: 'ADMIN',
          },
        ],
      });
    });
  });

  describe('findProbationUsers', () => {
    const baseUser = {
      id: 'u100',
      email: 'prob@example.com',
      createdAt: new Date('2023-01-01'),
      operationFee: null,
    } as unknown as User;

    it('should return probation users with calculated probationEndDate', async () => {
      // Arrange
      jest
        .spyOn(userRepository, 'findAndCount')
        .mockResolvedValue([[baseUser], 1]);

      const dto = { departmentId: 'dep1', periodId: 'p1', page: 1, size: 10 };

      // Act
      const result = await service.findProbationUsers(dto);

      // Assert
      expect(userRepository.findAndCount).toHaveBeenCalledWith({
        where: {
          departmentId: 'dep1',
          periodId: 'p1',
          operationFee: { id: expect.any(Object) }, // IsNull()
        },
        relations: ['operationFee'],
        take: 10,
        skip: 0,
      });
      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toMatchObject({
        id: baseUser.id,
        email: baseUser.email,
        createdAt: baseUser.createdAt,
        probationEndDate: new Date('2023-02-01'),
      });
      expect(result.metadata.totalRecords).toBe(1);
    });

    it('should return empty array if no users found', async () => {
      // Arrange
      jest.spyOn(userRepository, 'findAndCount').mockResolvedValue([[], 0]);

      const dto = { departmentId: 'dep1', periodId: 'p1', page: 1, size: 5 };

      // Act
      const result = await service.findProbationUsers(dto);

      // Assert
      expect(result.items).toEqual([]);
      expect(result.metadata.totalRecords).toBe(0);
    });
  });

  describe('findUsersByFullNames', () => {
    it('should call repository with In operator and return users', async () => {
      // Arrange
      const users = [
        { id: 'u1', fullName: 'Alice' },
        { id: 'u2', fullName: 'Bob' },
      ] as unknown as User[];
      jest.spyOn(userRepository, 'findBy').mockResolvedValue(users);

      // Act
      const result = await service.findUsersByFullNames(['Alice', 'Bob']);

      // Assert
      expect(userRepository.findBy).toHaveBeenCalledWith({
        fullName: expect.any(Object), // In operator
      });
      expect(result).toEqual(users);
    });
  });

  describe('findUsers', () => {
    it('should transform users and return paginated response', async () => {
      // Arrange
      const now = new Date();
      const joinedAt = new Date(now.getFullYear(), now.getMonth() - 6, 1); // joined 6 months ago

      const fakeUser = {
        id: 'u1',
        username: 'john',
        email: 'john@example.com',
        fullName: 'John Doe',
        createdAt: new Date(),
        deletedAt: null,
        joinedAt,
        roles: [{ id: 'r1', name: 'MEMBER' }],
        operationFee: {
          monthlyConfig: { monthRange: 12 },
          paidMonths: 3,
          remainMonths: 2,
        },
        department: { id: 'dep1', name: 'Dept' },
        period: { id: 'p1', name: 'Period' },
      } as unknown as User;

      jest
        .spyOn(userRepository, 'findPaginatedOverviewUsers')
        .mockResolvedValue({
          items: [fakeUser],
          metadata: { totalRecords: 1, totalPages: 1, page: 1, size: 10 },
        });

      const dto = { page: 1, size: 10 };

      // Act
      const result = await service.findUsers(dto);

      // Assert
      expect(userRepository.findPaginatedOverviewUsers).toHaveBeenCalledWith(
        dto,
      );

      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toMatchObject({
        id: fakeUser.id,
        email: fakeUser.email,
        username: fakeUser.username,
        estimatedPaidMonths: expect.any(Number),
        paidMonths: 3,
        debtMonths: expect.any(Number),
        remainMonths: 2,
        isProbation: false,
      });
      expect(result.metadata.totalRecords).toBe(1);
    });

    it('should mark user as probation if no operationFee', async () => {
      // Arrange
      const fakeUser = {
        id: 'u2',
        username: 'sarah',
        email: 'sarah@example.com',
        fullName: 'Sarah',
        createdAt: new Date(),
        deletedAt: null,
        joinedAt: new Date(),
        roles: [],
        operationFee: null,
        department: null,
        period: null,
      } as unknown as User;

      jest
        .spyOn(userRepository, 'findPaginatedOverviewUsers')
        .mockResolvedValue({
          items: [fakeUser],
          metadata: { totalRecords: 1, totalPages: 1, page: 1, size: 10 },
        });

      // Act
      const result = await service.findUsers({ page: 1, size: 10 });

      // Assert
      expect(result.items[0].isProbation).toBe(true);
      expect(result.items[0].estimatedPaidMonths).toBe(0);
      expect(result.items[0].debtMonths).toBe(0);
    });
  });

  describe('updateUserRoles', () => {
    const userStub = {
      id: 'u123',
      roles: [],
    } as unknown as User;

    it('should throw NotFoundException if user not found', async () => {
      // Arrange
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.updateUserRoles('invalid-id', { roleIds: [1] }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('should update user roles when roleIds provided', async () => {
      // Arrange
      jest.spyOn(userRepository, 'findOne').mockResolvedValue({ ...userStub });
      jest
        .spyOn(roleService, 'findByIds')
        .mockResolvedValue([{ id: 'r1', name: 'ADMIN' }] as unknown as any);
      jest.spyOn(userRepository, 'save').mockResolvedValue(undefined);

      // Act
      await service.updateUserRoles('u123', { roleIds: [1] });

      // Assert
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'u123' },
        withDeleted: true,
      });
      expect(roleService.findByIds).toHaveBeenCalledWith([1]);
      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'u123',
          roles: [{ id: 'r1', name: 'ADMIN' }],
        }),
      );
    });

    it('should save user even if no roleIds provided', async () => {
      // Arrange
      jest.spyOn(userRepository, 'findOne').mockResolvedValue({ ...userStub });
      jest.spyOn(userRepository, 'save').mockResolvedValue(undefined);

      // Act
      await service.updateUserRoles('u123', { roleIds: [] });

      // Assert
      expect(roleService.findByIds).not.toHaveBeenCalled();
      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'u123' }),
      );
    });
  });

  describe('upgradeToMembers', () => {
    const dto = { ids: ['u1', 'u2'], monthlyConfigId: 1 };

    const users = [
      { id: 'u1', roles: [], operationFeeId: null },
      { id: 'u2', roles: [{ id: 'r0', name: 'VIEWER' }], operationFeeId: null },
    ] as unknown as User[];

    const memberRole = { id: 'r1', name: SystemRoles.MEMBER };

    it('should throw NotFoundException if some users are missing', async () => {
      // Arrange
      jest.spyOn(userRepository, 'findBy').mockResolvedValue([users[0]]); // only 1 user returned

      // Act & Assert
      await expect(service.upgradeToMembers(dto)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('should assign operationFeeId and member role if missing', async () => {
      // Arrange
      jest.spyOn(userRepository, 'findBy').mockResolvedValue([...users]);
      jest
        .spyOn(roleService, 'findByName')
        .mockResolvedValue(memberRole as any);
      jest
        .spyOn(moneyOperationService, 'createOperationFee')
        .mockResolvedValue({
          items: [
            { userId: 'u1', operationFeeId: 1 },
            { userId: 'u2', operationFeeId: 2 },
          ],
        });
      jest.spyOn(userRepository, 'save').mockResolvedValue(undefined);

      // Act
      await service.upgradeToMembers(dto);

      // Assert
      expect(userRepository.findBy).toHaveBeenCalledWith({
        id: expect.any(Object), // In operator
      });
      expect(roleService.findByName).toHaveBeenCalledWith(SystemRoles.MEMBER);
      expect(moneyOperationService.createOperationFee).toHaveBeenCalledWith({
        monthlyConfigId: 1,
        userIds: ['u1', 'u2'],
      });
      expect(userRepository.save).toHaveBeenCalledWith(
        [
          {
            id: 'u1',
            operationFeeId: 1,
            roles: [
              {
                id: 'r1',
                name: 'Member',
              },
            ],
          },
          {
            id: 'u2',
            operationFeeId: 2,
            roles: [
              {
                id: 'r0',
                name: 'VIEWER',
              },
            ],
          },
        ],
        {
          chunk: 10,
        },
      );
    });
  });

  describe('createUserPayment', () => {
    const dto = { amount: 1000 } as any;

    it('should call paymentService with merged payload', async () => {
      // Arrange
      const user = { id: 'u1', operationFeeId: 'of1' } as unknown as User;
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(user);
      jest.spyOn(paymentService, 'createPayment').mockResolvedValue(undefined);

      // Act
      await service.createUserPayment('u1', dto);

      // Assert
      expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: 'u1' });
      expect(paymentService.createPayment).toHaveBeenCalledWith({
        ...dto,
        operationFeeId: 'of1',
        userId: 'u1',
      });
    });
  });

  describe('createUsersByFile', () => {
    it('should parse file and call upsert methods', async () => {
      // Arrange
      const dto = {
        file: { buffer: Buffer.from('fake-excel') },
      } as unknown as FileCreateUsersDto;

      const rows = [
        {
          Email: 'user1@example.com',
          'Họ và Tên': 'User One',
          'Join At': '2023-01-01',
          Khóa: 'P1',
          'Chuyên môn': 'Dep1',
          'Ngày sinh': '1990-01-01',
          SĐT: '123456',
        },
      ];

      (read as jest.Mock).mockReturnValue({
        SheetNames: ['Sheet1'],
        Sheets: { Sheet1: {} },
      });
      (utils.sheet_to_json as jest.Mock).mockReturnValue(rows);

      jest.spyOn(periodService, 'upsertMany').mockResolvedValue(undefined);
      jest
        .spyOn(userRepository, 'saveUsersIgnoreConflict')
        .mockResolvedValue(undefined);
      jest
        .spyOn(passwordManager, 'getDefaultPassword')
        .mockReturnValue('pwd123');

      // Act
      await service.createUsersByFile(dto);

      // Assert
      expect(read).toHaveBeenCalledWith(dto.file.buffer, {
        type: 'buffer',
        cellDates: true,
      });
      expect(utils.sheet_to_json).toHaveBeenCalled();

      expect(periodService.upsertMany).toHaveBeenCalledWith([
        { id: 'P1', name: 'P1', description: 'P1' },
      ]);

      expect(userRepository.saveUsersIgnoreConflict).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            email: 'user1@example.com',
            fullName: 'User One',
            periodId: 'P1',
            departmentId: 'Dep1',
            phoneNumber: '123456',
            password: 'pwd123',
          }),
        ]),
      );
    });
  });
});
