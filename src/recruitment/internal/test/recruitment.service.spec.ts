import { Test, TestingModule } from '@nestjs/testing';
import { RecruitmentEventService } from '../recruitment-event.service';

describe('RecruitmentService', () => {
  let service: RecruitmentEventService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecruitmentEventService],
    }).compile();

    service = module.get<RecruitmentEventService>(RecruitmentEventService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
