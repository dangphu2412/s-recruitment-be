import { Test, TestingModule } from '@nestjs/testing';
import { RecruitmentEventController } from '../recruitment-event.controller';
import { RecruitmentEventService } from '../recruitment-event.service';

describe('RecruitmentController', () => {
  let controller: RecruitmentEventController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecruitmentEventController],
      providers: [RecruitmentEventService],
    }).compile();

    controller = module.get<RecruitmentEventController>(
      RecruitmentEventController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
