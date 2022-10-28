import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';

export const LocationServiceToken = randomStringGenerator();

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface LocationService {}
