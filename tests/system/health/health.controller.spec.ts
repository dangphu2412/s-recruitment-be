import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from '../../../src/system/health/health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should return OK', () => {
    expect(controller.readiness()).toBe('OK');
  });
});
