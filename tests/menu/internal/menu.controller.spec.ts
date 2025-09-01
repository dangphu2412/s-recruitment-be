import { Test, TestingModule } from '@nestjs/testing';
import { MenuService, MenuServiceToken } from '../../../src/menu';
import { MenuController } from '../../../src/menu/internal/menu.controller';
import { JwtPayload } from '../../../src/account-service/registration/jwt-payload';

describe('MenuController', () => {
  let controller: MenuController;
  let menuService: jest.Mocked<MenuService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MenuController],
      providers: [
        {
          provide: MenuServiceToken,
          useValue: {
            findMenusByUserId: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<MenuController>(MenuController);
    menuService = module.get(MenuServiceToken);
  });

  describe('findMenusByUserId', () => {
    it('should return menus for given userId', async () => {
      const mockUser: JwtPayload = { sub: 'user-123' } as JwtPayload;
      const expectedMenus = [
        { id: '1', name: 'Breakfast', subMenus: [], parent: null },
      ];
      menuService.findMenusByUserId.mockResolvedValue(expectedMenus);

      const result = await controller.findMenusByUserId(mockUser);

      expect(menuService.findMenusByUserId).toHaveBeenCalledWith('user-123');
      expect(result).toEqual(expectedMenus);
    });
  });
});
