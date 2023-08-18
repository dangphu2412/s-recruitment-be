import { EntityRepository, Repository } from 'typeorm';
import { RecruitmentEmployee } from '../client/entities/recruitment-employee.entity';

@EntityRepository(RecruitmentEmployee)
export class RecruitmentEmployeeRepository extends Repository<RecruitmentEmployee> {}
