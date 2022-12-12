import { INestApplication, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvLoaderUtils } from './env-loader.utils';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';

export function extractOrigins(rawConfigString: string | undefined) {
  const ALLOW_ALL_ORIGINS = '*';
  if (!rawConfigString) {
    return ALLOW_ALL_ORIGINS;
  }
  return EnvLoaderUtils.loadMany(rawConfigString);
}

export async function logAppScaffold(app: INestApplication) {
  const logger: Logger = new Logger('AppBootstrap');
  const configService: ConfigService = app.get(ConfigService);
  const origins = extractOrigins(configService.get('CORS_ORIGINS'));
  const env = configService.get('NODE_ENV');
  const memUsage = Math.floor(process.memoryUsage().heapUsed / 1024 / 1024);

  logger.log(
    `Application is allowing origins: ${origins === '*' ? 'ALL' : origins}`,
  );
  logger.log(`Application is running on: ${await app.getUrl()}`);
  logger.log(`Application is running in ${env} mode`);
  logger.log(
    `Memory usage: ${memUsage} MB -` +
      'CPU usage: ' +
      process.cpuUsage().user / 1000 +
      '%',
  );
}

export function createInterfaceToken(name: string): string {
  return name + randomStringGenerator();
}
