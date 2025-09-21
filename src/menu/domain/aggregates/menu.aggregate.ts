import { AggregateRoot } from '../../../system/data-domain-driven/aggregate';

export class MenuAggregate implements AggregateRoot {
  id: string;
  name: string;
  iconCode: string | undefined;
  accessLink: string | undefined;
  subMenus: MenuAggregate[] | null;
  parent: MenuAggregate | null;
  permissionSettings: PermissionSettings | null;
}

export class PermissionSettings {
  id: string;
  permissionId: string;
  menuId: string;
}
