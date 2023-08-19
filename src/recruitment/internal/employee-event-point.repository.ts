import { EntityRepository, Repository } from 'typeorm';
import { EmployeeEventPoint } from '../client/entities/employee-event-point.entity';

@EntityRepository(EmployeeEventPoint)
export class EmployeeEventPointRepository extends Repository<EmployeeEventPoint> {}
