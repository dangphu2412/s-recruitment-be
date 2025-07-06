import { Test, TestingModule } from '@nestjs/testing';
import {
  FeatureFlagsService,
  FLAGS,
} from '../../../src/system/feature-flags/feature-flags.service';
import { ConfigService } from '@nestjs/config';

describe('FeatureFlagsService', () => {
  let service: FeatureFlagsService;

  describe('Flag off', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          FeatureFlagsService,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn(),
            },
          },
        ],
      }).compile();

      service = module.get<FeatureFlagsService>(FeatureFlagsService);
    });

    it('flags should be correctly defined', () => {
      expect(FLAGS).toEqual({
        ENABLE_V1_REMINDER_JOB: 'ENABLE_V1_REMINDER_JOB',
      });
    });
  });

  describe('Flag on', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          FeatureFlagsService,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn().mockReturnValue('true'),
            },
          },
        ],
      }).compile();

      service = module.get<FeatureFlagsService>(FeatureFlagsService);
    });

    it('flag on when set true in env', () => {
      expect(service.isOn(FLAGS.ENABLE_V1_REMINDER_JOB)).toEqual(true);
    });
  });
});
