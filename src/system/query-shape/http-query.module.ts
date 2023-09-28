import { DynamicModule, Logger } from '@nestjs/common';
import { ConfigKeys, ConfigRegistry } from './config.registry';

interface RegisterPaginationConfig {
  defaultSize?: number;
  maxSize?: number;
  defaultPage?: number;
}

export class HttpQueryModule {
  static register(config?: RegisterPaginationConfig): DynamicModule {
    ConfigRegistry.set(ConfigKeys.MAX_SIZE, config?.maxSize ?? 50);
    ConfigRegistry.set(ConfigKeys.DEFAULT_SIZE, config?.defaultSize ?? 10);
    ConfigRegistry.set(ConfigKeys.DEFAULT_PAGE, config?.defaultPage ?? 1);

    Logger.log(
      `Max size for pagination will be: ${ConfigRegistry.get(
        ConfigKeys.MAX_SIZE,
      )}`,
      HttpQueryModule.name,
    );
    Logger.log(
      `Default pagination size will be: ${ConfigRegistry.get(
        ConfigKeys.DEFAULT_SIZE,
      )}`,
      HttpQueryModule.name,
    );
    Logger.log(
      `Default page will be: ${ConfigRegistry.get(ConfigKeys.DEFAULT_PAGE)}`,
      HttpQueryModule.name,
    );

    return {
      module: HttpQueryModule,
      global: true,
    };
  }
}
