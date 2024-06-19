import { Inject, Injectable } from '@nestjs/common';
import { read, utils } from 'xlsx';
import { NotFoundExaminersException } from '../../domain/exceptions/not-found-examiners.exception';
import {
  CreateRecruitmentCommand,
  ImportEmployeesCommand,
  MarkEmployeePointCommand,
} from '../types/recruitment-event-command';
import { NotFoundEventException } from '../../domain/exceptions/not-found-event.exception';
import { RecruitmentEmployee } from '../../domain/entities/recruitment-employee.entity';
import { DuplicatedEventName } from '../../domain/exceptions/duplicated-name-event.exception';
import { NotFoundEmployeeException } from '../../domain/exceptions/not-found-employee.exception';
import { EmployeeEventPoint } from '../../domain/entities/employee-event-point.entity';
import { ExceedMaxPointException } from '../../domain/exceptions/exceed-max-point.exception';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecruitmentEventUseCase } from '../interfaces/recruitment-event.usecase';
import {
  RecruitmentEventRepository,
  RecruitmentEventRepositoryToken,
} from '../interfaces/recruitment-event.repository';
import { RecruitmentEvent } from '../../domain/entities/recruitment-event.entity';
import { NotFoundSheetNameException } from '../../domain/exceptions/not-found-sheet-import.exception';
import {
  DomainUser,
  DomainUserToken,
} from '../../../account-service/domain/interfaces/domain-user';

@Injectable()
export class RecruitmentEventUseCaseAdapter implements RecruitmentEventUseCase {
  constructor(
    @Inject(RecruitmentEventRepositoryToken)
    private readonly recruitmentEventRepository: RecruitmentEventRepository,
    @InjectRepository(RecruitmentEmployee)
    private readonly recruitmentEmployeeRepository: Repository<RecruitmentEmployee>,
    @InjectRepository(EmployeeEventPoint)
    private readonly employeeEventPointRepository: Repository<EmployeeEventPoint>,
    @Inject(DomainUserToken)
    private readonly userService: DomainUser,
  ) {}

  async create(command: CreateRecruitmentCommand): Promise<void> {
    const examiners = await this.userService.find(command.examinerIds);

    if (!examiners.length) {
      throw new NotFoundExaminersException();
    }

    if (await this.recruitmentEventRepository.isNameExisted(command.name)) {
      throw new DuplicatedEventName();
    }

    const newRecruitmentEvent = new RecruitmentEvent();

    newRecruitmentEvent.name = command.name;
    newRecruitmentEvent.location = command.location;
    newRecruitmentEvent.startDate = new Date(command.recruitmentRange.fromDate);
    newRecruitmentEvent.endDate = new Date(command.recruitmentRange.toDate);
    newRecruitmentEvent.examiners = examiners;
    newRecruitmentEvent.authorId = command.authorId;
    newRecruitmentEvent.scoringStandards = command.scoringStandards;

    await this.recruitmentEventRepository.insert(newRecruitmentEvent);
  }

  findAll() {
    return this.recruitmentEventRepository.findAllEventsWithAuthorAndExaminers();
  }

  async findOne(id: number, authorId: string): Promise<any> {
    const event =
      await this.recruitmentEventRepository.findOneWithExaminersAndEmployeeById(
        id,
      );

    const votedPoints = await this.employeeEventPointRepository.find({
      where: {
        eventId: id,
      },
    });

    const employeeResponse = event.employees.map((employee) => {
      const myVotedPoint = votedPoints.find(
        (point) =>
          point.employeeId === employee.id && authorId === point.authorId,
      );

      return {
        ...employee,
        point: votedPoints.reduce((result, curr) => {
          if (curr.eventId === id && curr.employeeId === employee.id) {
            return result + curr.point;
          }

          return result;
        }, 0),
        myVotedPoint: myVotedPoint?.point ?? 0,
        myNote: myVotedPoint?.note ?? '',
      };
    });

    return {
      ...event,
      employees: employeeResponse,
    };
  }

  async importEmployees(command: ImportEmployeesCommand): Promise<void> {
    const workbook = read(command.file.buffer, { type: 'buffer' });

    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
      throw new NotFoundSheetNameException();
    }

    const sheet = workbook.Sheets[sheetName];

    const data = utils.sheet_to_json<object>(sheet);

    const event = await this.recruitmentEventRepository.findOneById(
      parseInt(command.eventId),
    );

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

  async markPointForEmployee({
    employeeId,
    point,
    eventId,
    authorId,
    note,
  }: MarkEmployeePointCommand) {
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
