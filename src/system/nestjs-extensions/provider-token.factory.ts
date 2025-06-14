import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';

export function createProviderToken(name: string): string {
  return name + randomStringGenerator();
}
