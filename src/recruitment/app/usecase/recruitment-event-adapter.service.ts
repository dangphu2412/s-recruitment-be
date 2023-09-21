import { Inject, Injectable } from '@nestjs/common';
import { read, utils } from 'xlsx';
import {
  NotFoundSheetNameException,
  UserService,
  UserServiceToken,
} from '../../../account-service/user';
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
import { RecruitmentEvent } from '../../domain/entities/recruitment-event.entity';
import { RecruitmentEventUseCase } from '../interfaces/recruitment-event.usecase';

@Injectable()
export class RecruitmentEventUseCaseAdapter implements RecruitmentEventUseCase {
  constructor(
    @InjectRepository(RecruitmentEvent)
    private readonly recruitmentEventRepository: Repository<RecruitmentEvent>,
    @InjectRepository(RecruitmentEmployee)
    private readonly recruitmentEmployeeRepository: Repository<RecruitmentEmployee>,
    @InjectRepository(EmployeeEventPoint)
    private readonly employeeEventPointRepository: Repository<EmployeeEventPoint>,
    @Inject(UserServiceToken)
    private readonly userService: UserService,
  ) {}

  async create(command: CreateRecruitmentCommand): Promise<void> {
    const examiners = await this.userService.find(command.examinerIds);

    if (!examiners.length) {
      throw new NotFoundExaminersException();
    }

    if (
      (await this.recruitmentEventRepository.count({
        where: { name: command.name },
      })) > 0
    ) {
      throw new DuplicatedEventName();
    }

    const newRecruitmentEvent = this.recruitmentEventRepository.create({
      name: command.name,
      location: command.location,
      startDate: command.recruitmentRange.fromDate,
      endDate: command.recruitmentRange.toDate,
      examiners,
      authorId: command.authorId,
      scoringStandards: command.scoringStandards,
    });

    await this.recruitmentEventRepository.save(newRecruitmentEvent);
  }

  findAll() {
    return this.recruitmentEventRepository.find({
      relations: ['createdBy', 'examiners'],
    });
  }

  async findOne(id: number, authorId: string): Promise<any> {
    const event = await this.recruitmentEventRepository
      .createQueryBuilder('rce')
      .andWhere('rce.id = :id', { id })
      .leftJoinAndSelect('rce.examiners', 'examiners')
      .leftJoinAndSelect('rce.employees', 'employees')
      .getOne();

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

    const event = await this.recruitmentEventRepository.findOne({
      where: {
        id: parseInt(command.eventId),
      },
    });

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
      this.recruitmentEventRepository.findOne({
        where: {
          id: eventId,
        },
      }),
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
