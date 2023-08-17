import { Inject, Injectable } from '@nestjs/common';
import { UpdateRecruitmentDto } from '../client/dto/update-recruitment.dto';
import { RecruitmentEventRepository } from './recruitment-event.repository';
import { UserService, UserServiceToken } from '../../user';
import { NotFoundExaminersException } from '../client/exceptions/not-found-examiners.exception';
import { Page } from 'src/system/query-shape/pagination/entities';
import { CreateRecruitmentPayload } from '../client/types/create-recruitment-payload';

@Injectable()
export class RecruitmentEventService {
  constructor(
    private readonly recruitmentEventRepository: RecruitmentEventRepository,
    @Inject(UserServiceToken)
    private readonly userService: UserService,
  ) {}

  async create(createRecruitmentDto: CreateRecruitmentPayload): Promise<void> {
    const examiners = await this.userService.find(
      createRecruitmentDto.examinerIds,
    );

    if (!examiners.length) {
      throw new NotFoundExaminersException();
    }

    const newRecruitmentEvent = this.recruitmentEventRepository.create({
      name: createRecruitmentDto.name,
      location: createRecruitmentDto.location,
      startDate: createRecruitmentDto.recruitmentRange.fromDate,
      endDate: createRecruitmentDto.recruitmentRange.toDate,
      examiners,
      authorId: createRecruitmentDto.authorId,
    });

    await this.recruitmentEventRepository.save(newRecruitmentEvent);
  }

  async findAll() {
    const items = await this.recruitmentEventRepository.find({
      relations: ['createdBy', 'examiners'],
    });

    return Page.of({
      items,
      totalRecords: items.length,
      query: { size: 10, page: 1 },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} recruitment`;
  }

  update(id: number, updateRecruitmentDto: UpdateRecruitmentDto) {
    return `This action updates a #${id} recruitment`;
  }

  remove(id: number) {
    return `This action removes a #${id} recruitment`;
  }
}
