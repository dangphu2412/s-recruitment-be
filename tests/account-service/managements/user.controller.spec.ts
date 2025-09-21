import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../../../src/account-service/management/controllers/user.controller';
import { UserService } from '../../../src/account-service/management/interfaces/user-service.interface';
import { PaymentService } from '../../../src/monthly-money/internal/payment.service';
import { UpdateUserRolesDto } from '../../../src/account-service/management/dtos/presentations/update-user-roles.dto';
import { CreateUsersRequestDTO } from '../../../src/account-service/management/dtos/presentations/create-users.request';
import { FileCreateUsersDto } from '../../../src/account-service/management/dtos/presentations/file-create-users.dto';
import { CreatePaymentRequest } from '../../../src/account-service/management/dtos/presentations/create-payment.request';
import { UpgradeUserMemberRequest } from '../../../src/account-service/management/dtos/presentations/upgrade-user-member.request';
import { UserProbationRequest } from '../../../src/account-service/management/dtos/presentations/get-users-probation.request';
import { UpdateUserRequest } from '../../../src/account-service/management/dtos/presentations/update-user.request';
import { UpdateMyProfileRequest } from '../../../src/account-service/management/dtos/presentations/update-my-profile.request';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;
  let paymentService: PaymentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            findMyProfile: jest.fn(),
            findUserDetail: jest.fn(),
            findUsers: jest.fn(),
            toggleUserIsActive: jest.fn(),
            findOne: jest.fn(),
            updateUser: jest.fn(),
            updateMyProfile: jest.fn(),
            updateUserRoles: jest.fn(),
            createUser: jest.fn(),
            createUsersByFile: jest.fn(),
            createUserPayment: jest.fn(),
            findProbationUsers: jest.fn(),
            upgradeToMembers: jest.fn(),
          },
        },
        {
          provide: PaymentService,
          useValue: {
            findUserPaymentsByUserId: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(UserController);
    userService = module.get(UserService);
    paymentService = module.get(PaymentService);
  });

  describe('findMyProfile', () => {
    it('should call service.findMyProfile with current user id', async () => {
      (userService.findMyProfile as jest.Mock).mockResolvedValue('profile');
      const result = await controller.findMyProfile({ sub: 'u1' });
      expect(userService.findMyProfile).toHaveBeenCalledWith('u1');
      expect(result).toBe('profile');
    });
  });

  describe('findUserDetail', () => {
    it('should call service.findUserDetail', async () => {
      (userService.findUserDetail as jest.Mock).mockResolvedValue('detail');
      const result = await controller.findUserDetail('u1');
      expect(userService.findUserDetail).toHaveBeenCalledWith('u1');
      expect(result).toBe('detail');
    });
  });

  describe('findUsers', () => {
    it('should call service.findUsers', async () => {
      const query = { page: 1 } as any;
      (userService.findUsers as jest.Mock).mockResolvedValue('users');
      const result = await controller.findUsers(query);
      expect(userService.findUsers).toHaveBeenCalledWith(query);
      expect(result).toBe('users');
    });
  });

  describe('toggleIsActive', () => {
    it('should call service.toggleUserIsActive', async () => {
      await controller.toggleIsActive('u1');
      expect(userService.toggleUserIsActive).toHaveBeenCalledWith('u1');
    });
  });

  describe('findUserWithRoles', () => {
    it('should call service.findOne with roles flag', async () => {
      (userService.findOne as jest.Mock).mockResolvedValue('user+roles');
      const result = await controller.findUserWithRoles('u1');
      expect(userService.findOne).toHaveBeenCalledWith({
        id: 'u1',
        withRoles: true,
      });
      expect(result).toBe('user+roles');
    });
  });

  describe('updateUser', () => {
    it('should call service.updateUser with dto + id', async () => {
      const dto = { fullName: 'Updated' } as UpdateUserRequest;
      await controller.updateUser('u1', dto);
      expect(userService.updateUser).toHaveBeenCalledWith({
        ...dto,
        id: 'u1',
      });
    });
  });

  describe('updateMyProfile', () => {
    it('should call service.updateMyProfile with dto + current user id', async () => {
      const dto = { fullName: 'Me' } as UpdateMyProfileRequest;
      await controller.updateMyProfile('u1', dto);
      expect(userService.updateMyProfile).toHaveBeenCalledWith({
        ...dto,
        id: 'u1',
      });
    });
  });

  describe('updateUserRoles', () => {
    it('should call service.updateUserRoles', async () => {
      const dto = { roleIds: [1, 2] } as UpdateUserRolesDto;
      await controller.updateUserRoles('u1', dto);
      expect(userService.updateUserRoles).toHaveBeenCalledWith('u1', dto);
    });
  });

  describe('createUsers', () => {
    it('should call service.createUser', async () => {
      const dto = { email: 'a@b.com' } as CreateUsersRequestDTO;
      await controller.createUsers(dto);
      expect(userService.createUser).toHaveBeenCalledWith(dto);
    });
  });

  describe('createUsersByFile', () => {
    it('should call service.createUsersByFile with dto+file', async () => {
      const dto = { some: 'meta' } as unknown as FileCreateUsersDto;
      const file = { buffer: Buffer.from('fake') } as any;
      await controller.createUsersByFile(dto, file);
      expect(userService.createUsersByFile).toHaveBeenCalledWith({
        ...dto,
        file,
      });
    });
  });

  describe('createUserPayment', () => {
    it('should call service.createUserPayment', async () => {
      const dto = { amount: 100 } as CreatePaymentRequest;
      await controller.createUserPayment(dto, 'u1');
      expect(userService.createUserPayment).toHaveBeenCalledWith('u1', dto);
    });
  });

  describe('findUserPayments', () => {
    it('should call paymentService.findUserPaymentsByUserId', async () => {
      (paymentService.findUserPaymentsByUserId as jest.Mock).mockResolvedValue(
        'payments',
      );
      const result = await controller.findUserPayments('u1');
      expect(paymentService.findUserPaymentsByUserId).toHaveBeenCalledWith(
        'u1',
      );
      expect(result).toBe('payments');
    });
  });

  describe('findProbationUsers', () => {
    it('should call service.findProbationUsers', async () => {
      const req = {
        periodId: 'p1',
        departmentId: 'id',
      } as UserProbationRequest;
      (userService.findProbationUsers as jest.Mock).mockResolvedValue(
        'probation',
      );
      const result = await controller.findProbationUsers(req);
      expect(userService.findProbationUsers).toHaveBeenCalledWith(req);
      expect(result).toBe('probation');
    });
  });

  describe('upgradeToMembers', () => {
    it('should call service.upgradeToMembers', async () => {
      const dto = {
        ids: ['u1'],
        monthlyConfigId: 1,
      } as UpgradeUserMemberRequest;
      (userService.upgradeToMembers as jest.Mock).mockResolvedValue('upgraded');
      const result = await controller.upgradeToMembers(dto);
      expect(userService.upgradeToMembers).toHaveBeenCalledWith(dto);
      expect(result).toBe('upgraded');
    });
  });
});
