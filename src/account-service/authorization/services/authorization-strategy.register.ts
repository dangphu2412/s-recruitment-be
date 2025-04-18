import { Logger } from '@nestjs/common';
import { AuthorizationStrategy } from 'src/account-service/authorization/interfaces/authorization-strategy.interface';

export const StrategiesStorage = new Map<string, AuthorizationStrategy>();

/**
 * @param identify the key which help authorization module identify strategy out of the box
 * @param strategy the authorization strategy use to authorize
 * and can interact with nestjs module out of the box
 */
export function registerStrategy(
  identify: string,
  strategy: AuthorizationStrategy,
) {
  Logger.log(`Initializing strategy ${identify}`, 'AuthorizationStrategy');
  StrategiesStorage.set(identify, strategy);
}
