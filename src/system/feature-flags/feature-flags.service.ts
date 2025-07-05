import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export const FLAGS = {
  ENABLE_V1_REMINDER_JOB: 'ENABLE_V1_REMINDER_JOB',
} as const;

@Injectable()
export class FeatureFlagsService {
  private flagsMap = new Map<string, boolean>([
    [FLAGS.ENABLE_V1_REMINDER_JOB, false],
  ]);

  constructor(configService: ConfigService) {
    Array.from(this.flagsMap.keys()).forEach((key) => {
      if (configService.get(key) === 'true') {
        this.flagsMap.set(key, true);
      }
    });
    Logger.log(Array.from(this.flagsMap.entries()));
  }

  isOn(key: keyof typeof FLAGS): boolean {
    return this.flagsMap.get(key);
  }

  ifOff(key: keyof typeof FLAGS): boolean {
    return !this.isOn(key);
  }
}
