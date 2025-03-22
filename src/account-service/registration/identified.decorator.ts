import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './services/jwt.guard';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';

/**
 * Decorator to apply the JwtAuthGuard and ApiBearerAuth decorators to a route.
 */
export const Identified = applyDecorators(
  UseGuards(JwtAuthGuard),
  ApiBearerAuth(),
  ApiUnauthorizedResponse({ description: 'Unauthorized' }),
);
