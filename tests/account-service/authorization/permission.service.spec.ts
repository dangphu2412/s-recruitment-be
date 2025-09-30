import { Test, TestingModule } from '@nestjs/testing';
import { Permission } from '../../../src/system/database/entities/permission.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermissionServiceImpl } from '../../../src/account-service/authorization/services/permission.service';

describe('PermissionServiceImpl', () => {
  let service: PermissionServiceImpl;
  let repository: Repository<Permission>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionServiceImpl,
        {
          provide: getRepositoryToken(Permission),
          useValue: {
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(PermissionServiceImpl);
    repository = module.get(getRepositoryToken(Permission));
  });

  describe('findAll', () => {
    it('should return all permissions from repository', async () => {
      // Arrange
      const permissions: Permission[] = [
        { id: 'p1', name: 'READ_USERS' } as Permission,
        { id: 'p2', name: 'WRITE_USERS' } as Permission,
      ];
      jest.spyOn(repository, 'find').mockResolvedValue(permissions);

      // Act
      const result = await service.findAll();

      // Assert
      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual(permissions);
    });
  });

  describe('findMy', () => {
    it('should return my permissions from repository', async () => {
      // Arrange
      const permissions: Permission[] = [
        { id: 'p1', name: 'READ_USERS' } as Permission,
        { id: 'p2', name: 'WRITE_USERS' } as Permission,
      ];
      jest.spyOn(repository, 'find').mockResolvedValue(permissions);

      // Act
      const result = await service.findMy('userId');

      // Assert
      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual(permissions);
    });
  });
});
