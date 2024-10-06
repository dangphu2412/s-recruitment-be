import { Test, TestingModule } from '@nestjs/testing';
import { MasterDataService } from './master-data.service';
import { MasterDataCommonRepository } from './master-data-common-repository.service';

describe('MasterDataService', () => {
  let service: MasterDataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MasterDataService,
        {
          provide: MasterDataCommonRepository,
          useValue: {
            findBy: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MasterDataService>(MasterDataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
