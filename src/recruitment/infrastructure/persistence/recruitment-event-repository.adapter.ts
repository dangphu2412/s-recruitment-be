import { RecruitmentEventRepository } from '../../app/interfaces/recruitment-event.repository';
import { DataSource, Repository } from 'typeorm';
import { RecruitmentEvent } from '../../domain/entities/recruitment-event.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RecruitmentEventRepositoryAdapter
  extends Repository<RecruitmentEvent>
  implements RecruitmentEventRepository
{
  constructor(dataSource: DataSource) {
    super(RecruitmentEvent, dataSource.createEntityManager());
  }

  findOneWithExaminersAndEmployeeById(id: number): Promise<RecruitmentEvent> {
    return this.createQueryBuilder('rce')
      .andWhere('rce.id = :id', { id })
      .leftJoinAndSelect('rce.examiners', 'examiners')
      .leftJoinAndSelect('rce.employees', 'employees')
      .getOne();
  }

  findAllEventsWithAuthorAndExaminers(): Promise<RecruitmentEvent[]> {
    return this.find({
      relations: ['createdBy', 'examiners'],
    });
  }

  async isNameExisted(name: string): Promise<boolean> {
    return (
      (await this.count({
        where: { name },
      })) > 0
    );
  }
}
