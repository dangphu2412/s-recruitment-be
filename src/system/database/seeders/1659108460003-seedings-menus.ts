import { MigrationInterface, QueryRunner } from 'typeorm';
import { Menu } from '../../menu';
import { MenuFactory } from '../processors/menu.factory';

type InsertMenu = Omit<Menu, 'id' | 'parent' | 'subMenus' | 'parentId'> & {
  subMenus?: InsertMenu[];
};

export class SeedingMenus1659108460003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const menuRepository = queryRunner.manager.getTreeRepository(Menu);
    const menuProcessor = new MenuFactory(menuRepository);

    const menus: InsertMenu[] = [
      {
        name: 'User Management',
        iconCode: 'USER_MANAGEMENT_ICON',
        code: 'USER_MANAGEMENT',
        subMenus: [
          {
            name: 'Administrator',
            accessLink: '/users/admin',
            code: 'ADMIN',
          },
          {
            name: 'IAM',
            accessLink: '/users/iam',
            code: 'IDENTITY_ACCESS_MANAGEMENT',
          },
          {
            name: 'User Groups',
            accessLink: '/users/groups',
            code: 'USER_GROUPS',
          },
          {
            name: 'User Assessment',
            accessLink: '/users/assessment',
            code: 'USER_ASSESSMENT',
          },
        ],
      },
      {
        name: 'Posts',
        iconCode: 'POST_ICON',
        code: 'POST',
        subMenus: [
          {
            name: 'Post management',
            accessLink: '/posts/overview',
            code: 'POSTS_OVERVIEW',
          },
        ],
      },
      {
        name: 'Activities',
        iconCode: 'ACTIVITY_MANAGEMENT_ICON',
        code: 'ACTIVITY_MANAGEMENT',
        subMenus: [
          {
            name: 'Requests',
            accessLink: '/activities/requests',
            code: 'ACTIVITY_REQUESTS',
          },
          {
            name: 'My requests',
            accessLink: '/activities/requests/my',
            code: 'MY_ACTIVITY_REQUESTS',
          },
        ],
      },
      {
        name: 'Recruitment',
        iconCode: 'RECRUITMENT_ICON',
        code: 'RECRUITMENT',
        subMenus: [
          {
            name: 'Recruitment Overview',
            accessLink: '/recruitments/overview',
            code: 'RECRUITMENT_OVERVIEW',
          },
        ],
      },
    ];

    await menuProcessor.create(menus);
  }

  public async down(): Promise<void> {
    return;
  }
}
