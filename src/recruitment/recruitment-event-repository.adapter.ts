import { RecruitmentEventRepository } from './domain/data-access/recruitment-event.repository';
import { DataSource, Repository } from 'typeorm';
import { RecruitmentEvent } from './domain/data-access/entities/recruitment-event.entity';
import { Injectable } from '@nestjs/common';
import { GetEventDetailDTO } from './domain/data-access/dto/get-event-detail.dto';
import { EventDetailAggregate } from './domain/data-access/aggregates/event-detail-aggregate';
import { VoteStatus } from './domain/core/constants/vote-status.enum';
import { RecruitmentEmployee } from './domain/data-access/entities/recruitment-employee.entity';
import { EmployeeEventPoint } from './domain/data-access/entities/employee-event-point.entity';

@Injectable()
export class RecruitmentEventRepositoryAdapter
  extends Repository<RecruitmentEvent>
  implements RecruitmentEventRepository
{
  constructor(dataSource: DataSource) {
    super(RecruitmentEvent, dataSource.createEntityManager());
  }

  findEventDetail({
    id,
    authorId,
    voteStatus,
  }: GetEventDetailDTO): Promise<EventDetailAggregate> {
    const qb = this.createQueryBuilder('event')
      .andWhere('event.id = :id', { id })
      .leftJoinAndSelect('event.examiners', 'examiners')
      .leftJoinAndSelect('event.employees', 'employees')
      .leftJoinAndSelect(
        'event.points',
        'points',
        'points.author_id = :authorId AND points.employee_id = employees.id',
        { authorId },
      )
      .leftJoin(
        (qb) => {
          qb.from(RecruitmentEmployee, 'employee')
            .leftJoin(
              EmployeeEventPoint,
              'event_point',
              'event_point.employee_id = employee.id',
            )
            .where('employee.event_id = :id', { id })
            .addGroupBy('event_point.employee_id')
            .addGroupBy('event_point.event_id')
            .select()
            .addSelect('AVG(event_point.point)', 'total_points')
            .addSelect('event_point.employee_id', 'employee_id')
            .addSelect('event_point.event_id', 'event_id');
          return qb;
        },
        'avg_point',
        'employees.id = avg_point.employee_id',
        { id },
      )
      .addSelect('avg_point.total_points', 'employees_point')
      .addSelect('points.point', 'employees_my_voted_point')
      .addSelect('points.note', 'employees_my_note');

    switch (voteStatus) {
      case VoteStatus.Passed:
        qb.andWhere('avg_point.total_points >= event.pass_point');
        break;
      case VoteStatus.Failed:
        qb.andWhere('avg_point.total_points < event.pass_point');
        break;
      case VoteStatus.NotVoted:
        qb.andWhere('avg_point.total_points IS NULL');
        break;
    }

    return qb.getOne() as unknown as Promise<EventDetailAggregate>;
  }

  findAllEventsWithAuthorAndExaminers(): Promise<RecruitmentEvent[]> {
    return this.find({
      relations: ['createdBy', 'examiners'],
      order: {
        startDate: 'DESC',
      },
    });
  }

  async isNameExisted(name: string): Promise<boolean> {
    return await this.exist({
      where: { name },
    });
  }

  findEventReport(eventId: number): Promise<EventDetailAggregate> {
    return this.createQueryBuilder('event')
      .andWhere('event.id = :id', { id: eventId })
      .leftJoinAndSelect('event.employees', 'employees')
      .leftJoin(
        (qb) => {
          qb.from(RecruitmentEmployee, 'employee')
            .leftJoin(
              EmployeeEventPoint,
              'event_point',
              'event_point.employee_id = employee.id',
            )
            .where('employee.event_id = :id', { id: eventId })
            .addGroupBy('event_point.employee_id')
            .addGroupBy('event_point.event_id')
            .select()
            .addSelect('AVG(event_point.point)', 'total_points')
            .addSelect('event_point.employee_id', 'employee_id')
            .addSelect('event_point.event_id', 'event_id');
          return qb;
        },
        'avg_point',
        'employees.id = avg_point.employee_id',
      )
      .addSelect('avg_point.total_points', 'employees_point')
      .getOne() as unknown as Promise<EventDetailAggregate>;
  }
}
