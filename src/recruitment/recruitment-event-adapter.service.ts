import { Inject, Injectable } from '@nestjs/common';
import { read, utils } from 'xlsx';
import { NotFoundExaminersException } from './domain/core/exceptions/not-found-examiners.exception';
import {
  CreateRecruitmentEventDTO,
  ImportEmployeesDTO,
  MarkEmployeePointDTO,
} from './domain/core/dto/recruitment-event.dto';
import { NotFoundEventException } from './domain/core/exceptions/not-found-event.exception';
import { RecruitmentEmployee } from './domain/data-access/entities/recruitment-employee.entity';
import { DuplicatedEventName } from './domain/core/exceptions/duplicated-name-event.exception';
import { NotFoundEmployeeException } from './domain/core/exceptions/not-found-employee.exception';
import { EmployeeEventPoint } from './domain/data-access/entities/employee-event-point.entity';
import { ExceedMaxPointException } from './domain/core/exceptions/exceed-max-point.exception';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecruitmentEventService } from './domain/core/recruitment-event.service';
import {
  RecruitmentEventRepository,
  RecruitmentEventRepositoryToken,
} from './domain/data-access/recruitment-event.repository';
import { RecruitmentEvent } from './domain/data-access/entities/recruitment-event.entity';
import { NotFoundSheetNameException } from './domain/core/exceptions/not-found-sheet-import.exception';
import {
  UserService,
  UserServiceToken,
} from '../account-service/domain/core/services/user-service';
import { Transactional } from 'typeorm-transactional';
import { GetEventDetailDto } from './domain/core/dto/get-event-detail.dto';

@Injectable()
export class RecruitmentEventUseCaseAdapter implements RecruitmentEventService {
  constructor(
    @Inject(RecruitmentEventRepositoryToken)
    private readonly recruitmentEventRepository: RecruitmentEventRepository,
    @InjectRepository(RecruitmentEmployee)
    private readonly recruitmentEmployeeRepository: Repository<RecruitmentEmployee>,
    @InjectRepository(EmployeeEventPoint)
    private readonly employeeEventPointRepository: Repository<EmployeeEventPoint>,
    @Inject(UserServiceToken)
    private readonly userService: UserService,
  ) {}

  @Transactional()
  async create(dto: CreateRecruitmentEventDTO): Promise<void> {
    const examiners = await this.userService.find(dto.examinerIds);

    if (!examiners.length) {
      throw new NotFoundExaminersException();
    }

    if (await this.recruitmentEventRepository.isNameExisted(dto.name)) {
      throw new DuplicatedEventName();
    }

    const newRecruitmentEvent = new RecruitmentEvent();

    newRecruitmentEvent.name = dto.name;
    newRecruitmentEvent.location = dto.location;
    newRecruitmentEvent.startDate = new Date(dto.recruitmentRange.fromDate);
    newRecruitmentEvent.endDate = new Date(dto.recruitmentRange.toDate);
    newRecruitmentEvent.examiners = examiners;
    newRecruitmentEvent.authorId = dto.authorId;
    newRecruitmentEvent.scoringStandards = dto.scoringStandards;
    newRecruitmentEvent.passPoint = dto.passPoint;

    const { id } = await this.recruitmentEventRepository.save(
      newRecruitmentEvent,
    );

    await this.importEmployees({
      eventId: id as number,
      file: dto.file,
    });
  }

  findAll() {
    return this.recruitmentEventRepository.findAllEventsWithAuthorAndExaminers();
  }

  findOne(dto: GetEventDetailDto): Promise<any> {
    return this.recruitmentEventRepository.findEventDetail(dto);
  }

  private async importEmployees(dto: ImportEmployeesDTO): Promise<void> {
    const workbook = read(dto.file.buffer, {
      type: 'buffer',
      cellDates: true,
    });

    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
      throw new NotFoundSheetNameException();
    }

    const sheet = workbook.Sheets[sheetName];

    const data = utils.sheet_to_json<object>(sheet);

    const entities = data.map((item) => {
      const employee = new RecruitmentEmployee();

      employee.eventId = dto.eventId;
      employee.data = item;

      return employee;
    });

    await this.recruitmentEmployeeRepository.insert(entities);
  }

  async markPointForEmployee({
    employeeId,
    point,
    eventId,
    authorId,
    note,
  }: MarkEmployeePointDTO) {
    const [event, employee, markedPoint] = await Promise.all([
      this.recruitmentEventRepository.findOneById(eventId),
      this.recruitmentEmployeeRepository.findOne({
        where: {
          id: employeeId,
        },
      }),
      this.employeeEventPointRepository.findOne({
        where: {
          authorId,
          eventId,
          employeeId,
        },
      }),
    ]);

    if (!event) {
      throw new NotFoundEventException();
    }

    if (!employee) {
      throw new NotFoundEmployeeException();
    }

    const maxPoint = event.scoringStandards.reduce((result, curr) => {
      return result + curr.point;
    }, 0);

    if (point > maxPoint) {
      throw new ExceedMaxPointException();
    }

    if (markedPoint) {
      markedPoint.point = point;
      markedPoint.note = note;
      await this.employeeEventPointRepository.save(markedPoint);
      return;
    }

    const pointEntity = new EmployeeEventPoint();

    pointEntity.point = point;
    pointEntity.authorId = authorId;
    pointEntity.event = event;
    pointEntity.employee = employee;
    pointEntity.note = note;

    await this.employeeEventPointRepository.insert(pointEntity);
  }
}
