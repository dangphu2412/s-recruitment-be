import { Test } from '@nestjs/testing';
import { AuthServiceImpl } from '../internal/auth.service';
import { JwtService } from '@nestjs/jwt';
import { BcryptService } from 'src/system/services';
import {
  AuthService,
  AuthServiceToken,
  TokenGenerator,
  TokenGeneratorToken,
} from '../client';
import {
  RoleService,
  RoleServiceToken,
  AccessRightStorage,
  AccessRightStorageToken,
} from '../../authorization';
import { DomainUser, DomainUserToken } from '../../user';

jest.mock('typeorm-transactional-cls-hooked', () => ({
  Transactional: () => () => ({}),
  initializeTransactionalContext: () => ({}),
  patchTypeORMRepositoryWithBaseRepository: () => ({}),
  BaseRepository: class {},
  IsolationLevel: {
    SERIALIZABLE: 'SERIALIZABLE',
    READ_COMMITTED: 'READ_COMMITTED',
  },
}));
describe('AuthService', () => {
  let authService: AuthService;
  let userService: DomainUser;
  let roleService: RoleService;
  let roleStorage: AccessRightStorage;
  let tokenGenerator: TokenGenerator;
  let bcryptService: BcryptService;
  const date = new Date();

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: AuthServiceToken,
          useClass: AuthServiceImpl,
        },
        {
          provide: DomainUserToken,
          useValue: {
            updateRolesForUser: jest.fn(),
            create: jest.fn(),
            assertUsernameNotDuplicated: jest.fn(),
          },
        },
        {
          provide: RoleServiceToken,
          useValue: {
            getNewUserRoles: jest.fn(),
          },
        },
        {
          provide: AccessRightStorageToken,
          useValue: {
            set: jest.fn(),
          },
        },
        {
          provide: TokenGeneratorToken,
          useValue: {
            generate: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: BcryptService,
          useValue: {
            hash: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = moduleRef.get(AuthServiceToken);
    userService = moduleRef.get(DomainUserToken);
    roleService = moduleRef.get(RoleServiceToken);
    roleStorage = moduleRef.get(AccessRightStorageToken);
    tokenGenerator = moduleRef.get(TokenGeneratorToken);
    bcryptService = moduleRef.get(BcryptService);
  });
});
