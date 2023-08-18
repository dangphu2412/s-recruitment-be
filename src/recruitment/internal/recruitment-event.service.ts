import { Inject, Injectable } from '@nestjs/common';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { read, utils } from 'xlsx';
import { RecruitmentEventRepository } from './recruitment-event.repository';
import {
  NotFoundSheetNameException,
  UserService,
  UserServiceToken,
} from '../../user';
import { NotFoundExaminersException } from '../client/exceptions/not-found-examiners.exception';
import { Page } from 'src/system/query-shape/pagination/entities';
import { CreateRecruitmentPayload } from '../client/types/create-recruitment-payload';
import { ImportEmployeesDto } from '../client/dto/import-employees.dto';
import { RecruitmentEmployeeRepository } from './recruitment-employee.repository';
import { NotFoundEventException } from '../client/exceptions/not-found-event.exception';
import { RecruitmentEmployee } from '../client/entities/recruitment-employee.entity';
import { DuplicatedEventName } from '../client/exceptions/duplicated-name-event.exception';

@Injectable()
export class RecruitmentEventService {
  constructor(
    private readonly recruitmentEventRepository: RecruitmentEventRepository,
    private readonly recruitmentEmployeeRepository: RecruitmentEmployeeRepository,
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

    if (
      (await this.recruitmentEventRepository.count({
        where: { name: createRecruitmentDto.name },
      })) > 0
    ) {
      throw new DuplicatedEventName();
    }

    const newRecruitmentEvent = this.recruitmentEventRepository.create({
      name: createRecruitmentDto.name,
      location: createRecruitmentDto.location,
      startDate: createRecruitmentDto.recruitmentRange.fromDate,
      endDate: createRecruitmentDto.recruitmentRange.toDate,
      examiners,
      authorId: createRecruitmentDto.authorId,
      scoringStandards: createRecruitmentDto.scoringStandards,
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

  findOne(id: string) {
    return this.recruitmentEventRepository.findOne(id, {
      relations: ['examiners', 'employees'],
    });
  }

  @Transactional()
  async importEmployees(dto: ImportEmployeesDto) {
    const workbook = read(dto.file.buffer, { type: 'buffer' });

    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
      throw new NotFoundSheetNameException();
    }

    const sheet = workbook.Sheets[sheetName];

    const data = utils.sheet_to_json<object>(sheet);

    const event = await this.recruitmentEventRepository.findOne(dto.eventId);

    if (!event) {
      throw new NotFoundEventException();
    }

    const entities = data.map((item) => {
      const employee = new RecruitmentEmployee();

      employee.organizedBy = event;
      employee.data = item;

      return employee;
    });

    await this.recruitmentEmployeeRepository.insert(entities);
  }
}
