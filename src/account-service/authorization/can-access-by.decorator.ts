import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { AccessRightGuard } from './services/access-right.guard';
import { Identified } from '../registration/identified.decorator';

export const ACCESS_RIGHT_META_DATA_KEY = 'roles';

/**
 * Decorator to check if the user has the right to access the resource
 * @param rights
 * @constructor
 */
export function CanAccessBy(...rights: string[]) {
  return applyDecorators(
    SetMetadata(ACCESS_RIGHT_META_DATA_KEY, rights),
    Identified,
    UseGuards(AccessRightGuard),
  );
}
