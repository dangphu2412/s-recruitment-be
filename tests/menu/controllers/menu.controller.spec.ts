import { Test, TestingModule } from '@nestjs/testing';
import { MenuController } from '../../../src/menu/presentation/menu.controller';
import { MenuService } from '../../../src/menu/domain/services/menu.service.interface';
import { MenuAggregate } from '../../../src/menu/domain/aggregates/menu.aggregate';

describe('MenuController', () => {
  let controller: MenuController;
  let menuService: jest.Mocked<MenuService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MenuController],
      providers: [
        {
          provide: MenuService,
          useValue: {
            findMenusByUserId: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<MenuController>(MenuController);
    menuService = module.get(MenuService);
  });

  describe('findMenusByUserId', () => {
    it('should return menus for given userId', async () => {
      const expectedMenus = [
        { id: '1', name: 'Breakfast', subMenus: [], parent: null },
      ] as unknown as MenuAggregate[];
      menuService.findMenusByUserId.mockResolvedValue(expectedMenus);

      const result = await controller.findMenusByUserId('user-123');

      expect(menuService.findMenusByUserId).toHaveBeenCalledWith('user-123');
      expect(result).toEqual(expectedMenus);
    });
  });
});
