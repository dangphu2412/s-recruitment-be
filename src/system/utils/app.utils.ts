import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';

export function createInterfaceToken(name: string): string {
  return name + randomStringGenerator();
}
