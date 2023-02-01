import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { AccessRightGuard } from '../guards/access-right.guard';
import { Identified } from '../../../authentication';

export const ACCESS_RIGHT_META_DATA_KEY = 'roles';

export function CanAccessBy(...rights: string[]) {
  return applyDecorators(
    SetMetadata(ACCESS_RIGHT_META_DATA_KEY, rights),
    Identified,
    UseGuards(AccessRightGuard),
  );
}
