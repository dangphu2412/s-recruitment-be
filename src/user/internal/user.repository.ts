import { EntityRepository, Repository } from 'typeorm';
import { User } from '../client';

@EntityRepository(User)
export class UserRepository extends Repository<User> {}
